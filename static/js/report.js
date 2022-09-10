
$(function () {
    
    $('.input_part_contorl input, .input_part_contorl textarea').keyup(function () {
        set_print_html();
    })

    $('#report_search_date_start').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD',
        },
    });

    $('#report_search_date_end').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD',
        },
    });

    $("#report_search_date_start, #report_search_date_end").change(function () {
        search_report();

    });

    $('#date_of_hospitalization').daterangepicker({
        singleDatePicker: true,
        autoUpdateInput: false,
        locale: {
            format: 'YYYY-MM-DD',
        },
    });
    $('#date_of_hospitalization').on('apply.daterangepicker', function (ev, picker) {
        $('#date_of_hospitalization').val(picker.startDate.format('YYYY-MM-DD'));
    });


    $('#btn_print').click(function () {
        report_save('print')
    });



    $('#btn_save').click(function () {
        report_save();
    });

    $('#btnNew').click(function () {

        $('#patient_list').modal({ backdrop: 'static', keyboard: false });
        $('#patient_list').modal('show');

        $('#patient_chart').val('');
        $('#patient_name').val('');
        $('#patient_ID').val('');
        $('#patient_gender').val('');
        $('#patient_age').val('');
        $('#patient_date_of_birth').val('');
        $('#patient_address').val('');
        $('#patient_phone').val('')
        $('#reception_report').val('');
        $('#reception_usage').val('');

        $('#publication_date').val('');
        $('#date_of_hospitalization').val('');


        $('#selected_report').val('');
        $('#selected_patient').val('');


    });

    search_report();
});


function report_save(option) {
    selected_reception_id = $('#selected_reception_id').val(),

    $.ajax({
        type: 'POST',
        url: '/doctor/medical_report_save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'selected_reception_id': selected_reception_id,
            'recommmed_and_follow': $('#reception_report').val(),
        },
        dataType: 'Json',
        success: function (response) {


            if (option == 'print') {
                $("#dynamic_div").html('');
                $('#dynamic_div').load('/receptionist/document_medical_report/' + selected_reception_id);

                $('#dynamic_div').printThis({
                });
            }
            else {
                alert(gettext('Saved.'))
            }
            
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })


}

function search_report(page = null) {
    var page_context = 11;

    date_start = $('#report_search_date_start').val().trim();
    date_end = $('#report_search_date_end').val().trim();

    $.ajax({
        type: 'POST',
        url: '/doctor/report_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'filter': $('#search_select').val(),
            'input': $("#search_input").val(),
            'start': date_start,
            'end': date_end,
            'page_context': page_context,
            'page': page,
        },
        dataType: 'Json',
        success: function (response) {
            $('#search_table_contents').empty();
            for (var i = 0; i < page_context; i++) {
                var str = ""
                if (response.datas[i]) {
                    str += '<tr style="cursor:pointer; height:40px;" onclick="set_report(' + response.datas[i].reception_id + ')"><td>' + response.datas[i].No + '</td>' +
                        '<td>' + response.datas[i].chart + '</td>' +
                        '<td>' + response.datas[i].patient_name_eng + '<br/>' + response.datas[i].patient_name_kor + '</td>' +
                        '<td>' + response.datas[i].ID + '</td>' +
                        '<td>' + response.datas[i].Doctor + '</td>' +
                        '<td>' + response.datas[i].Date + '</td></tr>';
                }
                else {
                    str += "<tr style='height:40px;'><td colspan='7'></td></tr>";
                }
                $('#search_table_contents').append(str);
            }
            //ㅍㅔ이징
            $('#payment_pagnation').html('');
            str = '';
            if (response.has_previous == true) {
                str += '<li style="cursor:pointer;"> <a onclick="search_report(' + (response.page_number - 1) + ')">&laquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&laquo;</span></li>';
            }

            for (var i = response.page_range_start; i < response.page_range_stop; i++) {
                if (response.page_number == i) {
                    str += '<li style="cursor:pointer;" class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
                }
                else if (response.page_number + 5 > i && response.page_number - 5 < i) {
                    str += '<li> <a onclick="search_report(' + i + ')">' + i + '</a></li>';
                }
                else {
                }

            }
            if (response.has_next == true) {
                str += '<li style="cursor:pointer;"><a onclick="search_payment(' + (response.page_number + 1) + ')">&raquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&raquo;</span></li>';
            }
            $('#payment_pagnation').html(str);
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}


function set_report(reception_id) {
    $.ajax({
        type: 'POST',
        url: '/doctor/show_medical_report/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': reception_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_chart').val(response.patient_chart);
            $('#patient_name').val(response.patient_name_eng + ' ' + response.patient_name);
            $('#patient_ID').val(response.patient_ID);
            $('#patient_gender').val(response.patient_gender);
            $('#patient_age').val(response.patient_age);
            $('#patient_date_of_birth').val(response.patient_date_of_birth);
            $('#patient_address').val(response.patient_address);
            $('#patient_phone').val(response.patient_phone);
            $('#reception_usage').val(response.reception_usage);

            $('#publication_date').val(response.publication_date);
            $('#date_of_hospitalization').val(response.date_of_hospitalization);

            $('#selected_reception_id').val(response.id);
            $('#selected_report').val(response.selected_report);

            $('#doctor_name_screen').html(response.doctor);
            $("#doctor_name_print").html(response.doctor);

            $("#reception_report").val(response.reception_report);
            console.log(response.reception_report);
            //preview
            $("#preview_pid").html(response.patient_chart);
            $("#preview_name").html(response.patient_name_eng + ' ' + response.patient_name);
            $("#preview_address").html(response.patient_address);
            $("#preview_gender").html(response.patient_gender);
            $("#preview_date_of_birth").html(response.patient_date_of_birth);
            $("#preview_phone").html(response.patient_phone)
            $("#preview_date_visit").html(response.recorded_date);
            $("#preview_depart").html(response.depart);
            $("#preview_chief_complaint").html(response.chief_complaint);
            $("#preview_medical_history").html(response.past_history);
            $("#preview_clinical_examations").html(response.assessment);
            $("#preview_sub_clinical_examination").html(response.object);
            $("#preview_diagnosis").html(response.diagnosis);
            $("#preview_icd").html(response.icd);
            $("#preview_treatment_plan").html(response.plan);
            $("#preview_recommendation").html(response.reception_report);
            $("#preview_re_examination").html(response.next_visit);


            $("#preview_recommendation").html(response.preview_recommendation);
            //set_print_html();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}


function set_print_html() {








































    $('#patient_chart_screen').html($('#patient_chart').val());
    $('#patient_name_screen').html($('#patient_name').val());
    $('#patient_ID_screen').html($('#patient_ID').val());
    $('#patient_gender_screen').html($('#patient_gender').val());
    $('#patient_age_screen').html($('#patient_age').val() + ' 세');
    $('#patient_date_of_birth_screen').html($('#patient_date_of_birth').val());
    $('#patient_address_screen').html($('#patient_address').val());

    $('#reception_report_screen').html($('#reception_report').val().replace(/(?:\r\n|\r|\n)/g, '<br />'));
    $('#reception_usage_screen').html($('#reception_usage').val());

    $('#publication_date_screen').html($('#publication_date').val());
    $('#date_of_hospitalization_screen').html($('#date_of_hospitalization').val());

    $('#patient_chart_print').html($('#patient_chart').val());
    $('#patient_name_print').html($('#patient_name').val());
    $('#patient_ID_print').html($('#patient_ID').val());
    $('#patient_gender_print').html($('#patient_gender').val());
    $('#patient_age_print').html($('#patient_age').val() + ' 세');
    $('#patient_date_of_birth_print').html($('#patient_date_of_birth').val());
    $('#patient_address_print').html($('#patient_address').val());

    $('#reception_report_print').html($('#reception_report').val().replace(/(?:\r\n|\r|\n)/g, '<br />'));
    $('#reception_usage_print').html($('#reception_usage').val());

    $('#publication_date_print').html($('#publication_date').val());
    $('#date_of_hospitalization_print').html($('#date_of_hospitalization').val());


    $('#patient_chart_print_eng').html($('#patient_chart').val());
    $('#patient_name_print_eng').html($('#patient_name').val());
    $('#patient_ID_print_eng').html($('#patient_ID').val());
    $('#patient_gender_print_eng').html($('#patient_gender').val());
    $('#patient_age_print_eng').html($('#patient_age').val());
    $('#patient_date_of_birth_print_eng').html($('#patient_date_of_birth').val());
    $('#patient_address_print_eng').html($('#patient_address').val());

    $('#reception_report_print_eng').html($('#reception_report').val().replace(/(?:\r\n|\r|\n)/g, '<br />'));
    $('#reception_usage_print_eng').html($('#reception_usage').val());

    $('#publication_date_print_eng').html($('#publication_date').val());
    $('#date_of_hospitalization_print_eng').html($('#date_of_hospitalization').val());

}


function patient_search(data) {
    //window.location.href = 'reception/' + data;
    var category = $('#patient_search_select option:selected').val();
    var string = $('#patient_search_input').val();

    if (string == null || string == '') {
        alert(gettext('Type a text for searching'));
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/receptionist/patient_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'category': category,
            'string': string,
        },
        dataType: 'Json',
        success: function (response) {
            $('#Patient_Search').empty();
            for (var i = 0; i < 5; i++) {
                if (response.datas[i]) {
                    var str = "<tr style='cursor:pointer; height:30px;' onclick='set_patient_data(" +
                        parseInt(response.datas[i]['id']) +
                        ")'><td>" + response.datas[i]['chart'] + "</td>" +
                        "<td>" + response.datas[i]['name_kor'] + ' / ' + response.datas[i]['name_eng'] + "</td>" +
                        "<td>" + response.datas[i]['date_of_birth'] + ' (' + response.datas[i]['gender'] + '/' + response.datas[i]['age'] + ")</td>" +
                        "<td>" + response.datas[i]['phonenumber'] + "</td></tr>";
                } else {
                    var str = '<tr><td colspan="4" style="height:30px"></td></tr>';
                }
                    $('#Patient_Search').append(str);
                
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}

function set_patient_data(patient_id) {
    $.ajax({
        type: 'POST',
        url: '/doctor/set_patient_data/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,
            'doctor_id': $("#doctor_id").val(),
        },
        dataType: 'Json',
        success: function (response) {
            if (response.error) {
                alert(response.error);
                return;
            }

            $('#patient_chart').val(response.chart);
            $('#patient_name').val(response.name);
            $('#patient_gender').val(response.gender);
            $('#patient_date_of_birth').val(response.date_of_birth);
            $('#patient_address').val(response.address);
            $('#patient_phone').val(response.phone);

            $('#patient_ID').val(response.ID);
            $('#patient_age').val(response.age);
            $('#publication_date').val(response.today);

            $('#selected_report').val('new');
            $('#selected_patient').val(patient_id);

            $('#patient_list').modal('hide');
            
            $('#doctor_name_screen').html(response.doctor);
            $("#doctor_name_print").html(response.doctor);

            set_print_html();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}