﻿jQuery.browser = {};
$(function () {

    $('.database_control input[type=text],input[type=number]').each(function () {
        //this.className += 'form-control';

    })

    $('#pharmacy_list_calendar').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    worker_on(true);
    $('#pharmacy_list_calendar').on('apply.daterangepicker', function () {
        today = moment().format('YYYY[-]MM[-]DD');

        date = $('#pharmacy_list_calendar').val();
        if (date == today) {
            worker_on(true);
        } else {
            worker_on(false);
        }
    });

    $('#medicine_new').click(function () {
        $('#selected_option').val('new');
        $('.database_control input[type=text],input[type=number]').each(function () {
            $(this).val('');
        })
    })


});

function save_data_control() {
    if ($('#selected_option').val() == '') {
        alert("select 'new' or medicine");
        return;
    }
    if (isNaN($('#id_changes').val()) == true) {
        alert('changes should be number');
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/pharmacy/save_data_control/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'selected_option': $('#selected_option').val(),
            'name':$('#id_name').val(),
            'price': $('#id_price').val(),
            'company':$('#id_company').val(),
            'ingredient':$('#id_ingredient').val(),
            'unit': $('#id_unit').val(),
            'changes': $('#id_changes').val(),
        },
        dataType: 'Json',
        success: function (response) {
            alert('saved');
            $('.database_control input').each(function () {
                $(this).val('');
            })
        },
        error: function (request, status, error) {
            alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function set_data_control(medicine_id) {
    $('#selected_option').val(medicine_id);

    $.ajax({
        type: 'POST',
        url: '/pharmacy/set_data_control/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'medicine_id': medicine_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#id_name').val(response.name);
            $('#id_price').val(response.price);
            $('#id_company').val(response.company);
            $('#id_ingredient').val(response.ingredient);
            $('#id_unit').val(response.unit);


        },
        error: function (request, status, error) {
            alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function pharmacy_control_save(Done = false) {
    var diagnosis_id = $('#selected_diagnosis').val();
    if (diagnosis_id.trim() == '') {
        alert('환자 먼저 선택');
        return;
    }
    if ($('#selected_diagnosis_status').val() == 'done') {
        alert('Already done');
        return;
    }

    if (Done)
        status = 'done';
    else
        status = 'hold';

    $.ajax({
        type: 'POST',
        url: '/pharmacy/save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'status': status,
            'diagnosis_id': diagnosis_id,
        },
        dataType: 'Json',
        success: function (response) {
            alert("저장 되었습니다.");
        },
        error: function (request, status, error) {
            alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function waiting_selected(diagnosis_id) {
    $.ajax({
        type: 'POST',
        url: '/pharmacy/waiting_selected/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'diagnosis_id': diagnosis_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#selected_diagnosis').val(diagnosis_id);
            $('#selected_diagnosis_status').val(response.status);
            $('#pharmacy_contents_table > tbody ').empty();
            for (var i in response.datas) {
                var str = "<tr><td>" + response.datas[i]['code'] + "</td>" +
                    "<td>" + response.datas[i]['name'] + "</td>" +
                    "<td>" + response.datas[i]['depart'] + "</td>" + 
                    "<td>" + response.datas[i]['doctor'] + "</td>" + 
                    "<td>" + response.datas[i]['volume'] + "</td>" +
                    "<td>" + response.datas[i]['amount'] + "</td>" + 
                    "<td>" + response.datas[i]['days'] + "</td>" + 
                    "<td>" + response.datas[i]['total'] + "</td>" + 
                    "<td>" + response.datas[i]['memo'] + "</td>" + 
                    "<td>" + "-" + "</td></tr>";

                $('#pharmacy_contents_table').append(str);
            }
        },
        error: function (request, status, error) {
            alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function waiting_list(Today = false) {
    var date, start, end;

    if (Today) {
        var dt = new Date();

        var recentYear = dt.getFullYear();
        var recentMonth = dt.getMonth() + 1;
        var recentDay = dt.getDate();

        if (recentMonth < 10) recentMonth = "0" + recentMonth;
        if (recentDay < 10) recentDay = "0" + recentDay;

        date = recentYear + "-" + recentMonth + "-" + recentDay;
        //date = date + ' - ' + date; 
        $('#pharmacy_list_calendar').val(date);
    } else {
        date = $('#pharmacy_list_calendar').val();
    }
    start = date.split(' - ')[0];
    end = date.split(' - ')[1];

   
    $.ajax({
        type: 'POST',
        url: '/pharmacy/waiting_list/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'start_date': start,
            'end_date': end,
            //'string':string,
            //'filter':filter,
        },
        dataType: 'Json',
        success: function(response) {
            $('#pharmacy_list_table > tbody ').empty();
            for (var i = 0; i < response.datas.length; i++) {
                var tr_class = "";
                if (response.datas[i]['status'] == 'new')
                    tr_class = "class ='success'"
                else if (response.datas[i]['status'] == 'hold')
                    tr_class = "class ='warning'"
                else if (response.datas[i]['status'] == 'done')
                    tr_class = "class ='danger'"

                var str = "<tr " + tr_class + " onclick='waiting_selected(" + response.datas[i]['diagnosis_id'] + ")'>" + 
                    "<td>" + Number(i + 1) + "</td>" +
                    "<td>" + response.datas[i]['chart'] + "</td>" +
                    "<td>" + response.datas[i]['Name'] + "</td>" +
                    "<td>" + response.datas[i]['Date_of_Birth'] + "</td>" +
                    "<td>" + response.datas[i]['Depart'] +"</td></tr>";

                $('#pharmacy_list_table').append(str);
            }
        },
        error: function(request, status, error) {
            alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function pharmacy_database_search(page = null) {
    var context_in_page = 10;

    var string = $('#medicine_search_input').val();
    var filter = $('#medicine_search_select').val();
    
    $('#pharmacy_database_table > tbody ').empty();
    $.ajax({
        type: 'POST',
        url: '/pharmacy/medicine_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'string':string,
            'filter': filter,
            'page': page,
            'context_in_page': context_in_page,
        },
        dataType: 'Json',
        success: function (response) {
            for (var i = 0; i < context_in_page; i++) {
                if (response.datas[i]) {

                    var str = "<tr style='cursor: pointer; height:4vh;' onclick='set_data_control(" + response.datas[i]['id'] + ")'><td>" + response.datas[i]['id'] + "</td>" +
                        "<td>" + response.datas[i]['name'] + "</td>" +
                        "<td>" + response.datas[i]['company'] + "</td>" +
                        "<td>" + response.datas[i]['country'] + "</td>" +
                        "<td>" + response.datas[i]['ingredient'] + "</td>" +
                        "<td>" + response.datas[i]['unit'] + "</td>" +
                        "<td style='text-align:right'>" + response.datas[i]['price'] + "</td>" +
                        "<td style='text-align:center'>" + response.datas[i]['count'] + "</td></tr>"

                } else {
                    var str = "<tr style='height:4vh;'><td colspan='8'> </td></tr>";
                }
                $('#pharmacy_database_table > tbody').append(str);
            }


            //페이징
            $('#medicine_pagnation').html('');
            str = '';
            if (response.has_previous == true) {
                str += '<li> <a onclick="pharmacy_database_search(' + (response.page_number - 1) + ')">&laquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&laquo;</span></li>';
            }

            for (var i = response.page_range_start; i < response.page_range_stop; i++) {
                if (response.page_number == i) {
                    str += '<li class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
                }
                else if (response.page_number + 5 > i && response.page_number - 5 < i) {
                    str += '<li> <a onclick="pharmacy_database_search(' + i + ')">' + i + '</a></li>';
                }
                else {
                }

            }
            if (response.has_next == true) {
                str += '<li><a onclick="pharmacy_database_search(' + (response.page_number + 1) + ')">&raquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&raquo;</span></li>';
            }
            $('#medicine_pagnation').html(str);

        },
        error: function(request, status, error) {
            alert("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function worker_on(path) {
    if ($("input:checkbox[id='pharmacy_list_auto']").is(":checked") == true) {
        if (window.Worker) {
            w = new Worker(path);
            w.onmessage = function (event) {
                waiting_list(true);
            };

            $('#pharmacy_list_search').prop('disabled', true);
        } else {
        }
    } else {
        w.terminate();
        w = undefined;
        $('#pharmacy_list_search').prop('disabled', false);

    }
}