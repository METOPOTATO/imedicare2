# Generated by Django 2.1.15 on 2024-04-16 22:39

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0056_auto_20240402_2328'),
    ]

    operations = [
        migrations.AddField(
            model_name='reception',
            name='send_invoice_status',
            field=models.BooleanField(default=False, null=True),
        ),
    ]