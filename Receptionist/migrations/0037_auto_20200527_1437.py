# Generated by Django 2.1.15 on 2020-05-27 14:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0036_document_sign'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='document_sign',
            name='diagnosis',
        ),
        migrations.AddField(
            model_name='sign_manage',
            name='depart',
            field=models.CharField(default='', max_length=16),
        ),
        migrations.AddField(
            model_name='sign_manage',
            name='document',
            field=models.CharField(default='', max_length=64),
        ),
        migrations.AddField(
            model_name='sign_manage',
            name='patient_id',
            field=models.CharField(default='', max_length=16),
        ),
        migrations.AddField(
            model_name='sign_manage',
            name='patient_name',
            field=models.CharField(default='', max_length=16),
        ),
        migrations.AddField(
            model_name='sign_manage',
            name='sign_date',
            field=models.CharField(default='0000-00-00 00:00:00', max_length=20),
        ),
        migrations.AddField(
            model_name='sign_manage',
            name='type',
            field=models.CharField(default='', max_length=16),
        ),
        migrations.DeleteModel(
            name='document_sign',
        ),
    ]
