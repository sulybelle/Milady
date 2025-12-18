import json
from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets
from .models import Coffee, Dessert, Address, Order, OrderItem
from .serializers import CoffeeSerializer, DessertSerializer

# Стандартты API (Кофе мен Десерттер үшін)
class CoffeeViewSet(viewsets.ModelViewSet):
    queryset = Coffee.objects.all()
    serializer_class = CoffeeSerializer

class DessertViewSet(viewsets.ModelViewSet):
    queryset = Dessert.objects.all()
    serializer_class = DessertSerializer

# --- АВТОРИЗАЦИЯ (LOGIN / REGISTER) ---

@csrf_exempt
def register_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            username = data.get('username')
            email = data.get('email')
            password = data.get('password')
            
            if User.objects.filter(email=email).exists():
                return JsonResponse({'success': False, 'message': 'Email already registered'}, status=400)
            
            # Жаңа қолданушы құру
            user = User.objects.create_user(username=username, email=email, password=password)
            user.first_name = data.get('first_name', '')
            user.save()
            
            # Автоматты түрде кіргізу
            login(request, user)
            
            return JsonResponse({
                'success': True,
                'username': user.username,
                'email': user.email,
                'phone': '' # Қажет болса UserProfile моделін қосу керек
            })
        except Exception as e:
            return JsonResponse({'success': False, 'message': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def login_view(request):
    if request.method == 'POST':
        try:
            data = json.loads(request.body)
            email = data.get('email')
            password = data.get('password')
            
            # Email арқылы username табу (Django username сұрайды)
            try:
                u = User.objects.get(email=email)
                username = u.username
            except User.DoesNotExist:
                return JsonResponse({'success': False, 'error': 'User not found'}, status=400)

            user = authenticate(request, username=username, password=password)
            
            if user is not None:
                login(request, user)
                return JsonResponse({
                    'success': True,
                    'username': user.username,
                    'email': user.email,
                    'phone': '' 
                })
            else:
                return JsonResponse({'success': False, 'error': 'Invalid credentials'}, status=400)
        except Exception as e:
            return JsonResponse({'success': False, 'error': str(e)}, status=400)
    return JsonResponse({'error': 'Method not allowed'}, status=405)

@csrf_exempt
def logout_view(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Method not allowed'}, status=405)

def current_user(request):
    if request.user.is_authenticated:
        return JsonResponse({
            'is_authenticated': True,
            'username': request.user.username,
            'email': request.user.email,
            'phone': ''
        })
    return JsonResponse({'is_authenticated': False})

# --- АДРЕС ---

def get_current_address(request):
    if request.user.is_authenticated:
        try:
            addr = Address.objects.get(user=request.user)
            return JsonResponse({
                'district': addr.district,
                'street': addr.street,
                'note': addr.note
            })
        except Address.DoesNotExist:
            return JsonResponse(None, safe=False)
    return JsonResponse({'error': 'Not authenticated'}, status=403)

@csrf_exempt
def save_address(request):
    if request.method == 'POST' and request.user.is_authenticated:
        data = json.loads(request.body)
        Address.objects.update_or_create(
            user=request.user,
            defaults={
                'district': data.get('district'),
                'street': data.get('street'),
                'note': data.get('note')
            }
        )
        return JsonResponse({'success': True})
    return JsonResponse({'error': 'Error'}, status=400)

# --- ТАПСЫРЫС (ORDER) ---

@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            return JsonResponse({'success': False, 'message': 'Not authenticated'}, status=403)
        
        try:
            data = json.loads(request.body)
            address_data = data.get('address', {})
            items_data = data.get('items', [])
            
            # Тапсырысты сақтау
            order = Order.objects.create(
                user=request.user,
                address_district=address_data.get('district', ''),
                address_street=address_data.get('street', ''),
                address_note=address_data.get('note', ''),
                total_price=data.get('total', 0)
            )
            
            # Тауарларды сақтау
            for item in items_data:
                OrderItem.objects.create(
                    order=order,
                    name=item.get('name'),
                    quantity=item.get('quantity'),
                    price=item.get('price'),
                    size=item.get('size'),
                    milk=item.get('milk'),
                    syrup=item.get('syrup')
                )
                
            return JsonResponse({'success': True, 'order_id': order.id})
        except Exception as e:
            print(e)
            return JsonResponse({'success': False, 'message': str(e)}, status=400)
            
    return JsonResponse({'error': 'Method not allowed'}, status=405)