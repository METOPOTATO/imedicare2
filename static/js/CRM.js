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
    $("#date_end").val(moment().subtract(7, 'd').format('YYYY-MM-DD'));

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

    //문자 글자 고정
    //$("#sms_modal_content").keydown(function () {
    //    if ($(this).val().length > 67) {
    //        $(this).val($(this).val().substring(0, 67));
    //    }
    //})


    //전체 체크 박스
    $("#check_sms_all").change(function () {
        $(".customer_checkbox").prop("checked", $(this).prop("checked"));
    })


});

function check_checkbox() {

    var all_check = $(".customer_checkbox");
    var is_all_check = true;
    for (var i = 0; i < all_check.length; i++) {
        var is_check = $(all_check[i]).prop("checked");
        console.log(is_check)

        if (!is_check) {
            is_all_check = is_check
        }
    }
    console.log(is_all_check)

    $("#check_sms_all").prop("checked", is_all_check);


}


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


    $.ajax({
        type: 'POST',
        url: '/manage/customer_manage_get_patient_list/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'depart': depart,
            'category': category,
            'string': string,
            'start': start,
            'end': end,
            'page': page,
            'context_in_page': context_in_page,
        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_list_table > tbody ').empty();
            for (var i = 0; i < context_in_page; i++) {
                if (response.datas[i]) {
                    var str = "<tr style='cursor:pointer;' onclick='set_patient_data(this," +
                        parseInt(response.datas[i]['id']) +
                        ")'><td>" + response.datas[i]['id'] + "</td>";

                    if (response.datas[i]['has_unpaid']) {
                        str += "<td style=color:rgb(228,97,131);>";
                    } else {
                        str += "<td>";
                    }

                    str += "<input type='checkbox' class='customer_checkbox' id='" + response.datas[i]['id'] + "' />" + "</td>" +
                        "<td>" + response.datas[i]['chart'] + "</td>" +
                        "<td><span id='namekor_" + response.datas[i]['id'] + "'>" + response.datas[i]['name_kor'] + "</span><br/>" +
                        "<span id='nameeng_" + response.datas[i]['id'] + "'>" + response.datas[i]['name_eng'] + "</span></td>" +
                        "<td>" + response.datas[i]['date_of_birth'] + ' (' + response.datas[i]['gender'] + '/' + response.datas[i]['age'] + ")</td>" +
                        "<td id='phonenumber_" + response.datas[i]['id'] + "'>" + response.datas[i]['phonenumber'] + "</td>" +
                        "<td>" + response.datas[i]['date_registered'] + "</td>" +
                        "<td>" + response.datas[i]['memo'] + "</td>" +
                        "<td>" + response.datas[i]['visits'] + "</td>" +
                        "<td>" + numberWithCommas( response.datas[i]['paid_total'] ) + "</td>" +
                        "<td><a class='btn btn-default' onclick=sms_modal('" + response.datas[i]['id'] +"')>&nbsp;<i class='fa fa-2x fa-mobile'></i>&nbsp;</a></td></tr>";
                    //"<td><a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='delete_database_precedure(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-history'></i></a></td></tr>";

                    
                } else {
                    var str = "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
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


            $(".customer_checkbox").off('change');
            $(".customer_checkbox").change(function () {
                check_checkbox();
            });


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
            $('#basic_info_passport').val(response.passport);
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
function sms_modal(patient_id) {
    $("#sms_modal_name").val('');
    $("#sms_modal_phone").val('');
    $("#sms_modal_content").val('');

    
    number_list = [];
    var name = '';
    var phone = '';
    var checked = $(".customer_checkbox:checked");

    if (patient_id != undefined) {
        var checked = $(".customer_checkbox[id=" + patient_id + "]");

        name = $("#namekor_" + $(checked[0]).attr('id')).html() + ' / ' + $("#nameeng_" + $(checked[0]).attr('id')).html();
        phone = $("#phonenumber_" + $(checked[0]).attr('id')).html();
        number_list.push($("#phonenumber_" + $(checked[0]).attr('id')).html());
    } else if (checked.length == 1) {
        name = $("#namekor_" + $(checked[0]).attr('id')).html() + ' / ' + $("#nameeng_" + $(checked[0]).attr('id')).html();
        phone = $("#phonenumber_" + $(checked[0]).attr('id')).html();
        number_list.push($("#phonenumber_" + $(checked[0]).attr('id')).html());
    } else if (checked.length > 1) {
        var name = $("#namekor_" + $(checked[0]).attr('id')).html() + gettext(' 님 외 ') + (checked.length - 1) + '명';
        for (var i = 0; i < checked.length; i++) {
            phone += $("#phonenumber_" + $(checked).eq(i).attr('id')).html() + ','
            number_list.push($("#phonenumber_" + $(checked).eq(i).attr('id')).html());
        }
    } else {
        alert(gettext('Select customer(s) to be sent'))
        return;
    }





    $('#sms_modal_name').val(name);
    $('#sms_modal_phone').val(phone);

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



function show_past_history(reception_id = null) {
    if (reception_id == null) {
        return;
    }

    $('#past_diagnosis_showlarge_table tbody').empty();
    $.ajax({
        type: 'POST',
        url: '/manage/customer_manage_get_patient_visit_history/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': reception_id,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                var str = "<tr style='background:#94ee90'><td colspan='5'>" + response['date'] + "(" + response.data['day'] + ")[" + response.data['doctor'] + "]</td>" +
                    "</td></tr>" + /*"<tr><td colspan='5'>History: D-" + response.data['diagnosis']  + */

                    "<tr><td colspan='5'><font style='font-weight:700;'>History:</font><br/><font style='font-weight:700; color:#d2322d'>S - </font>" + response.data['subjective'] + "<br/><font style='font-weight:700; color:#d2322d'>O - </font>" +
                    response.data['objective'] + "<br/><font style='font-weight:700; color:#d2322d'>A - </font>" +
                    response.data['assessment'] + "<br/><font style='font-weight:700; color:#d2322d'>P - </font>" +
                    response.data['plan'] + "<br/><font style='font-weight:700; color:#d2322d'>D - </font>" +
                    response.data['diagnosis'] +
                    "</td></tr>";


                for (var j in response.data['exams']) {
                    str += "<tr><td>" + response.data['exams'][j]['name'] + "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td></tr>";
                }

                for (var j in response.data['tests']) {
                    str += "<tr><td>" + response.data['tests'][j]['name'] + "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td></tr>";
                }
                for (var j in response.data['precedures']) {
                    str += "<tr><td>" + response.data['precedures'][j]['name'] + "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td></tr >";
                }
                for (var j in response.data['medicines']) {
                    str += "<tr><td>" + response.data['medicines'][j]['name'] + "</td><td>" +
                        response.data['medicines'][j]['unit'] + "</td><td>" +
                        response.data['medicines'][j]['amount'] + "</td><td>" +
                        response.data['medicines'][j]['days'] + "</td><td>" +
                        response.data['medicines'][j]['memo'] + "</td></tr >";
                }
            } else {
                str = 'Noresult';
            }

            $('#past_diagnosis_showlarge_table tbody').append(str);
            
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })



    $('#past_diagnosis_showlarge_modal').modal({ backdrop: 'static', keyboard: false });
    $('#past_diagnosis_showlarge_modal').modal('show');

}


function save_information() {
    console.log('==============')
    if (!patient_check_required()) {
        return;
    }

    $("#patient_id").val();

    var patient_id = $('#patient_id').val();
    var basic_info_name_kor = $('#basic_info_name_kor').val();
    var basic_info_name_eng = $('#basic_info_name_eng').val();
    var basic_info_dob = $('#basic_info_dob').val();
    if ($("#language").val() == 'vi') {
        basic_info_dob = moment(basic_info_dob, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
    var basic_info_address = $('#basic_info_address').val();
    var basic_info_phone = $('#basic_info_phone').val();
    var basic_info_gender = $("#basic_info_gender").val();
    var patient_nationality = $('#patient_nationality').val();
    var basic_info_email = $('#basic_info_email').val();
    var basic_info_passport = $('#basic_info_passport').val();
    var basic_info_memo = $('#basic_info_memo').val();
    var basic_info_mark = $('#basic_info_mark').val();
    var basic_info_funnel = $('#basic_info_funnel').val();
    var basic_info_funnel_etc = $('#basic_info_funnel_etc').val();



    $.ajax({
        type: 'POST',
        url: '/manage/customer_manage_get_patient_save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'patient_id': patient_id,
            'basic_info_name_kor': basic_info_name_kor,
            'basic_info_name_eng': basic_info_name_eng,
            'basic_info_dob': basic_info_dob,
            'basic_info_address': basic_info_address,
            'basic_info_phone': basic_info_phone,
            'basic_info_gender': basic_info_gender,
            'patient_nationality': patient_nationality,
            'basic_info_email': basic_info_email,
            'basic_info_passport':basic_info_passport,
            'basic_info_memo': basic_info_memo,
            'basic_info_mark': basic_info_mark,
            'basic_info_funnel': basic_info_funnel,
            'basic_info_funnel_etc': basic_info_funnel_etc,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result == true ) {
                alert(gettext('Saved'));
            } else {
                alert(gettext('Error'));
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })


}



function excel_download() {

    var depart =  $("#control_depart").val();
    var string = $('#patient_search').val();    
    var start = $("#date_start").val();
    var end = $("#date_end").val();
    var url = '/manage/cumstomer_management_excel?'
    url += 'depart=' + depart + '&';
    url += 'start=' + start + '&';
    url += 'end=' + end + '&';

    window.open(url);
}


function patient_check_required() {
    var $t, t;
    var fields = [$('#basic_info_name_kor'),
        $('#basic_info_name_eng'),
        $('#basic_info_dob'),
        $('#basic_info_address'),
        $('#basic_info_phone'),
        $('#basic_info_email'),
    ]

    if ($('#basic_info_gender').val() == '') {
        alert(gettext("'Gender' is necessary."));
        return false;
    }
    if ($('#patient_nationality').val() == '') {
        alert(gettext("'Nationality' is necessary."));
        return false;
    }

    var result = true;
    $.each(fields, function () {
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


function get_vaccine_history_list(patient_id) {



    //환자 방문 이력
    $.ajax({
        type: 'POST',
        url: '/manage/get_vaccine_history_list/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,
        },
        dataType: 'Json',
        success: function (response) {
            $("#vaccine_history_table tbody").empty();
            console.log(response.list_history)
            for (var i = 0; i < response.list_history.length; i++) {

                var str = "<tr><td>" + parseInt(i + 1) + "</td>" +

                    "<td>" + response.list_history[i]['vaccine_name'] + "</td>" +
                    "<td>" + response.list_history[i]['round'] + "</td>" +
                    "<td>" + response.list_history[i]['vaccine_date'] + "</td>" +

                    "<td>" +
                    "<a class='btn btn-default btn-xs' style='margin-right:5px;' href='javascript: void (0);' onclick='vaccine_history_modal(" + response.list_history[i].id + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                    "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='vaccine_history_delete(" + response.list_history[i].id + ")' ><i class='fa fa-lg fa-trash'></i></a>" +

                    '</td></tr > ';

                $('#vaccine_history_table tbody').append(str);
                
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })


}

function vaccine_history_modal(id = '') {

    $("#selected_vaccine_history").val('');
    $("#vaccine_name").val('');
    $("#medicine_name").val('');
    $("#round").val('');
    $("#vaccine_date").val('');
    $("#hospotal").val('');
    $("#memo").val('');


    if (id != '') {
        $.ajax({
            type: 'POST',
            url: '/manage/get_vaccine_history/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'id': id,
            },
            dataType: 'Json',
            success: function (response) {

                $("#selected_vaccine_history").val(id);
                $("#vaccine_name").val(response.vaccine_name);
                $("#medicine_name").val(response.medicine_name);
                $("#round").val(response.round);
                $("#vaccine_date").val(response.vaccine_date);
                $("#hospotal").val(response.vaccine_hospital);
                $("#memo").val(response.memo);

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    }

    

    $('#vaccine_history_modal').modal({ backdrop: 'static', keyboard: false });
    $('#vaccine_history_modal').modal('show');
}

function vaccine_history_save() {

    var id = $("#selected_vaccine_history").val();
    var patient_id = $("#patient_id").val();
    var vaccine_name = $("#vaccine_name").val();
    var medicine_name = $("#medicine_name").val();
    var hospotal = $("#hospotal").val();
    var round = $("#round").val();
    var vaccine_date = $("#vaccine_date").val();
    var memo = $("#memo").val();


    if (selected_vaccine_history != '') {
        $.ajax({
            type: 'POST',
            url: '/manage/vaccine_history_save/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'id': id,
                'patient_id': patient_id,
                'vaccine_name': vaccine_name,
                'medicine_name': medicine_name,
                'hospotal': hospotal,
                'round': round,
                'vaccine_date': vaccine_date,
                'memo': memo,
            },
            dataType: 'Json',
            success: function (response) {
                alert(gettext('Saved.'))

                get_vaccine_history_list(patient_id)

                $('#vaccine_history_modal').modal('hide');

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    }
}


function vaccine_history_delete(id) {

    if (confirm(gettext('Do you want to delete?'))) {
        var patient_id = $("#patient_id").val();
        $.ajax({
            type: 'POST',
            url: '/manage/vaccine_history_delete/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'id': id,
            },
            dataType: 'Json',
            success: function (response) {
                alert(gettext('Deleted.'))

                get_vaccine_history_list(patient_id)


            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    }

}