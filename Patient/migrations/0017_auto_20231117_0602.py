# Generated by Django 2.1.15 on 2023-11-17 06:02

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Patient', '0016_auto_20220713_2240'),
    ]

    operations = [
        migrations.AddField(
            model_name='taxinvoice',
            name='contact',
            field=models.CharField(default='', max_length=2048),
        ),
        migrations.AddField(
            model_name='taxinvoice',
            name='employee',
            field=models.CharField(default='', max_length=2048),
        ),
    ]
