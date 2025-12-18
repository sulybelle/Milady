from django.core.management.base import BaseCommand
from menu.models import Coffee, Dessert

class Command(BaseCommand):
    help = 'Seed initial data'
    
    def handle(self, *args, **options):

        coffee_data = [
            {'name': 'Латте', 'description': 'Сүт пен кофенің жұмсақ үйлесімі', 'base_price': 1450, 'image_url': 'https://images.pexels.com/photos/27524209/pexels-photo-27524209.jpeg'},
            {'name': 'Капучино', 'description': 'Эспрессо, сүт және көбіктің тамаша қатынасы', 'base_price': 1450, 'image_url': 'https://eda.ru/images/Article/480x480/kak-sdelat-molochnuyu-penku-dlya-kapuchino-v-domashnih-usloviyah_square.jpg'},
            {'name': 'Эспрессо', 'description': 'Күшті және хош иісті кофе таза түрде', 'base_price': 1200, 'image_url': 'https://api.podorognik.ru/media/pages/menu/кофе_в_чашке__1680х1680_XaqRbKu.jpg'},
        ]

        dessert_data = [
            {'name': 'Круассан', 'description': 'Қытырлақ француз қабатыр қамыры', 'price': 950, 'image_url': 'https://i.pinimg.com/736x/a2/67/2f/a2672f4a9b1c78f57a16d0cb39f300a2.jpg'},
            {'name': 'Макарон', 'description': 'Әртүрлі толтырмалы жұмсақ француз тортшалары', 'price': 750, 'image_url': 'https://i.pinimg.com/736x/f7/de/e0/f7dee00ab51977c219b28f8be9007d1c.jpg'},
        ]
        
        for item in coffee_data:
            Coffee.objects.get_or_create(**item)
            self.stdout.write(f'Created coffee: {item["name"]}')
        
        for item in dessert_data:
            Dessert.objects.get_or_create(**item)
            self.stdout.write(f'Created dessert: {item["name"]}')
        
        self.stdout.write(self.style.SUCCESS('Successfully seeded data'))