jQuery.browser = {};

var timer_count = 0;
var image_tmp_count = 0;

var canvas = null
var signaturePad = null;


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
    $('#search_patient').keydown(function (key) {
        if (key.keyCode == 13) {
            reception_waiting();
            worker_on(false);
        }
    })


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
        else if (id == 'diagnosis_select_bundle_title') {
            $('#diagnosis_select_bundle_contents').show();
        }
        else if (id == 'diagnosis_select_package_title') {
            $('#diagnosis_select_package_contents').show();
        }
    });


    //select and set methods
    $('.contents_items tr').click(function (event) {
        if (event.target.nodeName.toLowerCase() == 'td') {
            //diagnosis_select_test_contents
            $(event.target.parentElement.parentElement.parentElement.parentElement).attr('id');
            var what_class = $(event.target.parentElement.parentElement.parentElement.parentElement).attr('id');
            if (what_class == 'diagnosis_select_bundle_contents') {
                bundle_id = $(event.target.parentElement).find('td:nth-child(6)').html();

                $.ajax({
                    type: 'POST',
                    url: '/doctor/get_bundle/',
                    data: {
                        'csrfmiddlewaretoken': $('#csrf').val(),
                        'bundle_id': bundle_id,
                    },
                    dataType: 'Json',
                    success: function (response) {
                        for (var i in response.datas) {
                            var what_class = response.datas[i]['type'];
                            var str = "<tr><td>" + response.datas[i]['code'] + "<input type='hidden' value=''/></td>";

                            if (what_class == 'Medicine') {
                                str += "<td>" + response.datas[i]['name'] + "<input type='hidden' value=''/></td><td style='text-align: center;'>" +
                                    "</td><td>" +
                                    "<input type='number' min='0' value='" + response.datas[i]['amount'] +
                                    "' class='diagnosis_selected_input_number' id='amount'/></td><td style='text-align: center;'>" +
                                    "<input type='number' min='0' value='" + response.datas[i]['days'] +
                                    "' class='diagnosis_selected_input_number' id='days'/></td><td style='text-align: center;'>" +
                                    "<input type='text' class='diagnosis_selected_input_number' id='memo'/></td>";
                            } else {
                                str += "<td colspan='5'>" + response.datas[i]['name'] + "<input type='hidden' value=''/></td>";
                            }

                            str += "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>";
                            str += "<td style='display:none;'>" + response.datas[i]['price'] + "</td></tr>";

                            if (what_class == 'Test')
                                $('#diagnosis_selected_test').append(str);
                            else if (what_class == 'Precedure')
                                $('#diagnosis_selected_precedure').append(str);
                            else if (what_class == 'Medicine')
                                $('#diagnosis_selected_medicine').append(str);


                            $('#diagnosis_selected input').change(function () {
                                show_total_price();
                            })
                            $('#diagnosis_selected input').keyup(function () {
                                show_total_price();
                            })


                            show_total_price();
                        }
                    },
                    error: function (request, status, error) {
                        console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                    },
                })
                return;
            }
            var str = "<tr><td>" + $(this).find('td:nth-child(2)').text().trim() + "<input type='hidden' value=''/></td>";

            if (event.target.parentElement.parentElement.parentElement.parentElement.id == 'diagnosis_select_medicine_contents') {
                //event.target.parentElement.parentElement.parentElement.getElementById('#tbody_contents_class_Injection');
                var check_input = $(event.target.parentElement.parentElement).attr('id');
                if (check_input == 'contents_items_Injection' ||
                    check_input == 'contents_items_Infusion'
                ) {
                    str += "<td>" + $(this).find('td:nth-child(3)').text().trim() + "<input type='hidden' value=''/></td><td style='text-align: center;'>" +
                        $(this).find('td:nth-child(6)').text().trim() + "</td><td>" +
                        "<input type='number' style='display:none;' min='0' value='1' class='diagnosis_selected_input_number' id='amount'/></td><td style='text-align: center;'>" +
                        "<input type='number' style='display:none;' min='0' value='1' class='diagnosis_selected_input_number' id='days'/></td><td style='text-align: center;'>" +
                        "<input type='text' class='diagnosis_selected_input_number' id='memo'/></td>";
                }
                else {
                    str += "<td>" + $(this).find('td:nth-child(3)').text().trim() + "<input type='hidden' value=''/></td><td style='text-align: center;'>" +
                        $(this).find('td:nth-child(7)').text().trim() + "</td><td>" +
                        "<input type='number' min='0' value='1' class='diagnosis_selected_input_number' id='amount'/></td><td style='text-align: center;'>" +
                        "<input type='number' min='0' value='1' class='diagnosis_selected_input_number' id='days'/></td><td style='text-align: center;'>" +
                        "<input type='text' class='diagnosis_selected_input_number' id='memo'/></td>";
                }
            } else {
                str += "<td colspan='5'>" + $(this).find('td:nth-child(3)').text().trim() + "<input type='hidden' value=''/></td>";
            }
            str += "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>";
            str += "<td style='display:none;'>" + $(this).find('td:nth-child(5)').text().replace(/,/g, '').replace('VND', '').trim() + "</td>";
            str += "<td style='display:none;'>" + $(this).find('td:nth-child(7)').text() + "</td></tr>"; // 패키지 여부

            what_class = $(event.target.parentElement.parentElement.parentElement.parentElement).attr('id');


            if (what_class == 'diagnosis_select_exam_contents')
                $('#diagnosis_selected_exam').append(str);
            else if (what_class == 'diagnosis_select_test_contents')
                $('#diagnosis_selected_test').append(str);
            else if (what_class == 'diagnosis_select_precedure_contents' || what_class == 'diagnosis_select_pm_radio_contents')
                $('#diagnosis_selected_precedure').append(str);
            else if (what_class == 'diagnosis_select_medicine_contents')
                $('#diagnosis_selected_medicine').append(str);

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
            nextText: '다음 달',
            prevText: '이전 달',
            currentText: '오늘',
            closeText: '닫기',
            monthNamesShort: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
            monthNames: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
            dateFormat: "yy-mm-dd",
            yearRange: '1900:2100',
        });
    }

    $('#reception_waiting_date,#reception_waiting_date_end').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        drops: "up",
        ranges: {
            'Today': [moment(), moment()],
        },
        locale: {
            format: 'YYYY-MM-DD',
        },
    });
    $("#reception_waiting_date,#reception_waiting_date_end").change(function () {
        reception_waiting();
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
    $('#reception_waiting_date_end').on('apply.daterangepicker', function () {
        today = moment().format('YYYY[-]MM[-]DD');
        date = $('#reception_waiting_date_end').val();
        if (date == today) {
            worker_on(true);
        } else {
            worker_on(false);
        }
    });
    $(".ranges ul li:first-child").click(function () {
        $("#search_patient").val('');
        worker_on(true);
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
            var temp = $(".contents_items > tr > td:nth-child(6):contains('" + k.toLowerCase() + "')");

            $(temp).parent().parent().show();
            $(temp).parent().parent().prev().children().children().children('label').html('-');
            $(temp).parent().show();
        }
    })




    //ICD
    function split(val) {
        return val.split(/,\s*/);
    }
    function extractLast(term) {
        return split(term).pop();
    }

    $("#search_icd")
        .on("keydown", function (event) {
            if (event.keyCode === $.ui.keyCode.TAB && $(this).autocomplete("instance").menu.active) {
                event.preventDefault();
            }
        })
        .autocomplete({
            source: function (request, response) {
                //$.getJSON("search.php", { term: extractLast(request.term) }, response);
                $.ajax({
                    type: 'POST',
                    url: '/doctor/get_ICD/',
                    data: {
                        'csrfmiddlewaretoken': $('#csrf').val(),
                        'string': request.term
                    },
                    dataType: 'Json',
                    success: function (response1) {
                        response(response1.datas);
                    },
                    error: function (request, status, error) {
                        console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                    },
                })
            },
            search: function () {
                // 최소 입력 길이를 마지막 항목으로 처리합니다.
                var term = extractLast(this.value);
                if (term.length < 2) {
                    return false;
                }
            },

            focus: function () {
                return false;
            },

            select: function (event, ui) {
                var terms = split(this.value);
                // 현재 입력값 제거합니다.
                terms.pop();
                // 선택된 아이템을 추가합니다.
                //terms.push(ui.item.value);
                // 끝에 콤마와 공백을 추가합니다.
                terms.push("");
                this.value = terms.join("");

                $("#text_icd").val(ui.item.value)

                $("#icd_code").val(ui.item.code);

                return false;
            },
            open: function (event, ui) {
                var $input = $(event.target),
                    $results = $input.autocomplete("widget"),
                    top = $results.position().top,
                    height = $results.height(),
                    inputHeight = $input.height(),
                    newTop = top - height - inputHeight;

                $results.css("top", newTop + "px");
            }
        });

    //이전 진료창 크게보기
    $("#past_diagnosis_showlarge").click(function () {
        $('#past_diagnosis_showlarge_table tbody').empty();
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

                    $('#past_diagnosis_showlarge_table tbody').append(str);
                }
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
            },
        })

        $('#past_diagnosis_showlarge_modal').modal({ backdrop: 'static' });
        $("#past_diagnosis_showlarge_modal").scrollTop(0);
        $('#past_diagnosis_showlarge_modal').modal('show');
    });




    //이미지 좌표 생성
    $("#dx_img_div").click(function (e) {

        x = e.offsetX - 10;
        y = e.offsetY - 10;
        //<div class="q2_items" data_code="1" data_seq="1-0-0" id="dx_image_items_1-0-0" style="background-image:url('/static/img/Medical_Exam_X.png'); left:105px; top:45px; display:none; "></div>

        var depart = get_department();
        var img_url = '/static/img/Medical_Exam_X.png';
        if (depart == 4) { //DERM
            img_url = '/static/img/Medical_Exam_X.png';
        } else if(depart == 8) { // DENTAL
            img_url = '/static/img/Medical_Exam_O.png';
        }
        console.log(depart)

        $("#dx_img_show").append("<div class='check_img' style='background-image: url(&#39;" + img_url + "&#39;);left:" + x + "px;top:" + y + "px;' " +
            "id=check_img_" + image_tmp_count + "></div >"); 
            
        $("#dx_img_div").append("<div style='left:" + (x + 13) + "px; top:" + (y - 8) + "px; ' class='close_check_img'" +
            " check-img=" + image_tmp_count + "><i class='fa fa-times-circle-o'></i></div > ");

        $(".close_check_img").unbind('click'); // 이벤트 중복 방지
        $(".close_check_img").bind('click', function (event) { // 체크모양 삭제 
            event.stopPropagation();
            var id = $(this).attr('check-img');
            $("#check_img_" + id).remove()
            $(this).remove();
        });
        image_tmp_count++;
    });


    $(".check_img").click(function (event) {
        //event.stopPropagation()

        
    })

    
    //패키지
    //$("#diagnosis_select_package_title").hide(); 


    //싸인패드
    canvas = document.getElementById("sign");
    signaturePad = new SignaturePad(canvas);
    signaturePad.backgroundColor = "rgb(0,0,0,0)";


    $("#sign_pad_clear").click(function () {
        signaturePad.clear();
        signaturePad.backgroundColor = "rgb(0,0,0,0)";
    });

});


//알람
function play_alarm() {
    //var x = document.getElementById("audio").play();
    ////var x = document.getElementById("ifr_audio").getElementById('audio').play();
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

        if (what_class == 'diagnosis_selected_medicine') {
            var price = parseInt($tds.eq(7).text().trim());
            var amount = parseInt($tds.eq(3).children('input').val());
            var days = parseInt($tds.eq(4).children('input').val());
            total += price * amount * days;
        }
        else {
            sd = $tds.eq(3).text();
            total += parseInt($tds.eq(3).text().trim());
        }

    });

    $('#total_price').html(numberWithCommas(total) + ' VND');

}



function set_all_empty() {
    $("#patient_id").val('');
    $("#reception_table .form-control").val('');


    $("#selected_reception").val('');

    $("#icd_code").val('');

    $(".doctor_diagnosis textarea").val('');

    $("#diagnosis_selected tbody").empty();
    $("#diagnosis_table tbody").empty();
    $("#dx_img_show,#dx_img_div").html('');

    

    show_total_price();

    //패키지
    $("#selected_package_id").val('')

    //$("#diagnosis_select_package_title").hide(); 
    //초기 시 진료 아이템 보이기
    $('#diagnosis_select_test_contents').hide();
    $('#diagnosis_select_precedure_contents').hide();
    $('#diagnosis_select_medicine_contents').hide();
    $('#diagnosis_select_bundle_contents').hide();
    $('#diagnosis_select_package_contents').hide();

    $('#diagnosis_select_exam_contents').show();
}


function set_past_diagnosis_date(element) {
    if (event.keyCode == 13) {
        date = $(element).next('.doctor_past_diagnosis_calendar');
        if (date.length == 0)
            date = $(element).next().next('.doctor_past_diagnosis_calendar');
        date.datepicker('setDate', $(element).val());
    }
}




function reception_select(reception_id, from_history = false) { 
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
            $("#patient_mark").val(response.marking)

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
            $("#text_icd").val(response.ICD);
            $("#icd_code").val(response.icd_code);
            $("#recommendation").val(response.recommendation);


            $('#need_medical_report').hide();
            if (response.need_medical_report) {
                $('#need_medical_report').show();
            }


            get_vital();
            get_all_diagnosis();
            set_under_treatment_btn(response.status);


            //패키지
            $("#diagnosis_select_package > tbody").empty();
            if (response.package) {
                console.log(response.package)
                for (var i = 0; i < response.package.length; i++) {
                    var str = '<tr>';
                    str += '<td>' + response.package[i].name + '</td>';
                    str += '<td>' + response.package[i].used_cnt + '/' + response.package[i].total_cnt + '</td>';
                    str += "<td><a class='btn btn-default btn-xs' style='margin-right:5px;' href='javascript: void (0);' onclick='patient_package_history_modal(" + response.package[i].id + ")' ><i class='fa fa-lg fa-search'></i></a></td>" +
                        "</tr > ";
                    $("#diagnosis_select_package > tbody").append(str);
                }
            } else {
                $("#selected_package_id").val('');
            }

            //불러올 때 진료 아이템 우선 보이기
            $('#diagnosis_select_test_contents').hide();
            $('#diagnosis_select_precedure_contents').hide();
            $('#diagnosis_select_medicine_contents').hide();
            $('#diagnosis_select_bundle_contents').hide();
            $('#diagnosis_select_package_contents').hide();

            $('#diagnosis_select_exam_contents').show();

            $('#need_invoice').prop('checked', response.need_invoice);
            $('#need_insurance').prop('checked', response.need_invoice);

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
                    response.datas['exams'][j]['id'] + "'/></td><td colspan='5'>" +
                    response.datas['exams'][j]['name'] + "</td>" +
                    "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
                    "<td style='display:none;'>" + response.datas['exams'][j]['price'] + "</td></tr > ";

                $('#diagnosis_selected_exam').append(str);
            }

            for (var j in response.datas['tests']) {

                var str = "<tr><td>" + response.datas['tests'][j]['code'] + "<input type='hidden' value='" +
                    response.datas['tests'][j]['id'] + "'/></td><td colspan='5'>" +
                    response.datas['tests'][j]['name'] + "</td>" +
                    "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
                    "<td style='display:none;'>" + response.datas['tests'][j]['price'] + "</td></tr > ";
                $('#diagnosis_selected_test').append(str);
            }

            for (var j in response.datas['precedures']) {
                var str = "<tr><td>" + response.datas['precedures'][j]['code'] + "<input type='hidden' value='" +
                    response.datas['precedures'][j]['id'] + "'/></td><td colspan='5'>" +
                    response.datas['precedures'][j]['name'] + "</td>" +
                    "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
                    "<td style='display:none;'>" + response.datas['precedures'][j]['price'] + "</td>" +
                    "<td style='display:none;'>" + response.datas['precedures'][j]['is_pkg'] + "</td></tr > ";
                $('#diagnosis_selected_precedure').append(str);
            }

            for (var j in response.datas['medicines']) {
                var str = "<tr><td>" + response.datas['medicines'][j]['code'] + "<input type='hidden' value='" +
                    response.datas['medicines'][j]['id'] + "'/></td><td>" +
                    response.datas['medicines'][j]['name'] + "</td>" +
                    "<td>" + response.datas['medicines'][j]['unit'] + "</td>" +
                    "<td><input type='number' class='diagnosis_selected_input_number' id='amount' value='" +
                    response.datas['medicines'][j]['amount'] + "'>" + "</td>" +
                    "<td><input type='number' class='diagnosis_selected_input_number' id='days' value='" +
                    response.datas['medicines'][j]['days'] + "'>" + "</td>" +
                    "<td><input type='text' class='diagnosis_selected_input' id='memo' value='" +
                    response.datas['medicines'][j]['memo'] + "'>" + "</td>" +
                    "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
                    "<td style='display:none;'>" + response.datas['medicines'][j]['price'] + "</td></tr > ";
                $('#diagnosis_selected_medicine').append(str);
            }

            $('.diagnosis_selected_input_number').change(function () {
                var regexp = /^[0-9]*$/;
                v = $(this).val();
                if (!regexp.test(v)) {
                    $(this).val(v.replace(/[^0-9]/g, ''));
                }
            })


            if (response.datas['img_check_list'] != undefined) {
                var list_check_img = eval(response.datas['img_check_list'])
                image_tmp_count = 0;
                image_url = get_depart_img()
                $("#dx_img_show,#dx_img_div").html('');

                console.log(response.datas['img_check_list'])
                console.log(list_check_img)
                for (var i = 0; i < list_check_img.length; i++) {
                    var tmp = list_check_img[i]
                    $("#dx_img_show").append("<div class='check_img' style='background-image: url(&#39;" + image_url + "&#39;);left:" + tmp['left'] + "px;top:" + tmp['top'] + "px;' " +
                        "id=check_img_" + image_tmp_count + "></div >");

                    $("#dx_img_div").append("<div style='left:" + (tmp['left'] + 13) + "px; top:" + (tmp['top'] - 8) + "px; ' class='close_check_img'" +
                        " check-img=" + image_tmp_count + "><i class='fa fa-times-circle-o'></i></div > ");

                    $(".close_check_img").unbind('click'); // 이벤트 중복 방지
                    $(".close_check_img").bind('click', function (event) { // 체크모양 삭제 
                        event.stopPropagation();
                        var id = $(this).attr('check-img');
                        $("#check_img_" + id).remove()
                        $(this).remove();
                    });
                    image_tmp_count++;
                }
            }


            // 패키지 목록 출력







            show_total_price();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })
}


function reception_waiting(Today = false, alarm = false) {
    var date;

    progress = $('#reception_progress').val();
    string = $("#search_patient").val();
    date = $('#reception_waiting_date').val();
    date_end = $('#reception_waiting_date_end').val();
    

    $.ajax({
        type: 'POST',
        url: '/doctor/reception_waiting/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'date': date,
            'date_end': date_end,
            'progress': progress,
            'string':string,
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
                    if (response.datas[i]['status'] == 'under_treat')
                        tr_class = "class ='success'"
                    else if (response.datas[i]['status'] == 'hold')
                        tr_class = "class ='warning'"
                    else if (response.datas[i]['status'] == 'done')
                        tr_class = "class ='danger'"
                    //if (response.datas[i]['status'] == 'done')
                    //    tr_class = "class ='danger'"
                    else {
                        tr_class = "class =''"
                        is_new = true;
                    }


                    var str = "<tr style='cursor:pointer;'" + tr_class + " onclick='reception_select(" +
                        response.datas[i]['reception_no'] +
                        ");" +
                        "get_diagnosis(" + response.datas[i]['reception_no'] +
                        ");'><td>" + (parseInt(i) + 1) + "</td>" +
                        "<td>";
                    if (response.datas[i]['package']) { // 패키지 접수
                        str += '<i class="fa fa-product-hunt"></i> ';
                    }

                        str += response.datas[i]['chart'] + "</td>" +
                        "<td>" + response.datas[i]['name_kor'] + "<br/>" + response.datas[i]['name_eng'] + "</td>" +
                        "<td>" + response.datas[i]['date_of_birth'] + '<br/>' + ' (' + response.datas[i]['age'] + '/' + response.datas[i]['gender'] + ")</td>";
                    if (string == '') {
                        str += "<td>" + response.datas[i]['reception_time'] + "</td></tr>";
                    }
                    else {
                        str += "<td>" + response.datas[i]['reception_datetime'] + "</td></tr>";
                    }
                        
                        

                    $('#Rectption_Status').append(str);
                }
            }
            //알람 
            //if (alarm && is_new)
                //play_alarm();
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



var w = undefined
function worker_on(is_run) {
    if (is_run) {
        if (window.Worker) {
            path = get_listener_path();
            w = new Worker(path);
            w.onmessage = function (event) {
                timer_count += 1;
                if (timer_count >= 1) {
                    timer_count = 0;
                    reception_waiting(true, true);
                } else {
                    reception_waiting(true, false);
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

function delete_this_td(x) {

    
    if ($(x).parent().find('td:nth-child(5)').html() == 'PKG_R') {
        if (!confirm(gettext("If Package Item deleted then saved, related information will deleted.\nAre you sure to delete this Package Item?"))) {
            return;
        }
    }
    


    $(x).parent().remove();
    show_total_price();
}


function diagnosis_save(set) {


    //상태값 저장
    var status = $("#status_drop_down").attr('status');
    if (status == '') {
        alert(gettext('Select status.'));
        return;
    }
    //set_under_treatment(status);


    if ($('#selected_reception').val().trim() == '') {
        alert(gettext('Select patient first.'));
        return;
    }

    if ($('#chief_complaint').val().trim() == '') {
        alert(gettext('Subjective Data is Empty.\nPlease fill in all the input of History Taking.'));
        return;
    }
    if ($('#objective_data').val().trim() == '') {
        alert(gettext('Objective Data is Empty.\nPlease fill in all the input of History Taking.'));
        return;
    }
    if ($('#assessment').val().trim() == '') {
        alert(gettext('Assessment is Empty.\nPlease fill in all the input of History Taking.'));
        return;
    }
    if ($('#plan').val().trim() == '') {
        alert(gettext('Plan is Empty.\nPlease fill in all the input of History Taking.'));
        return;
    }
    if ($('#diagnosis').val().trim() == '') {
        alert(gettext('Diagnosis is Empty.\nPlease fill in all the input of History Taking.'));
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
        temp_data['volume'] = 1;

        if (temp_data['type'] == 'Precedure') {
            temp_data['volume'] = 1;
            temp_data['amount'] = 1;
            temp_data['days'] = 1;
            if (temp_data['amount'] == '') {
                alert(gettext('amount is empty.'));
                is_valid = false;
            }
        } else {
            temp_data['amount'] = $tds.eq(3).children('input').val();
            if (temp_data['amount'] == '') {
                alert(gettext('amount is empty.'));
                is_valid = false;
            }
        }
        temp_data['days'] = $tds.eq(4).children('input').val();
        if (temp_data['days'] == '') {
            alert(gettext('days is empty.'));
            is_valid = false;
        }
        temp_data['memo'] = $tds.eq(5).children('input').val();

        //temp_data['code'] = $tds.eq(0).text();
        //temp_data['id'] = $tds.eq(0).children('input').val();
        //temp_data['name'] = $tds.eq(1).text();
        //if (temp_data['type'] == 'Precedure') {
        //    temp_data['volume'] = 1;
        //    temp_data['amount'] = $tds.eq(2).children('input').val();
        //    temp_data['days'] = 1;
        //    if (temp_data['amount'] == '') {
        //        alert(gettext('amount is empty.'));
        //        is_valid = false;
        //    }
        //}
        //if (temp_data['type'] == 'Medicine') {
        //    temp_data['volume'] = 1;
        //    temp_data['amount'] = $tds.eq(3).children('input').val();
        //    if (temp_data['amount'] == '') {
        //        alert(gettext('amount is empty.'));
        //        is_valid = false;
        //    }
        //    temp_data['days'] = $tds.eq(4).children('input').val();
        //    if (temp_data['days'] == '') {
        //        alert(gettext('days is empty.'));
        //        is_valid = false;
        //    }
        //    temp_data['memo'] = $tds.eq(5).children('input').val();
        //}

        datas.push(temp_data);
    });
    if (!is_valid) {
        return;
    }


    var img_check_list = []

    var list_items = $(".check_img")
    for (var i = 0; i < list_items.length; i++) {
        img_check_list.push({
            'top': $(list_items[i]).position().top,
            'left': $(list_items[i]).position().left
        });
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
            'ICD': $("#text_icd").val(),
            'icd_code': $("#icd_code").val(),
            'recommendation': $('#recommendation').val(),
            'datas': datas,
            'set': status,//set,
            'date': date,
            'family_history': $("#history_family").val(),
            'past_history': $("#history_past").val(),
            

            'img_check_list': JSON.stringify(img_check_list),
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result == false) {
                alert(response.msg)
            } else {
                alert(gettext('Saved'));
                if (set == 'done') {
                    set_all_empty();
                }
            }


        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })



    var id = $('#patient_id').val();
    var chart_no = $('#past_history').val();
    //var name_kor = $('#history_family').val();
    //var name_eng = $('#patient_name_eng').val();
    var date_of_birth = $('#patient_date_of_birth').val();
    var gender = $('input[name="gender"]:checked').val();
    var address = $('#patient_address').val();
    var phone = $('#patient_phone').val();
    var marking = $("#patient_mark").val();

    var past_history = $('#history_past').val();
    var history_family = $('#history_family').val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/save_patient/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id': id,
            'cahrt_no': chart_no,
            'date_of_birth': date_of_birth,
            'phone': phone,
            'gender': gender,
            'address': address,
            'marking': marking,
            'past_history': past_history,
            'family_history': history_family,
        },
        dataType: 'Json',
        success: function (response) {
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



//패키지
function patient_package_history_modal(id = null) {
    if (id == null) { return; }

    $.ajax({
        type: 'POST',
        url: '/receptionist/patient_package_history_modal/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id': id,
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
                    "<td>" + response.datas[i]['date_used'] + "</td>";
                if (response.datas[i]['date_used'] == '') {
                    str += "<td><a class='btn btn-primary' onclick='patient_package_use(" + response.datas[i]['id'] + ")'>" + gettext('Use') + "</a></td>";
                } else {
                    str += "<td><a class='btn btn-default' onclick='patient_package_cancel(" + response.datas[i]['id']  + ")'>" + gettext('Cancel') + "</a></td>";
                }
                str += "</tr>";

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


function patient_package_use(id) {
    if (confirm(gettext('Use package Item?'))) {

        $.ajax({
            type: 'POST',
            url: '/doctor/use_package/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'id': id,
            },
            dataType: 'Json',
            success: function (response) {
                patient_package_history_modal(id)
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    }
}


function patient_package_cancel(id) {
    if (confirm(gettext('Cancel package Item?'))) {
        $.ajax({
            type: 'POST',
            url: '/doctor/cancel_package/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'id': id,
            },
            dataType: 'Json',
            success: function (response) {
                patient_package_history_modal(id)
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    }

}

//동의서 모달
function list_aggreement() {

    var reception_id = $('#selected_reception').val();
    if (reception_id == '') {
        alert(gettext('Select patient first.'));
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/receptionist/list_agreement/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': reception_id,

        },
        dataType: 'Json',
        success: function (response) {
            $('#aggreement_list > tbody ').empty();
            for (var i = 0; i < response.datas.length; i++) {
                var str = "<tr>"

                str += " <td>" + (i + 1) + "</td>" +
                    "<td>" + response.datas[i]['depart'] + "</td>" +
                    "<td>" + response.datas[i]['name'] + "</td>" +
                    "<td>" + response.datas[i]['date'] + "</td>" +
                    "<td>";
                if (response.datas[i]['is_sign'] =='N') {
                    str += "<a class='btn btn-primary btn-xs' href='javascript: void (0);' onclick='sign_pad_modal(null,&#39;" + response.datas[i]['type'] + "&#39;)'> <i class='fa fa-lg fa-pencil-square-o'></i></a>";
                } else {
                    str += "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='sign_pad_modal(" + response.datas[i]['id'] + ",&#39;" + response.datas[i]['type'] + "&#39;)' > <i class='fa fa-lg fa-pencil'></i></a>" +
                        "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='sign_pad_delete(" + response.datas[i]['id'] + ")' > <i class='fa fa-lg fa-trash'></i></a>";
                }
                str += "</td></tr>";

                $('#aggreement_list > tbody').append(str);

            }

            $('#agreement_list_modal').modal({ backdrop: 'static', keyboard: false });
            $('#agreement_list_modal').modal('show');
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function sign_pad_modal(id, type) {

    $("#selected_sign_pad_id").val(id);
    $("#selected_sign_pad_type").val(type);

    signaturePad.clear();
    signaturePad.backgroundColor = "rgb(0,0,0,0)";

    console.log($("#selected_sign_pad_type").val())

    if (id != null) {
        $.ajax({
            type: 'POST',
            url: '/receptionist/get_agreement/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'id': id,

            },
            dataType: 'Json',
            success: function (response) {
                signaturePad.fromDataURL(response.sign_pad_data);
                console.log($("#selected_sign_pad_type").val())
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })

    }

    $('#sign_pad_modal').modal({ backdrop: 'static', keyboard: false });
    $('#sign_pad_modal').modal('show');
}

function sign_pad_save() {
    var reception_id = $('#selected_reception').val();
    var sign_pad_id = $('#selected_sign_pad_id').val();
    var sign_pad_type = $('#selected_sign_pad_type').val();

    var sign_pad_data = signaturePad.toDataURL();
    console.log($("#selected_sign_pad_type").val())
    $.ajax({
        type: 'POST',
        url: '/receptionist/save_agreement/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': reception_id,
            'sign_pad_id': sign_pad_id,
            'sign_pad_type': sign_pad_type,
            'sign_pad_data': sign_pad_data,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                alert(gettext('Saved.'));
                list_aggreement();
                $('#sign_pad_modal').modal('hide');
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function sign_pad_delete(id=null) {
    if (id == null) { return;}

    if (confirm(gettext('Do you want to delete?'))) {
        $.ajax({
            type: 'POST',
            url: '/receptionist/delete_agreement/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'id': id,
            },
            dataType: 'Json',
            success: function (response) {
                if (response.result) {
                    alert(gettext('Deleted.'));
                    list_aggreement();
                }

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })


    }


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



function set_under_treatment(status) {
    var reception_id = $('#selected_reception').val();
    if (reception_id == '') {
        alert(gettext('Select patient first.'));
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/doctor/set_under_treatment/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'reception_id': reception_id,
            'status': status,
        },
        dataType: 'Json',
        success: function (response) {


        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

    //set_under_treatment_btn(status);
}

function set_under_treatment_btn(status) {
    var str_status = '-'
    $("#status_drop_down").removeClass("btn-default btn-danger btn-warning btn-success");
    if (status == 'new') {
        str_status = gettext('Waiting');
        $("#status_drop_down").addClass('btn-default');
        $("#status_drop_down").attr('status', 'new');
    } else if (status == 'under_treat') {
        str_status = gettext('Under Treatement');
        $("#status_drop_down").addClass('btn-success');
        $("#status_drop_down").attr('status', 'under_treat');
    } else if (status == 'hold') {
        str_status = gettext('Hold');
        $("#status_drop_down").addClass('btn-warning');
        $("#status_drop_down").attr('status', 'hold');
    } else if (status == 'done') {
        str_status = gettext('Done');
        $("#status_drop_down").addClass('btn-danger');
        $("#status_drop_down").attr('status', 'done');
    }

    $("#status_drop_down_span").html(str_status);
}

