from django.core.management.base import BaseCommand
from menu.models import Coffee, Dessert

class Command(BaseCommand):
    help = 'Load initial coffee and dessert data'

    def handle(self, *args, **options):
        
        # 7 түрлі кофе
        coffee_data = [
            {
                'name': 'Латте',
                'description': 'Сүт пен кофенің жұмсақ үйлесімі',
                'base_price': 1450,
                'image_url': 'https://images.pexels.com/photos/27524209/pexels-photo-27524209.jpeg?cs=srgb&dl=pexels-esra-salturk-1165434438-27524209.jpg&fm=jpg'
            },
            {
                'name': 'Капучино',
                'description': 'Эспрессо, сүт және көбіктің тамаша қатынасы',
                'base_price': 1450,
                'image_url': 'https://eda.ru/images/Article/480x480/kak-sdelat-molochnuyu-penku-dlya-kapuchino-v-domashnih-usloviyah_square.jpg'
            },
            {
                'name': 'Эспрессо',
                'description': 'Күшті және хош иісті кофе таза түрде',
                'base_price': 1200,
                'image_url': 'https://api.podorognik.ru/media/pages/menu/кофе_в_чашке__1680х1680_XaqRbKu.jpg'
            },
            {
                'name': 'Американо',
                'description': 'Эспрессоға ыстық су қосылған',
                'base_price': 1300,
                'image_url': 'https://artjourney.sg/wp-content/uploads/2025/08/Americano-Long-Black-compressed-scaled-1-1000x1000.jpg'
            },
            {
                'name': 'Фраппучино',
                'description': 'Салқындатқыш суық кофе коктейлі',
                'base_price': 1800,
                'image_url': 'https://img.iamcook.ru/old/upl/recipes/cat/u6009-4669746e74c5e087be30823c674bc2e4.jpg'
            },
            {
                'name': 'Раф',
                'description': 'Кілегей және ваниль сиропы бар жұмсақ кофе',
                'base_price': 1750,
                'image_url': 'https://images.unsplash.com/photo-1762657440603-67275ae3f7f8?w=500'
            },
            {
                'name': 'Матча',
                'description': 'Дәстүрлі жапон жасыл шайы',
                'base_price': 1800,
                'image_url': 'https://health-bar.com/cdn/shop/files/IMG_5731.heic?v=1709048930&width=1500'
            }
        ]
        
        # 6 түрлі десерт
        dessert_data = [
            {
                'name': 'Круассан',
                'description': 'Қытырлақ француз қабатыр қамыры',
                'price': 950,
                'image_url': 'https://i.pinimg.com/736x/a2/67/2f/a2672f4a9b1c78f57a16d0cb39f300a2.jpg'
            },
            {
                'name': 'Макарон',
                'description': 'Әртүрлі толтырмалы жұмсақ француз тортшалары',
                'price': 750,
                'image_url': 'https://i.pinimg.com/736x/f7/de/e0/f7dee00ab51977c219b28f8be9007d1c.jpg'
            },
            {
                'name': 'Капкейк',
                'description': 'Крем тәжді жұмсақ кекстер',
                'price': 1150,
                'image_url': 'https://mrginger.ru/assets/images/products/12239/big/1lfsirh0tw-1i6ncgps-85pa04gaze63v.webp'
            },
            {
                'name': 'Чизкейк',
                'description': 'Классикалық Нью-Йорк чизкейкі',
                'price': 1850,
                'image_url': 'https://prostokvashino.ru/upload/resize_cache/iblock/668/800_800_0/668fac618d034d52e449cdeb173d7aec.jpg'
            },
            {
                'name': 'Пончик',
                'description': 'Әртүрлі топпингтері бар пішінделген пончик',
                'price': 850,
                'image_url': 'https://cheese-cake.ru/DesertImg/ponchiki-assorti-0-1-1.jpg'
            },
            {
                'name': 'Тортик',
                'description': 'Бір реттік тамақтануға арналған кішкентай талғампаз торт',
                'price': 2250,
                'image_url': 'https://balthazar.club/uploads/posts/2022-02/1645704535_5-balthazar-club-p-kusok-torta-8.png'
            }
        ]
        
        created_coffees = []
        for item in coffee_data:
            defaults = item.copy()
            defaults.pop('name', None)
            
            # update_or_create: Бар болса жаңартады, жоқ болса қосады
            coffee, created = Coffee.objects.update_or_create(
                name=item['name'], 
                defaults=defaults
            )
            created_coffees.append((coffee.name, created))
        
        created_desserts = []
        for item in dessert_data:
            defaults = item.copy()
            defaults.pop('name', None)
            
            dessert, created = Dessert.objects.update_or_create(
                name=item['name'], 
                defaults=defaults
            )
            created_desserts.append((dessert.name, created))
        
        # Нәтиже
        self.stdout.write(self.style.SUCCESS(f'Done! Total Coffees processed: {len(created_coffees)}. Total Desserts processed: {len(created_desserts)}'))