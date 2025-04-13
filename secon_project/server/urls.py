from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

urlpatterns = [
    path('test/', views.sftp_connect),
    path('load/', views.load_tasks),
    path('tasks/', views.get_tasks_by_inspector),
    path('act_ed/', views.create_act_ed),
    path('act_control/', views.create_act_control),
    path('task/<int:task_id>/', views.find_task),
    path('save_photo/', views.save_photo),
    path('check_photo/', views.check_photo),
    path('result/', views.get_results),
]
