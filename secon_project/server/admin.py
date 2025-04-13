from django.contrib import admin
from .models import Inspector, Task, Act
from django.utils.html import format_html

# Register your models here.

admin.site.site_header = "ТНС Энерго"
admin.site.site_title = "Secon хакатон"
admin.site.index_title = "Панель администраторирования"


@admin.register(Inspector)
class InspectorAdmin(admin.ModelAdmin):
    list_display = ("full_name", "key_join", "inspector_id")
    search_fields = ("full_name",)
    ordering = ("full_name",)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = (
        "task_id", "locality", "street", "house", "flat",
        "application_date", "type_of_work", "inspector_one_id", "inspector_two_id"
    )
    search_fields = ("locality", "street", "house")
    list_filter = ("application_date", "type_of_work")
    ordering = ("-application_date",)

@admin.register(Act)
class ActAdmin(admin.ModelAdmin):
    list_display = (
        "act_id", "file_name", "result", "count_photo", "clickable_url_map", "path_to_act", "task", "created_at"
    )
    
    search_fields = ("file_name",)
    list_filter = ("created_at",)
    ordering = ("-created_at",)
    def clickable_url_map(self, obj):
        if obj.url_map:
            return format_html(f'<a href="{obj.url_map}" target="_blank">Место создания акта</a>')
        return "-"
    clickable_url_map.short_description = "Расположение"
