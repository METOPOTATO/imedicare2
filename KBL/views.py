from django.shortcuts import render, redirect
from django.http import HttpRequest, HttpResponse, JsonResponse
from django.template import RequestContext

from django.core.paginator import Paginator,PageNotAnInteger,EmptyPage

from django.contrib.auth.decorators import login_required

from django.utils import timezone, translation
from django.utils.translation import gettext as _

from django.db.models import Q, Count, F, Min,Sum
from django.core.mail import EmailMessage


import datetime
import functools
import operator
import json
import calendar
# Create your views here.

from .models import *
from .forms import *

from Account.models import *
from app.models import *
from Manage.models import *
from Manage.forms import board_file_form

from django.core.mail import send_mail
from django.template import loader

@login_required
def dash_board(request):

    dashboard_board = Board_Contents.objects.filter(use_yn='Y',board_type='BASIC',is_KBL='Y').order_by('-created_date')[:7]
    
    list_board = []
    for data in dashboard_board:
        user = User.objects.get(id = data.creator)

        list_board.append({
            'is_new':True if ( (datetime.datetime.now() - data.created_date).days < 7 ) else False,
            'id':data.id, 
            'title':data.title, 
            'creator':user.user_id,
            'date':data.created_date.strftime('%Y-%m-%d'), 
            })
    
    dashboard_co_board = Board_Contents.objects.filter(use_yn='Y',board_type='COWORK',is_KBL='Y').order_by('-created_date')[:7]
    list_co_board = []
    for data in dashboard_co_board:
        user = User.objects.get(id = data.creator)

        list_co_board.append({
            'is_new':True if ( (datetime.datetime.now() - data.created_date).days < 7 ) else False,
            'id':data.id, 
            'title':data.title, 
            'creator':user.user_id,
            'date':data.created_date.strftime('%Y-%m-%d'), 
            })
        
    
        
        
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')



    query = Project_Manage.objects.filter(use_yn='Y').exclude(progress='CANCEL').exclude(progress='DONE')
    #프로젝트 구분
    project_type_list= []
    query_type= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name).values('code','name')
    for data in query_type:
        project_type_list.append({
           'code':data['code'],
           'name':data['name'],
           'new':query.filter(type=data['code'],progress='SUBMIT').count(),
           'in_progress':query.filter(type=data['code'],progress='INPROGRESS').count(),
           'pending':query.filter(type=data['code'],progress='PENDING').count(),
           })

    today = datetime.datetime.today()
    two_weeks = today - datetime.timedelta(days = 14)


    count_new_customer = Customer_Company.objects.filter(
        date_register__range = (two_weeks,today),
        use_yn = 'Y',
        ).count()


    return render(request,
        'KBL/dashboard.html',
            {
                'count_new_customer':count_new_customer,

                'list_board':list_board,
                'list_co_board':list_co_board,

                'project_type_list':project_type_list,
            }
        )




@login_required
def customer_management(request):
        
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
        user_name = F('name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
        user_name = F('name_en')


    #직원 국적
    employee_nation_list= []
    query_employee_nation= COMMCODE.objects.filter( commcode_grp='EMP_NATION',upper_commcode='000013').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_employee_nation:
        employee_nation_list.append({
            'name':data['name'],
            'code':data['code'],
            })


    return render(request,
    'KBL/customer_management.html',
            {
                'employee_nation_list':employee_nation_list,
                'file_form':board_file_form(),
            },
        )

@login_required
def customer_management_search(request):

    start=request.POST.get("start") + ' 00:00:00'
    end=request.POST.get("end") + ' 23:59:59'

    type=request.POST.get("type")
    string=request.POST.get("string")

    kwargs = {}
    argument_list = [] 

  
    if string == '':
        kwargs['date_register__range'] = (start,end)
    #argument_list.append( Q(**{'name_kor__icontains':string} ) )
    argument_list.append( Q(**{'name_kor__icontains':string} ) )
    argument_list.append( Q(**{'name_eng__icontains':string} ) )


    datas = []

    #개인은 항상 위
    private = query = Customer_Company.objects.get(id=0)
    datas.append({
        'id':private.id,
        'type':private.type,
        'customer_no':private.serial,
        'name_eng':private.name_eng,
        'name_phone1':private.phone1,
        'corporation_no':private.corporation_no,
        'date_registered':private.date_register[0:10],
        'remark':private.memo,
        })

    query = Customer_Company.objects.filter(
        functools.reduce(operator.or_, argument_list),
        **kwargs,
        #date_register__range = (start,end),
        use_yn = 'Y').exclude(id=0).order_by('-id')

    for data in query:
        datas.append({
            'id':data.id,
            'type':data.type,
            'customer_no':data.serial,
            'name_eng':data.name_eng,
            'name_phone1':data.phone1,
            'corporation_no':data.corporation_no,
            'date_registered':data.date_register[0:10],
            'remark':data.memo,
            })


    page_context = request.POST.get('page_context',10) # 페이지 컨텐츠 
    page = request.POST.get('page',1)

    paginator = Paginator(datas, page_context)
    try:
        paging_data = paginator.page(page)
    except PageNotAnInteger:
        paging_data = paginator.page(1)
    except EmptyPage:
        paging_data = paginator.page(paginator.num_pages)


    context = {
            'datas':list(paging_data),
            'page_range_start':paging_data.paginator.page_range.start,
            'page_range_stop':paging_data.paginator.page_range.stop,
            'page_number':paging_data.number,
            'has_previous':paging_data.has_previous(),
            'has_next':paging_data.has_next(),
            }



    return JsonResponse(context)



@login_required
def customer_management_set_basic_info(request):

    id=request.POST.get("id")

    company = Customer_Company.objects.get(id = id)


    return JsonResponse({
        'result':True,

        "basic_info_serial":company.serial,
        "basic_info_name_vie":company.name_vie,
        "basic_info_name_kor":company.name_kor,
        "basic_info_name_eng":company.name_eng,
        "basic_info_ceo_name":company.ceo_name,
        "basic_info_business_type":company.business_type,
        "basic_info_corperation_number":company.corporation_no,
        "basic_info_number_employees":company.count_employee,
        "basic_info_phone1":company.phone1,
        "basic_info_phone2":company.phone2,
        "basic_info_fax":company.fax,
        "basic_info_addr1":company.add1,
        "basic_info_addr2":company.add2,
        "basic_info_date_establishment":company.date_establishment,
        "basic_info_condition":company.condition,
        "basic_info_remark":company.memo,


        })

@login_required
def customer_management_delete(request):

    id=request.POST.get("id")

    company = Customer_Company.objects.get(id = id)
    company.use_yn = 'N'

    company.modifier = request.user.id
    company.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    company.save()

    return JsonResponse({
        'result':True,

        })



@login_required
def customer_management_add_save(request):

    id=request.POST.get("id",'')

    register_name_vie=request.POST.get("register_name_vie")
    register_name_kor=request.POST.get("register_name_kor")
    register_name_eng=request.POST.get("register_name_eng")
    register_ceo_name=request.POST.get("register_ceo_name")
    register_business_type=request.POST.get("register_business_type")
    register_corperation_number=request.POST.get("register_corperation_number")
    register_number_employees=request.POST.get("register_number_employees")
    register_phone1=request.POST.get("register_phone1")
    register_phone2=request.POST.get("register_phone2")
    register_fax=request.POST.get("register_fax")
    register_addr1=request.POST.get("register_addr1")
    register_addr2=request.POST.get("register_addr2")
    register_date_establishment=request.POST.get("register_date_establishment")
    register_condition=request.POST.get("register_condition")
    register_remark=request.POST.get("register_remark")

    if id == '':
        company = Customer_Company()


        company.registrant = request.user.id
        company.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    else:
        company = Customer_Company.objects.get(id = id)

    
    
    
    
    company.type = 'COMPANY'

    company.name_vie = register_name_vie
    company.name_kor = register_name_kor
    company.name_eng = register_name_eng
    company.ceo_name  = register_ceo_name
    company.business_type = register_business_type
    company.corporation_no  = register_corperation_number
    company.count_employee = register_number_employees 
    company.phone1 = register_phone1
    company.phone2 = register_phone2
    company.fax = register_fax
    company.add1 = register_addr1
    company.add2 = register_addr2
    company.memo = register_remark
    company.date_establishment = register_date_establishment
    company.condition = register_condition


    company.modifier = request.user.id
    company.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    company.save()

    company.serial = "{:06d}".format(company.id)
    company.save()

    return JsonResponse({
        'result':True
        })



def customer_management_employee_add_save(request):

    id = request.POST.get("id")

    company_id = request.POST.get("company_id")

    employee_type=request.POST.get("employee_type")
    employee_position=request.POST.get("employee_position")
    employee_name_vie=request.POST.get("employee_name_vie")
    employee_name_kor=request.POST.get("employee_name_kor")
    employee_name_eng=request.POST.get("employee_name_eng")
    employee_dob=request.POST.get("employee_dob")
    employee_passport=request.POST.get("employee_passport")
    employee_Identity=request.POST.get("employee_Identity")
    employee_phone=request.POST.get("employee_phone")
    employee_address=request.POST.get("employee_address")
    employee_email=request.POST.get("employee_email")
    employee_condition=request.POST.get("employee_condition")
    employee_remark=request.POST.get("employee_remark")

    visa_expiration_date=request.POST.get("visa_expiration_date")
    residence_expiration_date=request.POST.get("residence_expiration_date")
    passport_expiration_date=request.POST.get("passport_expiration_date")

    if id =='': #신규
        employee = Customer_Employee()

        employee.registrant = request.user.id
        employee.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    else:
        employee = Customer_Employee.objects.get(id = id)


    employee.company_id = company_id
    employee.type = employee_type
    employee.position = employee_position
    employee.name_vie= employee_name_vie
    employee.name_kor = employee_name_kor
    employee.name_eng = employee_name_eng
    employee.date_of_birth = employee_dob
    employee.passport_no = employee_passport
    employee.Identity_no = employee_Identity
    employee.phone = employee_phone
    employee.add1 = employee_address
    employee.email = employee_email
    employee.status = employee_condition
    employee.memo = employee_remark

    employee.visa_expiration_date = visa_expiration_date
    employee.residence_expiration_date = residence_expiration_date
    employee.passport_expiration_date = passport_expiration_date


    employee.modifier = request.user.id
    employee.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    employee.save()


    return JsonResponse({
        'result':True
        })




@login_required
def customer_management_set_employee_list(request):

    
    company_id=request.POST.get("company_id")


    datas = []
    query = Customer_Employee.objects.filter(company_id = company_id, use_yn = 'Y')

    
    for data in query:
        datas.append({
            'id':data.id,
            'position':data.position,
            'name_kor':data.name_kor,
            'name_eng':data.name_eng,
            'date_of_birth':data.date_of_birth,
            'phone':data.phone,
            'status':data.status,
            'remark':data.memo,
            })



    return JsonResponse({
        'result':True,
        'datas':datas,
        })


@login_required
def customer_management_set_employee_info(request):

    id = request.POST.get("id")

    employee = Customer_Employee.objects.get(id = id)


    return JsonResponse({
        'result':True,

        "employee_type":employee.type,
        "employee_position":employee.position,
        "employee_name_vie":employee.name_vie,
        "employee_name_kor":employee.name_kor,
        "employee_name_eng":employee.name_eng,
        "employee_dob":employee.date_of_birth,
        "employee_passport":employee.passport_no,
        "employee_Identity_no":employee.Identity_no,
        "employee_phone":employee.phone,
        "employee_address":employee.add1,
        "employee_email":employee.email,
        "employee_condition":employee.status,
        "employee_remark":employee.memo,

        "passport_expiration_date":employee.passport_expiration_date,
        "visa_expiration_date":employee.visa_expiration_date,
        "residence_expiration_date":employee.residence_expiration_date,
        })


@login_required
def customer_management_delete_employee(request):

    id=request.POST.get("id")

    employee = Customer_Employee.objects.get(id = id)
    employee.use_yn = 'N'

    employee.modifier = request.user.id
    employee.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    employee.save()

    return JsonResponse({
        'result':True,
        })



@login_required
def customer_management_set_project_list(request):
    
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
        user_name = F('name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
        user_name = F('name_en')


    #분류
    project_type_dict = {}
    query_class= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_class:
        project_type_dict[ data['code'] ] = {
            'name':data['name']
            }

    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }

    


    id=request.POST.get("id")


    datas = []
    query = Project_Manage.objects.filter(customer_id = id, use_yn = 'Y')

    for data in query:
        #담당자
        in_charge1 = ''
        in_charge2 = ''
        in_charge3 = ''
        in_charge4 = ''
        if data.in_charge1 !='':
            in_charge1 = User.objects.filter(id = data.in_charge1).annotate(name = user_name ).values('id','name').first()
        if data.in_charge2 !='':
            in_charge2 = User.objects.filter(id = data.in_charge2).annotate(name = user_name ).values('id','name').first()
        if data.in_charge3 !='':
            in_charge3 = User.objects.filter(id = data.in_charge3).annotate(name = user_name ).values('id','name').first()
        if data.in_charge4 !='':
            in_charge4 = User.objects.filter(id = data.in_charge4).annotate(name = user_name ).values('id','name').first()

        
        datas.append({
            'id':data.id,
            'type':data.type,
            'name':data.project_name,
            'level':data.level,
            'date_start':data.start_date[0:10],
            'date_end':data.end_date[0:10],
            'status':data.progress,
            'in_charge1':'' if in_charge1 is '' else in_charge1['name'],
            'in_charge2':'' if in_charge2 is '' else in_charge2['name'],
            'in_charge3':'' if in_charge3 is '' else in_charge3['name'],
            'in_charge4':'' if in_charge4 is '' else in_charge4['name'],
            'note':data.note,
            })


    return JsonResponse({
        'result':True,
        'datas':datas,

        'project_type_dict':project_type_dict,
        'project_status_dict':project_status_dict,
        })



@login_required
def estimate_sheet(request):

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
        user_name = F('name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
        user_name = F('name_en')


    #상태
    list_status = []
    query_status= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='ESTIMATE_STATUS',upper_commcode='000009').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_status:
        list_status.append({
            'id':data['code'],
            'name':data['name']
            })

        
    #구분
    list_class = []
    query_class= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='ESTIMATE_CLASS',upper_commcode='000009').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_class:
        list_class.append({
            'id':data['code'],
            'name':data['name']
            })


    #프로젝트 구분
    list_type = []
    query_type= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_type:
        list_type.append({
            'id':data['code'],
            'name':data['name']
            })

    #담당자 - KBL 직원
    list_depart = []
    query_kbl_depart = COMMCODE.objects.filter( use_yn = 'Y', commcode_grp='DEPART_KBL',upper_commcode='000002').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_kbl_depart:
        list_depart.append( Q(**{'depart':data['code']} ) )
    list_depart.append( Q(**{'user_id':'ADMIN'} ) )

    list_in_charge = User.objects.filter(functools.reduce(operator.or_, list_depart),).annotate(name = user_name ).values('id','name')


    return render(request,
    'KBL/estimate_sheet.html',
            {
                'list_status':list_status,
                'list_class':list_class,
                'list_type':list_type,

                'list_in_charge':list_in_charge,
            },
        )


@login_required
def estimate_sheet_search(request):

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')

    status=request.POST.get("status")
    in_charge=request.POST.get("in_charge")
    start=request.POST.get("start")
    end=request.POST.get("end")
    string=request.POST.get("string")


    kwargs = {}
    argument_list = [] 

    start += ' 00:00:00'
    end += ' 23:59:59'
    
    if status != '':
        kwargs['status'] = status

    argument_list.append( Q(**{'recipient__icontains':string} ) )
    argument_list.append( Q(**{'title__icontains':string} ) )


    datas = []
    query = Estimate_Sheet.objects.filter(
        functools.reduce(operator.or_, argument_list),
        **kwargs,
        date_register__range = (start, end), 
        use_yn = 'Y').order_by('-date_register')


    #분류
    estimate_class_dict = {}
    query_class= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='ESTIMATE_CLASS',upper_commcode='000009').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_class:
        estimate_class_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }

    #상태
    estimate_status_dict = {}
    query_status= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='ESTIMATE_STATUS',upper_commcode='000009').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        estimate_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }
            


    for data in query:
        user = User.objects.get(id = data.registrant)

        datas.append({
            'id':data.id,

            'estimate_classification':data.classification,
            'estimate_recipient':data.recipient,
            'estimate_tile':data.title,
            'estimate_in_charge':user.user_id,

            'estimate_date':'' if data.date == '0000-00-00 00:00:00' else data.date[0:10],
            'estimate_sent':'' if data.date_sent == '0000-00-00 00:00:00' else data.date_sent[0:10],
            'estimate_payment_unit':data.paid_by,
            'estimate_status':data.status,

            })


    page_context = request.POST.get('page_context',10) # 페이지 컨텐츠 
    page = request.POST.get('page',1)

    paginator = Paginator(datas, page_context)
    try:
        paging_data = paginator.page(page)
    except PageNotAnInteger:
        paging_data = paginator.page(1)
    except EmptyPage:
        paging_data = paginator.page(paginator.num_pages)


    context = {
            'datas':list(paging_data),
            'page_range_start':paging_data.paginator.page_range.start,
            'page_range_stop':paging_data.paginator.page_range.stop,
            'page_number':paging_data.number,
            'has_previous':paging_data.has_previous(),
            'has_next':paging_data.has_next(),

            'estimate_class_dict':estimate_class_dict,
            'estimate_status_dict':estimate_status_dict,
            }



    return JsonResponse(context)




@login_required
def estimate_sheet_get(request):

    id=request.POST.get("id")

    data = Estimate_Sheet.objects.get(id = id)

    return JsonResponse({
        'result':True,
        
        'estimate_recipient':data.recipient,
        'estimate_email':data.email,
        'estimate_date':'' if data.date == '0000-00-00 00:00:00' else data.date[0:10],
        'estimate_tile':data.title,
        'estimate_remark':data.remark,
        'estimate_payment_unit':data.paid_by,
        'estimate_status':data.status,
        'estimate_in_charge':data.in_charge,
        'estimate_email_sender':data.in_charge_email,
        'estimate_is_VAT':data.is_VAT,

        })


@login_required
def estimate_sheet_get_incharge_email(request):

    incharge_id=request.POST.get("incharge_id")
    in_charge = User.objects.get(id = incharge_id)

    if in_charge.email == '' or in_charge.email == None:
        return JsonResponse({
            'result':False,
            'msg':'EMAIL_NOT_SET',
            })

    return JsonResponse({
        'result':True,
        'email':in_charge.email,
        })


@login_required
def estimate_sheet_save(request):

    id = request.POST.get("id",'')

    estimate_recipient=request.POST.get("estimate_recipient")
    estimate_email=request.POST.get("estimate_email")
    estimate_date=request.POST.get("estimate_date")
    estimate_tile=request.POST.get("estimate_tile")
    estimate_remark=request.POST.get("estimate_remark")
    estimate_payment_unit=request.POST.get("estimate_payment_unit")
    estimate_status=request.POST.get("estimate_status")
    estimate_in_charge=request.POST.get("estimate_in_charge")
    estimate_email_sender=request.POST.get("estimate_email_sender")
    estimate_is_VAT=request.POST.get("estimate_is_VAT")


    if id =='': #신규
        estimate = Estimate_Sheet()

        estimate.registrant = request.user.id
        estimate.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    else:
        estimate = Estimate_Sheet.objects.get(id = id)


    estimate.classification = 'GENERAL'
    estimate.recipient = estimate_recipient
    estimate.email = estimate_email
    estimate.date = estimate_date
    estimate.title = estimate_tile
    estimate.remark = estimate_remark
    estimate.paid_by = estimate_payment_unit
    estimate.status = estimate_status
    estimate.in_charge = estimate_in_charge
    estimate.in_charge_email = estimate_email_sender
    if estimate_is_VAT == True:
        estimate.in_charge_email = 'Y'
    else:
        estimate.in_charge_email = 'N'

    estimate.modifier = request.user.id
    estimate.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    estimate.save()

    return JsonResponse({
        'result':True,
        })


@login_required
def estimate_sheet_delete(request):
    id=request.POST.get("id")

    estimate = Estimate_Sheet.objects.get(id = id)
    estimate.use_yn = 'N'

    estimate.modifier = request.user.id
    estimate.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    estimate.save()

    return JsonResponse({
        'result':True,
        })






@login_required
def estimate_sheet_detail_list(request):

    id=request.POST.get("id")
    query = Estimate_Sheet_Detail.objects.filter( estimate_id = id , use_yn='Y')


    datas = []
    for data in query:
        user = User.objects.get(id = data.registrant)

        datas.append({
            'id':data.id,

            "estimate_type":data.type,
            "estimate_content":data.content,
            "estimate_unit_price":data.unit_price,
            "estimate_quantity":data.quantity,
            "estimate_unit":data.unit,
            "estimate_cost":data.cost,
            "estimate_note":data.note,


            })



    return JsonResponse({
        'result':True,
        'datas':datas,
        
        })



@login_required
def estimate_sheet_detail_save(request):


    id = request.POST.get("id")
    selected_estimate= request.POST.get("selected_estimate")

    detail_type=request.POST.get("detail_type")
    detail_content=request.POST.get("detail_content")
    detail_unit_price=request.POST.get("detail_unit_price")
    detail_quantity=request.POST.get("detail_quantity")
    detail_unit=request.POST.get("detail_unit")
    detail_cost=request.POST.get("detail_cost")
    detail_note=request.POST.get("detail_note")

    if id == '': # 신규
        detail = Estimate_Sheet_Detail()

        detail.registrant = request.user.id
        detail.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    else:
        detail = Estimate_Sheet_Detail.objects.get(id = id)


    detail.estimate_id = selected_estimate
    detail.type = detail_type
    detail.content = detail_content
    detail.unit_price = detail_unit_price
    detail.quantity = detail_quantity
    detail.unit = detail_unit
    detail.cost = detail_cost
    detail.note = detail_note

    detail.modifier = request.user.id
    detail.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    detail.save()


    return JsonResponse({
        'result':True,        
        })



@login_required
def estimate_sheet_detail_get(request):

    id = request.POST.get("id")

    detail = Estimate_Sheet_Detail.objects.get(id = id)


    return JsonResponse({
        'result':True, 
        
        "detail_type":detail.type,
        "detail_content":detail.content,
        "detail_unit_price":detail.unit_price,
        "detail_quantity":detail.quantity,
        "detail_unit":detail.unit,
        "detail_cost":detail.cost,
        "detail_note":detail.note,

        })

@login_required
def estimate_sheet_detail_delete(request):

    id = request.POST.get("id")

    detail = Estimate_Sheet_Detail.objects.get(id = id)
    detail.use_yn = 'N'

    detail.modifier = request.user.id
    detail.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    detail.save()


    return JsonResponse({
        'result':True,        
        })



@login_required
def print_estimate_sheet(request,id):

    f_name = F('commcode_name_ko')
    #if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
    #    f_name = F('commcode_name_ko')
    #elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
    #    f_name = F('commcode_name_vi')
    #elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
    #    f_name = F('commcode_name_en')




    #프로젝트 구분
    list_type = []
    query_type= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = F('commcode_name_en') ).values('code','name','se1')
    for data in query_type:
        list_type.append({
            'id':data['code'],
            'name':data['name']
            })

    estimate = Estimate_Sheet.objects.get(id = id)

    date = datetime.datetime.strptime(estimate.date,'%Y-%m-%d').strftime("%B %Y") 

    total_amount = 0
    str_table_content =''
    for data in list_type:
        query_detail = Estimate_Sheet_Detail.objects.filter(estimate_id = estimate.id, type = data['id'])
        if query_detail.count() != 0:
            str_table_content += '<tr><td rowspan="' + str( query_detail.count() ) +'" class="border_thin b">' + data['name'] + '</td>'
            
            sum_unit_price = 0
            sum_cost = 0
        
            for detail in query_detail:
                str_table_content += '<td class="border_thin text_left">' + detail.content + '</td>'
                str_table_content += '<td class="border_thin text_right">' + "{:,}".format(int(detail.unit_price)) +'</td>'
                #str_table_content += '<td class="border_thin">' + detail.quantity + '</td>'
                str_table_content += '<td class="border_thin">' + detail.unit +'</td>'#"{:,}".format(int(detail.cost)) + '</td>'
                str_table_content += '<td class="border_thin">' + detail.note + '</td>'
                str_table_content += '</tr>'
        
                if detail.id != query_detail.last().id:
                    str_table_content += '<tr>'

                #sum_unit_price += int(detail.unit_price)
                #sum_cost += int(detail.cost)
                #total_amount += int(detail.cost)


        #query_detail = Estimate_Sheet_Detail.objects.filter(estimate_id = estimate.id, type = data['id'])
        #if query_detail.count() != 0:
        #    str_table_content += '<tr><td rowspan="' + str( query_detail.count() ) +'" class="border_thin b">' + data['name'] + '</td>'
        #    
        #    sum_unit_price = 0
        #    sum_cost = 0
        #
        #    
        #    for detail in query_detail:
        #        str_table_content += '<td class="border_thin">' + detail.content + '</td>'
        #        str_table_content += '<td class="border_thin">' + "{:,}".format(int(detail.unit_price)) +'</td>'
        #        str_table_content += '<td class="border_thin">' + detail.quantity + '</td>'
        #        str_table_content += '<td class="border_thin">' + "{:,}".format(int(detail.cost)) + '</td>'
        #        str_table_content += '<td class="border_thin">' + detail.note + '</td>'
        #        str_table_content += '</tr><tr>'
        #
        #        sum_unit_price += int(detail.unit_price)
        #        sum_cost += int(detail.cost)
        #        total_amount += int(detail.cost)
        #
        #    str_table_content += '<td colspan="2" class="bg_gray border_thin b">소계</td>'
        #    str_table_content += '<td class="border_thin b">' + "{:,}".format(sum_unit_price) + '</td>'
        #    str_table_content += '<td class="border_thin b"></td>'
        #    str_table_content += '<td class="border_thin b">' + "{:,}".format(sum_cost) +'</td>'
        #    str_table_content += '<td class="border_thin b"></td>'
        #    str_table_content += '</tr>'

    paid_by = estimate.paid_by
    if paid_by == 'VND':
        paid_by = '&#8363;'
    elif paid_by == 'USD':
        paid_by = '&#36;'
    elif paid_by == 'KWN':
        paid_by = '&#8361;'

    #str_table_content += '<tr>'
    #str_table_content += '<td colspan="2" class="bg_gray border_thin b">총금액</td>'
    #str_table_content += '<td class="bg_gray border_thin b"></td>'
    #str_table_content += '<td class="bg_gray border_thin b"></td>'
    #str_table_content += '<td class="bg_gray border_thin b">' + paid_by +" {:,}".format(total_amount) + '</td>'
    #str_table_content += '<td class="bg_gray border_thin b"></td>'
    #str_table_content += '</tr>'
    
    is_VAT = False
    if estimate.is_VAT == 'Y':
        is_VAT = True

    return render(request,
    'Form/Estimate_Sheet_print.html',
            {

                'title':estimate.title,
                'recipient':estimate.recipient,
                'date':date,
                'paid_by':estimate.paid_by,
                'str_table_content':str_table_content,
                'remark':estimate.remark,
                'is_VAT':is_VAT,
            },
        )



@login_required
def send_email_estimate(request):

    
    ##이메일 전송
    #path = 'static/Estimate_Sheet/Estimate_Sheet.html'
    #file = open(path,'rt',encoding='UTF-8')
    #data = file.read()
    id = request.POST.get("id")
    f_name = F('commcode_name_ko')
    #프로젝트 구분
    list_type = []
    query_type= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_type:
        list_type.append({
            'id':data['code'],
            'name':data['name']
            })

    estimate = Estimate_Sheet.objects.get(id = id)

    date = estimate.date.split('-')

    total_amount = 0
    str_table_content =''
    for data in list_type:
        query_detail = Estimate_Sheet_Detail.objects.filter(estimate_id = estimate.id, type = data['id'])
        if query_detail.count() != 0:
            str_table_content += '<tr><td rowspan="' + str( query_detail.count() ) +'" class="border_thin b" style="border:1px solid black">' + data['name'] + '</td>'
            
            sum_unit_price = 0
            sum_cost = 0

            
            for detail in query_detail:
                str_table_content += '<td class="border_thin" style="border:1px solid black">' + detail.content + '</td>'
                str_table_content += '<td class="border_thin" style="border:1px solid black">' + "{:,}".format(int(detail.unit_price)) +'</td>'
                str_table_content += '<td class="border_thin" style="border:1px solid black">' + detail.quantity + '</td>'
                str_table_content += '<td class="border_thin" style="border:1px solid black">' + "{:,}".format(int(detail.cost)) + '</td>'
                str_table_content += '<td class="border_thin" style="border:1px solid black">' + detail.note + '</td>'
                str_table_content += '</tr><tr>'

                sum_unit_price += int(detail.unit_price)
                sum_cost += int(detail.cost)
                total_amount += int(detail.cost)

            str_table_content += '<td colspan="2" class="bg_gray border_thin b" style="border:1px solid black; font-weight:700;background-color:rgb(242,242,242);">소계</td>'
            str_table_content += '<td class="bg_gray border_thin b" style="border:1px solid black; background-color:rgb(242,242,242);">' + "{:,}".format(sum_unit_price) + '</td>'
            str_table_content += '<td class="bg_gray border_thin b" style="border:1px solid black; background-color:rgb(242,242,242);"></td>'
            str_table_content += '<td class="bg_gray border_thin b" style="border:1px solid black; background-color:rgb(242,242,242);">' + "{:,}".format(sum_cost) +'</td>'
            str_table_content += '<td class="bg_gray border_thin b" style="border:1px solid black; background-color:rgb(242,242,242);"></td>'
            str_table_content += '</tr>'

    paid_by = estimate.paid_by
    if paid_by == 'VND':
        paid_by = '&#8363;'
    elif paid_by == 'USD':
        paid_by = '&#36;'
    elif paid_by == 'KWN':
        paid_by = '&#8361;'

    str_table_content += '<tr>'
    str_table_content += '<td colspan="2" class="bg_gray border_thin b" style="border:1px solid black; background-color:rgb(242,242,242);">총금액</td>'
    str_table_content += '<td class="bg_gray border_thin b" style="border:1px solid black; background-color:rgb(242,242,242);"></td>'
    str_table_content += '<td class="bg_gray border_thin b" style="border:1px solid black; background-color:rgb(242,242,242);"></td>'
    str_table_content += '<td class="bg_gray border_thin b" style="border:1px solid black; background-color:rgb(242,242,242);">' + paid_by +" {:,}".format(total_amount) + '</td>'
    str_table_content += '<td class="bg_gray border_thin b" style="border:1px solid black; background-color:rgb(242,242,242);"></td>'
    str_table_content += '</tr>'
           

    context= {
            'title':estimate.title,
            'recipient':estimate.recipient,
            'date':date[0] + ' 년 ' + date[1] + ' 월 ' + date[2] + ' 일',
            'paid_by':estimate.paid_by,
            'str_table_content':str_table_content,
            'remark':estimate.remark,

            'is_email':True,
        }

    html_message = loader.render_to_string(
            'Form/Estimate_Sheet_print.html',
            context,
            #context_instance=RequestContext(request)
        )
    

    #result = send_mail(
    #'견적서',
    #'',
    #from_email=estimate.in_charge_email,
    #to=[estimate.email],
    #html_message = html_message,
    #)
    email = EmailMessage(
        estimate.title,
        html_message,
        from_email = estimate.in_charge_email,
        to=[estimate.email],
        )
    email.content_subtype = "html" 
    email.send()

    if estimate.is_sent == 'N':
        estimate.is_sent = 'Y'
        estimate.date_sent = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        estimate.save()





    return JsonResponse({
        'result':True,        
        })



@login_required
def project_management(request):


    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
        user_name = F('name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
        user_name = F('name_en')


    #구분
    list_type= []
    query_type= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_type:
        list_type.append({
            'id':data['code'],
            'name':data['name']
            })

    #상태
    list_status= []
    query_status= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_status:
        list_status.append({
            'id':data['code'],
            'name':data['name']
            })

        
    #결재
    list_approval= []
    query_approval= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='PROJECT_APPROVAL',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_approval:
        list_approval.append({
            'id':data['code'],
            'name':data['name']
            })

    ##비자 종류
    list_visa_type= []
    query_visa_type= COMMCODE.objects.filter( use_yn = 'Y', commcode_grp='PROJECT_VISA_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_visa_type:
        list_visa_type.append({
            'id':data['code'],
            'name':data['name']
            })

    ##서비스 종류
    list_service_type= []
    query_service_type= COMMCODE.objects.filter( use_yn = 'Y', commcode_grp='VISA_SERVICE_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_service_type:
        list_service_type.append({
            'id':data['code'],
            'name':data['name']
            })
        
    #담당자
    list_depart = []
    query_kbl_depart = COMMCODE.objects.filter( use_yn = 'Y', commcode_grp='DEPART_KBL',upper_commcode='000002').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_kbl_depart:
        list_depart.append( Q(**{'depart':data['code']} ) )

    list_depart.append( Q(**{'depart':'ADMIN_KBL'} ) )#관리자 계정
    list_in_charge = User.objects.filter(functools.reduce(operator.or_, list_depart),).annotate(name = user_name ).values('id','name')


    return render(request,
    'KBL/project_management.html',
            {
                'list_type':list_type,
                'list_status':list_status,
                'list_approval':list_approval,

                'list_visa_type':list_visa_type,
                'list_service_type':list_service_type,
                'file_form':board_file_form(),

                'list_in_charge':list_in_charge,
            },
        )



@login_required
def project_search(request):

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
        user_name = F('name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
        user_name = F('name_en')

    
    project_type=request.POST.get("project_type")
    project_status=request.POST.get("project_status")
    project_in_charge=request.POST.get("project_in_charge")
    expected_done=request.POST.get("expected_done")

    start=request.POST.get("start")
    end=request.POST.get("end")

    string=request.POST.get("string")


    start += ' 00:00:00'
    end += ' 23:59:59'

    kwargs = {}
    kwargs_exclude = {}
    if expected_done == 'true':
        kwargs_exclude['progress'] = 'DONE'

    argument_list = [] 
    #if string != '':
    argument_list.append( Q(**{'customer_name__icontains':string} ) )
    argument_list.append( Q(**{'project_name__icontains':string} ) )

    if project_type != '':
        kwargs['type'] = project_type
    if project_status !='':
        kwargs['progress'] = project_status
    if project_in_charge !='':
        kwargs['in_charge'] = project_status

    

    datas = []
    query = Project_Manage.objects.filter(
        functools.reduce(operator.or_, argument_list),
        **kwargs,
        #start_date__range = (start, end), 
        date_register__range = (start, end), 
        use_yn = 'Y').exclude(**kwargs_exclude).order_by('-id')



    #분류
    project_type_dict = {}
    query_class= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_class:
        project_type_dict[ data['code'] ] = {
            'name':data['name']
            }

    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }

    #승인
    project_approval_dict = {}
    query_approval = COMMCODE.objects.filter( commcode_grp='PROJECT_APPROVAL',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_approval:
        project_approval_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }




    for data in query:
        #담당자
        in_charge1 = ''
        in_charge2 = ''
        in_charge3 = ''
        in_charge4 = ''
        if data.in_charge1 !='':
            in_charge1 = User.objects.filter(id = data.in_charge1).annotate(name = user_name ).values('id','name').first()
        if data.in_charge2 !='':
            in_charge2 = User.objects.filter(id = data.in_charge2).annotate(name = user_name ).values('id','name').first()
        if data.in_charge3 !='':
            in_charge3 = User.objects.filter(id = data.in_charge3).annotate(name = user_name ).values('id','name').first()
        if data.in_charge4 !='':
            in_charge4 = User.objects.filter(id = data.in_charge4).annotate(name = user_name ).values('id','name').first()

        datas.append({
            'id':data.id,
            'customer_name':data.customer_name,
            'customer_id':data.customer_id,
            'type':data.type,
            'project_name':data.project_name,
            'level':data.level,
            'priority':data.priority,
            'start_date':data.start_date[0:10],
            'end_date':data.end_date[0:10],
            'expected_date':data.expected_date[0:10],
            'progress':data.progress,
            'in_charge1':'' if in_charge1 is '' else in_charge1['name'],
            'in_charge2':'' if in_charge2 is '' else in_charge2['name'],
            'in_charge3':'' if in_charge3 is '' else in_charge3['name'],
            'in_charge4':'' if in_charge4 is '' else in_charge4['name'],
            #'in_charge_id':in_charge['id'],
            'approval':data.approval,
            'note':data.note,
            })


    page_context = request.POST.get('context_in_page',10) # 페이지 컨텐츠 
    page = request.POST.get('page',1)

    paginator = Paginator(datas, page_context)
    try:
        paging_data = paginator.page(page)
    except PageNotAnInteger:
        paging_data = paginator.page(1)
    except EmptyPage:
        paging_data = paginator.page(paginator.num_pages)


    context = {
            'datas':list(paging_data),
            'page_range_start':paging_data.paginator.page_range.start,
            'page_range_stop':paging_data.paginator.page_range.stop,
            'page_number':paging_data.number,
            'has_previous':paging_data.has_previous(),
            'has_next':paging_data.has_next(),


            'project_type_dict':project_type_dict,
            'project_status_dict':project_status_dict,
            'project_approval_dict':project_approval_dict,
            }



    return JsonResponse(context)





@login_required
def project_get(request):

    id=request.POST.get("id")

    project = Project_Manage.objects.get(id = id)

    alert_query = AlertLog.objects.filter(
            page_type="PROJECT",
            content_type="MAIN",
            content_id = id,
            user_id = request.user.id,
            )
    for alert in alert_query:
        alert.check_yn = 'Y'
        alert.save()



    return JsonResponse({

        "project_manage_company":project.customer_name,
        "project_manage_company_id":project.customer_id,
        "project_manage_type":project.type,
        "project_manage_project_name":project.project_name,
        "project_manage_level":project.level,
        "project_manage_priority":project.priority,
        "project_manage_date_start":project.start_date,
        "project_manage_date_end":project.end_date,
        "project_manage_date_expected":project.expected_date,
        "project_manage_progress":project.progress,
        "project_manage_in_charge1":project.in_charge1,
        "project_manage_in_charge2":project.in_charge2,
        "project_manage_in_charge3":project.in_charge3,
        "project_manage_in_charge4":project.in_charge4,
        "project_manage_approval":project.approval,
        "project_manage_note":project.note,

        })



@login_required
def project_save(request):

    id=request.POST.get("id")

    project_manage_company=request.POST.get("project_manage_company")
    project_manage_company_id=request.POST.get("project_manage_company_id")
    project_manage_type=request.POST.get("project_manage_type")
    project_manage_project_name=request.POST.get("project_manage_project_name")
    project_manage_level=request.POST.get("project_manage_level")
    project_manage_priority=request.POST.get("project_manage_priority")
    project_manage_date_start=request.POST.get("project_manage_date_start")
    project_manage_date_end=request.POST.get("project_manage_date_end")
    project_manage_date_expected=request.POST.get("project_manage_date_expected",'0000-00-00 00:00:00')
    project_manage_progress=request.POST.get("project_manage_progress")
    project_manage_in_charge1=request.POST.get("project_manage_in_charge1")
    project_manage_in_charge2=request.POST.get("project_manage_in_charge2")
    project_manage_in_charge3=request.POST.get("project_manage_in_charge3")
    project_manage_in_charge4=request.POST.get("project_manage_in_charge4")
    project_manage_approval=request.POST.get("project_manage_approval")
    project_manage_note=request.POST.get("project_manage_note")

    

    if id == '':
        project = Project_Manage()

        project.registrant = request.user.id
        project.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    else:
        project = Project_Manage.objects.get(id = id)


    project.customer_name = project_manage_company
    project.customer_id = project_manage_company_id
    project.type = project_manage_type
    project.project_name = project_manage_project_name
    project.level = project_manage_level
    project.priority = project_manage_priority
    project.start_date = project_manage_date_start
    project.end_date = project_manage_date_end
    project.expected_date = project_manage_date_expected
    project.progress = project_manage_progress
    project.in_charge1 = project_manage_in_charge1
    project.in_charge2 = project_manage_in_charge2
    project.in_charge3 = ''#project_manage_in_charge3
    project.in_charge4 = ''#project_manage_in_charge4
    project.approval = ''#project_manage_approval
    project.note = project_manage_note


    project.modifier = request.user.id
    project.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    project.save()


    #알람
    try:
        alert_query = AlertLog.objects.get(
            page_type="PROJECT",
            content_type="MAIN",
            content_id = id,
            )
    except AlertLog.DoesNotExist:
        alert_query = AlertLog(
            page_type="PROJECT",
            content_type="MAIN",
            content_id = id,
            creator = request.user.id,
            )

    #alert_query.pointed_date = def_date if expected_date == '' else expected_date
    alert_query.status=project_manage_progress

    if project_manage_in_charge1 == request.user.id:
        alert_query.user_id=request.user.id
    if project_manage_in_charge2 == request.user.id:
        alert_query.user_id=request.user.id

    if project_manage_date_expected == '':
        alert_query.pointed_date = '0000-00-00 00:00:00'
    else:
        alert_query.pointed_date = project_manage_date_expected
        
    alert_query.save()


    return JsonResponse({
        'result':True,        
        })



@login_required
def project_delete(request):

    id = request.POST.get("id")

    detail = Project_Manage.objects.get(id = id)
    detail.use_yn = 'N'

    detail.modifier = request.user.id
    detail.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    detail.save()



    alert_query = AlertLog.objects.filter(
        page_type="PROJECT",
        content_type="MAIN",
        content_id = id,
        )
    for data in alert_query:
        data.use_yn = 'N'
        data.save()



    return JsonResponse({
        'result':True,        
        })




@login_required
def detail_search(request):
    current_language = request.session[translation.LANGUAGE_SESSION_KEY]
    if current_language == 'ko':
         fname = F('commcode_name_ko')
    elif current_language == 'en':
        fname = F('commcode_name_en')
    elif current_language == 'vi':
        fname = F('commcode_name_vi')

    #set user data
    user_dict = {}
    users = User.objects.all()
    for user in users:
        user_dict.update({
            user.id : user.user_id,
            })


    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = fname ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }


    selected_project_id=request.POST.get("selected_project_id")
    
    kwargs = {}
    kwargs['project_id'] = selected_project_id

    datas = []
    query = Project_Manage_Detail.objects.filter(**kwargs,use_yn = 'Y').order_by('date_register')


    for data in query:
        is_file = Board_File.objects.filter(board_type='PROJECT_DTL',board_id = data.id ,is_KBL = 'Y',use_yn='Y').count()


        commnet_list = []
        comments = Project_Comment.objects.filter(
            content_type ='DETAIL',
            content_id = data.id,
            use_yn = 'Y',
            ).order_by('orderno')

        for comment in comments:
            in_charge = ''
            in_charge_id = ''
            status = ''
            status_id = ''


            if comment.in_charge != '':
                in_charge = User.objects.get(pk = comment.in_charge).user_id
                in_charge_id = int(comment.in_charge)
            if comment.progress != '':
                status = project_status_dict[comment.progress]
                status_id = comment.progress

            if comment.depth == 0:
                comment_top = comment.id



            commnet_list.append({
                'id':comment.id,
                'user_id':int(comment.creator),
                'user':user_dict[ int(comment.creator) ],
                'comment':comment.comment,
                'datetime':comment.created_date.strftime('%Y-%m-%d %H:%M'),
                'depth':comment.depth,

                'in_charge':in_charge,
                'in_charge_id':in_charge_id,
                'status':status, 
                'status_id':status_id,

                'comment_top':comment_top,

                'is_creator':True if request.user.id is int(comment.creator) else False,
                })

        
        datas.append({
            'id':data.id,
            
            "check":data.check,

            "type":data.type,
            "project_details":data.project_details,
            "note":data.note,
            'date':data.date,

            'is_file':is_file,
            'commnet_list':commnet_list,
            })

 
    context = {
            'datas':datas,
            'project_status_dict':project_status_dict,
            }

    return JsonResponse(context)


@login_required
def detail_save(request):

    id=request.POST.get("id")
    project_id=request.POST.get("project_id")

    detail_type=request.POST.get("detail_type")
    detail_project_details=request.POST.get("detail_project_details")
    detail_date=request.POST.get("detail_date")
    detail_note=request.POST.get("detail_note")

    if id == '':
        detail = Project_Manage_Detail()

        detail.registrant = request.user.id
        detail.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    else:
        detail = Project_Manage_Detail.objects.get(id = id)


    detail.project_id = project_id

    detail.type = detail_type
    detail.project_details = detail_project_details
    detail.note = detail_note
    detail.date = detail_date

    detail.modifier = request.user.id
    detail.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    detail.save()



    return JsonResponse({
        'result':True,        
        })



@login_required
def detail_get(request):

    id=request.POST.get("id")

    detail = Project_Manage_Detail.objects.get(id = id)


    return JsonResponse({
        'result':True,    
        

        "detail_type":detail.type,
        "detail_project_details":detail.project_details,
        "detail_note":detail.note,
        'detail_date':detail.date,


        })


@login_required
def detail_delete(request):

    id=request.POST.get("id")

    detail = Project_Manage_Detail.objects.get(id = id)
    detail.use_yn = 'N'

    detail.modifier = request.user.id
    detail.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    detail.save()


    return JsonResponse({
        'result':True,    
        })


@login_required
def detail_check(request):

    id = request.POST.get("id")
    checked = request.POST.get("checked")


    detail = Project_Manage_Detail.objects.get(id = id)
    detail.check = '1' if checked == 'true' else '0'

    detail.modifier = request.user.id
    detail.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    detail.save()


    return JsonResponse({
        'result':True,    
        })




@login_required
def add_comment(request):
    id = request.POST.get('comment_id','')

    content_id = request.POST.get('content_id')
    content_type = request.POST.get('content_type')
    comment = request.POST.get('comment','')


    upper_id = request.POST.get('upper_id','')
    top_id = request.POST.get('top_id','')


    select_user = request.POST.get('select_user','')
    #start_date = request.POST.get('start_date','0000-00-00 00:00:00')
    #expected_date = request.POST.get('expected_date','0000-00-00 00:00:00')
    #due_date = request.POST.get('due_date','0000-00-00 00:00:00')
    status = request.POST.get('status','')




    now = datetime.datetime.now()
    new_comment = Project_Comment() 

    if upper_id != '':#대댓글
        upper = Project_Comment.objects.get(pk = upper_id)
        new_comment.depth = upper.depth + 1
        
        try:
            check = Project_Comment.objects.filter(content_id = content_id, orderno__gt = upper.orderno, depth__lte = upper.depth,).order_by('orderno')[:1]
            
            new_comment.orderno = check[0].orderno
        except IndexError:
            check = Project_Comment.objects.filter(content_id = content_id, ).order_by('-orderno')[:1]
           
            new_comment.orderno = check[0].orderno + 1
        
    
        #저장 전 sequence 자리 비우기
        query_set = Project_Comment.objects.filter(content_id = content_id, orderno__gte = new_comment.orderno ,).order_by('orderno')
        
        for query in query_set:
            query.orderno += 1
            
            query.save()
    
        
        #Co-Board top 댓글
        if top_id != '':
            try:
                top_comment = Project_Comment.objects.get(pk=top_id)
    
                top_comment.in_charge = select_user
                top_comment.start_date = start_date
                top_comment.end_date = due_date
                top_comment.expected_date = expected_date
                top_comment.progress = status
                 
                top_comment.lastest_modifier = request.user.id
                top_comment.last_modified_date = datetime.datetime.now()
                top_comment.save()
                
            except Project_Comment.DoesNotExist:
                pass
    else:
        check = Project_Comment.objects.filter(content_id = content_id, ).order_by('orderno')
        
        def_date = '0000-00-00 00:00:00'
    
        if check.count() != 0: # 완전 처음이 아닐때 
            check_last = check.last()
            new_comment.orderno = check_last.orderno + 1


    new_comment.content_type = content_type
    new_comment.content_id = content_id
    new_comment.comment = comment
    new_comment.creator = request.user.id
    new_comment.in_charge = select_user
    #new_comment.start_date = start_date
    #new_comment.end_date = due_date
    #new_comment.expected_date = expected_date
    new_comment.progress = status

    new_comment.lastest_modifier = request.user.id
    new_comment.lastest_modified_date = now
    new_comment.save()


    
    #알람
    try:
        alert_query = AlertLog.objects.get(
            page_type="PROJECT",
            content_type="COMMENT",
            content_id = id,
            )
    except AlertLog.DoesNotExist:
        alert_query = AlertLog(
            page_type="PROJECT",
            content_type="COMMENT",
            content_id = id,
            )

    #alert_query.pointed_date = def_date if expected_date == '' else expected_date
    alert_query.status=status
    alert_query.user_id=select_user
    alert_query.save()



    return JsonResponse({
        'result':True,    
        })




@login_required
def get_commnet(request):
    current_language = request.session[translation.LANGUAGE_SESSION_KEY]
    if current_language == 'ko':
         fname = F('commcode_name_ko')
    elif current_language == 'en':
        fname = F('commcode_name_en')
    elif current_language == 'vi':
        fname = F('commcode_name_vi')

    #set user data
    user_dict = {}
    users = User.objects.all()
    for user in users:
        user_dict.update({
            user.id : user.user_id,
            })


    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = fname ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }



    type = request.POST.get('type','')
    content_id = request.POST.get('content_id','')

    comment_query = Project_Comment.objects.filter(
       content_id = content_id,
       content_type = type, 
       use_yn = 'Y',
        ).order_by('orderno')

    datas = []
    comment_top = 0
    for data in comment_query:
        in_charge = ''
        in_charge_id = ''
        status = ''
        status_id = ''


        if data.in_charge != '':
            in_charge = User.objects.get(pk = data.in_charge).user_id
            in_charge_id = int(data.in_charge)
        if data.progress != '':
            status = project_status_dict[data.progress]
            status_id = data.progress

        if data.depth == 0:
            comment_top = data.id
             
        datas.append({
            'id':data.id,
            'user_id':int(data.creator),
            'user':user_dict[ int(data.creator) ],
            'comment':data.comment,
            'datetime':data.created_date.strftime('%Y-%m-%d %H:%M'),
            'depth':data.depth,

            'in_charge':in_charge,
            'in_charge_id':in_charge_id,
            'status':status, 
            'status_id':status_id,

            'comment_top':comment_top,

            'is_creator':True if request.user.id is int(data.creator) else False,
            })


    alert_query = AlertLog.objects.filter(
            page_type="PROJECT",
            content_type="COMMENT",
            content_id = id,
            user_id = request.user.id,
        )
    for alert in alert_query:
        alert.check_yn = 'Y'
        alert.save()

    return JsonResponse({
        'result':True,    
        'datas':datas,
        })



@login_required
def edit_comment(request):
    id = request.POST.get('id')
    comment = request.POST.get('comment')

    top_id = request.POST.get('top_id')
    select_user = request.POST.get('select_user')
    status = request.POST.get('status')


    try:
        query = Project_Comment.objects.get(id = id)

        query.comment =comment
        query.lastest_modifier = request.user.id
        query.lastest_modified_date = datetime.datetime.now()
        query.save()

        
        top_query = Project_Comment.objects.get(id = top_id)
        top_query.progress = status
        top_query.select_user = select_user
        top_query.lastest_modifier = request.user.id
        top_query.lastest_modified_date = datetime.datetime.now()
        top_query.save()
        
    except Project_Comment.DoesNotExist:
        pass


    #알람
    try:
        alert_query = AlertLog.objects.get(
            page_type="PROJECT",
            content_type="COMMENT",
            content_id = id,
            )
    except AlertLog.DoesNotExist:
        alert_query = AlertLog(
            page_type="PROJECT",
            content_type="COMMENT",
            content_id = id,
            )

    #alert_query.pointed_date = def_date if expected_date == '' else expected_date
    alert_query.status=status
    alert_query.user_id=select_user
    alert_query.save()


    return JsonResponse({
        'result':True,
        })




@login_required
def delete_comment(request):
    id = request.POST.get('id')

    try:
        query = Project_Comment.objects.get(id = id)
        query.use_yn ='N'
        query.lastest_modifier = request.user.id
        query.lastest_modified_date = datetime.datetime.now()
        query.save()

    except Project_Comment.DoesNotExist:
        pass

    #알람
    try:
        alert_query = AlertLog.objects.get(
            page_type="PROJECT",
            content_type="COMMENT",
            content_id = id,
            )
    except AlertLog.DoesNotExist:
        alert_query = AlertLog(
            page_type="PROJECT",
            content_type="COMMENT",
            content_id = id,
            )


    alert_query.use_yn = 'N'
    alert_query.save()



    return JsonResponse({
        'result':True,
        })



@login_required
def work_permit(request):

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')

    #상태
    list_project_status= []
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_status:
        list_project_status.append({
            'code':data['code'],
            'name':data['name']
            })


    return render(request,
    'KBL/work_permit.html',
            {
                'list_project_status':list_project_status,
            },
        )



@login_required
def work_permit_list_search(request):

    
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')


    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }



    start=request.POST.get("start")
    end=request.POST.get("end")

    wp_status=request.POST.get("wp_status")
    wp_date_type=request.POST.get("wp_date_type")
    string=request.POST.get("string")

    if wp_date_type == 'date_register':
        start += ' 00:00:00'
        end += ' 23:59:59'

    kwargs = {}
    kwargs[wp_date_type + '__gte'] = start
    kwargs[wp_date_type + '__lte'] = end
    
    if wp_status != '':
        kwargs['status']=wp_status

    argument_list = []
    argument_list.append( Q(**{'company_name__icontains':string} ) )
    argument_list.append( Q(**{'employee_name__icontains':string} ) )

    datas = []
    query = Work_Permit_Manage.objects.filter(
        functools.reduce(operator.or_, argument_list),
        **kwargs,
        use_yn = 'Y'
        ).order_by('-date_register')


    for data in query:

        employee = Customer_Employee.objects.get(id = data.employee_id)

        is_file = Board_File.objects.filter(board_type='WORK_PERMIT',board_id = data.id ,is_KBL = 'Y',use_yn='Y').count()
        
        datas.append({
            'id':data.id,
            
            "status":data.status,
            "company_id":data.company_id,
            "company_name":data.company_name,
            "employee_id":data.employee_id,
            "employee":data.employee_name,
            'position':employee.position,
            'requiredment':data.requiredment,
            "EA_application_date":data.EA_application_date,
            "EA_exp_date":data.EA_exp_date,
            "WP_application_date":data.WP_application_date,
            "WP_exp_date":data.WP_exp_date,
            "expected_date":data.expected_date,
            "note":data.note,

            'is_file':is_file,
            })


 
    page_context = request.POST.get('page_context',10) # 페이지 컨텐츠 
    page = request.POST.get('page',1)

    paginator = Paginator(datas, page_context)
    try:
        paging_data = paginator.page(page)
    except PageNotAnInteger:
        paging_data = paginator.page(1)
    except EmptyPage:
        paging_data = paginator.page(paginator.num_pages)


    context = {
            'datas':list(paging_data),
            'page_range_start':paging_data.paginator.page_range.start,
            'page_range_stop':paging_data.paginator.page_range.stop,
            'page_number':paging_data.number,
            'has_previous':paging_data.has_previous(),
            'has_next':paging_data.has_next(),

            'project_status_dict':project_status_dict,

            }



    return JsonResponse(context)



@login_required
def work_permit_search(request):

    
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')

    #set user data
    user_dict = {}
    users = User.objects.all()
    for user in users:
        user_dict.update({
            user.id : user.user_id,
            })

    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }





    selected_project_id=request.POST.get("selected_project_id")

    kwargs = {}
    kwargs['project_id'] = selected_project_id

    datas = []
    query = Work_Permit_Manage.objects.filter(**kwargs,use_yn = 'Y').order_by('-date_register')


    for data in query:

        employee = Customer_Employee.objects.get(id = data.employee_id)

        is_file = Board_File.objects.filter(board_type='WORK_PERMIT',board_id = data.id ,is_KBL = 'Y',use_yn='Y').count()


        commnet_list = []
        comments = Project_Comment.objects.filter(
            content_type ='WP',
            content_id = data.id,
            use_yn = 'Y',
            ).order_by('orderno')

        for comment in comments:
            in_charge = ''
            in_charge_id = ''
            status = ''
            status_id = ''


            if comment.in_charge != '':
                in_charge = User.objects.get(pk = comment.in_charge).user_id
                in_charge_id = int(comment.in_charge)
            if comment.progress != '':
                status = project_status_dict[comment.progress]
                status_id = comment.progress

            if comment.depth == 0:
                comment_top = comment.id



            commnet_list.append({
                'id':comment.id,
                'user_id':int(comment.creator),
                'user':user_dict[ int(comment.creator) ],
                'comment':comment.comment,
                'datetime':comment.created_date.strftime('%Y-%m-%d %H:%M'),
                'depth':comment.depth,

                'in_charge':in_charge,
                'in_charge_id':in_charge_id,
                'status':status, 
                'status_id':status_id,

                'comment_top':comment_top,

                'is_creator':True if request.user.id is int(comment.creator) else False,
                })


        datas.append({
            'id':data.id,
            
            "status":data.status,
            "employee_id":data.employee_id,
            "employee":data.employee_name,
            'position':employee.position,
            'requiredment':data.requiredment,
            "EA_application_date":data.EA_application_date,
            "EA_exp_date":data.EA_exp_date,
            "WP_application_date":data.WP_application_date,
            "WP_exp_date":data.WP_exp_date,
            "expected_date":data.expected_date,
            "note":data.note,

            'is_file':is_file,
            'commnet_list':commnet_list,
            })


 
    context = {
            'datas':datas,

            'project_status_dict':project_status_dict,
            }



    return JsonResponse(context)




@login_required
def work_permit_save(request):


    id=request.POST.get("id")
    project_id=request.POST.get("project_id")


    wp_company_name=request.POST.get("wp_company_name")
    wp_company_id=request.POST.get("wp_company_id")
    wp_employee_name=request.POST.get("wp_employee_name")
    wp_employee_id=request.POST.get("wp_employee_id")
    wp_EA_application_date=request.POST.get("wp_EA_application_date",'')
    wp_EA_exp_date=request.POST.get("wp_EA_exp_date",'')
    wp_application_date=request.POST.get("wp_application_date",'')
    wp_WP_exp_date=request.POST.get("wp_WP_exp_date",'')
    wp_exp_date=request.POST.get("wp_exp_date",'')
    wp_requirement=request.POST.get("wp_requirement",'')
    wp_note=request.POST.get("wp_note",'')
    wp_status=request.POST.get("wp_status",'')

    
    if id == '':
        wp = Work_Permit_Manage()

        wp.registrant = request.user.id
        wp.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    else:
        wp = Work_Permit_Manage.objects.get(id = id)


    wp.project_id = project_id

    wp.company_id = wp_company_id
    wp.company_name = wp_company_name
    wp.employee_id = wp_employee_id
    wp.employee_name = wp_employee_name

    wp.EA_application_date = wp_EA_application_date
    wp.EA_exp_date = wp_EA_exp_date
    wp.WP_application_date = wp_application_date
    wp.WP_exp_date = wp_WP_exp_date
    wp.expected_date = wp_exp_date
    wp.requiredment = wp_requirement
    wp.note = wp_note
    wp.status = wp_status

    wp.modifier = request.user.id
    wp.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    wp.save()



    return JsonResponse({
        'result':True,        
        })


@login_required
def work_permit_get(request):

    id=request.POST.get("id")


    wp = Work_Permit_Manage.objects.get(id = id)


    return JsonResponse({
        'result':True,    
        

        "wp_status":wp.status,
        "wp_company_id":wp.company_id,
        "wp_company_name":wp.company_name,
        "wp_employee_id":wp.employee_id,
        "wp_employee":wp.employee_name,
        'wp_requiredment':wp.requiredment,
        "wp_EA_application_date":wp.EA_application_date,
        "wp_EA_exp_date":wp.EA_exp_date,
        "wp_WP_application_date":wp.WP_application_date,
        "wp_WP_exp_date":wp.WP_exp_date,
        "wp_expected_date":wp.expected_date,
        "wp_note":wp.note,


        })


@login_required
def work_permit_delete(request):

    id=request.POST.get("id")


    wp = Work_Permit_Manage.objects.get(id = id)
    wp.use_yn = 'N'

    wp.modifier = request.user.id
    wp.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    wp.save()

    return JsonResponse({
        'result':True,    


        })



@login_required
def visa_management(request):
    
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')

    #상태
    list_project_status= []
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_status:
        list_project_status.append({
            'code':data['code'],
            'name':data['name']
            })
    
    ##비자 종류
    list_visa_type= []
    query_visa_type= COMMCODE.objects.filter( use_yn = 'Y', commcode_grp='PROJECT_VISA_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_visa_type:
        list_visa_type.append({
            'code':data['code'],
            'name':data['name']
            })



    return render(request,
    'KBL/visa_management.html',
            {
                'list_project_status':list_project_status,
                'list_visa_type':list_visa_type,
            },
        )

def visa_list_search(request):
    
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')



    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }


    start=request.POST.get("start")
    end=request.POST.get("end")

    visa_type=request.POST.get("visa_type")
    visa_status=request.POST.get("visa_status")
    string=request.POST.get("string")

    kwargs = {}
    if visa_type != '':
        kwargs['type'] = visa_type
    if visa_status != '':
        kwargs['status'] = visa_status


    argument_list = []
    argument_list.append( Q(**{'company_name__icontains':string} ) )
    argument_list.append( Q(**{'employee_name__icontains':string} ) )

    start += ' 00:00:00'
    end += ' 23:59:59'
    

    datas = []

    ##일반
    query = Visa_Manage.objects.filter(
        functools.reduce(operator.or_, argument_list),
        **kwargs,
        date_register__range = (start,end),
        use_yn = 'Y',
        ).order_by('-emergency','-date_register')


    for data in query:

        is_file = Board_File.objects.filter(board_type='WORK_PERMIT',board_id = data.id ,is_KBL = 'Y',use_yn='Y').count()

        datas.append({
            'id':data.id,
            
            "status":data.status,
            "company":data.company_name,
            "employee_id":data.employee_id,
            "employee":data.employee_name,
            "granted_company":data.granted_company,
            "date_receipt_application":data.date_receipt_application,
            "type":data.type,
            "date_entry":data.date_entry,
            "date_receipt_doc":data.date_receipt_doc,
            "date_subbmit_doc":data.date_subbmit_doc,
            "date_expected":data.date_expected,

            "emergency":data.emergency,

            'is_file':is_file,
            })


 
        
    page_context = request.POST.get('page_context',10) # 페이지 컨텐츠 
    page = request.POST.get('page',1)

    paginator = Paginator(datas, page_context)
    try:
        paging_data = paginator.page(page)
    except PageNotAnInteger:
        paging_data = paginator.page(1)
    except EmptyPage:
        paging_data = paginator.page(paginator.num_pages)


    context = {
            'datas':list(paging_data),
            'page_range_start':paging_data.paginator.page_range.start,
            'page_range_stop':paging_data.paginator.page_range.stop,
            'page_number':paging_data.number,
            'has_previous':paging_data.has_previous(),
            'has_next':paging_data.has_next(),

            'project_status_dict':project_status_dict,

            }



    return JsonResponse(context)


@login_required
def visa_search(request):


    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')


    user_dict = {}
    users = User.objects.all()
    for user in users:
        user_dict.update({
            user.id : user.user_id,
            })

    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }







    selected_project_id=request.POST.get("selected_project_id")

    kwargs = {}
    kwargs['project_id'] = selected_project_id

    datas = []
    query = Visa_Manage.objects.filter(**kwargs,use_yn = 'Y').order_by('-emergency')


    for data in query:

        is_file = Board_File.objects.filter(board_type='VISA',board_id = data.id ,is_KBL = 'Y',use_yn='Y').count()
        commnet_list = []
        comments = Project_Comment.objects.filter(
            content_type ='VISA',
            content_id = data.id,
            use_yn = 'Y',
            ).order_by('orderno')

        for comment in comments:
            in_charge = ''
            in_charge_id = ''
            status = ''
            status_id = ''


            if comment.in_charge != '':
                in_charge = User.objects.get(pk = comment.in_charge).user_id
                in_charge_id = int(comment.in_charge)
            if comment.progress != '':
                status = project_status_dict[comment.progress]
                status_id = comment.progress

            if comment.depth == 0:
                comment_top = comment.id



            commnet_list.append({
                'id':comment.id,
                'user_id':int(comment.creator),
                'user':user_dict[ int(comment.creator) ],
                'comment':comment.comment,
                'datetime':comment.created_date.strftime('%Y-%m-%d %H:%M'),
                'depth':comment.depth,

                'in_charge':in_charge,
                'in_charge_id':in_charge_id,
                'status':status, 
                'status_id':status_id,

                'comment_top':comment_top,

                'is_creator':True if request.user.id is int(comment.creator) else False,
                })

        datas.append({
            'id':data.id,
            
            "status":data.status,
            "company":data.company_name,
            "employee_id":data.employee_id,
            "employee":data.employee_name,
            "granted_company":data.granted_company,
            "date_receipt_application":data.date_receipt_application,
            "type":data.type,
            "service_type":data.service_type,
            "date_entry":data.date_entry,
            "date_receipt_doc":data.date_receipt_doc,
            "date_subbmit_doc":data.date_subbmit_doc,
            "date_expected":data.date_expected,

            "emergency":data.emergency,

            'is_file':is_file,
            'commnet_list':commnet_list,
            })
         
    context = {
            'datas':datas,

            'project_status_dict':project_status_dict,
            }



    return JsonResponse(context)







@login_required
def visa_save(request):

    id=request.POST.get("id")

    project_id=request.POST.get("project_id")

    visa_company_id=request.POST.get("visa_company_id")
    visa_company=request.POST.get("visa_company")
    visa_employee_id=request.POST.get("visa_employee_id")
    visa_employee=request.POST.get("visa_employee")
    visa_granted_company=request.POST.get("visa_granted_company")
    visa_type=request.POST.get("visa_type")
    visa_service_type=request.POST.get("visa_service_type")
    visa_date_entry=request.POST.get("visa_date_entry")
    visa_date_receipt_application=request.POST.get("visa_date_receipt_application")
    visa_date_receipt_doc=request.POST.get("visa_date_receipt_doc")
    visa_date_subbmit_doc=request.POST.get("visa_date_subbmit_doc")
    visa_date_expected=request.POST.get("visa_date_expected")
    visa_date_ordered=request.POST.get("visa_date_ordered")
    visa_application_status=request.POST.get("visa_application_status")
    visa_emergency=request.POST.get("visa_emergency")
    visa_status=request.POST.get("visa_status")


    if id == '':
        visa = Visa_Manage()

        visa.registrant = request.user.id
        visa.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    else:
        visa = Visa_Manage.objects.get(id = id)

    print(visa_service_type)
    visa.project_id = project_id

    visa.company_id = visa_company_id
    visa.company_name = visa_company
    visa.employee_id = visa_employee_id
    visa.employee_name = visa_employee
    visa.granted_company = visa_granted_company
    visa.type = visa_type
    visa.service_type = visa_service_type
    visa.date_entry = visa_date_entry
    visa.date_receipt_application = visa_date_receipt_application
    visa.date_receipt_doc = visa_date_receipt_doc
    visa.date_subbmit_doc = visa_date_subbmit_doc
    visa.date_expected = visa_date_expected
    visa.date_ordered = visa_date_ordered
    visa.application_status = visa_application_status
    visa.emergency = visa_emergency
    visa.status = visa_status

    visa.modifier = request.user.id
    visa.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    visa.save()


    return JsonResponse({
        'result':True,        
        })

@login_required
def visa_get(request):
    
    id=request.POST.get("id")


    visa = Visa_Manage.objects.get(id = id)


    return JsonResponse({
        'result':True,    
        

        "visa_company_id":visa.company_id,
        "visa_company":visa.company_name,
        "visa_employee_id":visa.employee_id,
        "visa_employee":visa.employee_name,
        "visa_granted_company":visa.granted_company,
        "visa_type":visa.type,
        "visa_service_type":visa.service_type,
        "visa_date_entry":visa.date_entry,
        "visa_date_receipt_application":visa.date_receipt_application,
        "visa_date_receipt_doc":visa.date_receipt_doc,
        "visa_date_subbmit_doc":visa.date_subbmit_doc,
        "visa_date_expected":visa.date_expected,
        "visa_date_ordered":visa.date_ordered,
        "visa_application_status":visa.application_status,
        "visa_emergency":visa.emergency,
        "visa_status":visa.status,



        })



@login_required
def visa_delete(request):

    id=request.POST.get("id")
    visa = Visa_Manage.objects.get(id = id)
    visa.use_yn = 'N'

    visa.modifier = request.user.id
    visa.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    visa.save()


    return JsonResponse({
        'result':True,        
        })


@login_required
def scheduler(request):

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
    

    project_type = []
    project_type_query = COMMCODE.objects.filter(use_yn = 'Y', commcode_grp='PROJECT_TYPE',upper_commcode ='000010' ).annotate(code = F('commcode') ,name = f_name ).values('code','name')

    for data in project_type_query:
        project_type.append({ 
            'code':data['code'],
            'name':data['name'],
            })


    today_year = datetime.datetime.now().year
    today_month= datetime.datetime.now().month




    return render(request,
    'KBL/scheduler.html',
            {
                'today_year':today_year,
                'today_month':today_month,

                'project_type_query':project_type_query,
            },
        )


@login_required
def scheduler_events(request):

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'), name = f_name).values('code','se1','name')
    for data in query_status:
        project_status_dict[ data['code'] ] ={
           'class':data['se1'],
           'code':data['code'],
           'name':data['name'],
           }

    #프로젝트 구분
    project_type_dict = {}
    query_type= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name).values('code','name')
    for data in query_type:
        project_type_dict[ data['code'] ] = {
           'code':data['code'],
           'name':data['name'],
           }


    date_start = request.POST.get('date_start').split('T')[0]
    date_end = request.POST.get('date_end').split('T')[0]


    filter_type = request.POST.get('filter_type')

    kwargs = {}
    if filter_type!='':
        kwargs['type'] = filter_type # 기본 



    query = Project_Manage.objects.filter(
            **kwargs ,
            start_date__range = (date_start, date_end)
        ).exclude(
            use_yn='N'
        ).prefetch_related(
            'project_manage_detail_set',
            'visa_manage_set',
            'work_permit_manage_set',
            )

    #배경
    back_color_visa = 'rgb(254,154,202)'
    back_color_wp = 'rgb(183, 164, 210)'
    back_color_etc = 'rgb(147, 203, 249)'

    list_project = []
    for data in query:


        ##상태값
        #if data.progress == 'SUBMIT':
        #    status_dot = '<span class="' + project_status_dict[data.progress]+'"> </span>'
        #elif data.type == 'INPROGRESS':
        #    status_dot = 'rgb(254,154,202)'
        #elif data.type == 'CANCEL':
        #    status_dot = 'rgb(254,154,202)'
        #elif data.type == 'PENDING':
        #    status_dot = 'rgb(254,154,202)'
        #elif data.type == 'DONE':
        #    status_dot = 'rgb(183, 164, 210)'
        #else:
        #    status_dot = 'rgb(147, 203, 249)'


        

        list_detail = data.project_manage_detail_set.filter(use_yn = 'Y')
        for detail in list_detail:
            if detail.date != '':
                list_project.append({
                    'project_id':data.id,
                    'detail_id':detail.id,
                    'start':detail.date[0:10],
                    'title':data.customer_name + ' - ' + detail.project_details,

                    'backgroundColor':back_color_etc,
                    'borderColor':back_color_etc,
                    })

        list_visa = data.visa_manage_set.filter(use_yn = 'Y')
        for visa in list_visa:
            #입국일
            if visa.date_entry != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':visa.id,
                    'start':visa.date_entry[0:10],
                    'title':data.customer_name + '(' + visa.employee_name +') - ' + _('Entry Date'),

                    'backgroundColor':back_color_visa,
                    'borderColor':back_color_visa,
                    })
            #서류 수령일
            if visa.date_receipt_doc != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':visa.id,
                    'start':visa.date_receipt_doc[0:10],
                    'title':data.customer_name + '(' + visa.employee_name +') - ' + _('Document Recepted Date'),

                    'backgroundColor':back_color_visa,
                    'borderColor':back_color_visa,
                    })
            #서류 접수일
            if visa.date_subbmit_doc != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':visa.id,
                    'start':visa.date_subbmit_doc[0:10],
                    'title':data.customer_name + '(' + visa.employee_name +') - ' + _('Document Submit Date'),

                    'backgroundColor':back_color_visa,
                    'borderColor':back_color_visa,
                    })
            #결과 예정일
            if visa.date_expected != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':visa.id,
                    'start':visa.date_expected[0:10],
                    'title':data.customer_name + '(' + visa.employee_name +') - ' + _('Expected Date'),

                    'backgroundColor':back_color_visa,
                    'borderColor':back_color_visa,
                    })
            #결과 예정일
            if visa.date_expected != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':visa.id,
                    'start':visa.date_expected[0:10],
                    'title':data.customer_name + '(' + visa.employee_name +') - ' + _('Expected Date'),

                    'backgroundColor':back_color_visa,
                    'borderColor':back_color_visa,
                    })
            #결과 예정일
            if visa.date_ordered != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':visa.id,
                    'start':visa.date_ordered[0:10],
                    'title':data.customer_name + '(' + visa.employee_name +') - ' + _('Ordered Date'),

                    'backgroundColor':back_color_visa,
                    'borderColor':back_color_visa,
                    })

        list_wp= data.work_permit_manage_set.filter(use_yn = 'Y')
        for wp in list_wp:
            #채용수요승인서 신청일
            if wp.EA_application_date != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':wp.id,
                    'start':wp.EA_application_date[0:10],
                    'title':data.customer_name + '(' + wp.employee_name +') - ' + _('EA Application Date'),

                    'backgroundColor':back_color_wp,
                    'borderColor':back_color_wp,
                    })

            #채용수요승인서 결과 예정일
            if wp.EA_exp_date != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':wp.id,
                    'start':wp.EA_exp_date[0:10],
                    'title':data.customer_name + '(' + wp.employee_name +') - ' + _('EA Expected Date'),

                    'backgroundColor':back_color_wp,
                    'borderColor':back_color_wp,
                    })

            #노동허가서 접수일
            if wp.WP_application_date != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':wp.id,
                    'start':wp.WP_application_date[0:10],
                    'title':data.customer_name + '(' + wp.employee_name +') - ' + _('WP Application Date'),

                    'backgroundColor':back_color_wp,
                    'borderColor':back_color_wp,
                    })

            #노동허가서 결과 예정일
            if wp.WP_exp_date != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':wp.id,
                    'start':wp.WP_exp_date[0:10],
                    'title':data.customer_name + '(' + wp.employee_name +') - ' + _('WP Expected Date'),

                    'backgroundColor':back_color_wp,
                    'borderColor':back_color_wp,
                    })

            #노동허가서 결과 예정일
            if wp.expected_date != '':
                list_project.append({
                    'project_id':data.id,
                    'visa_id':wp.id,
                    'start':wp.expected_date[0:10],
                    'title':data.customer_name + '(' + wp.employee_name +') - ' + _('Expected Date'),

                    'backgroundColor':back_color_wp,
                    'borderColor':back_color_wp,
                    })

        #list_project.append({
        #    'id':data.id,
        #    'start':data.start_date[0:10],
        #    'end':data.expected_date[0:10] if data.end_date == '' else data.end_date[0:10],
        #    'title':'<span></span>' + data.customer_name + ' - ' + data.project_name ,
        #
        #    'backgroundColor':back_color,
        #    'borderColor':back_color,
        #    })

        #list_project.append({
        #    'id':count,
        #    'start':tmp_date.strftime('%Y-%m-%d'),
        #    'title':'Amount : ' + str(0 if date_query['total_price'] is None else "{:,}".format(date_query['total_price'])) + " VND",
        #    'backgroundColor':'rgb(254,154,202)',
        #    'borderColor':'rgb(254,154,202)',
        #    })


    return JsonResponse({
        'result':True,
        'list_project':list_project,
        })






@login_required
def document_management(request):

    return render(request,
    'KBL/document_management.html',
            {
                'file_form':board_file_form(),
            },
        )



@login_required
def document_search(request):


    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')


    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }



    kwargs = {}

    datas = []
    query = Board_File.objects.filter(**kwargs,use_yn = 'Y',is_KBL = 'Y')


    for data in query:

        type2 = ''
        if data.board_type == 'CRM_COMPANY':
            sub_query = Customer_Company.objects.get(id=data.board_id)
            type2 = sub_query.name_eng
        elif data.board_type == 'CRM_EMPLOYEE':
            employee_query = Customer_Employee.objects.get(id=data.board_id)
            company_query = Customer_Company.objects.get(id=employee_query.company_id)
            type2 = company_query.name_eng + '\n( ' + employee_query.name_eng + ' )'
        elif data.board_type == 'WORK_PERMIT':
            employee_query = Customer_Employee.objects.get(id=data.employee_id)
            company_query = Customer_Company.objects.get(id=data.company_id)
            type2 = company_query.name_eng + '\n( ' + employee_query.name_eng + ' )'

        datas.append({
            'id':data.id,
            
            'document_name':data.title,
            'board_type':data.board_type,
            'type_detail':type2,

            'user':data.user,

            'document_url':data.file.url,

            'registered_date':data.registered_date.strftime('%Y-%m-%d'),
            'board_type':data.board_type,


            })


 
    page_context = request.POST.get('page_context',10) # 페이지 컨텐츠 
    page = request.POST.get('page',1)

    paginator = Paginator(datas, page_context)
    try:
        paging_data = paginator.page(page)
    except PageNotAnInteger:
        paging_data = paginator.page(1)
    except EmptyPage:
        paging_data = paginator.page(paginator.num_pages)


    context = {
            'datas':list(paging_data),
            'page_range_start':paging_data.paginator.page_range.start,
            'page_range_stop':paging_data.paginator.page_range.stop,
            'page_number':paging_data.number,
            'has_previous':paging_data.has_previous(),
            'has_next':paging_data.has_next(),

            

            }



    return JsonResponse(context)




@login_required
def audit_management(request):

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
        user_name = F('name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
        user_name = F('name_en')

    #프로젝트 구분
    list_project_type = []
    query_type= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name).values('code','name')
    for data in query_type:
        list_project_type.append({
           'code':data['code'],
           'name':data['name'],
           })

    
    #상태
    list_project_status= []
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_status:
        list_project_status.append({
            'code':data['code'],
            'name':data['name']
            })

    #담당자 - KBL
    list_depart = []
    query_kbl_depart = COMMCODE.objects.filter( use_yn = 'Y', commcode_grp='DEPART_KBL',upper_commcode='000002').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_kbl_depart:
        list_depart.append( Q(**{'depart':data['code']} ) )

    list_in_charge = User.objects.filter(functools.reduce(operator.or_, list_depart),).annotate(name = user_name ).values('id','name')

    return render(request,
    'KBL/audit_management.html',
            {
                'list_project_type':list_project_type,
                'list_project_status':list_project_status,
                'list_in_charge':list_in_charge,
            },
        )



@login_required
def audit_search(request):
    
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
        user_name = F('name_en')


    #상태
    project_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='PROJECT_STATUS',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        project_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }

    #상태
    project_type_dict = {}
    query_type= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_type:
        project_type_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }

    
    type=request.POST.get("audit_type")
    in_charge=request.POST.get("audit_in_charge")
    status=request.POST.get("audit_status")

    start=request.POST.get("start")
    end=request.POST.get("end")
    string=request.POST.get("string")




    start += ' 00:00:00'
    end += ' 23:59:59'

    kwargs = {}
    argument_list = [] 


    if type != '':
        kwargs['type'] = type
    if status != '':
        kwargs['status'] = status

    argument_list.append( Q(**{'company_name__icontains':string} ) )
    argument_list.append( Q(**{'title__icontains':string} ) )


    datas = []
    query = Audit_Manage.objects.filter(
        functools.reduce(operator.or_, argument_list),
        **kwargs,
        date_register__range = (start, end) 
        ,use_yn = 'Y').order_by('-date_register')
    

    for data in query:

        if data.check_in_charge == '0000-00-00':
            in_charge = None
        else:
            in_charge = data.check_in_charge[0:10]

        if data.check_leader == '0000-00-00':
            leader = None
        else:
            leader = data.check_leader[0:10]

        if data.check_account == '0000-00-00':
            accounting = None
        else:
            accounting = data.check_account[0:10]

        if data.check_ceo == '0000-00-00':
            ceo = None
        else:
            ceo = data.check_ceo[0:10]

           
        #담당자
        if data.in_charge == '':
            in_charge_name =''
        else:
            in_charge_user= User.objects.get(id = data.in_charge,)
            if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
                in_charge_name = in_charge_user.name_ko
            elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
                in_charge_name = in_charge_user.name_vi
            elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
                in_charge_name = in_charge_user.name_en

        datas.append({
            'id':data.id,
            
            "company_id":data.company_id,
            "company_name":data.company_name,
            "type":data.type,
            "title":data.title,
            "service_fee":data.service_fee,
            "quantity":data.quantity,
            "service_fee_vat":data.service_fee_vat,
            "service_fee_total":data.service_fee_total,
            "paid":data.paid,
            "date_paid":data.date_paid,
            "in_charge":in_charge_name,

            "check_in_charge":in_charge,
            "check_leader":leader,
            "check_account":accounting,
            "check_ceo":ceo,

            "status":data.status,

            "invoice":data.invoice,

            })


 
    page_context = request.POST.get('page_context',10) # 페이지 컨텐츠 
    page = request.POST.get('page',1)

    paginator = Paginator(datas, page_context)
    try:
        paging_data = paginator.page(page)
    except PageNotAnInteger:
        paging_data = paginator.page(1)
    except EmptyPage:
        paging_data = paginator.page(paginator.num_pages)


    context = {
            'datas':list(paging_data),
            'page_range_start':paging_data.paginator.page_range.start,
            'page_range_stop':paging_data.paginator.page_range.stop,
            'page_number':paging_data.number,
            'has_previous':paging_data.has_previous(),
            'has_next':paging_data.has_next(),

           'project_type_dict':project_type_dict,
           'project_status_dict':project_status_dict,
            }



    return JsonResponse(context)



@login_required
def audit_save(request):

    id=request.POST.get("id")

    audit_company_id=request.POST.get("audit_company_id")
    audit_company=request.POST.get("audit_company")
    audit_type=request.POST.get("audit_type")
    audit_title=request.POST.get("audit_title")
    audit_service_fee=request.POST.get("audit_service_fee")
    audit_quantity=request.POST.get("audit_quantity")
    audit_service_fee_vat=request.POST.get("audit_service_fee_vat")
    audit_paid=request.POST.get("audit_paid")
    audit_date_paid=request.POST.get("audit_date_paid")
    audit_note=request.POST.get("audit_note")
    audit_charge=request.POST.get("audit_charge")
    audit_status=request.POST.get("audit_status")


    if id == '':
        audit = Audit_Manage()

        audit.registrant = request.user.id
        audit.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    else:
        audit = Audit_Manage.objects.get(id = id)


    audit.company_id = audit_company_id
    audit.company_name = audit_company
    audit.type = audit_type
    audit.title = audit_title
    audit.service_fee = audit_service_fee
    audit.quantity = audit_quantity
    audit.service_fee_vat = audit_service_fee_vat
    audit.service_fee_total = int(audit_service_fee) + int(audit_service_fee_vat)
    audit.paid = audit_paid
    audit.date_paid = audit_date_paid
    audit.status = audit_status
    audit.in_charge = audit_charge
    audit.note = audit_note

    audit.modifier = request.user.id
    audit.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    audit.save()




    return JsonResponse({
        'result':True,        
        })



@login_required
def audit_get(request):

    id=request.POST.get("id")


    audit = Audit_Manage.objects.get(id = id)


    return JsonResponse({
        'result':True,    
        
        "audit_company_id":audit.company_id,
        "audit_company":audit.company_name,
        "audit_type":audit.type,
        "audit_title":audit.title,
        "audit_quantity":audit.quantity,
        "audit_service_fee":audit.service_fee,
        "audit_service_fee_vat":audit.service_fee_vat,
        "audit_paid":audit.paid,
        "audit_date_paid":audit.date_paid,
        "audit_note":audit.note,
        "audit_charge":audit.in_charge,
        "audit_status":audit.status,

        })



@login_required
def audit_delete(request):

    id=request.POST.get("id")

    audit = Audit_Manage.objects.get(id = id)
    audit.use_yn = 'N'

    audit.modifier = request.user.id
    audit.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    audit.save()


    return JsonResponse({
        'result':True,        
        })


@login_required
def audit_check_appraove(request):

    
    id = request.POST.get('id')
    type = request.POST.get('type')
    val = request.POST.get('val')


    audit = Audit_Manage.objects.get(id = id )

    if val=='true':
        now = datetime.datetime.now().strftime("%Y-%m-%d")
        user_id = request.user.id
        name_en = request.user.name_en
        name_ko = request.user.name_ko
        name_vi = request.user.name_vi
    else:
        now = '0000-00-00'
        user_id = ''
        name_en = ''
        name_ko = ''
        name_vi = ''
    


    if type == 'incharge':
        audit.check_in_charge = now
        audit.user_id_in_charge = user_id
        #audit.name_en_in_charge = name_en
        #audit.name_ko_in_charge = name_ko
        #audit.name_vi_in_charge = name_vi


    elif type == 'leader':
        audit.check_leader = now
        audit.user_id_leader= user_id
        #draft.name_en_leader= name_en
        #draft.name_ko_leader= name_ko
        #draft.name_vi_leader= name_vi



    elif type == 'accounting':
        audit.check_account = now
        audit.user_id_account= user_id
        #draft.name_en_accounting= name_en
        #draft.name_ko_accounting= name_ko
        #draft.name_vi_accounting= name_vi

    elif type == 'ceo':
        audit.check_ceo = now
        audit.user_id_ceo= user_id
        #draft.name_en_ceo= name_en
        #draft.name_ko_ceo= name_ko
        #draft.name_vi_ceo= name_vi

    else:
            
        return JsonResponse({
            'result':False ,
            })

    audit.save()



    
    return JsonResponse({
        'result':True,
        })



@login_required
def invoice_management(request):

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
        user_name = F('name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
        user_name = F('name_en')

    #상태
    list_invoice_status = []
    query_status= COMMCODE.objects.filter( commcode_grp='INVOICE_STATUS',upper_commcode='000011').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_status:
        list_invoice_status.append({
            'code':data['code'],
            'name':data['name'],
            })

    #프로젝트 구분
    list_type = []
    query_type= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_type:
        list_type.append({
            'id':data['code'],
            'name':data['name']
            })


          
    #담당자
    list_depart = []
    query_kbl_depart = COMMCODE.objects.filter( use_yn = 'Y', commcode_grp='DEPART_KBL',upper_commcode='000002').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_kbl_depart:
        list_depart.append( Q(**{'depart':data['code']} ) )

    list_in_charge = User.objects.filter(functools.reduce(operator.or_, list_depart),).annotate(name = user_name ).values('id','name')

    #계좌 정보
    list_acc = []
    query_acc = COMMCODE.objects.filter( use_yn = 'Y', commcode_grp='ACCOUNT',upper_commcode='000011').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_acc:
        list_acc.append({
            'code':data['code'],
            'name':data['name']
            })



    return render(request,
    'KBL/invoice_management.html',
            {
                'list_invoice_status':list_invoice_status,
                'list_type':list_type,
                'list_in_charge':list_in_charge,
                'list_acc':list_acc,
            },
        )


@login_required
def invoice_search(request):
    
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
        user_name = F('name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
        user_name = F('name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')
        user_name = F('name_en')


    #상태
    invoice_status_dict = {}
    query_status= COMMCODE.objects.filter( commcode_grp='INVOICE_STATUS',upper_commcode='000011').annotate(code = F('commcode'),name = f_name ).values('code','name','se1')
    for data in query_status:
        invoice_status_dict[ data['code'] ] = {
            'class':data['se1'],
            'name':data['name']
            }

    #분류
    project_type_dict = {}
    query_class= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name ).values('code','name')
    for data in query_class:
        project_type_dict[ data['code'] ] = {
            'name':data['name']
            }





    start = request.POST.get('start') + " 00:00:00"
    end = request.POST.get('end') + "23:59:59"

    type = request.POST.get('type')
    in_charge = request.POST.get('in_charge')
    status = request.POST.get('status')

    string = request.POST.get('string')

    kwargs = {}
    argument_list = []
    if type != '':
        kwargs['type']=type
    if in_charge != '':
        kwargs['in_charge']=in_charge
    if status != '':
        kwargs['status']=status

    argument_list.append( Q(**{'company_name__icontains':string} ) )
    argument_list.append( Q(**{'title__icontains':string} ) )

    datas = []
    query = Invoice_Manage.objects.filter(
        functools.reduce(operator.or_, argument_list),
        **kwargs,
        date_register__range = (start,end)
        ).order_by('-date_register')#use_yn = 'Y')


    for data in query:
        #담당자
        if data.in_charge == '':
            in_charge = ''
        else:
            in_charge = User.objects.filter(id = data.in_charge).annotate(name = user_name ).values('id','name').first()['name']


        datas.append({
            'id':data.id,
            
            "serial":data.serial,
            "company_id":data.company_id,
            "company_name":data.company_name,
            "type":data.type,
            "title":data.title,
            "in_charge":in_charge,
            "date_register":data.date_register[0:10],
            "date_sent":'' if data.date_sent == '0000-00-00 00:00:00' else data.date_sent[0:10],
            "status":data.status,

            })


 
    
    page_context = request.POST.get('page_context',10) # 페이지 컨텐츠 
    page = request.POST.get('page',1)

    paginator = Paginator(datas, page_context)
    try:
        paging_data = paginator.page(page)
    except PageNotAnInteger:
        paging_data = paginator.page(1)
    except EmptyPage:
        paging_data = paginator.page(paginator.num_pages)


    context = {
            'datas':list(paging_data),
            'page_range_start':paging_data.paginator.page_range.start,
            'page_range_stop':paging_data.paginator.page_range.stop,
            'page_number':paging_data.number,
            'has_previous':paging_data.has_previous(),
            'has_next':paging_data.has_next(),

            'invoice_status_dict':invoice_status_dict,
            'project_type_dict':project_type_dict,
            }



    return JsonResponse(context)





@login_required
def invoice_add(request):


    datas = json.loads(request.POST.get('data'))
    recipient = request.POST.get('res_rec')
   
    invoice = Invoice_Manage() 
    
    is_first_set = False
    for key in datas:

        if datas[key] == 'false':
            pass

        audit = Audit_Manage.objects.get(id = key)

        if not is_first_set:
            now_year = datetime.datetime.now().strftime('%Y')
            tmp_invoice = Invoice_Manage.objects.filter(serial__istartswith=now_year).last()
            if tmp_invoice is None:
                invoice.serial = now_year + '00001'
            else:
                invoice.serial = int(tmp_invoice.serial) + 1

            invoice.serial
            invoice.recipient = recipient
            invoice.company_id = audit.company_id
            invoice.company_name = audit.company_name
            invoice.type = audit.type
            invoice.title = audit.title + ('' if len(datas) == 1 else ( _(' 외 ') + str( len(datas) -1 ) + _(' 건')))
            invoice.in_charge = audit.in_charge

            invoice.registrant = request.user.id
            invoice.date_register = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            invoice.modifier = request.user.id
            invoice.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

            invoice.save()

            is_first_set = True

        
        audit.invoice = invoice.pk
        audit.save()


    return JsonResponse({
        'result':True,
        })






@login_required
def invoice_get(request):
    id=request.POST.get("id")


    invoice = Invoice_Manage.objects.get(id = id)

    return JsonResponse({
        'result':True,

        'id':invoice.id,

        "invoice_serial":invoice.serial,
        "invoice_recipient":invoice.recipient,
        "invoice_title":invoice.title,

        "invoice_acc":invoice.selected_acc,


        })


@login_required
def invoice_edit(request):
    id=request.POST.get("id")


    invoice_serial=request.POST.get("invoice_serial")
    invoice_recipient=request.POST.get("invoice_recipient")
    invoice_title=request.POST.get("invoice_title")
    
    acc_list =request.POST.getlist("checked_array[]")
    acc_str = '\\|\\'.join(str(e) for e in acc_list)

    invoice = Invoice_Manage.objects.get(id = id)

    invoice.recipient = invoice_recipient
    invoice.title = invoice_title
    invoice.serial = invoice_serial
    invoice.selected_acc = acc_str


    invoice.modifier = request.user.id
    invoice.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    invoice.save()

    return JsonResponse({
        'result':True,
        })




@login_required
def invoice_delete(request):
    
    id=request.POST.get("id")

    invoice = Invoice_Manage.objects.get(id = id)
    invoice.status = 'CANCEL'
    invoice.use_yn = 'N'

    invoice.modifier = request.user.id
    invoice.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    invoice.save()

    query = Audit_Manage.objects.filter(invoice = invoice.id)

    for data in query:
        data.invoice = ''

        data.modifier = request.user.id
        data.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

        data.save()


    return JsonResponse({
        'result':True,        
        })



@login_required
def print_invoice(request,id):

    invoice = Invoice_Manage.objects.get(id = id)

    str_table_list = ''
    query_audit = Audit_Manage.objects.filter(invoice = invoice.id)
    no =1

    sum_vat = 0
    sum_total = 0

    for audit in query_audit:
        str_table_list += '<tr>'
        str_table_list += '<td class="border_thin b">' + str(no) + '</td>'
        str_table_list += '<td class="border_thin">' + audit.title + ' Fee</td>'
        str_table_list += '<td class="border_thin">1</td>'
        str_table_list += '<td class="border_thin">' + "{:,}".format(int(audit.service_fee)) + '</td>'
        str_table_list += '<td class="border_thin">' + "{:,}".format(int(audit.service_fee)) + '</td>'
        str_table_list += '<td class="border_thin">' + audit.note + '</td>'
        str_table_list += '</tr>'

        no += 1
        sum_vat += int(audit.service_fee_vat)
        sum_total += int(audit.service_fee)

    str_table_list += '<tr>'
    str_table_list += '<td rowspan="2" colspan="4" class="bg_gray border_thin b">Total fee(Excluded 10% VAT)</td>'
    str_table_list += '<td class="bg_gray border_thin b text-right">$ -&nbsp;</td>'
    str_table_list += '<td class="bg_gray border_thin b"></td>'
    str_table_list += '</tr>'
    str_table_list += '<tr>'
    str_table_list += '<td class="bg_gray border_thin b text-right">VND ' + "{:,}".format(sum_total) + '&nbsp;</td>'
    str_table_list += '<td class="bg_gray border_thin b"></td>'
    str_table_list += '</tr>'
    str_table_list += '<tr>'
    str_table_list += '<td rowspan="2" colspan="4" class="bg_gray border_thin b">Total fee(Included 10% VAT)</td>'
    str_table_list += '<td class="bg_gray border_thin b text-right">$ -&nbsp;</td>'
    str_table_list += '<td class="bg_gray border_thin b"></td>'
    str_table_list += '</tr>'
    str_table_list += '<tr>'
    str_table_list += '<td class="bg_gray border_thin b text-right">VND ' + "{:,}".format(sum_total + sum_vat) + '&nbsp;</td>'
    str_table_list += '<td class="bg_gray border_thin b"></td>'
    str_table_list += '</tr>'

    #계좌
    acc_datas = []
    list_acc = invoice.selected_acc.split('\\|\\')

    for data in list_acc:
        acc_ino= COMMCODE.objects.get( use_yn = 'Y', commcode_grp='ACCOUNT',upper_commcode='000011',commcode = data)
        acc_datas.append({
            'unit_title':acc_ino.se1,
            'acc_name':acc_ino.se2,
            'acc_number':acc_ino.se3,
            'acc_code':acc_ino.se4,
            'acc_holder':acc_ino.se5,
            })


    return render(request,
    'Form/Invoice_print.html',
            {
                'recipient':invoice.recipient,
                'title':invoice.title,
                'date':datetime.datetime.strptime(invoice.date_register[0:10],'%Y-%m-%d').strftime("%B %d, %Y"),
                'company_name':invoice.company_name,

                'str_table_list':str_table_list,
                'acc_datas':acc_datas,
            },
        )





@login_required
def send_email_invoice(request):
    
    id=request.POST.get("id")


    invoice = Invoice_Manage.objects.get(id = id)

    str_table_list = ''
    query_audit = Audit_Manage.objects.filter(invoice = invoice.id)
    no =1

    sum_vat = 0
    sum_total = 0

    for audit in query_audit:
        str_table_list += '<tr>'
        str_table_list += '<td class="border_thin b" style="font-weight:700;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;text-align:center;vertical-align:middle;">' + str(no) + '</td>'
        str_table_list += '<td class="border_thin" style="border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;text-align:center;vertical-align:middle;">' + audit.title + ' Fee</td>'
        str_table_list += '<td class="border_thin" style="border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;text-align:center;vertical-align:middle;">1</td>'
        str_table_list += '<td class="border_thin" style="border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;text-align:center;vertical-align:middle;">' + "{:,}".format(int(audit.service_fee)) + '</td>'
        str_table_list += '<td class="border_thin" style="border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;text-align:center;vertical-align:middle;">' + "{:,}".format(int(audit.service_fee)) + '</td>'
        str_table_list += '<td class="border_thin" style="border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;text-align:center;vertical-align:middle;">' + audit.note + '</td>'
        str_table_list += '</tr>'

        no += 1
        sum_vat += int(audit.service_fee_vat)
        sum_total += int(audit.service_fee)

    str_table_list += '<tr>'
    str_table_list += '<td rowspan="2" colspan="4" class="bg_gray border_thin b" style="font-weight:700;background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;">Total fee(Excluded 10% VAT)</td>'
    str_table_list += '<td class="bg_gray border_thin b text-right" style="text-align: right;background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;vertical-align:middle;">$ -&nbsp;</td>'
    str_table_list += '<td class="bg_gray border_thin b" style="background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;"></td>'
    str_table_list += '</tr>'
    str_table_list += '<tr>'
    str_table_list += '<td class="bg_gray border_thin b text-right"  style="text-align: right;background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;;vertical-align:middle;">VND ' + "{:,}".format(sum_total) + '&nbsp;</td>'
    str_table_list += '<td class="bg_gray border_thin b" style="background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;;"></td>'
    str_table_list += '</tr>'
    str_table_list += '<tr>'
    str_table_list += '<td rowspan="2" colspan="4" class="bg_gray border_thin b"  style="background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;vertical-align:middle;">Total fee(Included 10% VAT)</td>'
    str_table_list += '<td class="bg_gray border_thin b text-right"  style="text-align: right;background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;vertical-align:middle;">$ -&nbsp;</td>'
    str_table_list += '<td class="bg_gray border_thin b" style="background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;"></td>'
    str_table_list += '</tr>'
    str_table_list += '<tr>'
    str_table_list += '<td class="bg_gray border_thin b text-right"  style="text-align: right;background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;vertical-align:middle;">VND ' + "{:,}".format(sum_total + sum_vat) + '&nbsp;</td>'
    str_table_list += '<td class="bg_gray border_thin b" style="background-color:rgb(242,242,242) !important;background-image:none !important;background-repeat:repeat !important;background-position:top left !important;background-attachment:scroll !important;border-width:1px;border-style:solid;border-color:black;height:16px;font-size:12px;"></td>'
    str_table_list += '</tr>'

    #계좌
    acc_datas = []
    list_acc = invoice.selected_acc.split('\\|\\')
    for data in list_acc:
        acc_ino= COMMCODE.objects.get( use_yn = 'Y', commcode_grp='ACCOUNT',upper_commcode='000011',commcode = data)
        acc_datas.append({
            'unit_title':acc_ino.se1,
            'acc_name':acc_ino.se2,
            'acc_number':acc_ino.se3,
            'acc_code':acc_ino.se4,
            'acc_holder':acc_ino.se5,
            })


    context= {
            'recipient':invoice.recipient,
            'title':invoice.title,
            'date':datetime.datetime.strptime(invoice.date_register[0:10],'%Y-%m-%d').strftime("%B %d, %Y"),
            'company_name':invoice.company_name,

            'str_table_list':str_table_list,
            'acc_datas':acc_datas,

            'is_email':True,
        }

    html_message = loader.render_to_string(
            'Form/Invoice_print.html',
            context,
            #context_instance=RequestContext(request)
        )
    

    erer = send_mail(
    '인보이스',
    '',
    'from@example.com',
    ['khm4321@naver.com'],
    html_message = html_message,
    )

    
    if invoice.is_sent == 'N':
        invoice.is_sent = 'Y'
        invoice.date_sent = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        invoice.save()




    return JsonResponse({
        'result':True,        
        })


    return JsonResponse({
        'result':True,        
        })


#정산
@login_required
def statistics(request):
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')


    #프로젝트 구분
    list_project_type = []
    query_type= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name).values('code','name')
    for data in query_type:
        list_project_type.append({
           'code':data['code'],
           'name':data['name'],
           })

    return render(request,
    'KBL/statistics.html',
            {
                'list_project_type':list_project_type,
            },
        )

@login_required
def statistics_company(request):
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')


    #프로젝트 구분
    list_project_type = []
    query_type= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name).values('code','name')
    for data in query_type:
        list_project_type.append({
           'code':data['code'],
           'name':data['name'],
           })

    return render(request,
    'KBL/statistics_company.html',
            {
                'list_project_type':list_project_type,
            },
        )


@login_required
def statistics_date(request):
    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')


    #프로젝트 구분
    list_project_type = []
    query_type= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name).values('code','name')
    for data in query_type:
        list_project_type.append({
           'code':data['code'],
           'name':data['name'],
           })

    return render(request,
    'KBL/statistics_date.html',
            {
                'list_project_type':list_project_type,
            },
        )

@login_required
def statistics_search(request):


    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')


    #프로젝트 구분
    list_project_type = []
    query_type= COMMCODE.objects.filter( commcode_grp='PROJECT_TYPE',upper_commcode='000010').annotate(code = F('commcode'),name = f_name).values('code','name')
    for data in query_type:
        list_project_type.append({
           'code':data['code'],
           'name':data['name'],
           })


    start=request.POST.get("start")
    end=request.POST.get("end")
    type=request.POST.get("type")

    kwargs = {}
    if type != '':
        kwargs['type']= type

    start += ' 00:00:00'
    end += ' 23:59:59'

    list_data = []


    for type in query_type:
        price_sum = 0

        total_query = Audit_Manage.objects.filter(
            date_register__range = (start,end),
            use_yn = 'Y',
            type = type['code'],
            ).aggregate(
                total_quantity=Sum('quantity'),
                total_service_fee=Sum('service_fee'),
                total_service_fee_vat=Sum('service_fee_vat'),
                total_service_fee_total=Sum('service_fee_total'),
                )



        list_data.append({
            'name':type['name'],
            'quantity':0 if total_query['total_quantity'] is None else total_query['total_quantity'],
            'service_fee':0 if total_query['total_service_fee'] is None else total_query['total_service_fee'],
            'service_fee_vat':0 if total_query['total_service_fee_vat'] is None else total_query['total_service_fee_vat'],
            'service_fee_total':0 if total_query['total_service_fee_total'] is None else total_query['total_service_fee_total'],
            })

    total_list = Audit_Manage.objects.filter(
        date_register__range = (start,end),
        use_yn = 'Y',
        ).aggregate(
            total_service_fee=Sum('service_fee'),
            total_service_fee_vat=Sum('service_fee_vat'),
            total_service_fee_total=Sum('service_fee_total'),
            )



    return JsonResponse({
        'datas':list_data,

        'total_service_fee':0 if total_list['total_service_fee'] is None else total_list['total_service_fee'],
        'total_service_fee_vat':0 if total_list['total_service_fee_vat'] is None else total_list['total_service_fee_vat'],
        'total_service_fee_total':0 if total_list['total_service_fee_total'] is None else total_list['total_service_fee_total'],

        })



#오토컴플릿 회사 검색
@login_required
def selectbox_search_company(request):

    string = request.POST.get('string')
    
    query = Customer_Company.objects.filter(
        Q(name_kor__icontains = string) |
        Q(name_eng__icontains = string) |
        Q(ceo_name__icontains = string)
    ).values('id','name_eng','name_kor')

    datas=[]
    for data in query:
        datas.append({
            'value':data['name_eng'] ,
            'id':data['id'],
            })

    return JsonResponse({'datas':datas})

@login_required
def selectbox_search_employee(request):


    company_id = request.POST.get('company_id')
    string = request.POST.get('string')


    query = Customer_Employee.objects.filter(
        Q(name_kor__icontains = string) |
        Q(name_eng__icontains = string),
        company_id = company_id
    ).values('id','name_eng','name_kor')

    datas=[]
    for data in query:
        datas.append({
            'value':data['name_eng'] ,
            'id':data['id'],
            })

    return JsonResponse({'datas':datas})


#파일 리스트
def file_list(request):
    id = request.POST.get('id')
    type = request.POST.get('type')

    list_file = []
    query_file = Board_File.objects.filter(board_id = id,board_type=type).order_by('registered_date')


    for file in query_file:
        list_file.append({
            'id':file.id,
            'url':file.file.url,
            'name':file.title,
            'origin_name':file.origin_name,
            'date':file.registered_date.strftime("%Y-%m-%d"),
            'creator':file.user,
            'memo':file.memo,
            });

    return JsonResponse({
        'result':True,
        'datas':list_file,
        })



#파일 정보 불러오기
def file_get(request):
    id = request.POST.get('id')

    query_file = Board_File.objects.get(id = id)

    file_name = query_file.file.url,

    return JsonResponse({
        'result':True,
        'title':query_file.title,
        'memo':query_file.memo,
        'origin_name':query_file.origin_name,
        })

#파일 저장
def file_save(request):
    id = request.POST.get('id')

    if request.method == 'POST':

        selected_file_id = request.POST.get('selected_file_id','')#파일 ID
        selected_file_list = request.POST.get('selected_file_list','')#기안서 ID 
        new_edit_file_name = request.POST.get('new_edit_file_name','')#문서 이름
        new_edit_file_remark = request.POST.get('new_edit_file_remark','')#문서 설명

        board_type = request.POST.get('board_type','')#보드 구분



        form = board_file_form(request.POST, request.FILES)
        files = request.FILES.getlist('file') 

        if form.is_valid():
           if selected_file_id != '': #수정
                file_instance = Board_File.objects.get(id = selected_file_id)
           else:
                file_instance = Board_File()


           #    old_data
           #file save
           for f in files:
               if file_instance.file:
                    if os.path.isfile(file_instance.file.path):
                        os.remove(file_instance.file.path)

               file_instance.file = f
               file_instance.origin_name = f._name
               pass

           file_instance.board_id = selected_file_list
           file_instance.user = request.user.user_id
           file_instance.board_type = board_type
           file_instance.title = new_edit_file_name
           file_instance.memo = new_edit_file_remark
           file_instance.is_KBL = 'Y'
           file_instance.save()
           #form.save()
           return JsonResponse({'error': False, 'message': 'Uploaded Successfully'})
        else:
           return JsonResponse({'error': True, 'errors': form.errors})

    else:
        form = board_file_form()
        return render(request, 'django_image_upload_ajax.html', {'form': form})



#파일 삭제
def file_delete(request):

    id = request.POST.get('id')
    Board_File.objects.get(id=id).delete()



    return JsonResponse({
        'result':True,
        })

