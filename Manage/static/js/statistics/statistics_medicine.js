

jQuery.browser = {};
$(function () {



    //inventory history
    $('.date_input').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    $("#date_start").val(moment().subtract(7, 'd').format('YYYY-MM-DD'));

    $('.date_input, #contents_filter_depart,#is_vaccine,#contents_filter_div_doctor').change(function () {
        database_search();
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
            database_search();
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

    database_search();

    
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}


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

function database_search(page = null) {

    var type = $("#revenue_search_type").val();

    var start = $("#date_start").val();
    var end = $("#date_end").val();
    var depart = $("#contents_filter_depart").val();
    var is_vaccine = $("#is_vaccine").prop("checked");

    if (is_vaccine == undefined)
        is_vaccine = false

    $('#statistics_table_body').empty();
    $.ajax({
        type: 'POST',
        url: '/manage/statistics/search_medicine/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'type': type,
            'doctor': $('#contents_filter_doctor').val(),
            'start': start,
            'end': end,
            'depart': depart,
            'patient_type': $("#patient_search_select").val(),
            'patient_search': $("#patient_search_input").val(),
            'is_vaccine': is_vaccine,

        },
        dataType: 'Json',
        success: function (response) {
                for (var i = 0; i < response.datas.length; i++) {
                    var str = "";

                    if (response.datas[i]) {

                        str = "<tr>" +
                            "<td>" + response.datas[i]['no'] + "</td>" +
                            "<td>" + response.datas[i]['id'] + "</td>" +
                            "<td>" + response.datas[i]['date'] + "</td>" +
                            "<td>" + response.datas[i]['patient_name'] + "</td>" +
                            "<td>" + response.datas[i]['depart'] + "</td>" +
                            "<td>" + response.datas[i]['doctor'] + "</td>" +
                            "<td>" + response.datas[i]['class'] + "</td>" +
                            "<td>" + response.datas[i]['service_code']+ "</td>" +
                            "<td>" + response.datas[i]['item_name']  + " / "+response.datas[i]['item_name_vi']+ "</td>" +
                            "<td>" + response.datas[i]['unit'] + "</td>" +
                            "<td>" + response.datas[i]['quantity'] + "</td>" +
                            "<td>" + numberWithCommas(response.datas[i]['price']) + "</td>" +
                            "<td>" + numberWithCommas(response.datas[i]['price_sum']) + "</td></tr>"

                    }
                    $('#statistics_table_body').append(str);
                }


                $(".total_div span:nth-child(2)").html(numberWithCommas(response.total_revenue))

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}


function excel_download() {


    var start_date = $("#date_start").val();
    var end_date = $("#date_end").val();

    var contents_filter_depart = $("#contents_filter_depart").val();
    var contents_filter_doctor = $('#contents_filter_doctor').val();

    var contents_filter_depart = $("#contents_filter_depart").val();
    var contents_filter_doctor = $('#contents_filter_doctor').val();
    patient_type = $("#patient_search_select").val()
    patient_search = $("#patient_search_input").val()
    var is_vaccine = $("#is_vaccine").prop("checked");

    var url = '/manage/medicine_statistics_excel?'
    url += 'start_date=' + start_date + '&';
    url += 'end_date=' + end_date + '&';
    url += 'depart=' + contents_filter_depart + '&';
    url += 'doctor=' + contents_filter_doctor + '&';
    url += 'patient_type=' + patient_type + '&';
    url += 'patient_search=' + patient_search + '&';
    url += 'is_vaccine=' + is_vaccine + '&';

    window.open(url);
}

