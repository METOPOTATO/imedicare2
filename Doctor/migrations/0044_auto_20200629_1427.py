# Generated by Django 2.1.15 on 2020-06-29 14:27

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('Doctor', '0043_depart_medicineclass_depart_preceduremenu_depart_testclass'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Depart_MedicineClass',
            new_name='Depart_MedicineMenu',
        ),
        migrations.RenameModel(
            old_name='Depart_TestClass',
            new_name='Depart_TestMenu',
        ),
    ]
