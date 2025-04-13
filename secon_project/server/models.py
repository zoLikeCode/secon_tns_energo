from django.utils.translation import gettext_lazy as _
from django.db import models
import uuid

# Create your models here.
class Inspector(models.Model):
   inspector_id = models.UUIDField(_("Уникальный идентификатор"),primary_key=True, default=uuid.uuid4, editable=False)
   full_name = models.CharField(_("Фамилия"), max_length=30, blank=False, null=False)
   key_join = models.CharField(_("Ключ для входа"), blank=False, null=False)

   def __str__(self):
      return str(f'{self.full_name}')
   
   class Meta:
      db_table = 'inspector'
      verbose_name = _("Инспектора")
      verbose_name_plural = _("Инспекторы")

class Task(models.Model):
   task_id = models.AutoField(_("П/П"), primary_key=True)
   locality = models.CharField(_("Населенный пункт"),max_length=255, blank=True, null=True)
   street = models.CharField(_("Улица"),max_length=255, blank=True, null=True)
   house = models.CharField(_("Дом"),max_length=255, blank=True, null=True)
   flat = models.CharField(_("Квартира"),max_length=50, blank=True, null=True)
   room = models.CharField(_("Комната"),max_length=50, blank=True, null=True)
   type_and_number = models.CharField(_("Тип и номер прибора"),max_length=255, blank=True, null=True)
   application_date = models.DateField(_("Дата заявки"),blank=False, null=True)
   type_of_work = models.CharField(_("Вид работы"),max_length=50, null=True)
   path_to_files = models.TextField(_("Место хранения"),null=False, blank=True)
   
   inspector_one_id = models.ForeignKey(
      'Inspector',
      on_delete=models.SET_NULL,
      null=True,
      related_name='tasks_as_inspector_one',
      db_column='inspector_one_id',
      verbose_name='Первый инспектор'
   )

   inspector_two_id = models.ForeignKey(
      'Inspector',
      on_delete=models.SET_NULL,
      null=True,
      related_name='tasks_as_inspector_two',
      db_column='inspector_two_id',
      verbose_name='Второй инспектор'
   )

   def __str__(self):
      return str(f'{self.locality},ул.{self.street},д.{self.house},кв.{self.flat} - {self.type_of_work} - {self.application_date}')
   
   class Meta:
      db_table = 'tasks'
      verbose_name = _("Задачу")
      verbose_name_plural = _("Задачи")
   
class Act(models.Model):
   act_id = models.AutoField(_("П/П"), primary_key=True)
   file_name = models.TextField(_("Название файла"), null=False, blank=False)
   path_to_act = models.TextField(_("Место хранения"), null=False, blank=False)

   latitude = models.TextField(_("Широта"), null=True, blank=True)
   logitude = models.TextField(_("Долгота"), null=True, blank=True)
   url_map = models.TextField(_("Расположение"), null=True, blank=True)

   result = models.TextField(_("Результат"), null=True, blank=True)
   count_photo = models.IntegerField(_("Кол-во фото"), null=True, blank=True)

   task = models.ForeignKey(
      'Task',
      on_delete=models.SET_NULL,
      null=True,
      db_column='task_id',
      verbose_name='Идентификатор задачи',
      related_name='acts'
   )

   created_at = models.DateTimeField(auto_now_add=True)

   def __str__(self):
      return str(f'{self.file_name}')
   
   class Meta:
      db_table = 'acts'
      verbose_name = _("Акт")
      verbose_name_plural = _("Акты")
   