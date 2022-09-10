jQuery.browser = {};


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
$(function () {
    var _oldShow = $.fn.show;
    var _oldHide = $.fn.hide;
    $.fn.show = function (speed, oldCallback) {
        return $(this).each(function () {
            var obj = $(this),
                newCallback = function () {
                    if ($.isFunction(oldCallback)) {
                        oldCallback.apply(obj);
                    }
                    obj.trigger('afterShow');
                };
            // you can trigger a before show if you want
            obj.trigger('beforeShow');
            // now use the old function to show the element passing the new callback
            _oldShow.apply(obj, [speed, newCallback]);
        });
    }
    $.fn.hide = function (speed, oldCallback) {
        return $(this).each(function () {
            var obj = $(this),
                newCallback = function () {
                    if ($.isFunction(oldCallback)) {
                        oldCallback.apply(obj);
                    }
                    obj.trigger('afterHide');
                };
            // you can trigger a before show if you want
            obj.trigger('beforeHide');
            // now use the old function to show the element passing the new callback
            _oldHide.apply(obj, [speed, newCallback]);
        });
    }

    // init start
    reception_waiting(true);

    $('.diagnosis_select_contents').hide();
    $('#diagnosis_select_exam_contents').show();
    $('.diagnosis_select_title input').click(function () {
        $('.diagnosis_select_contents').hide();
        id = $(this).attr('id');
        if (id == 'diagnosis_select_exam_title') {
            $('#diagnosis_select_exam_contents').show();
        }
        else if (id == 'diagnosis_select_test_title') {
            $('#diagnosis_select_test_contents').show();
        }
        else if (id == 'diagnosis_select_precedure_title') {
            $('#diagnosis_select_precedure_contents').show();
        }
        else if (id == 'diagnosis_select_medicine_title') {
            $('#diagnosis_select_medicine_contents').show();
        }
        else if (id == 'diagnosis_select_bundle') {
            $('#diagnosis_select_bundle_contents').show();
        }
        else if (id == 'diagnosis_select_pm_radio_title') {
            $('#diagnosis_select_pm_radio_contents').show();
        }
    });


    //select and set methods
    $('.contents_items tr').click(function (event) {
        if (event.target.nodeName.toLowerCase() == 'td') {
            //diagnosis_select_test_contents
            $(event.target.parentElement.parentElement.parentElement.parentElement).attr('id');

            var str = "<tr><td style='width:3vw;'>" + $(this).find('td:nth-child(2)').text().trim() + "<input type='hidden' value=''/></td>";

            //if (event.target.parentElement.parentElement.parentElement.parentElement.id == 'diagnosis_select_medicine_contents') {
            //    //event.target.parentElement.parentElement.parentElement.getElementById('#tbody_contents_class_Injection');
            //    var check_input = $(event.target.parentElement.parentElement).attr('id');
            //    if (check_input == 'contents_items_Injection' ||
            //        check_input == 'contents_items_Infusion'
            //    ) {
            //        str += "<td>" + $(this).find('td:nth-child(3)').text().trim() + "<input type='hidden' value=''/></td><td style='text-align: center;'>" +
            //            $(this).find('td:nth-child(6)').text().trim() + "</td><td>" +
            //            "<input type='number' style='display:none;' min='0' value='1' class='diagnosis_selected_input_number' id='amount'/></td><td style='text-align: center;'>" +
            //            "<input type='number' style='display:none;' min='0' value='1' class='diagnosis_selected_input_number' id='days'/></td><td style='text-align: center;'>" +
            //            "<input type='text' class='diagnosis_selected_input_number' id='memo'/></td>";
            //    }
            //    else {
            //        str += "<td>" + $(this).find('td:nth-child(3)').text().trim() + "<input type='hidden' value=''/></td><td style='text-align: center;'>" +
            //            $(this).find('td:nth-child(6)').text().trim() + "</td><td>" +
            //            "<input type='number' min='0' value='1' class='diagnosis_selected_input_number' id='amount'/></td><td style='text-align: center;'>" +
            //            "<input type='number' min='0' value='1' class='diagnosis_selected_input_number' id='days'/></td><td style='text-align: center;'>" +
            //            "<input type='text' class='diagnosis_selected_input_number' id='memo'/></td>";
            //    }
            if (event.target.parentElement.parentElement.parentElement.parentElement.id == 'diagnosis_select_precedure_contents') {
                str += "<td>" + $(this).find('td:nth-child(3)').text().trim() + "</td><td>" +
                    "<input type='hidden' min='1' value='1' class='diagnosis_selected_input_number' id='amount'/></td>";
            }
            else if (event.target.parentElement.parentElement.parentElement.parentElement.id == 'diagnosis_select_pm_radio_contents') {
                str += "<td>" + $(this).find('td:nth-child(3)').text().trim() + "</td><td>" +
                    "<input type='number' min='1' value='1' class='diagnosis_selected_input_number' id='amount'/></td>";
            }
            else {
                str += "<td colspan='2'>" + $(this).find('td:nth-child(3)').text().trim() + "<input type='hidden' value=''/></td>";
            }
            str += "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>";
            str += "<td style='display:none;'>" + $(this).find('td:nth-child(4)').text().replace(/,/g, '').replace('VND', '').trim() + "</td></tr>";

            var what_class = $(event.target.parentElement.parentElement.parentElement.parentElement).attr('id');


            if (what_class == 'diagnosis_select_exam_contents')
                $('#diagnosis_selected_exam').append(str);
            //else if (what_class == 'diagnosis_select_test_contents')
            //    $('#diagnosis_selected_test').append(str);
            else if (what_class == 'diagnosis_select_precedure_contents' || what_class == 'diagnosis_select_pm_radio_contents')
                $('#diagnosis_selected_precedure').append(str);
            //else if (what_class == 'diagnosis_select_medicine_contents')
            //    $('#diagnosis_selected_medicine').append(str);

            $('#diagnosis_selected input').change(function () {
                show_total_price();
            })
            $('#diagnosis_selected input').keyup(function () {
                show_total_price();
            })

            show_total_price();
        }
    });

    if ($("#patient_date_of_birth").length > 0) {
        $("#patient_date_of_birth").datepicker({
            changeMonth: true,
            changeYear: true,
            nextText: '���� ��',
            prevText: '���� ��',
            currentText: '����',
            closeText: '�ݱ�',
            monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            monthNames: ['1��', '2��', '3��', '4��', '5��', '6��', '7��', '8��', '9��', '10��', '11��', '12��'],
            dateFormat: "yy-mm-dd",
            yearRange: '1900:2100',
        });
    }

    $('#reception_waiting_date').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        drops: "up",
        locale: {
            format: 'YYYY-MM-DD',
        },
    });
    worker_on(true);
    $('#reception_waiting_date').on('apply.daterangepicker', function () {
        today = moment().format('YYYY[-]MM[-]DD');
        date = $('#reception_waiting_date').val();
        if (date == today) {
            worker_on(true);
        } else {
            worker_on(false);
        }
    });

    $('#past_diagnosis_calendar').daterangepicker();

    $('#reservation_date').daterangepicker({
        autoUpdateInput: false,
        singleDatePicker: true,
        timePicker: true,
        timePicker24Hour: true,
        timePickerIncrement: 10,
        showDropdowns: true,
        drops: "up",
        locale: {
            format: 'YYYY-MM-DD HH:mm:ss',
            locale: { cancelLabel: 'Clear' }
        },
    }).on('show.daterangepicker', function (ev, picker) {
        picker.container.find(".hourselect").empty()
        picker.container.find(".hourselect").append('<option value="9" selected="selected">9</option>');
        picker.container.find(".hourselect").append('<option value="10">10</option>');
        picker.container.find(".hourselect").append('<option value="11">11</option>');
        picker.container.find(".hourselect").append('<option value="12">12</option>');
        picker.container.find(".hourselect").append('<option value="13">13</option>');
        picker.container.find(".hourselect").append('<option value="14">14</option>');
        picker.container.find(".hourselect").append('<option value="15">15</option>');
        picker.container.find(".hourselect").append('<option value="16">16</option>');
        picker.container.find(".hourselect").append('<option value="17">17</option>');
    });

    $('#reservation_date').on('apply.daterangepicker', function (ev, picker) {
        var hour = picker.container.find(".hourselect").children("option:selected").val();
        if (hour < 9)
            hour = 9;
        else if (hour > 17)
            hour = 17;
        picker.startDate.set({ hour: hour, });
        $('#reservation_date').val(picker.startDate.format('YYYY-MM-DD HH:mm:ss'));
    });
    $('#reservation_date').on('cancel.daterangepicker', function (ev, picker) {
        $('#reservation_date').val('');
    });






    $(".show_list_btn").click(function () {
        $(".show_list_contents").slideToggle("slow");
    });

    $('.vital_input').keypress(function (key) {
        if (key.keyCode == 13) {
            if ($(this).parent().is(':last-child')) {
                if (confirm('Save?')) {
                    set_vital();
                }
            } else {
                $(this).parent().next().children('input').focus();
            }
        }
    });

    $('.contents_items').change(function () {
    })

    $('.contents_class').click(function () {
        $(this).parent().next('.contents_items').toggle()
        if ($(this).parent().next('.contents_items').is(':visible')) {
            $(this).children().children('label').html('-');
        } else {
            $(this).children().children('label').html('+');
        }
        $('.contents_class').parent().next('.contents_items').not($(this).parent().next('.contents_items')).hide();
        $('.contents_class').children().children('label').not($(this).children().children('label')).html('+');
    });

    $('#order_search').keyup(function () {
        var k = $(this).val();
        $('.contents_class').children().children('label').not($(this).children().children('label')).html('+');
        if (k == '') {
            $(".contents_items").hide();
            $('.contents_items tr').show();
            $('#diagnosis_select_medicine_contents .contents_items, #diagnosis_select_exam_contents .contents_items').show();
        }
        else {
            $(".contents_items, .contents_items tr").hide();
            var temp = $(".contents_items > tr > td:nth-child(5):contains('" + k.toLowerCase() + "')");

            $(temp).parent().parent().show();
            $(temp).parent().parent().prev().children().children().children('label').html('-');
            $(temp).parent().show();
        }
    })

    //��2 ����
    $(".q2_item_select ").change(function () {
        var data_code = $(this).attr('data_code');

        if ($('#pain_location_text_' + data_code).is(':checked') != true) {
            $('#pain_location_text_' + data_code).prop('checked', true);
        }


        str = '';
        str += parseInt($('#pain_location_text_' + data_code).val()) + '-';
        str += parseInt($("#q2_item_select1_" + data_code).val()) + '-';
        str += parseInt($("#q2_item_select2_" + data_code).val());

        $('.q2_items').each(function () {

            if ($(this).attr('data_code') == data_code) {
                $(this).hide();
            }
        });


        $('#q2_items_' + str).show();
    })
    //��2 ����
    $('.pain_location_text').change(function () {
        if ($(this).is(':checked') != true) {
            var data_code = $(this).attr('data_code');
            str = '';
            str += $('#pain_location_text_' + data_code).val() + '-';
            str += $("#q2_item_select1_" + data_code).val() + '-';
            str += $("#q2_item_select2_" + data_code).val();

            $('#q2_items_' + str).hide();

            $("#q2_item_select1_" + data_code).val($("#q2_item_select1_" + data_code + " option:first").val());
            $("#q2_item_select2_" + data_code).val($("#q2_item_select2_" + data_code + " option:first").val());
        }

    })



    //���� 
    $(".js-range-slider").ionRangeSlider({
        min: 0,
        max: 10,
        from: 0,
        type: 'single',
        grid: true,
        grid_num: 10,
        skin: "round",
    });
    let pain_slider = $(".js-range-slider").data("ionRangeSlider");


    $('#initial_report').click(function () {
        var patient_id = $('#patient_id').val();
        if (patient_id == null || patient_id == '') {
            alert(gettext('Select patient first.'));
            return;
        }

        $.ajax({
            type: 'POST',
            url: '/receptionist/Question/get/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'patient_id': $('#patient_id').val(),
            },
            dataType: 'Json',
            success: function (response) {
                //���� 


                //init
                $('#medical_exam_EventModal .q2_items').hide();

                $('.medical_exam_pm input[type="text"]').val('');
                $('.medical_exam_pm input[type="checkbox"]').each(function () {
                    $(this).prop('checked', false);
                });
                $('#occurred_date').val();
                $('.medical_exam_pm input[type="radio"]').prop('checked', false);

                $("#physiotherapy_count,#acupuncture_count,#injection_treatment_count,#taking_medicine_count").attr('disabled', true);
                $("#operation_year, #operation_name").attr('disabled', true);

                pain_slider.update({
                    from: 0,
                })


                if (response.result == false) {
                    return;
                }
                //vital
                $('#input_vital_height').val(response.vital_height);
                $('#input_vital_weight').val(response.vital_weight);
                $('#input_vital_bmi').val(response.vital_bmi);
                $('#input_vital_bp').val(response.vital_bp);
                $('#input_vital_bt').val(response.vital_bt);


                //2

                var q2_item = response.pain_posi_text.split(',');
                for (var item in q2_item) {
                    if (q2_item[item] == "") {
                    }
                    else {
                        var code = q2_item[item].split('-')
                        if (code.length == 1) {
                            $('#pain_location_text_' + code[0]).prop('checked', true);
                        } else {
                            $('#pain_location_text_' + code[0]).prop('checked', true);
                            $('#q2_item_select1_' + code[0] + ' option[value=' + code[1] + ']').attr('selected', 'selected');
                            $('#q2_item_select2_' + code[0] + ' option[value=' + code[2] + ']').attr('selected', 'selected');

                            $('#q2_items_' + q2_item[item]).show();
                            //$('input[class=pain_location_text]:input[value=' + q2_item[item] + ']').prop("checked", true);
                        }
                    }
                }




                $('#occurred_date').val(response.sick_date);
                //3
                if (response.cure_yn == "true") {
                    $('#treatment_history_yn').attr("checked", true);
                }
                if (response.cure_phy_yn == "true") {
                    $('#physiotherapy_yn').prop("checked", true);
                    $("#physiotherapy_count").prop('disabled', false);
                    $('#physiotherapy_count').val(response.cure_phy_cnt);
                }
                if (response.cure_inject_yn == "true") {
                    $('#injection_treatment_yn').prop("checked", true);
                    $("#injection_treatment_count").prop('disabled', false);
                    $('#injection_treatment_count').val(response.cure_inject_cnt);
                }
                if (response.cure_medi_yn == "true") {
                    $('#taking_medicine_yn').prop("checked", true);
                    $("#taking_medicine_count").prop('disabled', false);
                    $('#taking_medicine_count').val(response.cure_medi_cnt);
                }
                if (response.cure_needle_yn == "true") {
                    $('#acupuncture_yn').prop("checked", true);
                    $("#acupuncture_count").prop('disabled', false);
                    $('#acupuncture_count').val(response.cure_needle_cnt);
                }


                //4
                pain_slider.update({
                    from: response.pain_level,
                })
                //5
                $("input:radio[name=operation_yn]:input[value=" + response.surgery_yn + " ]").prop("checked", true);
                if (response.surgery_yn == "1") {
                    $("#operation_year").prop('disabled', false);
                    $("#operation_year").val(response.surgery_year);
                    $("#operation_name").prop('disabled', false);
                    $("#operation_name").val(response.surgery_name);
                }

                //6
                var q6_item = response.exam_kind.split(',');
                for (var item in q6_item) {
                    if (q6_item[item] == "") {
                    }
                    else {
                        $('input[class=test_kinds]:input[value=' + q6_item[item] + ']').prop("checked", true);
                    }
                }

                $('#test_etc').val(response.exam_etc);
                var q6_film = response.cd_film_yn.split(',');
                for (var item in q6_film) {
                    if (q6_film[item] == "") {
                    }
                    else {
                        $('input[class=cd_film_yn]:input[value=' + q6_film[item] + ']').prop("checked", true);
                    }
                }

                //7
                var q7_item = response.disease_kind.split(',');
                for (var item in q7_item) {
                    if (q7_item[item] == "") {
                    }
                    else {
                        $('input[class=disease_history_kinds]:input[value=' + q7_item[item] + ']').prop("checked", true);
                    }
                }
                $('#disease_etc').val(response.disease_etc);
                $('#medication').val(response.medication);
                //8
                $("input:radio[name=medicine_side_effects]:input[value=" + response.side_effect_yn + " ]").prop("checked", true);
                //9
                $("input:radio[name=pregnant_radio]:input[value=" + response.pregnant_yn + " ]").prop("checked", true);

                //10
                $('#visit_motiv_item').val(response.visit_motiv_item);

                var q10_item = response.visit_motiv_item.split(',');
                for (var item in q10_item) {
                    if (q10_item[item] == "") {

                    }
                    else {
                        $('input[class=visit_motiv_item]:input[value=' + q10_item[item] + ']').prop("checked", true);
                    }
                }

                $('#visit_motiv_friend').val(response.visit_motiv_friend);
                $('#visit_motiv_etc').val(response.visit_motiv_etc);



            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            },
        });

        $('#medical_exam_EventModal').modal({ backdrop: 'static', keyboard: false });
        $("#medical_exam_EventModal").scrollTop(0);
        $('#medical_exam_EventModal').modal('show');
    })
});

function selected_table_title(title) {
    //off
    $('.table_title').attr('style', 'border:2px solid #adadad;border-right:0px solid #adadad;');
    $('.table_title').next('th').attr('class', 'diagonal');

    //on
    $(title).attr('style', 'border:4px solid #adadad;border-right:0px solid #adadad;border-bottom:0px solid #adadad;');
    $(title).next('th').attr('class', 'diagonal_selected');
}



function get_all_diagnosis() {
    $('#diagnosis_table tbody').empty();
    $.ajax({
        type: 'POST',
        url: '/doctor/diagnosis_past/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'all': 'all',
            'patient_id': $('#patient_id').val(),
        },
        dataType: 'Json',
        success: function (response) {
            for (var i in response.datas) {
                var str = "<tr style='background:#94ee90'><td colspan='5'>" + response.datas[i]['date'] + "(" + response.datas[i]['day'] + ")[" + response.datas[i]['doctor'] + "]</td>" +
                    "</td></tr>" + /*"<tr><td colspan='5'>History: D-" + response.datas[i]['diagnosis']  + */

                    "<tr><td colspan='5'><font style='font-weight:700;'>History:</font><br/><font style='font-weight:700; color:#d2322d'>S - </font>" + response.datas[i]['subjective'] + "<br/><font style='font-weight:700; color:#d2322d'>O - </font>" +
                    response.datas[i]['objective'] + "<br/><font style='font-weight:700; color:#d2322d'>A - </font>" +
                    response.datas[i]['assessment'] + "<br/><font style='font-weight:700; color:#d2322d'>P - </font>" +
                    response.datas[i]['plan'] + "<br/><font style='font-weight:700; color:#d2322d'>D - </font>" +
                    response.datas[i]['diagnosis'] +
                    "</td></tr>";


                for (var j in response.datas[i]['exams']) {
                    str += "<tr><td>" + response.datas[i]['exams'][j]['name'] + "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td></tr>";
                }

                for (var j in response.datas[i]['tests']) {
                    str += "<tr><td>" + response.datas[i]['tests'][j]['name'] + "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td></tr>";
                }
                for (var j in response.datas[i]['precedures']) {
                    str += "<tr><td>" + response.datas[i]['precedures'][j]['name'] + "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td><td>" +
                        "</td></tr >";
                }
                for (var j in response.datas[i]['medicines']) {
                    str += "<tr><td>" + response.datas[i]['medicines'][j]['name'] + "</td><td>" +
                        response.datas[i]['medicines'][j]['unit'] + "</td><td>" +
                        response.datas[i]['medicines'][j]['amount'] + "</td><td>" +
                        response.datas[i]['medicines'][j]['days'] + "</td><td>" +
                        response.datas[i]['medicines'][j]['memo'] + "</td></tr >";
                }

                $('#diagnosis_table tbody').append(str);
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })




}

function show_total_price() {
    var total = 0;
    var table = $('#diagnosis_selected');
    table.find('tbody tr').each(function (i, el) {
        var $tds = $(this).find('td');
        temp_data = {};

        what_class = $tds.parent().parent().attr('id')

        if (what_class == 'diagnosis_selected_medicine' || what_class == 'diagnosis_selected_precedure') {
            var price = parseInt($tds.eq(4).text().trim());
            var amount = parseInt($tds.eq(2).children('input').val());
            //var days = parseInt($tds.eq(4).children('input').val());
            total += price * amount;//* days;
        }
        else {
            sd = $tds.eq(3).text();
            total += parseInt($tds.eq(3).text().trim());
        }

    });

    $('#total_price').html(numberWithCommas(total) + ' VND');

}



function set_all_empty() {
    $('input').empty();
}


function set_past_diagnosis_date(element) {
    if (event.keyCode == 13) {
        date = $(element).next('.doctor_past_diagnosis_calendar');
        if (date.length == 0)
            date = $(element).next().next('.doctor_past_diagnosis_calendar');
        date.datepicker('setDate', $(element).val());
    }
}




function reception_select(reception_id) {
    $.ajax({
        type: 'POST',
        url: '/doctor/reception_select/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': reception_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_id').val(response.id);
            $('#patient_chart').val(response.chart);
            $('#patient_name_kor').val(response.name_kor + ' / ' + response.name_eng);
            $('#patient_date_of_birth').val(response.date_of_birth);
            $('#patient_address').val(response.address);
            $('#patient_phone').val(response.phone);

            $('#history_past').val(response.history_past);
            $('#history_family').val(response.history_family);

            $('input:radio[name=gender]').filter('[value=' + response.gender + ']').prop('checked', true);
            $('#chief_complaint').val(response.chief_complaint);

            $('#selected_reception').val(response.reception_id);
            $('#reservation_date').val(response.reservation)

            $('#assessment').val(response.assessment);
            $('#objective_data').val(response.objective_data);
            $('#plan').val(response.plan);
            $('#diagnosis').val(response.diagnosis);
            $("#recommendation").val(response.recommendation);


            $('#need_medical_report').hide();
            if (response.need_medical_report) {
                $('#need_medical_report').show();
            }


            get_vital();
            get_all_diagnosis();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })


}




function get_vital() {
    $.ajax({
        type: 'POST',
        url: '/doctor/get_vital/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': $('#patient_id').val(),
        },
        dataType: 'Json',
        success: function (response) {
            $('#vital_get_body').empty();
            for (var i in response.datas) {
                var str = "<tr><td>" + response.datas[i]['date'] + "</td>" +
                    "<td>" + response.datas[i]['weight'] + "</td>" +
                    "<td>" + response.datas[i]['height'] +
                    "<td>" + response.datas[i]['blood_pressure'] + "</td>" +
                    "<td>" + response.datas[i]['blood_temperature'] + "</td>" +
                    "<td>" + response.datas[i]['breath'] + "</td>" +
                    "<td>" + response.datas[i]['pulse_rate'] + "</td></tr>";

                $('#Vitial_table').append(str);
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })
}

function set_vital() {
    if ($('#selected_reception').val().trim() == '') {
        alert(gettext('Select patient first.'));
        return;
    }
    $.ajax({
        type: 'POST',
        url: '/doctor/set_vital/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': $('#selected_reception').val(),
            'vital_date': $('#vital_set_body tr td:first-child').html(),
            'weight': $('#vital_input_weight').val(),
            'height': $('#vital_input_height').val(),
            'blood_pressure': $('#vital_input_blood_pressure').val(),
            'blood_temperature': $('#vital_input_blood_temperature').val(),
            'breath': $('#vital_input_breath').val(),
            'pulse_rate': $('#vital_input_pulse_rate').val(),
        },
        dataType: 'Json',
        success: function (response) {
            get_vital();
            set_vital_clear();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })
}

function set_vital_clear() {
    $('#vital_input_weight').val('');
    $('#vital_input_height').val('');
    $('#vital_input_blood_pressure').val('');
    $('#vital_input_blood_temperature').val('');
    $('#vital_input_breath').val('');
    $('#vital_input_pulse_rate').val('');
}

function get_diagnosis(reception_no) {
    $.ajax({
        type: 'POST',
        url: '/doctor/get_diagnosis/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_no': reception_no,
        },
        dataType: 'Json',
        success: function (response) {

            $('#diagnosis').val(response.datas['diagnosis']);
            $('#diagnosis_selected tbody').empty();

            for (var j in response.datas['exams']) {
                var str = "<tr><td>" + response.datas['exams'][j]['code'] + "<input type='hidden' value='" +
                    response.datas['exams'][j]['id'] + "'/></td><td colspan='2'>" +
                    response.datas['exams'][j]['name'] + "</td>" +
                    "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
                    "<td style='display:none;'>" + response.datas['exams'][j]['price'] + "</td></tr > ";

                $('#diagnosis_selected_exam').append(str);
            }

            //for (var j in response.datas['tests']) {
            //
            //    var str = "<tr><td>" + response.datas['tests'][j]['code'] + "<input type='hidden' value='" +
            //        response.datas['tests'][j]['id'] + "'/></td><td colspan='5'>" +
            //        response.datas['tests'][j]['name'] + "</td>" +
            //        "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
            //        "<td style='display:none;'>" + response.datas['tests'][j]['price'] + "</td></tr > ";
            //    $('#diagnosis_selected_test').append(str);
            //}

            for (var j in response.datas['precedures']) {
                var str = "<tr><td>" + response.datas['precedures'][j]['code'] + "<input type='hidden' value='" +
                    response.datas['precedures'][j]['id'] + "'/></td><td>" +
                    response.datas['precedures'][j]['name'] + "</td>";
                if (response.datas['precedures'][j]['code'].search('R') != -1) {
                    str += "<td><input type='number' min='1' value='" + response.datas['precedures'][j]['amount'] + "' class='diagnosis_selected_input_number' id='amount'>";
                } else {
                    str += "<td><input type='hidden' min='1' value='" + response.datas['precedures'][j]['amount'] + "' class='diagnosis_selected_input_number' id='amount'>";
                }
                str += "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
                    "<td style='display:none;'>" + response.datas['precedures'][j]['price'] + "</td></tr > ";
                $('#diagnosis_selected_precedure').append(str);
            }
            //for (var j in response.datas['medicines']) {
            //    var str = "<tr><td>" + response.datas['medicines'][j]['code'] + "<input type='hidden' value='" +
            //        response.datas['medicines'][j]['id'] + "'/></td><td>" +
            //        response.datas['medicines'][j]['name'] + "</td>" +
            //        "<td>" + response.datas['medicines'][j]['unit'] + "</td>" +
            //        "<td><input type='number' class='diagnosis_selected_input_number' id='amount' value='" +
            //        response.datas['medicines'][j]['amount'] + "'>" + "</td>" +
            //        "<td><input type='number' class='diagnosis_selected_input_number' id='days' value='" +
            //        response.datas['medicines'][j]['days'] + "'>" + "</td>" +
            //        "<td><input type='text' class='diagnosis_selected_input' id='memo' value='" +
            //        response.datas['medicines'][j]['memo'] + "'>" + "</td>" +
            //        "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
            //        "<td style='display:none;'>" + response.datas['medicines'][j]['price'] + "</td></tr > ";
            //    $('#diagnosis_selected_medicine').append(str);
            //}

            $('.diagnosis_selected_input_number').change(function () {
                var regexp = /^[0-9]*$/;
                v = $(this).val();
                if (!regexp.test(v)) {
                    $(this).val(v.replace(/[^0-9]/g, ''));
                }

            })

            $('#diagnosis_selected input').change(function () {
                show_total_price();
            })
            $('#diagnosis_selected input').keyup(function () {
                show_total_price();
            })

            show_total_price();

            $('.q2_items').hide();

            $.ajax({
                type: 'POST',
                url: '/receptionist/Question/get/',
                data: {
                    'csrfmiddlewaretoken': $('#csrf').val(),
                    'patient_id': response.patient_id,
                },
                dataType: 'Json',
                success: function (response) {
                    //2

                    var q2_item = response.pain_posi_text.split(',');
                    for (var item in q2_item) {
                        if (q2_item[item] == "") {
                        }
                        else {
                            var code = q2_item[item].split('-')
                            if (code.length == 1) {
                            } else {

                                $('#dx_image_items_' + q2_item[item]).show();
                                //$('input[class=pain_location_text]:input[value=' + q2_item[item] + ']').prop("checked", true);
                            }
                        }
                    }
                },
                error: function (request, status, error) {
                    console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                },
            });

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })
}


function reception_waiting(Today = false) {
    //�ӽ�
    return;
    var date;

    progress = $('#reception_progress').val();

    date = $('#reception_waiting_date').val();


    $.ajax({
        type: 'POST',
        url: '/doctor/reception_waiting/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'date': date,
            'progress': progress,
        },
        dataType: 'Json',
        success: function (response) {
            $('#Rectption_Status > tbody ').empty();
            if (response.datas.length == 0) {
                $('#Rectption_Status').append("<tr><td colspan='8'>" + gettext('No Result !!') + "</td></tr>");
            } else {
                for (var i in response.datas) {
                    var color;
                    $('#status').val(response.datas[i]['status']);
                    //if (response.datas[i]['status'] == 'new')
                    //    tr_class = "class ='success'"
                    //else if (response.datas[i]['status'] == 'hold')
                    //    tr_class = "class ='warning'"
                    //else if (response.datas[i]['status'] == 'done')
                    //    tr_class = "class ='danger'"
                    if (response.datas[i]['status'] == 'done')
                        tr_class = "class ='success'"
                    else
                        tr_class = "class =''"

                    var str = "<tr style='cursor:pointer;'" + tr_class + " onclick='reception_select(" +
                        response.datas[i]['reception_no'] +
                        ");" +
                        "get_diagnosis(" + response.datas[i]['reception_no'] +
                        ");'><td>" + (parseInt(i) + 1) + "</td>" +
                        "<td>" + response.datas[i]['chart'] + "</td>" +
                        "<td>" + response.datas[i]['name_kor'] + "/" + response.datas[i]['name_eng'] + "</td>" +
                        "<td>" + response.datas[i]['date_of_birth'] + '<br/>' + ' (' + response.datas[i]['age'] + '/' + response.datas[i]['gender'] + ")</td>" +
                        "<td>" + response.datas[i]['reception_time'] + "</td></tr>";

                    $('#Rectption_Status').append(str);
                }
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}


function diagnosis_report() {
    if ($('#selected_reception').val().trim() == '') {
        alert(gettext('Select patient first.'));
        return;
    }
    window.open('/doctor/show_medical_report/' + $('#selected_reception').val().trim() + '?', 'Medical Report', 'width=920,height=465,left=0,top=100,resizable=no,location=no,status=no,scrollbars=yes');

}



function worker_on(path) {
    if ($("input:checkbox[id='work_on']").is(":checked") == true) {
        if (window.Worker) {
            w = new Worker(path);
            w.onmessage = function (event) {
                reception_waiting(true);
            };

        } else {
        }
    } else {
        w.terminate();
        w = undefined;  
    }
}


function delete_this_td(x) {
    $(x).parent().remove();
    show_total_price();
}


function diagnosis_save(set) {
    if ($('#selected_reception').val().trim() == '') {
        alert(gettext('Select patient first.'));
        return;
    }

    if ($('#diagnosis').val().trim() == '') {
        alert(gettext('Diagnosis is empty.'));
        return;
    }


    chief_complaint = $('#chief_complaint').val();
    date = $("#reservation_date").val();
    datas = [];
    var table = $('#diagnosis_selected');
    var is_valid = true;
    table.find('tbody tr').each(function (i, el) {
        var $tds = $(this).find('td');
        temp_data = {};

        var code = $tds.html();
        if (code.indexOf("P") != -1) {
            temp_data['type'] = 'Precedure';
        } else {
            what_class = $tds.parent().parent().attr('id')
            if (what_class == 'diagnosis_selected_exam')
                temp_data['type'] = 'Exam';
            else if (what_class == 'diagnosis_selected_test')
                temp_data['type'] = 'Test';
            else if (what_class == 'diagnosis_selected_precedure')
                temp_data['type'] = 'Precedure';
            else if (what_class == 'diagnosis_selected_medicine')
                temp_data['type'] = 'Medicine';
        }


        temp_data['code'] = $tds.eq(0).text();
        temp_data['id'] = $tds.eq(0).children('input').val();
        temp_data['name'] = $tds.eq(1).text();
        //temp_data['volume'] = $tds.eq(2).children('input').val();
        //temp_data['amount'] = $tds.eq(3).children('input').val();
        temp_data['amount'] = $tds.eq(2).children('input').val();
        if (temp_data['amount'] == '') {
            alert(gettext('amount is empty.'));
            is_valid = false;
        }
        temp_data['days'] = $tds.eq(4).children('input').val();
        if (temp_data['days'] == '') {
            alert(gettext('days is empty.'));
            is_valid = false;
        }
        temp_data['memo'] = $tds.eq(5).children('input').val();

        datas.push(temp_data);
    });
    if (!is_valid) {
        return;
    }


    $.ajax({
        type: 'POST',
        url: '/doctor/diagnosis_save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': $('#selected_reception').val(),
            'chief_complaint': $('#chief_complaint').val(),
            'diagnosis': $('#diagnosis').val(),
            'objective_data': $('#objective_data').val(),
            'assessment': $('#assessment').val(),
            'plan': $('#plan').val(),
            'recommendation': $('#recommendation').val(),
            'datas': datas,
            'set': set,
            'date': date,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result == false) {
                alert(gettext('Only SOAPD and Recommend are saved. \nalready settled or is settled.'))
            } else {
                alert(gettext('Saved'));
                set_all_empty();
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function get_test_contents(category_id) {
    $.ajax({
        type: 'POST',
        url: '/doctor/get_test_contents/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'category_id': $('#category_id').val(),
        },
        dataType: 'Json',
        success: function (response) {
            $('#diagnosis_select_table tbody').empty();


        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}





function page_diagnosis(data) {
    window.location.href = 'diagnosis/' + data;
}





function makeHtml() {
    const obj = { html: '' };
    let html = '<div class="printPop">';

    html += '</div>';
    obj.html = html;
    return obj;
};

$('#print_test').on('click', function () {
    const completeParam = makeHtml();
    reportPrint(completeParam);


});



