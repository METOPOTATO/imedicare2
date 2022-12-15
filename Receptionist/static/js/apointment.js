jQuery.browser = {};


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(function () {

    $('.date_input').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    $("#date_start").val(moment().subtract(0, 'd').format('YYYY-MM-DD'));
    $("#date_end").val(moment().format('YYYY-MM-DD'));

    $('.date_input, #contents_filter_depart,#is_vaccine').change(function () {
        apointment_search();
    })

    $('#vaccine_date').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });

    apointment_search();
    
    //환자 검색
    $('#patient_search').keydown(function (key) {
        if (key.keyCode == 13) {
            apointment_search();
        }
    })

    $("#patient_search_btn").click(function () {
        apointment_search();
    });

    $("#control_depart").change(function () {
        apointment_search();
    })
    $("#pick_up_status_filter").change(function () {
        apointment_search();
    })
    $("#drop_off_status_filter").change(function () {
        search_patient();
    })
    //전체 체크 박스
    $("#check_sms_all").change(function () {
        $(".customer_checkbox").prop("checked", $(this).prop("checked"));
    })

    $("#depart_select").change(function () {
        get_doctor($("#depart_select"));
    });
    $("#edit_reception_depart").change(function () {
        get_doctor($("#edit_reception_depart"));
    });




    $("#reception_waiting_depart").change(function () {
        apointment_search();
        get_doctor($("#reception_waiting_depart"));
    });
    $("#reception_waiting_doctor").change(function () {
        reception_search();
    });


    $("#reservation_depart_select").change(function () {
        apointment_search();
        get_doctor($("#reservation_depart_select"));
    });
    $("#reservation_doctor_select").change(function () {
        apointment_search();
    });
    $("#need_pick_up").change(function () {
        apointment_search();
    });

    $("#search_depart_filter_package").change(function () {
        get_doctor($("#search_depart_filter_package"));
    });
    $("#depart_filter_reg").change(function () {
        get_doctor($("#depart_filter_reg"));
    });
    $("#pick_up_status").change(function () {
        edit_status_save();
    });
    $("#drop_off_status").change(function () {
        edit_status_save();
    });    
});


function apointment_search(page = null) {
    var context_in_page = 10;
    if (page == null) {
        page = 1;
    }

    var depart = $("#control_depart").val();
    var start = $("#date_start").val();
    var end = $("#date_end").val();
    var category = $('#patient_type option:selected').val();
    var string = $('#patient_search').val();
    var need_pick_up = $("#need_pick_up").prop("checked");
    // var status = $('#profile_status_filter option:selected').val();
    var pick_up = $('#pick_up_status_filter option:selected').val();
    var drop_off = $('#drop_off_status_filter option:selected').val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/apointment_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'depart': depart,
            'category': category,
            'string': string,
            'date_start': start,
            'date_end': end,
            'pick_up': pick_up,
            'drop_off': drop_off,
            'need_pick_up': need_pick_up,
            // 'page': page,
            // 'context_in_page': context_in_page,
        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_list_table > tbody ').empty();
            var count = 0
            for (var i = 0; i < response.datas.length; i++) {
                if (response.datas[i]) {
                    count++
                    var tr_class = "";
                    if (response.datas[i]['need_pick_up'])
                        tr_class = "class ='warning'"
    
    
                    var str = "<tr " + tr_class + "style='cursor:pointer;'";
                    
                    if (response.datas[i]['need_pick_up']) {
                        str += "<td style='color:rgb(228,97,131); vertical-align:middle;''>";
                    } else {
                        str += "<td style='vertical-align:middle;'>";
                    }
                     str += "<td>" + count + "</td>";
                    str += "<td>";

                    str += response.datas[i]['name'] + "</td>" +
                        "<td>" + response.datas[i]['date_of_birth'] + "</td>" +
                        "<td>" + response.datas[i]['depart'] + "</td>" + 
                        "<td>" + response.datas[i]['address'] + "</td>" + 
                        "<td>" + response.datas[i]['phone'] + "</td>" +
                        "<td>" + response.datas[i]['pick_up_addr'] + "</td>" +                      
                        "<td>" + response.datas[i]['follower'] + "</td>" +
                        "<td>" + response.datas[i]['apointment_memo'] + "</td>" +
                        "<td>" + response.datas[i]['start'] + "</td>" +
                        "<td>" + response.datas[i]['pick_up_time'] + "</td>";
                        if (response.datas[i]['pick_up_vehicle'] == 'Xe số 1'){
                            str += "<td style='background-color:#8994f1;'>" + response.datas[i]['pick_up_vehicle'] + "</td>"
                        }else if(response.datas[i]['pick_up_vehicle'] == 'Xe số 2') {  
                            str += "<td style='background-color:#eb8181;'>" + response.datas[i]['pick_up_vehicle'] + "</td>"
                        }else if(response.datas[i]['pick_up_vehicle'] == 'Xe số 3') {
                            str += "<td style='background-color:#7e7f85;'>" + response.datas[i]['pick_up_vehicle'] + "</td>"   
                        }else if(response.datas[i]['pick_up_vehicle'] == 'Xe số 4') {
                            str += "<td style='background-color:#ffe600;'>" + response.datas[i]['pick_up_vehicle'] + "</td>"                                                    
                        }else if(response.datas[i]['pick_up_vehicle'] == 'Xe số 5') {
                            str += "<td style='background-color:#e100ff;'>" + response.datas[i]['pick_up_vehicle'] + "</td>" 
                        }else {
                            str += "<td style='background-color:#ffffff;'>" + response.datas[i]['pick_up_vehicle'] + "</td>" 
                        }  
                        
                            
                                                                     
                        if(response.datas[i]['pick_up_status'] == 'Not start') {
                            str += "<td><input type='button' class='btn btn-primary' id='pick_up_start' value='Start' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'pick_up_start'" + ")> </td>";                                                      
                        }else if(response.datas[i]['pick_up_status'] == 'In process') {
                            str += "<td><input type='button' class='btn btn-danger' id='pick_up_done' value='Done' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'pick_up_done'"+ ")></td>";          
                        }else if(response.datas[i]['pick_up_status'] == 'Done') {
                            str += "<td></td>";     
                        } else{
                            str += "<td><input type='button'  class='btn btn-primary' id='pick_up_start' value='Start' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'pick_up_start'" + ")> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type='button' class='btn btn-danger' id='pick_up_done' value='Done' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'pick_up_done'"+ ")></td>"; 
                        }     

                        // if(response.datas[i]['pick_up_status'] == 'Not start') {
                        //     str += "<td>" + "  <select name='pick_up_status' id='pick_up_status"+ response.datas[i]['id'] + "'> <option value='Not start'  selected>Not start</option> <option value='In process'>In process</option> <option value='Done'>Done</option> </select>" + 
                        //     " <br><a class='btn btn-default' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'pick_up_status'" + ")>&nbsp;<i class='fa fa-2x fa-save'></i>&nbsp;</a>" + "</td>"                                                      
                        // }else if(response.datas[i]['pick_up_status'] == 'In process') {
                        //     str += "<td>" + "  <select name='pick_up_status' id='pick_up_status"+ response.datas[i]['id'] + "'> <option value='Not start'>Not start</option> <option value='In process'  selected>In process</option> <option value='Done'>Done</option> </select>" + 
                        //     " <br><a class='btn btn-default' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'pick_up_status'" + ")>&nbsp;<i class='fa fa-2x fa-save'></i>&nbsp;</a>" + "</td>"        
                        // }else if(response.datas[i]['pick_up_status'] == 'Done') {
                        //     str += "<td>" + "  <select name='pick_up_status' id='pick_up_status"+ response.datas[i]['id'] + "'> <option value='Not start'>Not start</option> <option value='In process'>In process</option> <option value='Done'  selected>Done</option> </select>" + 
                        //     " <br><a class='btn btn-default' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'pick_up_status'" + ")>&nbsp;<i class='fa fa-2x fa-save'></i>&nbsp;</a>" + "</td>"      
                        // } else{
                        //     str += "<td>" + "  <select name='pick_up_status' id='pick_up_status"+ response.datas[i]['id'] + "'> <option value='Not start'  selected>Not start</option> <option value='In process'>In process</option> <option value='Done'>Done</option> </select>" + 
                        //     " <br><a class='btn btn-default' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'pick_up_status'" + ")>&nbsp;<i class='fa fa-2x fa-save'></i>&nbsp;</a>" + "</td>"  
                        // }                           

                        str += "<td>" + response.datas[i]['payment_time'] + "</td>" +
                        "<td>" + response.datas[i]['drop_off_time'] + "</td>";
                        if (response.datas[i]['drop_off_vehicle'] == 'Xe số 1'){
                            str += "<td style='background-color:#8994f1;'>" + response.datas[i]['drop_off_vehicle'] + "</td>"
                        }else if(response.datas[i]['drop_off_vehicle'] == 'Xe số 2') {  
                            str += "<td style='background-color:#eb8181;'>" + response.datas[i]['drop_off_vehicle'] + "</td>"
                        }else if(response.datas[i]['drop_off_vehicle'] == 'Xe số 3') {
                            str += "<td style='background-color:#7e7f85;'>" + response.datas[i]['drop_off_vehicle'] + "</td>"   
                        }else if(response.datas[i]['drop_off_vehicle'] == 'Xe số 4') {
                            str += "<td style='background-color:#ffe600;'>" + response.datas[i]['drop_off_vehicle'] + "</td>"                                                    
                        }else if(response.datas[i]['drop_off_vehicle'] == 'Xe số 5') {
                            str += "<td style='background-color:#e100ff;'>" + response.datas[i]['drop_off_vehicle'] + "</td>" 
                        }else{
                            str += "<td style='background-color:#ffffff;'>" + response.datas[i]['drop_off_vehicle'] + "</td>" 
                        }                                   

                        
                        if(response.datas[i]['drop_off_status'] == 'Not start' && response.datas[i]['pick_up_status'] == 'Done') {
                            str += "<td><input type='button'  class='btn btn-primary' id='drop_off_start' value='Start' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'drop_off_start'" + ")></td>";                                                      
                        }else if(response.datas[i]['drop_off_status'] == 'In process' && response.datas[i]['pick_up_status'] == 'Done') {
                            str += "<td><input type='button' class='btn btn-danger' id='drop_off_done' value='Done' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'drop_off_done'"+ ")></td>";      
                        }else if(response.datas[i]['drop_off_status'] == 'Done' || response.datas[i]['pick_up_status'] != 'Done') {
                            str += "<td></td>";      
                        }else{
                            str += "<td><input type='button' class='btn btn-primary' id='drop_off_start' value='Start' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'drop_off_start'" + ")> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<input type='button' class='btn btn-danger' id='drop_off_done' value='Done' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'drop_off_done'"+ ")></td>";        
                        } 

                       
                        //str +=     "<input type='button' class='btn btn-danger'  value='Done'  onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'drop_off_status'," +"'Done'"+ ")></td>";  
                        // if(response.datas[i]['drop_off_status'] == 'Not start') {
                        //     str += "<td>" + "  <select name='drop_off_status' id='drop_off_status"+ response.datas[i]['id'] + "'> <option value='Not start'  selected>Not start</option> <option value='In process'>In process</option> <option value='Done'>Done</option> </select>" + 
                        //     " <br><a class='btn btn-default' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'drop_off_status'" + ")>&nbsp;<i class='fa fa-2x fa-save'></i>&nbsp;</a>" + "</td>"                                                    
                        // }else if(response.datas[i]['drop_off_status'] == 'In process') {
                        //     str += "<td>" + "  <select name='drop_off_status' id='drop_off_status"+ response.datas[i]['id'] + "'> <option value='Not start'>Not start</option> <option value='In process'  selected>In process</option> <option value='Done'>Done</option> </select>" + 
                        //     " <br><a class='btn btn-default' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'drop_off_status'" + ")>&nbsp;<i class='fa fa-2x fa-save'></i>&nbsp;</a>" + "</td>"    
                        // }else if(response.datas[i]['drop_off_status'] == 'Done') {
                        //     str += "<td>" + "  <select name='drop_off_status' id='drop_off_status"+ response.datas[i]['id'] + "'> <option value='Not start'>Not start</option> <option value='In process'>In process</option> <option value='Done'  selected>Done</option> </select>" +
                        //     " <br><a class='btn btn-default' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'drop_off_status'" + ")>&nbsp;<i class='fa fa-2x fa-save'></i>&nbsp;</a>" + "</td>"       
                        // }else{
                        //     str += "<td>" + "  <select name='drop_off_status' id='drop_off_status"+ response.datas[i]['id'] + "'> <option value='Not start'  selected>Not start</option> <option value='In process'>In process</option> <option value='Done'>Done</option> </select>" + 
                        //             " <br><a class='btn btn-default' onclick=edit_status_save('" + response.datas[i]['id'] +"',"+"'drop_off_status'" + ")>&nbsp;<i class='fa fa-2x fa-save'></i>&nbsp;</a>" + "</td>"         
                        // }                             


                        str += "<td><a class='btn btn-default' onclick=edit_modal('" + response.datas[i]['id'] + "')>&nbsp;<i class='fa fa-2x fa-pencil'></i>&nbsp;</a></td>";                      
                        str += '<td>' + "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='print_apointment_letter(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-print'></i></a>"+'</td>';
                        str += "<td><a class='btn btn-default' onclick=sms_modal('" + response.datas[i]['patient_id'] + "')>&nbsp;<i class='fa fa-2x fa-mobile'></i>&nbsp;</a></td>" +
                        "<td><a class='btn btn-default' onclick=registrationModal('" + response.datas[i]['id'] + "')>&nbsp;<i class='fa fa-2x fa-pencil'></i>&nbsp;</a></td></td></tr>";
                        // "<td>" +
                        // "<a class='btn button btn-xs' style='margin-right:5px;' href='javascript: void (0);' onclick='edit_database(" + response.datas[i]['id'] + ")' >" +"<span> Done </span></button>"+ "</a></tr> ";
                        
                        // if(response.datas[i]['pick_up_status'] == 'Not start'){
                        //     $('#pick_up_start').prop('disabled', true);
                        //     $('#pick_up_done').prop('disabled', true);
    
                        // }else if(response.datas[i]['pick_up_status'] == 'In process'){
                        //     $('#pick_up_start').prop('disabled', true);
                        //     $('#pick_up_done').prop('disabled', true);
                        // }else if(response.datas[i]['pick_up_status'] == 'Done'){
                        //     $('#pick_up_start').prop('disabled', true);
                        //     $('#pick_up_done').prop('disabled', true);
                        // }else{
                        //     $('#pick_up_start').prop('disabled', true);
                        //     $('#pick_up_done').prop('disabled', true);
                        // }
                        // if(response.datas[i]['need_pick_up']){
                        //     $('table tr td:nth-child(2)').css('background-color', 'red');
                        // }else{
                        //     $('#drop_off_start').prop('disabled', true);
                        //     $('#drop_off_done').prop('disabled', true);
                        // } 

                        // if(response.datas[i]['drop_off_status'] == 'Not start'){
                        //     $('#drop_off_start').prop('disabled', true);
                        //     $('#drop_off_done').prop('disabled', true);
                        // }else if(response.datas[i]['drop_off_status'] == 'In process'){
                        //     $('#drop_off_start').prop('disabled', true);
                        //     $('#drop_off_done').prop('disabled', true);
                        // }else if(response.datas[i]['drop_off_status'] == 'Done'){
                        //     $('#drop_off_start').prop('disabled', true);
                        //     $('#drop_off_done').prop('disabled', true);
                        // }else{
                        //     $('#drop_off_start').prop('disabled', true);
                        //     $('#drop_off_done').prop('disabled', true);
                        // }                        
                } else {
                    var str = "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
                }
                $('#patient_list_table').append(str);
            }
            
            
            $(".total_div span:nth-child(2)").html(numberWithCommas(response.total))
            //페이징
            // $('#table_pagnation').html('');
            // str = '';
            // if (response.has_previous == true) {
            //     str += '<li> <a style="cursor:pointer;" onclick="apointment_search(' + (response.page_number - 1) + ')">&laquo;</a></li>';
            // } else {
            //     str += '<li class="disabled"><span>&laquo;</span></li>';
            // }

            // for (var i = response.page_range_start; i < response.page_range_stop; i++) {
            //     if (response.page_number == i) {
            //         str += '<li class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
            //     }
            //     else if (response.page_number + 5 > i && response.page_number - 5 < i) {
            //         str += '<li><a style="cursor:pointer;" onclick="apointment_search(' + i + ')">' + i + '</a></li>';
            //     }
            //     else {
            //     }

            // }
            // if (response.has_next == true) {
            //     str += '<li><a style="cursor:pointer;" onclick="apointment_search(' + (response.page_number + 1) + ')">&raquo;</a></li>';
            // } else {
            //     str += '<li class="disabled"><span>&raquo;</span></li>';
            // }
            // $('#table_pagnation').html(str);

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
    $("#pick_up_status").change(function () {
        edit_status_save();
    });
    $("#drop_off_status").change(function () {
        edit_status_save();
    });   
}


var number_list = [];

function sms_modal(patient_id, phone, name) {

    //환자 기본 정보
    $.ajax({
        type: 'POST',
        url: '/manage/customer_manage_get_patient_info/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,

        },
        dataType: 'Json',
        success: function (response) {
            var name = response.name_kor + "/" + response.name_eng
            $('#sms_modal_name').val(name);
            $('#sms_modal_phone').val(response.phone);        

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })


    $('#sms_modal').modal({ backdrop: 'static', keyboard: false });
    $('#sms_modal').modal('show');    
}

function registrationModal(id, phone, name) {

    //환자 기본 정보
    $.ajax({
        type: 'POST',
        url: '/receptionist/reservation_info/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reservation_id': id,

        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_id').val(response.reservation_patient_id);
            $('#reception_id').val(response.reception_id);
            $('#reservation_id').val(id);
            $('#reservation_chart_number').val(response.patient_chart);
            $('#patient_name_kor').val(response.patient_name_kor);
            $('#patient_name_eng').val(response.patient_name_eng);
            $('#patient_date_of_birth').val(response.reservation_date_of_birth);
            $('#patient_gender').val(response.patient_gender);
            $("#patient_nationality").val(response.patient_nationality);


            $('#need_invoice').prop('checked', false)
            $('#need_insurance').prop('checked', false)
            $('#need_pick_up').prop('checked', false)
            if (response.need_invoice) {
                $('#need_invoice').prop('checked', true)
            }
            if (response.need_insurance) {
                $('#need_insurance').prop('checked', true)
            }       
            if (response.need_pick_up) {
                $('#need_pick_up').prop('checked', true)
            }        

            $('#patient_funnel').val(response.funnel);
            $('#patient_funnel_etc').val(response.funnel_etc);
            $('#patient_memo').val(response.patient_memo);

            $('#patient_address').val(response.patient_address);
            $('#patient_phone').val(response.reservation_phone);
            $('#patient_email').val(response.patient_email);
            $('#reservation_depart').val(response.reservation_depart);
            get_doctor($("#reservation_depart"), response.reservation_depart);
            $('#reservation_doctor').val(response.reservation_doctor);

            if(response.reservation_reception_id == ''){
                $('#btn_save_recept').removeAttr('disabled');
                
            }else{
                $('#btn_save_recept').attr('disabled','disabled');
            };

            if(response.reservation_patient_id == ''){
                $('#btn_save_patient').removeAttr('disabled');
                
            }else{
                $('#btn_save_patient').attr('disabled','disabled');
            }            
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

    $('#registrationModal').modal({ backdrop: 'static', keyboard: false });
    $('#registrationModal').modal('show');    
}

function edit_modal(id) {

    $.ajax({
        type: 'POST',
        url: '/receptionist/apointment_info/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reservation_id': id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#reservation_id').val(response.reservation_id);
            $('#pick_up_time').val(response.pick_up_time);
            $('#drop_off_time').val(response.drop_off_time);
            $('#pick_up_addr').val(response.pick_up_addr);            
            $('#drop_off_addr').val(response.drop_off_addr);
            $('#apointment_memo').val(response.apointment_memo);
            $('#pick_up_vehicle').val(response.pick_up_vehicle);            
            $('#drop_off_vehicle').val(response.drop_off_vehicle);
            
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    }) 
    $('#reservation_id').val(id);
    $('#createEventModal').modal({ backdrop: 'static', keyboard: false });
    $('#createEventModal').modal('show');    
}

function send_sms() {

    var receiver = $("#sms_modal_name").val()
    var phone = $("#sms_modal_phone").val()
    var contents = $("#sms_modal_content").val();
    $("#overlay").fadeOut(300);

    if (receiver == '') {
        alert(gettext('Name is Empty.'));
        return;
    }
    if (phone == '') {
        alert(gettext('Phone Number is Empty.'));
        return;
    }
    if (contents == '') {
        alert(gettext('Content is Empty.'));
        return;
    }

    //문자 전송 번호 
    list_number = phone.split(',');
    list_number = list_number.filter(function (item) {
        return item !== null && item !== undefined && item !== '';
    });
    str_list_number = list_number.join(',')


    $.ajax({
        type: 'POST',
        //url: '/manage/employee_check_id/',
        url: '/manage/sms/send_sms/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'type': 'MANUAL',
            'receiver': receiver,

            'phone': list_number.toString(),
            'contents': contents,

        },
        beforeSend: function () {
            $("#overlay").fadeIn(300);
        },
        dataType: 'Json',
        success: function (response) {
            console.log(response);
            if (response.res == true) {

                context = {
                    //'csrfmiddlewaretoken': $('#csrf').val(),
                    'msg_id': response.id,
                    'phone': str_list_number,
                    'contents': $("#contents").val(),
                }
				

                //contents = contents.replace(/\r/g, "\r\n");//개행 변경
                //var url = 'http://kbl.cornex.co.kr/sms/sms_send.php?data=' + JSON.stringify(context)
                //var url = 'http://kbl.cornex.co.kr/sms/sms_send.php?msg_id=' + response.id + '&phone=' + str_list_number + '&contents=' + encodeURI(contents);
                // var url = window.location.protocol + "//" + window.location.hostname + ':11111/sms/sms_send.php?msg_id=' + response.id + '&phone=' + str_list_number + '&contents=' + encodeURI(contents);
                var url = 'http://222.252.20.33:11111/sms/sms_send.php?msg_id=' + response.id + '&phone=' + str_list_number + '&contents=' + encodeURI(contents);
                console.log('url : ' + url);
                console.log(contents);

                $.ajax({
                    crossOrigin: true,
                    type: 'GET',
                    //url: '/manage/employee_check_id/',
                    url: url,
                    //data: {
                    //    'csrfmiddlewaretoken': $('#csrf').val(),
                    //    'msg_id': response.id,
                    //    'phone': str_list_number,
                    //    'contents': $("#contents").val(),
                    //},
                    dataType: 'Json',
                    //jsonp: "callback", 
                    success: function (response) {
                        //전송 완료 시 창 닫기. 결과는 이력에서 확인
                        $('#sms_modal').modal('hide');
                        json_response = JSON.parse(response);
                
                        console.log(json_response);
                
                        $.ajax({
                            type: 'POST',
                            url: '/manage/sms/recv_result/',
                            data: {
                                'csrfmiddlewaretoken': $('#csrf').val(),
                                'msg_id': json_response.msg_id,
                                'status': json_response.status,
                                'code': json_response.code,
                                'tranId': json_response.tranId,
                            },
                            dataType: 'Json',
                            success: function (response) {
                
                            },
                            error: function (request, status, error) {
                                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                            },
                        })
                    },
                    error: function (request, status, error) {
                        console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                    },
                })
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
        complete: function () {
            $("#overlay").fadeOut(300);
            $('#sms_modal').modal('hide');
        }
    })

}

//Edit Status Save
function edit_status_save(id, status) {
    var reservation_id = id;
    if(status == 'pick_up_start'){
        var pick_up_status = 'In process';
        var status_type = 'pick_up_status';
    }else if(status == 'pick_up_done'){
        var pick_up_status = 'Done';
        var status_type = 'pick_up_status';
    }else if(status == 'drop_off_start'){
        var drop_off_status =  'In process';
        var status_type = 'drop_off_status';
    }else if(status == 'drop_off_done'){
        var drop_off_status =  'Done';
        var status_type = 'drop_off_status';
    }  
    // var pick_up_status =  $('#pick_up_status'+id).val();
    // var drop_off_status =  $('#drop_off_status'+id).val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/apointment_save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reservation_id': reservation_id,
            'type': status_type,
            'pick_up_status': pick_up_status,
            'drop_off_status': drop_off_status,
        },
        dataType: 'Json',
        success: function (response) {

            alert(gettext('Status Saved.'));
            apointment_search();

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })

}

function apointment_info(reservation_id = null) {

    $.ajax({
        type: 'POST',
        url: '/receptionist/apointment_info/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reservation_id': reservation_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#reservation_id').val(response.reservation_id);
            $('#pick_up_time').val(response.pick_up_time);
            $('#drop_off_time').val(response.drop_off_time);
            $('#pick_up_addr').val(response.pick_up_addr);            
            $('#drop_off_addr').val(response.drop_off_addr);
            $('#apointment_memo').val(response.apointment_memo);
            $('#pick_up_vehicle').val(response.pick_up_vehicle);            
            $('#drop_off_vehicle').val(response.drop_off_vehicle);
            
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function apointment_save() {

    if ($('#pick_up_time').val() == '') {
        alert(" {{ _('select pick up time ! ') }} ");
        return;
    }
    
    // if ($('#pick_up_addr').val() == '') {
    //     alert(" {{ _('pick up address is necessary! ! ') }} ");
    //     return;
    // }


    var date_pattern = /^[0-9]{4}-(0[1-9]|1[0-2])-(0[1-9]|[1-2][0-9]|3[0-1]) (0[0-9]|1[0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])$/; 
    
    var reservation_id = $('#reservation_id').val();
    var pick_up_time = $('#pick_up_time').val();
    var drop_off_time = $('#drop_off_time').val();    
    var pick_up_addr = $('#pick_up_addr').val();
    var drop_off_addr = $('#drop_off_addr').val();        
    var apointment_memo = $('#apointment_memo').val(); 
    var pick_up_vehicle = $('#pick_up_vehicle option:selected').val();
    var drop_off_vehicle = $('#drop_off_vehicle option:selected').val();


    if (pick_up_time != '') {
        if ( !date_pattern.test(pick_up_time)){
            alert("{{ _('Pick up time should be 0000(year)-00(month)-00(day) hh:mm:ss') }}");
            return;
        }
    }

    if (drop_off_time != '') {
            if ( !date_pattern.test(drop_off_time)){
            alert("{{ _('Drop off time should be 0000(year)-00(month)-00(day) hh:mm:ss') }}");
            return;
        }
    }

    $.ajax({
        type: 'POST',
        url: '/receptionist/apointment_save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reservation_id': reservation_id,
            'pick_up_time': pick_up_time,
            'drop_off_time': drop_off_time,
            'pick_up_addr': pick_up_addr,
            'drop_off_addr':drop_off_addr,            
            'pick_up_vehicle':pick_up_vehicle,
            'drop_off_vehicle':drop_off_vehicle,
            'apointment_memo':apointment_memo,
            'pick_up_vehicle':pick_up_vehicle,
            'drop_off_vehicle':drop_off_vehicle,            
        },
        dataType: 'Json',
        success: function (response) {
            alert(gettext('Saved.'));
            location.reload();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    });
}

function reset_inputs() {
    $('.modalBody input').val();
    $('.modalBody select').find('option:first').attr('selected', 'selected');
}

function get_doctor(part, depart = null, selected = null) {
    var part_id = part.attr('id');
    var doctor;
    if (part_id == 'depart_select') {
        doctor = $('#doctor_select');
    } else if (part_id == 'reception_waiting_depart') {
        doctor = $('#reception_waiting_doctor');
    } else if (part_id == 'reservation_depart_select') {
        doctor = $('#reservation_doctor_select');
    } else if (part_id == 'edit_reception_depart') {
        doctor = $('#edit_reception_doctor');
    } else if (part_id == 'search_depart_filter_package') {
        doctor = $("#search_doctor_filter_package");
    } else if (part_id == 'depart_filter_reg') {
        doctor = $("#doctor_filter_reg");
    }

    if (depart == null)
        depart = part.val();

    if (part.val() == '') {
        doctor.empty();
        doctor.append(new Option('---------', ''));
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/receptionist/get_depart_doctor/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'depart': part.val(),
        },
        dataType: 'Json',
        success: function (response) {
            doctor.empty();
            doctor.append(new Option('---------', ''));
            for (var i in response.datas) {
                if (selected == response.datas[i]) {
                    doctor.append("<option value='" + response.datas[i] + "' selected>" + i + "</Option>");
                } else {
                    doctor.append("<option value='" + response.datas[i] + "'>" + i + "</Option>");
                }

            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}

function print_apointment_letter(id) {
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/apointment_letter/' + id);

    $('#dynamic_div').printThis({
    });
}


function save_recept() {
    if (!patient_check_required()) {
        return;
    }

    var id = $('#patient_id').val();
    var chart_no = $('#patient_chart').val();
    var name_kor = $('#patient_name_kor').val();
    var name_eng = $('#patient_name_eng').val();
    var date_of_birth = $('#patient_date_of_birth').val();
    if ($("#language").val() == 'vi') {
        date_of_birth = moment(date_of_birth, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
    var gender = $('#patient_gender').val();
    var nationality = $("#patient_nationality").val();
    //var gender = $('input[name="gender"]:checked').val();
    var address = $('#patient_address').val();
    var phone = $('#patient_phone').val();
    var email = $('#patient_email').val();
    var memo = $('#patient_memo').val();
    var marking = $('#patient_mark').val();
    var funnel = $('#patient_funnel').val();
    var funnel_etc = $('#patient_funnel_etc').val();

    var past_history = $('#history_past').val();
    var family_history = $('#history_family').val();

    var depart = $('#reservation_depart').val();
    var reservation_id = $('#reservation_id').val();
    if (depart == '') {
        alert(gettext('Select Depart.'));
        return;
    }

    var doctor = $('#reservation_doctor').val();
    if (doctor == '') {
        alert(gettext('Select Doctor.'));
        return;
    }
    var chief_complaint = '  ';

    var tax_invoice_number = $('#tax_invoice_number').val();
    var tax_invoice_company_name = $('#tax_invoice_company_name').val();
    var tax_invoice_address = $('#tax_invoice_address').val();

    var need_medical_report = $('#need_medical_report').prop("checked");
    var need_invoice = $("#need_invoice").prop("checked");
    var need_insurance = $("#need_insurance").prop("checked");
    var is_vaccine = $("#is_vaccine").prop("checked");

    var patient_table_vital_ht = $('#patient_table_vital_ht').val();
    var patient_table_vital_wt = $('#patient_table_vital_wt').val();
    var patient_table_vital_bmi = $('#patient_table_vital_bmi').val();
    var patient_table_vital_bp = $('#patient_table_vital_bp').val();
    var patient_table_vital_bt = $('#patient_table_vital_bt').val();
    var patient_table_vital_pr = $('#patient_table_vital_pr').val();
    var patient_table_vital_breath = $('#patient_table_vital_breath').val();

    $.ajax({
        type: 'POST',
        url: '/receptionist/save_reception/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id': id,
            'cahrt_no': chart_no,
            'name_kor': name_kor,
            'name_eng': name_eng,
            'date_of_birth': date_of_birth,
            'phone': phone,
            'gender': gender,
            'address': address,
            'past_history': past_history,
            'family_history': family_history,
            'depart': depart,
            'doctor': doctor,
            'chief_complaint': chief_complaint,
            'nationality': nationality,
            'email': email,
            'memo':memo,
            'marking': marking,
            'funnel': funnel,
            'funnel_etc': funnel_etc,
            'reservation_id': reservation_id,
            'tax_invoice_number': tax_invoice_number,
            'tax_invoice_company_name': tax_invoice_company_name,
            'tax_invoice_address': tax_invoice_address,

            'need_medical_report': need_medical_report,
            'need_invoice': need_invoice,
            'need_insurance': need_insurance,
            'is_vaccine': is_vaccine,

            'patient_table_vital_ht': patient_table_vital_ht,
            'patient_table_vital_wt': patient_table_vital_wt,
            'patient_table_vital_bmi': patient_table_vital_bmi,
            'patient_table_vital_bp': patient_table_vital_bp,
            'patient_table_vital_bt': patient_table_vital_bt,
            'patient_table_vital_pr': patient_table_vital_pr,
            'patient_table_vital_breath': patient_table_vital_breath,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result == true) {
                alert(gettext('has been Recepted.'));
                // reception_search(true);
                // earse_inputs();
                // set_new_patient(false);


                // //검색 리스트에 띄우기
                // $('#Patient_Search > tbody ').empty();
                // var str = "<tr style='cursor:pointer;' onclick='set_patient_data(" +
                //     parseInt(response.id) +
                //     ")'><td>" + 1 + "</td>";

                // str += "<td>";


                // str += response.chart + "</td>" +
                //     "<td>" + response.name_kor + ' / ' + response.name_eng + "</td>" +
                //     "<td>" + response.date_of_birth + ' (' + response.gender + '/' + response.age + ")</td>" +
                //     "<td>" + response.phonenumber + "</td>" +
                //     "<td>" + response.address + "</td></tr>";

                // $('#Patient_Search').append(str);
                // alert(gettext('Saved.'));
                location.reload();

            } else {
                alert(gettext('failed to recepted.'));
            }


        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}
function patient_check_required() {
    var $t, t;
    var fields = [$('#patient_name_kor'),
        $('#patient_name_eng'),
        $('#patient_date_of_birth'),
        $('#patient_address'),
        $('#patient_phone'),
        $('#patient_email'),

    ]

    var phone = $('#patient_phone').val();
    var NumberRegex = /^[0]*(\d{9})*\s*$/;
    if(phone.length == 10){
        if(NumberRegex.test(phone)){
        //do whatever you want to
        }else{
            alert('Invalid phone number')
            return false;
        }
    }else if(phone.length > 10){
        alert('Invalid phone number')
        return false;
    }else if(phone.length < 10){
        if(phone != 'na' && phone != 'NA' ){
            alert('Invalid phone number')
            return false;
        }              
    }   

    if ($('#patient_gender').val() == '' ){
        alert(gettext("'Gender' is necessary."));
        return false;
    }
    if ($('#patient_nationality').val() == '') {
        alert(gettext("'Nationality' is necessary."));
        return false;
    }

    var result = true;
    $.each(fields,function () {
        $t = jQuery(this);
        if ($t.prop("required")) {
            if (!jQuery.trim($t.val())) {
                t = $t.attr("name");
                $t.focus();
                alert(gettext("'" + t + "'" + "is necessary."));
                result = false;
                return false;
            }
        }
    });
    return result;
}

function save_patient() {
    if ( !patient_check_required() ) {
        return;
    }
    var id = $('#patient_id').val();
    var chart_no = $('#patient_chart').val();
    var name_kor = $('#patient_name_kor').val();
    var name_eng = $('#patient_name_eng').val();
    var date_of_birth = $('#patient_date_of_birth').val();
    if ($("#language").val() == 'vi') {
        date_of_birth = moment(date_of_birth, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
    var gender = $('#patient_gender').val();
    var nationality = $("#patient_nationality").val();
    //var gender = $('input[name="gender"]:checked').val();
    var address = $('#patient_address').val();
    var phone = $('#patient_phone').val();
    var email = $('#patient_email').val();
    var memo = $('#patient_memo').val();
    var marking = $("#patient_mark").val();
    var funnel = $("#patient_funnel").val();
    var funnel_etc = $("#patient_funnel_etc").val();

    var past_history = $('#history_past').val();
    var family_history = $('#history_family').val();


    //var need_medical_report = $('#need_medical_report').prop("checked");
    var need_invoice = $("#need_invoice").prop("checked");
    var need_insurance = $("#need_insurance").prop("checked");

    var tax_invoice_number = $('#tax_invoice_number').val();
    var tax_invoice_company_name = $('#tax_invoice_company_name').val();
    var tax_invoice_address = $('#tax_invoice_address').val();

    var patient_table_vital_ht = $('#patient_table_vital_ht').val();
    var patient_table_vital_wt = $('#patient_table_vital_wt').val();
    var patient_table_vital_bmi = $('#patient_table_vital_bmi').val();
    var patient_table_vital_bp = $('#patient_table_vital_bp').val();
    var patient_table_vital_bt = $('#patient_table_vital_bt').val();
    var patient_table_vital_pr = $('#patient_table_vital_pr').val();
    var patient_table_vital_breath = $('#patient_table_vital_breath').val();
    var reservation_id = $('#reservation_id').val();


    $.ajax({
        type: 'POST',
        url: '/receptionist/save_patient/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id': id,
            'cahrt_no': chart_no,
            'name_kor': name_kor,
            'name_eng': name_eng,
            'date_of_birth': date_of_birth,
            'phone': phone,
            'nationality': nationality,
            'gender': gender,
            'address': address,
            'past_history': past_history,
            'family_history': family_history,
            'email': email,
            'memo': memo,
            'marking': marking,
            'funnel': funnel,
            'funnel_etc': funnel_etc,
            'reservation_id': reservation_id,

            'tax_invoice_number': tax_invoice_number,
            'tax_invoice_company_name': tax_invoice_company_name,
            'tax_invoice_address': tax_invoice_address,

            'need_invoice': need_invoice,
            'need_insurance': need_insurance,


            'patient_table_vital_ht': patient_table_vital_ht,
            'patient_table_vital_wt': patient_table_vital_wt,
            'patient_table_vital_bmi': patient_table_vital_bmi,
            'patient_table_vital_bp': patient_table_vital_bp,
            'patient_table_vital_bt ': patient_table_vital_bt,
            'patient_table_vital_pr': patient_table_vital_pr,
            'patient_table_vital_breath': patient_table_vital_breath,

        },
        dataType: 'Json',
        success: function (response) {
            if (response.result == true) {
                alert(gettext('Saved.'));
                location.reload();
            } else {
                alert(gettext('Failed.'));
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function excel_download() {

    var depart = $("#control_depart").val();
    var start = $("#date_start").val();
    var end = $("#date_end").val();
    var category = $('#patient_type option:selected').val();
    var string = $('#patient_search').val();
    // var status = $('#profile_status_filter option:selected').val();
    var pick_up = $('#pick_up_status_filter option:selected').val();
    var drop_off = $('#drop_off_status_filter option:selected').val();




    var url = '/receptionist/pick_up_excel?'
    url += 'date_start=' + start + '&';
    url += 'date_end=' + end + '&';
    url += 'depart=' + depart + '&';
    url += 'string=' + string + '&';
    url += 'pick_up=' + pick_up + '&';
    url += 'drop_off=' + drop_off + '&';

    window.open(url);
}