from django.contrib import admin
from .models import User, AppPermission

admin.site.register(User)
admin.site.register(AppPermission)