from django.urls import path
from . import views

app_name = 'Pharmacy'

urlpatterns = [
    path('',views.index,name='pharmacy_index'),
    path('waiting_list/',views.waiting_list,name='waiting_list'),
    path('waiting_selected/',views.waiting_selected,name='waiting_selected'),
    
    
    path('save/',views.save,name='save'),

    path('medicine_search/',views.medicine_search,name='medicine_search'),
    path('set_data_control/',views.set_data_control,name='set_data_control'),
    path('save_data_control/',views.save_data_control,name='save_data_control'),
    
    
]
