"""
Definition of views.
"""
import math
from Doctor.models import TestReferenceInterval
from Doctor.views import diagnosis
from app.forms import *
import datetime
from django.shortcuts import render, redirect
from django.http import HttpRequest, HttpResponse
from django.http import JsonResponse

from django.conf import settings
from django.contrib import auth
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from django.utils.translation import gettext as _
from django.utils import translation
from django.utils import timezone

from django.views.decorators.csrf import csrf_exempt


from django.db.models import Q, Count, F, Min,Sum
from Account.models import *
from Account.forms import *
from Manage.models import *
from Receptionist.models import *
from .models import *
import json
import requests
import csv
#@login_required
def home(request):
    """Renders the home page."""
    if not translation.LANGUAGE_SESSION_KEY in request.session:
        translation.activate('en')
        request.session[translation.LANGUAGE_SESSION_KEY] = 'en'

    
    #if request.META['SERVER_PORT'] == '9090':
    #    if request.user.is_anonymous:
    #        return redirect('login')
    #else:

    set_menu(request)


    if request.user.is_anonymous:
        return redirect('login')

    request.session['is_KBL'] = False
    if request.META['SERVER_PORT'] == '9090' or request.META['SERVER_PORT'] == '11111'  or request.META['SERVER_PORT'] == '9091':#테스트서버        
        if request.user.is_doctor():
            return redirect('/doctor')
        if request.user.is_nurse():
            return redirect('/nurse')
        elif request.user.is_receptionist():            
            return redirect('/receptionist')
        elif request.user.is_pharmacy():
            return redirect('/pharmacy')
        elif request.user.is_laboratory():
            return redirect('/laboratory')
        elif request.user.is_radiation():
            return redirect('/radiation')
        elif request.user.is_physical_therapist():
            return redirect('/physical_therapist')
        elif request.user.is_marketing():
            return redirect('/manage/draft')
        elif request.user.is_account():
            return redirect('/manage/draft')
        elif request.user.is_system():
            return redirect('/manage')
        elif request.user.is_admin:        
            return redirect('/manage')
        elif request.user.is_driver():
            return redirect('/receptionist/apointment')            
    elif request.META['SERVER_PORT'] == '8888' or request.META['SERVER_PORT'] == '22222':#경천애인 관리자
        request.session['is_KBL'] = True
        if request.user.is_admin:
            return redirect('/KBL')
        return redirect('/KBL')


def set_menu(request):
    if request.user.is_anonymous:
        return

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        f_name = F('commcode_name_en')


    #메뉴 세팅
    request.session['MENU'] = []
    menu_list = []

    menu_code = {}
    menu_code_name = {}
    menu_code_seq1= {}
    menu_code_seq2= {}
    menu_commcode = COMMCODE.objects.filter(upper_commcode = '000012',commcode_grp = 'MENU_LIST_IMDI').annotate(name = f_name ).values('commcode','name','se1','se2','se3')
    for data in menu_commcode:
        menu_code[data['commcode']] = data['se1']
        menu_code_seq1[data['commcode']] = data['se2']
        menu_code_seq2[data['commcode']] = data['se3']
        menu_code_name[data['commcode']] = data['name']

    #     # if data['name'] == 'Code Setting':
    # test = COMMCODE.objects.filter(upper_commcode = '000012',commcode_grp = 'MENU_LIST_IMDI').annotate(name = f_name ).filter(name='Code Setting').first()
    # if test:
    #     test.commcode_name_ko = 'Setting'
    #     test.commcode_name_vi = 'Setting'
    #     test.commcode_name_en = 'Setting'
    #     test.save()

    upmenu_code = {}
    upmenu_commcode = COMMCODE.objects.filter(upper_commcode = '000012',commcode_grp = 'MENU_UPLIST_IMDI').annotate(name = f_name ).values('commcode','name')
    for data in upmenu_commcode:
        upmenu_code[data['commcode']] = data['name']

    menu_query = User_Menu.objects.filter(user = request.user).order_by('seq')
    checked = []

    for data in menu_query:
        if 'alert' in data.menu:#알람 설정
            alert = data.menu.split('_')
            request.session['ALERT'] = []
            request.session['ALERT'].append(alert[1])

        elif data.grp == '':
            menu_list.append({
                'name':menu_code_name[data.menu],
                'url':menu_code[data.menu],
                'code':data.menu ,
                })
        else:
            if data.grp in checked:
                continue
            checked.append(data.grp)

            grp_filter = User_Menu.objects.filter(user = request.user, grp = data.grp)
            grp_list = []
            for grp_data in grp_filter:
                grp_list.append({
                    'name':menu_code_name[grp_data.menu],
                    'url':menu_code[grp_data.menu],
                    'code':grp_data.menu
                    })

            menu_list.append({
                'name':upmenu_code[data.grp],
                'lower_menu':grp_list,
                'code':data.menu
                })
    list_1 = []
    list_2 = []
    list_3 = {
        "name": "Settings",
        "lower_menu": [],
        "code": "rec_res"
    }

    setting_list = []
    document_list = [
        {
            "name": "Documents",
            "lower_menu": [
                {
                    "name": "Issue Documents",
                    "url": "/receptionist/Documents/",
                    "code": "rec_doc"
                },
                {
                    "name": "Send Documents",
                    "url": "/manage/statistics/profile_status/",
                    "code": "sta_pro"
                },
                {
                    "name": "Send Email",
                    "url": "/receptionist/Documents2/",
                    "code": "sta_pro"
                }

            ],
            "code": "code"
        }
    ]
    org_list = [
        {
            "name": "Board",
            "lower_menu": [
                {
                    "name": "Notice Board",
                    "url": "/manage/board/",
                    "code": "board_board"
                },
                {
                    "name": "Co-Work Board",
                    "url": "/manage/board_work/",
                    "code": "board_coboard"
                },
                {
                    "name": "Information Coworker",
                    "url": "/manage/manage_employee/",
                    "code": "emp_mgt"
                },
                {
                    "name": "So Do",
                    "url": "",
                    "code": "so_do"
                }

            ],
            "code": "org"
        }
    ]

    reser_list = [
        {
            "name": "Reservation",
            "lower_menu": [
                {
                    "name": "Reservation",
                    "url": "/receptionist/reservation/",
                    "code": "rec_res"
                },
                {
                    "name": "Draft Patients",
                    "url": "/receptionist/pre_regis/",
                    "code": "sss"
                }

            ],
            "code": "rec_res"
        }
    ]

    customer_manage_list = [
                {
            "name": "Customer Mgt",
            "lower_menu": [
                {
                    "name": "Customer Mgt",
                    "url": "/manage/customer_manage/",
                    "code": "cus_mgt"
                },
                {
                    "name": "SMS History",
                    "url": "/manage/sms/history/",
                    "code": "sms"
                }

            ],
            "code": "rec_res"
        }
    ]

    

    allow_setting = False
    for menu in menu_list:
        if menu['name'] == 'Registration':
            list_1.append(menu)
        elif menu['name'] == 'Reservation':
            pass
        elif menu['name'] == 'Payment':
            list_1.append(menu)
        elif menu['name'] == 'Pharmacy':
            menu['name'] = 'Medicine'
            list_2.append(menu)
        # elif menu['name'] == 'Medicine':
        #     list_1.append(menu)
        elif menu['name'] == 'Pick Up':
            pass
        elif menu['name'] == 'Customer Mgt':
            pass
        elif menu['name'] == 'SMS History':
            pass
        elif menu['name'] == 'Drafts':
            pass

        elif menu['name'] == 'Setting':
            setting_list.append(    {
                "name": "Code Setting",
                "url": "/manage/code_setting/",
                "code": "code"
            })
            allow_setting = True
        elif menu['name'] == 'Board':
            pass
        elif menu['name'] == 'Service & Inventory':
            for item in menu['lower_menu']:
                setting_list.append(item)
        elif menu['name'] == 'Documents':
            list_2.extend(document_list)
        elif menu['name'] == 'Organization':
            pass
        else:
            if menu['name'] == 'Statistics':
                menu['lower_menu'] = menu['lower_menu']
            list_2.append(menu)
    list_3['lower_menu'] = setting_list

    menu_list = list_1 + reser_list + list_2 + customer_manage_list + org_list
    menu_list += [list_3]



    request.session['MENU'] = menu_list
    request.session['DOCTOR_MENU'] = '' 
    if request.user.depart == 'DOCTOR':
        request.session['DOCTOR_MENU'] = '<a href="/doctor/"><span style="margin-right:5px;color:blue;">' + request.user.depart_doctor + ' </span> Dr.' + request.user.doctor.name_short + '</a>'




def login(request):
    commcode = 0
    authentication_form=BootstrapAuthenticationForm()
    err_msg = ''
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(request,username = username)
        try:
            temp_user = User.objects.get(user_id = username)

            #아이메디
            if request.META['SERVER_PORT'] == '9090' or request.META['SERVER_PORT'] == '11111':#테스트서버
                commcode = COMMCODE.objects.filter(commcode_grp = 'DEPART_CLICINC',commcode = temp_user.depart ).count()
            elif request.META['SERVER_PORT'] == '8888' or request.META['SERVER_PORT'] == '22222':#경천애인
                commcode = COMMCODE.objects.filter(commcode_grp = 'DEPART_KBL',commcode = temp_user.depart ).count()


            if temp_user.depart == 'ADMIN':
                commcode = COMMCODE.objects.filter(commcode_grp = 'DEPART_ADMIN',commcode = temp_user.depart ).count()

            user = auth.authenticate(request,username = username, password = password)

            if user is not None:
                request.session['SYSTEM_CHECKING'] = False
                temp_user.is_hidden = 'N'
                temp_user.save()
                auth.login(request,user)

                return redirect('/')
            err_msg = _('Please enter a correct user name and password.')
        except User.DoesNotExist:
            err_msg = _('Please enter a correct user name and password.')

        

    if request.META['SERVER_PORT'] == '9090' or request.META['SERVER_PORT'] == '11111':
        url = 'app/login.html'
    elif request.META['SERVER_PORT'] == '8888' or request.META['SERVER_PORT'] == '22222':
        url = 'app/login_KBL.html'


    return render(request,
        url,
            {
                'title':_('Log in'),
                'form':authentication_form,
                'year':datetime.datetime.now().year,
                'register_user':UserRegisterForm(),
                'register_role':UserRuleChoiceForm(),
                'register_doctor':DoctorDepartChoiceForm(),
                'error':None if err_msg is '' else err_msg,
            }
        )
    



def logout(request):
    res_str = '/'
    if request.session.has_key('SYSTEM_CHECKING'):
        if request.session['SYSTEM_CHECKING'] == True:
            res_str = '/login1'
    elif request.META['SERVER_PORT'] == '9090' or request.META['SERVER_PORT'] == '11111':
        res_str = '/'
        if request.user.is_superuser is True:
            res_str = '/admin'
    elif request.META['SERVER_PORT'] == '8888' or request.META['SERVER_PORT'] == '22222':
        res_str = '/'

        
    auth.logout(request)
    return redirect(res_str)



def login1(request):
    if request.session.has_key('SYSTEM_CHECKING'):
        del(request.session['SYSTEM_CHECKING'])

         
    commcode = 0 
    authentication_form=BootstrapAuthenticationForm()
    err_msg = ''
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        user = auth.authenticate(request,username = username)
        try:
            temp_user = User.objects.get(user_id = username)

            #아이메디
            if request.META['SERVER_PORT'] == '9090' or request.META['SERVER_PORT'] == '11111':#테스트서버
                commcode = COMMCODE.objects.filter(commcode_grp = 'DEPART_CLICINC',commcode = temp_user.depart ).count()
            elif request.META['SERVER_PORT'] == '8888' or request.META['SERVER_PORT'] == '22222':#경천애인
                commcode = COMMCODE.objects.filter(commcode_grp = 'DEPART_KBL',commcode = temp_user.depart ).count()


            if temp_user.depart == 'ADMIN':
                commcode = COMMCODE.objects.filter(commcode_grp = 'DEPART_ADMIN',commcode = temp_user.depart ).count()

            user = auth.authenticate(request,username = username, password = password)
            
            if user is not None: 
                request.session['SYSTEM_CHECKING'] = True
                temp_user.is_hidden = 'Y'
                temp_user.save()
                auth.login(request,user)

                return redirect('/')
            err_msg = _('Please enter a correct user name and password.')
        except User.DoesNotExist:
            err_msg = _('Please enter a correct user name and password.')

        

    
    url = 'app/login_checking.html'


    return render(request,
        url,
            {
                'title':_('Log in'),
                'form':authentication_form,
                'year':datetime.datetime.now().year,
                'register_user':UserRegisterForm(),
                'register_role':UserRuleChoiceForm(),
                'register_doctor':DoctorDepartChoiceForm(),
                'error':None if err_msg is '' else err_msg,
            }
        )


def register(request):
    id = request.POST.get('id')
    password = request.POST.get('password')
    name_kor = request.POST.get('name_kor')
    name_eng = request.POST.get('name_eng')
    name_short = request.POST.get('name_short')
    depart = request.POST.get('depart')


    form = UserCreationForm(initial={
        'email': id,
        'password': password,
        })

    form
    #try:
    #    account = User.objects.get(id = id)




    return JsonResponse({'return':'success'})


#관리자 로그인
def admin(request):
    
    authentication_form=BootstrapAuthenticationForm()
    err_msg = ''
    if request.method == 'POST':
        username = request.POST['username']
        if username != 'ADMIN':
            user = None
        else:
            password = request.POST['password']
            user = auth.authenticate(request,username = username, password = password)
        if user is not None:
            depart = request.POST['depart']

            if depart == 'ADMIN':
                auth.login(request,user)
                return redirect('/')

            if depart=='DOCTOR':
                doctor_depart = request.POST['doctor_depart']
                temp_user = User.objects.filter(depart = depart, depart_doctor = doctor_depart ).first()
            else:
                temp_user = User.objects.filter(depart = depart).first()

            temp_user.backend = 'django.contrib.auth.backends.ModelBackend'
            auth.login(request,temp_user)

            return redirect('/')
        else:
            err_msg = _('Please enter a correct user name and password.')






    #부서 - KBL
    list_depart_kbl = []
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        query_depart= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='DEPART_KBL').annotate(code = F('commcode'),name = F('commcode_name_ko')).values('code','name')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        query_depart= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='DEPART_KBL').annotate(code = F('commcode'),name = F('commcode_name_en')).values('code','name')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        query_depart= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='DEPART_KBL').annotate(code = F('commcode'),name = F('commcode_name_vi')).values('code','name')

    for data in query_depart:
        list_depart_kbl.append({
            'id':data['code'],
            'name':data['name']
            })

    #부서 - 병원
    list_depart_clinic = []
    list_depart_doctor = []
    str_doctor = 'Doctor'
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        query_depart= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='DEPART_CLICINC').annotate(code = F('commcode'),name = F('commcode_name_ko')).values('code','name','id').exclude(commcode = 'DOCTOR')
        query_depart_doctor = COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='DEPART_CLICINC', commcode='DOCTOR').annotate(code = F('se1'),name = F('commcode_name_ko')).values('code','name','id')
        str_doctor = '의사'
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'en':
        query_depart= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='DEPART_CLICINC').annotate(code = F('commcode'),name = F('commcode_name_en')).values('code','name','id').exclude(commcode = 'DOCTOR')
        query_depart_doctor = COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='DEPART_CLICINC', commcode='DOCTOR').annotate(code = F('se1'),name = F('commcode_name_en')).values('code','name','id')
        str_doctor = 'Doctor'
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        query_depart= COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='DEPART_CLICINC').annotate(code = F('commcode'),name = F('commcode_name_vi')).values('code','name','id').exclude(commcode = 'DOCTOR')
        query_depart_doctor = COMMCODE.objects.filter(use_yn = 'Y',commcode_grp='DEPART_CLICINC', commcode='DOCTOR').annotate(code = F('se1'),name = F('commcode_name_vi')).values('code','name','id')
        str_doctor = 'Bác sĩ'

    for data in query_depart:
        list_depart_clinic.append({
            'id':data['code'],
            'name':data['name']
            })

    list_depart_clinic.append({
        'id':'DOCTOR',
        'name':str_doctor
        })

    for data in query_depart_doctor:
        list_depart_doctor.append({
            'id':data['code'],
            'name':data['name'],
            })


    


    return render(request,
        'admin/login_admin.html',
            {
                'title':_('Log in'),
                'form':authentication_form,
                'year':datetime.datetime.now().year,
                'register_user':UserRegisterForm(),
                'register_role':UserRuleChoiceForm(),
                'register_doctor':DoctorDepartChoiceForm(),
                'error':None if err_msg is '' else err_msg,


                'list_depart_kbl':list_depart_kbl,
                'list_depart_clinic':list_depart_clinic,
                'list_depart_doctor':list_depart_doctor,

            }
        )



def superadmin(request):
    if request.method == 'POST':
        user = User.objects.get(id=request.POST['sel_user'])

        auth.login(request, user)
        
        return redirect('/')


    user_query = User.objects.all()

    return render(request,
        'app/superadmin.html',
            {
                'user_list':user_query,

            }
        )







def TranslateEN(request):
    
    if translation.LANGUAGE_SESSION_KEY in request.session:
        del(request.session[translation.LANGUAGE_SESSION_KEY])
    translation.activate('en')
    

    request.session[translation.LANGUAGE_SESSION_KEY] = 'en'
    #메뉴 재설정
    set_menu(request)
    response = JsonResponse({'return':'success'})
    #response.set_cookie(settings.LANGUAGE_COOKIE_NAME, 'en')
    return response

def TranslateVIE(request):
    if translation.LANGUAGE_SESSION_KEY in request.session:
        del(request.session[translation.LANGUAGE_SESSION_KEY])
    translation.activate('vi')

    request.session[translation.LANGUAGE_SESSION_KEY] = 'vi'
    #메뉴 재설정
    set_menu(request)
    response = JsonResponse({'return':'success'})
    #response.set_cookie(settings.LANGUAGE_COOKIE_NAME, 'vi')
    return response

def TranslateKO(request):
    if translation.LANGUAGE_SESSION_KEY in request.session:
        del(request.session[translation.LANGUAGE_SESSION_KEY])
    translation.activate('ko')

    request.session[translation.LANGUAGE_SESSION_KEY] = 'ko'
    #메뉴 재설정
    set_menu(request)
    response = JsonResponse({'return':'success'})
    #response.set_cookie(settings.LANGUAGE_COOKIE_NAME, 'ko')
    return response







def test(request):

    
    
    return render(request,
        'app/test.html',
            {
            }
        )


def test_send(request):

    phone = request.POST.get('phone',None)
    contents = request.POST.get('contents',None)

    temp_test = sms_test()
    temp_test.phone = phone
    temp_test.contents = contents
    temp_test.status = '2'
    temp_test.save()

    return JsonResponse({
        'res':True,
        'id':temp_test.id,
        })


def test_recv(request):

    context = {}
    msg_id = request.POST.get('msg_id',None)
    if msg_id is not None:
        status = request.POST.get('status',None)
        code = request.POST.get('code',None)
        tranId = request.POST.get('tranId',None)

        temp_test = sms_test.objects.get(id = msg_id)

        if status is "success":
            temp_test.status = 1
        else:
            temp_test.status = 0

        temp_test.res_code = code
        temp_test.date_of_recieved = datetime.datetime.now()
        temp_test.save()


    return JsonResponse({
        'res':True,
        'id':temp_test.id,
        })



def get_res_table(request):

    query = sms_test.objects.all().order_by('-id')
    list_res = []

    for data in query:
        list_res.append({
            'id':data.id,
            'phone':data.phone,
            'contents':data.contents,
            'status':data.status,
            'date_of_registered':data.date_of_registered.strftime('%Y-%m-%d %H:%M:%S'),
            'code':data.res_code,
            'date_of_recieved':'' if data.date_of_recieved is None else data.date_of_recieved.strftime('%Y-%m-%d %H:%M:%S'),
            })



    
    return JsonResponse({
        'res':True,
        'list_res':list_res,
        })



def signpad(request):


        
    return render(request,
        'app/signpad.html',
            {
            }
        )


def search_waiting_sign(request):


    datas = []
    query = Sign_Manage.objects.filter(is_sign='N', use_yn = 'Y')

    for data in query:
        datas.append({
            'id':data.id,
            'chart':data.reception.patient.get_chart_no(),
            'name_kor':data.reception.patient.name_kor,
            'name_eng':data.reception.patient.name_eng,
            'age':data.reception.patient.get_age(),
            'gender':data.reception.patient.get_gender_simple(),
            'date_of_birth':data.reception.patient.date_of_birth.strftime('%Y-%m-%d'),
            })




    return JsonResponse({
        'result':True,
        'datas':datas,
        })


def save_sign(request):


    id = request.POST.get('id')
    sign_data = request.POST.get('sign_data')


    data = Sign_Manage.objects.get(id = id)
    data.is_sign = 'Y'
    data.sign_data = sign_data
    data.date_modify = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    data.save()



    return JsonResponse({
        'result':True,
        })



@csrf_exempt
def waiting_list_sys(request):




    return render(request,
        'Etc/waiting_list_sys.html',
            {

            }
        )


@csrf_exempt
def waiting_list_sys_get(request):

    depart_id = request.POST.get('depart_id','')

    today = datetime.datetime.today().strftime("%Y-%m-%d")

    date_min = datetime.datetime.combine(datetime.datetime.strptime(today, "%Y-%m-%d").date(), datetime.time.min)
    date_max = datetime.datetime.combine(datetime.datetime.strptime(today, "%Y-%m-%d").date(), datetime.time.max)


    depart = Depart.objects.get(id = depart_id)

    kwargs = {}
    kwargs['depart_id']=depart_id

    reception_waiting_query = Reception.objects.filter(
        #functools.reduce(operator.or_, argument_list),
        **kwargs ,
        recorded_date__range = (date_min, date_max),
        ).select_related('patient').order_by('recorded_date')

    list_waiting = []
    for data in reception_waiting_query.filter(progress='new'):
        patient_name = data.patient.name_eng
        if data.patient.nationality == 'Korea':
            patient_name = data.patient.name_kor

        list_waiting.append({
            'id':data.id,
            'name':patient_name,
            'nationality':data.patient.nationality,
            'time':data.recorded_date.strftime("%H:%M"),
            })



    #진료중
    list_under_treatement = []
    for data in reception_waiting_query.filter(progress='under_treat'):
        patient_name = data.patient.name_eng
        if data.patient.nationality == 'Korea':
            patient_name = data.patient.name_kor

        list_under_treatement.append({
            'id':data.id,
            'name':patient_name,
            'nationality':data.patient.nationality,
            'start_treatement':data.start_treatement_date.strftime('%H:%M'),
            })



    #수납 대기
    list_waiting_payment = []
    for data in reception_waiting_query.filter(progress='done'):
        if( data.payment.paymentrecord_set.count() != 0):
            continue

        patient_name = data.patient.name_eng
        if data.patient.nationality == 'Korea':
            patient_name = data.patient.name_kor

        list_waiting_payment.append({
            'id':data.id,
            'name':patient_name,
            'nationality':data.patient.nationality,
            })


    return JsonResponse({
        'result':True,
        'depart_name':depart.name,

        'list_waiting':list_waiting,
        'list_waiting_payment':list_waiting_payment,
        'list_under_treatement':list_under_treatement,

        })


@csrf_exempt
def waiting_list_sys_admin(request):


    return render(request,
        'Etc/waiting_list_sys_admin.html',
            {

            }
        )

@csrf_exempt
def waiting_list_sys_admin_get(request):

    data_query = ScreenInfo.objects.filter().first()
    if data_query == None:
        data_query = ScreenInfo()



    return JsonResponse({
        'interval':data_query.interval_sec,
        'text_interval':data_query.text_interval_sec,
        'text1':data_query.text_1,
        'text2':data_query.text_2,
        'text3':data_query.text_3,
        'text4':data_query.text_4,
        'text5':data_query.text_5,
        'text6':data_query.text_6,
        'text7':data_query.text_7,
        'text8':data_query.text_8,
        'text9':data_query.text_9,
        'text10':data_query.text_10,
        })

@csrf_exempt
def waiting_list_sys_admin_set(request):
    data_query = ScreenInfo.objects.filter().first()
    if data_query == None:
        data_query = ScreenInfo()

    data_query.interval_sec = request.POST.get('interval_sec','1')
    data_query.text_interval_sec = request.POST.get('text_interval_sec','1')
    data_query.text_1 = request.POST.get('text1','')
    data_query.text_2 = request.POST.get('text2','')
    data_query.text_3 = request.POST.get('text3','')
    data_query.text_4 = request.POST.get('text4','')
    data_query.text_5 = request.POST.get('text5','')
    data_query.text_6 = request.POST.get('text6','')
    data_query.text_7 = request.POST.get('text7','')
    data_query.text_8 = request.POST.get('text8','')
    data_query.text_9 = request.POST.get('text9','')
    data_query.text_10 = request.POST.get('text10','')

    data_query.last_modifier = "ADMIN"
    data_query.last_modified_date = datetime.datetime.now()

    data_query.save()

    return JsonResponse({
        'result':True,

        })


# get exam info
def get_order_result(request):
    try:
        diagnosis_id  = request.GET.get('orderCode')
        
        test_query = TestManager.objects.select_related('testmanage').select_related('diagnosis').filter(diagnosis_id = diagnosis_id)
        
        datas=[]
        for test in test_query:
            print(type(test))
            datas.append({
                    'KetQua':'' if test.testmanage.result is None or '' else test.testmanage.result,
                    "ListSubTestResult": [],
                    "MaBenhNhan": "",
                    'MaDV':test.test.code,
                    'TenDichVu':test.testmanage.name_service,
                    "NormalRange": None,
                    "MaLoaiDV": "XN",
                    "TenLoaiDV": "Xét nghiệm",
                    "OrderDetailID": test.testmanage.id
                })
        
        diagnosis = Diagnosis.objects.get(id = diagnosis_id)
        gender = diagnosis.reception.patient.gender 
        g = 'M'
        if gender != 'Male':
            g = 'F'
        final_data = {
            "Address": diagnosis.reception.patient.address,
            "CapCuu": False,
            "ChanDoan": diagnosis.diagnosis,
            "DoctorName": diagnosis.reception.doctor.name_eng,
            "GioChiDinh": diagnosis.reception.recorded_date,
            "GioiTinh": g,
            "HoTen": diagnosis.reception.patient.name_kor + ' / ' + diagnosis.reception.patient.name_eng,
            "LocationName": "Xét nghiệm",
            "MaBSChiDinh": diagnosis.reception.doctor.id,
            "MaDoiTuong": "None",
            "MaKhoaPhong": "XN",
            "MaYTe": diagnosis_id,
            "DateOfBirth": diagnosis.reception.patient.date_of_birth.strftime('%Y-%m-%d'),
            "ObjectName": None,
            "OrderId": diagnosis_id,
            "PatientId": diagnosis.reception.patient.id,
            "SampleId": None,
            "Sequence": None,
            "email": diagnosis.reception.patient.email,
            "ListTestResult": datas,
        }
        return JsonResponse({
            'GetOrderResult':final_data
        })
    except Exception as e:
        return JsonResponse({'result': str(e)}) 


def get_order_result_by_patient(request):
    try:
        patient_code = request.GET.get('examinationCode')
        date_request = request.GET.get('dateRequest')
        depart_id = request.GET.get('ReceptionDepartment', 0)
        depart_id = int(depart_id)
        if depart_id != 0:
            reception = Reception.objects \
            .filter( patient_id = patient_code, recorded_date__year=date_request[0:4], recorded_date__month=date_request[4:6], recorded_date__day=date_request[6:], depart_id=depart_id)\
            .exclude(progress='deleted').last()
        else:
            reception = Reception.objects.filter( patient_id = patient_code, recorded_date__year=date_request[0:4], recorded_date__month=date_request[4:6], recorded_date__day=date_request[6:]).last()
        if not reception:
            return JsonResponse({'result': 'no result 1'}) 

        diagnosis = None
        # print(reception)
        # for r in reception:
        #     print(r)
        diagnosis = Diagnosis.objects.filter(reception_id = reception.id).first()
            # diagnosis = r.diagnosis
            # if diagnosis:
            #     print(r)
            #     break
        if not diagnosis:
            return JsonResponse({'result': 'no result 2'}) 
        
        diagnosis_id = diagnosis.id

        test_query = TestManager.objects.select_related('testmanage').select_related('diagnosis').filter(diagnosis_id = diagnosis_id, test__parent_test=None)
        print(test_query)
        datas=[]
        for test in test_query:
            if test.status == 0 :
                sub_tests = Test.objects.filter(parent_test__code = test.test.code)
                list_subtests = []
                for sub_test in sub_tests:
                    # if language == 'ko':
                    #     name_service = sub_test.name
                    # else:
                    #     name_service = sub_test.name_vie
                    list_subtests.append({
                        "KetQua": None,
                        "MaDV": sub_test.code,
                        "MaDVCha": test.test.code,
                        "MaLoaiDV": 'XN',
                        "NormalRange": '',
                        "TenDichVu": sub_test.name_vie,
                        "TenLoaiDV": "Xét Nghiệm"
                    })
                datas.append({
                    'KetQua':'' if test.testmanage.result is None or '' else test.testmanage.result,
                    "ListSubTestResult": list_subtests,
                    "MaBenhNhan": "",
                    'MaDV':test.test.code,
                    'TenDichVu':test.testmanage.name_service,
                    "NormalRange": None,
                    "MaLoaiDV": "XN",
                    "TenLoaiDV": "Xét nghiệm",
                    "OrderDetailID": test.testmanage.id
                })
        
        diagnosis = Diagnosis.objects.get(id = diagnosis_id)
        gender = diagnosis.reception.patient.gender
        g = 'M'
        if gender != 'Male':
            g = 'F'

        year = diagnosis.reception.patient.date_of_birth.year
        month = diagnosis.reception.patient.date_of_birth.month
        day = diagnosis.reception.patient.date_of_birth.day
        final_data = {
            "Address": diagnosis.reception.patient.address,
            "CapCuu": False,
            "ChanDoan": diagnosis.diagnosis,
            "DoctorName": diagnosis.reception.doctor.name_eng,
            "GioChiDinh": diagnosis.reception.recorded_date,
            "GioiTinh": g,
            "HoTen": diagnosis.reception.patient.name_kor + ' / ' + diagnosis.reception.patient.name_eng,
            "LocationName": diagnosis.reception.depart.name,
            "MaBSChiDinh": diagnosis.reception.doctor.id,
            "MaDoiTuong": 0,
            "MaKhoaPhong": diagnosis.reception.depart.id,
            "MaYTe": diagnosis_id,
            "DateOfBirth": datetime.datetime(year, month, day),
            "ObjectName": 'Normal',
            "OrderId": diagnosis_id,
            "PatientId": diagnosis.reception.patient.id,
            "SampleId": None,
            "Sequence": None,
            "Nationality": diagnosis.reception.patient.nationality,
            "PhoneNumber": diagnosis.reception.patient.phone,
            "PassPort": diagnosis.reception.patient.passport,
            "BHYT": '',
            "email": diagnosis.reception.patient.email,
            "ListTestResult": datas,


        }
        return JsonResponse({
            'GetOrderResult':final_data
        })
    except Exception as e:
        return JsonResponse({'result': str(e)}) 


@csrf_exempt
def update_result(request):
    try:

        data = json.loads(request.body)
        data = data['result']

        diagnosis_id = data['OrderId']
        list_test_results = data['ListTestResult']
        
        test_query = TestManager.objects.select_related('diagnosis').filter(diagnosis_id = diagnosis_id)
        for test in list_test_results:

            parent_test_query = test_query.select_related('testmanage').filter(testmanage__id=test['OrderDetailID']).first()
            if parent_test_query:
                parent_test_query.testmanage.result = test['KetQua'] if test['KetQua'] else ''
                parent_test_query.testmanage.save()
            else:
                print('*',parent_test_query)
                print('*',test['OrderDetailID'])
            if test['ListSubTestResult']:
                for sub_test in test['ListSubTestResult']:
                    sub_test_query = test_query.select_related('testmanage').filter(test__code = sub_test['MaDV']).first()
                    if sub_test_query:
                        sub_test_query.testmanage.result = sub_test['KetQua'] if sub_test['KetQua'] else ''
                        sub_test_query.testmanage.save()
                    else:
                        print('#',sub_test_query)
 
        # for test in list_test_results:
        #     for test_q in test_query:
        #         if str(test['OrderDetailID']) == str(test_q.testmanage.id):
        #             test_q.testmanage.result = test['KetQua']

        #             test_q.testmanage.save()
        
        return JsonResponse({'result': 'ok'})
    except Exception as e:
        return JsonResponse({'result': str(e)}) 


# update tests status
@csrf_exempt
def update_status_order(request):

    try:
        data = json.loads(request.body)
        data = data['request']
        for d in data:
            order_detail_id = int(d['OrderDetailID'])
            status = d['StatusTest']
            test = TestManager.objects.filter(testmanage__id = order_detail_id).first()
            test.status = status
            test.save()
            print(test.status)
        return JsonResponse({'result': 'ok'})
    
    except Exception as e:
        return JsonResponse({'result': str(e)})
    

def get_list_test(request):
    ds = Depart.objects.all()
    for d in ds:
        print(d.id, d.name)
    # patient_code = request.GET.get('examinationCode')
    # date_request = request.GET.get('dateRequest')
    # depart_id = request.GET.get('ReceptionDepartment', 0)
    # depart_id = int(depart_id)
    # if depart_id != 0:
    #     reception = Reception.objects.filter( patient_id = patient_code, recorded_date__year=date_request[0:4], recorded_date__month=date_request[4:6], recorded_date__day=date_request[6:], depart_id=depart_id).first()
    # else:
    #     reception = Reception.objects.filter( patient_id = patient_code, recorded_date__year=date_request[0:4], recorded_date__month=date_request[4:6], recorded_date__day=date_request[6:]).first()
    # if not reception:
    #     return JsonResponse({'result': 'no result'}) 
    
    # diagnosis = Diagnosis.objects.filter(reception_id = reception.id).first()

    # test_set = TestManager.objects.filter(diagnosis_id = diagnosis.id)
    # test_quality = len(test_set)
    # data = { 
    # "ReceptionCode": str(diagnosis.reception.patient.id),
    # "PatientName": diagnosis.reception.patient.get_name_kor_eng(),
    # "Age": diagnosis.reception.patient.get_age(), 
    # "RequestDate": datetime.date.today().__str__(), 
    # "Sex": "F", 
    # # "SerialNumber": 1, 
    # # "Priority": False, 
    # "Quantity": test_quality, 
    # "ReceptionDepartment": str(reception.depart.id),
    # "email": diagnosis.reception.patient.email,
    # }

    # return JsonResponse(data)

    my_test = []
    # tests = Test.objects.all()
    doctors = Doctor.objects.all()

    for dts in doctors:
        print(dts.id, dts.depart, dts.name_eng, sep=',')


    ds = Depart.objects.all()
    # with open('tests.csv', 'w') as f:
    #     writer = csv.writer(f)
    #     for doctor in doctors:

    #     #         'depart_name': d.name,
    #     #         'depart_id': d.id
    #     #     }
    #     #     my_test.append(obj)
    #         writer.writerow([doctor.id,doctor.name_eng, doctor.name_kor, doctor.depart.name])
    #     # for test in tests:
    #     #     obj = {
    #     #         'id': test.id,
    #     #         'name': test.name,
    #     #         'name_vie': test.name_vie,
    #     #         'code': test.code,
    #     #         'parent_test': test.parent_test.code if test.parent_test else None
    #     #     }
    #     #     my_test.append(obj)
    #     #     writer.writerow([test.id, test.name, test.name_vie, test.code, test.parent_test.code if test.parent_test else ''])
    for d in ds:
        obj = {
            'depart_name': d.name,
            'depart_id': d.id
        }
        my_test.append(obj)
    return JsonResponse({'result': my_test})

#1
def get_token(request):
    url = 'https://testapi.meinvoice.vn/api/v3/auth/token'
    body = {
        "appid": "7291159a-cbb1-43b2-8e0b-673a4586a8c7",
        "taxcode": "6868686868-125",
        "username": "testmisa@yahoo.com",
        "password": "123456Aa"
    }
    response = requests.post(url, json=body)
    data = response.json()

    return JsonResponse({"data": data['Data']})
#2
def get_invoice_template(request):
    token = request.POST.get('token')
    year = datetime.datetime.now().year
    url = f'https://testapi.meinvoice.vn/api/v3/code/itg/InvoicePublishing/templates?invyear={year}'

    header = {
        "CompanyTaxCode": "6868686868-125",
        'Authorization': f'Bearer {token}',
    }

    response = requests.get(url, headers=header)
    data = response.json()
    data = data['Data']
    template = json.loads(data)[0]['InvSeries']
    return JsonResponse({"data": template})

def create_invoice(request):
    url = 'https://testapi.meinvoice.vn/api/v3/code/itg/invoicepublishing/createinvoice'
    company_tax = '6868686868-125'
    token = request.POST.get('token')
    template = request.POST.get('template')
    reception_id = request.POST.get('rec_id')
    reception = Reception.objects.get(pk = reception_id)
    diagnosis = Diagnosis.objects.get(reception_id = reception_id)
    payment = Payment.objects.get(reception_id = reception_id)

    exam_set = ExamManager.objects.filter(diagnosis_id = diagnosis.id)
    test_set = TestManager.objects.filter(diagnosis_id = diagnosis.id, test__parent_test = None)
    precedure_set = PrecedureManager.objects.filter(diagnosis_id = diagnosis.id)
    medicine_set = MedicineManager.objects.filter(diagnosis_id = diagnosis.id)
    try:
        taxinvoice = TaxInvoice.objects.get(patient = reception.patient)
    except TaxInvoice.DoesNotExist:
        taxinvoice = None

    data = {
            "RefID": reception_id,
            "InvSeries": template,
            "InvoiceName": 'Hóa đơn khám bệnh',
            "InvDate": "2021-11-08T19:11:51.2675125+07:00",   
            "CurrencyCode": "VND",
            "ExchangeRate": 1.0,
            "PaymentMethodName": "TM/CK",  
            "BuyerLegalName": taxinvoice.company_name,
            "BuyerTaxCode": taxinvoice.number,
            "BuyerAddress": taxinvoice.address,
            "BuyerCode": reception.patient.getID(),
            "BuyerPhoneNumber": reception.patient.phone,
            "BuyerEmail": reception.patient.email,
            "BuyerFullName": reception.patient.name_kor,
            "BuyerBankAccount": "",
            "BuyerBankName": "",
            "ReferenceType": None,
            "OrgInvoiceType": None,
            "OrgInvTemplateNo": None,
            "OrgInvSeries": None,
            "OrgInvNo": None,
            "OrgInvDate": None,
            "TotalSaleAmountOC": payment.sub_total,
            "TotalSaleAmount": payment.sub_total,
            "TotalAmountWithoutVATOC": payment.sub_total,
            "TotalAmountWithoutVAT": payment.sub_total,
            "TotalVATAmountOC": payment.total / 11,
            "TotalVATAmount": payment.total / 11 ,
            "TotalDiscountAmountOC": payment.discounted_amount,
            "TotalDiscountAmount": payment.discounted_amount,
            "TotalAmountOC": payment.total,
            "TotalAmount": payment.total,
            "TotalAmountInWords": doc_so(payment.total),
            "TaxRateInfo": [
                {
                "VATRateName": "0%",
                "AmountWithoutVATOC": 0,
                "VATAmountOC": 0
                }
            ],
            "OptionUserDefined":{
                "MainCurrency": "VND",
                "AmountDecimalDigits": "0",
                "AmountOCDecimalDigits": "2",
                "UnitPriceOCDecimalDigits": "0",
                "UnitPriceDecimalDigits": "1",
                "QuantityDecimalDigits": "2",
                "CoefficientDecimalDigits": "2",
                "ExchangRateDecimalDigits": "0"
            },
            "OriginalInvoiceDetail": []
        }
    
    list_odatadetail = []

    count = 1
    for mdata in exam_set:
        count += 1
        exam = {}
        exam.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": 1,
                "ItemCode": mdata.exam.code,
                "ItemName": mdata.exam.name,
                "UnitName": '',
                "Quantity": 1,
                "UnitPrice": mdata.exam.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":mdata.exam.get_price(),
                "Amount": mdata.exam.get_price(),
                "AmountWithoutVATOC": mdata.exam.get_price(),                                    
                "AmountWithoutVAT": mdata.exam.get_price(),
                "VATRateName": "0%",
                "VATAmountOC": 0,
                "VATAmount": 0    
            })
        list_odatadetail.append(exam)


    for mdata in test_set:
        count += 1
        test = {}
        test.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": 1,
                "ItemCode": mdata.test.code,
                "ItemName": mdata.test.name,
                "UnitName": '',
                "Quantity": 1,
                "UnitPrice": mdata.test.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":mdata.test.get_price(),
                "Amount": mdata.test.get_price(),
                "AmountWithoutVATOC": mdata.test.get_price(),                                    
                "AmountWithoutVAT": mdata.test.get_price(),
                "VATRateName": "0%",
                "VATAmountOC": 0,
                "VATAmount": 0    
            })
        list_odatadetail.append(test)

 
    for mdata in precedure_set:
        count += 1
        prec = {}
        prec.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": 1,
                "ItemCode": mdata.precedure.code,
                "ItemName": mdata.precedure.name,
                "UnitName": '',
                "Quantity": mdata.amount,
                "UnitPrice": mdata.precedure.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":mdata.precedure.get_price() ,
                "Amount": mdata.precedure.get_price(),
                "AmountWithoutVATOC": mdata.precedure.get_price(),                                    
                "AmountWithoutVAT": mdata.precedure.get_price(),
                "VATRateName": "0%",
                "VATAmountOC": 0,
                "VATAmount": 0    
            })
        list_odatadetail.append(prec)

  
    for mdata in medicine_set:
        count += 1
        med = {}
        quantity = int(mdata.days) * int(mdata.amount)
        price = quantity * int(mdata.medicine.get_price())
        med.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": 1,
                "ItemCode": mdata.medicine.code,
                "ItemName": mdata.medicine.name,
                "UnitName": '',
                "Quantity": quantity,
                "UnitPrice": mdata.medicine.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":price,
                "Amount": price,
                "AmountWithoutVATOC": price,                                    
                "AmountWithoutVAT": price,
                "VATRateName": "0%",
                "VATAmountOC": 0,
                "VATAmount": 0    
            })
        list_odatadetail.append(med)

    data['OriginalInvoiceDetail'] = list_odatadetail   
    
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'CompanyTaxCode': company_tax
    }   

    print(data)
    response = requests.post(url, headers=headers, json=data)
    print(response.json())
    # link = response.json()['Data']
    return JsonResponse({'data': 'ok'})
    
def public_invoice2(request):
    url = 'https://testapi.meinvoice.vn/api/v3/code/itg/invoicepublishing/publishHSM'

    company_tax = '6868686868-125'
    token = request.POST.get('token')
    template = request.POST.get('template')

    reception_id = request.POST.get('rec_id')

    datas = []
    data = {}
    data['RefID'] = reception_id
    odata = {} #
    odatadetail = {}

    odata['RefID'] = reception_id
    odata['InvSeries'] = template

    odata['InvoiceName'] = 'Hóa đơn khám bệnh'
    odata['CurrencyCode'] = 'VND'
    odata['ExchangeRate'] = 1
    odata['PaymentMethodName'] = 'TM/CK'
    # odata['InvDate'] = "2024-07-07"
    reception = Reception.objects.get(pk = reception_id)
    diagnosis = Diagnosis.objects.get(reception_id = reception_id)
    payment = Payment.objects.get(reception_id = reception_id)

    exam_set = ExamManager.objects.filter(diagnosis_id = diagnosis.id)
    test_set = TestManager.objects.filter(diagnosis_id = diagnosis.id, test__parent_test = None)
    precedure_set = PrecedureManager.objects.filter(diagnosis_id = diagnosis.id)
    medicine_set = MedicineManager.objects.filter(diagnosis_id = diagnosis.id)


    try:
        taxinvoice = TaxInvoice.objects.get(patient = reception.patient)
    except TaxInvoice.DoesNotExist:
        taxinvoice = None

    odata['InvDate'] = reception.recorded_date.strftime("%Y-%m-%d")
    odata['BuyerTaxCode'] = taxinvoice.number
    odata['BuyerAddress'] = taxinvoice.address
    odata['BuyerCode'] = reception.patient.getID()

    if reception.patient.nationality == 'Vietnam':
        odata['BuyerFullName'] = reception.patient.name_kor
    else:
        odata['BuyerFullName'] = reception.patient.name_eng

    odata['BuyerPhoneNumber'] = reception.patient.phone
    odata['BuyerEmail'] = reception.patient.email
    odata['BuyerLegalName'] = taxinvoice.company_name

    odata['ContactName'] = 'Imedicare'
        
    odata['TotalSaleAmountOC'] = payment.sub_total
    odata['TotalSaleAmount'] = payment.sub_total
    odata['TotalDiscountAmountOC'] = payment.discounted_amount
    odata['TotalDiscountAmount'] = payment.discounted_amount
    odata['TotalAmountWithoutVATOC'] = payment.total / 11 * 10
    odata['TotalAmountWithoutVAT'] = payment.total / 11 * 10
    odata['TotalVATAmountOC'] = payment.total / 11 
    odata['TotalVATAmount1qa'] = payment.total / 11 
    odata['TotalAmountOC'] = payment.total
    odata['TotalAmount'] = payment.total
    odata['TotalAmountInWords'] = 'hehehehe'
    odata['IsTaxReduction43'] = False

    list_odatadetail = []

    count = 0
    for mdata in exam_set:
        count += 1
        exam = {}
        exam.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": 1,
                "ItemCode": mdata.exam.code,
                "ItemName": mdata.exam.name,
                "UnitName": '',
                "Quantity": 1,
                "UnitPrice": mdata.exam.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":mdata.exam.get_price(),
                "Amount": mdata.exam.get_price(),
                "AmountWithoutVATOC": mdata.exam.get_price(),                                    
                "AmountWithoutVAT": mdata.exam.get_price(),
                "VATRateName": "0%",
                "VATAmountOC": 0,
                "VATAmount": 0    
            })
        list_odatadetail.append(exam)


    for mdata in test_set:
        count += 1
        test = {}
        test.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": 1,
                "ItemCode": mdata.test.code,
                "ItemName": mdata.test.name_vie,
                "UnitName": '',
                "Quantity": 1,
                "UnitPrice": mdata.test.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":mdata.test.get_price(),
                "Amount": mdata.test.get_price(),
                "AmountWithoutVATOC": mdata.test.get_price(),                                    
                "AmountWithoutVAT": mdata.test.get_price(),
                "VATRateName": "0%",
                "VATAmountOC": 0,
                "VATAmount": 0    
            })
        list_odatadetail.append(test)

 
    for mdata in precedure_set:
        count += 1
        prec = {}
        prec.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": 1,
                "ItemCode": mdata.precedure.code,
                "ItemName": mdata.precedure.name_vie,
                "UnitName": '',
                "Quantity": mdata.amount,
                "UnitPrice": mdata.precedure.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":mdata.precedure.get_price() ,
                "Amount": mdata.precedure.get_price(),
                "AmountWithoutVATOC": mdata.precedure.get_price(),                                    
                "AmountWithoutVAT": mdata.precedure.get_price(),
                "VATRateName": "0%",
                "VATAmountOC": 0,
                "VATAmount": 0    
            })
        list_odatadetail.append(prec)

  
    for mdata in medicine_set:
        count += 1
        med = {}
        quantity = int(mdata.days) * int(mdata.amount)
        price = quantity * int(mdata.medicine.get_price())
        med.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": 1,
                "ItemCode": mdata.medicine.code,
                "ItemName": mdata.medicine.name_vie,
                "UnitName": mdata.medicine.unit_vie,
                "Quantity": quantity,
                "UnitPrice": mdata.medicine.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":price,
                "Amount": price,
                "AmountWithoutVATOC": price,                                    
                "AmountWithoutVAT": price,
                "VATRateName": "0%",
                "VATAmountOC": 0,
                "VATAmount": 0    
            })
        list_odatadetail.append(med)
        
        
    


    odata['OriginalInvoiceDetail'] = list_odatadetail
    data['OriginalInvoiceData'] = odata

    tax_info = {}
    tax_info['VATRateName'] = '0%'
    tax_info['AmountWithoutVATOC'] = 10000
    tax_info['VATAmountOC'] = 0
    odata['TaxRateInfo'] = [tax_info]
    odata['FeeInfo'] = None

    option = {}
    option['MainCurrency'] = 'VND'
    option['AmountDecimalDigits'] = '0'
    option['AmountOCDecimalDigits'] = '0'
    option['UnitPriceOCDecimalDigits'] = '0'
    option['UnitPriceDecimalDigits'] = '0'
    option['QuantityDecimalDigits'] = '2'
    option['CoefficientDecimalDigits'] = '0'
    option['ExchangRateDecimalDigits'] = '0'
    option['ClockDecimalDigits'] = '2'

    odata['OptionUserDefined'] = option

    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'CompanyTaxCode': company_tax
    }   

    datas.append(data)
    print(data)
    response = requests.post(url, headers=headers, json=datas)
    print(response.json())
    return JsonResponse({'result': 'ok'})

#3
def view_invoice(request):
    url = 'https://testapi.meinvoice.vn/api/v3/code/itg/invoicepublishing/invoicelinkview?type=1'

    company_tax = '6868686868-125'
    token = request.POST.get('token')
    template = request.POST.get('template')
    reception_id = request.POST.get('rec_id')

    reception = Reception.objects.get(pk = reception_id)
    diagnosis = Diagnosis.objects.get(reception_id = reception_id)
    payment = Payment.objects.get(reception_id = reception_id)
    exam_set = ExamManager.objects.filter(diagnosis_id = diagnosis.id)
    test_set = TestManager.objects.filter(diagnosis_id = diagnosis.id, test__parent_test = None)
    precedure_set = PrecedureManager.objects.filter(diagnosis_id = diagnosis.id)
    medicine_set = MedicineManager.objects.filter(diagnosis_id = diagnosis.id)

    try:
        taxinvoice = TaxInvoice.objects.get(patient = reception.patient)
    except TaxInvoice.DoesNotExist:
        taxinvoice = None
    print(reception_id)
    odata = {
        "RefID":reception_id,
        "InvSeries":template,
        "InvoiceName":'Hóa đơn khám bệnh',
        "CurrencyCode":"VND",
        "ExchangeRate":1,
        "InvDate": reception.recorded_date.strftime("%Y-%m-%d"),
        "PaymentMethodName":"TM/CK",
        "BuyerTaxCode":taxinvoice.number,
        "BuyerAddress":taxinvoice.address,
        "BuyerCode":reception.patient.getID(),
        "BuyerFullName":reception.patient.name_eng,
        "BuyerPhoneNumber":reception.patient.phone,
        "BuyerEmail":reception.patient.email,
        "BuyerLegalName":taxinvoice.company_name,
        "ContactName": 'Imedicare',
        "TotalSaleAmountOC":payment.sub_total,
        "TotalSaleAmount":payment.sub_total,
        "TotalDiscountAmountOC":0,
        "TotalDiscountAmount":0,
        "TotalAmountOC":payment.total,
        "TotalAmount":payment.total,
        "TotalAmountInWords":doc_so(payment.total),
        "IsTaxReduction43":False,

        "OptionUserDefined":{
            "MainCurrency": "VND",
            "AmountDecimalDigits": "0",
            "AmountOCDecimalDigits": "2",
            "UnitPriceOCDecimalDigits": "0",
            "UnitPriceDecimalDigits": "1",
            "QuantityDecimalDigits": "2",
            "CoefficientDecimalDigits": "2",
            "ExchangRateDecimalDigits": "0",
            'ClockDecimalDigits' : '2'
        },
        "OriginalInvoiceDetail": [],
        "FeeInfo": None
    }

    if reception.need_invoice_p:
        odata['BuyerAddress'] = taxinvoice.address_p
        odata['BuyerLegalName'] = reception.patient.name_eng
    vat_0 = 0
    vat_5 = 0
    vat_10 = 0

    a_w_vat_0 = 0
    a_w_vat_5 = 0
    a_w_vat_10 = 0

    list_odatadetail = []
    count = 0
    for mdata in exam_set:
        count = count + 1
        print('count', count)
        exam = {}

        vat = get_vat(mdata.exam.code)
        print(vat)
        print(mdata.exam.code)
        vat_name = get_vat_name(mdata.exam.code)
        amount = mdata.exam.get_price()
        vat_amount = mdata.exam.get_price() * vat
        amount_without_vat = amount - vat_amount
        percent = 0
        if vat_name == 'KCT':
           print('====', 0)
           vat_0 += vat_amount
           a_w_vat_0 += amount_without_vat
           percent = 0
        elif vat_name == '5%':
            print('====', 5)
            vat_5 += vat_amount
            a_w_vat_5 += amount_without_vat
            percent = 5
        elif vat_name == '10%':
            print('====', 10)
            vat_10 += vat_amount
            a_w_vat_10 += amount_without_vat
            percent = 10
        print('vat_name', vat_name)

        unit_price = mdata.exam.get_price() * (100-percent)/100 - payment.discounted_amount
        exam.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": count,
                "ItemCode": mdata.exam.code,
                "ItemName": mdata.exam.name,
                "UnitName": '',
                "Quantity": 1,
                "UnitPrice": unit_price,
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":amount,
                "Amount": amount,
                "AmountWithoutVATOC": amount_without_vat,                                    
                "AmountWithoutVAT":  amount_without_vat,
                "VATRateName": vat_name,
                "VATAmountOC": vat_amount,
                "VATAmount": vat_amount    
            })
        list_odatadetail.append(exam)

    for mdata in test_set:
        count = count + 1
        print('count', count)
        test = {}

        vat = get_vat(mdata.test.code)
        print(vat)
        vat_name = get_vat_name(mdata.test.code)
        amount = mdata.test.get_price()
        vat_amount = mdata.test.get_price() * vat
        amount_without_vat = amount - vat_amount
        percent = 0
        if vat_name == 'KCT':
           vat_0 += vat_amount
           a_w_vat_0 += amount_without_vat
           percent = 0
        elif vat_name == '5%':
            vat_5 += vat_amount
            a_w_vat_5 += amount_without_vat
            percent = 5
        elif vat_name == '10%':
            vat_10 += vat_amount
            a_w_vat_10 += amount_without_vat
            percent = 10
        test.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": count,
                "ItemCode": mdata.test.code,
                "ItemName": mdata.test.name_vie,
                "UnitName": '',
                "Quantity": 1,
                "UnitPrice": mdata.test.get_price() * (100-percent)/100,
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":amount,
                "Amount": amount,
                "AmountWithoutVATOC": amount_without_vat,                                    
                "AmountWithoutVAT":  amount_without_vat,
                "VATRateName": vat_name,
                "VATAmountOC": vat_amount,
                "VATAmount": vat_amount    
            })
        list_odatadetail.append(test)

    for mdata in precedure_set:
        count = count + 1
        print('count', count)
        prec = {}

        vat = get_vat(mdata.precedure.code)
        print(vat)
        vat_name = get_vat_name(mdata.precedure.code)
        amount = mdata.precedure.get_price()
        vat_amount = mdata.precedure.get_price() * vat
        amount_without_vat = amount - vat_amount
        percent = 0
        if vat_name == 'KCT':
           vat_0 += vat_amount
           a_w_vat_0 += amount_without_vat
           percent = 0
        elif vat_name == '5%':
            vat_5 += vat_amount
            a_w_vat_5 += amount_without_vat
            percent = 5
        elif vat_name == '10%':
            vat_10 += vat_amount
            a_w_vat_10 += amount_without_vat
            percent = 10
        prec.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": count,
                "ItemCode": mdata.precedure.code,
                "ItemName": mdata.precedure.name_vie,
                "UnitName": '',
                "Quantity": mdata.amount,
                "UnitPrice": mdata.precedure.get_price() * (100-percent)/100,
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":amount,
                "Amount": amount,
                "AmountWithoutVATOC": amount_without_vat,                                    
                "AmountWithoutVAT":  amount_without_vat,
                "VATRateName": vat_name ,#mdata.precedure.vat,
                "VATAmountOC": vat_amount,
                "VATAmount": vat_amount    
            })
        list_odatadetail.append(prec)

    for mdata in medicine_set:
        count = count + 1
        print('count', count)
        med = {}

        vat = get_vat(mdata.medicine.code)
        print(vat)
        vat_name = get_vat_name(mdata.medicine.code)

        quantity = int(mdata.days) * int(mdata.amount)
        price = quantity * int(mdata.medicine.get_price())
        vat_amount = price * vat
        amount_without_vat = price - vat_amount
        percent = 0
        if vat_name == 'KCT':
           vat_0 += vat_amount
           a_w_vat_0 += amount_without_vat
           percent = 0
        elif vat_name == '5%':
            vat_5 += vat_amount
            a_w_vat_5 += amount_without_vat
            percent = 5
        elif vat_name == '10%':
            vat_10 += vat_amount
            a_w_vat_10 += amount_without_vat
            percent = 10
        med.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": count,
                "ItemCode": mdata.medicine.code,
                "ItemName": mdata.medicine.name,
                "UnitName": mdata.medicine.unit_vie,
                "Quantity": quantity,
                "UnitPrice": mdata.medicine.get_price() * (100-percent)/100,
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":price,
                "Amount": price,
                "AmountWithoutVATOC": amount_without_vat,                                    
                "AmountWithoutVAT": amount_without_vat,
                "VATRateName": vat_name,
                "VATAmountOC": vat_amount,
                "VATAmount": vat_amount    
            })
        list_odatadetail.append(med)
        

    odata['OriginalInvoiceDetail'] = list_odatadetail

    vat_rate_list = []
    if a_w_vat_0 != 0:
        tax_rate_0 = {
            'VATRateName' : 'KCT',
            'AmountWithoutVATOC': a_w_vat_0,
            'VATAmountOC': vat_0
        }
        vat_rate_list.append(tax_rate_0)
    if a_w_vat_5 != 0:
        tax_rate_5 = {
            'VATRateName' : '5%',
            'AmountWithoutVATOC': a_w_vat_5,
            'VATAmountOC': vat_5
        }
        vat_rate_list.append(tax_rate_5)

    if a_w_vat_10 != 0:
        tax_rate_10 = {
            'VATRateName' : '10%',
            'AmountWithoutVATOC': a_w_vat_10,
            'VATAmountOC': vat_10
        }
        vat_rate_list.append(tax_rate_10)
    
    odata['TaxRateInfo'] = vat_rate_list

    odata['TotalAmountWithoutVATOC'] = a_w_vat_0 + a_w_vat_5 + a_w_vat_10
    odata['TotalAmountWithoutVAT'] = a_w_vat_0 + a_w_vat_5 + a_w_vat_10
    odata['TotalVATAmountOC'] = vat_0 + vat_5 + vat_10
    odata['TotalVATAmount'] = vat_0 + vat_5 + vat_10

        # "TotalAmountWithoutVATOC":payment.total / 11 * 10,
        # "TotalAmountWithoutVAT":payment.total / 11 * 10,
        # "TotalVATAmountOC":payment.total / 11 ,
        # "TotalVATAmount":payment.total / 11 ,
    print(odata)
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'CompanyTaxCode': company_tax
    }   

    response = requests.post(url, headers=headers, json=odata)
    print(response.json())
    link = response.json()['Data']
    return JsonResponse({'data': link})
#4
def public_invoice(request):
    url = 'https://testapi.meinvoice.vn/api/v3/code/itg/invoicepublishing/publishHSM'

    company_tax = '6868686868-125'
    token = request.POST.get('token')
    template = request.POST.get('template')
    reception_id = request.POST.get('rec_id')

    reception = Reception.objects.get(pk = reception_id)
    diagnosis = Diagnosis.objects.get(reception_id = reception_id)
    payment = Payment.objects.get(reception_id = reception_id)
    exam_set = ExamManager.objects.filter(diagnosis_id = diagnosis.id)
    test_set = TestManager.objects.filter(diagnosis_id = diagnosis.id, test__parent_test = None)
    precedure_set = PrecedureManager.objects.filter(diagnosis_id = diagnosis.id)
    medicine_set = MedicineManager.objects.filter(diagnosis_id = diagnosis.id)

    try:
        taxinvoice = TaxInvoice.objects.get(patient = reception.patient)
    except TaxInvoice.DoesNotExist:
        taxinvoice = None
    print(reception_id)
    odata = {
        "RefID":reception_id,
        "InvSeries":template,
        "InvoiceName":'Hóa đơn khám bệnh',
        "CurrencyCode":"VND",
        "ExchangeRate":1,
        "InvDate": reception.recorded_date.strftime("%Y-%m-%d"),
        "PaymentMethodName":"TM/CK",
        "BuyerTaxCode":taxinvoice.number,
        "BuyerAddress":taxinvoice.address,
        "BuyerCode":reception.patient.getID(),
        "BuyerFullName":reception.patient.name_eng,
        "BuyerPhoneNumber":reception.patient.phone,
        "BuyerEmail":reception.patient.email,
        "BuyerLegalName":taxinvoice.company_name,
        "ContactName": 'Imedicare',
        "TotalSaleAmountOC":payment.sub_total,
        "TotalSaleAmount":payment.sub_total,
        "TotalDiscountAmountOC":payment.discounted_amount,
        "TotalDiscountAmount":payment.discounted_amount,
        "TotalAmountOC":payment.total,
        "TotalAmount":payment.total,
        "TotalAmountInWords":"",
        "IsTaxReduction43":False,

        "OptionUserDefined":{
            "MainCurrency": "VND",
            "AmountDecimalDigits": "0",
            "AmountOCDecimalDigits": "2",
            "UnitPriceOCDecimalDigits": "0",
            "UnitPriceDecimalDigits": "1",
            "QuantityDecimalDigits": "2",
            "CoefficientDecimalDigits": "2",
            "ExchangRateDecimalDigits": "0",
            'ClockDecimalDigits' : '2'
        },
        "OriginalInvoiceDetail": [],
        "FeeInfo": None
    }

    vat_0 = 0
    vat_5 = 0
    vat_10 = 0

    a_w_vat_0 = 0
    a_w_vat_5 = 0
    a_w_vat_10 = 0

    list_odatadetail = []
    count = 0
    for mdata in exam_set:
        count = count + 1
        print('count', count)
        exam = {}

        vat = get_vat(mdata.exam.code)
        print(vat)
        print(mdata.exam.code)
        vat_name = get_vat_name(mdata.exam.code)
        amount = mdata.exam.get_price()
        vat_amount = mdata.exam.get_price() * vat
        amount_without_vat = amount - vat_amount

        if vat_name == 'KCT':
           print('====', 0)
           vat_0 += vat_amount
           a_w_vat_0 += amount_without_vat
        elif vat_name == '5%':
            print('====', 5)
            vat_5 += vat_amount
            a_w_vat_5 += amount_without_vat
        elif vat_name == '10%':
            print('====', 10)
            vat_10 += vat_amount
            a_w_vat_10 += amount_without_vat
        print('vat_name', vat_name)
        exam.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": count,
                "ItemCode": mdata.exam.code,
                "ItemName": mdata.exam.name,
                "UnitName": '',
                "Quantity": 1,
                "UnitPrice": mdata.exam.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":amount,
                "Amount": amount,
                "AmountWithoutVATOC": amount_without_vat,                                    
                "AmountWithoutVAT":  amount_without_vat,
                "VATRateName": vat_name,
                "VATAmountOC": vat_amount,
                "VATAmount": vat_amount    
            })
        list_odatadetail.append(exam)

    for mdata in test_set:
        count = count + 1
        print('count', count)
        test = {}

        vat = get_vat(mdata.test.code)
        print(vat)
        vat_name = get_vat_name(mdata.test.code)
        amount = mdata.test.get_price()
        vat_amount = mdata.test.get_price() * vat
        amount_without_vat = amount - vat_amount

        if vat_name == 'KCT':
           vat_0 += vat_amount
           a_w_vat_0 += amount_without_vat
        elif vat_name == '5%':
            vat_5 += vat_amount
            a_w_vat_5 += amount_without_vat
        elif vat_name == '10%':
            vat_10 += vat_amount
            a_w_vat_10 += amount_without_vat
        test.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": count,
                "ItemCode": mdata.test.code,
                "ItemName": mdata.test.name_vie,
                "UnitName": '',
                "Quantity": 1,
                "UnitPrice": mdata.test.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":amount,
                "Amount": amount,
                "AmountWithoutVATOC": amount_without_vat,                                    
                "AmountWithoutVAT":  amount_without_vat,
                "VATRateName": vat_name,
                "VATAmountOC": vat_amount,
                "VATAmount": vat_amount    
            })
        list_odatadetail.append(test)

    for mdata in precedure_set:
        count = count + 1
        print('count', count)
        prec = {}

        vat = get_vat(mdata.precedure.code)
        print(vat)
        vat_name = get_vat_name(mdata.precedure.code)
        amount = mdata.precedure.get_price()
        vat_amount = mdata.precedure.get_price() * vat
        amount_without_vat = amount - vat_amount

        if vat_name == 'KCT':
           vat_0 += vat_amount
           a_w_vat_0 += amount_without_vat
        elif vat_name == '5%':
            vat_5 += vat_amount
            a_w_vat_5 += amount_without_vat
        elif vat_name == '10%':
            vat_10 += vat_amount
            a_w_vat_10 += amount_without_vat

        prec.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": count,
                "ItemCode": mdata.precedure.code,
                "ItemName": mdata.precedure.name_vie,
                "UnitName": '',
                "Quantity": mdata.amount,
                "UnitPrice": mdata.precedure.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":amount,
                "Amount": amount,
                "AmountWithoutVATOC": amount_without_vat,                                    
                "AmountWithoutVAT":  amount_without_vat,
                "VATRateName": vat_name ,#mdata.precedure.vat,
                "VATAmountOC": vat_amount,
                "VATAmount": vat_amount    
            })
        list_odatadetail.append(prec)

    for mdata in medicine_set:
        count = count + 1
        print('count', count)
        med = {}

        vat = get_vat(mdata.medicine.code)
        print(vat)
        vat_name = get_vat_name(mdata.medicine.code)

        quantity = int(mdata.days) * int(mdata.amount)
        price = quantity * int(mdata.medicine.get_price())
        vat_amount = price * vat
        amount_without_vat = price - vat_amount

        if vat_name == 'KCT':
           vat_0 += vat_amount
           a_w_vat_0 += amount_without_vat
        elif vat_name == '5%':
            vat_5 += vat_amount
            a_w_vat_5 += amount_without_vat
        elif vat_name == '10%':
            vat_10 += vat_amount
            a_w_vat_10 += amount_without_vat
        med.update({
                "ItemType": 1,
                "LineNumber": count,
                "SortOrder": count,
                "ItemCode": mdata.medicine.code,
                "ItemName": mdata.medicine.name,
                "UnitName": mdata.medicine.unit_vie,
                "Quantity": quantity,
                "UnitPrice": mdata.medicine.get_price(),
                "DiscountRate": None,
                "DiscountAmountOC": None,
                "DiscountAmount": None,
                "AmountOC":price,
                "Amount": price,
                "AmountWithoutVATOC": amount_without_vat,                                    
                "AmountWithoutVAT": amount_without_vat,
                "VATRateName": vat_name,
                "VATAmountOC": vat_amount,
                "VATAmount": vat_amount    
            })
        list_odatadetail.append(med)
        

    odata['OriginalInvoiceDetail'] = list_odatadetail

    vat_rate_list = []
    if a_w_vat_0 != 0:
        tax_rate_0 = {
            'VATRateName' : 'KCT',
            'AmountWithoutVATOC': a_w_vat_0,
            'VATAmountOC': vat_0
        }
        vat_rate_list.append(tax_rate_0)
    if a_w_vat_5 != 0:
        tax_rate_5 = {
            'VATRateName' : '5%',
            'AmountWithoutVATOC': a_w_vat_5,
            'VATAmountOC': vat_5
        }
        vat_rate_list.append(tax_rate_5)

    if a_w_vat_10 != 0:
        tax_rate_10 = {
            'VATRateName' : '10%',
            'AmountWithoutVATOC': a_w_vat_10,
            'VATAmountOC': vat_10
        }
        vat_rate_list.append(tax_rate_10)
    
    odata['TaxRateInfo'] = vat_rate_list

    odata['TotalAmountWithoutVATOC'] = a_w_vat_0 + a_w_vat_5 + a_w_vat_10
    odata['TotalAmountWithoutVAT'] = a_w_vat_0 + a_w_vat_5 + a_w_vat_10
    odata['TotalVATAmountOC'] = vat_0 + vat_5 + vat_10
    odata['TotalVATAmount'] = vat_0 + vat_5 + vat_10

        # "TotalAmountWithoutVATOC":payment.total / 11 * 10,
        # "TotalAmountWithoutVAT":payment.total / 11 * 10,
        # "TotalVATAmountOC":payment.total / 11 ,
        # "TotalVATAmount":payment.total / 11 ,
    data = [{
        'RefID': reception_id,
        'OriginalInvoiceData': odata
    }]
    headers = {
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json',
        'CompanyTaxCode': company_tax
    }   

    response = requests.post(url, headers=headers, json=data)
    print(response.json())
    return JsonResponse({'result': 'ok'})

def get_vat(string):
    data = {
        "BXBAL05": 5 ,
        "CAMERA_CS-C6N": 10 ,
        "CBC_Cleansing": 10 ,
        "CBC_Cream_100": 10 ,
        "CBC_Cream_250": 10 ,
        "CBC_Decon Gel": 10 ,
        "CBC_Mask Ice_1kg": 10 ,
        "CBC_Serum_500": 10 ,
        "CBC_Toner": 10 ,
        "CPMH": 10 ,
        "CUOCVC": 10 ,
        "D0033": 10 ,
        "D0034": 10 ,
        "D0063": "KCT" ,
        "D0098": "KCT" ,
        "D0102": "KCT" ,
        "D0104": "KCT" ,
        "D0105": "KCT" ,
        "D0106": "KCT" ,
        "D0107": "KCT" ,
        "D0108": "KCT" ,
        "D0110": "KCT" ,
        "D0111": "KCT" ,
        "D0114": "KCT" ,
        "D0115": "KCT" ,
        "D0116": "KCT" ,
        "D0117": "KCT" ,
        "D0118": "KCT" ,
        "D0121": "KCT" ,
        "D0122": "KCT" ,
        "D0123": "KCT" ,
        "D0124": "KCT" ,
        "D0125": "KCT" ,
        "D0128": 10 ,
        "D0129": 10 ,
        "D0134": 10 ,
        "D0140": "KCT" ,
        "D0141": "KCT" ,
        "D0142": 8 ,
        "D0143": 8 ,
        "D0147": "KCT" ,
        "D0152": 10 ,
        "D0155": "KCT" ,
        "D0157": "KCT" ,
        "D0158": "KCT" ,
        "D0159": "KCT" ,
        "D0162": "KCT" ,
        "D0164": "KCT" ,
        "D0172": "KCT" ,
        "D0180": "KCT" ,
        "D0182": "KCT" ,
        "D0186": "KCT" ,
        "D0187": "KCT" ,
        "D0188": 10 ,
        "D0189": "KCT" ,
        "D0196": "KCT" ,
        "D0211": "KCT" ,
        "D30001": "KCT" ,
        "D30002": "KCT" ,
        "D30003": "KCT" ,
        "D30004": "KCT" ,
        "D30005": "KCT" ,
        "D30006": "KCT" ,
        "D30007": "KCT" ,
        "D30008": "KCT" ,
        "D30009": "KCT" ,
        "D30010": "KCT" ,
        "D30011": "KCT" ,
        "D30012": "KCT" ,
        "D30013": "KCT" ,
        "D30014": "KCT" ,
        "D30015": "KCT" ,
        "D30016": "KCT" ,
        "D30017": "KCT" ,
        "D30018": "KCT" ,
        "D30020": "KCT" ,
        "D30021": "KCT" ,
        "D30023": "KCT" ,
        "D30024": "KCT" ,
        "D30025": "KCT" ,
        "D30026": "KCT" ,
        "D30027": "KCT" ,
        "D30028": "KCT" ,
        "D30029": "KCT" ,
        "D30030": "KCT" ,
        "D30054": 8 ,
        "D30055": 8 ,
        "D30056": 8 ,
        "D30057": 8 ,
        "D30059": 8 ,
        "D30060": 8 ,
        "D30061": 10 ,
        "D30062": "KCT" ,
        "D30063": "KCT" ,
        "D30067": 8 ,
        "D30068": "KCT" ,
        "DCPTOTSK": 5 ,
        "DD Aquasolution": 10 ,
        "DLKCB": "KCT" ,
        "DM0001": 10 ,
        "DM0002": 10 ,
        "DM0003": 10 ,
        "DM0004": 10 ,
        "DM0005": 10 ,
        "DM0006": 10 ,
        "DM0007": 10 ,
        "DM0008": 10 ,
        "DM0009": 10 ,
        "DM0010": 10 ,
        "DM0011": 10 ,
        "DM0012": 10 ,
        "DM0015": 10 ,
        "DM0016": 10 ,
        "DM0017": 10 ,
        "DM0018": 10 ,
        "DM0019": 10 ,
        "DM0020": 10 ,
        "DM0021": 8 ,
        "DM0022": 8 ,
        "DM0023": 8 ,
        "DM0024": 8 ,
        "DM0025": 10 ,
        "DM0026": 10 ,
        "DM0027": 10 ,
        "DM0028": 10 ,
        "DM0029": 10 ,
        "DM0030": 10 ,
        "DM0031": "KCT" ,
        "DM0032": "KCT" ,
        "DM0035": 10 ,
        "DM0036": 10 ,
        "DM0037": 10 ,
        "DM0038": 10 ,
        "DM0039": 10 ,
        "DM0040": 10 ,
        "DM0041": 10 ,
        "DM0042": 10 ,
        "DM0043": 10 ,
        "DM0044": 10 ,
        "DM0045": 10 ,
        "DM0046": 10 ,
        "DM0047": 10 ,
        "DM0048": 10 ,
        "DM0049": 10 ,
        "DM0050": 10 ,
        "DM0051": 10 ,
        "DM0052": 10 ,
        "DM0053": 10 ,
        "DM0054": 10 ,
        "DM0055": 10 ,
        "DM0056": 8 ,
        "DM0057": 8 ,
        "DM0058": 10 ,
        "DM0059": 10 ,
        "DM0060": 10 ,
        "DM0061": 10 ,
        "DM0076": "KCT" ,
        "DM0078": "KCT" ,
        "DM0082": "KCT" ,
        "DM0083": "KCT" ,
        "DM0084": "KCT" ,
        "DM0085": "KCT" ,
        "DM0086": "KCT" ,
        "DM0087": "KCT" ,
        "DM0089": "KCT" ,
        "DM0090": "KCT" ,
        "DM0091": "KCT" ,
        "DM0092": "KCT" ,
        "DM0097": 10 ,
        "DM0098": 10 ,
        "DM0101": 10 ,
        "DM0102": 10 ,
        "DM0103": 10 ,
        "DM0104": 10 ,
        "DM0114": 10 ,
        "DM0116": 10 ,
        "DM0117": 10 ,
        "DM0118": "KCT" ,
        "DM0122": 10 ,
        "DM0123": "KCT" ,
        "DM0125": "KCT" ,
        "DM0126": 10 ,
        "DM0127": 10 ,
        "DM0128": 10 ,
        "DM0129": 10 ,
        "DM0130": 10 ,
        "DM0138": "KCT" ,
        "DM0139": "KCT" ,
        "DM0140": "KCT" ,
        "DM0141": "KCT" ,
        "DM0142": "KCT" ,
        "DM0144": 10 ,
        "DM0147": "KCT" ,
        "DM0148": 10 ,
        "DM0153": 10 ,
        "DM0155": "KCT" ,
        "DM0157": "KCT" ,
        "DM0158": "KCT" ,
        "DM0159": "KCT" ,
        "DM0162": "KCT" ,
        "DM0165": "KCT" ,
        "DM0167": "KCT" ,
        "DM0168": 10 ,
        "DM0169": 10 ,
        "DM0170": 10 ,
        "DM0171": 10 ,
        "DM0172": "KCT" ,
        "DM0173": "KCT" ,
        "DM0174": "KCT" ,
        "DM0175": "KCT" ,
        "DSS": 8 ,
        "DVBR": 8 ,
        "DVCSD": 8 ,
        "DVCSYT": "KCT" ,
        "DVGNVC": 10 ,
        "DVLĐ": 8 ,
        "DVNT": 10 ,
        "DVTR": 8 ,
        "DVTVX02": "KCT" ,
        "DVVC0031": "KCT" ,
        "E0004": 5 ,
        "E0005": 5 ,
        "E0006": 5 ,
        "E0007": 5 ,
        "E0011": 5 ,
        "E0012": 5 ,
        "EC0001": "KCT" ,
        "ENT0001": "KCT" ,
        "ENT0002": "KCT" ,
        "ENT0003": "KCT" ,
        "ENT0004": "KCT" ,
        "ENT0005": "KCT" ,
        "ENT0006": "KCT" ,
        "ENT0007": "KCT" ,
        "ENT0008": "KCT" ,
        "ENT0009": "KCT" ,
        "ENT0011": "KCT" ,
        "ENT0012": "KCT" ,
        "ENT0014": "KCT" ,
        "ENT0015": "KCT" ,
        "ENT0016": "KCT" ,
        "ENT0017": "KCT" ,
        "ENT0018": "KCT" ,
        "ENT0019": "KCT" ,
        "ENT0020": "KCT" ,
        "ENTKCB": "KCT" ,
        "GCFLU_2": "KCT" ,
        "GM-Thuoc01": 8 ,
        "I0001": 5 ,
        "I0002": 5 ,
        "I0003": 5 ,
        "I0007": 5 ,
        "I0008": 5 ,
        "I0009": 5 ,
        "I0010": 5 ,
        "I0011": 5 ,
        "I0012": 5 ,
        "I0013": 5 ,
        "I0014": 5 ,
        "I0015": 5 ,
        "I0017": 5 ,
        "I0019": 5 ,
        "I0020": 5 ,
        "I0022 ": 5 ,
        "I0023": 5 ,
        "I0023-01": 10 ,
        "I0026": 5 ,
        "I0028": 5 ,
        "I0031": 5 ,
        "I0032": 5 ,
        "I0033": 5 ,
        "I0039": 5 ,
        "I0041": 5 ,
        "I0042": 5 ,
        "I0045": 5 ,
        "I0047": 5 ,
        "I0048": 5 ,
        "I0049": 5 ,
        "I0050": 5 ,
        "I0051": 5 ,
        "I0052": 5 ,
        "I0053": 5 ,
        "I0054": 5 ,
        "I0059": 5 ,
        "I0060": 5 ,
        "I0061": 5 ,
        "I0066": 5 ,
        "I0067": 5 ,
        "I0068": 5 ,
        "I0069": 5 ,
        "I0070": 5 ,
        "I0071": 5 ,
        "I0073": 5 ,
        "I0074": 5 ,
        "I0077": 5 ,
        "I0081": 5 ,
        "I0082": 5 ,
        "I0084": 5 ,
        "I0085": 5 ,
        "I0095": 5 ,
        "I0097": 5 ,
        "I0099": 5 ,
        "I0100": 5 ,
        "I0105": 5 ,
        "I0106 ": 5 ,
        "I0113": 5 ,
        "I0119": 5 ,
        "I0126": 5 ,
        "I0129": 5 ,
        "I0130": 5 ,
        "IM0001": "KCT" ,
        "IM0002": "KCT" ,
        "IM0003": "KCT" ,
        "IM0004": "KCT" ,
        "IM0005": "KCT" ,
        "IMKCB": "KCT" ,
        "IN50001": "KCT" ,
        "IN50002": "KCT" ,
        "IN50003": "KCT" ,
        "IN50004": "KCT" ,
        "IN50005": "KCT" ,
        "KCB": "KCT" ,
        "KSKKCB": "KCT" ,
        "KT0012": 5 ,
        "KT0015": 10 ,
        "KT002": 5 ,
        "KT004": 5 ,
        "KT005": 5 ,
        "KT006": 5 ,
        "KT007": 5 ,
        "KT008": 5 ,
        "KT009": 5 ,
        "KT010": 5 ,
        "KT013": 5 ,
        "KT014": 5 ,
        "KT017": 5 ,
        "KT018": 5 ,
        "KTYT": 5 ,
        "M0008": 10 ,
        "M0009": 10 ,
        "M0010": 10 ,
        "M0011": 10 ,
        "M0012": 10 ,
        "M0014": 10 ,
        "M0015": 10 ,
        "M0016": 5 ,
        "M0017": 5 ,
        "M0018": 5 ,
        "M0019": 5 ,
        "M0021": 5 ,
        "M0022": 10 ,
        "M0026": 5 ,
        "M0027": 5 ,
        "M0029": 5 ,
        "M0031": 5 ,
        "M0032": 5 ,
        "M0033": 5 ,
        "M0034": 5 ,
        "M0035": 5 ,
        "M0036": 5 ,
        "M0036-1": 5 ,
        "M0036-2": 5 ,
        "M0037": 5 ,
        "M0038": 5 ,
        "M0039": 5 ,
        "M0040": 5 ,
        "M0041": 5 ,
        "M0042": 5 ,
        "M0043": 5 ,
        "M0045": 5 ,
        "M0046": 5 ,
        "M0047": 5 ,
        "M0048": 5 ,
        "M0050": 5 ,
        "M0052": 5 ,
        "M0053": 5 ,
        "M0054": 5 ,
        "M0055": 5 ,
        "M0056": 5 ,
        "M0057": 5 ,
        "M0059": 5 ,
        "M0060": 5 ,
        "M0061": 5 ,
        "M0063": 5 ,
        "M0064": 5 ,
        "M0066": 5 ,
        "M0067": 5 ,
        "M0069": 5 ,
        "M0070": 5 ,
        "M0071": 5 ,
        "M0073": 5 ,
        "M0074": 5 ,
        "M0075": 5 ,
        "M0076": 5 ,
        "M0077": 5 ,
        "M0077-1": 5 ,
        "M0077-2": 5 ,
        "M0081": 5 ,
        "M0081-1": 5 ,
        "M0081-2": 5 ,
        "M0082": 5 ,
        "M0085": 5 ,
        "M0088": 5 ,
        "M0089": 5 ,
        "M0090": 5 ,
        "M0091": 5 ,
        "M0092": 5 ,
        "M0092-2": 5 ,
        "M0093": 5 ,
        "M0094": 5 ,
        "M0095": 5 ,
        "M0096": 5 ,
        "M0099": 5 ,
        "M0100": 8 ,
        "M0101": 5 ,
        "M0107": 5 ,
        "M0108": 5 ,
        "M0109": 5 ,
        "M0110": 5 ,
        "M0112": 5 ,
        "M0113": 5 ,
        "M0115": 5 ,
        "M0118": 5 ,
        "M0119": 5 ,
        "M0120": 5 ,
        "M0120-1": 5 ,
        "M0121": 5 ,
        "M0122": 5 ,
        "M0123": 5 ,
        "M0124": 5 ,
        "M0125": 5 ,
        "M0125-1": 5 ,
        "M0126": 5 ,
        "M0128": 5 ,
        "M0131": 5 ,
        "M0131-01": 5 ,
        "M0133": 5 ,
        "M0134": 5 ,
        "M0135": 5 ,
        "M0137": 5 ,
        "M0139": 5 ,
        "M0140": 5 ,
        "M0141": 5 ,
        "M0142": 5 ,
        "M0145": 5 ,
        "M0146": 5 ,
        "M0147": 5 ,
        "M0149": 5 ,
        "M0149-1": 5 ,
        "M0149-2": 5 ,
        "M0151": 5 ,
        "M0152": 5 ,
        "M0154": 5 ,
        "M0155": 5 ,
        "M0156": 5 ,
        "M0156-1": 5 ,
        "M0157": 5 ,
        "M0158": 5 ,
        "M0159": 5 ,
        "M0160": 5 ,
        "M0161": 5 ,
        "M0162": 5 ,
        "M0164": 5 ,
        "M0165": 8 ,
        "M0166": 5 ,
        "M0168": 5 ,
        "M0169": 5 ,
        "M0170": 5 ,
        "M0170-01": 5 ,
        "M0171": 5 ,
        "M0172": 5 ,
        "M0173": 5 ,
        "M0174": 5 ,
        "M0175": 5 ,
        "M0176": 5 ,
        "M0178": 5 ,
        "M0179": 5 ,
        "M0180": 5 ,
        "M0181": 5 ,
        "M0182": 5 ,
        "M0184": 5 ,
        "M0189": 5 ,
        "M0194": 5 ,
        "M0201": 10 ,
        "M0202": 10 ,
        "M0205": 5 ,
        "M0206": 5 ,
        "M0207": 5 ,
        "M0208": 5 ,
        "M0209": 5 ,
        "M0211": 10 ,
        "M0212": 5 ,
        "M0217": 5 ,
        "M0218": 10 ,
        "M0220": 5 ,
        "M0222": 5 ,
        "M0223": 5 ,
        "M0224": 5 ,
        "M0226": 5 ,
        "M0227": 5 ,
        "M0228": 5 ,
        "M0229": 5 ,
        "M0231": 5 ,
        "M0232": 5 ,
        "M0233": 5 ,
        "M0234": 5 ,
        "M0235": 10 ,
        "M0236": 5 ,
        "M0238": 5 ,
        "M0246": 5 ,
        "M0248": 5 ,
        "M0249": 5 ,
        "M0251": 5 ,
        "M0253": 5 ,
        "M0254": 5 ,
        "M0255": 5 ,
        "M0256": 5 ,
        "M0261": 5 ,
        "M0263": 5 ,
        "M0272": 5 ,
        "M0273": 5 ,
        "M0274": 5 ,
        "M0275": 5 ,
        "M0277": 5 ,
        "M0278": 5 ,
        "M0279": 5 ,
        "M0280": 10 ,
        "M0281": 10 ,
        "M0282": 5 ,
        "M0283": 5 ,
        "M0284": 5 ,
        "M0285": 5 ,
        "M0286": 5 ,
        "M0287": 5 ,
        "M0288": 5 ,
        "M0289": 5 ,
        "M0290": 5 ,
        "M0292": 5 ,
        "M0294": 5 ,
        "M0297": 5 ,
        "M0298": 8 ,
        "M0298_GM": 8 ,
        "M0299": 5 ,
        "M0300": 5 ,
        "M0301": 5 ,
        "M0302": 5 ,
        "M0304": 5 ,
        "M0305": 5 ,
        "M0306": 5 ,
        "M0307": 10 ,
        "M0308": 5 ,
        "M0309": 5 ,
        "M0312": 5 ,
        "M0313": 5 ,
        "M0314": 5 ,
        "M0315": 5 ,
        "M0320": 5 ,
        "M0324": 5 ,
        "M0325": 5 ,
        "M0326": 5 ,
        "M0330": 10 ,
        "M0332": 5 ,
        "M0333": 5 ,
        "M0334": 5 ,
        "M0335": 5 ,
        "M0336": 5 ,
        "M0337": 5 ,
        "M0340": 10 ,
        "M0342": 5 ,
        "M0343": 5 ,
        "M0344": 5 ,
        "M0345": 5 ,
        "M0346": 5 ,
        "M0349": 5 ,
        "M0350": 5 ,
        "M0350-2": 5 ,
        "M0351": 5 ,
        "M0352": 5 ,
        "M0356": 10 ,
        "M0357": 10 ,
        "M0358": 5 ,
        "M0363": 5 ,
        "M0364": 5 ,
        "M0365": 5 ,
        "M0366": 5 ,
        "M0367": 5 ,
        "M0368": 5 ,
        "M0369": 5 ,
        "M0371": 5 ,
        "M0374": 5 ,
        "M0375": 5 ,
        "M0376": 5 ,
        "M0378": 5 ,
        "M0380": 10 ,
        "M0381": 5 ,
        "M0383": 5 ,
        "M0388": 10 ,
        "M0389": 5 ,
        "M0395": 5 ,
        "M0398": 5 ,
        "M0399": 5 ,
        "M0400": 5 ,
        "M0401": 5 ,
        "M0404": 5 ,
        "M0405": 5 ,
        "M0411": 5 ,
        "M0412": 5 ,
        "M0415": 5 ,
        "M0416": 8 ,
        "M0417": 5 ,
        "M0417-2": 5 ,
        "M0419": 5 ,
        "M0420": 5 ,
        "M0421": 10 ,
        "M0423": 10 ,
        "M0426": 10 ,
        "M0427": 5 ,
        "M0429": 5 ,
        "M0431": 5 ,
        "M0432": 5 ,
        "M0433": 5 ,
        "M0434": 5 ,
        "M0435": 5 ,
        "M0436": 5 ,
        "M0437": 5 ,
        "M0438": 5 ,
        "M0439": 5 ,
        "M0440": 5 ,
        "M0444": 5 ,
        "M0444_GM": 5 ,
        "M0445": 5 ,
        "M0446": 8 ,
        "M0447": 8 ,
        "M0450": 5 ,
        "M0452": 5 ,
        "M0453": 5 ,
        "M0454": "KCT" ,
        "M0455": 5 ,
        "M0456": 5 ,
        "M0456-01": 5 ,
        "M0457": 5 ,
        "M0459": 5 ,
        "M0460": 5 ,
        "M0461": 5 ,
        "M0462": 5 ,
        "M0463": 5 ,
        "M0465": 5 ,
        "M0476": 5 ,
        "M0478": 5 ,
        "M0480": 5 ,
        "M0481": 5 ,
        "M0482": 5 ,
        "M0483": 5 ,
        "M0484": 5 ,
        "M0485": 5 ,
        "M0486": 5 ,
        "M0487": 5 ,
        "M0488": 5 ,
        "M0493": 5 ,
        "M0494": 5 ,
        "M0495": 5 ,
        "M0496": 5 ,
        "M0497": 5 ,
        "M0498": 5 ,
        "M0499": 5 ,
        "M0500": 5 ,
        "M0501": 5 ,
        "M0502": 5 ,
        "M0504": 5 ,
        "M0505": 5 ,
        "M0506": 5 ,
        "M0508": 5 ,
        "M0510": 5 ,
        "M0511": 5 ,
        "M0512": 5 ,
        "M0513": 5 ,
        "M0514": 5 ,
        "M0515": 8 ,
        "M0517": 5 ,
        "M0518": 5 ,
        "M0523": 5 ,
        "M0524": 5 ,
        "M0526": 5 ,
        "M0527": 5 ,
        "M0528": 5 ,
        "M0532": 5 ,
        "M0533": 10 ,
        "M0534": 10 ,
        "M0536": 5 ,
        "M0537": 8 ,
        "M0538": 5 ,
        "M0539": 5 ,
        "M0540": 5 ,
        "M0540-01": 5 ,
        "M0541": 5 ,
        "M0542": 5 ,
        "M0544": 5 ,
        "M0547": 5 ,
        "M0549": 5 ,
        "M0550": 5 ,
        "M0551": 5 ,
        "M0552": 5 ,
        "M0553": 5 ,
        "M0554": 5 ,
        "M0556": 5 ,
        "M0557": 5 ,
        "M0558": 5 ,
        "M0560": 5 ,
        "M0561": 5 ,
        "M0562": 5 ,
        "M0563": 5 ,
        "M0564": 5 ,
        "M0565": 5 ,
        "M0566": 5 ,
        "M0570": 5 ,
        "M0571": 10 ,
        "M0573": 5 ,
        "M0574": 8 ,
        "M0575": 5 ,
        "M0575-2": 5 ,
        "M0580": 5 ,
        "M0581": 5 ,
        "M0583": 5 ,
        "M0586": 5 ,
        "M0588": 5 ,
        "M0590": 5 ,
        "M0591": 5 ,
        "M0595": 5 ,
        "M0596": 5 ,
        "M0598": 10 ,
        "M0599": 10 ,
        "M0600": 5 ,
        "M0601": 8 ,
        "M0602": 5 ,
        "M0603": 5 ,
        "M0604": 5 ,
        "M0605": 8 ,
        "M0606": 5 ,
        "M0607": 5 ,
        "M0609": 5 ,
        "M0609-01": 5 ,
        "M0611": 5 ,
        "M0612": 5 ,
        "M0613": 5 ,
        "M0614": 5 ,
        "M0616 ": 5 ,
        "M0617": 5 ,
        "M0618": 5 ,
        "M0620": 10 ,
        "M0621": 5 ,
        "M0622": 5 ,
        "M0623": 5 ,
        "M0627": 5 ,
        "M0628": 10 ,
        "M0629": 5 ,
        "M0630": 5 ,
        "M0631": 10 ,
        "M0635": 10 ,
        "M0636": 5 ,
        "M0637": 10 ,
        "M0638": 5 ,
        "M0640": 10 ,
        "M0641": 5 ,
        "M0642": 5 ,
        "M0643": 5 ,
        "M0644": 5 ,
        "M0645": 5 ,
        "M0649": 5 ,
        "M0650": 5 ,
        "M0651": 5 ,
        "M0652": 5 ,
        "M0653": 5 ,
        "M0654": 5 ,
        "M0655": 5 ,
        "M0656": 5 ,
        "M0657": 5 ,
        "M0659": 5 ,
        "M0663": 5 ,
        "M0664": 5 ,
        "M0667": 5 ,
        "M0667-1": 5 ,
        "M0668": 5 ,
        "M0670": 5 ,
        "M0672": 5 ,
        "M0673": 5 ,
        "M0675": 5 ,
        "M0676": 5 ,
        "M0677": 5 ,
        "M0678": 5 ,
        "M0679": 5 ,
        "M0680": 5 ,
        "M0681": 5 ,
        "M0682": 5 ,
        "M0683": 5 ,
        "M0686": 5 ,
        "M0687": 5 ,
        "M0688": 5 ,
        "M0690": 5 ,
        "M0690-MS": 5 ,
        "M0691": 8 ,
        "M0692": 8 ,
        "M0693": 10 ,
        "M0694": 5 ,
        "M0695": 10 ,
        "M0696": 5 ,
        "M0697": 5 ,
        "M0698": 5 ,
        "M0700": 5 ,
        "M0702": 5 ,
        "M0703": 8 ,
        "M0704": 5 ,
        "M0705": 8 ,
        "M0706": 8 ,
        "M0707": 5 ,
        "M0712": 5 ,
        "M0713": 5 ,
        "M0716": 5 ,
        "M0716-01": 5 ,
        "M0717": 5 ,
        "M0722": 5 ,
        "M0723": 5 ,
        "M0724": 5 ,
        "M0725": 8 ,
        "M0726": 5 ,
        "M0728": 5 ,
        "M0729": 5 ,
        "M0731": 5 ,
        "M0732": 5 ,
        "M0733": 5 ,
        "M0735": 5 ,
        "M0736": 8 ,
        "M0737": 8 ,
        "M0738": 8 ,
        "M0739": 8 ,
        "M0740": 8 ,
        "M0742": 5 ,
        "M0743": 5 ,
        "M0744": 5 ,
        "M0745": 5 ,
        "M0746": 5 ,
        "M0747": 5 ,
        "M0748": 5 ,
        "M0754": 5 ,
        "M0755": 5 ,
        "M0756": 5 ,
        "M0757": 5 ,
        "M0758": 5 ,
        "M0761": 5 ,
        "M0763": 5 ,
        "M0764": 8 ,
        "M0765": 5 ,
        "M0766": 10 ,
        "M0768": 8 ,
        "M0770": 8 ,
        "M0772": 8 ,
        "M0773": 5 ,
        "M0774": 5 ,
        "M0776": 5 ,
        "M0779": 8 ,
        "M0780": 5 ,
        "M0782": 5 ,
        "M0783": 8 ,
        "M0786": 5 ,
        "M0788": 8 ,
        "M0789": 5 ,
        "M0790": 5 ,
        "M0791": 5 ,
        "M0792": 5 ,
        "M0793": 5 ,
        "M0794": 5 ,
        "M0795": 5 ,
        "M0796": 5 ,
        "M0797": 5 ,
        "M0799": 8 ,
        "M0800": 5 ,
        "M0801": 5 ,
        "M0802": 5 ,
        "M0803": 8 ,
        "M0804": 8 ,
        "M0805": 5 ,
        "M0808": 8 ,
        "M0809": 5 ,
        "M0810": 5 ,
        "M0811": 8 ,
        "M0812": 5 ,
        "M0813": 5 ,
        "M0814": 5 ,
        "M0815": 8 ,
        "M0817": 8 ,
        "M0818": 5 ,
        "M0820": 8 ,
        "M0821": 5 ,
        "M0822": 8 ,
        "M0823": 8 ,
        "M0824": 8 ,
        "M0825": 8 ,
        "M0826": 5 ,
        "M0828": 5 ,
        "M0829": 5 ,
        "M0830": 5 ,
        "M0831": 5 ,
        "M0833": 5 ,
        "M0835": 5 ,
        "M0838": 5 ,
        "M0839": 5 ,
        "M0840": 5 ,
        "M0842": 5 ,
        "M0843": 5 ,
        "M0845": 5 ,
        "M0846": 5 ,
        "M0847": 8 ,
        "M0848": 5 ,
        "M0849": 5 ,
        "M0850": 5 ,
        "M0854": 5 ,
        "M0855": 5 ,
        "M0856": 5 ,
        "M0857": 8 ,
        "M0858": 8 ,
        "M0859": 8 ,
        "M0860": 8 ,
        "M0861": 8 ,
        "M0862": 8 ,
        "M0863": 8 ,
        "M0868": 5 ,
        "M0869": 5 ,
        "M0870": 5 ,
        "M0872": 5 ,
        "M0873": 5 ,
        "M0874": 5 ,
        "M0875": 5 ,
        "M0876": 5 ,
        "M0877": 5 ,
        "M0878": 5 ,
        "M0880": 5 ,
        "M0882": 8 ,
        "M0882.": 8 ,
        "M0883": 5 ,
        "M0884": 5 ,
        "M0885": 5 ,
        "M0893": 5 ,
        "M0894": 5 ,
        "M0895": 5 ,
        "M0896": 5 ,
        "M0897": 5 ,
        "M0898": 5 ,
        "M0900": 5 ,
        "M0901": 5 ,
        "M0903": 5 ,
        "M0904": 5 ,
        "M0905": 5 ,
        "M0906": 5 ,
        "M0907": 5 ,
        "M0908": 5 ,
        "M0909": 5 ,
        "M0911": 5 ,
        "M0912": 5 ,
        "M0913": 5 ,
        "M0914": 5 ,
        "M0915": 10 ,
        "M0916": 8 ,
        "M0917": 8 ,
        "M0918": 8 ,
        "M0919": 8 ,
        "M0920": 8 ,
        "M0921": 8 ,
        "M0922": 8 ,
        "M0923": 5 ,
        "M0924": 5 ,
        "M0927": 5 ,
        "M0928": 5 ,
        "M0929": 5 ,
        "M0930": 5 ,
        "M0931": 5 ,
        "M0932": 5 ,
        "M0933": 5 ,
        "M0934": 5 ,
        "M0936": 5 ,
        "M0938": 5 ,
        "M0939": 5 ,
        "M0940": 5 ,
        "M0941": 5 ,
        "M0942": 5 ,
        "M0943": 5 ,
        "M0944": 5 ,
        "M0945": 5 ,
        "M0946": 5 ,
        "M0947": 8 ,
        "M0948": 5 ,
        "M0949": 5 ,
        "M0951": 5 ,
        "M0952": 5 ,
        "M0953": 5 ,
        "M0954": 5 ,
        "M0955": 5 ,
        "M0956": 8 ,
        "M0957": 8 ,
        "M0958": 5 ,
        "M0959": 5 ,
        "M0962": 5 ,
        "M0963": 5 ,
        "M0964": 5 ,
        "M0967": 5 ,
        "M0968": 5 ,
        "M0969": 5 ,
        "M0970": 5 ,
        "M0971": 5 ,
        "M0972": 5 ,
        "M0973": 5 ,
        "M0974": 5 ,
        "M0976": 5 ,
        "M0977": 5 ,
        "M0978": 5 ,
        "M0979": 5 ,
        "M0980": 5 ,
        "M0981": 5 ,
        "M0982": 5 ,
        "M0983": 5 ,
        "M0984": 5 ,
        "M0986": 5 ,
        "M0987": 5 ,
        "M0990": 5 ,
        "M0992": 5 ,
        "M0993": 5 ,
        "M0994": 5 ,
        "M0995": 5 ,
        "M0996": 5 ,
        "M0999": 5 ,
        "M1000": 5 ,
        "M1001": 5 ,
        "M1003": 5 ,
        "M1004": 5 ,
        "M1005": 5 ,
        "M1006": 5 ,
        "M1007": 5 ,
        "M1008": 5 ,
        "M1009": 5 ,
        "M1010": 5 ,
        "M1011": 5 ,
        "M1012": 5 ,
        "M1015": 5 ,
        "M1016": 5 ,
        "M1017": 5 ,
        "M1018": 5 ,
        "M1019": 5 ,
        "M1020": 5 ,
        "M1022": 5 ,
        "M1025": 5 ,
        "M1026": 5 ,
        "M1027": 5 ,
        "M1027-1": 5 ,
        "M1028": 5 ,
        "M1029": 5 ,
        "M1031": 5 ,
        "M1032": 5 ,
        "M1033": 5 ,
        "M1034": 5 ,
        "M1037": 5 ,
        "M1039": 5 ,
        "M1040": 10 ,
        "M1041": 10 ,
        "M1043": 5 ,
        "M1045": 5 ,
        "M1046": 5 ,
        "M1047": 5 ,
        "M1048": 5 ,
        "M1049": 10 ,
        "M1050": 5 ,
        "M1051": 5 ,
        "M1053": 5 ,
        "M1054": 5 ,
        "M1055": 5 ,
        "M1057": 5 ,
        "M1058": 5 ,
        "M1059": 5 ,
        "M1060": 5 ,
        "M1062": 5 ,
        "M1063": 5 ,
        "M1067": 5 ,
        "M1068": 5 ,
        "M1069": 5 ,
        "M1071": 5 ,
        "M1072": 5 ,
        "M1073": 5 ,
        "M1074": 5 ,
        "M1075": 5 ,
        "M1076": 8 ,
        "M1078": 5 ,
        "M1079": 5 ,
        "M1080": 5 ,
        "M1081": 5 ,
        "M1082": 5 ,
        "M1084": 5 ,
        "M1085": 5 ,
        "M1086": 5 ,
        "M1087": 8 ,
        "M1088": 5 ,
        "M1089": 5 ,
        "M1090": 5 ,
        "M1092": 5 ,
        "M1093": 5 ,
        "M1094": 5 ,
        "M1095": 5 ,
        "M1096": 5 ,
        "M1097": 5 ,
        "M1098": 5 ,
        "M1099": 5 ,
        "M1100": 5 ,
        "M1103": 5 ,
        "M1104": 5 ,
        "M1108": 5 ,
        "M1111": 5 ,
        "M1113": 5 ,
        "M1114": 5 ,
        "M1116": 5 ,
        "M1117": 5 ,
        "M1118": 10 ,
        "M1120": 5 ,
        "M1121": 5 ,
        "M1122": 5 ,
        "M1123": 5 ,
        "M1124": 5 ,
        "M1125": 5 ,
        "M1126": 5 ,
        "M1127": 5 ,
        "M1128": 5 ,
        "M1131": 5 ,
        "M1132": 5 ,
        "M1133": 5 ,
        "M1134": 5 ,
        "M1135": 5 ,
        "M1136": 5 ,
        "M1137": 5 ,
        "M1139": 5 ,
        "M1140": 5 ,
        "M1141": 8 ,
        "M1142": 5 ,
        "M1144": 5 ,
        "M1145": 5 ,
        "M1150": 5 ,
        "M1151": 5 ,
        "M1154": 5 ,
        "M1158": 10 ,
        "M1160": 5 ,
        "M1161": 5 ,
        "M1162": 5 ,
        "M1163": 5 ,
        "M1165": 5 ,
        "M1167": 5 ,
        "M1169": 5 ,
        "M1177": 5 ,
        "M1179": 5 ,
        "M1182": 5 ,
        "M1183": 5 ,
        "M1184": 5 ,
        "M1185": 5 ,
        "M1187": 5 ,
        "M1190": 5 ,
        "M1191": 5 ,
        "M1192": 5 ,
        "M1193": 5 ,
        "M1195": 5 ,
        "M1196": 5 ,
        "M1201": 5 ,
        "M1202": 5 ,
        "M1204": 8 ,
        "M1205": 5 ,
        "M1206": 5 ,
        "M1207": 5 ,
        "M1209": 5 ,
        "M1210": 5 ,
        "M1212": 8 ,
        "M1213": 5 ,
        "M1214": 5 ,
        "M1216": 5 ,
        "M669": 5 ,
        "MANG_NHOM": 10 ,
        "MAY-01": 5 ,
        "MLKK": 10 ,
        "MP002": 10 ,
        "MP003": 10 ,
        "MP004": 10 ,
        "MP005": 10 ,
        "MP006": 10 ,
        "MTG-1": 5 ,
        "NHAKCB": "KCT" ,
        "NLCTR2": 10 ,
        "NLCTR3": 10 ,
        "OBG0001": "KCT" ,
        "OBG0004": "KCT" ,
        "OBG0005": "KCT" ,
        "OBG0006": "KCT" ,
        "OBG0011": "KCT" ,
        "OBG0012": "KCT" ,
        "OBG0013": "KCT" ,
        "OBG0014": "KCT" ,
        "OBG0015": "KCT" ,
        "OBG0016": "KCT" ,
        "OBG0017": "KCT" ,
        "OBG0018": "KCT" ,
        "OBG0019": "KCT" ,
        "OBG0020": "KCT" ,
        "OBG0021": "KCT" ,
        "OBG0029": "KCT" ,
        "OBG0030": "KCT" ,
        "OBG0031": "KCT" ,
        "OBG0032": "KCT" ,
        "OBG0033": "KCT" ,
        "OBG0034": "KCT" ,
        "OBG0035": "KCT" ,
        "OBG0036": "KCT" ,
        "OBG0038": "KCT" ,
        "OBG0040": "KCT" ,
        "OBG0041": "KCT" ,
        "OBG0042": "KCT" ,
        "OBG0043": "KCT" ,
        "OBG0044": "KCT" ,
        "OBG0045": "KCT" ,
        "OBG0046": "KCT" ,
        "OBG0047": "KCT" ,
        "OBG0048": "KCT" ,
        "OBG0049": "KCT" ,
        "OBG0050": "KCT" ,
        "OBG0051": "KCT" ,
        "OBG0052": "KCT" ,
        "OBG0053": "KCT" ,
        "OBG0054": "KCT" ,
        "OBG0060": "KCT" ,
        "OBG0061": "KCT" ,
        "OBG0062": "KCT" ,
        "OBG0063": "KCT" ,
        "OBG0064": "KCT" ,
        "OBG0072": "KCT" ,
        "OBG0073": "KCT" ,
        "OKCB": "KCT" ,
        "OSFRK": 5 ,
        "PBX": 10 ,
        "PHS": 10 ,
        "PLK": 10 ,
        "PMKCB": "KCT" ,
        "PS0090": "KCT" ,
        "PS0091": "KCT" ,
        "PS0092": "KCT" ,
        "PS0093": "KCT" ,
        "PS0094": "KCT" ,
        "PS0095": "KCT" ,
        "PS0098": "KCT" ,
        "PS0099": "KCT" ,
        "PS0100": "KCT" ,
        "PS0110": "KCT" ,
        "PS20015": 10 ,
        "PS30008": "KCT" ,
        "PS30009": "KCT" ,
        "PS40011": "KCT" ,
        "PTC": 10 ,
        "R0001": "KCT" ,
        "R0002": "KCT" ,
        "R0003": "KCT" ,
        "R0004": "KCT" ,
        "R0005": "KCT" ,
        "R0006": "KCT" ,
        "R0007": "KCT" ,
        "R0008": "KCT" ,
        "R0009": "KCT" ,
        "R0010": "KCT" ,
        "R0011": "KCT" ,
        "R0012": "KCT" ,
        "R0013": "KCT" ,
        "R0014": "KCT" ,
        "R0015": "KCT" ,
        "R0016": "KCT" ,
        "R0017": "KCT" ,
        "R0018": "KCT" ,
        "R0019": "KCT" ,
        "R0020": "KCT" ,
        "R0021": "KCT" ,
        "R0022": "KCT" ,
        "R0023": "KCT" ,
        "R0024": "KCT" ,
        "R0025": "KCT" ,
        "R0026": "KCT" ,
        "R0027": "KCT" ,
        "R0028": "KCT" ,
        "R0029": "KCT" ,
        "R0030": "KCT" ,
        "R0031": "KCT" ,
        "R0032": "KCT" ,
        "R0033": "KCT" ,
        "R0034": "KCT" ,
        "R0035": "KCT" ,
        "R0036": "KCT" ,
        "R0037": "KCT" ,
        "R0038": "KCT" ,
        "R0039": "KCT" ,
        "R0040": "KCT" ,
        "R0041": "KCT" ,
        "R0042": "KCT" ,
        "R0043": "KCT" ,
        "R0044": "KCT" ,
        "R0045": "KCT" ,
        "R0046": "KCT" ,
        "R0047": "KCT" ,
        "R0048": "KCT" ,
        "R0049": "KCT" ,
        "R0050": "KCT" ,
        "R0051": "KCT" ,
        "R0052": "KCT" ,
        "R0053": "KCT" ,
        "R0054": "KCT" ,
        "R0055": "KCT" ,
        "R0056": "KCT" ,
        "R0057": "KCT" ,
        "R0058": "KCT" ,
        "R0059": "KCT" ,
        "R0060": "KCT" ,
        "R0061": "KCT" ,
        "R0062": "KCT" ,
        "R0063": "KCT" ,
        "R0064": "KCT" ,
        "R0065": "KCT" ,
        "R0066": "KCT" ,
        "R0067": "KCT" ,
        "R0068": "KCT" ,
        "R0069": "KCT" ,
        "R0070": "KCT" ,
        "SANKCB": "KCT" ,
        "T0006": "KCT" ,
        "TBCM_DS": 10 ,
        "TBCVR": 5 ,
        "TEST COVIT": "KCT" ,
        "Test_Genedia W": 5 ,
        "TEST_PCR": "KCT" ,
        "Test_Standard Q": 5 ,
        "THCC001": 5 ,
        "THCC002": 5 ,
        "THUOC 01": 5 ,
        "THUOC 02": 5 ,
        "THUOC 03": 5 ,
        "THUOC 04": 5 ,
        "THUOC 05": 5 ,
        "THUOC 06": 5 ,
        "THUOC 07": 5 ,
        "Thuoc noi": 5 ,
        "Thuoc noi 2": 5 ,
        "THUOC_GM": 5 ,
        "THUOC_GM1": 5 ,
        "THUOC1": 5 ,
        "thuốc1": 5 ,
        "thuốc2": 5 ,
        "THUOC3": 5 ,
        "THUOC9": 5 ,
        "TIENDIEN": 10 ,
        "TL": 10 ,
        "TVP2": 10 ,
        "U0001": "KCT" ,
        "U0002": "KCT" ,
        "U0003": "KCT" ,
        "U0004": "KCT" ,
        "U0005": "KCT" ,
        "U0006": "KCT" ,
        "U0007": "KCT" ,
        "U0008": "KCT" ,
        "U0009": "KCT" ,
        "U0010": "KCT" ,
        "U0011": "KCT" ,
        "U0012": "KCT" ,
        "U0013": "KCT" ,
        "U0014": "KCT" ,
        "U0015": "KCT" ,
        "U0016": "KCT" ,
        "U0017": "KCT" ,
        "U0018": "KCT" ,
        "U0019": "KCT" ,
        "U0020": "KCT" ,
        "U0021": "KCT" ,
        "U0022": "KCT" ,
        "U0023": "KCT" ,
        "U0024": "KCT" ,
        "U0025": "KCT" ,
        "U0026": "KCT" ,
        "U0027": "KCT" ,
        "U0028": "KCT" ,
        "U0029": "KCT" ,
        "U0030": "KCT" ,
        "U0031": "KCT" ,
        "U0032": "KCT" ,
        "U0033": "KCT" ,
        "U0034": "KCT" ,
        "U0035": "KCT" ,
        "U0036": "KCT" ,
        "U0037": "KCT" ,
        "U0038": "KCT" ,
        "U0040": "KCT" ,
        "U0041": "KCT" ,
        "U0042": "KCT" ,
        "U0043": "KCT" ,
        "U0044": "KCT" ,
        "U0045": "KCT" ,
        "U0046": "KCT" ,
        "U0047": "KCT" ,
        "U0048": "KCT" ,
        "U0049": "KCT" ,
        "U0050": "KCT" ,
        "U0051": "KCT" ,
        "U0052": "KCT" ,
        "U0053": "KCT" ,
        "VC0006": "KCT" ,
        "VC0007": "KCT" ,
        "VC0008": "KCT" ,
        "VC0012": "KCT" ,
        "VC0015": "KCT" ,
        "VC0019": "KCT" ,
        "VC0020": "KCT" ,
        "VC0021": "KCT" ,
        "VC0028": "KCT" ,
        "VC0033": "KCT" ,
        "VC0037": "KCT" ,
        "VC0039": "KCT" ,
        "VC0043": "KCT" ,
        "Vòi xịt": 10 ,
        "VPP": 10 ,
        "VT_0065": 5 ,
        "VT_DL_002": 5 ,
        "VT_DL001": 10 ,
        "VT_KCB001": 5 ,
        "VT_KS-001": 5 ,
        "VT_NHA_KEO": 5 ,
        "VT_NOI02": 5 ,
        "VT_PCR_OMT": 5 ,
        "VT_SGTi-flex COVID-19 Ag": 5 ,
        "VT001": 5 ,
        "VT0010": "KCT" ,
        "VT00100": 5 ,
        "VT00120": 5 ,
        "VT00121": 5 ,
        "VT002": 5 ,
        "VT0023": 5 ,
        "VT0024": 5 ,
        "VT0025": 5 ,
        "VT003": 10 ,
        "VT004": 10 ,
        "VT0055": 5 ,
        "VT006": "KCT" ,
        "VT0065": 5 ,
        "VT007": "KCT" ,
        "VT008": "KCT" ,
        "VT009": "KCT" ,
        "VT011": 5 ,
        "VT012": "KCT" ,
        "VT013": 5 ,
        "VT014": 5 ,
        "VT015": 10 ,
        "VT016": 5 ,
        "VT017": 5 ,
        "VT018": "KCT" ,
        "VT019": 5 ,
        "VT020": 5 ,
        "VT021": 5 ,
        "VT022": 5 ,
        "VT023": 5 ,
        "VT024": "KCT" ,
        "VT025": "KCT" ,
        "VT026": "KCT" ,
        "VT027": "KCT" ,
        "VT028": "KCT" ,
        "VT029": "KCT" ,
        "VT030": "KCT" ,
        "VT031": "KCT" ,
        "VT032": "KCT" ,
        "VT033": 10 ,
        "VT05": "KCT" ,
        "VT052": 5 ,
        "VT055": 5 ,
        "VTDL": 10 ,
        "VTDL001": 10 ,
        "VTDL01": 8 ,
        "VTDL05": 10 ,
        "VTDL06": 10 ,
        "VTDL07": 10 ,
        "VTDL09": 5 ,
        "VTKCB01": 5 ,
        "VTN02": 5 ,
        "VTNHA01": 5 ,
        "VTNK": 5 ,
        "VTNOI": 5 ,
        "VTNOI5": 5 ,
        "VTNOI55": 5 ,
        "VTPM01": 5 ,
        "VT-urgo": 5 ,
        "VTYT": 5 ,
        "VX001": "KCT" ,
        "VC0010": "KCT" ,
        "VX0030": "KCT" ,
        "VX0031": "KCT" ,
        "VX004": "KCT" ,
        "VX005": "KCT" ,
        "VX007": "KCT" ,
        "VX008": "KCT" ,
        "VX009": "KCT" ,
        "VX010": "KCT" ,
        "VX012": "KCT" ,
        "VX013": "KCT" ,
        "VX015": "KCT" ,
        "VX017": "KCT" ,
        "VX018": "KCT" ,
        "VX020": "KCT" ,
        "VX022": "KCT" ,
        "ZIAJA06": 10 ,
        "ZIAJA07": 10 ,
        "ZIAJA08": 10 ,
        "ZIAJA09": 10 ,
        "M1225": 5 ,
        "M1224": 5 ,
        "M1227": 5 ,
        "M1229": 5 ,
        "M1101": 5 ,
        "M1115": 5 ,
    }
    val = 0
    try:
        val = int(data[string]) / 100
    except:
        pass
    return val

def get_vat_name(string):
    data = {
        "BXBAL05": 5 ,
        "CAMERA_CS-C6N": 10 ,
        "CBC_Cleansing": 10 ,
        "CBC_Cream_100": 10 ,
        "CBC_Cream_250": 10 ,
        "CBC_Decon Gel": 10 ,
        "CBC_Mask Ice_1kg": 10 ,
        "CBC_Serum_500": 10 ,
        "CBC_Toner": 10 ,
        "CPMH": 10 ,
        "CUOCVC": 10 ,
        "D0033": 10 ,
        "D0034": 10 ,
        "D0063": "KCT" ,
        "D0098": "KCT" ,
        "D0102": "KCT" ,
        "D0104": "KCT" ,
        "D0105": "KCT" ,
        "D0106": "KCT" ,
        "D0107": "KCT" ,
        "D0108": "KCT" ,
        "D0110": "KCT" ,
        "D0111": "KCT" ,
        "D0114": "KCT" ,
        "D0115": "KCT" ,
        "D0116": "KCT" ,
        "D0117": "KCT" ,
        "D0118": "KCT" ,
        "D0121": "KCT" ,
        "D0122": "KCT" ,
        "D0123": "KCT" ,
        "D0124": "KCT" ,
        "D0125": "KCT" ,
        "D0128": 10 ,
        "D0129": 10 ,
        "D0134": 10 ,
        "D0140": "KCT" ,
        "D0141": "KCT" ,
        "D0142": 8 ,
        "D0143": 8 ,
        "D0147": "KCT" ,
        "D0152": 10 ,
        "D0155": "KCT" ,
        "D0157": "KCT" ,
        "D0158": "KCT" ,
        "D0159": "KCT" ,
        "D0162": "KCT" ,
        "D0164": "KCT" ,
        "D0172": "KCT" ,
        "D0180": "KCT" ,
        "D0182": "KCT" ,
        "D0186": "KCT" ,
        "D0187": "KCT" ,
        "D0188": 10 ,
        "D0189": "KCT" ,
        "D0196": "KCT" ,
        "D0211": "KCT" ,
        "D30001": "KCT" ,
        "D30002": "KCT" ,
        "D30003": "KCT" ,
        "D30004": "KCT" ,
        "D30005": "KCT" ,
        "D30006": "KCT" ,
        "D30007": "KCT" ,
        "D30008": "KCT" ,
        "D30009": "KCT" ,
        "D30010": "KCT" ,
        "D30011": "KCT" ,
        "D30012": "KCT" ,
        "D30013": "KCT" ,
        "D30014": "KCT" ,
        "D30015": "KCT" ,
        "D30016": "KCT" ,
        "D30017": "KCT" ,
        "D30018": "KCT" ,
        "D30020": "KCT" ,
        "D30021": "KCT" ,
        "D30023": "KCT" ,
        "D30024": "KCT" ,
        "D30025": "KCT" ,
        "D30026": "KCT" ,
        "D30027": "KCT" ,
        "D30028": "KCT" ,
        "D30029": "KCT" ,
        "D30030": "KCT" ,
        "D30054": 8 ,
        "D30055": 8 ,
        "D30056": 8 ,
        "D30057": 8 ,
        "D30059": 8 ,
        "D30060": 8 ,
        "D30061": 10 ,
        "D30062": "KCT" ,
        "D30063": "KCT" ,
        "D30067": 8 ,
        "D30068": "KCT" ,
        "DCPTOTSK": 5 ,
        "DD Aquasolution": 10 ,
        "DLKCB": "KCT" ,
        "DM0001": 10 ,
        "DM0002": 10 ,
        "DM0003": 10 ,
        "DM0004": 10 ,
        "DM0005": 10 ,
        "DM0006": 10 ,
        "DM0007": 10 ,
        "DM0008": 10 ,
        "DM0009": 10 ,
        "DM0010": 10 ,
        "DM0011": 10 ,
        "DM0012": 10 ,
        "DM0015": 10 ,
        "DM0016": 10 ,
        "DM0017": 10 ,
        "DM0018": 10 ,
        "DM0019": 10 ,
        "DM0020": 10 ,
        "DM0021": 8 ,
        "DM0022": 8 ,
        "DM0023": 8 ,
        "DM0024": 8 ,
        "DM0025": 10 ,
        "DM0026": 10 ,
        "DM0027": 10 ,
        "DM0028": 10 ,
        "DM0029": 10 ,
        "DM0030": 10 ,
        "DM0031": "KCT" ,
        "DM0032": "KCT" ,
        "DM0035": 10 ,
        "DM0036": 10 ,
        "DM0037": 10 ,
        "DM0038": 10 ,
        "DM0039": 10 ,
        "DM0040": 10 ,
        "DM0041": 10 ,
        "DM0042": 10 ,
        "DM0043": 10 ,
        "DM0044": 10 ,
        "DM0045": 10 ,
        "DM0046": 10 ,
        "DM0047": 10 ,
        "DM0048": 10 ,
        "DM0049": 10 ,
        "DM0050": 10 ,
        "DM0051": 10 ,
        "DM0052": 10 ,
        "DM0053": 10 ,
        "DM0054": 10 ,
        "DM0055": 10 ,
        "DM0056": 8 ,
        "DM0057": 8 ,
        "DM0058": 10 ,
        "DM0059": 10 ,
        "DM0060": 10 ,
        "DM0061": 10 ,
        "DM0076": "KCT" ,
        "DM0078": "KCT" ,
        "DM0082": "KCT" ,
        "DM0083": "KCT" ,
        "DM0084": "KCT" ,
        "DM0085": "KCT" ,
        "DM0086": "KCT" ,
        "DM0087": "KCT" ,
        "DM0089": "KCT" ,
        "DM0090": "KCT" ,
        "DM0091": "KCT" ,
        "DM0092": "KCT" ,
        "DM0097": 10 ,
        "DM0098": 10 ,
        "DM0101": 10 ,
        "DM0102": 10 ,
        "DM0103": 10 ,
        "DM0104": 10 ,
        "DM0114": 10 ,
        "DM0116": 10 ,
        "DM0117": 10 ,
        "DM0118": "KCT" ,
        "DM0122": 10 ,
        "DM0123": "KCT" ,
        "DM0125": "KCT" ,
        "DM0126": 10 ,
        "DM0127": 10 ,
        "DM0128": 10 ,
        "DM0129": 10 ,
        "DM0130": 10 ,
        "DM0138": "KCT" ,
        "DM0139": "KCT" ,
        "DM0140": "KCT" ,
        "DM0141": "KCT" ,
        "DM0142": "KCT" ,
        "DM0144": 10 ,
        "DM0147": "KCT" ,
        "DM0148": 10 ,
        "DM0153": 10 ,
        "DM0155": "KCT" ,
        "DM0157": "KCT" ,
        "DM0158": "KCT" ,
        "DM0159": "KCT" ,
        "DM0162": "KCT" ,
        "DM0165": "KCT" ,
        "DM0167": "KCT" ,
        "DM0168": 10 ,
        "DM0169": 10 ,
        "DM0170": 10 ,
        "DM0171": 10 ,
        "DM0172": "KCT" ,
        "DM0173": "KCT" ,
        "DM0174": "KCT" ,
        "DM0175": "KCT" ,
        "DSS": 8 ,
        "DVBR": 8 ,
        "DVCSD": 8 ,
        "DVCSYT": "KCT" ,
        "DVGNVC": 10 ,
        "DVLĐ": 8 ,
        "DVNT": 10 ,
        "DVTR": 8 ,
        "DVTVX02": "KCT" ,
        "DVVC0031": "KCT" ,
        "E0004": 5 ,
        "E0005": 5 ,
        "E0006": 5 ,
        "E0007": 5 ,
        "E0011": 5 ,
        "E0012": 5 ,
        "EC0001": "KCT" ,
        "ENT0001": "KCT" ,
        "ENT0002": "KCT" ,
        "ENT0003": "KCT" ,
        "ENT0004": "KCT" ,
        "ENT0005": "KCT" ,
        "ENT0006": "KCT" ,
        "ENT0007": "KCT" ,
        "ENT0008": "KCT" ,
        "ENT0009": "KCT" ,
        "ENT0011": "KCT" ,
        "ENT0012": "KCT" ,
        "ENT0014": "KCT" ,
        "ENT0015": "KCT" ,
        "ENT0016": "KCT" ,
        "ENT0017": "KCT" ,
        "ENT0018": "KCT" ,
        "ENT0019": "KCT" ,
        "ENT0020": "KCT" ,
        "ENTKCB": "KCT" ,
        "GCFLU_2": "KCT" ,
        "GM-Thuoc01": 8 ,
        "I0001": 5 ,
        "I0002": 5 ,
        "I0003": 5 ,
        "I0007": 5 ,
        "I0008": 5 ,
        "I0009": 5 ,
        "I0010": 5 ,
        "I0011": 5 ,
        "I0012": 5 ,
        "I0013": 5 ,
        "I0014": 5 ,
        "I0015": 5 ,
        "I0017": 5 ,
        "I0019": 5 ,
        "I0020": 5 ,
        "I0022 ": 5 ,
        "I0023": 5 ,
        "I0023-01": 10 ,
        "I0026": 5 ,
        "I0028": 5 ,
        "I0031": 5 ,
        "I0032": 5 ,
        "I0033": 5 ,
        "I0039": 5 ,
        "I0041": 5 ,
        "I0042": 5 ,
        "I0045": 5 ,
        "I0047": 5 ,
        "I0048": 5 ,
        "I0049": 5 ,
        "I0050": 5 ,
        "I0051": 5 ,
        "I0052": 5 ,
        "I0053": 5 ,
        "I0054": 5 ,
        "I0059": 5 ,
        "I0060": 5 ,
        "I0061": 5 ,
        "I0066": 5 ,
        "I0067": 5 ,
        "I0068": 5 ,
        "I0069": 5 ,
        "I0070": 5 ,
        "I0071": 5 ,
        "I0073": 5 ,
        "I0074": 5 ,
        "I0077": 5 ,
        "I0081": 5 ,
        "I0082": 5 ,
        "I0084": 5 ,
        "I0085": 5 ,
        "I0095": 5 ,
        "I0097": 5 ,
        "I0099": 5 ,
        "I0100": 5 ,
        "I0105": 5 ,
        "I0106 ": 5 ,
        "I0113": 5 ,
        "I0119": 5 ,
        "I0126": 5 ,
        "I0129": 5 ,
        "I0130": 5 ,
        "IM0001": "KCT" ,
        "IM0002": "KCT" ,
        "IM0003": "KCT" ,
        "IM0004": "KCT" ,
        "IM0005": "KCT" ,
        "IMKCB": "KCT" ,
        "IN50001": "KCT" ,
        "IN50002": "KCT" ,
        "IN50003": "KCT" ,
        "IN50004": "KCT" ,
        "IN50005": "KCT" ,
        "KCB": "KCT" ,
        "KSKKCB": "KCT" ,
        "KT0012": 5 ,
        "KT0015": 10 ,
        "KT002": 5 ,
        "KT004": 5 ,
        "KT005": 5 ,
        "KT006": 5 ,
        "KT007": 5 ,
        "KT008": 5 ,
        "KT009": 5 ,
        "KT010": 5 ,
        "KT013": 5 ,
        "KT014": 5 ,
        "KT017": 5 ,
        "KT018": 5 ,
        "KTYT": 5 ,
        "M0008": 10 ,
        "M0009": 10 ,
        "M0010": 10 ,
        "M0011": 10 ,
        "M0012": 10 ,
        "M0014": 10 ,
        "M0015": 10 ,
        "M0016": 5 ,
        "M0017": 5 ,
        "M0018": 5 ,
        "M0019": 5 ,
        "M0021": 5 ,
        "M0022": 10 ,
        "M0026": 5 ,
        "M0027": 5 ,
        "M0029": 5 ,
        "M0031": 5 ,
        "M0032": 5 ,
        "M0033": 5 ,
        "M0034": 5 ,
        "M0035": 5 ,
        "M0036": 5 ,
        "M0036-1": 5 ,
        "M0036-2": 5 ,
        "M0037": 5 ,
        "M0038": 5 ,
        "M0039": 5 ,
        "M0040": 5 ,
        "M0041": 5 ,
        "M0042": 5 ,
        "M0043": 5 ,
        "M0045": 5 ,
        "M0046": 5 ,
        "M0047": 5 ,
        "M0048": 5 ,
        "M0050": 5 ,
        "M0052": 5 ,
        "M0053": 5 ,
        "M0054": 5 ,
        "M0055": 5 ,
        "M0056": 5 ,
        "M0057": 5 ,
        "M0059": 5 ,
        "M0060": 5 ,
        "M0061": 5 ,
        "M0063": 5 ,
        "M0064": 5 ,
        "M0066": 5 ,
        "M0067": 5 ,
        "M0069": 5 ,
        "M0070": 5 ,
        "M0071": 5 ,
        "M0073": 5 ,
        "M0074": 5 ,
        "M0075": 5 ,
        "M0076": 5 ,
        "M0077": 5 ,
        "M0077-1": 5 ,
        "M0077-2": 5 ,
        "M0081": 5 ,
        "M0081-1": 5 ,
        "M0081-2": 5 ,
        "M0082": 5 ,
        "M0085": 5 ,
        "M0088": 5 ,
        "M0089": 5 ,
        "M0090": 5 ,
        "M0091": 5 ,
        "M0092": 5 ,
        "M0092-2": 5 ,
        "M0093": 5 ,
        "M0094": 5 ,
        "M0095": 5 ,
        "M0096": 5 ,
        "M0099": 5 ,
        "M0100": 8 ,
        "M0101": 5 ,
        "M0107": 5 ,
        "M0108": 5 ,
        "M0109": 5 ,
        "M0110": 5 ,
        "M0112": 5 ,
        "M0113": 5 ,
        "M0115": 5 ,
        "M0118": 5 ,
        "M0119": 5 ,
        "M0120": 5 ,
        "M0120-1": 5 ,
        "M0121": 5 ,
        "M0122": 5 ,
        "M0123": 5 ,
        "M0124": 5 ,
        "M0125": 5 ,
        "M0125-1": 5 ,
        "M0126": 5 ,
        "M0128": 5 ,
        "M0131": 5 ,
        "M0131-01": 5 ,
        "M0133": 5 ,
        "M0134": 5 ,
        "M0135": 5 ,
        "M0137": 5 ,
        "M0139": 5 ,
        "M0140": 5 ,
        "M0141": 5 ,
        "M0142": 5 ,
        "M0145": 5 ,
        "M0146": 5 ,
        "M0147": 5 ,
        "M0149": 5 ,
        "M0149-1": 5 ,
        "M0149-2": 5 ,
        "M0151": 5 ,
        "M0152": 5 ,
        "M0154": 5 ,
        "M0155": 5 ,
        "M0156": 5 ,
        "M0156-1": 5 ,
        "M0157": 5 ,
        "M0158": 5 ,
        "M0159": 5 ,
        "M0160": 5 ,
        "M0161": 5 ,
        "M0162": 5 ,
        "M0164": 5 ,
        "M0165": 8 ,
        "M0166": 5 ,
        "M0168": 5 ,
        "M0169": 5 ,
        "M0170": 5 ,
        "M0170-01": 5 ,
        "M0171": 5 ,
        "M0172": 5 ,
        "M0173": 5 ,
        "M0174": 5 ,
        "M0175": 5 ,
        "M0176": 5 ,
        "M0178": 5 ,
        "M0179": 5 ,
        "M0180": 5 ,
        "M0181": 5 ,
        "M0182": 5 ,
        "M0184": 5 ,
        "M0189": 5 ,
        "M0194": 5 ,
        "M0201": 10 ,
        "M0202": 10 ,
        "M0205": 5 ,
        "M0206": 5 ,
        "M0207": 5 ,
        "M0208": 5 ,
        "M0209": 5 ,
        "M0211": 10 ,
        "M0212": 5 ,
        "M0217": 5 ,
        "M0218": 10 ,
        "M0220": 5 ,
        "M0222": 5 ,
        "M0223": 5 ,
        "M0224": 5 ,
        "M0226": 5 ,
        "M0227": 5 ,
        "M0228": 5 ,
        "M0229": 5 ,
        "M0231": 5 ,
        "M0232": 5 ,
        "M0233": 5 ,
        "M0234": 5 ,
        "M0235": 10 ,
        "M0236": 5 ,
        "M0238": 5 ,
        "M0246": 5 ,
        "M0248": 5 ,
        "M0249": 5 ,
        "M0251": 5 ,
        "M0253": 5 ,
        "M0254": 5 ,
        "M0255": 5 ,
        "M0256": 5 ,
        "M0261": 5 ,
        "M0263": 5 ,
        "M0272": 5 ,
        "M0273": 5 ,
        "M0274": 5 ,
        "M0275": 5 ,
        "M0277": 5 ,
        "M0278": 5 ,
        "M0279": 5 ,
        "M0280": 10 ,
        "M0281": 10 ,
        "M0282": 5 ,
        "M0283": 5 ,
        "M0284": 5 ,
        "M0285": 5 ,
        "M0286": 5 ,
        "M0287": 5 ,
        "M0288": 5 ,
        "M0289": 5 ,
        "M0290": 5 ,
        "M0292": 5 ,
        "M0294": 5 ,
        "M0297": 5 ,
        "M0298": 8 ,
        "M0298_GM": 8 ,
        "M0299": 5 ,
        "M0300": 5 ,
        "M0301": 5 ,
        "M0302": 5 ,
        "M0304": 5 ,
        "M0305": 5 ,
        "M0306": 5 ,
        "M0307": 10 ,
        "M0308": 5 ,
        "M0309": 5 ,
        "M0312": 5 ,
        "M0313": 5 ,
        "M0314": 5 ,
        "M0315": 5 ,
        "M0320": 5 ,
        "M0324": 5 ,
        "M0325": 5 ,
        "M0326": 5 ,
        "M0330": 10 ,
        "M0332": 5 ,
        "M0333": 5 ,
        "M0334": 5 ,
        "M0335": 5 ,
        "M0336": 5 ,
        "M0337": 5 ,
        "M0340": 10 ,
        "M0342": 5 ,
        "M0343": 5 ,
        "M0344": 5 ,
        "M0345": 5 ,
        "M0346": 5 ,
        "M0349": 5 ,
        "M0350": 5 ,
        "M0350-2": 5 ,
        "M0351": 5 ,
        "M0352": 5 ,
        "M0356": 10 ,
        "M0357": 10 ,
        "M0358": 5 ,
        "M0363": 5 ,
        "M0364": 5 ,
        "M0365": 5 ,
        "M0366": 5 ,
        "M0367": 5 ,
        "M0368": 5 ,
        "M0369": 5 ,
        "M0371": 5 ,
        "M0374": 5 ,
        "M0375": 5 ,
        "M0376": 5 ,
        "M0378": 5 ,
        "M0380": 10 ,
        "M0381": 5 ,
        "M0383": 5 ,
        "M0388": 10 ,
        "M0389": 5 ,
        "M0395": 5 ,
        "M0398": 5 ,
        "M0399": 5 ,
        "M0400": 5 ,
        "M0401": 5 ,
        "M0404": 5 ,
        "M0405": 5 ,
        "M0411": 5 ,
        "M0412": 5 ,
        "M0415": 5 ,
        "M0416": 8 ,
        "M0417": 5 ,
        "M0417-2": 5 ,
        "M0419": 5 ,
        "M0420": 5 ,
        "M0421": 10 ,
        "M0423": 10 ,
        "M0426": 10 ,
        "M0427": 5 ,
        "M0429": 5 ,
        "M0431": 5 ,
        "M0432": 5 ,
        "M0433": 5 ,
        "M0434": 5 ,
        "M0435": 5 ,
        "M0436": 5 ,
        "M0437": 5 ,
        "M0438": 5 ,
        "M0439": 5 ,
        "M0440": 5 ,
        "M0444": 5 ,
        "M0444_GM": 5 ,
        "M0445": 5 ,
        "M0446": 8 ,
        "M0447": 8 ,
        "M0450": 5 ,
        "M0452": 5 ,
        "M0453": 5 ,
        "M0454": "KCT" ,
        "M0455": 5 ,
        "M0456": 5 ,
        "M0456-01": 5 ,
        "M0457": 5 ,
        "M0459": 5 ,
        "M0460": 5 ,
        "M0461": 5 ,
        "M0462": 5 ,
        "M0463": 5 ,
        "M0465": 5 ,
        "M0476": 5 ,
        "M0478": 5 ,
        "M0480": 5 ,
        "M0481": 5 ,
        "M0482": 5 ,
        "M0483": 5 ,
        "M0484": 5 ,
        "M0485": 5 ,
        "M0486": 5 ,
        "M0487": 5 ,
        "M0488": 5 ,
        "M0493": 5 ,
        "M0494": 5 ,
        "M0495": 5 ,
        "M0496": 5 ,
        "M0497": 5 ,
        "M0498": 5 ,
        "M0499": 5 ,
        "M0500": 5 ,
        "M0501": 5 ,
        "M0502": 5 ,
        "M0504": 5 ,
        "M0505": 5 ,
        "M0506": 5 ,
        "M0508": 5 ,
        "M0510": 5 ,
        "M0511": 5 ,
        "M0512": 5 ,
        "M0513": 5 ,
        "M0514": 5 ,
        "M0515": 8 ,
        "M0517": 5 ,
        "M0518": 5 ,
        "M0523": 5 ,
        "M0524": 5 ,
        "M0526": 5 ,
        "M0527": 5 ,
        "M0528": 5 ,
        "M0532": 5 ,
        "M0533": 10 ,
        "M0534": 10 ,
        "M0536": 5 ,
        "M0537": 8 ,
        "M0538": 5 ,
        "M0539": 5 ,
        "M0540": 5 ,
        "M0540-01": 5 ,
        "M0541": 5 ,
        "M0542": 5 ,
        "M0544": 5 ,
        "M0547": 5 ,
        "M0549": 5 ,
        "M0550": 5 ,
        "M0551": 5 ,
        "M0552": 5 ,
        "M0553": 5 ,
        "M0554": 5 ,
        "M0556": 5 ,
        "M0557": 5 ,
        "M0558": 5 ,
        "M0560": 5 ,
        "M0561": 5 ,
        "M0562": 5 ,
        "M0563": 5 ,
        "M0564": 5 ,
        "M0565": 5 ,
        "M0566": 5 ,
        "M0570": 5 ,
        "M0571": 10 ,
        "M0573": 5 ,
        "M0574": 8 ,
        "M0575": 5 ,
        "M0575-2": 5 ,
        "M0580": 5 ,
        "M0581": 5 ,
        "M0583": 5 ,
        "M0586": 5 ,
        "M0588": 5 ,
        "M0590": 5 ,
        "M0591": 5 ,
        "M0595": 5 ,
        "M0596": 5 ,
        "M0598": 10 ,
        "M0599": 10 ,
        "M0600": 5 ,
        "M0601": 8 ,
        "M0602": 5 ,
        "M0603": 5 ,
        "M0604": 5 ,
        "M0605": 8 ,
        "M0606": 5 ,
        "M0607": 5 ,
        "M0609": 5 ,
        "M0609-01": 5 ,
        "M0611": 5 ,
        "M0612": 5 ,
        "M0613": 5 ,
        "M0614": 5 ,
        "M0616 ": 5 ,
        "M0617": 5 ,
        "M0618": 5 ,
        "M0620": 10 ,
        "M0621": 5 ,
        "M0622": 5 ,
        "M0623": 5 ,
        "M0627": 5 ,
        "M0628": 10 ,
        "M0629": 5 ,
        "M0630": 5 ,
        "M0631": 10 ,
        "M0635": 10 ,
        "M0636": 5 ,
        "M0637": 10 ,
        "M0638": 5 ,
        "M0640": 10 ,
        "M0641": 5 ,
        "M0642": 5 ,
        "M0643": 5 ,
        "M0644": 5 ,
        "M0645": 5 ,
        "M0649": 5 ,
        "M0650": 5 ,
        "M0651": 5 ,
        "M0652": 5 ,
        "M0653": 5 ,
        "M0654": 5 ,
        "M0655": 5 ,
        "M0656": 5 ,
        "M0657": 5 ,
        "M0659": 5 ,
        "M0663": 5 ,
        "M0664": 5 ,
        "M0667": 5 ,
        "M0667-1": 5 ,
        "M0668": 5 ,
        "M0670": 5 ,
        "M0672": 5 ,
        "M0673": 5 ,
        "M0675": 5 ,
        "M0676": 5 ,
        "M0677": 5 ,
        "M0678": 5 ,
        "M0679": 5 ,
        "M0680": 5 ,
        "M0681": 5 ,
        "M0682": 5 ,
        "M0683": 5 ,
        "M0686": 5 ,
        "M0687": 5 ,
        "M0688": 5 ,
        "M0690": 5 ,
        "M0690-MS": 5 ,
        "M0691": 8 ,
        "M0692": 8 ,
        "M0693": 10 ,
        "M0694": 5 ,
        "M0695": 10 ,
        "M0696": 5 ,
        "M0697": 5 ,
        "M0698": 5 ,
        "M0700": 5 ,
        "M0702": 5 ,
        "M0703": 8 ,
        "M0704": 5 ,
        "M0705": 8 ,
        "M0706": 8 ,
        "M0707": 5 ,
        "M0712": 5 ,
        "M0713": 5 ,
        "M0716": 5 ,
        "M0716-01": 5 ,
        "M0717": 5 ,
        "M0722": 5 ,
        "M0723": 5 ,
        "M0724": 5 ,
        "M0725": 8 ,
        "M0726": 5 ,
        "M0728": 5 ,
        "M0729": 5 ,
        "M0731": 5 ,
        "M0732": 5 ,
        "M0733": 5 ,
        "M0735": 5 ,
        "M0736": 8 ,
        "M0737": 8 ,
        "M0738": 8 ,
        "M0739": 8 ,
        "M0740": 8 ,
        "M0742": 5 ,
        "M0743": 5 ,
        "M0744": 5 ,
        "M0745": 5 ,
        "M0746": 5 ,
        "M0747": 5 ,
        "M0748": 5 ,
        "M0754": 5 ,
        "M0755": 5 ,
        "M0756": 5 ,
        "M0757": 5 ,
        "M0758": 5 ,
        "M0761": 5 ,
        "M0763": 5 ,
        "M0764": 8 ,
        "M0765": 5 ,
        "M0766": 10 ,
        "M0768": 8 ,
        "M0770": 8 ,
        "M0772": 8 ,
        "M0773": 5 ,
        "M0774": 5 ,
        "M0776": 5 ,
        "M0779": 8 ,
        "M0780": 5 ,
        "M0782": 5 ,
        "M0783": 8 ,
        "M0786": 5 ,
        "M0788": 8 ,
        "M0789": 5 ,
        "M0790": 5 ,
        "M0791": 5 ,
        "M0792": 5 ,
        "M0793": 5 ,
        "M0794": 5 ,
        "M0795": 5 ,
        "M0796": 5 ,
        "M0797": 5 ,
        "M0799": 8 ,
        "M0800": 5 ,
        "M0801": 5 ,
        "M0802": 5 ,
        "M0803": 8 ,
        "M0804": 8 ,
        "M0805": 5 ,
        "M0808": 8 ,
        "M0809": 5 ,
        "M0810": 5 ,
        "M0811": 8 ,
        "M0812": 5 ,
        "M0813": 5 ,
        "M0814": 5 ,
        "M0815": 8 ,
        "M0817": 8 ,
        "M0818": 5 ,
        "M0820": 8 ,
        "M0821": 5 ,
        "M0822": 8 ,
        "M0823": 8 ,
        "M0824": 8 ,
        "M0825": 8 ,
        "M0826": 5 ,
        "M0828": 5 ,
        "M0829": 5 ,
        "M0830": 5 ,
        "M0831": 5 ,
        "M0833": 5 ,
        "M0835": 5 ,
        "M0838": 5 ,
        "M0839": 5 ,
        "M0840": 5 ,
        "M0842": 5 ,
        "M0843": 5 ,
        "M0845": 5 ,
        "M0846": 5 ,
        "M0847": 8 ,
        "M0848": 5 ,
        "M0849": 5 ,
        "M0850": 5 ,
        "M0854": 5 ,
        "M0855": 5 ,
        "M0856": 5 ,
        "M0857": 8 ,
        "M0858": 8 ,
        "M0859": 8 ,
        "M0860": 8 ,
        "M0861": 8 ,
        "M0862": 8 ,
        "M0863": 8 ,
        "M0868": 5 ,
        "M0869": 5 ,
        "M0870": 5 ,
        "M0872": 5 ,
        "M0873": 5 ,
        "M0874": 5 ,
        "M0875": 5 ,
        "M0876": 5 ,
        "M0877": 5 ,
        "M0878": 5 ,
        "M0880": 5 ,
        "M0882": 8 ,
        "M0882.": 8 ,
        "M0883": 5 ,
        "M0884": 5 ,
        "M0885": 5 ,
        "M0893": 5 ,
        "M0894": 5 ,
        "M0895": 5 ,
        "M0896": 5 ,
        "M0897": 5 ,
        "M0898": 5 ,
        "M0900": 5 ,
        "M0901": 5 ,
        "M0903": 5 ,
        "M0904": 5 ,
        "M0905": 5 ,
        "M0906": 5 ,
        "M0907": 5 ,
        "M0908": 5 ,
        "M0909": 5 ,
        "M0911": 5 ,
        "M0912": 5 ,
        "M0913": 5 ,
        "M0914": 5 ,
        "M0915": 10 ,
        "M0916": 8 ,
        "M0917": 8 ,
        "M0918": 8 ,
        "M0919": 8 ,
        "M0920": 8 ,
        "M0921": 8 ,
        "M0922": 8 ,
        "M0923": 5 ,
        "M0924": 5 ,
        "M0927": 5 ,
        "M0928": 5 ,
        "M0929": 5 ,
        "M0930": 5 ,
        "M0931": 5 ,
        "M0932": 5 ,
        "M0933": 5 ,
        "M0934": 5 ,
        "M0936": 5 ,
        "M0938": 5 ,
        "M0939": 5 ,
        "M0940": 5 ,
        "M0941": 5 ,
        "M0942": 5 ,
        "M0943": 5 ,
        "M0944": 5 ,
        "M0945": 5 ,
        "M0946": 5 ,
        "M0947": 8 ,
        "M0948": 5 ,
        "M0949": 5 ,
        "M0951": 5 ,
        "M0952": 5 ,
        "M0953": 5 ,
        "M0954": 5 ,
        "M0955": 5 ,
        "M0956": 8 ,
        "M0957": 8 ,
        "M0958": 5 ,
        "M0959": 5 ,
        "M0962": 5 ,
        "M0963": 5 ,
        "M0964": 5 ,
        "M0967": 5 ,
        "M0968": 5 ,
        "M0969": 5 ,
        "M0970": 5 ,
        "M0971": 5 ,
        "M0972": 5 ,
        "M0973": 5 ,
        "M0974": 5 ,
        "M0976": 5 ,
        "M0977": 5 ,
        "M0978": 5 ,
        "M0979": 5 ,
        "M0980": 5 ,
        "M0981": 5 ,
        "M0982": 5 ,
        "M0983": 5 ,
        "M0984": 5 ,
        "M0986": 5 ,
        "M0987": 5 ,
        "M0990": 5 ,
        "M0992": 5 ,
        "M0993": 5 ,
        "M0994": 5 ,
        "M0995": 5 ,
        "M0996": 5 ,
        "M0999": 5 ,
        "M1000": 5 ,
        "M1001": 5 ,
        "M1003": 5 ,
        "M1004": 5 ,
        "M1005": 5 ,
        "M1006": 5 ,
        "M1007": 5 ,
        "M1008": 5 ,
        "M1009": 5 ,
        "M1010": 5 ,
        "M1011": 5 ,
        "M1012": 5 ,
        "M1015": 5 ,
        "M1016": 5 ,
        "M1017": 5 ,
        "M1018": 5 ,
        "M1019": 5 ,
        "M1020": 5 ,
        "M1022": 5 ,
        "M1025": 5 ,
        "M1026": 5 ,
        "M1027": 5 ,
        "M1027-1": 5 ,
        "M1028": 5 ,
        "M1029": 5 ,
        "M1031": 5 ,
        "M1032": 5 ,
        "M1033": 5 ,
        "M1034": 5 ,
        "M1037": 5 ,
        "M1039": 5 ,
        "M1040": 10 ,
        "M1041": 10 ,
        "M1043": 5 ,
        "M1045": 5 ,
        "M1046": 5 ,
        "M1047": 5 ,
        "M1048": 5 ,
        "M1049": 10 ,
        "M1050": 5 ,
        "M1051": 5 ,
        "M1053": 5 ,
        "M1054": 5 ,
        "M1055": 5 ,
        "M1057": 5 ,
        "M1058": 5 ,
        "M1059": 5 ,
        "M1060": 5 ,
        "M1062": 5 ,
        "M1063": 5 ,
        "M1067": 5 ,
        "M1068": 5 ,
        "M1069": 5 ,
        "M1071": 5 ,
        "M1072": 5 ,
        "M1073": 5 ,
        "M1074": 5 ,
        "M1075": 5 ,
        "M1076": 8 ,
        "M1078": 5 ,
        "M1079": 5 ,
        "M1080": 5 ,
        "M1081": 5 ,
        "M1082": 5 ,
        "M1084": 5 ,
        "M1085": 5 ,
        "M1086": 5 ,
        "M1087": 8 ,
        "M1088": 5 ,
        "M1089": 5 ,
        "M1090": 5 ,
        "M1092": 5 ,
        "M1093": 5 ,
        "M1094": 5 ,
        "M1095": 5 ,
        "M1096": 5 ,
        "M1097": 5 ,
        "M1098": 5 ,
        "M1099": 5 ,
        "M1100": 5 ,
        "M1103": 5 ,
        "M1104": 5 ,
        "M1108": 5 ,
        "M1111": 5 ,
        "M1113": 5 ,
        "M1114": 5 ,
        "M1116": 5 ,
        "M1117": 5 ,
        "M1118": 10 ,
        "M1120": 5 ,
        "M1121": 5 ,
        "M1122": 5 ,
        "M1123": 5 ,
        "M1124": 5 ,
        "M1125": 5 ,
        "M1126": 5 ,
        "M1127": 5 ,
        "M1128": 5 ,
        "M1131": 5 ,
        "M1132": 5 ,
        "M1133": 5 ,
        "M1134": 5 ,
        "M1135": 5 ,
        "M1136": 5 ,
        "M1137": 5 ,
        "M1139": 5 ,
        "M1140": 5 ,
        "M1141": 8 ,
        "M1142": 5 ,
        "M1144": 5 ,
        "M1145": 5 ,
        "M1150": 5 ,
        "M1151": 5 ,
        "M1154": 5 ,
        "M1158": 10 ,
        "M1160": 5 ,
        "M1161": 5 ,
        "M1162": 5 ,
        "M1163": 5 ,
        "M1165": 5 ,
        "M1167": 5 ,
        "M1169": 5 ,
        "M1177": 5 ,
        "M1179": 5 ,
        "M1182": 5 ,
        "M1183": 5 ,
        "M1184": 5 ,
        "M1185": 5 ,
        "M1187": 5 ,
        "M1190": 5 ,
        "M1191": 5 ,
        "M1192": 5 ,
        "M1193": 5 ,
        "M1195": 5 ,
        "M1196": 5 ,
        "M1201": 5 ,
        "M1202": 5 ,
        "M1204": 8 ,
        "M1205": 5 ,
        "M1206": 5 ,
        "M1207": 5 ,
        "M1209": 5 ,
        "M1210": 5 ,
        "M1212": 8 ,
        "M1213": 5 ,
        "M1214": 5 ,
        "M1216": 5 ,
        "M669": 5 ,
        "MANG_NHOM": 10 ,
        "MAY-01": 5 ,
        "MLKK": 10 ,
        "MP002": 10 ,
        "MP003": 10 ,
        "MP004": 10 ,
        "MP005": 10 ,
        "MP006": 10 ,
        "MTG-1": 5 ,
        "NHAKCB": "KCT" ,
        "NLCTR2": 10 ,
        "NLCTR3": 10 ,
        "OBG0001": "KCT" ,
        "OBG0004": "KCT" ,
        "OBG0005": "KCT" ,
        "OBG0006": "KCT" ,
        "OBG0011": "KCT" ,
        "OBG0012": "KCT" ,
        "OBG0013": "KCT" ,
        "OBG0014": "KCT" ,
        "OBG0015": "KCT" ,
        "OBG0016": "KCT" ,
        "OBG0017": "KCT" ,
        "OBG0018": "KCT" ,
        "OBG0019": "KCT" ,
        "OBG0020": "KCT" ,
        "OBG0021": "KCT" ,
        "OBG0029": "KCT" ,
        "OBG0030": "KCT" ,
        "OBG0031": "KCT" ,
        "OBG0032": "KCT" ,
        "OBG0033": "KCT" ,
        "OBG0034": "KCT" ,
        "OBG0035": "KCT" ,
        "OBG0036": "KCT" ,
        "OBG0038": "KCT" ,
        "OBG0040": "KCT" ,
        "OBG0041": "KCT" ,
        "OBG0042": "KCT" ,
        "OBG0043": "KCT" ,
        "OBG0044": "KCT" ,
        "OBG0045": "KCT" ,
        "OBG0046": "KCT" ,
        "OBG0047": "KCT" ,
        "OBG0048": "KCT" ,
        "OBG0049": "KCT" ,
        "OBG0050": "KCT" ,
        "OBG0051": "KCT" ,
        "OBG0052": "KCT" ,
        "OBG0053": "KCT" ,
        "OBG0054": "KCT" ,
        "OBG0060": "KCT" ,
        "OBG0061": "KCT" ,
        "OBG0062": "KCT" ,
        "OBG0063": "KCT" ,
        "OBG0064": "KCT" ,
        "OBG0072": "KCT" ,
        "OBG0073": "KCT" ,
        "OKCB": "KCT" ,
        "OSFRK": 5 ,
        "PBX": 10 ,
        "PHS": 10 ,
        "PLK": 10 ,
        "PMKCB": "KCT" ,
        "PS0090": "KCT" ,
        "PS0091": "KCT" ,
        "PS0092": "KCT" ,
        "PS0093": "KCT" ,
        "PS0094": "KCT" ,
        "PS0095": "KCT" ,
        "PS0098": "KCT" ,
        "PS0099": "KCT" ,
        "PS0100": "KCT" ,
        "PS0110": "KCT" ,
        "PS20015": 10 ,
        "PS30008": "KCT" ,
        "PS30009": "KCT" ,
        "PS40011": "KCT" ,
        "PTC": 10 ,
        "R0001": "KCT" ,
        "R0002": "KCT" ,
        "R0003": "KCT" ,
        "R0004": "KCT" ,
        "R0005": "KCT" ,
        "R0006": "KCT" ,
        "R0007": "KCT" ,
        "R0008": "KCT" ,
        "R0009": "KCT" ,
        "R0010": "KCT" ,
        "R0011": "KCT" ,
        "R0012": "KCT" ,
        "R0013": "KCT" ,
        "R0014": "KCT" ,
        "R0015": "KCT" ,
        "R0016": "KCT" ,
        "R0017": "KCT" ,
        "R0018": "KCT" ,
        "R0019": "KCT" ,
        "R0020": "KCT" ,
        "R0021": "KCT" ,
        "R0022": "KCT" ,
        "R0023": "KCT" ,
        "R0024": "KCT" ,
        "R0025": "KCT" ,
        "R0026": "KCT" ,
        "R0027": "KCT" ,
        "R0028": "KCT" ,
        "R0029": "KCT" ,
        "R0030": "KCT" ,
        "R0031": "KCT" ,
        "R0032": "KCT" ,
        "R0033": "KCT" ,
        "R0034": "KCT" ,
        "R0035": "KCT" ,
        "R0036": "KCT" ,
        "R0037": "KCT" ,
        "R0038": "KCT" ,
        "R0039": "KCT" ,
        "R0040": "KCT" ,
        "R0041": "KCT" ,
        "R0042": "KCT" ,
        "R0043": "KCT" ,
        "R0044": "KCT" ,
        "R0045": "KCT" ,
        "R0046": "KCT" ,
        "R0047": "KCT" ,
        "R0048": "KCT" ,
        "R0049": "KCT" ,
        "R0050": "KCT" ,
        "R0051": "KCT" ,
        "R0052": "KCT" ,
        "R0053": "KCT" ,
        "R0054": "KCT" ,
        "R0055": "KCT" ,
        "R0056": "KCT" ,
        "R0057": "KCT" ,
        "R0058": "KCT" ,
        "R0059": "KCT" ,
        "R0060": "KCT" ,
        "R0061": "KCT" ,
        "R0062": "KCT" ,
        "R0063": "KCT" ,
        "R0064": "KCT" ,
        "R0065": "KCT" ,
        "R0066": "KCT" ,
        "R0067": "KCT" ,
        "R0068": "KCT" ,
        "R0069": "KCT" ,
        "R0070": "KCT" ,
        "SANKCB": "KCT" ,
        "T0006": "KCT" ,
        "TBCM_DS": 10 ,
        "TBCVR": 5 ,
        "TEST COVIT": "KCT" ,
        "Test_Genedia W": 5 ,
        "TEST_PCR": "KCT" ,
        "Test_Standard Q": 5 ,
        "THCC001": 5 ,
        "THCC002": 5 ,
        "THUOC 01": 5 ,
        "THUOC 02": 5 ,
        "THUOC 03": 5 ,
        "THUOC 04": 5 ,
        "THUOC 05": 5 ,
        "THUOC 06": 5 ,
        "THUOC 07": 5 ,
        "Thuoc noi": 5 ,
        "Thuoc noi 2": 5 ,
        "THUOC_GM": 5 ,
        "THUOC_GM1": 5 ,
        "THUOC1": 5 ,
        "thuốc1": 5 ,
        "thuốc2": 5 ,
        "THUOC3": 5 ,
        "THUOC9": 5 ,
        "TIENDIEN": 10 ,
        "TL": 10 ,
        "TVP2": 10 ,
        "U0001": "KCT" ,
        "U0002": "KCT" ,
        "U0003": "KCT" ,
        "U0004": "KCT" ,
        "U0005": "KCT" ,
        "U0006": "KCT" ,
        "U0007": "KCT" ,
        "U0008": "KCT" ,
        "U0009": "KCT" ,
        "U0010": "KCT" ,
        "U0011": "KCT" ,
        "U0012": "KCT" ,
        "U0013": "KCT" ,
        "U0014": "KCT" ,
        "U0015": "KCT" ,
        "U0016": "KCT" ,
        "U0017": "KCT" ,
        "U0018": "KCT" ,
        "U0019": "KCT" ,
        "U0020": "KCT" ,
        "U0021": "KCT" ,
        "U0022": "KCT" ,
        "U0023": "KCT" ,
        "U0024": "KCT" ,
        "U0025": "KCT" ,
        "U0026": "KCT" ,
        "U0027": "KCT" ,
        "U0028": "KCT" ,
        "U0029": "KCT" ,
        "U0030": "KCT" ,
        "U0031": "KCT" ,
        "U0032": "KCT" ,
        "U0033": "KCT" ,
        "U0034": "KCT" ,
        "U0035": "KCT" ,
        "U0036": "KCT" ,
        "U0037": "KCT" ,
        "U0038": "KCT" ,
        "U0040": "KCT" ,
        "U0041": "KCT" ,
        "U0042": "KCT" ,
        "U0043": "KCT" ,
        "U0044": "KCT" ,
        "U0045": "KCT" ,
        "U0046": "KCT" ,
        "U0047": "KCT" ,
        "U0048": "KCT" ,
        "U0049": "KCT" ,
        "U0050": "KCT" ,
        "U0051": "KCT" ,
        "U0052": "KCT" ,
        "U0053": "KCT" ,
        "VC0006": "KCT" ,
        "VC0007": "KCT" ,
        "VC0008": "KCT" ,
        "VC0012": "KCT" ,
        "VC0015": "KCT" ,
        "VC0019": "KCT" ,
        "VC0020": "KCT" ,
        "VC0021": "KCT" ,
        "VC0028": "KCT" ,
        "VC0033": "KCT" ,
        "VC0037": "KCT" ,
        "VC0039": "KCT" ,
        "VC0043": "KCT" ,
        "Vòi xịt": 10 ,
        "VPP": 10 ,
        "VT_0065": 5 ,
        "VT_DL_002": 5 ,
        "VT_DL001": 10 ,
        "VT_KCB001": 5 ,
        "VT_KS-001": 5 ,
        "VT_NHA_KEO": 5 ,
        "VT_NOI02": 5 ,
        "VT_PCR_OMT": 5 ,
        "VT_SGTi-flex COVID-19 Ag": 5 ,
        "VT001": 5 ,
        "VT0010": "KCT" ,
        "VT00100": 5 ,
        "VT00120": 5 ,
        "VT00121": 5 ,
        "VT002": 5 ,
        "VT0023": 5 ,
        "VT0024": 5 ,
        "VT0025": 5 ,
        "VT003": 10 ,
        "VT004": 10 ,
        "VT0055": 5 ,
        "VT006": "KCT" ,
        "VT0065": 5 ,
        "VT007": "KCT" ,
        "VT008": "KCT" ,
        "VT009": "KCT" ,
        "VT011": 5 ,
        "VT012": "KCT" ,
        "VT013": 5 ,
        "VT014": 5 ,
        "VT015": 10 ,
        "VT016": 5 ,
        "VT017": 5 ,
        "VT018": "KCT" ,
        "VT019": 5 ,
        "VT020": 5 ,
        "VT021": 5 ,
        "VT022": 5 ,
        "VT023": 5 ,
        "VT024": "KCT" ,
        "VT025": "KCT" ,
        "VT026": "KCT" ,
        "VT027": "KCT" ,
        "VT028": "KCT" ,
        "VT029": "KCT" ,
        "VT030": "KCT" ,
        "VT031": "KCT" ,
        "VT032": "KCT" ,
        "VT033": 10 ,
        "VT05": "KCT" ,
        "VT052": 5 ,
        "VT055": 5 ,
        "VTDL": 10 ,
        "VTDL001": 10 ,
        "VTDL01": 8 ,
        "VTDL05": 10 ,
        "VTDL06": 10 ,
        "VTDL07": 10 ,
        "VTDL09": 5 ,
        "VTKCB01": 5 ,
        "VTN02": 5 ,
        "VTNHA01": 5 ,
        "VTNK": 5 ,
        "VTNOI": 5 ,
        "VTNOI5": 5 ,
        "VTNOI55": 5 ,
        "VTPM01": 5 ,
        "VT-urgo": 5 ,
        "VTYT": 5 ,
        "VX001": "KCT" ,
        "VC0010": "KCT" ,
        "VX0030": "KCT" ,
        "VX0031": "KCT" ,
        "VX004": "KCT" ,
        "VX005": "KCT" ,
        "VX007": "KCT" ,
        "VX008": "KCT" ,
        "VX009": "KCT" ,
        "VX010": "KCT" ,
        "VX012": "KCT" ,
        "VX013": "KCT" ,
        "VX015": "KCT" ,
        "VX017": "KCT" ,
        "VX018": "KCT" ,
        "VX020": "KCT" ,
        "VX022": "KCT" ,
        "ZIAJA06": 10 ,
        "ZIAJA07": 10 ,
        "ZIAJA08": 10 ,
        "ZIAJA09": 10 ,
        "M1225": 5 ,
        "M1224": 5 ,
        "M1227": 5 ,
        "M1229": 5 ,
        "M1101": 5 ,
        "M1115": 5 ,

    }
    val = 'KCT'
    try:
        val = int(data[string])
        val = str(val) + '%'
    except:
        val = 'KCT'
    return val

def doc_so(so):
    chu_so = ["không", "một", "hai", "ba", "bốn", "năm", "sáu", "bảy", "tám", "chín"]
    hang = ["", "nghìn", "triệu", "tỷ"]

    def doc_3_so(so):
        tram = so // 100
        chuc = (so % 100) // 10
        don_vi = so % 10
        ket_qua = ""

        if tram > 0:
            ket_qua += chu_so[tram] + " trăm"
            if chuc == 0 and don_vi != 0:
                ket_qua += " lẻ"
        elif chuc > 0 or don_vi > 0:
            if len(ket_qua) > 0:  # Nếu có "triệu" hoặc "nghìn" phía trước
                ket_qua += " lẻ"

        if chuc > 0:
            if chuc == 1:
                ket_qua += " mười"
            else:
                ket_qua += " " + chu_so[chuc] + " mươi"

            if don_vi == 1 and chuc > 1:
                ket_qua += " mốt"
            elif don_vi == 5 and chuc > 0:
                ket_qua += " lăm"
            elif don_vi != 0:
                ket_qua += " " + chu_so[don_vi]
        elif don_vi != 0:
            ket_qua += " " + chu_so[don_vi]

        return ket_qua.strip()

    def doc_tien(so):
        ket_qua = ""
        vi_tri = 0

        if so == 0:
            return "không đồng"

        while so > 0:
            so_hien_tai = so % 1000
            if so_hien_tai != 0 or vi_tri == 0:
                ket_qua = doc_3_so(so_hien_tai) + " " + hang[vi_tri] + " " + ket_qua
            so //= 1000
            vi_tri += 1

        return ket_qua.strip()

    ket_qua = doc_tien(so)
    ket_qua = ket_qua[0].upper() + ket_qua[1:] + " đồng"

    return ket_qua.strip()
