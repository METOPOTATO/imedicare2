# Generated by Django 2.1.15 on 2020-06-22 18:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('KBL', '0040_customer_employee_name_vie'),
    ]

    operations = [
        migrations.AlterField(
            model_name='customer_employee',
            name='memo',
            field=models.TextField(default=''),
        ),
    ]
