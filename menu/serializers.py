from rest_framework import serializers
from .models import Coffee, Dessert, Address, Order, OrderItem

class CoffeeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coffee
        fields = '__all__'

class DessertSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dessert
        fields = '__all__'

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['district', 'street', 'note']

class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['name', 'quantity', 'price', 'size', 'milk', 'syrup']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'