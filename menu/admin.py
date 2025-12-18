from django.contrib import admin
from .models import Coffee, Dessert, Order, OrderItem, Address

# Красивое отображение товаров в заказе
class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_price', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]

admin.site.register(Coffee)
admin.site.register(Dessert)
admin.site.register(Order, OrderAdmin)
admin.site.register(Address)