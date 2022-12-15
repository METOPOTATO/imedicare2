jQuery.browser = {};

var timer_count = 0;

$(function () {

    $('.database_control input[type=text],input[type=number]').each(function () {
        //this.className += 'form-control';

    })

    $('#search_str').keypress(function (key) {
        if (key.keyCode == 13) {
            waiting_list();
        }
    });

    $('#pharmacy_list_calendar_start').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    $('#pharmacy_list_calendar_end').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    worker_on(true);
    $('#pharmacy_list_calendar_start, #pharmacy_list_calendar_end').on('apply.daterangepicker', function () {
        today = moment().format('YYYY[-]MM[-]DD');

        start = $('#pharmacy_list_calendar_start').val();
        end = $('#pharmacy_list_calendar_end').val();
        if (start == today || end == today) {
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

//알람
function play_alarm() {
    //var x = document.getElementById("audio").play();
    //
    //
    //if (x !== undefined) {
    //    x.then(_ => {
    //        console.log(_);
    //        // Autoplay started!
    //    }).catch(error => {
    //        console.log(error);
    //        // Autoplay was prevented.
    //        // Show a "Play" button so that user can start playback.
    //    });
    //}
}

function save_data_control() {
    if ($('#selected_option').val() == '') {
        alert(gettext("Select medicine first."));
        return;
    }
    if (isNaN($('#medicine_search_changes').val()) == true) {
        alert(gettext('Amount should be number'));
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/pharmacy/save_data_control/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'selected_option': $('#selected_option').val(),
            'name': $('#medicine_control_name').val(),
            'company': $('#medicine_search_company').val(),
            'country': $('#medicine_search_country').val(),
            'ingredient': $('#medicine_search_ingredient').val(),
            'unit': $('#medicine_search_unit').val(),
            'price': $('#medicine_control_price').val(),
            'changes': $('#medicine_search_changes').val(),
        },
        dataType: 'Json',
        success: function (response) {
            alert(gettext('Saved.'));
            $('.database_control input').each(function () {
                if ($(this).attr('type') == 'button')
                    return;
                $(this).val('');
            })
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

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
            $('#medicine_control_name').val(response.name);
            $('#medicine_search_company').val(response.company);
            $('#medicine_search_country ').val(response.country);
            $('#medicine_search_ingredient').val(response.ingredient);
            $('#medicine_search_unit').val(response.unit);
            $('#medicine_control_price').val(response.price);
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function set_new() {

}

function pharmacy_control_withdraw() {

    var diagnosis_id = $('#selected_diagnosis').val();
    if (diagnosis_id.trim() == '') {
        alert(gettext('Select patient first.'));
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/pharmacy/withdraw/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'diagnosis_id': diagnosis_id,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                alert(gettext("Saved."));
            } else {
                var str = gettext('Failed\n')
                str += response.msg
                alert(str);
            }
            waiting_list();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
        beforeSend: function () {
            $("#overlay").fadeIn(300);
        },
        complete: function () {
            $("#overlay").fadeOut(300);
        }
    })
}

function pharmacy_control_save(status = false) {

    var diagnosis_id = $('#selected_diagnosis').val();
    if (diagnosis_id.trim() == '') {
        alert(gettext('Select patient first.'));
        return;
    }


    $.ajax({
        type: 'POST',
        url: '/nurse/save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'status': status,
            'diagnosis_id': diagnosis_id,
        },
        dataType: 'Json',
        success: function (response) {
            alert(gettext("Saved."));
            waiting_list();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
        beforeSend: function () {
            $("#overlay").fadeIn(300);
        },
        complete: function () {
            $("#overlay").fadeOut(300);
        }
    })

}


function waiting_selected(diagnosis_id) {
    $.ajax({
        type: 'POST',
        url: '/nurse/waiting_selected/',
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
                var str = "<tr><td>" + response.datas[i]['code'] + "</td>";
                if (response.datas[i]['type'] == 'procedure') {
                    str += "<td>Procedure</td>";
                } else if (response.datas[i]['type'] == 'injection') {
                    str += "<td>Injection</td>";
                }
                str += "<td>" + response.datas[i]['name'] + "</td>" + 
                       "<td>" + response.datas[i]['depart'] + "</td></tr>";

                $('#pharmacy_contents_table').append(str);
            }
            $('#need_invoice').prop('checked', response.need_invoice);
            $('#need_insurance').prop('checked', response.need_invoice);

            $('#show_patient_selected').html(response.patient_name);

            waiting_list();

            $("#patient_chart").val(response.chart);
            $("#patient_name").val(response.Name);
            $('input:radio[name=gender]').filter('[value=' + response.gender + ']').prop('checked', true);
            $("#patient_dob").val(response.Date_of_Birth);
            $("#patient_depart").val(response.Depart);
            $("#patient_phone").val(response.phone);

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })

}

function waiting_list(Today = false, alarm = false) {
    var date, start, end;

    var start = $('#pharmacy_list_calendar_start').val();
    var end = $('#pharmacy_list_calendar_end').val();

    var depart = $("#pharmacy_list_depart").val();
    var filter = $("#pharmacy_search_select").val();
    var string = $("#search_str ").val();



    $.ajax({
        type: 'POST',
        url: '/nurse/waiting_list/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'start_date': start,
            'end_date': end,
            'string': string,
            'filter': filter,
            'depart': depart,
        },
        dataType: 'Json',
        success: function (response) {
            $('#pharmacy_list_table > tbody ').empty();
            for (var i = 0; i < response.datas.length; i++) {
                var tr_class = "";
                if (response.datas[i]['status'] == 'PROCEEDING')
                    tr_class = "class ='warning'";
                else if (response.datas[i]['status'] == 'DONE')
                    tr_class = "class ='danger'";
                else {// if (response.datas[i]['status'] == 'new') {
                    tr_class = "class ='success'";
                    var is_new = true;
                }

                var str = "<tr " + tr_class + " onclick='waiting_selected(" + response.datas[i]['diagnosis_id'] + ")'>" +
                    "<td>" + Number(i + 1) + "</td>" +
                    "<td>" + response.datas[i]['chart'] + "</td>" +
                    "<td>" + response.datas[i]['Name'];
                if (response.datas[i]['status'] == 'changed')
                    str += ' <i class="fa fa-lg fa-undo"></i> ';
                str += "</td>" +
                    "<td>" + response.datas[i]['Date_of_Birth'] + "</td>" +
                    "<td>" + response.datas[i]['Depart'] + "</td>" +
                    "<td>" + response.datas[i]['ordered'] + "</td>" +
                    "<td>" + response.datas[i]['done'] + "</td></tr>";

                $('#pharmacy_list_table').append(str);
            }
            //알람 
            if (alarm && is_new)
                play_alarm();

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}


var w = undefined
function worker_on(is_run) {
    if (is_run) {
        if (window.Worker) {
            path = get_listener_path();
            w = new Worker(path);
            w.onmessage = function (event) {
                console.log(timer_count);
                timer_count += 1;
                if (timer_count >= 18) {
                    timer_count = 0;
                    waiting_list(true, true);
                } else {
                    waiting_list(true, false);
                }
            };
        }
    } else {
        timer_count = 0;

        if (w != undefined) {
            w.terminate();
            w = undefined;
        }
    }
}