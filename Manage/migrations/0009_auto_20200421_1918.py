# Generated by Django 2.1.15 on 2020-04-21 19:18

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Manage', '0008_auto_20200421_1915'),
    ]

    operations = [
        migrations.AlterField(
            model_name='board_contents',
            name='date_to_be_done',
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
