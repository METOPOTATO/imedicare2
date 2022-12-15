

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

    $('.date_input, #contents_filter_depart,#is_vaccine').change(function () {
        database_search();
    })

    function split(val) {
        return val.split(/,\s*/);
    }
    function extractLast(term) {
        return split(term).pop();
    }    

    $("#patient_search_input").change(function () {
        var term = extractLast(this.value);
        if (term.length >= 2 || term.length == 0) {
            database_search();
        }
        
    })
    database_search();

    
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



function database_search(page = null) {
    var context_in_page = 30;
    if (page == null) page = 1;

    var type = $("#revenue_search_type").val();

    var start = $("#date_start").val();
    var end = $("#date_end").val();
    var depart = $("#contents_filter_depart").val();
    var is_vaccine = $("#is_vaccine").prop("checked");
    var patient_search = $("#patient_search_input").val();
    var patient_type = $("#patient_search_select").val();

    if (is_vaccine == undefined)
        is_vaccine = false

    $('#statistics_table_body').empty();
    $.ajax({
        type: 'POST',
        url: '/manage/statistics/search_pkg/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'type': type,
            'start': start,
            'end': end,
            'depart': depart,
            'is_vaccine': is_vaccine,
            'patient_type': patient_type,
            'patient_search': patient_search,
            'page': page,
            'context_in_page': context_in_page,
        },
        dataType: 'Json',
        success: function (response) {
        for (var i = 0; i < response.datas.length; i++) {
            var str = "";

            if (response.datas[i]) {

                str = "<tr>" +
                "<td>" + response.datas[i]['id'] + "</td>" +
                "<td>" + response.datas[i]['code'] + "</td>" +
                "<td>" + response.datas[i]['name'] + "</td>" +
                "<td>" + response.datas[i]['gender'] + "</td>" +
                "<td>" + ' ' + "</td>" +
                "<td>" + response.datas[i]['phone'] + "</td>" +
                "<td>" + response.datas[i]['date_bought'] + "</td>" +
                "<td>" + response.datas[i]['pkg_name'] + "</td>" +
                "<td>" + response.datas[i]['count'] + "</td>" +
                "<td><a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='patient_package_history_modal(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-search'></i></a></td>" +                
                "<td>" + numberWithCommas(response.datas[i]['price']) + "</td>" +
                "<td>" + response.datas[i]['memo'] + "</td></tr>"
            }
            $('#statistics_table_body').append(str);
        }


        $(".total_div span:nth-child(2)").html(numberWithCommas(response.total_revenue))

        $('#package_pagnation').html('');
        str = '';
        if (response.has_previous == true) {
            str += '<li style="cursor: pointer;"> <a onclick="database_search(' + (response.page_number - 1) + ')">&laquo;</a></li>';
        } else {
            str += '<li class="disabled"><span>&laquo;</span></li>';
        }

        for (var i = response.page_range_start; i < response.page_range_stop; i++) {
            if (response.page_number == i) {
                str += '<li class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
            }
            else if (response.page_number + 5 > i && response.page_number - 5 < i) {
                str += '<li style="cursor: pointer;"> <a onclick="database_search(' + i + ')">' + i + '</a></li>';
            }
            else {
            }

        }
        if (response.has_next == true) {
            str += '<li style="cursor: pointer;"><a onclick="database_search(' + (response.page_number + 1) + ')">&raquo;</a></li>';
        } else {
            str += '<li class="disabled"><span>&raquo;</span></li>';
        }
        $('#package_pagnation').html(str);            

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}



function database_search_medicine(page = null) {

   

    var start = $("#date_start").val();
    var end = $("#date_end").val();
    var depart = $("#contents_filter_depart").val();

    $('#statistics_table_body').empty();
    $.ajax({
        type: 'POST',
        url: '/manage/statistics/search_pkg/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'type': 'MEDICINE',

            'start': start,
            'end': end,
            'depart': depart,
        },
        dataType: 'Json',
        success: function (response) {
            

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

    var url = '/manage/test_statistics_excel?'
    url += 'start_date=' + start_date + '&';
    url += 'end_date=' + end_date + '&';
    url += 'depart=' + contents_filter_depart + '&';

    window.open(url);
}


function patient_package_history_modal(id = null) {
    if (id == null) { return;}

    $.ajax({
        type: 'POST',
        url: '/receptionist/patient_package_history_modal/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id':id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_package_history_list > tbody ').empty();
            for (var i = 0; i < response.datas.length; i++) {
                    var str = "<tr>"

                    str += " <td>" + (i + 1) + "</td>" +
                        "<td>" + response.datas[i]['patient_name'] + "</td>" +
                        "<td>" + response.datas[i]['precedure_name'] + "</td>" +
                        "<td>" + response.datas[i]['round'] + "</td>" +
                        "<td>" + response.datas[i]['date_bought'] + "</td>" +
                        "<td>" + response.datas[i]['date_used'] + "</td>" +
                        "</tr>";

                $('#patient_package_history_list > tbody').append(str);

            }
            $('#patient_package_history_modal').modal({ backdrop: 'static', keyboard: false });
            $('#patient_package_history_modal').modal('show');
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })


}