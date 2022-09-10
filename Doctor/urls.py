from django.urls import path
from Doctor import forms, views

app_name = 'Doctor'

urlpatterns = [
    path('',views.index,name='index'),
    path('reception_waiting/',views.reception_waiting,name='reception_waiting'),
    path('reception_select/',views.reception_select,name='reception_select'),
    path('get_bundle/',views.get_bundle,name='get_bundle'),
    
    path('get_vital/',views.get_vital,name='get_vital'),
    path('set_vital/',views.set_vital,name='set_vital'),

    path('diagnosis_save/',views.diagnosis_save,name='diagnosis_save'),
    path('diagnosis_past/',views.diagnosis_past,name='diagnosis_past'),
    path('get_diagnosis/',views.get_diagnosis,name='get_diagnosis'),
    path('get_vaccine_history/',views.get_vaccine_history,),
    path('get_ICD/',views.get_ICD,name='get_ICD'),

    path('get_test_contents/',views.get_test_contents, name='get_test_contents'),

    path('show_medical_report/',views.show_medical_report,name='show_medical_report'),

    path('report/',views.report,name='report'),
    path('patient_search/',views.patient_search,name='patient_search'),
    path('set_patient_data/',views.set_patient_data,name='set_patient_data'),
    path('medical_report_save/',views.medical_report_save,name='medical_report_save'),
    path('report_search/',views.report_search,name='report_search'),
    


    path('waiting',views.waiting,name='waiting'),
    path('diagnosis/',views.diagnosis,name='diagnosis'),
    path('diagnosis/<int:reception_num>',views.diagnosis),
    path('information',views.information,name ='information'),

    path('get_medicine_count/',views.get_medicine_count,name ='get_medicine_count'),

    #패키지
    
    path('use_package/',views.use_package),
    path('cancel_package/',views.cancel_package),

    #의사 Audit
    path('audit',views.audit,name='audit'),
    path('statistics_PM',views.statistics_PM,name='statistics_PM'),
    path('statistics_PM_search/',views.statistics_PM_search), 


    
    path('set_under_treatment/',views.set_under_treatment),

    path('upload_image', views.upload_image)
]
