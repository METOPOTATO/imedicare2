"""
Definition of views.
"""
import math
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
        "code": "code"
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
                }

            ],
            "code": "code"
        }
    ]
    org_list = [
        {
            "name": "Organization",
            "lower_menu": [
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

    allow_setting = False
    for menu in menu_list:
        if menu['name'] == 'Registration':
            list_1.append(menu)
        elif menu['name'] == 'Reservation':
            list_1.append(menu)
        elif menu['name'] == 'Payment':
            list_1.append(menu)
        elif menu['name'] == 'Pharmacy':
            menu['name'] = 'Medicine'
            list_2.append(menu)
        # elif menu['name'] == 'Medicine':
        #     list_1.append(menu)
        elif menu['name'] == 'Pick Up':
            pass
        elif menu['name'] == 'Drafts':
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

    menu_list = list_1 + list_2  + org_list
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