# Generated by Django 2.1.15 on 2020-05-09 13:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0023_auto_20200429_0218'),
    ]

    operations = [
        migrations.AddField(
            model_name='diagnosis',
            name='posi_text',
            field=models.TextField(default=''),
        ),
    ]
