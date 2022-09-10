# Generated by Django 2.1.15 on 2020-05-14 16:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('KBL', '0010_customer_company_condition'),
    ]

    operations = [
        migrations.RenameField(
            model_name='customer_employee',
            old_name='date_done',
            new_name='date_modify',
        ),
        migrations.AddField(
            model_name='customer_employee',
            name='date_register',
            field=models.CharField(default='0000-00-00 00:00:00', max_length=20),
        ),
    ]
