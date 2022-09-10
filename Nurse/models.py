from django.db import models
 
# Create your models here.

from Receptionist.models import *


class NurseManage(models.Model):
    diagnosis = models.OneToOneField(
        to = Diagnosis,
        on_delete = models.DO_NOTHING,
        ) 

    status = models.CharField(
        max_length = 16,
        default='',
        )

    date_done= models.DateTimeField(
        null=True,
        )

    
    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default = 'Y',
        )

    #작성자 - 논리 FK = user_id
    creator = models.CharField(
        max_length = 8,
        default = '',
        )
    #최초 작성 일자
    created_date = models.DateTimeField(
        auto_now_add=True,
        blank=True,
        )

    #마지막 수정 자 - 논리 FK = user_id
    lastest_modifier = models.CharField(
        max_length = 8,
        default = '',
        )
    #마지막 수정 일
    lastest_modified_date = models.DateTimeField(
        auto_now_add=True,
        blank=True,
        )