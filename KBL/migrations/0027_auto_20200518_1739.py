# Generated by Django 2.1.15 on 2020-05-18 17:39

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('KBL', '0026_auto_20200518_1714'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='project_manage_detail',
            name='project',
        ),
        migrations.DeleteModel(
            name='Project_Manage_Detail',
        ),
    ]
