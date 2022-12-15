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
    $("#date_start").val(moment().subtract(7, 'd').format('YYYY-MM-DD'));
    $("#date_end").val(moment().format('YYYY-MM-DD'));

    $('.date_input, #contents_filter_depart,#is_vaccine').change(function () {
        search_patient();
    })

    $('#vaccine_date').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });

    search_patient();
    
    //환자 검색
    $('#patient_search').keydown(function (key) {
        if (key.keyCode == 13) {
            search_patient();
        }
    })

    $("#patient_search_btn").click(function () {
        search_patient();
    });

    $("#control_depart").change(function () {
        search_patient();
    })
    $("#profile_status_filter").change(function () {
        search_patient();
    })

    $("#invoice_insurance_filter").change(function () {
        search_patient();
    })    

    //전체 체크 박스
    $("#check_sms_all").change(function () {
        $(".customer_checkbox").prop("checked", $(this).prop("checked"));
    })


});


function search_patient(page = null) {
    var context_in_page = 10;
    if (page == null) {
        page = 1;
    }

    var depart = $("#control_depart").val();
    var start = $("#date_start").val();
    var end = $("#date_end").val();
    var category = $('#patient_type option:selected').val();
    var string = $('#patient_search').val();
    var status = $('#profile_status_filter option:selected').val();
    var invoice_insurance = $('#invoice_insurance_filter option:selected').val();

    $.ajax({
        type: 'POST',
        url: '/manage/search_profile_status/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'depart': depart,
            'category': category,
            'string': string,
            'start': start,
            'end': end,
            'status': status,
            'invoice_insurance': invoice_insurance,
            'page': page,
            'context_in_page': context_in_page,
        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_list_table > tbody ').empty();
            for (var i = 0; i < context_in_page; i++) {
                if (response.datas[i]) {
                    var str = "<tr><td>" + response.datas[i]['id'] + "</td>";
                    str += "<td>";

                    str += response.datas[i]['chart'] + "</td>" +
                        "<td>" + response.datas[i]['recorded_date'] + "</td>" +
                        "<td><span id='namekor_" + response.datas[i]['id'] + "'>" + response.datas[i]['name_kor'] + "</span><br/>" +
                        "<span id='nameeng_" + response.datas[i]['id'] + "'>" + response.datas[i]['name_eng'] + "</span></td>" +
                        "<td>" + response.datas[i]['address'] + "</td>" + 
                        "<td>" + response.datas[i]['phonenumber'] + "</td>" +                      
                        "<td>" + response.datas[i]['email'] + "</td>" +
                        "<td>" + response.datas[i]['depart'] + "</td>" +
                        "<td>" + response.datas[i]['red_invoice'] + "</td>" +
                        "<td>" + response.datas[i]['need_insurance'] + "</td>" +
                        "<td>" + response.datas[i]['tax_number'] + "</td>" +
                        "<td>" + response.datas[i]['company'] + "</td>" +
                        "<td>" + response.datas[i]['company_address'] + "</td>" +                        
                        "<td>" + response.datas[i]['recommend'] + "</td>";
                        if (response.datas[i]['status'] == 'done'){
                            str += "<td>" + "<font style='font-weight:700; color:#0021dd'>" + response.datas[i]['status'] + "</font>" 
                        }else if(response.datas[i]['status'] == 'waiting') {  
                            str += "<td>" + "<font style='font-weight:700; color:#ff0000'>" + response.datas[i]['status'] + "</font>" 
                        }else if(response.datas[i]['status'] == null) {
                            str += "<td>" + "<font style='font-weight:700; color:#ff0000'>" + response.datas[i]['status'] + "</font>"                            
                        }else{
                            str += "<td>" + "<font style='font-weight:700; color:#f3cf00'>" + response.datas[i]['status'] + "</font>"  
                        }
                        str +="  <a class='btn btn-default' onclick=reception_edit('" + response.datas[i]['rec_id'] +"')>&nbsp;<i class='fa fa-2x fa-pencil'></i>&nbsp;</a></td>" +

                        "<td><a class='btn btn-default' onclick=sms_modal('" + response.datas[i]['patient_id'] + "')>&nbsp;<i class='fa fa-2x fa-mobile'></i>&nbsp;</a></td></tr>";
                        // "<td>" +
                        // "<a class='btn button btn-xs' style='margin-right:5px;' href='javascript: void (0);' onclick='edit_database(" + response.datas[i]['id'] + ")' >" +"<span> Done </span></button>"+ "</a></tr> ";
                    
                } else {
                    var str = "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
                }
                $('#patient_list_table').append(str);
            }


            //페이징
            $('#table_pagnation').html('');
            str = '';
            if (response.has_previous == true) {
                str += '<li> <a style="cursor:pointer;" onclick="search_patient(' + (response.page_number - 1) + ')">&laquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&laquo;</span></li>';
            }

            for (var i = response.page_range_start; i < response.page_range_stop; i++) {
                if (response.page_number == i) {
                    str += '<li class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
                }
                else if (response.page_number + 5 > i && response.page_number - 5 < i) {
                    str += '<li><a style="cursor:pointer;" onclick="search_patient(' + i + ')">' + i + '</a></li>';
                }
                else {
                }

            }
            if (response.has_next == true) {
                str += '<li><a style="cursor:pointer;" onclick="search_patient(' + (response.page_number + 1) + ')">&raquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&raquo;</span></li>';
            }
            $('#table_pagnation').html(str);

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function set_patient_data(obj,patient_id) {

    $("#patient_list_table tr").removeClass('danger');
    $(obj).addClass('danger');

    var depart = $("#control_depart").val();

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
            $('#basic_info_chart_no').val(response.chart);
            $('#patient_id').val(response.id);
            $('#patient_chart').val(response.chart);
            $('#patient_nationality').val(response.nationality);
            $('#basic_info_name_kor').val(response.name_kor);
            $('#basic_info_name_eng').val(response.name_eng);

            if ($("#language").val() == 'vi') {
                $('#basic_info_dob').val(moment(response.date_of_birth, 'YYYY-MM-DD').format('DD/MM/YYYY'));
            } else {
                $('#basic_info_dob').val(response.date_of_birth);
            }

            $('#basic_info_address').val(response.address);
            $('#basic_info_phone').val(response.phone);
            $("#basic_info_gender").val(response.gender);
            $('#patient_nationality').val(response.nationality);
            $('#basic_info_email').val(response.email);
            $('#basic_info_memo').val(response.memo);
            $("#basic_info_mark").val(response.marking);
            $("#basic_info_funnel").val(response.funnel);
            $("#basic_info_funnel_etc").val(response.funnel_etc);

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })


    //환자 방문 이력
    $.ajax({
        type: 'POST',
        url: '/manage/customer_manage_get_patient_visit/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,
            'depart': depart,
        },
        dataType: 'Json',
        success: function (response) {
            $("#visit_history tbody").empty();
            for (var i = 0; i < response.datas.length ; i++) {
                if (response.datas[i]) {
                    var str = "<tr><td>" + parseInt(i + 1) + "</td>" + 

                        "<td>" + response.datas[i]['depart'] + "</td>" +
                        "<td>" + response.datas[i]['doctor'] + "</td>" +
                        "<td>" + response.datas[i]['date_visited'] + "</td>" +
                        "<td>" + response.datas[i]['paid'] + "</td>" +

                        "<td><a class='btn btn-default' onclick='show_past_history(" + response.datas[i]['reception_id'] + ")'><i class='fa fa-search'></i></a></td></tr>";
                    //"<td><a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='delete_database_precedure(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-history'></i></a></td></tr>";

                    $('#visit_history tbody').append(str);
                } 
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

    get_vaccine_history_list(patient_id)
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
            // $('#basic_info_chart_no').val(response.chart);
            // $('#patient_id').val(response.id);
            // $('#patient_chart').val(response.chart);
            // $('#patient_nationality').val(response.nationality);
            // $('#basic_info_name_kor').val(response.name_kor);
            // $('#basic_info_name_eng').val(response.name_eng);

            // if ($("#language").val() == 'vi') {
            //     $('#basic_info_dob').val(moment(response.date_of_birth, 'YYYY-MM-DD').format('DD/MM/YYYY'));
            // } else {
            //     $('#basic_info_dob').val(response.date_of_birth);
            // }

            // $('#basic_info_address').val(response.address);
            // $('#basic_info_phone').val(response.phone);
            // $("#basic_info_gender").val(response.gender);
            // $('#patient_nationality').val(response.nationality);
            // $('#basic_info_email').val(response.email);
            // $('#basic_info_memo').val(response.memo);
            // $("#basic_info_mark").val(response.marking);
            // $("#basic_info_funnel").val(response.funnel);
            // $("#basic_info_funnel_etc").val(response.funnel_etc);
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


function reception_edit(id = null) {

    $('#selected_reception_id').val();

    $('#edit_reception_depart option:eq(0)').prop("selected", true);
    
    $('#edit_reception_title').empty();
    $('#edit_reception_title').append(new Option('---------', ''));
    $('#reception_edit_need_medical_report').prop('checked', false);
    if (id == null) {
        alert(gettext('Abnormal approach'));
        return;
    }


    $.ajax({
        type: 'POST',
        url: '/receptionist/Edit_Reception/get/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': id,
        },
        dataType: 'Json',
        success: function (response) {

            $('#selected_reception_id').val(response['id']);

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });


    ////////////////////////////////////////////////
    $('#Edit_Status_EventModal').modal({ backdrop: 'static', keyboard: false });
    $("#Edit_Status_EventModal").scrollTop(0);
    $('#Edit_Status_EventModal').modal('show');

}

//Edit Status Save
function edit_status_save() {
    rec_id = $('#selected_reception_id').val();
    status = $('#edit_status option:selected').val();

    $.ajax({
        type: 'POST',
        url: '/receptionist/Edit_Profile_Status/save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': rec_id,
            'status': status,
        },
        dataType: 'Json',
        success: function (response) {
            alert(gettext('Saved.'));
            search_patient();
            $('#Edit_Status_EventModal').modal('hide');
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })

}