# Используем официальный Python-образ
FROM python:3.10

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем зависимости
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install torch torchvision pillow
RUN pip install --no-cache-dir -r requirements.txt

# Копируем всё остальное
COPY . .

# Запуск сервера
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
