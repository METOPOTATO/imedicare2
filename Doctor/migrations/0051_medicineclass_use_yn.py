# Generated by Django 2.1.15 on 2020-10-13 01:49

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Doctor', '0050_auto_20200829_1508'),
    ]

    operations = [
        migrations.AddField(
            model_name='medicineclass',
            name='use_yn',
            field=models.CharField(default='Y', max_length=2),
        ),
    ]
