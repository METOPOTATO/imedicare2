from django.urls import path,include
from django.conf.urls import url
from . import views


app_name = 'Manage'

urlpatterns = [



    path('',views.manage,name='manage'),
    path('patient/',views.patient,name='manage_patient'),
    path('payment/',views.payment,name='manage_payment'),
    path('doctor_profit/',views.doctor_profit,name='doctor_profit'),
    
    path('search_payment/',views.search_payment,name='search_payment'),
    path('search_patient/',views.search_patient,name='search_patient'),
    path('search_medicine/',views.search_medicine,name='search_medicine'),

    #엑셀 다운로드
    path('audit_excel/',views.audit_excel),
    path('rec_report_excel/',views.rec_report_excel),
    path('cumstomer_management_excel/',views.cumstomer_management_excel),
    path('debit_report_excel/',views.debit_report_excel),# 작업중
    path('test_statistics_excel/',views.test_statistics_excel),
    path('procedure_statistics_excel/',views.procedure_statistics_excel),
    path('medicine_statistics_excel/',views.medicine_statistics_excel),
    #KBL
    path('KBL_project_excel/',views.KBL_project_excel),
    ####PM - 유대표님 요구사항 : 신환 및 재진 , 월별 수입
    path('PM_SPECIAL1_excel/',views.PM_SPECIAL1_excel),
    ##Service & Inventory Items - 엑셀
    path('exam_inventory_excel/',views.exam_inventory_excel),
    path('test_inventory_excel/',views.test_inventory_excel),
    path('procedure_inventory_excel/',views.procedure_inventory_excel),
    path('medicine_inventory_excel/',views.medicine_inventory_excel),
    path('expendables_inventory_excel/',views.expendables_inventory_excel),

    #Exam Fee / 진료비 아이템
    path('inventory_examfee/',views.inventory_examfee,name='inventory_examfee'),
    path('examfee_search/',views.examfee_search,),
    path('exam_add_edit_get/',views.exam_add_edit_get,),
    path('exam_add_edit_set/',views.exam_add_edit_set,),

    #검사 아이템
    path('inventory_test/',views.inventory_test,name='inventory_test'),
    path('test_search/',views.test_search,name='test_search'),
    path('test_add_edit_get/',views.test_add_edit_get,name='test_add_edit_get'),
    path('test_add_edit_set/',views.test_add_edit_set,name='test_add_edit_set'),
    path('test_add_edit_delete/',views.test_add_edit_delete,name='test_add_edit_delete'),
    path('test_get_interval_list/',views.test_get_interval_list),
    path('test_get_interval/',views.test_get_interval),
    path('test_save_interval/',views.test_save_interval),
    path('test_delete_interval/',views.test_delete_interval),

    #검사 클래스
    path('list_database_test_class_get/',views.list_database_test_class_get),
    path('add_edit_test_class_menu_get/',views.add_edit_test_class_menu_get),
    path('add_edit_test_class_menu_save/',views.add_edit_test_class_menu_save),

    #처치 아이템
    path('inventory_precedure/',views.inventory_precedure,name='inventory_precedure'),
    path('precedure_search/',views.precedure_search,name='precedure_search'),
    path('precedure_add_edit_get/',views.precedure_add_edit_get,name='precedure_add_edit_get'),
    path('precedure_add_edit_set/',views.precedure_add_edit_set,name='precedure_add_edit_set'),
    path('precedure_add_edit_delete/',views.precedure_add_edit_delete,name='precedure_add_edit_delete'),

    #처치 클래스
    path('list_database_precedure_class_get/',views.list_database_precedure_class_get),
    path('add_edit_precedure_class_menu_get/',views.add_edit_precedure_class_menu_get),
    path('add_edit_precedure_class_menu_save/',views.add_edit_precedure_class_menu_save),


    #의사 과 메뉴 설정
    path('inventory_menu/',views.inventory__menu,name='inventory__menu'),
    path('inventory_menu_get/',views.inventory__menu_get),
    path('inventory_menu_set/',views.inventory__menu_set),

    #소모품 및 의료도구
    path('inventory_medical_tool/',views.inventory_medical_tool,name='inventory_medical_tool'),
    path('medical_tool_search/',views.medicine_search,name='medicine_search'),
    path('medical_tool_add_edit_get/',views.medicine_add_edit_get,name='medicine_add_edit_get'),
    path('medical_tool_add_edit_set/',views.medicine_add_edit_set,name='medicine_add_edit_set'),
    path('medical_tool_add_edit_check_code/',views.medicine_add_edit_check_code,name='medicine_add_edit_check_code'),
    path('medical_tool_add_edit_delete/',views.medicine_add_edit_delete,name='medicine_add_edit_delete'),
    
    path('get_inventory_history/',views.get_inventory_history,name='get_inventory_history'),
    path('save_database_add_medicine/',views.save_database_add_medicine,name='save_database_add_medicine'),
    path('get_expiry_date/',views.get_expiry_date,name='get_expiry_date'),
    path('get_edit_database_add_medicine/',views.get_edit_database_add_medicine,name='get_edit_database_add_medicine'),
    path('save_database_disposal_medicine/',views.save_database_disposal_medicine,name='save_database_disposal_medicine'),

    #기안서
    path('draft/',views.draft,name='draft'),
    path('draft/search/',views.draft_search),
    path('draft/get_data/',views.draft_get_data),
    path('draft/get_form/',views.draft_get_form),

    path('draft/save/',views.draft_save),
    path('draft/delete/',views.draft_delete),
   
    path('draft/list_file/',views.draft_list_file),
    path('draft/get_file/',views.draft_get_file),
    path('draft/save_file/',views.draft_save_file),
    path('draft/delete_file/',views.draft_delete_file),

    path('draft/check_appraove/',views.check_appraove),



    #기안서 출력
    path('draft/print/<int:id>/',views.draft_print),


    #고객 관리
    path('customer_manage/',views.customer_manage,name='customer_manage'),
    path('customer_manage_get_patient_list/',views.customer_manage_get_patient_list),
    path('customer_manage_get_patient_info/',views.customer_manage_get_patient_info),
    path('customer_manage_get_patient_visit/',views.customer_manage_get_patient_visit),
    path('customer_manage_get_patient_visit_history/',views.customer_manage_get_patient_visit_history ),
    path('customer_manage_get_patient_sms_info/',views.customer_manage_get_patient_sms_info),
    path('customer_manage_get_patient_save/',views.customer_manage_get_patient_save),
    path('get_vaccine_history_list/',views.get_vaccine_history_list),
    path('get_vaccine_history/',views.get_vaccine_history),
    path('vaccine_history_save/',views.vaccine_history_save),
    path('vaccine_history_delete/',views.vaccine_history_delete),


    #사원 관리
    path('manage_employee/',views.manage_employee,name='manage_employee'),
    path('employee_search/',views.employee_search,name='employee_search'),
    path('employee_check_id/',views.employee_check_id,name='employee_check_id'),
    path('employee_add_edit/',views.employee_add_edit,name='employee_add_edit'),
    path('employee_add_edit_get/',views.employee_add_edit_get,name='employee_add_edit_get'),
    path('employee_delete/',views.employee_delete,name='employee_delete'),
    path('employee_change_password/',views.employee_change_password,name='employee_change_password'),

    path('employee_menu_get/',views.employee_menu_get),
    path('employee_menu_save/',views.employee_menu_save),


    #baord
    path('board/',views.board_list,name='board_list'),
    path('board/<int:id>',views.board_list,name='board_list'),
    path('board/new/',views.board_create_edit,name='board_create_edit'),
    path('board/edit/<int:id>/',views.board_create_edit,name='board_create_edit'),
    path('board/delete/<int:id>',views.board_delete,name='board_delete'),
    path('board/delete_file/',views.board_delete_file,name='board_delete_file'),

    path('board/comment/get',views.board_comment_get,name='board_comment_new'),
    path('board/comment/add',views.board_comment_add,name='board_comment_new'),
    path('board/comment/add/<int:comment_id>',views.board_comment_add,name='board_comment_new'),
    path('board/comment/edit/<int:id>/',views.board_comment_edit,name='board_comment_new'),
    path('board/comment/delete/<int:id>/',views.board_comment_delete,name='board_comment_new'),

    #work board
    path('board_work/',views.board_work_list,name='board_work_list'),
    path('board_work/<int:id>',views.board_work_list,name='board_work_list'),
    path('board_work/new/',views.board_work_create_edit,name='board_work_create_edit'),
    path('board_work/edit/<int:id>/',views.board_work_create_edit,name='board_work_create_edit'),
    path('board_work/delete/<int:id>',views.board_delete),
    path('board_work/delete_file/',views.board_delete_file),

    path('board_work/comment/add',views.board_work_comment_add,),
    path('board_work/comment/edit/<int:id>/',views.board_work_comment_edit,),
    path('board_work/comment/emoji/',views.board_work_comment_emoji,),


    #information board
    path('board_info/',views.board_info_list,name='board_info_list'),
    path('board_info/<int:id>',views.board_info_list,name='board_info_list'),
    path('board_info/new/',views.board_info_create_edit,name='board_info_create_edit'),
    path('board_info/edit/<int:id>/',views.board_info_create_edit,name='board_info_create_edit'),
    path('board_info/delete/<int:id>',views.board_info_delete,name='board_info_delete'),
    path('board_info/delete_file/',views.board_info_delete_file,name='board_info_delete_file'),



    #SMS 
    path('sms/send_sms/',views.sms_send_sms), #내용 전달
    path('sms/recv_result/',views.sms_recv_result), # 응답
     
    #SMS History
    path('sms/history/',views.sms_history_index,name='sms_history_index'), 
    path('sms/history/search/',views.sms_history_search), 
    path('sms/history/get/',views.sms_history_get), 
    

    #통계
    ##검사
    path('statistics/test/',views.statistics_test,name='statistics_test'),
    path('statistics/search_lab/',views.search_lab),
    path('statistics/procedure/',views.statistics_procedure,name='statistics_procedure'), 
    path('statistics/search_procedure/',views.search_procedure),
    path('statistics/medicine/',views.statistics_medicine,name='statistics_medicine'), 
    path('statistics/search_medicine/',views.statistics_search_medicine),
    path('statistics/package/',views.statistics_package,name='statistics_package'), 
    # path('statistics/medicine/',views.statistics_medicine,name='statistics_medicine'), 
    path('statistics/search/',views.statistics_search),
    path('statistics/search_pkg/',views.statistics_search_pkg),
    path('statistics/payment_debit/',views.payment_debit,name='payment_debit'),
    path('search_payment_debit/',views.search_payment_debit),
    path('statistics/recovery_debit/',views.recovery_debit,name='recovery_debit'),
    path('search_recovery_debit/',views.search_recovery_debit),
    path('statistics/profile_status/',views.profile_status,name='profile_status'),
    path('search_profile_status/',views.search_profile_status),         

    path('statistics/depart/',views.statistics_depart,name='statistics_depart'), 

    path('statistics/customer_info/',views.statistics_customer_info,name='statistics_customer_info'), 
    path('statistics/search_customer_info/',views.search_customer_info),

    path('statistics/ymw/',views.statistics_ymw,name='statistics_ymw'),  #ymw > year Month Week
    path('statistics/search_ymw/',views.search_ymw),

    path('statistics/daily/',views.statistics_daily,name="statistics_daily"),
    path('statistics/search_daily/',views.search_daily),

    path('statistics/profile_status/',views.profile_status),



    #코드관리
    path('code_setting/',views.code_setting,name="code_setting"),
    path('code_search/',views.code_search),

    path('code_save/',views.code_save),
    path('code_get/',views.code_get),
    path('code_delete/',views.code_delete),

    #path('test/',views.test), 
    #path('test/get_res_table/',views.get_res_table),

    #공통
    #해당 과 별로 사용자 가져오기
    path('get_user_by_depart/',views.get_user_by_depart),

    #알람
    path('get_alert/',views.get_alert),

    # delete customer - Linh
    # path('customer_history/<int:patient_id>', views.customer_history, name='customer_history'),
]
