# Generated by Django 2.1.15 on 2024-03-26 23:22

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('Receptionist', '0054_reception_send_email_status'),
    ]

    operations = [
        migrations.AddField(
            model_name='reception',
            name='need_invoice_p',
            field=models.BooleanField(default=False, null=True),
        ),
    ]