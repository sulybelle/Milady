from django.db import models
from django.contrib.auth.models import User

# --- Меню ---
class Coffee(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    base_price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return self.name

class Dessert(models.Model):
    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image_url = models.URLField(blank=True, null=True)
    
    def __str__(self):
        return self.name

# --- Пользователь и Адрес ---
class Address(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='address')
    district = models.CharField(max_length=100, blank=True, null=True)
    street = models.CharField(max_length=255, blank=True, null=True)
    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Address for {self.user.username}"

# --- Заказы ---
class Order(models.Model):
    STATUS_CHOICES = [
        ('new', 'Новый'),
        ('processing', 'Готовится'),
        ('done', 'Готов'),
        ('cancelled', 'Отменен'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    # Адрес копируем в заказ, чтобы он сохранился, даже если юзер переедет
    address_district = models.CharField(max_length=100, blank=True, null=True)
    address_street = models.CharField(max_length=255, blank=True, null=True)
    address_note = models.TextField(blank=True, null=True)
    
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Order #{self.id} - {self.user.username}"

class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    name = models.CharField(max_length=200) # Название товара
    quantity = models.IntegerField(default=1)
    price = models.DecimalField(max_digits=10, decimal_places=2) # Цена за штуку на момент заказа
    
    # Опции (только для кофе)
    size = models.CharField(max_length=20, blank=True, null=True)
    milk = models.CharField(max_length=50, blank=True, null=True)
    syrup = models.CharField(max_length=50, blank=True, null=True)

    def __str__(self):
        return f"{self.name} x{self.quantity}"