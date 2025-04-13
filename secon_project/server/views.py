import os
from django.http import JsonResponse
import paramiko
import pandas as pd
from . import sftp_adapter, utilits, models, inference
from datetime import datetime
from docxtpl import DocxTemplate
from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q

# Create your views here.
PATH_TO_NEW_ENTRASE = './Хранилище/Входные'
PATH_TO_REPORT = './Хранилище/Отчеты'
PATH_TO_RESULT = './Хранилище/Результаты'
SERVER_IP = '185.112.83.245'
USER_SERVER = 'root'
USER_PASSWORD = 'B27TI5cLh2YF'
SERVER_PORT = 22

@api_view(['GET'])
def sftp_connect(request):
   ssh = paramiko.SSHClient()
   ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
   ssh.connect(SERVER_IP, port=SERVER_PORT, username=USER_SERVER, password=USER_PASSWORD) 
   sftp = ssh.open_sftp()
   lista = sftp.listdir('.')
   sftp.close()
   ssh.close()
   return JsonResponse({'status': f'{lista}'})

@api_view(['GET'])
def load_tasks(request):
   ssh = paramiko.SSHClient()
   ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
   ssh.connect(SERVER_IP, port=SERVER_PORT, username=USER_SERVER, password=USER_PASSWORD) 
   sftp = ssh.open_sftp()

   #Основная логика
   path_to_entrase = f'{PATH_TO_NEW_ENTRASE}/входные_данные.xlsx'
   if sftp_adapter.sftp_file_exists(sftp, path_to_entrase) is False:
      return JsonResponse({'status': f'Файл не найден!'})
   time_formatted = datetime.now().strftime('%d%m%Y')
   update_filename = f'входные_данные_{time_formatted}_обработано.xlsx'
   sftp.get(path_to_entrase, update_filename)

   df = pd.read_excel(update_filename)
   df = df.dropna(subset=["населенный пункт", "улица", "дом"], how="all")
   df["комната"] = df["комната"].astype(str)
   sur_name_1 = df["ФИО инспектора 1"].str.split().str[0]
   sur_name_2 = df["ФИО инспектора 2"].str.split().str[0]
   for index, row in df.iterrows():
      print(f"Старт создания каталогов")
      cleaned_town = str(row.get('населенный пункт')).replace(" ", "")
      room_str = '_комн.' + utilits.normalize_to_str(row.get("комната")) if row.get("комната") != 'nan' else ''
      make_dir = (
         f'{PATH_TO_REPORT}/'
         f'{time_formatted}/'
         f"Бригада_{sur_name_1[index]}_{sur_name_2[index]}/"
         f"{str(cleaned_town)}_ул.{row.get('улица')}_дом.{utilits.normalize_to_str(row.get('дом'))}"
         f"_кв.{utilits.normalize_to_str(row.get('квартира'))}"
         f"{room_str}"
      )
      sftp_adapter.sftp_mkdir_recursive(sftp, make_dir)
      print(f"Создание завершено")

      print(f'Запись данных в SQLite')
      inspector_1, created_1 = models.Inspector.objects.get_or_create(
      full_name=row.get('ФИО инспектора 1'),
      defaults={
        'key_join': utilits.generate_password(7)
      }
      )
      
      inspector_2, created_1 = models.Inspector.objects.get_or_create(
      full_name=row.get('ФИО инспектора 2'),
      defaults={
        'key_join': utilits.generate_password(7)
      }
      )

      models.Task.objects.create(
         locality = cleaned_town,
         street = row.get('улица'),
         house = utilits.normalize_to_str(row.get('дом')),
         flat = utilits.normalize_to_str(row.get('квартира')),
         room = utilits.normalize_to_str(room_str),
         type_and_number = row.get('Тип и номер прибора учета'),
         application_date = datetime.now(),
         type_of_work = row.get('вид работы'),
         inspector_one_id = inspector_1,
         inspector_two_id = inspector_2,
         path_to_files = make_dir
      )
      print(f'Завершение записи')

   sftp.put(update_filename, f'{PATH_TO_NEW_ENTRASE}/{update_filename}')
   sftp.remove(path_to_entrase)
   #Конец логики
   sftp.close()
   ssh.close()
   os.remove(update_filename)
   return JsonResponse({'status': f'Работаю!'})

#Функция для получения задач по инспектору
@api_view(['POST'])
def get_tasks_by_inspector(request):
    sur_name = request.data.get('sur_name')
    key_join = request.data.get('key')

    if not sur_name:
        return JsonResponse({'error': 'Фамилия не указана'}, status=400)

    inspectors = models.Inspector.objects.filter(
      Q(full_name__startswith=sur_name) & Q(key_join=key_join)
      )

    if not inspectors.exists():
        return JsonResponse({'error': 'Инспектор не найден'}, status=404)

    tasks = models.Task.objects.filter(inspector_one_id__in=inspectors) | models.Task.objects.filter(inspector_two_id__in=inspectors)
    

    task_list = [
        {
            'id': task.task_id,
            'inspector_one': str(task.inspector_one_id) if task.inspector_one_id else None,
            'inspector_two': str(task.inspector_two_id) if task.inspector_two_id else None,
            'locality': task.locality,
            'street': task.street,
            'house': task.house,
            'flat': task.flat,
            'room': task.room,
            'type_and_number': task.type_and_number,
            'application_date': task.application_date.strftime('%Y-%m-%d') if task.application_date else None,
            'type_of_work': task.type_of_work,
            'path_to_files': task.path_to_files if task.path_to_files else None,
            'act_count': task.acts.count()
        }
        for task in tasks
    ]
    total_acts = sum(task['act_count'] for task in task_list)
    
    return JsonResponse({'UUID':f'{inspectors[0].inspector_id}',
                         'full_name':f'{inspectors[0].full_name}',
                         'total_acts': total_acts,
                         'tasks': task_list})

#Получение одной задачи
@api_view(["GET"])
def find_task(request, task_id):
   task = models.Task.objects.get(task_id=task_id)
   return JsonResponse({
      'task_id': task.task_id,
      'locality': task.locality,
      'street': task.street,
      'house': task.house,
      'flat': task.flat,
      'room': task.room,
      'type_and_number': task.type_and_number,
      'application_date': task.application_date,
      'type_of_work': task.type_of_work,
      'path_to_files': task.path_to_files,
      'inspector_1': task.inspector_one_id.full_name,
      'inspector_2': task.inspector_two_id.full_name
   })

#Сохранения фотографий
@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def save_photo(request):
   photo = request.FILES.get('photo')
   task_id = request.data.get('task_id')
   number = request.data.get('number')
   if not photo:
      return JsonResponse({'error': 'Файл не получен'})
   task = models.Task.objects.get(task_id=task_id)
   file_bytes = photo.read()
   room = f',{task.room}' if task.room != '' else ''
   full_address = f'{task.locality},ул.{task.street},дом{task.house},кв.{task.flat}{room}'
   dt = datetime.now()
   filename = f"{full_address}_{dt.strftime('%d-%m-%Y_%H-%M')}_{number}.jpg"
   path = f'{task.path_to_files}/{filename}'

   ssh = paramiko.SSHClient()
   ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
   ssh.connect(SERVER_IP, port=SERVER_PORT, username=USER_SERVER, password=USER_PASSWORD) 
   sftp = ssh.open_sftp()
   with sftp.open(path, 'wb') as remote_file:
      remote_file.write(file_bytes)
   sftp.close()
   ssh.close()
   return JsonResponse({'status': 'фото сохранено'})

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def check_photo(request):
   photo = request.FILES.get('photo')
   if not photo:
      return JsonResponse({'error': 'Файл не получен'})
   file_bytes = photo.read()
   dt = datetime.now()
   filename = f"{dt.strftime('%d-%m-%Y_%H-%M-%S')}.jpg"

   with open(filename, 'wb') as dest:
      dest.write(file_bytes)

   result = inference.main(filename)
   os.remove(filename)
   return JsonResponse({'ml_answer': result})

#Функция для создания акта восстановления/ограничения
@api_view(['POST'])
def create_act_ed(request):
   task_id = request.data.get('task_id')
   personal_number = request.data.get('personal_number')
   have_device = request.data.get('have_device')
   pay = request.data.get('pay')
   supply = request.data.get('supply')
   who_supply = request.data.get('who_supply')
   supply_text = request.data.get('supply_text')
   where_device = request.data.get('where_device')
   indicator = request.data.get('indicator')
   availability = request.data.get('availability')
   client = request.data.get('client')
   c_latitude = request.data.get('latitude')
   c_logitude = request.data.get('logitude')
   photos = request.data.get('count_photo')
   doc = DocxTemplate('акт_огран_и_возоб.docx')
   task_m = models.Task.objects.get(task_id=task_id)
   dt = datetime.now()
   room = f',{task_m.room}' if task_m.room != '' else ''
   full_address = f'{task_m.locality},ул.{task_m.street},дом{task_m.house},кв.{task_m.flat}{room}'
   context = {
    "ch1": "☒" if task_m.type_of_work == 'отключение' else '☐',
    "ch2": "☒" if task_m.type_of_work == 'возобновление' else '☐',
    "лицевой_счет": personal_number if personal_number != '' else '',
    "оплата": "☒" if pay == 'оплата' else '☐',
    "оплата_чек": "☒" if pay != 'оплата' else '☐',
    "оплата_другое": pay if pay != 'оплата' else '',
    "день": dt.strftime('%d'),
    "месяц": dt.strftime('%m'),
    "год": dt.strftime('%Y'),
    "час": dt.strftime('%H'),
    "мин": dt.strftime('%M'),
    "адрес_потребителя": full_address,
    "адрес_составления": full_address,
    "ch3": "☒" if have_device == "имеется" else "☐",
    "ch4": "☒" if have_device == "отсутствует" else "☐",
    "ch5": "☒" if supply == "ограничена" else "☐",
    "ch6": "☐", #Не изменять
    "ch7": "☒" if supply == "возобновлена" else "☐",
    "ch8": "☒" if who_supply == "потребителем" else "☐",
    "ch9": "☒" if who_supply == "исполнителем" else "☐",
    "text1": supply_text,
    "ch10": "☒" if where_device == "в квартире" else "☐",
    "ch11": "☒" if where_device == "на лестничной площадке" else "☐",
    "text2": where_device if (where_device != "в квартире" and where_device != "на лестничной площадке") else '',
    "тип_и_номер": task_m.type_and_number,
    "показания": indicator if indicator != '' else '',
    "наличие": availability if availability != '' else '',
    "ch12": "☒" if who_supply == "исполнителем" else "☐",
    "ch13": "☒" if who_supply == "потребителем" else "☐",
    "ch14": "☒" if supply == "возобновлена" else "☐",
    "ch15": "☐", # Не изменять
    "name1": task_m.inspector_one_id,
    "name2": task_m.inspector_two_id,
    "name3": client if client != '' else ''
   }
   doc.render(context)
   file_name = f"{full_address}_{dt.strftime('%d-%m-%Y_%H-%M')}_акт_восстановления_ограничения.docx"
   doc.save(file_name)

   ssh = paramiko.SSHClient()
   ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
   ssh.connect(SERVER_IP, port=SERVER_PORT, username=USER_SERVER, password=USER_PASSWORD) 
   sftp = ssh.open_sftp()
   sftp.put(file_name, f'{task_m.path_to_files}/{file_name}')
   sftp.close()
   ssh.close()
   os.remove(file_name)

   result_ = ''
   if task_m.type_of_work == 'возобновление' and supply == 'возобновлена':
      result_ = 'возобновление'
   elif task_m.type_of_work == 'возобновление' and supply == 'ограничена':
      result_ = 'недопуск'
   elif task_m.type_of_work == 'отключение' and supply == 'ограничена':
      result_ = 'отключение'
   elif task_m.type_of_work == 'отключение' and supply == 'возобновлена':
      result_ = 'оплата на месте'
   else:
      result_ = 'недопуск'

   models.Act.objects.create(
      file_name = file_name,
      path_to_act = f'{task_m.path_to_files}/{file_name}',
      task = models.Task.objects.get(task_id=task_m.task_id),
      latitude = c_latitude,
      logitude = c_logitude,
      url_map = f'https://yandex.ru/maps/?pt={c_logitude},{c_latitude}&z=16&l=map',
      result = result_,
      count_photo = photos
   )
   return JsonResponse({'status': 'успешно'})


#Функция для создания акта восстановления/ограничения
@api_view(['POST'])
def create_act_control(request):
   task_id = request.data.get('task_id')
   warn = request.data.get('warn')
   phone = request.data.get('phone')
   expenditure = request.data.get('expenditure')
   describe = request.data.get('describe')
   personal_number = request.data.get('personal_number')
   have_device = request.data.get('have_device')
   pay = request.data.get('pay')
   where_device = request.data.get('where_device')
   indicator = request.data.get('indicator')
   availability = request.data.get('availability')
   client = request.data.get('client')
   photos = request.data.get('count_photo')
   why = request.data.get('why')
   c_latitude = request.data.get('latitude')
   c_logitude = request.data.get('logitude')
   doc = DocxTemplate('акт_контроля.docx')
   task_m = models.Task.objects.get(task_id=task_id)
   dt = datetime.now()
   room = f',{task_m.room}' if task_m.room != '' else ''
   full_address = f'{task_m.locality},ул.{task_m.street},дом{task_m.house},кв.{task_m.flat}{room}'
   context = {
    "не_выявлено": "☒" if warn == 'не выявлено' else '☐',
    "выявлено": "☒" if warn == 'выявлено' else '☐',
    "лицевой_счет": personal_number if personal_number != '' else '',
    "номер_потребителя": phone if phone != '' else '',
    "оплата": "☒" if pay == 'оплата' else '☐',
    "оплата_чек": "☒" if pay != 'оплата' else '☐',
    "оплата_другое": pay if pay != 'оплата' else '',
    "расход":"☒" if expenditure == 'расход' else '☐',
    "расход_чек": "☒" if expenditure != 'расход' else '☐',
    "расход_причина": expenditure if expenditure != 'расход' else '',
    "описание": describe if describe != '' else '',
    "причина": why if why != '' else '',
    "день": dt.strftime('%d'),
    "месяц": dt.strftime('%m'),
    "год": dt.strftime('%Y'),
    "час": dt.strftime('%H'),
    "мин": dt.strftime('%M'),
    "адрес_потребителя": full_address,
    "адрес_составления": full_address,
    "ch3": "☒" if have_device == "имеется" else "☐",
    "ch4": "☒" if have_device == "отсутствует" else "☐",
    "ch10": "☒" if where_device == "в квартире" else "☐",
    "ch11": "☒" if where_device == "на лестничной площадке" else "☐",
    "text2": where_device if (where_device != "в квартире" and where_device != "на лестничной площадке") else '',
    "тип_и_номер": task_m.type_and_number,
    "показания": indicator if indicator != '' else '',
    "наличие": availability if availability != '' else '',
    "name1": task_m.inspector_one_id,
    "name2": task_m.inspector_two_id,
    "name3": client if client != '' else ''
   }
   doc.render(context)
   file_name = f"{full_address}_{dt.strftime('%d-%m-%Y_%H-%M')}_акт_контроля.docx"
   doc.save(file_name)

   ssh = paramiko.SSHClient()
   ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
   ssh.connect(SERVER_IP, port=SERVER_PORT, username=USER_SERVER, password=USER_PASSWORD) 
   sftp = ssh.open_sftp()
   sftp.put(file_name, f'{task_m.path_to_files}/{file_name}')
   sftp.close()
   ssh.close()
   os.remove(file_name)

   result_ = 'нарушено' if warn == 'выявлено' else 'не нарушено'
   models.Act.objects.create(
      file_name = file_name,
      path_to_act = f'{task_m.path_to_files}/{file_name}',
      task = models.Task.objects.get(task_id=task_m.task_id),
      latitude = c_latitude,
      logitude = c_logitude,
      url_map = f'https://yandex.ru/maps/?pt={c_logitude},{c_latitude}&z=16&l=map',
      result = result_,
      count_photo = photos
   )
   return JsonResponse({'status': 'успешно'})


@api_view(['GET'])
def get_results(request):
   acts = models.Act.objects.all()
   act_list = [
        {
            'п/п': idx + 1, 
            'населенный пункт': act.task.locality,
            'улица': act.task.street,
            'квартира': act.task.flat,
            'комната': act.task.room,
            'Тип и номер прибора учета': act.task.type_and_number,
            'Дата заявки': act.task.application_date.strftime('%d.%m.%Y'),
            'время работы': act.created_at.strftime('%H:%M'),
            'вид работы': act.task.type_of_work,
            'результат работы': act.result,
            'ФИО инспектора 1': act.task.inspector_one_id.full_name,
            'ФИО инспектора 2': act.task.inspector_two_id.full_name,
            'кол-во фото': act.count_photo
        }
        for idx, act in enumerate(acts)
   ]
   df = pd.DataFrame(act_list)
   file_name = f"отчет_по_{datetime.now().strftime('%d%m%Y')}.xlsx"
   df.to_excel(file_name, index=False)
   ssh = paramiko.SSHClient()
   ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
   ssh.connect(SERVER_IP, port=SERVER_PORT, username=USER_SERVER, password=USER_PASSWORD) 
   sftp = ssh.open_sftp()
   sftp.put(file_name, f'{PATH_TO_RESULT}/{file_name}')
   sftp.close()
   ssh.close()
   os.remove(file_name)
   return JsonResponse({'status': 'отчет выгружен'}) 