from django.shortcuts import render,redirect,HttpResponse
import datetime
import calendar
from django.utils import timezone, translation

from django.http import JsonResponse
from django.core.paginator import Paginator,PageNotAnInteger,EmptyPage
from django.contrib.auth.decorators import login_required

from Receptionist.models import *
from Receptionist.forms import *
from Patient.models import *
from Patient.forms import *
from Pharmacy.models import *
from Laboratory.models import *
from Radiation.models import *
from Nurse.models import *

from Manage.forms import DoctorsSearchForm 

from .models import *
from app.models import *
import operator
import functools

from .forms import *
# Create your views here.
from django.utils.translation import gettext as _
from django.forms.models import model_to_dict
from django.db.models import Q, Count, F
from django.db.models.functions import Lower
from django.template import RequestContext

from django.views.decorators.csrf import csrf_protect

@login_required
def index(request):

    f_name = F('commcode_name_en')
    if request.session[translation.LANGUAGE_SESSION_KEY] == 'ko':
        f_name = F('commcode_name_ko')
    elif request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        f_name = F('commcode_name_vi')
    #try:
    #    myinfo = Doctor.objects.get(user = request.user)
    #    if myinfo.name_kor is None:
    #        return redirect('/doctor/information')
    #    
    #except Doctor.DoesNotExist:
    #        return redirect('/doctor/information')
    #

    patient_form = PatientForm_Doctor()
    history_form = HistoryForm()
    vital_form = VitalForm()
    receptionsearch_form = SearchReceptionStatusForm()
    image_form = PatientImageForm()
    patient_mark = COMMCODE.objects.filter(upper_commcode = '000006',commcode_grp = 'PT_INFO',use_yn="Y").values('commcode','se1').order_by('seq')


    #diagnosis
    reception_form = ReceptionForm()
    diagnosis_form = DiagnosisForm()

    reservation_form = ReservationForm()

    exam_list = []
    #exam_datas = ExamFee.objects.filter( doctor_id = request.user.doctor.id )
    exam_datas = ExamFee.objects.filter( doctor_id = request.user.doctor.id )
    if not exam_datas:
        exam_datas = ExamFee.objects.filter( doctor_id__isnull = True , code__icontains='E', use_yn='Y')

    for exam_data in exam_datas:
        exam_list.append({
            'id':exam_data.id,
            'name':exam_data.name,
            'price':format(exam_data.get_price(), ',') + ' VND',
            'code':exam_data.code,
            })

    list_reservation_division= []
    query_reservation_division = COMMCODE.objects.filter(use_yn = 'Y',upper_commcode='000006', commcode_grp='RSRVT_DVSN').annotate(code = F('commcode'),name =f_name ).values('code','name')
    for data in query_reservation_division:
        list_reservation_division.append({
            'code':data['code'],
            'name':data['name']
            })
    #PM 은 별도로 출력
    if request.user.doctor.depart.name == 'PM':
        test_classes = TestClass.objects.all().order_by('name')
        test_data = {}
        for test_class in test_classes:
            tests = Test.objects.filter(test_class = test_class, use_yn='Y')
            temp = []
            for test in tests:
                temp.append({
                            'id':test.id,
                            'name':test.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
                            'name_vie':test.name_vie,
                            'code':test.code,
                            'price':format(test.get_price(), ',') + ' VND',
                            'upper':test_class.name ,
                        })
            test_data.update({ test_class.name : temp})



        precedure_data = []
        precedures = Precedure.objects.filter( Q(code__icontains='PM') | Q(code__contains='U') ,use_yn='Y').exclude(name__contains='LAT').order_by('code')
        for precedure in precedures:
            precedure_data.append({
                        'id':precedure.id,
                        'name':precedure.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
                        'name_vie':precedure.name_vie,
                        'code':precedure.code,
                        'price':format(precedure.get_price(), ',') + ' VND',
                    })

        radiography_data = []
        radiography_s = Precedure.objects.filter( Q(code__icontains='R') | Q(code__contains='PM', name__contains='LAT'),precedure_class_id = 10, use_yn='Y').order_by('id')
        for radiography in radiography_s:
            radiography_data.append({
                        'id':radiography.id,
                        'name':radiography.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
                        'name_vie':radiography.name_vie,
                        'code':radiography.code,
                        'price':format(radiography.get_price(), ',') + ' VND',
                    })

        medicines_data = []
        special_list = []
        
        medicine_s = Medicine.objects.filter( Q(id = 1) |Q(id = 71) |Q(id = 77) |Q(id = 137) |Q(id = 168) |Q(id = 172)|Q(id = 173)|Q(id=174), use_yn='Y').order_by('code')
        for medicine in medicine_s:
            medicines_data.append({
                        'id':medicine.id,
                        'name':medicine.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
                        'name_vie':medicine.name_vie,
                        'code':medicine.code,
                        'price':format(medicine.get_price(), ',') + ' VND',
                        'inventory_count':medicine.inventory_count,
                        'class_id':medicine.medicine_class_id,
                    })


        initial_report_q2_option = []
        initial_report_q2 = COMMCODE.objects.filter(commcode_grp = 'PM_IRQ2').values('id','seq','se1','se2','se4','se5')
        initial_report_q2_title = COMMCODE.objects.filter(commcode_grp = 'PM_IRQ2').values('se2','seq','se6','se7','se8').annotate(Count('se2')).extra(select={'tmp_seq':'CAST(seq AS INTERGER)'}).order_by('tmp_seq')
        for title in initial_report_q2_title:
            item = COMMCODE.objects.filter(commcode_grp = 'PM_IRQ2').values('se2').annotate(Count('se2'))



        argument_medicine_class_list = []
        medicine_data = {}
        medicine_class_query = Depart_MedicineMenu.objects.filter(depart_id = request.user.doctor.depart.id)
        for data in medicine_class_query:
            argument_medicine_class_list.append(Q(**{'id':data.medicine_class_id} ))

        medicine_classes = MedicineClass.objects.filter(
            functools.reduce(operator.or_, argument_medicine_class_list),
            )

        for medicine_class in medicine_classes:
            medicines = Medicine.objects.filter(medicine_class = medicine_class, use_yn='Y')
            temp = []
            for medicine in medicines:
                temp.append({
                            'id':medicine.id,
                            'name_display':medicine.name_display,
                            'name':medicine.name_display,
                            'code':medicine.code,
                            'unit':'' if medicine.unit is None else medicine.unit,
                            'price':format(medicine.get_price(), ',') + ' VND',
                            'ingredient':medicine.ingredient,
                            'inventory_count':medicine.inventory_count,
                            'class_id':medicine.medicine_class_id,
                            'red_invoice':True if medicine.red_invoice == 'Y' else False,
                        })
            medicine_data.update({ medicine_class.name : temp})

        

        return render(request,
        'Doctor/index_PM.html',
            {
                'patient':patient_form,
                'patient_mark':patient_mark,
                'history':history_form,
                'vital':vital_form,
                'receptionsearch':receptionsearch_form,
                'reception':reception_form,
                'diagnosis':diagnosis_form,

                'exam_list':exam_list,
                'test_class':test_class,
                'tests':test_data,
                'precedures':precedure_data,
                'radiographys':radiography_data,
                #'medicines':medicines_data,
                'medicine_classes':medicine_classes,
                'medicines':medicine_data,

                'reservation':reservation_form,
                'today_vital':datetime.date.today().strftime('%b-%d'),

                
                'initial_report_q2':initial_report_q2,
                'initial_report_q2_title':initial_report_q2_title,

                'list_reservation_division':list_reservation_division,
                # 'image_form':image_form,
            }
        )

    
    if request.user.doctor.depart.id == 4: #PS 
        url = 'Doctor/index_DERM.html'
    elif request.user.doctor.depart.id == 6: #DERM
        url = 'Doctor/index_DERM.html'
    elif request.user.doctor.depart.id == 8: #DENTAL
        url = 'Doctor/index_DERM.html'
    else:
        url = 'Doctor/index.html'


    argument_test_class_list = []
    test_class_query = Depart_TestMenu.objects.filter(depart_id = request.user.doctor.depart.id)
    for data in test_class_query:
        argument_test_class_list.append(Q(**{'id':data.test_class_id} ))
    print(data)
    test_classes = TestClass.objects.filter(
        functools.reduce(operator.or_, argument_test_class_list),
        ).order_by('name')
    test_data = {}
    for test_class in test_classes:
        tests = Test.objects.filter(test_class = test_class, use_yn='Y')
        temp = []
        for test in tests:
            temp.append({
                        'id':test.id,
                        'name':test.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
                        'name_vie':test.name_vie,
                        'code':test.code,
                        'price':format(test.get_price(), ',') + ' VND',
                        'upper':test_class.name ,
                    })
                    
        if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
            test_data.update({ test_class.name_vie : temp})
        else:
            test_data.update({ test_class.name : temp})
        

    #tests = Test.objects.filter( use_yn='Y')
    #test_data = []
    #for test in tests:
    #    test_data.append({
    #                'id':test.id,
    #                'name':test.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                'name_vie':test.name_vie,
    #                'code':test.code,
    #                'price':format(test.get_price(), ',') + ' VND',
    #            })


    #p_short_filter = PrecedureShort.objects.filter(doctor_id = request.user.doctor.id)
    #precedure_short = []
    #for p_short in p_short_filter:
    #    precedure_short.append({
    #        'id':p_short.precedure.id,
    #        'name':p_short.precedure.name,
    #        'name_vie':p_short.precedure.name_vie,
    #        'code':p_short.precedure.code,
    #        'price':format(p_short.precedure.get_price(), ',') + ' VND',
    #        #'upper':p_short.precedure_class.name ,
    #        })
    
   
    argument_list = [] 
    
    
    
    

    #과별 오픈 할 아이템
    #if request.user.doctor.depart.id == 5 or request.user.doctor.depart.id == 2: #ENT / IM
    #    argument_list.append(Q(**{'id':2} ))
    #    argument_list.append(Q(**{'id':3} ))
    #    argument_list.append(Q(**{'id':4} ))
    #    argument_list.append(Q(**{'id':5} ))
    #    argument_list.append(Q(**{'id':6} ))
    #    argument_list.append(Q(**{'id':8} ))
    #    argument_list.append(Q(**{'id':41} ))
    #    argument_list.append(Q(**{'id':44} ))
    #    argument_list.append(Q(**{'id':45} ))
    #    argument_list.append(Q(**{'id':46} ))
    #       
    #elif request.user.doctor.depart.id == 6: #DERM
    #    argument_list.append(Q(**{'id':2} ))
    #    argument_list.append(Q(**{'id':3} ))
    #    argument_list.append(Q(**{'id':4} ))
    #    argument_list.append(Q(**{'id':5} ))
    #    argument_list.append(Q(**{'id':6} ))
    #    argument_list.append(Q(**{'id':8} ))
    #    argument_list.append(Q(**{'id':11} ))
    #    argument_list.append(Q(**{'id':14} ))
    #    argument_list.append(Q(**{'id':21} ))
    #    argument_list.append(Q(**{'id':23} ))
    #    argument_list.append(Q(**{'id':27} ))
    #    argument_list.append(Q(**{'id':28} ))
    #    argument_list.append(Q(**{'id':30} ))
    #    argument_list.append(Q(**{'id':38} ))
    #    argument_list.append(Q(**{'id':41} ))
    #    argument_list.append(Q(**{'id':43} ))
    #    argument_list.append(Q(**{'id':44} ))
    #    argument_list.append(Q(**{'id':46} ))
    #    #테스트
    #
    #    url = 'Doctor/index_DERM.html'
    #
    #elif request.user.doctor.depart.id == 4: #PS 
    #    argument_list.append(Q(**{'id__gte':31} ))
    #    argument_list.append(Q(**{'id__lte':40} ))
    #    argument_list.append(Q(**{'id':42} ))
    #
    #    url = 'Doctor/index_DERM.html'



    argument_precedure_class_list = []
    precedure_data = {}
    precedure_class_query = Depart_PrecedureMenu.objects.filter(depart_id = request.user.doctor.depart.id)
    for data in precedure_class_query:
        argument_precedure_class_list.append(Q(**{'id':data.precedure_class_id} ))

    precedure_classes = PrecedureClass.objects.filter(
        functools.reduce(operator.or_, argument_precedure_class_list),
        )

    for precedure_class in precedure_classes:
        precedures = Precedure.objects.filter(precedure_class = precedure_class, use_yn='Y').order_by('code')
        temp = []
        for precedure in precedures:
            try:
                temp.append({
                    'id':precedure.id,
                    'name':precedure.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
                    'name_vie':precedure.name_vie,
                    'code':precedure.code,
                    'price':format(precedure.get_price(), ',') + ' VND',
                    'upper':precedure_class.name_vie if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi' else precedure_class.name,
                    'is_pkg':'PKG' if precedure.type=='PKG' else '',

                        })
            except:
                pass
        if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
            precedure_data.update({ precedure_class.name_vie : temp})
        else:
            precedure_data.update({ precedure_class.name : temp})

    #if len(argument_list) != 0:
    #    precedure_classes = PrecedureClass.objects.filter( functools.reduce(operator.or_, argument_list) ).values()
    #else:
    #    precedure_classes=PrecedureClass.objects.all().exclude(id=10).values()
    #
    #
    #
    #
    #precedure_data = {}
    #
    #for precedure_class in precedure_classes:
    #    precedures = Precedure.objects.filter( precedure_class_id = precedure_class['id'],use_yn='Y')
    #    temp = []
    #
    #    for precedure in precedures:
    #        temp.append({
    #                    'id':precedure.id,
    #                    'name':precedure.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                    'name_vie':precedure.name_vie,
    #                    'code':precedure.code,
    #                    'price':format(precedure.get_price(), ',') + ' VND',
    #                    'upper':precedure_class['name_vie'] if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi' else precedure_class['name'],
    #                    'is_pkg':'PKG' if precedure.type=='PKG' else '',
    #                })
    #    precedure_data.update({ precedure_class['name_vie'] if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi' else precedure_class['name'] : temp})
    #
    #if request.user.doctor.depart.id == 4: #PS  성형에 피부 아이템 추가
    #    precedures = Precedure.objects.filter( precedure_class_id__gte =11 ,precedure_class_id__lte = 29,use_yn='Y')
    #    temp = []
    #
    #    for precedure in precedures:
    #        temp.append({
    #                    'id':precedure.id,
    #                    'name':precedure.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                    'name_display':precedure.name_vie,
    #                    'code':precedure.code,
    #                    'price':format(precedure.get_price(), ',') + ' VND',
    #                    #'upper':precedure_class['name'],
    #                })
    #    precedure_data.update({ '피부관리' : temp})
    #
    #    precedures = Precedure.objects.filter( precedure_class_id = 30,use_yn='Y')
    #
    #    temp = []
    #    for precedure in precedures:
    #        temp.append({
    #                    'id':precedure.id,
    #                    'name':precedure.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                    'name_vie':precedure.name_vie,
    #                    'code':precedure.code,
    #                    'price':format(precedure.get_price(), ',') + ' VND',
    #
    #                    #'upper':precedure_class['name'],
    #                })
    #    precedure_data.update({ 'IVNT' : temp})






    #m_short_filter = MedicineShort.objects.filter(doctor_id = request.user.doctor.id)
    #medicine_short = []
    #for m_short in m_short_filter:
    #    medicine_short.append({
    #            'id':m_short.medicine.id,
    #            'name':m_short.medicine.name,
    #            'name_vie':m_short.medicine.name_vie,
    #            'code':m_short.medicine.code,
    #            'unit':'' if m_short.medicine.unit is None else m_short.medicine.unit,
    #            'price':format(m_short.medicine.get_price(), ',') + ' VND',
    #        })


    medicine_data = {}
    #if request.user.doctor.depart.id == 4: #PS 
    #    medicine_classes = ['Medicines','Injections','Ointment','Suppositiry']
    #    medicines = Medicine.objects.filter( Q(id=75)|Q(id=167)|Q(id=145)|Q(id=132)|Q(id=71)|Q(id=137)|Q(id=155)|Q(id=95)|Q(id=96),use_yn='Y').order_by('name')
    #    temp = []
    #    for medicine in medicines:
    #        temp.append( {
    #                        'id':medicine.id,
    #                        'name':medicine.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                        'name_vie':medicine.name_vie,
    #                        'code':medicine.code,
    #                        'unit':'' if medicine.unit is None else medicine.unit,
    #                        'price':format(medicine.get_price(), ',') + ' VND',
    #                        'inventory_count':medicine.inventory_count,
    #                        'class_id':medicine.medicine_class_id,
    #                        #'upper':medicine_class['name'],
    #                    })
    #    medicine_data.update({ 'Medicines' : temp})
    #    
    #
    #    medicines = Medicine.objects.filter( Q(id=244)| Q(id=222)|Q(id=221)|Q(id=220)|Q(id=219)|Q(id=211)|Q(id=213)|Q(id=244) ,use_yn='Y').order_by('name')
    #    temp = []
    #    for medicine in medicines:
    #        temp.append( {
    #                        'id':medicine.id,
    #                        'name':medicine.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                        'name_vie':medicine.name_vie,
    #                        'code':medicine.code,
    #                        'unit':'' if medicine.unit is None else medicine.unit,
    #                        'price':format(medicine.get_price(), ',') + ' VND',
    #                    'inventory_count':medicine.inventory_count,
    #                    'class_id':medicine.medicine_class_id,
    #                        #'upper':medicine_class['name'],
    #                    })
    #    medicine_data.update({ 'Injections' : temp})
    #
    #
    #    medicines = Medicine.objects.filter( Q(id=18)|Q(id=22)|Q(id=24)|Q(id=35) ,use_yn='Y').order_by('name')
    #    temp = []
    #    for medicine in medicines:
    #        temp.append( {
    #                        'id':medicine.id,
    #                        'name':medicine.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                        'name_vie':medicine.name_vie,
    #                        'code':medicine.code,
    #                        'unit':'' if medicine.unit is None else medicine.unit,
    #                        'price':format(medicine.get_price(), ',') + ' VND',
    #                    'inventory_count':medicine.inventory_count,
    #                    'class_id':medicine.medicine_class_id,
    #                        #'upper':medicine_class['name'],
    #                    })
    #    medicine_data.update({ 'Ointment' : temp})
    #
    #
    #    medicines = Medicine.objects.filter( Q(id=255)|Q(id=181)|Q(id=182) ,use_yn='Y').order_by('name')
    #
    #    temp = []
    #    for medicine in medicines:
    #        temp.append( {
    #                        'id':medicine.id,
    #                        'name':medicine.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                        'name_vie':medicine.name_vie,
    #                        'code':medicine.code,
    #                        'unit':'' if medicine.unit is None else medicine.unit,
    #                        'price':format(medicine.get_price(), ',') + ' VND',
    #                    'inventory_count':medicine.inventory_count,
    #                    'class_id':medicine.medicine_class_id,
    #
    #                        #'upper':medicine_class['name'],
    #                    })
    #    medicine_data.update({ 'Suppogitory' : temp})

    #elif request.user.doctor.depart.id == 8:#DENTAL
    #    medicine_classes = []
    #    medicine_data = []
    #
    #    special_list = []
    #    special_list.append( Q(**{'id':482} ))
    #    special_list.append( Q(**{'id':126} ))
    #    special_list.append( Q(**{'id':126} ))
    #    special_list.append( Q(**{'id':123} ))
    #    special_list.append( Q(**{'id':127} ))
    #    special_list.append( Q(**{'id':147} ))
    #    special_list.append( Q(**{'id':73} ))
    #    special_list.append( Q(**{'id':190} ))
    #    special_list.append( Q(**{'id':75} ))
    #    special_list.append( Q(**{'id':531} ))
    #    special_list.append( Q(**{'id':470} ))
    #    special_list.append( Q(**{'id':171} ))
    #    special_list.append( Q(**{'id':168} ))
    #    special_list.append( Q(**{'id':471} ))
    #    special_list.append( Q(**{'id':169} ))
    #    special_list.append( Q(**{'id':60} ))
    #    special_list.append( Q(**{'id':61} ))
    #    special_list.append( Q(**{'id':155} ))
    #    special_list.append( Q(**{'id':158} ))
    #    special_list.append( Q(**{'id':157} ))
    #    special_list.append( Q(**{'id':535} ))
    #    special_list.append( Q(**{'id':173} ))
    #    special_list.append( Q(**{'id':172} ))
    #    special_list.append( Q(**{'id':538} ))
    #    special_list.append( Q(**{'id':71} ))
    #    special_list.append( Q(**{'id':526} ))
    #    special_list.append( Q(**{'id':540} ))
    #    special_list.append( Q(**{'id':614} ))
    #    
    #    medicine_s = Medicine.objects.filter(
    #       functools.reduce(operator.or_, special_list),
    #      use_yn='Y').order_by('code')
    #    for medicine in medicine_s:
    #        medicine_data.append({
    #                'id':medicine.id,
    #                'name':medicine.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                'name_vie':medicine.name_vie,
    #                'code':medicine.code,
    #                'price':format(medicine.get_price(), ',') + ' VND',
    #                'inventory_count':medicine.inventory_count,
    #                'class_id':medicine.medicine_class_id,
    #            })
    #else:
    argument_medicine_class_list = []
    medicine_data = {}
    medicine_class_query = Depart_MedicineMenu.objects.filter(depart_id = request.user.doctor.depart.id)
    for data in medicine_class_query:
        argument_medicine_class_list.append(Q(**{'id':data.medicine_class_id} ))

    medicine_classes = MedicineClass.objects.filter(
        functools.reduce(operator.or_, argument_medicine_class_list),
        )

    for medicine_class in medicine_classes:
        medicines = Medicine.objects.filter(medicine_class = medicine_class, use_yn='Y')
        temp = []

        for medicine in medicines:
            tmp_name = medicine.name_display

            if "VC" in medicine.code:
                tmp_name = medicine.name_display + "( " + medicine.vaccine_code + "/" + medicine.name + " ) " + medicine.vaccine_recommend_time
            if medicine.code != 'M0008':
                temp.append({
                        'id':medicine.id,
                        'name_display':tmp_name,
                        'name':medicine.name,
                        'code':medicine.code,
                        'unit':'' if medicine.unit is None else medicine.unit,
                        'price':format(medicine.get_price(), ',') + ' VND',
                        'ingredient':medicine.ingredient,
                        'inventory_count':medicine.inventory_count,
                        'class_id':medicine.medicine_class_id,
                        'red_invoice':True if medicine.red_invoice == 'Y' else False,
                    })
        if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
            medicine_data.update({ medicine_class.name_vie : temp})
        else:
            medicine_data.update({ medicine_class.name : temp})

        #if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        #    medicine_classes = MedicineClass.objects.annotate(
        #       dis_name = F('name_vie'),
        #       dis_id = F('id'),
        #       ).all().exclude(id=1)
        #else:
        #    medicine_classes = MedicineClass.objects.annotate(
        #        dis_name = F('name'),
        #        dis_id = F('id'),
        #        ).all().exclude(id=1)


        #for medicine_class in medicine_classes:
        #    if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
        #        medicines = Medicine.objects.annotate(
        #            dis_id = F('id'),
        #            dis_name = F('name_vie'),
        #            dis_name_display = F('name_display'),
        #            dis_code = F('code'),
        #            dis_unit = F('unit_vie'),
        #            dis_ingredient = F('ingredient_vie'),
        #            ).filter(medicine_class_id = medicine_class.dis_id,use_yn='Y')
        #    else:
        #        medicines = Medicine.objects.annotate(
        #            dis_id = F('id'),
        #            dis_name = F('name'),
        #            dis_name_display = F('name_display'),
        #            dis_code = F('code'),
        #            dis_unit = F('unit'),
        #            dis_ingredient = F('ingredient'),
        #            ).filter(medicine_class_id = medicine_class.dis_id,use_yn='Y')
        #
        #    temp = []
        #    for medicine in medicines:
        #
        #        data={
        #                'id':medicine.dis_id,
        #                'name_display':medicine.dis_name_display,
        #                'name':medicine.name_display,
        #                'code':medicine.code,
        #                'unit':'' if medicine.dis_unit is None else medicine.dis_unit,
        #                'price':format(medicine.get_price(), ',') + ' VND',
        #                'ingredient':medicine.ingredient,
        #                'inventory_count':medicine.inventory_count,
        #                'class_id':medicine.medicine_class_id,
        #            }
        #        if medicine.code == 'I0018' or medicine.code =='I0019':
        #            data['name_display'] += '<text style="color:red;"> (AST !!)</text>'
        #
        #        temp.append(data )
        #    medicine_data.update({ medicine_class.dis_name : temp})


    #medicines = Medicine.objects.filter(use_yn='Y').exclude(medicine_class_id=1).order_by(Lower('name'))
    #for medicine in medicines:
    #    tmp_data = {
    #                'id':medicine.id,
    #                'name':medicine.get_name_lang(request.session[translation.LANGUAGE_SESSION_KEY]),
    #                'name_vie':medicine.name_vie,
    #                'code':medicine.code,
    #                'unit':'' if medicine.unit is None else medicine.unit,
    #                'price':format(medicine.get_price(), ',') + ' VND',
    #            }
    #    medicine_data.append( tmp_data )
    #    #
    #
    bundle_set = {}
    category = BundleClass.objects.values('upper').distinct()
    
    for upper in category:
        bundle_groups = BundleClass.objects.filter(upper = upper['upper'])
        temp = []
        for bundle_groups in bundle_groups:
            temp.append({
                        'id':bundle_groups.id,
                        'code':bundle_groups.group_code,
                        'name':bundle_groups.group_name
                    })
            
        bundle_set.update({ upper['upper'] : temp})
    

    return render(request,
        url,#'Doctor/index.html',
            {
                'patient':patient_form,
                'patient_mark':patient_mark,
                'history':history_form,
                'vital':vital_form,
                'receptionsearch':receptionsearch_form,
                'reception':reception_form,
                'diagnosis':diagnosis_form,

                'test_class':test_class,
                'tests':test_data,

                #'precedure_short':precedure_short,
                'precedure_classes':precedure_classes,
                'precedures':precedure_data,

                #'medicine_short':medicine_short,
                'medicine_classes':medicine_classes,
                'medicines':medicine_data,

                'exam_list':exam_list,

                'bundle_set':bundle_set,

                'reservation':reservation_form,
                'today_vital':datetime.date.today().strftime('%b-%d'),

                'list_reservation_division':list_reservation_division,
                # 'image_form':image_form,
                
            }
        )

# @csrf_protect
@login_required
def upload_image(request):
    patient_id=request.POST.get("patient_id")
    instance = Patient.objects.filter(pk=patient_id).first()
    try:
        
        img = request.FILES.getlist('image')[0]
        
        if request.method == 'POST':
            instance.history_image = img
            instance.save()
        else:
            print('****')
    except:
        pass
    return JsonResponse({'url':instance.history_image.url})



@login_required
def report(request):
    report_search_form = ReportSearchForm()
    patient_search_form = PatientSearchForm()






    return render(request,
    'Doctor/report.html',
            {
                'report_search':report_search_form,
                'patient_search':patient_search_form,
            }
        )


@login_required
def show_medical_report(request):

    reception_id = request.POST.get('reception_id')
    context = {}
    reception = Reception.objects.get(id=reception_id)

    
    try:
        report = Report.objects.get(reception_id = reception.id)

        publication_date = ''
        if report.date_of_publication is not None:
            if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
                publication_date = report.date_of_publication.strftime('%d/%m/%Y')
            else:
                publication_date =  report.date_of_publication.strftime('%Y-%m-%d')

        date_of_hospitalization = ''
        if report.date_of_hospitalization is not None:
            if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi':
                date_of_hospitalization = report.date_of_hospitalization.strftime('%d/%m/%Y')
            else:
                date_of_hospitalization =  report.date_of_hospitalization.strftime('%Y-%m-%d')

        context.update({
                'selected_report':report.id,
                'reception_report':report.report,
                'reception_usage':report.usage,
                'serial':report.serial,
                'publication_date':publication_date,
                'date_of_hospitalization':date_of_hospitalization,
            })
    except Report.DoesNotExist:
        context.update({
                'selected_report':0,
                })
    
    today = datetime.date.today()
    
    if hasattr(reception,'reservation') == False:
        next_visit = '' if reception.reservation.reservation_date is None else reception.reservation.reservation_date.strftime("%Y-%m-%d")
    else:
        next_visit =''


    context.update({
                'id':reception.id,
                'patient_chart':reception.patient.get_chart_no(),
                'patient_name':reception.patient.name_kor,
                'patient_name_eng':reception.patient.name_eng,
                'patient_gender':reception.patient.gender,
                'patient_age':reception.patient.get_age(),
                'patient_ID':reception.patient.getID(),
                'patient_date_of_birth':reception.patient.date_of_birth.strftime('%Y-%m-%d'),
                'patient_address':reception.patient.address,
                'patient_phone':reception.patient.phone,
   
                'report_today':today,
                'recept_date': today.strftime('%d/%m/%Y'),
                'lang': request.session['_language'],
                'doctor':reception.doctor.name_kor,

                'chief_complaint':'<br />' if reception.chief_complaint is None else reception.chief_complaint,
                'past_history':reception.patient.history.past_history,
                'assessment':'<br />' if reception.diagnosis.assessment is None else reception.diagnosis.assessment,
                'object':'<br />' if reception.diagnosis.objective_data is None else reception.diagnosis.objective_data,
                'diagnosis':'<br />' if reception.diagnosis.diagnosis is None else reception.diagnosis.diagnosis,
                'icd':'<br />' if reception.diagnosis.ICD is None else reception.diagnosis.ICD,
                'plan':'<br />'if reception.diagnosis.plan is None else reception.diagnosis.plan,
                'sub_clinical_test':'<br />'if reception.diagnosis.plan is '' else reception.diagnosis.sub_clinical_test,

                'recorded_date':reception.recorded_date.strftime('%Y-%m-%d'),
                'depart':reception.depart.name,
                'next_visit':next_visit,
                })



    return JsonResponse(context)

def reception_waiting(request):
    date = request.POST.get('date')
    date_end = request.POST.get('date_end','')
    string = request.POST.get('string')
    progress = request.POST.get('progress')
    kwargs={}
    kwargs['doctor'] = request.user.doctor
    kwargs['depart_id'] = request.user.doctor.depart
    if progress != 'all':
        kwargs['progress'] = request.POST.get('progress')

    if date_end == '':
        date_end = date

    date_min = datetime.datetime.combine(datetime.datetime.strptime(date, "%Y-%m-%d").date(), datetime.time.min)
    date_max = datetime.datetime.combine(datetime.datetime.strptime(date_end, "%Y-%m-%d").date(), datetime.time.max)


    argument_list = [] 
    if string !='':
        argument_list.append( Q(**{'patient__name_kor__icontains':string} ) )
        argument_list.append( Q(**{'patient__name_eng__icontains':string} ) )
        argument_list.append( Q(**{'patient__id__icontains':string} ) ) 
        receptions = Reception.objects.select_related('patient').filter(functools.reduce(operator.or_, argument_list),**kwargs).exclude(progress='deleted')
    else:
        receptions = Reception.objects.select_related('patient').filter(recorded_date__range = (date_min, date_max),**kwargs).exclude(progress='deleted')

    datas=[]
    today = datetime.date.today()

    for reception in receptions:
        data={}

        #try:
        #    package = Package_Manage.objects.get(reception_id = reception.id).id
        #except Package_Manage.DoesNotExist:
        #    package = None

        data.update({
            'id':reception.patient.id,
            'chart':reception.patient.get_chart_no(),
            'reception_no':reception.id,
            'name_kor':reception.patient.name_kor,
            'name_eng':reception.patient.name_eng,
            'date_of_birth':reception.patient.date_of_birth.strftime('%Y-%m-%d'),
            'age':reception.patient.get_age(),
            'gender':reception.patient.get_gender_simple(),
            'reception_time':reception.recorded_date.strftime('%m-%d %H:%M'),
            'reception_datetime':reception.recorded_date.strftime('%Y-%m-%d %H:%M'),
            'status': reception.progress,

            'is_vaccine': reception.is_vaccine,

            #'package':package,
            })
        datas.append(data)

    datas.reverse()
    context = {'datas':datas}
    return JsonResponse(context)


def reception_select(request):
    reception_id = request.POST.get('reception_id')

    reception = Reception.objects.get(pk = reception_id)
    patient = Patient.objects.get(pk=reception.patient_id)


    history_image = None
    try:
        history_image = patient.history_image.url
    except:
        pass
    context = {
        'id':patient.id,
        'chart':patient.get_chart_no(),
        'reception_id':reception.id,
        'name_kor':patient.name_kor,
        'name_eng':patient.name_eng,
        'date_of_birth':patient.date_of_birth,
        'gender':patient.gender,
        'phone':patient.phone,
        'address':patient.address,
        'chief_complaint':reception.chief_complaint,
        'marking':patient.marking,
        'memo':patient.memo,

        'need_medical_report':reception.need_medical_report,
        'need_invoice':reception.need_invoice,
        'need_insurance':reception.need_insurance,

        'status':reception.progress,

        'history_image_url': history_image
        }

    try: 
        history = History.objects.get(patient = patient)
        context.update({
            'history_past':history.past_history,
            'history_family':history.family_history,
            })

    except History.DoesNotExist:
        history = None;



    try:
        diagnosis = Diagnosis.objects.get(reception = reception)
        context.update({
            'assessment':diagnosis.assessment,
            'objective_data':diagnosis.objective_data,
            'plan':diagnosis.plan,
            'diagnosis':diagnosis.diagnosis,
            'ICD':diagnosis.ICD,
            'icd_code':diagnosis.ICD_code,
            'sub_clinical_test':diagnosis.sub_clinical_test,
            'recommendation':diagnosis.recommendation,
            })
    except Diagnosis.DoesNotExist:
        pass

    if reception.reservation:
        context.update({'reservation_date' : reception.reservation.reservation_date.strftime('%Y-%m-%d %H:%M:00')})
        context.update({'reservation_type' : reception.reservation.division})
        context.update({'reservation_memo' : reception.reservation.memo})


    #패키지 목록
    package_cnt_list = Package_Manage.objects.filter(
        patient_id = reception.patient_id,
        )

    package_datas = []
    for package_cnt in package_cnt_list.values('grouping').annotate(group_cnt = Count('grouping'),):
        package_grp = package_cnt_list.filter(grouping = package_cnt['grouping'])
            
        package_datas.append({
            'id':package_grp.last().id,
            'name':package_grp.last().precedure_name,

            'used_cnt':package_grp.exclude(date_used = '0000-00-00 00:00:00').count(),
            'total_cnt':package_cnt['group_cnt'],
                
            })

    context.update({'package': package_datas, })

        
    return JsonResponse(context)


def get_vital(request):
    patient_id = request.POST.get('patient_id')
    vitals = Vital.objects.filter(patient_id = patient_id)

    datas =[]
    for vital in vitals:
        data={}
        data.update({
            'fulldate':vital.date.strftime('%Y-%m-%d'),
            'date':vital.date.strftime('%b-%d'),
            'weight':'' if vital.weight is None else vital.weight,
            'height':'' if vital.height is None else vital.height,
            'blood_pressure': '' if vital.blood_pressure is None else vital.blood_pressure,
            'blood_temperature':'' if vital.blood_temperature is None else vital.blood_temperature,
            'breath':'' if vital.breath is None else vital.breath,
            'pulse_rate':'' if vital.pulse_rate is None else vital.pulse_rate,
            })
        datas.append(data)

    datas.reverse()
    context = {
        'datas':datas,
        }
    return JsonResponse(context)

def set_vital(request):
    reception_id = request.POST.get('reception_id')
    weight = request.POST.get('height')
    height = request.POST.get('height')
    blood_pressure = request.POST.get('blood_pressure')
    blood_temperature = request.POST.get('blood_temperature')
    breath = request.POST.get('breath')
    pulse_rate = request.POST.get('pulse_rate')
    vital_date = request.POST.get('vital_date')

    
    reception = Reception.objects.get(pk = reception_id)
    vital = Vital(patient = reception.patient,
                  weight = weight,
                  height = height,
                  blood_pressure = blood_pressure,
                  blood_temperature = blood_temperature,
                  breath = breath,
                  pulse_rate = pulse_rate,
                  date = datetime.datetime.now(),
                  )

    vital.save()

    context = {'datas':True}
    return JsonResponse(context)

def get_test_manage(request):
    
    chief_complaint = request.POST.get('test_manage_id')



    context = {'result':True}
    return JsonResponse(context)


def diagnosis_save(request):


    #return value
    msg = ''
    res = True
    medicine_manage = None

    chief_complaint = request.POST.get('chief_complaint')
    reception_id = request.POST.get('reception_id')
    set = request.POST.get('set')
    reserve_date = request.POST.get('reservation_date')
    reserve_type= request.POST.get('reservation_type')
    reserve_memo= request.POST.get('reservation_memo')

    try:
        diagnosis_result = Diagnosis.objects.get(reception_id = reception_id)
    except Diagnosis.DoesNotExist:
        diagnosis_result = Diagnosis(reception_id = reception_id)

    reception = Reception.objects.get(pk = reception_id)
    reception.chief_complaint = chief_complaint
    reception.save()

        #delete all order then save again
    print('reserve_date: ',reserve_date)
    if reserve_date:
        if reception.reservation:
            reservation = reception.reservation
        else:
            reservation = Reservation(patient = reception.patient)
        reserve_date = datetime.datetime.strptime(reserve_date, "%Y-%m-%d %H:%M:%S")
        reservation.reservation_date = reserve_date
        reservation.depart_id = request.user.doctor.depart_id
        reservation.doctor_id = request.user.doctor.id
        reservation.division = reserve_type
        reservation.memo = reserve_memo
        reservation.doctor_id = request.user.doctor.id
        reservation.save()
        reception.reservation = reservation
        reception.save()
    # else:
    #     None
        # if reception.reservation:
        #     reservation = reception.reservation
        #     reception.reservation = None
        #     reception.save()
        #     reservation.delete()

    diagnosis_result.diagnosis = request.POST.get('diagnosis')
    diagnosis_result.objective_data = request.POST.get('objective_data')
    diagnosis_result.assessment = request.POST.get('assessment')
    diagnosis_result.plan = request.POST.get('plan')
    diagnosis_result.ICD = request.POST.get('ICD')
    diagnosis_result.ICD_code = request.POST.get('icd_code')
    diagnosis_result.sub_clinical_test = request.POST.get('sub_clinical_test','')
    diagnosis_result.recommendation = request.POST.get('recommendation')
    
    diagnosis_result.posi_text =request.POST.get('img_check_list','')

    diagnosis_result.save()
    #payment begin check
    try:
        tmp_payment = PaymentRecord.objects.filter(payment__reception_id=reception_id,status='paid').count()
        
        if tmp_payment != 0:
            res = False
            context = { 
                'result':res,
                'msg':_('Failed \nalready settled or is settled.')
                }
            return JsonResponse(context)

    except Payment.DoesNotExist:
        pass


    #save orders
    
    datas=[]
    data ={}
    count=0
    for i,j in request.POST.items():
        if i.find('datas[') != -1:
            if count is int(i[i.find('[')+1:i.find(']')]):
                pass
            else:
                datas.append(data)
                data ={}
                count += 1

            data[i[i.find(']')+2:-1]] = j
    if len(data.keys()) is not 0:
        datas.append(data)


    total_amount=0
    exam_set = ExamManager.objects.filter(diagnosis_id = diagnosis_result.id)
    exam_dict = {}
    for data in exam_set:
        exam_dict.update({data.id:data.id})
    test_set = TestManager.objects.filter(diagnosis_id = diagnosis_result.id)
    test_dict = {}
    for data in test_set:
        test_dict.update({data.id:data.id})
    precedure_set = PrecedureManager.objects.filter(diagnosis_id = diagnosis_result.id)
    precedure_dict = {}
    for data in precedure_set:
        precedure_dict.update({data.id:data.id})
    medicine_set = MedicineManager.objects.filter(diagnosis_id = diagnosis_result.id)
    medicine_dict = {}
    for data in medicine_set:
        medicine_dict.update({data.id:data.id})


    for data in datas:
        if data['type'] == 'Exam':
            if data['id'] == '':
                result = ExamManager(diagnosis_id = diagnosis_result.id)
            else:
                result = exam_set.get(pk = data['id'])
                exam_dict.pop(int(data['id']))
            
            exam = ExamFee.objects.get(code = data['code'])
            result.exam_id = exam.id
            result.save()

            total_amount += result.exam.price

        elif data['type'] == 'Test':
            if data['id']=='':
                result = TestManager(diagnosis_id = diagnosis_result.id)
            else:
                result = test_set.get(pk = data['id'])
                test_dict.pop(int(data['id']))

            test = Test.objects.get(code = data['code'])
            result.test_id = test.id
            result.save()
            try:
                test_manage = TestManage.objects.get(manager_id = result.id)
            except TestManage.DoesNotExist:
                test_manage = TestManage(
                    manager_id = result.id,
                    name_service = result.test.name,
                    date_ordered = datetime.datetime.now(),
                    )
            test_manage.save()

            sub_tests = Test.objects.filter(parent_test__id=test.id)
            for sub_test in sub_tests:
                result = TestManager(diagnosis_id = diagnosis_result.id)
                result.save()
                test_manage = TestManage(
                    manager_id = result.id,
                    name_service = sub_test.name,
                    date_ordered = datetime.datetime.now(),
                )
                print('>>>>>>',sub_test, test_manage)
                test_manage.save()
            total_amount += result.test.get_price()

        elif data['type'] == 'Precedure':
            precedure = Precedure.objects.get(code = data['code'])
            is_new = False
            if data['id'] == '':
                result = PrecedureManager(diagnosis_id = diagnosis_result.id)
                is_new = True
            else:
                result = precedure_set.get(pk = data['id'])
                precedure_dict.pop(int(data['id']))
            
            result.amount = data['amount']
            result.precedure_id = precedure.id
            result.save()

            if precedure.type == 'PKG' and is_new == True:
                tmp_query = Package_Manage.objects.filter(patient_id = diagnosis_result.reception.patient_id).order_by('grouping').last()
                if tmp_query is None:
                    tmp_group_id = 1
                else:
                    tmp_group_id = int(tmp_query.grouping) + 1

                now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

                for i in range(1, int(precedure.count) + 1):
                    pack_mng = Package_Manage(
                        patient_id = diagnosis_result.reception.patient_id,
                        depart = diagnosis_result.reception.depart_id,
                        doctor = diagnosis_result.reception.doctor_id,
                        precedure = precedure,
                        precedure_mng_id = result.id,
                        precedure_name = precedure.name,
                        itme_round = i,
                        date_bought = now,
                        grouping = tmp_group_id,
                        registrant = request.user.id,
                        date_register = now,
                        modifier = request.user.id,
                        date_modify = now
                        ).save()

            #if 'R' in data['code']:
            #    try:
            #        radi_manage = RadiationManage.objects.get(manager_id = result.id)
            #    except RadiationManage.DoesNotExist:
            #        radi_manage = RadiationManage(
            #            manager_id = result.id,
            #            name_service = result.precedure.name,
            #            date_ordered = datetime.datetime.now(),
            #            )
            #    radi_manage.save()

            total_amount += result.precedure.get_price() * int(result.amount)

        
        elif data['type'] == 'Medicine':
            try:
                medicine_manage = MedicineManage.objects.get(diagnosis_id = diagnosis_result.id)

            except MedicineManage.DoesNotExist:
                medicine_manage = MedicineManage(diagnosis_id = diagnosis_result.id)
            

            if medicine_manage.progress =='done':
                res = False
                msg = _('Medicines already have been given to patients.')
            else:
                medicine_manage.progress = 'changed'
                medicine_manage.save()
                
                if data['id']=='':
                    result = MedicineManager(diagnosis_id = diagnosis_result.id)
                else:
                    result = medicine_set.get(pk = data['id'])
                    medicine_dict.pop(int(data['id']))

                medicine = Medicine.objects.get(code = data['code'])
                result.medicine_id = medicine.id
                result.amount = data['amount']
                result.days = data['days']
                result.memo = data['memo']
                result.save()

                
                    
                
    if medicine_manage == None or medicine_manage.progress !='done':
        for key in medicine_dict:
            MedicineManager.objects.get(pk = key).delete()

    for key in exam_dict:
        ExamManager.objects.get(pk = key).delete()
    for key in test_dict:
        TestManager.objects.get(pk = key).delete()
    for key in precedure_dict:
        tmp = PrecedureManager.objects.get(pk = key)
        #패키지 삭제 시
        if tmp.precedure.type == 'PKG':
            query = Package_Manage.objects.filter(precedure_mng_id = key)
            now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
            for data in query:
                data.use_yn = 'N'
                data.modifier = request.user.id
                data.date_modify = now
                data.save()

        PrecedureManager.objects.get(pk = key).delete()
    
    #약값 따로 계산
    medicine_mamange_tmp = MedicineManager.objects.filter(diagnosis_id = diagnosis_result.id)
    for data in medicine_mamange_tmp:
        total_amount +=  int(data.days) * int(data.amount) * int(data.medicine.get_price())
    

    reception = Reception.objects.get(pk = reception_id)
    if set != '':
        reception.progress = set

    #상태값
    if( set == 'under_treat' and reception.start_treatement_date == None):
        reception.start_treatement_date = datetime.datetime.now()

    if( set == 'done' and reception.done_treatement_date == None):
        reception.done_treatement_date = datetime.datetime.now()

    if( set == 'done'):
        try:
            report = Report.objects.get(reception_id = reception_id)


        except Report.DoesNotExist:
            report = Report()
            report.reception_id = reception_id

        report.report = ' '
        report.save()


    reception.save()


    #if set == 'done':
    try:
        payment = Payment.objects.get(reception_id=reception_id)
        #payment.progress = 'unpaid'
    except Payment.DoesNotExist:
        payment = Payment(reception_id = reception_id)
    payment.sub_total = total_amount;
    payment.total = total_amount;
    payment.save()

    family_history = request.POST.get('family_history','')
    past_history = request.POST.get('past_history','')

    try:
        patient_history = History.objects.get(patient = reception.patient)
    except History.DoesNotExist:
        patient_history = History()
        patient_history.patient = reception.patient
    patient_history.family_history = family_history
    patient_history.past_history = past_history
    patient_history.save()

    
    #간호사 페이지 전달.
    try:
        nurse_page = NurseManage.objects.get(diagnosis_id = diagnosis_result.id)
        nurse_page.status = 'EDITED'
    except NurseManage.DoesNotExist:
        nurse_page = NurseManage(diagnosis_id = diagnosis_result.id)
        nurse_page.creator = request.user.id
        nurse_page.status = 'NEW'


    nurse_page.lastest_modifier = request.user.id
    nurse_page.lastest_modified_date = datetime.datetime.now()
    nurse_page.save()



    list_history_query = MedicineManager.objects.filter(
        diagnosis_id = diagnosis_result.id,
        medicine__code__icontains = 'VC',
        )
    #백신 확인



    #없으면
    if list_history_query.count() == 0:
        
        vaccine_query = VaccineHistory.objects.filter(
            reception_id = reception_id,
            use_yn='Y',
            )

        for data in vaccine_query:
            data.use_yn = 'N'
            data.modifier = request.user.id
            data.modified_date = datetime.datetime.now()

            data.save()
    else:
        for data in list_history_query:

        #try:
        #    history_query = VaccineHistory.objects.get(reception_id = reception_id,use_yn='Y')
        #except VaccineHistory.DoesNotExist:
        #    history_query = VaccineHistory()
        #    history_query.creator = request.user.id
            history_query = VaccineHistory()

  
            history_query.patient_id = reception.patient_id
            history_query.reception_id = reception_id
            history_query.vaccine_name = data.medicine.name_display + "(" + data.medicine.vaccine_code + ")" + data.medicine.vaccine_recommend_time
            history_query.medicine_name = data.medicine.name
            history_query.round = ''
            if history_query.vaccine_date == None:
                history_query.vaccine_date = datetime.datetime.now()
            history_query.modifier = request.user.id
            history_query.modified_date = datetime.datetime.now()

            history_query.save()
        
        
        


    context = {
        'result':res,
        'msg':msg,
        }
    return JsonResponse(context)



def diagnosis_past(request):
    all = request.POST.get('all')
    patient_id = request.POST.get('patient_id')
    if all is not None:
        receptions = Reception.objects.filter(patient_id = patient_id)
    else:
        start_date = request.POST.get('start_date')
        end_date = request.POST.get('end_date')

        date_min = datetime.datetime.combine(datetime.datetime.strptime(start_date, "%Y-%m-%d").date(), datetime.time.min)
        date_max = datetime.datetime.combine(datetime.datetime.strptime(end_date, "%Y-%m-%d").date(), datetime.time.max)

        patient = Patient.objects.get(pk = patient_id)
        receptions = Reception.objects.filter(recorded_date__range = (date_min, date_max),patient_id = patient_id)

    datas =[]
    for reception in receptions:
        try:
            diagnosis = Diagnosis.objects.get(reception_id = reception.id)

            exam_set = ExamManager.objects.filter(diagnosis_id = diagnosis.id)
            test_set = TestManager.objects.filter(diagnosis_id = diagnosis.id)
            precedure_set = PrecedureManager.objects.filter(diagnosis_id = diagnosis.id)
            medicine_set = MedicineManager.objects.filter(diagnosis_id = diagnosis.id)

            exams = []
            for data in exam_set:
                exam = {}
                exam.update({
                        'name':data.exam.name,
                    })
                exams.append(exam)

            tests = []
            for data in test_set:
                test = {}
                test.update({
                        'name':data.test.name,
                        'amount':data.amount,
                        'days':data.days,
                        'memo':data.memo,
                    })
                tests.append(test)

            precedures = []
            for data in precedure_set:
                precedure = {}
                precedure.update({
                        'name':data.precedure.name,
                        'amount':data.amount,
                        'days':data.days,
                        'memo':data.memo,
                    })
                precedures.append(precedure)

            medicines = []
            for data in medicine_set:
                medicine = {}
                medicine.update({
                        'name':data.medicine.name,
                        'amount':data.amount,
                        'days':data.days,
                        'memo':data.memo,
                        'unit':data.medicine.unit,
                    })
                medicines.append(medicine)

            data={}
            data.update({
                'reception_id':reception.id,
                'date':diagnosis.recorded_date.strftime('%Y-%m-%d'),
                'day':diagnosis.recorded_date.strftime('%a'),
                'subjective':reception.chief_complaint,
                'objective':diagnosis.objective_data,
                'assessment':diagnosis.assessment,
                'plan':diagnosis.plan,
                'diagnosis':diagnosis.diagnosis,
                'ICD': diagnosis.ICD,
                'icd_code': diagnosis.ICD_code,
                'sub_clinical_test':diagnosis.sub_clinical_test,
                'recommendation':diagnosis.recommendation,
                

                'doctor':reception.doctor.name_kor,

                'exams':exams,
                'tests':tests,
                'precedures':precedures,
                'medicines':medicines,
                'amount':'null',
            })
            datas.append(data)

            
        except Diagnosis.DoesNotExist:
            pass



    datas.reverse()
    context = {'datas':datas}
    return JsonResponse(context)


def get_diagnosis(request):
    print('=========')
    reception_no = request.POST.get('reception_no')
    datas={}
    try:
        reception = Reception.objects.get(pk = reception_no)
        diagnosis = Diagnosis.objects.get(reception_id = reception_no)

        exam_set = ExamManager.objects.filter(diagnosis_id = diagnosis.id)
        test_set = TestManager.objects.filter(diagnosis_id = diagnosis.id)
        precedure_set = PrecedureManager.objects.filter(diagnosis_id = diagnosis.id)
        medicine_set = MedicineManager.objects.filter(diagnosis_id = diagnosis.id)


        
        exams = []
        for data in exam_set:
            exam = {}
            exam.update({
                'id':data.id,
                'code':data.exam.code,
                'name':data.exam.name,
                'price':data.exam.get_price(diagnosis.recorded_date),
                })
            exams.append(exam)

        tests = []
        for data in test_set:
            test = {}
            test.update({
                'id':data.id,
                'code':data.test.code,
                'name':data.test.name,
                'amount':data.amount,
                'days':data.days,
                'memo':data.memo,
                'price':data.test.get_price(diagnosis.recorded_date),
                })
            tests.append(test)

        precedures = []
        for data in precedure_set:
            precedure = {}
            precedure.update({
                'id':data.id,
                'code':data.precedure.code,
                'name':data.precedure.name,
                'amount':data.amount,
                'days':data.days,
                'memo':data.memo,
                'price':data.precedure.get_price(diagnosis.recorded_date),
                'is_pkg':'PKG_R' if data.precedure.type =='PKG' else '',
                })
            precedures.append(precedure)

        medicines = []
        for data in medicine_set:
            medicine = {}

            medicine.update({
                'id':data.id,
                'code':data.medicine.code,
                'name':data.medicine.name,
                'amount':data.amount,
                'days':data.days,
                'memo':'' if data.memo is None else data.memo,
                'unit':'' if data.medicine.unit is None else data.medicine.unit,
                'price':data.medicine.get_price(diagnosis.recorded_date),
                })
            print(data)
            print(medicine['name'])
            medicines.append(medicine)


        datas = {
            'diagnosis':diagnosis.diagnosis,
            'exams':exams,
            'tests':tests,
            'precedures':precedures,
            'medicines':medicines,
            'chief_complaint':'' if reception.chief_complaint is None else reception.chief_complaint,

            'img_check_list':diagnosis.posi_text,
        }
    
    except Diagnosis.DoesNotExist:
        pass

    context = {'datas':datas,
               'patient_id':reception.patient_id,
               }
    return JsonResponse(context)

def get_vaccine_history(request):
    patient_id = request.POST.get('patient_id','')

    list_vaccine = []
    list_vaccine_query = Medicine.objects.filter(
        code__icontains='VC',
        ).values('id')

    for data in list_vaccine_query:
        list_vaccine.append(Q(**{'medicine_id':data['id']} ))
        
    list_history_query = MedicineManager.objects.filter(
        functools.reduce(operator.or_, list_vaccine),
        diagnosis__reception__patient_id = patient_id,
        ).select_related('diagnosis__reception__patient').order_by('diagnosis__reception__recorded_date')

    datas=[]
    for data in list_history_query:
        next_visit_date = ''
        if data.diagnosis.reception.reservation:
            next_visit_date = data.diagnosis.reception.reservation.reservation_date.strftime("%Y-%m-%d")
        datas.append({
            'patient_name_kor':data.diagnosis.reception.patient.name_kor,
            'patient_name_eng':data.diagnosis.reception.patient.name_eng,
            'name':data.medicine.name,
            'name_display':data.medicine.name_display,
            'date':data.diagnosis.reception.recorded_date.strftime("%Y-%m-%d"),
            'next_visit_date':next_visit_date,#data.diagnosis.reception.recorded_date.strftime("%Y-%m-%d"),
            })


    return JsonResponse({
        'datas':datas,
        
        })

def show_medical_report_save(request):
    selected_reception_id = request.POST.get('selected_reception_id')
    recommmed_and_follow = request.POST.get('recommmed_and_follow')
    

    reception = Reception.objects.get(id = selected_reception_id)

    try:
        report = Report.objects.get(reception_id = selected_reception_id)


    except Report.DoesNotExist:
        report = Report()
        report.reception_id = selected_reception_id

    report.report = recommmed_and_follow
    report.save()

    context = {'result':True}
    return JsonResponse(context)

def waiting(request):

    try:
        myinfo = Doctor.objects.get(user = request.user)
        if myinfo.name_kor is None:
            return redirect('/doctor/information')
    except Doctor.DoesNotExist:
        return redirect('/doctor/information')

    kwargs={}
    #fine my patient only
    kwargs['doctor'] = myinfo
    if 'search' in request.POST:
        search_form = SearchReceptionStatusForm(data = request.POST)
        if search_form.is_valid():
            date_min = datetime.datetime.combine(search_form.cleaned_data['date'], datetime.time.min)
            date_max = datetime.datetime.combine(search_form.cleaned_data['date'], datetime.time.max)
    else:
        search_form = SearchReceptionStatusForm()
        date_min = datetime.datetime.combine(datetime.date.today(), datetime.time.min)
        date_max = datetime.datetime.combine(datetime.date.today(), datetime.time.max)

    datas = Reception.objects.filter(recorded_date__range = (date_min, date_max),**kwargs)

    return render(request,
    'Doctor/waiting.html',
            {
                'search':search_form,
                'datas':datas,
            }
        )

def diagnosis(request,reception_num = None):
    if reception_num is None:
        #print 잘못된 접근
        return redirect('/')

    reception = Reception.objects.get(pk = reception_num)
    patient = Patient.objects.get(pk = reception.patient_id)
    history = History.objects.get(patient = patient)

    if 'save' in request.POST:
        reception_form = ReceptionForm(data = request.POST)
        patient_form = PatientForm(data = request.POST)
        history_form = HistoryForm(data = request.POST)

        test_list = TestForm(data = request.POST)
        precedure_list = PrecedureForm(data = request.POST)
        madicine_list = MedicineForm(data = request.POST)
        
        diagnosis_form = DiagnosisForm(data = request.POST)
        reservation_form = ReservationForm(data = request.POST)
        if reception_form.is_valid() and patient_form.is_valid() and history_form.is_valid() and test_list.is_valid() and precedure_list.is_valid() and madicine_list.is_valid() and diagnosis_form.is_valid() and reservation_form.is_valid():
            try:
                diagnosis_save = Diagnosis.objects.get(reception = reception)
                diagnosis_save.test.clear()
                diagnosis_save.precedure.clear()
                diagnosis_save.medicine.clear()
            except Diagnosis.DoesNotExist:
                diagnosis_save = Diagnosis.objects.create(reception = reception, 
                                                          diagnosis = diagnosis_form.cleaned_data['diagnosis'],
                                                          medical_report = diagnosis_form.cleaned_data['medical_report'],
                                                          )
            diagnosis_save.test.add(*test_list.cleaned_data['tests'])
            diagnosis_save.precedure.add(*precedure_list.cleaned_data['precedures'])
            diagnosis_save.medicine.add(*madicine_list.cleaned_data['medicines'])
            
            if reservation_form.cleaned_data['date'] is not None:
                reservation = Reservation.objects.create(
                    date = reservation_form.cleaned_data['date'],
                    patient = patient,
                    doctor = reception.doctor,
                    )
                reception.follow_update = reservation
                reception.save()
            #검사실
            #약국
            

            return redirect('/')
        else:
            visit_history = Reception.objects.filter(patient = patient).exclude(pk = reception.id)
            diagnosis_form = DiagnosisForm(data = request.POST)
    else:
        reception_form = ReceptionForm(instance = reception)
        patient_form = PatientForm(instance = patient)
        history_form = HistoryForm(instance = history)

        visit_history = Reception.objects.filter(patient = patient).exclude(pk = reception.id)

        diagnosis_form = DiagnosisForm()
    
        test_list = TestForm()
        precedure_list = PrecedureForm()
        madicine_list = MedicineForm()

        reservation_form = ReservationForm()
    return render(request,
    'Doctor/diagnosis.html',
            {
                'reception_num':reception_num,
                'test_list':test_list,
                'precedure_list':precedure_list,
                'madicine_list':madicine_list,
                'chart_no':patient.get_chart_no(),
                'visit_history': visit_history,
                'patient' : patient_form,
                'reception' : reception_form,
                'history' : history_form,
                'diagnosis' : diagnosis_form,
                'reservation_form':reservation_form,
            }
        )




def information(request):

    #try:
    #    info = Doctor.objects.get(user = request.user)
    #except Doctor.DoesNotExist:
    #    info = Doctor.objects.create(user = request.user)
    #
    #
    #
    #if 'save' in request.POST:
    #    form = DoctorForm(data = request.POST)
    #    if form.is_valid():
    #        info.name_kor = form.cleaned_data['name_kor']
    #        info.name_eng = form.cleaned_data['name_eng']
    #        info.depart = form.cleaned_data['depart']
    #        info.user = request.user
    #        info.save()
    #
    #        return redirect('/')


    form = DoctorForm(instance = info)


    return render(request,
    'Doctor/information.html',
            {
                'form':form,
            }
        )


def patient_search(request):
    category = request.POST.get('category')
    string = request.POST.get('string')

    kwargs = {
        '{0}__{1}'.format(category, 'icontains'): string,
        }
    patients = Patient.objects.filter(**kwargs ).order_by("-id")

    datas=[]
    for patient in patients:
        data = {}
        data.update({
            'id':patient.id,
            'chart':patient.get_chart_no(),
            'name_kor':patient.name_kor,
            'name_eng':patient.name_eng,
            'gender':patient.gender,
            'date_of_birth':patient.date_of_birth,
            'phonenumber':patient.phone,
            })
        datas.append(data)

    context = {'datas':datas}
    return JsonResponse(context)

def set_patient_data(request):
    patient_id = request.POST.get('patient_id')

    patient = Patient.objects.get(pk = patient_id)

    if patient.gender is '' or patient.gender is None:
        context = { 
            'error':'The Pathet\'s gender is not proper. Check patient\' gender first.',
            }
        return JsonResponse(context)

    today = datetime.date.today()
    context = {
        'chart':patient.get_chart_no(),
        'name':patient.name_eng + ' ' + patient.name_kor,
        'date_of_birth':patient.date_of_birth.strftime('%Y-%m-%d'),
        'gender':patient.gender,
        'address':patient.address,
        'ID':patient.getID(),
        'age':patient.get_age(),
        'today':today.strftime('%Y-%m-%d'),
        'doctor':request.user.doctor.name_kor,
        }
    return JsonResponse(context)

def medical_report_save(request):
    
    selected_reception_id = request.POST.get('selected_reception_id')
    recommmed_and_follow = request.POST.get('recommmed_and_follow')
    

    reception = Reception.objects.get(id = selected_reception_id)

    try:
        report = Report.objects.get(reception_id = selected_reception_id)


    except Report.DoesNotExist:
        report = Report()
        report.reception_id = selected_reception_id

    report.report = recommmed_and_follow
    report.save()

    context = {'result':True}
    return JsonResponse(context)








    #doctor_id = request.POST.get('doctor')
    #str_report = request.POST.get('report')
    #
    #if selected_report == 'new':
    #    report = Report(patient_id = selected_patient)
    #
    #    today = datetime.date.today().strftime('%Y%m%d')
    #
    #    num = Report.objects.filter(serial__icontains = today).count() + 1
    #    serial = str(today) + "{:04d}".format(num)
    #    report.serial = serial
    #    report.doctor_id = doctor_id
    #else:
    #    report = Report.objects.get(pk = selected_report)
    #
    #report.report = str_report
    #report.usage = usage
    #report.date_of_hospitalization = datetime.datetime.combine(datetime.datetime.strptime(hospitalization, "%Y-%m-%d").date(), datetime.time.min)
    #report.date_of_publication = datetime.datetime.combine(datetime.datetime.strptime(publication, "%Y-%m-%d").date(), datetime.time.min)
    

    #report.save()


    #return JsonResponse({'serial':report.serial})

def report_search(request):
    date_start = request.POST.get('start')
    date_end = request.POST.get('end')
    input = request.POST.get('input')

    kwargs={}
    date_min = datetime.datetime.combine(datetime.datetime.strptime(date_start, "%Y-%m-%d").date(), datetime.time.min)
    date_max = datetime.datetime.combine(datetime.datetime.strptime(date_end, "%Y-%m-%d").date(), datetime.time.max)
    
    argument_list = [] 
    kwargs={}
    if hasattr(request.user,'doctor'):
        kwargs['depart'] = request.user.doctor.depart.id
    
   

    argument_list = [] 
    if input !='':
        argument_list.append( Q(**{'patient__name_kor__icontains':input} ) )
        argument_list.append( Q(**{'patient__name_eng__icontains':input} ) )
        receptions = Reception.objects.select_related('patient').filter(functools.reduce(operator.or_, argument_list),recorded_date__range = (date_min, date_max),**kwargs).exclude(progress='deleted').order_by('recorded_date')
    else:
        receptions = Reception.objects.select_related('patient').filter(recorded_date__range = (date_min, date_max),**kwargs).exclude(progress='deleted').order_by('recorded_date')


    page_context = request.POST.get('page_context',10)
    page = request.POST.get('page',1)
    datas = []
    no = 1
    for reception in receptions:
        datas.append({
            'reception_id':reception.id,
            'chart':reception.patient.get_chart_no(),
            'No':no,
            'patient_name_eng':reception.patient.name_eng,
            'patient_name_kor':reception.patient.name_kor,
            'ID':reception.patient.getID(),
            'Doctor':reception.doctor.name_kor,
            'Date':reception.recorded_date.strftime('%Y-%d-%m'),
            })
        no +=1

    paginator = Paginator(datas, page_context)
    try:
        paging_data = paginator.page(page)
    except PageNotAnInteger:
        paging_data = paginator.page(1)
    except EmptyPage:
        paging_data = paginator.page(paginator.num_pages)

    datas.reverse()
    return JsonResponse({
        'datas':datas,
        'datas':list(paging_data),
        'page_range_start':paging_data.paginator.page_range.start,
        'page_range_stop':paging_data.paginator.page_range.stop,
        'page_number':paging_data.number,
        'has_previous':paging_data.has_previous(),
        'has_next':paging_data.has_next(),
        })


def get_test_contents(request):
    date = request.POST.get('date')

    return JsonResponse({'datas':datas})





def get_bundle(request):

    bundle_id = request.POST.get('bundle_id')

    res_datas=[]
    items = Bundle.objects.filter(upper_id = bundle_id)
    for item in items:
        if item.type == 'Medicine':
            data = Medicine.objects.get(code=item.code)
        elif item.type == 'Precedure':
            data = Precedure.objects.get(code=item.code)
        elif item.type == 'Test':
            data = Test.objects.get(code=item.code)

        res_datas.append({
            'id':data.id,
            'type':item.type,
            'name':data.name,
            'code':data.code,
            'days':0 if item.days is None else item.days,
            'amount':0 if item.amount is None else item.amount,
            'price':data.get_price(),
            })
        

    return JsonResponse({'datas':res_datas})


def get_ICD(request):
    
    string = request.POST.get('string')
    
    icd_datas = ICD.objects.filter(Q(code__icontains = string) | Q(name__icontains = string) | Q(name_vie__icontains = string)).values('id','name','code','name_vie')

    datas=[]
    for data in icd_datas:
        datas.append({
            'value':data['code'] + ' ' + ( data['name_vie'] if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi' else data['name']),
            'label':data['code'] + ' ' + ( data['name_vie'] if request.session[translation.LANGUAGE_SESSION_KEY] == 'vi' else data['name']),
            'code':data['code'],
            })

    return JsonResponse({'datas':datas})


def get_medicine_count(request):
    list_medicine = Medicine.objects.values('id','inventory_count').all()

    return JsonResponse({'datas':list(list_medicine)})




@login_required
def use_package(request):
    id = request.POST.get('id')
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    package = Package_Manage.objects.get(id = id)
    package.date_modify = now
    package.modifier = request.user.id


    package.date_used = now
    package.depart = request.user.doctor.depart.id
    package.doctor = request.user.doctor.id

    package.save()

    return JsonResponse({'result':True})


@login_required
def cancel_package(request):
    id = request.POST.get('id')
    now = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    package = Package_Manage.objects.get(id = id)
    package.date_modify = now
    package.modifier = request.user.id


    package.date_used = '0000-00-00 00:00:00'

    package.save()

    return JsonResponse({'result':True})

@login_required
def audit(request):
    doctor_search_form = DoctorsSearchForm()

    if request.user.doctor.depart.name == 'PM':
        list_exam_fee = []
        list_precedures = []
        list_radiologys = []


        exam_fees = ExamFee.objects.filter(Q(code = 'E0010') | Q(code = 'E0011'))
        for exam_fee in exam_fees:
            list_exam_fee.append({'code':exam_fee.code,'value':exam_fee.name})

        precedures = Precedure.objects.filter(Q(code__contains='PM'), Q(code__contain='U'))
        for precedure in precedures:
            list_precedures.append({'code':precedure.code,'value':precedure.name})

        radiologys = Precedure.objects.filter(code__contains='R', precedure_class_id = 10 )
        for radiology in radiologys:
            list_radiologys.append({'code':radiology.code,'value':radiology.name})

        return render(request,
        'Doctor/audit_PM.html',
            {
                'doctor_search':doctor_search_form,

                'list_exam_fee':list_exam_fee,
                'list_precedures':list_precedures,
                'list_radiologys':list_radiologys,

            }
        )

    else:
        #filters
        list_exam_fee = []
        list_test = []
        list_precedure = []
        list_medicine = []
    
        
        exams = ExamFee.objects.filter(Q(code = 'E0001') | Q(code = 'E0002')).order_by('name')
        for exam in exams:
            list_exam_fee.append({'code':exam.code,'value':exam.name})

    
        tests = Test.objects.all().order_by('name')
        for test in tests:
            list_test.append({'code':test.code,'value':test.name})


        precedures = Precedure.objects.all().order_by('name')
        for precedure in precedures:
            list_precedure.append({'code':precedure.code,'value':precedure.name})


        medicines = Medicine.objects.all().order_by('name')
        for medicine in medicines:
            list_medicine.append({'code':medicine.code,'value':medicine.name})


        #sorted_datas = sorted(temp_list_general,key = lambda order: (order['value']))
        #for sorted_data in sorted_datas:
        #    general.append({'code':sorted_data['code'],'value':sorted_data['value']})



        return render(request,
            'Doctor/audit.html',
                {
                    'doctor_search':doctor_search_form,

                    'list_exam_fee':list_exam_fee,
                    'list_test':list_test,
                    'list_precedure':list_precedure,
                    'list_medicine':list_medicine,

                }
            )


@login_required
def statistics_PM(request):




    return render(request,
        'Doctor/PM/statistics_PM.html',
            {

            }
        )


@login_required
def statistics_PM_search(request):
    year = int( request.POST.get('year') )
    month = int( request.POST.get('month') )


    reception_query = Reception.objects.filter(
        depart = 7,
        recorded_date__year = year,
        recorded_date__month = month,
        progress = 'done',
        ).select_related('payment')

    #신환 재진
    new_count = 0
    repeat_count = 0
    for data in reception_query:
        is_new = Reception.objects.filter(
            depart = 7,
            recorded_date__lt = data.recorded_date,
            patient_id = data.patient_id,
            progress = 'done',
            ).count()

        if is_new == 0:
            new_count += 1
        else:
            repeat_count += 1


    #일별 수입
    list_by_day = []
    day_of_month = calendar.monthrange(year,month)[1]

    for day in range(1, day_of_month + 1):
        str_day = "{:04d}-{:02d}-{:02d}".format(year,month,day)

        sub_query = reception_query.filter(
            recorded_date__day = day,
            ).aggregate(
                day_amount = Sum('payment__sub_total'),
                day_count = Count('depart_id'),
                )

        list_by_day.append({
            'day':str_day,
            'count':0 if sub_query['day_count'] is None else sub_query['day_count'],
            'amount':0 if sub_query['day_amount'] is None else sub_query['day_amount'],
            })


    return JsonResponse({
        'result':True,
        'list_by_day':list_by_day,

        'new_count':new_count,
        'repeat_count':repeat_count,
        })



def set_under_treatment(request):
    reception_id = request.POST.get('reception_id','')
    status = request.POST.get('status','new')

    print(reception_id)
    print(status)


    reception = Reception.objects.get(id = reception_id)
    if( status == 'under_treat' and reception.start_treatement_date == None):
        reception.start_treatement_date = datetime.datetime.now()

    if( status == 'done' and reception.done_treatement_date == None):
        reception.done_treatement_date = datetime.datetime.now()
    


    reception.progress = status
    reception.save()


    


    return JsonResponse({
        'result':True,
        })

