# Generated by Django 2.1.15 on 2020-08-29 14:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Doctor', '0048_auto_20200829_0317'),
    ]

    operations = [
        migrations.AddField(
            model_name='medicine',
            name='vaccine_hospital',
            field=models.CharField(default='I-MEDICARE', max_length=64),
        ),
    ]
