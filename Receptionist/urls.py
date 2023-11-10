from django.urls import path
from Receptionist import views

app_name = 'Receptionist'

urlpatterns = [
    path('',views.index,name='reception_index'),
    #환자 등록 수정
    path('set_new_patient/',views.set_new_patient,name='set_new_patient'),
    path('save_patient/',views.save_patient,name='save_patient'),
    path('save_reception/',views.save_reception,name='save_reception'),
    #질의
    path('Question/<int:patient_id>',views.Question,name='Question'),
    path('Question/save/',views.Question_save,name='Question_save'),
    path('Question/get/',views.Question_get,name='Question_get'),
    #접수 수정
    path('Edit_Reception/get/',views.Edit_Reception_get,name='Edit_Reception_get'),
    path('Edit_Reception/save/',views.Edit_Reception_save,name='Edit_Reception_save'),
    path('Edit_Profile_Status/save/',views.Edit_Profile_Status,name='Edit_Profile_Status'),
    path('Edit_Reception/delete/',views.Edit_Reception_delete,name='Edit_Reception_delete'),
    #보험
    path('Tax_Invoice/get/',views.Tax_Invoice_get,name='Tax_Invoice_get'),
    path('Tax_Invoice/save/',views.Tax_Invoice_save,name='Tax_Invoice_save'),
    #환자 검색
    path('set_patient_data/',views.set_patient_data,name='set_patient_data'),
    path('patient_search/',views.patient_search,name='patient_search'),

    path('reception_search/',views.reception_search,name='reception_search'),
    path('payment_search/',views.payment_search,name='payment_search'),
    path('reservation_search/',views.reservation_search,name='reservation_search'),
    path('reception_search/',views.reception_search,name='reception_search'),    
    path('apointment_search/',views.apointment_search,name='apointment_search'),    

    path('storage_page/',views.storage_page,name='storage_page'),
    path('waiting_list/',views.waiting_list,name='waiting_list'),
    path('waiting_selected/',views.waiting_selected,name='waiting_selected'),
    path('get_patient_past/',views.get_patient_past,name='get_patient_past'),
    path('storage_page_save/',views.storage_page_save,name='storage_page_save'),
    path('get_bill_list/',views.get_bill_list,name='get_bill_list'),
    path('get_today_list/',views.get_today_list,name='get_today_list'),
    path('get_today_selected/',views.get_today_selected,name='get_today_selected'),
    #환불
    path('refund_get_patient/',views.refund_get_patient),
    path('refund_save/',views.refund_save),
    path('refund_cancel/',views.refund_cancel),




    path('report_list/',views.report_list,name='report_list'),
    path('payment_record_list/',views.payment_record_list,name='payment_record_list'),
    path('delete_payment/',views.delete_payment,name='delete_payment'),
    
    #예약
    path('reservation/',views.reservation,name = 'reservation'),
    path('reservation_save/',views.reservation_save, name = 'reservation_save'),
    path('reservation_info/',views.reservation_info, name = 'reservation_info'),
    path('reservation_del/',views.reservation_del, name = 'reservation_del'),
    path('apointment/',views.apointment,name = 'apointment'),
    path('apointment_save/',views.apointment_save, name = 'apointment_save'),  
    path('apointment_info/',views.apointment_info, name = 'apointment_info'),  
    path('pick_up_excel/',views.pick_up_excel), 


    path('reservation_events/',views.reservation_events,name='reservation_events'),
    path('reservation_events_modify/',views.reservation_events_modify,name='reservation_events_modify'),
    path('reservation_events_delete/',views.reservation_events_delete,name='reservation_events_delete'),
    #pharmacy
    
    #lab

    #radiation
    path('search',views.search,name='search'),
    path('reception/',views.reception, name ='reception'),
    path('reception/<int:patient_num>',views.reception, name ='reception'),
    path('get_depart_doctor/',views.get_depart_doctor,name='get_depart_doctor'),
    path('check_reservation/',views.check_reservation,name='check_reservation'),
    path('reception_status',views.reception_status, name ='reception_status'),

    path('storage/<int:reception_num>',views.storage,name='storage'),


    #Documetation
    path('Documents/',views.Documents,name='Documents'),
    path('document_search/',views.document_search,name='document_search'),

    path('document_lab/<int:reception_id>',views.document_lab,name='document_lab'),
    path('document_lab2/<int:reception_id>',views.document_lab2,name='document_lab'),
    path('document_prescription/<int:reception_id>',views.document_prescription,name='document_prescription'),
    path('document_medical_receipt/<int:reception_id>',views.document_medical_receipt,name='document_medical_receipt'),
    path('document_medical_receipt_old/<int:reception_id>',views.document_medical_receipt_old,name='document_medical_receipt_old'),
    path('document_medicine_receipt/<int:reception_id>',views.document_medicine_receipt,name='document_medicine_receipt'),
    path('document_subclinical/<int:reception_id>',views.document_subclinical,name='document_subclinical'),
    path('document_medical_report/<int:reception_id>',views.document_medical_report,name='document_medical_report'),
    path('document_vaccine_certificate/<int:reception_id>',views.document_vaccine_certificate,name='document_medical_report'),
    path('apointment_letter/<int:reservation_id>',views.apointment_letter,name='apointment_letter'),
    path('document_excel/<int:reception_id>',views.document_excel,name='document_excel'),



    #패키지
    path('package_list/',views.package_list),
    path('patient_package_list/',views.patient_package_list),
    path('set_package_to_patient/',views.set_package_to_patient),

    path('patient_package_reception/',views.patient_package_reception),

    path('patient_package_history_modal/',views.patient_package_history_modal),


    
    #동의서
    path('list_agreement/',views.list_agreement),
    path('save_agreement/',views.save_agreement),
    path('get_agreement/',views.get_agreement),
    path('delete_agreement/',views.delete_agreement),


    # Linh
    path('get_memo_detail/', views.get_memo_detail),
    path('create_memo_detail/', views.create_memo_detail),
    path('delete_memo_detail/', views.delete_memo_detail),
    path('update_memo_detail/', views.update_memo_detail),

    path('update_patient_notes/', views.update_patient_notes),
    path('create_patient_relative/', views.create_patient_relative),
    path('delete_patient_relative/', views.delete_patient_relative),

    path('patient_search2/',views.patient_search2,name='patient_search2'),
    path('patient_search3/',views.patient_search3,name='patient_search3'),

    path('pre_regis/',views.pre_regis,name='pre_regis'),
    path('upload_file_patient/',views.upload_file_patient,name='upload_file_patient'),
    path('draft_patient_list/',views.draft_patient_list,name='draft_patient_list'),
    path('remove_draft_patient/',views.remove_draft_patient,name='remove_draft_patient'),
]
