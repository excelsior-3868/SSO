from django.contrib import admin
from django.urls import path, include
from rest_framework import routers
from auth_app import views
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

schema_view = get_schema_view(
    openapi.Info(title="SSO API", default_version='v1'),
    public=True,
)

router = routers.DefaultRouter()
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/users', views.UserViewSet.as_view({'get': 'list', 'post': 'create'} )),
    path('api/login/', views.LoginView.as_view()),
    path("api/logout/", views.LogoutView.as_view(), name="logout"),
    path('api/refresh/', views.RefreshTokenView.as_view()),
    path('api/permissions/', views.PermissionView.as_view()),
    path('api/token/validate/', views.TokenValidateView.as_view()),
    path('api/current_user/', views.CurrentUserView.as_view()),
    path('o/', include('oauth2_provider.urls', namespace='oauth2_provider')),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
]