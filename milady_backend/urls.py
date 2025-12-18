from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
# ВАЖНО: Мы берем все функции из приложения menu
from menu.views import (
    CoffeeViewSet, DessertViewSet, OrderViewSet,
    register_view, login_view, logout_view, current_user,
    get_current_address, save_address, create_order,
    index  # Функция для отображения главной страницы (HTML)
)

# Настройка автоматических маршрутов для товаров
router = DefaultRouter()
router.register(r'coffee', CoffeeViewSet)
router.register(r'desserts', DessertViewSet)
router.register(r'orders-list', OrderViewSet)

urlpatterns = [
    # --- ГЛАВНАЯ СТРАНИЦА (Frontend) ---
    # Когда открываешь сайт (пустой путь), запускается функция index
    path('', index, name='home'),

    # --- ПАНЕЛЬ АДМИНИСТРАТОРА ---
    path('admin/', admin.site.urls),
    
    # --- API (Backend данные) ---
    # Автоматические маршруты (api/coffee/, api/desserts/)
    path('api/', include(router.urls)),
    
    # Авторизация
    path('api/register/', register_view),
    path('api/login/', login_view),
    path('api/logout/', logout_view),
    path('api/user/current/', current_user),
    
    # Адрес и Заказы
    path('api/address/current/', get_current_address),
    path('api/address/save/', save_address),
    path('api/orders/create/', create_order),
]