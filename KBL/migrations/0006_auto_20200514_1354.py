# Generated by Django 2.1.15 on 2020-05-14 13:54

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('KBL', '0005_auto_20200513_1631'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customer_company',
            old_name='date_done',
            new_name='date_modify',
        ),
        migrations.AddField(
            model_name='customer_company',
            name='date_register',
            field=models.CharField(default='0000-00-00 00:00:00', max_length=20),
        ),
    ]
