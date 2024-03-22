﻿
jQuery.browser = {};
var reception_event_count = 0;

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(function() {
    if ($('#patient_nationality').val() != 'Other'){
        $('#patient_nationality_etc').prop("disabled",true);
    }
    $('#patient_nationality').change(function(){
        var patient_nationality = $('#patient_nationality').val()
        if (patient_nationality != "Other"){
            $('#patient_nationality_etc').prop("disabled",true);
        }else{
            $('#patient_nationality_etc').prop("disabled",false);
        }
    });

    $('#new_memo_detail').on('keydown', function(e){ 
        if(e.keyCode == 13)
            {
                create_memo_detail()
            }
        }
    )

    $('#lbl_name_kor').click(function(){
        var name = $('#patient_name_kor').val()
        $('#name_id').val(name)
    })
    $('#lbl_name_eng').click(function(){
        var name = $('#patient_name_eng').val()
        $('#name_id').val(name)
    })
    $('#lbl_phone').click(function(){
        var name = $('#patient_phone').val()
        $('#phone_id').val(name)
    })
    $('#lbl_dob').click(function(){
        var name = $('#patient_date_of_birth').val()
        $('#dob_id').val(name)
    })
    $('#lbl_email').click(function(){
        var name = $('#patient_email').val()
        $('#email_id').val(name)
    })
    $('#lbl_chart').click(function(){
        var name = $('#patient_chart').val()
        $('#chart_id').val(name)
    })
    $('#lbl_memo').click(function(){
        var name = $('#memo').val()
        $('#memo_id').val(name)
    })

    $('#clear_search').click(function(){
        $('#name_id').val('');
        $('#phone_id').val('')
        $('#dob_id').val('')
        $('#email_id').val('')
        $('#chart_id').val('')
        $('#memo_id').val('')
        $('#memo_detail_id').val('')
    })
})


$(function () {
    //init


    //Patient 
    $('#memo_id').keydown(function (key) {
        if (key.keyCode == 13) {
            patient_search2();
        }
    })    
    $('#name_id').keydown(function (key) {
        if (key.keyCode == 13) {
            patient_search2();
        }
    })
    $('#chart_id').keydown(function (key) {
        if (key.keyCode == 13) {
            patient_search2();
        }
    })
    $('#dob_id').keydown(function (key) {
        if (key.keyCode == 13) {
            patient_search2();
        }
    })
    $('#email_id').keydown(function (key) {
        if (key.keyCode == 13) {
            patient_search2();
        }
    })
    $('#phone_id').keydown(function (key) {
        if (key.keyCode == 13) {
            patient_search2();
        }
    })


    $('#patient_search_input').keydown(function (key) {
        if (key.keyCode == 13) {
            patient_search2();
        }
    })

    $('#memo_detail_id').keydown(function (key) {
        if (key.keyCode == 13) {
            patient_search2();
        }
    })
    $('#re_patient_search_input').keydown(function (key) {
        if (key.keyCode == 13) {
            reservation_search();
        }
    })

    $('#reception_patient_search_input').keydown(function (key) {
        if (key.keyCode == 13) {
            reception_search();
        }
    })

    // if ($("#patient_date_of_birth").length > 0) {
    //     $("#patient_date_of_birth").daterangepicker({
    //         singleDatePicker: true,
    //         showDropdowns: true,
    //         autoUpdateInput: true,
    //         locale: {
    //             format: 'YYYY-MM-DD',
    //         },
    //     });
    // }
    $('#patient_date_of_birth').daterangepicker({
        autoUpdateInput: false,
        singleDatePicker: true,
        showDropdowns: true,
        drops: "down",
        locale: {
            format: 'YYYY-MM-DD',
        },
    });    

    $('#patient_date_of_birth').on('apply.daterangepicker', function (ev, picker) {
        $('#patient_date_of_birth').val(picker.startDate.format('YYYY-MM-DD'));
    });


    //Reception search
    if ($("#reception_waiting_date_start").length > 0) {
        $("#reception_waiting_date_start").daterangepicker({
            singleDatePicker: true,
            locale: {
                format: 'YYYY-MM-DD'
            }
        });
    }
    if ($("#reception_waiting_date_end").length > 0) {
        $("#reception_waiting_date_end").daterangepicker({
            singleDatePicker: true,
            locale: {
                format: 'YYYY-MM-DD'
            }
        });
    }


    //선택 시 
    $('#reception_waiting_date_start, #reception_waiting_date_end').on('apply.daterangepicker', function (ev, picker) {
        var today = moment().format('YYYY[-]MM[-]DD');
        if ($("#language").val() == 'vi') {
            $(this).val(picker.startDate.format('DD/MM/YYYY'));
        }
        reception_search();
    });







    //payment search
    if ($("#Datepicker_payment").length > 0) {
        $("#Datepicker_payment").datepicker({
            changeMonth: true,
            changeYear: true,
            nextText: '다음 달',
            prevText: '이전 달',
            currentText: '오늘',
            closeText: '닫기',
            monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            dateFormat: "yy-mm-dd",
        });
    }

    //reservation
    if ($("#Datepicker_reservation").length > 0) {
        $("#Datepicker_reservation").datepicker({
            changeMonth: true,
            changeYear: true,
            nextText: '다음 달',
            prevText: '이전 달',
            currentText: '오늘',
            closeText: '닫기',
            monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            dateFormat: "yy-mm-dd",
        });
    }
    if ($("#Datepicker").length > 0) {
        $("#Datepicker").datepicker({
            changeMonth: true,
            changeYear: true,
            nextText: '다음 달',
            prevText: '이전 달',
            currentText: '오늘',
            closeText: '닫기',
            monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            dateFormat: "yy-mm-dd",
        });
    }

    if ($("#Timepicker").length > 0) {
        $("#Timepicker").timepicker({
            minTime: '09: 00am',
            maxTime: '18: 00am',
            step: 10,
        });
    }

    $('#reception_reservation_date_start,#reception_reservation_date_end').daterangepicker({
        singleDatePicker: true,
        drops: "up",
        locale: {
            format: 'YYYY-MM-DD'
        }
    });

    $('#reception_reservation_date_start,#reception_reservation_date_end').on('apply.daterangepicker', function () {
        var today = moment().format('YYYY[-]MM[-]DD');
        if ($("#language").val() == 'vi') {
            $(this).val(picker.startDate.format('DD/MM/YYYY'));
        }
        reservation_search();
    });


    if ($("#language").val() == 'vi') {
        var today = moment().format('DD[/]MM[/]YYYY');
        $('#reception_waiting_date_start,#reception_waiting_date_end').val(today);
        $('#reception_reservation_date_start,#reception_reservation_date_end').val(today);

        reservation_search();
        reception_search();
    } else {
        reservation_search();
        reception_search();
    }


    $("#depart_select").change(function () {
        get_doctor($("#depart_select"));
    });
    $("#edit_reception_depart").change(function () {
        get_doctor($("#edit_reception_depart"));
    });




    $("#reception_waiting_depart").change(function () {
        reception_search();
        get_doctor($("#reception_waiting_depart"));
    });
    $("#reception_waiting_doctor").change(function () {
        reception_search();
    });


    $("#reservation_depart_select").change(function () {
        reservation_search();
        get_doctor($("#reservation_depart_select"));
    });
    $("#reservation_doctor_select").change(function () {
        reservation_search();
    });

    $("#search_depart_filter_package").change(function () {
        get_doctor($("#search_depart_filter_package"));
    });
    $("#depart_filter_reg").change(function () {
        get_doctor($("#depart_filter_reg"));
    });


    //보험
    $('#patient_tax_invoice_click').click(function () {

        //초기화
        $('#tax_exam_EventModal input[type=hidden]').val('');
        $('#tax_exam_EventModal input[type=text]').val('');

        //불러오기
        $.ajax({
            type: 'POST',
            url: '/receptionist/Tax_Invoice/get/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'patient_id': $('#patient_id').val(),
            },
            dataType: 'Json',
            success: function (response) {
                //id - hidden
                $('#selected_tax_invoice_id').val(response['id']),
                //chart no
                $('#tax_invoice_chart').val(response['chart']);
                //name
                $('#tax_invoice_name').val(response['name_kor'] + "/" + response['name_eng']);
                //date of birth
                $('#tax_invoice_date_of_birth').val(response['date_of_birth'] + ' (' + response['gender'] + '/' + response['age'] + ")");

                //tax invoice info
                $('#tax_invoice_number').val(response['number']);
                $('#tax_invoice_company_name').val(response['company_name']);
                $('#tax_invoice_address').val(response['address']);
                $('#tax_invoice_employee').val(response['employee']);
                $('#tax_invoice_contact').val(response['contact']);
                $('#tax_invoice_memo').val(response['memo']);

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })



        $('#tax_exam_EventModal').modal({ backdrop: 'static', keyboard: false });
        $("#tax_exam_EventModal").scrollTop(0);
        $('#tax_exam_EventModal').modal('show');


        //저장
        $('#tax_invoice_save').click(function () {
            $.ajax({
                type: 'POST',
                url: '/receptionist/Tax_Invoice/save/',
                data: {
                    'csrfmiddlewaretoken': $('#csrf').val(),
                    'patient_id': $('#patient_id').val(),
                    'number': $('#tax_invoice_number').val(),
                    'company_name': $('#tax_invoice_company_name').val(),
                    'address': $('#tax_invoice_address').val(),
                    'employee': $('#tax_invoice_employee').val(),
                    'contact': $('#tax_invoice_contact').val(),
                    'memo': $('#tax_invoice_memo').val(),
                },
                dataType: 'Json',
                success: function (response) {
                    $('#tax_exam_EventModal').modal('hide');
                },
                error: function (request, status, error) {
                    console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

                },
            })


        })

    })

    $('#vital_sign_click').click(function () {
        $.ajax({
            type: 'POST',
            url: '/doctor/get_vital/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'patient_id': $('#patient_id').val(),
            },
            dataType: 'Json',
            success: function (response) {
                $('#list_vital_sign > tbody ').empty();
                var str = "";
                for (var i = 0; i < response.datas.length; i++) {
                        str += 
                            "<tr>" +
                            "<td>" + response.datas[i]['fulldate'] + "</td>" + 
                            "<td>" + response.datas[i]['height'] + "</td>" + 
                            "<td>" + response.datas[i]['weight'] + "</td>" + 
                            "<td>" + response.datas[i]['blood_pressure'] + "</td>" + 
                            "<td>" + response.datas[i]['blood_temperature'] + "</td>" + 
                            "<td>" + response.datas[i]['pulse_rate'] + "</td>" + 
                            "<td>" + response.datas[i]['breath'] + "</td>" + 
                            "</td></tr>";
    
                    
                }
                $('#list_vital_sign > tbody').append(str);
                // $('#list_vital_sign').modal('show')
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
        $('#modal_vital').modal('show');
    })


    //문2 선택
    $(".q2_item_select ").change(function () {
        var data_code = $(this).attr('data_code');

        if ($('#pain_location_text_' + data_code).is(':checked') != true) {
            $('#pain_location_text_' + data_code).prop('checked', true);
        }
        

        str = '';
        str += parseInt($('#pain_location_text_' + data_code).val()) + '-';
        str += parseInt($("#q2_item_select1_" + data_code).val()) + '-';
        str += parseInt($("#q2_item_select2_" + data_code).val()) ;

        $('.q2_items').each(function () {

            if ($(this).attr('data_code') == data_code) {
                $(this).hide();
            }
        });
            
        
        $('#q2_items_' + str).show();
    })
    //문2 해제
    $('.pain_location_text').change(function () {
        if ($(this).is(':checked')!= true) {
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



    //문진 
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
    

    $("#patient_initial_report_click").click(function () {
        $.ajax({
            type: 'POST',
            url: '/receptionist/Question/get/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'patient_id': $('#patient_id').val(),
            },
            dataType: 'Json',
            success: function (response) {


                //문진 
                

                //init
                $('.q2_items').hide();

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
    });

    $("#save").click(function () {
        var regex = /^[0-9]*$/;
        //vital sign

        var vital_height = $('#input_vital_height').val();
        var vital_weight = $('#input_vital_weight').val();
        var vital_bmi = $('#input_vital_bmi').val();
        var vital_bp = $('#input_vital_bp').val();
        var vital_bt = $('#input_vital_bt').val();



        //2.
        var q2_item = "";
        var q2_date = "";
        //$('.pain_location_text:checkbox:checked').each(function () {
        //    q2_item += (this.checked ? $(this).val() + "," : "");
        //})

        q2_date = $('#occurred_date').val();
        $('.q2_items:visible').each(function () {
            q2_item += $(this).attr('data_seq') + ',';
        });
        $('#pain_location_text_23, #pain_location_text_24, #pain_location_text_25, #pain_location_text_26, #pain_location_text_27').each(function () {
            q2_item += (this.checked ? $(this).val() + "," : "");
        });


        //3.
        var q3_yn = $('#treatment_history_yn').prop("checked");
        var q3_phy_yn, q3_inject_yn, q3_medi_yn, q3_needle_yn;
        var q3_phy_cnt, q3_inject_cnt, q3_medi_cnt, q3_needle_cnt;
        q3_phy_yn = $('#physiotherapy_yn').prop("checked");
        if (q3_phy_yn) {
            q3_phy_cnt = $("#physiotherapy_count").val();
        }

        q3_inject_yn = $('#injection_treatment_yn').prop("checked");
        if (q3_inject_yn) {
            q3_inject_cnt = $("#injection_treatment_count").val();
        }

        q3_medi_yn = $('#taking_medicine_yn').prop("checked");
        if (q3_medi_yn) {
            q3_medi_cnt = $("#taking_medicine_count").val();
        }

        q3_needle_yn = $('#acupuncture_yn').prop("checked");
        if (q3_needle_yn) {
            q3_needle_cnt = $("#acupuncture_count").val();
        }

        //4.
        var q4 = $(".js-range-slider").val();

        //5.
        var q5_yn = $(':radio[name="operation_yn"]:checked').val();
        var q5_year = '';
        var q5_name = '';
        if (q5_yn == undefined) {
            alert(gettext('Question 5 is empty.'));
            return;
        }
        if (q5_yn == 1) {
            q5_year = $("#operation_year").val();
            q5_name = $("#operation_name").val();
        }

        //6.
        var q6_item = '';
        var q6_film = '';
        var q6_etc = $('#test_etc').val();
        $('.test_kinds:checkbox:checked').each(function () {
            q6_item += (this.checked ? $(this).val() + "," : "");
        })


        $('.cd_film_yn:checkbox:checked').each(function () {
            q6_film += (this.checked ? $(this).val() + "," : "");
        })

        //7.
        var q7_item = '';
        var q7_etc = $('#disease_etc').val();
        var q7_medi = $('#medication').val();
        $('.disease_history_kinds:checkbox:checked').each(function () {
            q7_item += (this.checked ? $(this).val() + "," : "");
        });

        //8.
        var q8_yn = $(':radio[name="medicine_side_effects"]:checked').val();
        if (q8_yn == undefined) {
            alert(gettext('Question 8 is empty.'));
            return;
        }

        //9.
        var q9_yn = $(':radio[name="pregnant_radio"]:checked').val();
        if (q9_yn == undefined) {
            alert(gettext('Question 9 is empty.'));
            return;
        }

        //10.
        var q10_etc = $('#visit_motiv_etc').val();
        var q10_friend = $('#visit_motiv_friend').val();
        var q10_item = "";
        $('.visit_motiv_item:checkbox:checked').each(function () {
            q10_item += (this.checked ? $(this).val() + "," : "");
        })

        $.ajax({
            type: 'POST',
            url: '/receptionist/Question/save/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'patient_id': $('#patient_id').val(),


                'vital_height': vital_height,
                'vital_weight': vital_weight,
                'vital_bmi': vital_bmi,
                'vital_bp': vital_bp,
                'vital_bt': vital_bt,
                'pain_posi_text': q2_item,
                'sick_date': q2_date,
                'cure_yn': q3_yn,
                'cure_phy_yn': q3_phy_yn,
                'cure_phy_cnt': q3_phy_cnt,
                'cure_inject_yn': q3_inject_yn,
                'cure_inject_cnt': q3_inject_cnt,
                'cure_medi_yn': q3_medi_yn,
                'cure_medi_cnt': q3_medi_cnt,
                'cure_needle_yn': q3_needle_yn,
                'cure_needle_cnt': q3_needle_cnt,
                'pain_level': q4,
                'surgery_yn': q5_yn,
                'surgery_year': q5_year,
                'surgery_name': q5_name,
                'exam_kind': q6_item,
                'exam_etc': q6_etc,
                'cd_film_yn': q6_film,
                'disease_kind': q7_item,
                'disease_etc': q7_etc,
                'medication': q7_medi,
                'side_effect_yn': q8_yn,
                'pregnant_yn': q9_yn,
                'visit_motiv_etc': q10_etc,
                'visit_motiv_friend': q10_friend,
                'visit_motiv_item': q10_item,
            },
            dataType: 'Json',
            success: function (response) {
                $('#medical_exam_EventModal').modal('hide');
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    });

    //vital sign
    $("#input_vital_bp, #input_vital_temp, #input_vital_rr, #input_vital_pr").keyup(function () {
        var str = $(this).val();
        $(this).val(str.replace(/[^0-9./]/g, ""));
    });



    //3
    $("#physiotherapy_count").prop('disabled', true);
    $('#physiotherapy_yn').click(function () {
        if ($(this).prop("checked")) {
            $("#physiotherapy_count").prop('disabled', false);
        } else {
            $("#physiotherapy_count").val('');
            $("#physiotherapy_count").prop('disabled', true);
        }
    })
    $("#physiotherapy_count").keyup(function () {
        var str = $(this).val();
        $(this).val(str.replace(/[^0-9]/g, ""));
    });

    $("#injection_treatment_count").prop('disabled', true);
    $('#injection_treatment_yn').click(function () {
        if ($(this).prop("checked")) {
            $("#injection_treatment_count").prop('disabled', false);
        } else {
            $("#injection_treatment_count").val('');
            $("#injection_treatment_count").prop('disabled', true);
        }
    })
    $("#injection_treatment_count").keyup(function () {
        var str = $(this).val();
        $(this).val(str.replace(/[^0-9]/g, ""));
    });

    $("#taking_medicine_count").prop('disabled', true);
    $('#taking_medicine_yn').click(function () {
        if ($(this).prop("checked")) {
            $("#taking_medicine_count").prop('disabled', false);
        } else {
            $("#taking_medicine_count").val('');
            $("#taking_medicine_count").prop('disabled', true);
        }
    })
    $("#taking_medicine_count").keyup(function () {
        var str = $(this).val();
        $(this).val(str.replace(/[^0-9]/g, ""));
    });

    $("#acupuncture_count").prop('disabled', true);
    $('#acupuncture_yn').click(function () {
        if ($(this).prop("checked")) {
            $("#acupuncture_count").prop('disabled', false);
        } else {
            $("#acupuncture_count").val('');
            $("#acupuncture_count").prop('disabled', true);
        }
    })
    $("#acupuncture_count").keyup(function () {
        var str = $(this).val();
        $(this).val(str.replace(/[^0-9]/g, ""));
    });

    //5
    $('#operation_year').prop('disabled', true);
    $('#operation_name').prop('disabled', true);
    $('input:radio[name=operation_yn]').click(function () {
        var is_checked = $(':radio[name="operation_yn"]:checked').val();
        if (is_checked == 1) {
            $('#operation_year').prop('disabled', false);
            $('#operation_name').prop('disabled', false);
        } else {
            $('#operation_year').prop('disabled', true);
            $('#operation_name').prop('disabled', true);
        }
    });


    reception_search();
    new_patient_option(false);



    


    $("#search_filter_package").change(function () {
        search_package_item();
    });
    $("#search_string_package").click(function () {
        if (key.keyCode == 13) {
            search_package_item();
        }
    });

    $("#search_btn_package").click(function () {
        search_package_item();
    });


});


$("#reservation_table").click(function () {
    $('#reservation_table > tbody > tr').remove();
    $('#reservation_table > tbody').append('<tr><td>추가된 라인!!</td></tr>');

});


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
function new_patient_option(on_off) {
    if (on_off) {
        $('#patient_tax_invoice_click').attr('disabled', false);
        $('#vital_sign_click').attr('disabled', false);
        $('#patient_initial_report_click').attr('disabled', false);
        $('#need_medical_report').attr('disabled', false);
        $('#need_invoice').attr('disabled', false);
        $('#need_insurance').attr('disabled', false);

    } else {
        $('#patient_tax_invoice_click').attr('disabled', true);
        $('#vital_sign_click').attr('disabled', true);
        $('#patient_initial_report_click').attr('disabled', true);
        $('#need_medical_report').attr('disabled', true);
        $('#need_medical_report').prop('checked', false);
        //$('#need_invoice').attr('disabled', true);
        $('#need_invoice').prop('checked', false);
        //$('#need_insurance').attr('disabled', true);
        $('#need_insurance').prop('checked', false);


    }
}

function reservation_none() {
    $('#reservation_table > tbody').append('<tr><td colspan="5"> - 예약 없음 - </td></tr>');
}
function check_reservation(data) {
    $.ajax({
        type: 'POST',
        url: '/receptionist/check_reservation/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': data,
        },
        dataType: 'Json',
        success: function (response) {
            alert(response.datas.length);
            $('#reservation_table > tbody > tr').remove();
            if (response.datas.length == 0 ) {
                reservation_none();
            }
            else {
                for (var i in response.datas)
                    $('#reservation_table > tbody').append("<tr><td>추가된 라인!!</td></tr>");
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}

//index.html begin
function earse_inputs() {
    $('#patient_id').val('');
    $('#reception_table input[type=text] ').each(function () {
        name = $(this).attr("name");
        if (name == 'gender' || $(this).attr('id') == 'patient_tax_invoice_click') {
            return;
        } else {
            $(this).val('');
        }
    })
    $('#depart_select option:eq(0)').prop("selected", true);
    $('#doctor_select option:eq(0)').prop("selected", true);
    // $('#patient_nationality option:eq(0)').prop("selected", true);
    $('#patient_gender option:eq(0)').prop("selected", true);
    $('#patient_mark option:eq(0)').prop("selected", true);
    $('#patient_funnel option:eq(0)').prop("selected", true);

    $('input:radio[name=gender]').prop('checked', false);


    $("#is_vaccine").prop("checked", false);

}

function set_cancel() {
    earse_inputs();
    new_patient_option(false);
}

function set_new_patient() {
    earse_inputs();
    new_patient_option(false);
    $.ajax({
        type: 'POST',
        url: '/receptionist/set_new_patient/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
        },
        dataType: 'Json',
        success: function (response) {
            //$('#patient_chart').val(response.chart);
            
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

    var nation =  $('#patient_nationality').val();
    console.log(nation)
    if(nation == 'Vietnam'){
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
    }
    else if(nation == 'Korea'){
        NumberRegex2 = /^[0]*(\d{10})*\s*$/;
        if(phone.length == 10 || phone.length == 11){
            if(NumberRegex.test(phone) || NumberRegex2.test(phone)){
            //do whatever you want to
            }else{
                alert('Invalid phone number')
                return false;
            }
        }else if(phone.length > 11){
            alert('Invalid phone number')
            return false;
        }else if(phone.length < 10){
            if(phone != 'na' && phone != 'NA' ){
                alert('Invalid phone number')
                return false;
            }              
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
    
    if (nationality == "Other"){
        nationality = $('#patient_nationality_etc').val();
    }

    var address = $('#patient_address').val();
    var passport = $('#patient_passport').val();
    var phone = $('#patient_phone').val();
    var email = $('#patient_email').val();
    var memo = $('#memo').val();
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

    var tax_invoice_contact = $('#tax_invoice_contact').val();
    var tax_invoice_employee = $('#tax_invoice_employee').val();
    var tax_invoice_memo = $('#tax_invoice_memo').val();

// 77777
    var patient_table_vital_ht = $('#patient_table_vital_ht').val();
    var patient_table_vital_wt = $('#patient_table_vital_wt').val();
    var patient_table_vital_bmi = $('#patient_table_vital_bmi').val();
    var patient_table_vital_bp = $('#patient_table_vital_bp').val();
    var patient_table_vital_bt = $('#patient_table_vital_bt').val();
    var patient_table_vital_pr = $('#patient_table_vital_pr').val();
    var patient_table_vital_breath = $('#patient_table_vital_breath').val();



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
            'passport': passport,
            'past_history': past_history,
            'family_history': family_history,
            'email': email,
            'memo': memo,
            'marking': marking,
            'funnel': funnel,
            'funnel_etc': funnel_etc,

            'tax_invoice_number': tax_invoice_number,
            'tax_invoice_company_name': tax_invoice_company_name,
            'tax_invoice_address': tax_invoice_address,
            'tax_invoice_contact': tax_invoice_contact,
            'tax_invoice_employee': tax_invoice_employee,
            'tax_invoice_memo': tax_invoice_memo,


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
                earse_inputs();
                set_new_patient(false);


                //검색 리스트에 띄우기
                $('#Patient_Search > tbody ').empty();
                var str = "<tr style='cursor:pointer;' onclick='set_patient_data(" +
                    parseInt(response.id) +
                    ")'><td>" + 1 + "</td>";

                str += "<td>";


                str += response.chart + "</td>" +
                    "<td>" + response.name_kor + '<br/>' + response.name_eng + "</td>" +
                    "<td>" + response.date_of_birth + ' (' + response.gender + '/' + response.age + ")</td>" +
                    "<td>" + response.phonenumber + "</td>" +
                    "<td>" + response.depart + "</td>" +
                    "<td>" + response.address + "</td></tr>";

                $('#Patient_Search').append(str);
            } else {
                alert(gettext('Failed.'));
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}


function reception_check_required() {
    var t, $t;
    var fields = [$('#depart_select'),
        $('#doctor_select'),]



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
    if (nationality == "Other"){
        nationality = $('#patient_nationality_etc').val();
    }
    //var gender = $('input[name="gender"]:checked').val();
    var address = $('#patient_address').val();
    var passport = $('#patient_passport').val();
    var phone = $('#patient_phone').val();
    var email = $('#patient_email').val();
    var memo = $('#memo').val();
    var marking = $('#patient_mark').val();
    var funnel = $('#patient_funnel').val();
    var funnel_etc = $('#patient_funnel_etc').val();

    var past_history = $('#history_past').val();
    var family_history = $('#history_family').val();

    var depart = $('#depart_select').val();
    if (depart == '') {
        alert(gettext('Select Depart.'));
        return;
    }

    var doctor = $('#doctor_select').val();
    if (doctor == '') {
        alert(gettext('Select Doctor.'));
        return;
    }
    var chief_complaint = $('#chief_complaint').val();

    var tax_invoice_number = $('#tax_invoice_number').val();
    var tax_invoice_company_name = $('#tax_invoice_company_name').val();
    var tax_invoice_address = $('#tax_invoice_address').val();
    
    var tax_invoice_contact = $('#tax_invoice_contact').val();
    var tax_invoice_employee = $('#tax_invoice_employee').val();
    var tax_invoice_memo = $('#tax_invoice_memo').val();

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
            'passport': passport,
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

            'tax_invoice_number': tax_invoice_number,
            'tax_invoice_company_name': tax_invoice_company_name,
            'tax_invoice_address': tax_invoice_address,

            'tax_invoice_contact': tax_invoice_contact,
            'tax_invoice_employee': tax_invoice_employee,
            'tax_invoice_memo': tax_invoice_memo,

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
                reception_search(true);
                earse_inputs();
                set_new_patient(false);


                //검색 리스트에 띄우기
                $('#Patient_Search > tbody ').empty();
                var str = "<tr style='cursor:pointer;' onclick='set_patient_data(" +
                    parseInt(response.id) +
                    ")'><td>" + 1 + "</td>";

                str += "<td>";


                str += response.chart + "</td>" +
                    "<td>" + response.name_kor + ' / ' + response.name_eng + "</td>" +
                    "<td>" + response.date_of_birth + ' (' + response.gender + '/' + response.age + ")</td>" +
                    "<td>" + response.phonenumber + "</td>" +
                    "<td>" + response.depart + "</td>" +
                    "<td>" + response.address + "</td></tr>";

                $('#Patient_Search').append(str);


            } else {
                alert(gettext('failed to recepted.'));
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
        url: '/receptionist/set_patient_data/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_id').val(response.id);
            $('#patient_chart').val(response.chart);
            $('#patient_name_kor').val(response.name_kor);
            $('#patient_name_eng').val(response.name_eng);

            if ($("#language").val() == 'vi') {
                $('#patient_date_of_birth').val( moment(response.date_of_birth, 'YYYY-MM-DD').format('DD/MM/YYYY') );
            } else {
                $('#patient_date_of_birth').val(response.date_of_birth);
            }
            
            $('#patient_address').val(response.address);
            $('#patient_passport').val(response.passport);
            $('#patient_phone').val(response.phone);
            $("#patient_gender").val(response.gender);
            
            if(response.nationality == "Korea" || response.nationality == "Vietnam"){
                $('#patient_nationality').val(response.nationality);
               
            }
            else{
                $('#patient_nationality_etc').val(response.nationality);
                $('#patient_nationality').val(response.nationality);
            }
           
            $('#patient_email').val(response.email);
            // $('#reception_chief_complaint}').val(response.chief_complaint);
            $('#memo').val(response.memo);
            $("#patient_mark").val(response.marking);
            $("#patient_funnel").val(response.funnel);
            $("#patient_funnel_etc").val(response.funnel_etc);
            
            $('#history_past').val(response.history_past);
            $('#history_family').val(response.history_family);

            $('input:radio[name=gender]').filter('[value=' + response.gender + ']').prop('checked', true);  

            //tax invoice 6666
            $('#tax_invoice_number').val(response.tax_invoice_number);
            $('#tax_invoice_company_name').val(response.tax_invoice_company_name);
            $('#tax_invoice_address').val(response.tax_invoice_address);

            $('#tax_invoice_contact').val(response.tax_invoice_contact);
            $('#tax_invoice_employee').val(response.tax_invoice_employee);
            $('#tax_invoice_memo').val(response.tax_invoice_memo);

            //prop('checked', false)
            $('#need_invoice').prop('checked', false)
            $('#need_insurance').prop('checked', false)
            if (response.invoice) {
                $('#need_invoice').prop('checked', true)
            }
            if (response.insurance) {
                $('#need_insurance').prop('checked', true)
            }
            $('#chief_complaint').val(response.chief_complaint);
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

    new_patient_option(true);
}


function patient_search(data) {
    //window.location.href = 'reception/' + data;

    var category = $('#patient_search_select option:selected').val();
    var string = $('#patient_search_input').val();
    var string2 = $('#patient_search_input2').val();
    // if (string == null || string == '') {
    //     alert(gettext('Input search string.'));
    //     return;
    // }
    console.log(string2)
    $.ajax({
        type: 'POST',
        url: '/receptionist/patient_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'category': category,
            'string': string,
            'memo_string': string2,
        },
        dataType: 'Json',
        success: function (response) {
            $('#Patient_Search > tbody ').empty();
            if (response.datas.length == 0) {
                $('#Patient_Search').append("<tr><td colspan='8'>" + gettext('No Result !!') + "</td></tr>");
            } else {
                for (var i in response.datas) {
                    var str = "<tr style='cursor:pointer;' onclick='set_patient_data(" +
                        parseInt(response.datas[i]['id']) +
                    ")'><td>" + (parseInt(i) + 1) + "</td>";

                    if (response.datas[i]['has_unpaid']) {
                        str += "<td style=color:rgb(228,97,131);>";
                    } else {
                        str += "<td>";
                    }

                    str += response.datas[i]['chart'] + "</td>" +
                        "<td>" + response.datas[i]['name_kor'] + '<br />' + response.datas[i]['name_eng'] + "</td>" +
                        "<td>";
                    if ($("#language").val() == 'vi') {
                        str += moment(response.datas[i]['date_of_birth'], 'YYYY-MM-DD').format('DD/MM/YYYY');
                    } else {
                        str += response.datas[i]['date_of_birth'];
                    }
                     str += ' (' + response.datas[i]['gender'] + '/' + response.datas[i]['age'] + ")</td>" +
                        "<td>" + response.datas[i]['phonenumber'] + "</td>" +
                        "<td>" + response.datas[i]['depart'] + "</td>" +
                        "<td>" + response.datas[i]['last_visit'] + "</td></tr>";
                        //"<td><a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='delete_database_precedure(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-history'></i></a></td></tr>";

                    $('#Patient_Search').append(str);
                }
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}

function patient_search2(data) {
    //window.location.href = 'reception/' + data;


    var memo = $('#memo_id').val();
    var name = $('#name_id').val();
    var chart = $('#chart_id').val();
    var email = $('#email_id').val();
    var phone = $('#phone_id').val();
    var dob = $('#dob_id').val();
    var memo_detail = $('#memo_detail_id').val();

    $.ajax({
        type: 'POST',
        url: '/receptionist/patient_search2/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'memo': memo,
            'name': name,
            'chart': chart,
            'email': email,
            'phone': phone,
            'dob': dob,
            'memo_detail':memo_detail
        },
        dataType: 'Json',
        success: function (response) {
            $('#Patient_Search > tbody ').empty();
            if (response.datas.length == 0) {
                $('#Patient_Search').append("<tr><td colspan='8'>" + gettext('No Result !!') + "</td></tr>");
            } else {
                for (var i in response.datas) {
                    var str = "<tr style='cursor:pointer;' onclick='set_patient_data(" +
                        parseInt(response.datas[i]['id']) +
                    ")'><td>" + (parseInt(i) + 1) + "</td>";

                    if (response.datas[i]['has_unpaid']) {
                        str += "<td style=color:rgb(228,97,131);>";
                    } else {
                        str += "<td>";
                    }

                    str += response.datas[i]['chart'] + "</td>" +
                        "<td>" + response.datas[i]['name_kor'] + '<br />' + response.datas[i]['name_eng'] + "</td>" +
                        "<td>";
                    if ($("#language").val() == 'vi') {
                        str += moment(response.datas[i]['date_of_birth'], 'YYYY-MM-DD').format('DD/MM/YYYY');
                    } else {
                        str += response.datas[i]['date_of_birth'];
                    }
                     str += ' (' + response.datas[i]['gender'] + '/' + response.datas[i]['age'] + ")</td>" +
                        "<td>" + response.datas[i]['phonenumber'] + "</td>" +
                        "<td>" + response.datas[i]['depart'] + "</td>" +
                        "<td>" + response.datas[i]['last_visit'] + "</td></tr>";
                        //"<td><a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='delete_database_precedure(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-history'></i></a></td></tr>";

                    $('#Patient_Search').append(str);
                }
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
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
            //chart no
            $('#edit_reception_chart').val(response['chart']);
            //name
            $('#edit_reception_name').val(response['name_kor'] + "/" + response['name_eng']);
            //date of birth
            $('#edit_reception_date_of_birth').val(response['date_of_birth'] + ' (' + response['gender'] + '/' + response['age'] + ")");

            //depart & doctor
            $('#edit_reception_depart option[value=' + response['depart_id'] + ']').prop("selected", true);
            get_doctor($("#edit_reception_depart"), null, response['doctor_id']);
            
            //$('#edit_reception_doctor option[value=' + response['doctor_id'] + ']').prop("selected", true);


            //chief complaint
            $("#edit_reception_chief_complaint").val(response['chief_complaint']);

            //medical_report
            if (response['medical_report'] == true)
                $('#reception_edit_need_medical_report').prop('checked', true);

            $('#selected_reception_id').val(response['id']);

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });


    ////////////////////////////////////////////////
    $('#Edit_Reception_EventModal').modal({ backdrop: 'static', keyboard: false });
    $("#Edit_Reception_EventModal").scrollTop(0);
    $('#Edit_Reception_EventModal').modal('show');

}

function reception_search() {
    var date_start, date_end, depart, doctor;

    date_start = $('#reception_waiting_date_start').val().trim();
    date_end = $('#reception_waiting_date_end').val().trim();
    patient_name = $('#reception_patient_search_input').val().trim();
    if ($("#language").val() == 'vi') {
        date_start = moment(date_start, 'DD/MM/YYYY').format('YYYY-MM-DD');
        date_end = moment(date_end, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }



    depart = $('#reception_waiting_depart option:selected').val().trim();
   //doctor = $('#reception_waiting_doctor option:selected').val().trim();

    $.ajax({
        type: 'POST',
        url: '/receptionist/reception_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'date_start': date_start,
            'date_end': date_end,
            'depart': depart,
            'doctor': doctor,
            'patient_name':patient_name
        },
        dataType: 'Json',
        success: function (response) {
            $('#Rectption_Status > tbody ').empty();
            if ( response.datas.length == 0 ) {
                $('#Rectption_Status').append("<tr><td colspan='9'>" + gettext('No Result !!') + "</td></tr>");
            } else {
                for (var i in response.datas) {
                    // $('#status').val(response.datas[i]['status']);
                    if (response.datas[i]['status'] == 'under_treat')
                        tr_class = "class ='success'"
                    else if (response.datas[i]['status'] == 'hold')
                        tr_class = "class ='warning'"
                    else if (response.datas[i]['status'] == 'done')
                        tr_class = "class ='danger'"
                    else {
                        tr_class = "class =''"
                        is_new = true;
                    }

                    var str = "<tr " + tr_class + " onclick='set_patient_data(" + response.datas[i]['patient_id'] + ")'" + "><td>" + (parseInt(i) + 1) + "</td>";

                        if (response.datas[i]['has_unpaid']) {
                            str += "<td style=color:rgb(228,97,131);>";
                        } else {
                            str += "<td>";
                        }
                    str += response.datas[i]['chart'];
                    if (response.datas[i]['is_vaccine'] == true) {
                        str += "<br/><label class='label label-success'>VACCINE<label>"
                    }
                    if (response.datas[i]['is_ksk'] == true) {
                        str += "<br/><label class='label label-danger'>KSK<label>"
                    }
                    str += "</td>" +
                        "<td>" + response.datas[i]['name_kor'] + "<br/>" + response.datas[i]['name_eng'] + "</td>" +
                        "<td>";
                    if ($("#language").val() == 'vi') {
                        str += moment(response.datas[i]['date_of_birth'], 'YYYY-MM-DD').format('DD/MM/YYYY');
                    } else {
                        str += response.datas[i]['date_of_birth'];
                    }

                    str += ' (' + response.datas[i]['gender'] + '/' + response.datas[i]['age'] + ")</td>" +
                        "<td>" + response.datas[i]['depart'] + "</td>" +
                        "<td>" + response.datas[i]['doctor'] + "</td>" +
                        "<td>" + response.datas[i]['date'] +  "<br/>" +  response.datas[i]['time'] + "</td>" +
                        "<td> " + response.datas[i]['is_new'] + "</td>" +
                        "<td>" +
                        "<input type='button' class='btn btn-default' value='Edit' onclick='reception_edit(" + response.datas[i]['id'] + ")' /></td>";
                    if (response.datas[i]['package'] == null) {;
                        str += "<td></td>";
                    } else {
                        str += "<td><input type='button' class='btn btn-danger' value='PKG' onclick='patient_package_history_modal(" + response.datas[i]['package'] + ")' /></td>";
                    }
                        str+="</tr> ";

                    $('#Rectption_Status').append(str);
                }
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}



function payment_search(Today = false,show_all_unpaid=false) {
    var date, status;

    if (Today) {
        var dt = new Date();

        var recentYear = dt.getFullYear();
        var recentMonth = dt.getMonth() + 1;
        var recentDay = dt.getDate();

        if (recentMonth < 10) recentMonth = "0" + recentMonth;
        if (recentDay < 10) recentDay = "0" + recentDay;
        date = recentYear + "-" + recentMonth + "-" + recentDay;
        $('#payment_date > input').val(date);
    } else {
        date = $('#payment_date > input').val();
    }
    status = $('#payment_status option:selected').val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/payment_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'date': date,
            'status': status,
            'show_all_unpaid': show_all_unpaid,
        },
        dataType: 'Json',
        success: function (response) {
            $('#Payment_Status > tbody ').empty();
            if (response.datas.length == 0) {
                $('#Payment_Status').append("<tr><td colspan='8'>" + gettext('No Result !!') + "</td></tr>");
            } else {
                for (var i in response.datas)
                    var str = "<tr><td>" + (parseInt(i) + 1) + "</td>" +
                        "<td>" + response.datas[i]['chart'] + "</td>" +
                        "<td>" + response.datas[i]['name_kor'] + "/" + response.datas[i]['name_eng'] + "</td>" +
                        "<td>" + response.datas[i]['gender'] + response.datas[i]['age'] + "</td>" +
                        "<td>" + response.datas[i]['reception_time'] + "</td>" +
                        "<td>" + response.datas[i]['depart'] + "</td>" +
                        "<td>" + response.datas[i]['doctor'] + "</td>" +
                        "<td>" + " - " + "</td></tr>";

                $('#Payment_Status').append(str);
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function reservation_search(Today = false) {
    var date, depart, doctor, status;

    //date = today = moment().format('YYYY[-]MM[-]DD');
    var date_start = $('#reception_reservation_date_start').val();
    var date_end = $('#reception_reservation_date_end').val();


    if ($("#language").val() == 'vi') {
        date_start = moment(date_start, 'DD/MM/YYYY').format('YYYY-MM-DD');
        date_end = moment(date_end, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }

    depart = $('#reservation_depart_select option:selected').val();
    doctor = $('#reservation_doctor_select option:selected').val();
    var string = $('#re_patient_search_input').val();


    $.ajax({
        type: 'POST',
        url: '/receptionist/reservation_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'date_start': date_start,
            'date_end': date_end,
            'depart': depart,
            'doctor': doctor,
            'status': status,
            'string': string,
        },
        dataType: 'Json',
        success: function (response) {
            $('#Reservation_Status > tbody ').empty();
            if (response.datas.length == 0) {
                $('#Reservation_Status').append("<tr><td colspan='8'>" + gettext('No Result !!') + "</td></tr>");
            } else {
                for (var i in response.datas) {
                    var str = "<tr title='" + response.datas[i]['memo'] + "'><td>" + (parseInt(i) + 1) + "</td>";

                        if (response.datas[i]['has_unpaid']) {
                            str += "<td style=color:rgb(228,97,131);>";
                        } else {
                            str += "<td>";
                    }
                    var str = "<tr style='cursor:pointer;' onclick='set_reservation_data(" +
                        parseInt(response.datas[i]['id']) +
                    ")'><td>" + (parseInt(i) + 1);                    
                    // str += response.datas[i]['id'] 
                    str += "</td>" + 
                        "<td>" + response.datas[i]['chart'] + "</td>";                   
                    // str += response.datas[i]['chart'] 
                    if (response.datas[i]['division'] == 'VACCIN') {
                        str += "<br/><label class='label label-success'>VACCINE<label>"
                    }
                    str += "</td>" + 
                        "<td>" + response.datas[i]['name'] + "</td>" +
                        "<td>";
                    if ($("#language").val() == 'vi') {
                        str += moment(response.datas[i]['date_of_birth'], 'YYYY-MM-DD').format('DD/MM/YYYY');
                    } else {
                        str += response.datas[i]['date_of_birth'];
                    }
                    str += "</td>" +
                        "<td>" + response.datas[i]['phone'] + "</td>" +
                        "<td>" + response.datas[i]['depart'] + "<br/>" + response.datas[i]['doctor'] + "</td>";
                    if ($("#language").val() == 'vi') {
                        str += "<td>" + response.datas[i]['time'] + " " +
                            moment(response.datas[i]['date'], 'YYYY-MM-DD').format('DD/MM/YYYY') + "</td>";
                    } else {
                        str += "<td>" + response.datas[i]['date'] + ' ' +
                            response.datas[i]['time'] + "</td>";
                    }

                    str += "<td>" + response.datas[i]['memo'] + "</td>"
                    str += "</tr>";

                    $('#Reservation_Status').append(str);
                }
                
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}



function worker_on(path) {
    if ($("input:checkbox[id='work_on']").is(":checked") == true) {
        if (window.Worker) {
            w = new Worker(path);
            w.onmessage = function (event) {
                reception_search(true);
            };

        } else {
        }
    } else {
        w.terminate();
        w = undefined;
    }
}


//Edit Reception Save
function edit_reception_save() {
    rec_id = $('#selected_reception_id').val();
    depart = $('#edit_reception_depart option:selected').val();
    doctor = $('#edit_reception_doctor option:selected').val();
    chief_complaint = $('#edit_reception_chief_complaint').val();
    medical_report = $('#reception_edit_need_medical_report').is(':checked');

    let patient_table_vital_ht = $('#edit_reception_vital_ht').val();
    let patient_table_vital_wt = $('#edit_reception_vital_wt').val();
    let patient_table_vital_bp = $('#edit_reception_vital_bp').val();
    let patient_table_vital_bt = $('#edit_reception_vital_bt').val();
    let patient_table_vital_pr = $('#edit_reception_vital_pr').val();
    let patient_table_vital_breath = $('#edit_reception_vital_breath').val();

    console.log("patient_table_vital_bt", patient_table_vital_bt)
    // #66666
    if (depart == '') {
        alert(gettext('Select Depart.'));
        return;
    }
    if (doctor == '') {
        alert(gettext('Select Doctor.'));
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/receptionist/Edit_Reception/save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': rec_id,
            'depart': depart,
            'doctor': doctor,
            'chief_complaint': chief_complaint,
            'medical_report': medical_report,

            
            'patient_table_vital_ht': patient_table_vital_ht,
            'patient_table_vital_wt': patient_table_vital_wt,
    
            'patient_table_vital_bp': patient_table_vital_bp,
            'patient_table_vital_bt': patient_table_vital_bt,
            'patient_table_vital_pr': patient_table_vital_pr,
            'patient_table_vital_breath': patient_table_vital_breath,
        },
        dataType: 'Json',
        success: function (response) {
            alert(gettext('Saved.'));
            reception_search();
            $('#Edit_Reception_EventModal').modal('hide');
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })

}

function edit_reception_del() {
    if (confirm(gettext('Are you sure you want to delete ?'))) {

        rec_id = $('#selected_reception_id').val();
        $.ajax({
            type: 'POST',
            url: '/receptionist/Edit_Reception/delete/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'reception_id': rec_id,
            },
            dataType: 'Json',
            success: function (response) {
                alert(gettext('Deleted.'));
                reception_search();
                $('#Edit_Reception_EventModal').modal('hide');
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            },
        })
    }

    

}

function set_reservation_data(reservation_id) {

    $.ajax({
        type: 'POST',
        url: '/receptionist/reservation_info/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reservation_id': reservation_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_id').val(response.patient_id);
            $('#patient_chart').val(response.patient_chart);
            $('#patient_name_kor').val(response.patient_name_kor);
            $('#patient_name_eng').val(response.patient_name_eng);

            if ($("#language").val() == 'vi') {
                $('#patient_date_of_birth').val( moment(response.reservation_date_of_birth, 'YYYY-MM-DD').format('DD/MM/YYYY') );
            } else {
                $('#patient_date_of_birth').val(response.reservation_date_of_birth);
            }
            $('#patient_address').val(response.patient_address);
            $('#patient_phone').val(response.reservation_phone);
            $("#patient_gender").val(response.patient_gender);
            // $('#patient_nationality').val(response.patient_nationality);
            if(response.patient_nationality == "Korea" || response.patient_nationality == "Vietnam"){
                $('#patient_nationality').val(response.patient_nationality);
                $('#patient_nationality_etc').val('');
            }
            else{
                $('#patient_nationality_etc').val(response.patient_nationality);
                $('#patient_nationality').val(response.patient_nationality);
            }
            $('#patient_email').val(response.patient_email);
            $('#patient_passport').val(response.patient_passport);
            $('#memo').val(response.patient_memo);
            $("#patient_mark").val(response.marking);
            $("#patient_funnel").val(response.funnel);
            $("#patient_funnel_etc").val(response.funnel_etc);
            
            $('#history_past').val(response.history_past);
            $('#history_family').val(response.history_family);
            $('#chief_complaint').val(response.reservation_memo);
            $('input:radio[name=gender]').filter('[value=' + response.gender + ']').prop('checked', true);  

            //tax invoice
            $('#tax_invoice_number').val(response.tax_invoice_number);
            $('#tax_invoice_company_name').val(response.tax_invoice_company_name);
            $('#tax_invoice_address').val(response.tax_invoice_address);
            $('#tax_invoice_contact').val(response.tax_invoice_contact);
            $('#tax_invoice_employee').val(response.tax_invoice_employee);
            $('#tax_invoice_memo').val(response.tax_invoice_memo);

            //prop('checked', false)
            $('#need_invoice').prop('checked', false)
            $('#need_insurance').prop('checked', false)
            if (response.need_invoice) {
                $('#need_invoice').prop('checked', true)
            }
            if (response.need_insurance) {
                $('#need_insurance').prop('checked', true)
            }
            $('#depart_select').val(response.reservation_depart);
            get_doctor($("#depart_select"),null, response.reservation_doctor);
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

    new_patient_option(true);
}



//패키지

function patient_package_list_modal() {


    var patient_id = $("#patient_id").val()

    //if (patient_id == '') {
    //    alert(gettext('Select Patient first.'));
    //    return;
    //}

    patient_package_list(patient_id)

    $('#patient_package_list_modal').modal({ backdrop: 'static', keyboard: false });
    $('#patient_package_list_modal').modal('show');



}


function patient_package_list(patient_id) {

    $.ajax({
        type: 'POST',
        url: '/receptionist/patient_package_list/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'patient_id': patient_id,
        },
        dataType: 'Json',
        success: function (response) {



            //chart no
            $('#patient_package_chart').val(response['chart']);
            //name
            $('#patient_package_name').val(response['name_kor'] + " / " + response['name_eng']);
            //date of birth
            $('#patient_package_date_of_birth').val(response['date_of_birth'] + ' (' + response['gender'] + '/' + response['age'] + ")");




            $('#patient_package_list_table > tbody ').empty();
            for (var i = 0; i < response.datas.length; i++) {

                var str = "<tr>";

                str += " <td>" + (i + 1) + "</td>" +
                    "<td>" + response.datas[i]['depart'] + "</td>" +
                    "<td>" + response.datas[i]['name'] + "</td>" +
                    "<td>" + response.datas[i]['count_now'] + ' / ' + response.datas[i]['count_max'] + "</td>" +
                    "<td><a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='patient_package_history_modal(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-search'></i></a></td>" +
                    "<td><a class='btn btn-warning btn-xs' href='javascript: void (0);' onclick='patient_package_registration_modal(" + response.datas[i]['id'] + "," + response.datas[i]['depart_id'] + "," + response.datas[i]['doctor'] +")'>" + gettext('Registration') + "</a></td>" +
                    "</tr>";

                $('#patient_package_list_table > tbody').append(str);
            }


        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function patient_package_history(id = null) {
    if (id == null) { return; }



}

function patient_package_registration_modal(id = null,depart,doctor) {
    if (id == null) { return; }

    $("#patient_package_registration_id").val(id);
    $("#depart_filter_reg").val(depart);


    get_doctor($("#depart_filter_reg"),null, doctor);

    $('#patient_package_reception_modal').modal({ backdrop: 'static', keyboard: false });
    $('#patient_package_reception_modal').modal('show');

}

function patient_package_reception() {
    var id = $("#patient_package_registration_id").val();
    var patient_id = $("#patient_id").val();
    var depart_id = $("#depart_filter_reg").val();
    var doctor_id = $("#doctor_filter_reg").val();


    $.ajax({
        type: 'POST',
        url: '/receptionist/patient_package_reception/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'id': id, //패키지 아이디
            'patient_id': patient_id,
            'depart_id': depart_id,
            'doctor_id': doctor_id,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                alert(gettext('has been Recepted.'))
                $('#patient_package_reception_modal').modal('hide');
                $('#patient_package_list_modal').modal('hide');


                reception_search(true);
                earse_inputs();
                set_new_patient(false);


                //완료 처리
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })


}

function package_add_modal() {

    $('#search_filter_package').val('');
    $('#search_string_package').val('');
    search_package_item();

    $('#package_add_modal').modal({ backdrop: 'static', keyboard: false });
    $('#package_add_modal').modal('show');
}

function search_package_item(page = null) {
    var context_in_page = 10;

    var string = $('#search_string_package').val();
    //var filter = $('#precedure_search_select').val();
    var filter = $("#search_depart").val();

   
    $.ajax({
        type: 'POST',
        url: '/receptionist/package_list/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'string': string,
            //'filter': filter,
            'filter': filter,

            'page': page,
            'context_in_page': context_in_page,
        },
        dataType: 'Json',
        success: function (response) {
            $('#package_list_table > tbody ').empty();
            for (var i = 0; i < context_in_page; i++) {
                if (response.datas[i]) {
                    var str = "<tr style='cursor:pointer;' onclick='set_package_to_patient(" + response.datas[i]['id'] + ")'>"
                    
                    str += " <td>" + response.datas[i]['code'] + "</td>" +
                        "<td>" + response.datas[i]['name'] + "</td>" +
                        "<td>" + numberWithCommas( response.datas[i]['price'] ) + "</td>" +
                        "<td>" + response.datas[i]['count'] + "</td>" +
                        "</tr>";

                } else {
                    var str = "<tr><td></td><td></td><td></td><td></td></tr>";
                }
                $('#package_list_table > tbody').append(str);
            }


            //페이징
            $('#medicine_pagnation').html('');
            str = '';
            if (response.has_previous == true) {
                str += '<li> <a onclick="search_package_item(' + (response.page_number - 1) + ')">&laquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&laquo;</span></li>';
            }

            for (var i = response.page_range_start; i < response.page_range_stop; i++) {
                if (response.page_number == i) {
                    str += '<li class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
                }
                else if (response.page_number + 5 > i && response.page_number - 5 < i) {
                    str += '<li> <a onclick="search_package_item(' + i + ')">' + i + '</a></li>';
                }
                else {
                }

            }
            if (response.has_next == true) {
                str += '<li><a onclick="search_package_item(' + (response.page_number + 1) + ')">&raquo;</a></li>';
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


function set_package_to_patient(id) {

    var patient_id = $("#patient_id").val()
    var depart_id = $("#search_depart_filter_package").val()
    var doctor_id = $("#search_doctor_filter_package").val()

    if (depart_id == '' || doctor_id=='') {
        alert(gettext('Select Depart and Doctor first.'));
        return;
    }

    if (confirm(gettext('Do you want to add the service to the patient?'))) {

        $.ajax({
            type: 'POST',
            url: '/receptionist/set_package_to_patient/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id, // 패키지 ID
                'patient_id': patient_id,
                'depart_id': depart_id,
                'doctor_id': doctor_id,
            },
            dataType: 'Json',
            success: function (response) {
                var str = gettext('Saved.') + "\n" + gettext('Make payments on the storage screen');
                alert(gettext('Saved.'));
                $('#package_add_modal').modal('hide');
                patient_package_list(patient_id);
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })


    }
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



function vaccine_img_kor() {
    window.open('/static/img/vaccine_kor.jpg', 'Vaccine Kor', 'height = ' + screen.height + ', width = ' + screen.width + 'fullscreen = yes')
}
function vaccine_img_vie() {
    window.open('/static/img/vaccine_vie.jpg', 'Vaccine Vie', 'height = ' + screen.height + ', width = ' + screen.width + 'fullscreen = yes')
}


// $("#show_memo_detail").click(function () {
//     console.log('asdasda')
//     alert('hello')
//     $('#memo_detail_modal').modal('show')
// })


function show_memo_detail(){

    var id = $("#patient_package_registration_id").val();
    var patient_id = $("#patient_id").val();
    var depart_id = $("#depart_filter_reg").val();
    var doctor_id = $("#doctor_filter_reg").val();
    $('#memo_patient_search > tbody ').empty();
    $.ajax({
        type: 'POST',
        url: '/receptionist/get_memo_detail/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            // 'id': id, //패키지 아이디
            'patient_id': patient_id,
            // 'depart_id': depart_id,
            // 'doctor_id': doctor_id,

            
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                $('#table_memo_detail > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                        var str = "<tr>"
    
                        str += 
                            "<td hidden>" + response.datas[i]['detail_memo_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + response.datas[i]['depart'] + "</td>" +
                            "<td>" + response.datas[i]['creator'] + "</td>" +
                            "<td><input type='text' class='form-control' value='" + response.datas[i]['memo'] + "'></input></td>" +
                            "<td>" + response.datas[i]['memo_depart'] + "</td>" +
                            "<td>" + 
                            // "<a class='btn btn-default btn-xs' style='margin-right:10px;' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a> " +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a>" +
                            "</td></tr>";
    
                    $('#table_memo_detail > tbody').append(str);
    
                }

                $('#memo_detail_company').val(response.data_note['memo_detail_company'])
                $('#memo_detail_order').val(response.data_note['memo_detail_order'])
                $('#memo_detail_insurance').val(response.data_note['memo_detail_insurance'])
                $('#memo_detail_disease').val(response.data_note['memo_detail_disease'])
                $("#patient_mark").val(response.marking);
                // relation
                $('#table_relative_memo > tbody ').empty();
                for (var i = 0; i < response.data_relative.length; i++) {
                    var str = "<tr onclick='set_patient_data2(" + response.data_relative[i]['person_id'] + ")'>"
    
                        str += 
                            "<td hidden>" + response.data_relative[i]['relative_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
    
                            "<td>" + response.data_relative[i]['person_name'] + "</td>" +
    
                            "<td>" + response.data_relative[i]['relative_name'] + "</td>" +
                            
                            "<td>" + 
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_patient_relation(" + response.data_relative[i]['relative_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a> " +
                            "</td></tr>";
    
                    $('#table_relative_memo > tbody').append(str);
                }

                $('#memo_detail_modal').modal('show')
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
    // $('#memo_detail_modal').modal('show')
}

function create_memo_detail(){ 

    var patient_id = $("#patient_id").val();
    var memo = $('#new_memo_detail').val();
    var help_text = $('#help_text').val();
    var marking = $("#patient_mark").val();
    if (help_text != null && help_text){
        memo = $('#help_text option:selected').text();
        console.log($('#help_text option:selected').text())
    }
    var memo_depart = $('#memo_depart').val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/create_memo_detail/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,
            'memo': memo,
            'memo_depart': memo_depart,
            'marking': marking
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                $('#table_memo_detail > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                        var str = "<tr>"
    
                        str += 
                            "<td hidden>" + response.datas[i]['detail_memo_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + response.datas[i]['depart'] + "</td>" +
                            "<td>" + response.datas[i]['creator'] + "</td>" +
                            "<td><input type='text' class='form-control' value='" + response.datas[i]['memo'] + "'></input></td>" +
                            "<td>" + response.datas[i]['memo_depart'] + "</td>" +
                            "<td>" + 
                            // "<a class='btn btn-default btn-xs' style='margin-right:10px;' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a> " +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a> " +

                            "</td></tr>";
    
                    $('#table_memo_detail > tbody').append(str);
    
                }
                // alert(gettext('Hello'))
                console.log(response.datas)
                $('#memo_detail_modal').modal('show');
                $('#new_memo_detail').val('')
                $('#depart_memo').val('');
                $('#help_text').val('');
                alert(gettext('Created'));
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function delete_detail_memo(id){
    var patient_id = $("#patient_id").val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/delete_memo_detail/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'memo_id': id,
            'patient_id': patient_id
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                $('#table_memo_detail > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                        var str = "<tr>"
    
                        str += 
                            "<td hidden>" + response.datas[i]['detail_memo_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + response.datas[i]['depart'] + "</td>" +
                            "<td>" + response.datas[i]['creator'] + "</td>" +
                            "<td><input type='text' class='form-control' value='" + response.datas[i]['memo'] + "'></input></td>" +
                            "<td>" + response.datas[i]['memo_depart'] + "</td>" +
                            "<td>" + 
                            // "<a class='btn btn-default btn-xs' style='margin-right:10px;' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a> " +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a>" +
                            "</td></tr>";
    
                    $('#table_memo_detail > tbody').append(str);
    
                }
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function update_detail_memo(id){
    var patient_id = $("#patient_id").val();
    var memo = $(`#table_memo_detail > tbody > tr:contains("${id}")`).find('td:eq(4)').find('input').val()

    $.ajax({
        type: 'POST',
        url: '/receptionist/update_memo_detail/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'memo_id': id,
            'patient_id': patient_id,
            'memo': memo,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                $('#table_memo_detail > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                        var str = "<tr>"
    
                        str += 
                            "<td hidden>" + response.datas[i]['detail_memo_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + response.datas[i]['depart'] + "</td>" +
                            "<td>" + response.datas[i]['creator'] + "</td>" +
                            "<td><input type='text' class='form-control' value='" + response.datas[i]['memo'] + "'></input></td>" +
                            "<td>" + response.datas[i]['memo_depart'] + "</td>" +
                            "<td>" + 
                            // "<a class='btn btn-default btn-xs' style='margin-right:10px;' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a> " +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a></td> " +
                            "</tr>";
    
                    $('#table_memo_detail > tbody').append(str);
    
                }
                alert(gettext('Updated'));
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function update_patient_notes(){
    var patient_id = $("#patient_id").val();
    var memo_detail_company = $("#memo_detail_company").val();
    var memo_detail_order = $("#memo_detail_order").val();
    var memo_detail_insurance = $("#memo_detail_insurance").val();
    var memo_detail_disease = $("#memo_detail_disease").val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/update_patient_notes/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,
            'memo_detail_company': memo_detail_company,
            'memo_detail_order': memo_detail_order,
            'memo_detail_insurance': memo_detail_insurance,
            'memo_detail_disease': memo_detail_disease,
        },
        dataType: 'Json',
        success: function (response) {
            console.log("=======",response.datas)
            if (response.datas) {
                console.log(response.datas['memo_detail_company'])
                $('#memo_detail_company').val(response.datas['memo_detail_company'])
                $('#memo_detail_order').val(response.datas['memo_detail_order'])
                $('#memo_detail_insurance').val(response.datas['memo_detail_insurance'])
                $('#memo_detail_disease').val(response.datas['memo_detail_disease'])
            }
            alert('success')
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        }
    })
}

function create_patient_relation(){
    var patient_id = $("#patient_id").val();
    var person_name = $("#person_memo_id").val();
    var relative_name = $("#patient_relative_name").val();

    $.ajax({
        type: 'POST',
        url: '/receptionist/create_patient_relative/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,
            'person_id': person_name,
            'relative_name': relative_name,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result){
                $('#table_relative_memo > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                    var str = "<tr onclick='set_patient_data2(" + response.datas[i]['person_id'] + ")'>"
    
                        str += 
                            "<td hidden>" + response.datas[i]['relative_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
    
                            "<td>" + response.datas[i]['person_name'] + "</td>" +
    
                            "<td>" + response.datas[i]['relative_name'] + "</td>" +
                            
                            "<td>" + 
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_patient_relation(" + response.datas[i]['relative_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a> " +
                            "</td></tr>";
    
                    $('#table_relative_memo > tbody').append(str);
                }

                $("#patient_relative_name").val('');
                $("#person_name ").val('');
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        }
    })
}

function delete_patient_relation(id){
    var patient_id = $("#patient_id").val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/delete_patient_relative/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'relative_id': id,
            'patient_id': patient_id
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result){
                $('#table_relative_memo > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                    var str = "<tr onclick='set_patient_data2(" + response.datas[i]['person_id'] + ")'>"

                    str += 
                        "<td hidden>" + response.datas[i]['relative_id'] + "</td>" + 
                        "<td>" + (i + 1) + "</td>" +

                        "<td>" + response.datas[i]['person_name'] + "</td>" +

                        "<td>" + response.datas[i]['relative_name'] + "</td>" +
                        
                        "<td>" + 
                        "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_patient_relation(" + response.datas[i]['relative_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a> " +
                        "</td></tr>";
    
                    $('#table_relative_memo > tbody').append(str);
                }

                $("#patient_relative_name").val('');
                $("#person_name ").val('');
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        }
    })
}

$('textarea').keyup(function(e){
    if(e.keyCode == 13)
    {
        $(this).trigger("enterKey");
    }
});


function patient_search3(data) {
    //window.location.href = 'reception/' + data;

    var category = 'name';
    var string = $('#person_name').val();
 

    // console.log(string2)
    $.ajax({
        type: 'POST',
        url: '/receptionist/patient_search3/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'category': category,
            'string': string,
        },
        dataType: 'Json',
        success: function (response) {
            console.log('heheheheh')
            $('#memo_patient_search > tbody ').empty();
            if (response.datas.length == 0) {
                $('#memo_patient_search').append("<tr><td colspan='8'>" + gettext('No Result !!') + "</td></tr>");
            } else {
                console.log('huhuhu')
                var str = '';
                for (var i = 0; i < response.datas.length; i++) {
                    str += "<tr onclick='set_patient_search_relation(" + response.datas[i]['id'] + ")'>"
                    str += 
                        "<td>" + response.datas[i]['id'] + "</td>" +
                        "<td>" + response.datas[i]['name_kor'] + "</td>" +
                        "<td>" + response.datas[i]['phonenumber'] + "</td>" +
                        "<td>" + response.datas[i]['email'] + "</td> </tr>" 
                    
                }
                $('#memo_patient_search > tbody').append(str);
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function set_patient_search_relation(data){
    console.log('asdasdasd')
    $('#person_memo_id').val(data)
}

function set_patient_data2(patient_id) {

    $.ajax({
        type: 'POST',
        url: '/receptionist/set_patient_data/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#patient_id').val(response.id);
            $('#patient_chart').val(response.chart);
            $('#patient_name_kor').val(response.name_kor);
            $('#patient_name_eng').val(response.name_eng);

            if ($("#language").val() == 'vi') {
                $('#patient_date_of_birth').val( moment(response.date_of_birth, 'YYYY-MM-DD').format('DD/MM/YYYY') );
            } else {
                $('#patient_date_of_birth').val(response.date_of_birth);
            }
            
            $('#patient_address').val(response.address);
            $('#patient_passport').val(response.passport);
            $('#patient_phone').val(response.phone);
            $("#patient_gender").val(response.gender);
            
            if(response.nationality == "Korea" || response.nationality == "Vietnam"){
                $('#patient_nationality').val(response.nationality);
               
            }
            else{
                $('#patient_nationality_etc').val(response.nationality);
                $('#patient_nationality').val(response.nationality);
            }
           
            $('#patient_email').val(response.email);
            // $('#reception_chief_complaint}').val(response.chief_complaint);
            $('#memo').val(response.memo);
            $("#patient_mark").val(response.marking);
            $("#patient_funnel").val(response.funnel);
            $("#patient_funnel_etc").val(response.funnel_etc);
            
            $('#history_past').val(response.history_past);
            $('#history_family').val(response.history_family);

            $('input:radio[name=gender]').filter('[value=' + response.gender + ']').prop('checked', true);  

            //tax invoice
            $('#tax_invoice_number').val(response.tax_invoice_number);
            $('#tax_invoice_company_name').val(response.tax_invoice_company_name);
            $('#tax_invoice_address').val(response.tax_invoice_address);
            $('#chief_complaint').val(response.chief_complaint);

            //prop('checked', false)
            $('#need_invoice').prop('checked', false)
            $('#need_insurance').prop('checked', false)
            if (response.invoice) {
                $('#need_invoice').prop('checked', true)
            }
            if (response.insurance) {
                $('#need_insurance').prop('checked', true)
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
    $('#memo_detail_modal').modal('hide');
    new_patient_option(true);

}


function open_tax_search(){
    window.open('https://masothue.com/')
}