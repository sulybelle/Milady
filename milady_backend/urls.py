from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from menu.views import (
    CoffeeViewSet, DessertViewSet, OrderViewSet,
    register_view, login_view, logout_view, current_user,
    get_current_address, save_address, create_order,
    index  
)

router = DefaultRouter()
router.register(r'coffee', CoffeeViewSet)
router.register(r'desserts', DessertViewSet)
router.register(r'orders-list', OrderViewSet)

urlpatterns = [
    path('', index, name='home'),

    path('admin/', admin.site.urls),
    
    path('api/', include(router.urls)),
    
    path('api/register/', register_view),
    path('api/login/', login_view),
    path('api/logout/', logout_view),
    path('api/user/current/', current_user),
    
    path('api/address/current/', get_current_address),
    path('api/address/save/', save_address),
    path('api/orders/create/', create_order),
]