jQuery.browser = {};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
$(function () {

    $(".date_input").daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        drops: "down",
        locale: {
            format: "YYYY-MM-DD",
        },
    });





    search_payment_debit();
    //search_doctor_profit();
    //search_medicine();
    $('.contents_filter_wrap select, .date_input,#is_vaccine,#is_red_invoice').change(function () {
        search_payment_debit();
    })

    function split(val) {
        return val.split(/,\s*/);
    }
    function extractLast(term) {
        return split(term).pop();
    }
    $('#patient_search_input').change(function () {
        var term = extractLast(this.value);
        if (term.length >= 2 || term.length == 0) {
            search_payment_debit();
        }
        
    })

    $('.doctor_profit_control').keyup(function () {
        var regex = /[^0-9]/g;
        var profit = $(this).val();
        profit = profit.replace(regex, '');
        $(this).val(profit);
        if (profit != '') {
            if (profit > 100) {
                profit = 100
                $(this).val(profit);
            }
            set_profit_total();
        }

    });


    $('#payment_search_doctor').empty();
    $('#payment_search_doctor').append(new Option('---------', ''));

    $('#doctors_search_doctor').empty();
    $('#doctors_search_doctor').append(new Option('---------', ''));


    $("#payment_search_depart").change(function () {
        get_doctor($("#payment_search_depart"));
    })

    $("#doctors_search_depart").change(function () {
        get_doctor($("#doctors_search_depart"));
    })
});



function get_doctor(part, depart = null) {
    var part_id = part.attr('id');
    var doctor;
    if (part_id == 'payment_search_depart') {
        doctor = $('#payment_search_doctor');
    } else if (part_id == 'doctors_search_depart') {
        doctor = $('#doctors_search_doctor');
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
            for (var i in response.datas)
                doctor.append("<option value='" + response.datas[i] + "'>" + i + "</Option>");

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function search_payment_debit(page = null) {

    var page_context = $("#contents_filter_context_count").val();
    var is_vaccine = $("#is_vaccine").prop("checked");

    if (is_vaccine == undefined)
        is_vaccine = false

    if (page == null) {
        page = 1;
    }

    $.ajax({
        type: 'POST',
        url: '/manage/search_payment_debit/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'page_context': page_context,

            'date_type': $("#contents_filter_date_type").val(),

            'start': $("#payment_search_date_start").val(),
            'end': $("#payment_search_date_end").val(),

            'depart': $('#contents_filter_depart').val(),
            'doctor': $('#contents_filter_doctor').val(),
			
			//11-02 추가
            'is_red_invoice':$("#is_red_invoice").prop("checked"),
            //'general': $('#payment_search_general option:selected').val(),
            //'medicine': $('#payment_search_medicine option:selected').val(),
            //'lab': $('#payment_search_lab option:selected').val(),

            'payment_method': $('#contents_filter_payment_method').val(),
            'payment_status': $('#contents_filter_payment_status').val(),

            'patient_type': $("#patient_search_select").val(),
            'patient_search': $("#patient_search_input").val(),

            'is_vaccine': is_vaccine,

            'page': page, 
        },
        dataType: 'Json',
        success: function (response) {
            $('#payment_table_result').empty();

            var str = '';
            for (var i = 0; i < page_context; i++) {//response.datas) {
                if (response.datas[i]) {
                    str += '<tr>';
                    str += '<td>' + response.datas[i]['no'] + '</td>' +
                        '<td>' + response.datas[i]['date'] + '</td>' +
                        '<td>' + response.datas[i]['depart'] + '</td>' +
                        '<td>' + response.datas[i]['Patient'] + '</td>' +
                        // '<td>' + response.datas[i]['chart'] + '</td>' +
                        '<td>' + response.datas[i]['Doctor_kor'] + '<br/>' + response.datas[i]['Doctor_eng'] + '</td>' +                     
                        '<td>' + response.datas[i]['phone'] + '</td>' +
                        '<td>' + response.datas[i]['precedure'] + '</td>';

                    str += '</td><td>' + numberWithCommas(response.datas[i]['sub_total']) +
                        '</td><td>' + numberWithCommas(response.datas[i]['discounted_amount']) +
                        '</td><td>' + numberWithCommas(response.datas[i]['total']) +
                        '</td>';

                    // str += '</td><td>' + (response.datas[i]['payment_record_date_1']) +
                    //     '</td><td>' + numberWithCommas(response.datas[i]['payment_record_paid_1']) +
                    //     '</td><td>' + (response.datas[i]['payment_record_date_2']) +
                    //     '</td><td>' + numberWithCommas(response.datas[i]['payment_record_paid_2']) +
                    //     '</td><td>' + (response.datas[i]['payment_record_date_3']) +     
                    //     '</td><td>' + numberWithCommas(response.datas[i]['payment_record_paid_3']) +
                    //     '</td><td>' + (response.datas[i]['payment_record_date_4']) +
                    //     '</td><td>' + numberWithCommas(response.datas[i]['payment_record_paid_4']) +
                    //     '</td><td>' + (response.datas[i]['payment_record_date_5']) +     
                    //     '</td><td>' + numberWithCommas(response.datas[i]['payment_record_paid_5']) +                                          
                    //     '</td><td'; 
                        
                    if (response.datas[i]['payment_record_date_1'] == 0) {
                        str += "<td> - </td>" + "<td> - </td>";
                    } else {
                        str += '<td>' + (response.datas[i]['payment_record_date_1']) + '</td>' + 
                        '<td>' + numberWithCommas(response.datas[i]['payment_record_paid_1']) + '</td>';
                    }

                    if (response.datas[i]['payment_record_date_2'] == 0) {
                        str += "<td> - </td>" + "<td> - </td>";
                    } else {
                        str += '<td>' + (response.datas[i]['payment_record_date_2']) + '</td>' + 
                        '<td>' + numberWithCommas(response.datas[i]['payment_record_paid_2']) + '</td>';
                    }
                    
                    if (response.datas[i]['payment_record_date_3'] == 0) {
                        str += "<td> - </td>" + "<td> - </td>";
                    } else {
                        str += '<td>' + (response.datas[i]['payment_record_date_3']) + '</td>' + 
                        '<td>' + numberWithCommas(response.datas[i]['payment_record_paid_3']) + '</td>';
                    }

                    if (response.datas[i]['payment_record_date_4'] == 0) {
                        str += "<td> - </td>" + "<td> - </td>";
                    } else {
                        str += '<td>' + (response.datas[i]['payment_record_date_4']) + '</td>' + 
                        '<td>' + numberWithCommas(response.datas[i]['payment_record_paid_4']) + '</td>';
                    }

                    if (response.datas[i]['payment_record_date_5'] == 0) {
                        str += "<td> - </td>" + "<td> - </td>";
                    } else {
                        str += '<td>' + (response.datas[i]['payment_record_date_5']) + '</td>' + 
                        '<td>' + numberWithCommas(response.datas[i]['payment_record_paid_5']) + '</td>';
                    }               

                    if (response.datas[i]['payment_record_unpaid'] == 0) {
                        str += "<td> - </td>";
                    } else {
                        str += '<td' + " style='color:red;'>" + numberWithCommas(response.datas[i]['payment_record_unpaid']) + '</td>';
                    }

                    str += "</tr>';"

                } else {
                    str += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'
                    // str += '<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'

                }
            }
            $('#payment_table_result').append(str);

            $("#payment_sub_total_total").html(numberWithCommas(response.payment_total_subtotal));
            $("#payment_total_discount").html(numberWithCommas(response.payment_total_discount));
            $("#payment_total_total").html(numberWithCommas(response.payment_total_total));
            $("#payment_paid_1").html(numberWithCommas(response.payment_paid_1));
            $("#payment_paid_2").html(numberWithCommas(response.payment_paid_2));
            $("#payment_paid_3").html(numberWithCommas(response.payment_paid_3));
            $("#payment_paid_4").html(numberWithCommas(response.payment_paid_4));
            $("#payment_paid_5").html(numberWithCommas(response.payment_paid_5));
            $("#payment_total_unpaid").html(numberWithCommas(response.payment_total_unpaid));

            //페이징
            $('#payment_pagnation').html('');
            str = '';
            if (response.has_previous == true) {
                str += '<li> <a onclick="search_payment_debit(' + (response.page_number - 1) +')" style="cursor:pointer">&laquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&laquo;</span></li>';
            }

            for (var i = response.page_range_start; i < response.page_range_stop; i++) {
                if (response.page_number == i) {
                    str += '<li class="active"><span>' + i + ' <span class="sr-only" >(current)</span></span></li>';
                }
                else if (response.page_number + 5 > i && response.page_number - 5 < i) {
                    str += '<li> <a style="cursor:pointer" onclick="search_payment_debit(' + i + ')" >' + i + '</a></li>';
                }
                else {
                }

            }
            if (response.has_next == true) {
                str += '<li><a onclick="search_payment_debit(' + (response.page_number+1) + ')" style="cursor:pointer">&raquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&raquo;</span></li>';
            }
            $('#payment_pagnation').html(str);
            //그래프 연동
            //payment_set_graph(response.datas);

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}



function search_doctor_profit(page = null) {

    $.ajax({
        type: 'POST',
        url: '/manage/doctor_profit/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'start_end_date': $('#doctor_search_date').val(),
            'depart': $('#doctors_search_depart option:selected').val(),
            'doctor': $('#doctors_search_doctor option:selected').val(),
            'general': $('#doctor_search_general option:selected').val(),
            'medicine': $('#doctor_search_medicine option:selected').val(),
            'lab': $('#doctor_search_lab option:selected').val(),
            //'scaling': $('#doctor_search_scaling option:selected').val(),
            //'panorama': $('#doctor_search_panorama option:selected').val(),
            'page': page, 
        },
        dataType: 'Json',
        success: function (response) {
            $('#doctors_table_result').empty();

            for (var i = 0; i < 10; i++) {//response.datas) {
                var str = '<tr>'
                if (response.datas[i]) {
                    str += '<td style="vertical-align: middle;">' + response.datas[i]['no'] + '</td>' +
                        '<td style="vertical-align: middle;">' + response.datas[i]['date'] + '</td>' +
                        '<td style="vertical-align: middle;">' + response.datas[i]['patient_eng'] + '<br/>' +
                        response.datas[i]['Patient'] + ' (' +
                        response.datas[i]['date_of_birth'] +
                        ')</td>' +
                        '<td style="vertical-align: middle;">' + response.datas[i]['Depart'] + '</td>' +
                        '<td style="vertical-align: middle;">' + response.datas[i]['Doctor'] + '</td>';

                    // exam fee
                    str += '<td style="vertical-align: middle;">';
                    if (response.datas[i]['general'].length == 0) {
                        str += ' - ';
                    } else {
                        for (var j = 0; j < response.datas[i]['general'].length; j++) {
                            str += response.datas[i]['general'][j]['value'];
                            if (j != response.datas[i]['general'].length - 1) {
                                str += '<br/>';
                            }
                        }
                    }

                    str += '</td><td style="vertical-align: middle;">';
                    if (response.datas[i]['medi'].length == 0) {
                        str += ' - ';
                    } else {
                        for (var j = 0; j < response.datas[i]['medi'].length; j++) {
                            str += response.datas[i]['medi'][j]['value'];
                            if (j != response.datas[i]['medi'].length - 1) {
                                str += '<br/>';
                            }
                        }
                    }

                    str += '</td><td style="vertical-align: middle;">';
                    if (response.datas[i]['lab'].length == 0) {
                        str += ' - ';
                    } else {
                        for (var j = 0; j < response.datas[i]['lab'].length; j++) {
                            str += response.datas[i]['lab'][j]['value'];
                            if (j != response.datas[i]['lab'].length - 1) {
                                str += '<br/>';
                            }
                        }
                    }
                    str += '</td></tr>';

                }
                else {
                    str += "<td colspan='8'></td></tr>"
                }

                $('#doctors_table_result').append(str);
            }
            //총 계
            //$('#doctors_table_result').empty();

            $('#subtotal_general').html(numberWithCommas(response.amount_general) + ' VND');
            $('#subtotal_medicine').html(numberWithCommas(response.amount_medicine) + ' VND');
            $('#subtotal_lab').html(numberWithCommas(response.amount_lab) + ' VND');

            set_profit_total();


            //페이징
            $('#doctors_pagnation').html('');
            str = '';
            if (response.has_previous == true) {
                str += '<li> <a onclick="search_doctor_profit(' + (response.page_number - 1) + ') style="cursor:pointer;"">&laquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&laquo;</span></li>';
            }

            for (var i = response.page_range_start; i < response.page_range_stop; i++) {
                if (response.page_number == i) {
                    str += '<li class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
                }
                else if (response.page_number + 5 > i && response.page_number - 5 < i) {
                    str += '<li> <a onclick="search_doctor_profit(' + i + ')" style="cursor:pointer;">' + i + '</a></li>';
                }
                else {
                }

            }
            if (response.has_next == true) {
                str += '<li><a onclick="search_doctor_profit(' + (response.page_number + 1) + ')" style="cursor:pointer;">&raquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&raquo;</span></li>';
            }
            $('#doctors_pagnation').html(str);
            set_profit_total();


        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function set_profit_total() {
    var regex = /[^0-9]/g;




    var subtotal_general = $('#subtotal_general').html().replace(regex,'');
    var subtotal_medicine = $('#subtotal_medicine').html().replace(regex, '');
    var subtotal_lab = $('#subtotal_lab').html().replace(regex, '');
    //var subtotal_scaling = $('#subtotal_scaling').html().replace(regex, '');
    //var subtotal_panorama = $('#subtotal_panorama').html().replace(regex, '');

    var profit_general = $('#profit_general').val();
    var profit_medicine = $('#profit_medicine').val();
    var profit_lab = $('#profit_lab').val();
    //var profit_scaling = $('#profit_scaling').val();
    //var profit_panorama = $('#profit_panorama').val();

   
    var profit_total_general = subtotal_general * profit_general / 100;
    var profit_total_medicine = subtotal_medicine * profit_medicine / 100;
    var profit_total_lab = subtotal_lab * profit_lab / 100;
    //var profit_total_scaling = subtotal_scaling * profit_scaling / 100;
    //var profit_total_panorama = subtotal_panorama * profit_panorama / 100;




    $('#profit_total_general').html(numberWithCommas(profit_total_general) + ' VND');
    $('#profit_total_medicine').html(numberWithCommas(profit_total_medicine) + ' VND');
    $('#profit_total_lab').html(numberWithCommas(profit_total_lab) + ' VND');
    //$('#profit_total_scaling').html(numberWithCommas(profit_total_scaling) + ' VND');
    //$('#profit_total_panorama').html(numberWithCommas(profit_total_panorama) + ' VND');

    $('#profit_total_total').html(numberWithCommas(
        profit_total_general +
        profit_total_medicine +
        profit_total_lab) + ' VND');
        //profit_total_scaling +
        //profit_total_panorama) + ' VND');

}





function search_medicine(page = null) {
    var filter = $('#medicine_search_filter option:selected').val();
    var string = $('#medicine_search_input').val();
    var context_in_page = 10;
    
    $.ajax({
        type: 'POST',
        url: '/manage/search_medicine/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'start_end_date': $('#medicine_search_date').val(),
            'filter':filter,
            'string': string,
            'page': page, 
            'context_in_page': context_in_page,
        },
        dataType: 'Json',
        success: function (response) {
            var total_amount = 0;
            $('#medicine_table_result').empty();
            for (var i = 0; i < 10; i++) {//response.datas) {
                var str = "<tr>"
                if (response.datas[i]) {
                    str += "<td>" + response.datas[i][1]['id'] + "</td>" +
                        "<td>" + response.datas[i][1]['code'] + "</td>" +
                        "<td>" + response.datas[i][1]['name'] + "</td>" +
                        "<td>" + response.datas[i][1]['ingredient'] + "</td>" +
                        "<td>" + response.datas[i][1]['company'] + "</td>" +
                        "<td style='text-align:center;'>" + response.datas[i][1]['count'] + "</td>" +
                        "<td style='text-align:right;'>" + numberWithCommas(response.datas[i][1]['price']) + " VND</td>" +
                        "<td style='text-align:center;'>" + response.datas[i][1]['sales'] + "</td>" +
                        "<td style='text-align:right;'>" + numberWithCommas(response.datas[i][1]['total_salse']) + " VND</td></tr>";

                    total_amount += response.datas[i][1]['total_salse']
                } else {
                    str += "<td colspan='9'></td></tr>";
                    
                }
                $('#medicine_table_result').append(str);
                $('#medicine_table_total').html(numberWithCommas(total_amount) + ' VND');
            }
            //페이징
            $('#medicine_pagnation').html('');
            str = '';
            if (response.has_previous == true) {
                str += '<li> <a onclick="search_medicine(' + (response.page_number - 1) + ')">&laquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&laquo;</span></li>';
            }

            for (var i = response.page_range_start; i < response.page_range_stop; i++) {
                if (response.page_number == i) {
                    str += '<li class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
                }
                else if (response.page_number + 5 > i && response.page_number -5  < i) {
                    str += '<li> <a onclick="search_medicine(' + i + ')">' + i + '</a></li>';
                }
                else {
                }
            }
            if (response.has_next == true) {
                str += '<li><a onclick="search_medicine(' + (response.page_number + 1) + ')">&raquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&raquo;</span></li>';
            }
            $('#medicine_pagnation').html(str);
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}


function excel_download() {

    var date_start = $("#payment_search_date_start").val();
    var date_end = $("#payment_search_date_end").val();

    var depart = $("#contents_filter_depart").val();
    var doctor = $("#contents_filter_doctor").val();

    var payment_method = $("#contents_filter_payment_method").val();
    var payment_status = $("#contents_filter_payment_status").val();

    var patient_type = $("#patient_search_select").val();
    var patient_search = $("#patient_search_input").val();

    var is_vaccine = $("#is_vaccine").prop("checked");

    if (is_vaccine == undefined)
        is_vaccine = false




    var url = '/manage/audit_excel?'
    url += 'date_start=' + date_start + '&';
    url += 'date_end=' + date_end + '&';
    url += 'depart=' + depart + '&';
    url += 'doctor=' + doctor + '&';
    url += 'payment_method=' + payment_method + '&';
    url += 'payment_status=' + payment_status + '&';
    url += 'patient_type=' + patient_type + '&';
    url += 'patient_search=' + patient_search + '&';
    url += 'is_vaccine=' + is_vaccine + '&';

    window.open(url);
}


function excel_download_debit() {

    var date_start = $("#payment_search_date_start").val();
    var date_end = $("#payment_search_date_end").val();

    var url = '/manage/debit_report_excel?'
    url += 'date_start=' + date_start + '&';
    url += 'date_end=' + date_end + '&';

    window.open(url);
}

