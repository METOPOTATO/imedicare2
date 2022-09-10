from django.urls import path
from . import views

app_name = 'Nurse'

urlpatterns = [
    path('',views.index,name='nurse_index'),
    
    path('waiting_list/',views.waiting_list),
    path('waiting_selected/',views.waiting_selected),

    path('save/',views.save),

]
