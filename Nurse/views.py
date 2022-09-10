import datetime
import operator
import functools

from django.shortcuts import render
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
# Create your views here.


from .models import *


@login_required
def index(request):
    depart = Depart.objects.all()

    return render(request,
    'Nurse/index.html',
            {
                'depart':depart,
            },
        )



@login_required
def waiting_list(request):

    date_start = request.POST.get('start_date')
    date_end = request.POST.get('end_date')

    
    depart = request.POST.get('depart','')
    filter = request.POST.get('filter','')
    string = request.POST.get('string','')
    argument_list = [] 

    kwargs={}
    if filter == '':
        argument_list.append(Q(**{'diagnosis__reception__patient__name_kor__icontains':string} ))
        argument_list.append(Q(**{'diagnosis__reception__patient__name_eng__icontains':string} ))
        argument_list.append(Q(**{'diagnosis__reception__patient__id__icontains':string} ))
    elif filter =='name':
        argument_list.append(Q(**{'diagnosis__reception__patient__name_kor__icontains':string} ))
        argument_list.append(Q(**{'diagnosis__reception__patient__name_eng__icontains':string} ))
    elif filter =='chart':
        argument_list.append(Q(**{'diagnosis__reception__patient__id__icontains':string} ))

    if depart !='':
        kwargs['diagnosis__reception__depart']=depart

    date_min = datetime.datetime.combine(datetime.datetime.strptime(date_start, "%Y-%m-%d").date(), datetime.time.min)
    date_max = datetime.datetime.combine(datetime.datetime.strptime(date_end, "%Y-%m-%d").date(), datetime.time.max)


    nurse_manages = NurseManage.objects.select_related('diagnosis__reception__patient').filter(
        functools.reduce(operator.or_, argument_list),
        **kwargs,
        created_date__range = (date_min, date_max),
        
        ).order_by('created_date')
 
    datas=[]
    today = datetime.date.today()

    for nurse_manage in nurse_manages:
        data={}
        data.update({
            'diagnosis_id':nurse_manage.diagnosis.id,
            'chart':nurse_manage.diagnosis.reception.patient.get_chart_no(),
            'Name':nurse_manage.diagnosis.reception.patient.name_kor + ' / ' + 
                nurse_manage.diagnosis.reception.patient.name_eng,
            'Date_of_Birth':nurse_manage.diagnosis.reception.patient.date_of_birth.strftime('%Y-%m-%d') + ' ( ' + 
                str(nurse_manage.diagnosis.reception.patient.get_age()) + ' / ' + 
                nurse_manage.diagnosis.reception.patient.get_gender_simple() + ' )',
            'Depart':nurse_manage.diagnosis.reception.depart.name + ' ( ' + nurse_manage.diagnosis.reception.doctor.name_kor +' )',
            'status':nurse_manage.status,
            'ordered':nurse_manage.created_date.strftime("%Y-%m-%d %H:%M"),
            'done':'' if nurse_manage.date_done == None else nurse_manage.date_done.strftime("%Y-%m-%d %H:%M"),
            })
        datas.append(data)

    datas.reverse()
    context = {'datas':datas}
    return JsonResponse(context)



@login_required
def waiting_selected(request):

    diagnosis_id = request.POST.get('diagnosis_id')

    diagnosis = Diagnosis.objects.get(pk = diagnosis_id)
    nurse_manage = NurseManage.objects.get(diagnosis_id = diagnosis_id)

    
    datas=[]
    precedure_set = diagnosis.preceduremanager_set.all()

    for data in precedure_set:
        datas.append({
            'type':'procedure',
            'code':data.precedure.code,
            'name':data.precedure.name,
            'depart':nurse_manage.diagnosis.reception.depart.name + ' ( ' + nurse_manage.diagnosis.reception.doctor.name_kor +' )',
            
            })

    medicine_set = diagnosis.medicinemanager_set.all()
    for data in medicine_set:
        code = data.medicine.code
        if not code.startswith('I'):
            continue
        datas.append({
            'type':'injection',
            'code':data.medicine.code,
            'name':data.medicine.name,
            'depart':nurse_manage.diagnosis.reception.depart.name + ' ( ' + nurse_manage.diagnosis.reception.doctor.name_kor +' )',

            
            })

    context = {
        'datas':datas,

        'status':nurse_manage.status,

        'patient_name':diagnosis.reception.patient.get_name_kor_eng(),

        'chart':diagnosis.reception.patient.get_chart_no(),
        'Name':diagnosis.reception.patient.name_kor + ' / ' + diagnosis.reception.patient.name_eng,
        'Depart':diagnosis.reception.depart.name + ' ( ' + diagnosis.reception.doctor.name_kor + ' )',
        'Date_of_Birth': diagnosis.reception.patient.date_of_birth.strftime('%Y-%m-%d'),
        'gender': diagnosis.reception.patient.gender,
        'phone': diagnosis.reception.patient.phone,


               }
    return JsonResponse(context)


def save(request):
    diagnosis_id = request.POST.get('diagnosis_id','')
    status = request.POST.get('status','')

    nurse_manage = NurseManage.objects.get(diagnosis_id = diagnosis_id)
    
    if status == 'DONE':
        nurse_manage.date_done = datetime.datetime.now()
    else:
        nurse_manage.date_done = None

    nurse_manage.lastest_modifier = request.user.id
    nurse_manage.lastest_modified_date = datetime.datetime.now()
    nurse_manage.status = status
    nurse_manage.save()

    context = {'result':True}
    return JsonResponse(context)