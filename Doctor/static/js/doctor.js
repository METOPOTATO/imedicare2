jQuery.browser = {};


var timer_count = 0;


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
// $(document).ready(
//     $(document).on('change', '.diagnosis_selected_input_number', function (event) {
//         console.log('abc')
//         var amount = event.target.value;
//         var code = $(event.target.parentElement.parentElement).find('td:nth-child(1)').text();
//         console.log(code)
//         var sourceRow = $(`#diagnosis_select_medicine_contents .contents_items > tr > td:contains("${code}")`).parent();
//         var amountData = $(sourceRow).find('td:nth-child(4)').html();
//         console.log(amount)
//         console.log(amountData)
//         if ( parseInt(amount) > parseInt(amountData) ){
//             alert('Cannot add more medicine');
//             $(this).val(parseInt(amountData))
//         }
//         show_total_price()
//     })
// )
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
    });


    //select and set methods
    $('.contents_items tr').click(function (event) {
        // var isValidCount = true;
        // if (event.target.parentElement.parentElement.parentElement.parentElement.id == 'diagnosis_select_medicine_contents') {
        //     var count = $(event.target.parentElement).find('td:nth-child(4)').html();
        //     count = parseInt(count);
        //     if (count <= 0){
        //         isValidCount = false;
        //         console.log('Not valid count')
        //         alert('This medicine is not available!(Loại thuốc này không còn trong kho)')
        //     }
        // }
        // if (isValidCount){
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


                            $('#diagnosis_selected input').off('change');
                            $('#diagnosis_selected input').change(function () {
                                show_total_price();
                            })
                            $('#diagnosis_selected input').off('keyup');
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
            str += "<td style='display:none;'>" + $(this).find('td:nth-child(5)').text().replace(/,/g, '').replace('VND', '').trim() + "</td></tr>";
            
            what_class = $(event.target.parentElement.parentElement.parentElement.parentElement).attr('id');

            
            if (what_class == 'diagnosis_select_exam_contents')
                $('#diagnosis_selected_exam').append(str);
            else if (what_class == 'diagnosis_select_test_contents')
                $('#diagnosis_selected_test').append(str);
            else if (what_class == 'diagnosis_select_precedure_contents' || what_class == 'diagnosis_select_pm_radio_contents')
                $('#diagnosis_selected_precedure').append(str);
            else if (what_class == 'diagnosis_select_medicine_contents')
                $('#diagnosis_selected_medicine').append(str);

            $('#diagnosis_selected input').off('change');
            $('#diagnosis_selected input').change(function () {
                show_total_price();
            })
            $('#diagnosis_selected input').off('keyup');
            $('#diagnosis_selected input').keyup(function () {
                show_total_price();
            })
            
            show_total_price();
        }
        // }
    });

    $('#diagnosis_selected_medicine').click(function (event){
        console.log(event.target)
    })

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

    $('#reception_waiting_date, #reception_waiting_date_end').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        drops: "up",
        locale: {
            format: "YYYY-MM-DD",
        },
        ranges: {
            'Today': [moment(), moment()],
        },
    });
    
    //언어 별 날짜 출력
    //초기값
    if ($("#language").val() == 'vi') {
        var today = moment().format('DD[/]MM[/]YYYY');
        $('#reception_waiting_date, #reception_waiting_date_end').val(today);
    }
    //선택 시 
    $('#reception_waiting_date').on('apply.daterangepicker', function (ev, picker) {
        var today = moment().format('YYYY[-]MM[-]DD');
        if ($("#language").val() == 'vi') {
            $(this).val(picker.startDate.format('DD/MM/YYYY'));
            today = moment().format('DD[/]MM[/]YYYY');
        } 
        date = $('#reception_waiting_date').val();
        if (date == today) {
            worker_on(true);
        } else {
            worker_on(false);
        }
    });
    //선택 시 
    $('#reception_waiting_date_end').on('apply.daterangepicker', function (ev, picker) {
        var today = moment().format('YYYY[-]MM[-]DD');
        if ($("#language").val() == 'vi') {
            $(this).val(picker.startDate.format('DD/MM/YYYY'));
            today = moment().format('DD[/]MM[/]YYYY');
        }
        date = $('#reception_waiting_date_end').val();
        if (date == today) {
            worker_on(true);
        } else {
            worker_on(false);
        }
    });
    worker_on(true);


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
        picker.container.find(".hourselect").append('<option value="10">10</option>' );
        picker.container.find(".hourselect").append('<option value="11">11</option>' );
        picker.container.find(".hourselect").append('<option value="12">12</option>' );
        picker.container.find(".hourselect").append('<option value="13">13</option>' );
        picker.container.find(".hourselect").append('<option value="14">14</option>' );
        picker.container.find(".hourselect").append('<option value="15">15</option>' );
        picker.container.find(".hourselect").append('<option value="16">16</option>');
        picker.container.find(".hourselect").append('<option value="17">17</option>');
        picker.container.find(".hourselect").append('<option value="18">18</option>');
        picker.container.find(".hourselect").append('<option value="19">19</option>');
        picker.container.find(".hourselect").append('<option value="20">20</option>');
        picker.container.find(".hourselect").append('<option value="21">21</option>');
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
    $('#reservation_date').on('cancel.daterangepicker', function(ev, picker) {
        $('#reservation_date').val('');
    });






    $(".show_list_btn").click(function () {
        $(".show_list_contents").slideToggle("slow");
    });


    $('.contents_items').change(function () {
    })
    
    $('.contents_class').click(function () {
        get_medicine_count();

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
        get_medicine_count();

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

        get_medicine_count();
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
            }

        });


    //진료창 크게 보기
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
                    var str = "<tr style='background:#94ee90'><td colspan='5'>" + response.datas[i]['date'] + "(" + response.datas[i]['day'] + ")[" + response.datas[i]['doctor'] + "]"+ 
                        "</td > " +
                        "</td></tr>" + /*"<tr><td colspan='5'>History: D-" + response.datas[i]['diagnosis']  + */

                        "<tr><td colspan='5'><font style='font-weight:700;'>History:</font><br/><font style='font-weight:700; color:#d2322d'>S - </font>" + response.datas[i]['subjective'] + "<br/><font style='font-weight:700; color:#d2322d'>O - </font>" +
                        response.datas[i]['objective'] + "<br/><font style='font-weight:700; color:#d2322d'>A - </font>" +
                        response.datas[i]['assessment'] + "<br/><font style='font-weight:700; color:#d2322d'>P - </font>" +
                        response.datas[i]['plan'] + "<br/><font style='font-weight:700; color:#d2322d'>D - </font>" +
                        response.datas[i]['diagnosis'] + "<br/><font style='font-weight:700; color:#d2322d'>Sub Clinical Test - </font>" +
                        response.datas[i]['sub_clinical_test'] +
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




    get_medicine_count();



    $("#playtest").click(function () {

    });

    $('#vaccine_date').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });

   
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


 //메디슨 클래스 혹은 약 아이템 클릭 시 갯수 동기화
function get_medicine_count(id = null) {

    $.ajax({
        type: 'POST',
        url: '/doctor/get_medicine_count/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id': id,
        },
        dataType: 'Json',
        success: function (response) {
            for (var i in response.datas) {
                $("#medicine_count_" + response.datas[i]['id']).html(response.datas[i]['inventory_count'])
            }
                

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })



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
            'all':'all',
            'patient_id': $('#patient_id').val(),
        },
        dataType: 'Json',
        success: function (response) {
            for (var i in response.datas) {
                var str = "<tr style='background:#94ee90'><td colspan='5'>" +
                    "<div style='width:400px;height:26px;display:inline-table;'><span style='display:table-cell;vertical-align:middle;'>" + response.datas[i]['date'] + "(" + response.datas[i]['day'] + ")[" + response.datas[i]['doctor'] + "]</span></div>" +

                    "<span style='float:right;'>" +
                    '<a class="btn btn-default btn-xs" href="javascript: void(0);" onclick="reception_select(' + response.datas[i]['reception_id'] +',true);get_diagnosis(' + response.datas[i]['reception_id'] + ',true)"><i class="fa fa-clone"> Copy</i></a>' +
                    "</span>" +
                    "</td > " +
                    "</td></tr>" + /*"<tr><td colspan='5'>History: D-" + response.datas[i]['diagnosis']  + */

                    "<tr><td colspan='5'><font style='font-weight:700;'>History:</font><br/><font style='font-weight:700; color:#d2322d'>S - </font>" + response.datas[i]['subjective'] + "<br/><font style='font-weight:700; color:#d2322d'>O - </font>" +
                    response.datas[i]['objective'] + "<br/><font style='font-weight:700; color:#d2322d'>A - </font>" +
                    response.datas[i]['assessment'] + "<br/><font style='font-weight:700; color:#d2322d'>P - </font>" +
                    response.datas[i]['plan'] + "<br/><font style='font-weight:700; color:#d2322d'>D - </font>" +
                    response.datas[i]['diagnosis'] + "<br/><font style='font-weight:700; color:#d2322d'>Sub Clinical Test - </font>" +
                    response.datas[i]['sub_clinical_test'] +
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
            var price = parseInt($tds.eq(7).text().trim() );
            var amount = parseInt( $tds.eq(3).children('input').val() );
            var days = parseInt( $tds.eq(4).children('input').val() );
            total += price * amount * days;
        }
        else {
            sd = $tds.eq(3).text();
            total += parseInt($tds.eq(3).text().trim() );
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




function reception_select(reception_id, from_history = false) { 
    $('#reservation_date').val('');
    $('#reservation_type').val('');
    $('#reservation_memo').val('');

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
            $("#patient_mark").val(response.marking);
            $('#patient_memo').val(response.memo);

            $('#history_past').val(response.history_past);
            $('#history_family').val(response.history_family);

            $('input:radio[name=gender]').filter('[value=' + response.gender + ']').prop('checked', true);
            $('#chief_complaint').val(response.chief_complaint);
            if (from_history == false) {
                $('#selected_reception').val(response.reception_id);
            }
            
            $('#reservation_date').val(response.reservation_date)
            $('#reservation_type').val(response.reservation_type)
            $('#reservation_memo').val(response.reservation_memo)

            $('#assessment').val(response.assessment);
            $('#objective_data').val(response.objective_data);
            $('#plan').val(response.plan);
            $('#diagnosis').val(response.diagnosis);
            $('#text_icd').val(response.ICD);
            $('#icd_code').val(response.icd_code);
            $("#sub_clinical_test").val(response.sub_clinical_test)
            $("#recommendation").val(response.recommendation);


            $('#need_medical_report').hide();
            if (response.need_medical_report) {
                $('#need_medical_report').show();
            }
            $('#need_invoice').prop('checked', response.need_invoice);
            $('#need_insurance').prop('checked', response.need_insurance);

            $(".vital_input").val('');

            get_vital();
            set_under_treatment_btn(response.status);

            if (from_history == false) {
                get_all_diagnosis();
            }
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
                var str = "<tr title=" + response.datas[i]['fulldate'] + "><td>" + response.datas[i]['date'] + "</td>" +
                    "<td>" + response.datas[i]['weight'] + "</td>" +
                    "<td>" + response.datas[i]['height'] +
                    "<td>" + response.datas[i]['blood_pressure'] + "</td>" +
                    "<td>" + response.datas[i]['blood_temperature'] + "</td>" +
                    "<td>" + response.datas[i]['breath'] + "</td>" +
                    "<td>" + response.datas[i]['pulse_rate']  + "</td></tr>";

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

    var is_empty = false;
    var list_vital = $(".vital_input")
    for (var i = 0; i < list_vital.length; i++) {
        if ($(list_vital[i]).val() != '')
            is_empty = true;
    }

    if (is_empty == false) {
        alert(gettext('Fill the blanks.'));
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

function get_diagnosis(reception_no, from_history = false) {

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
                var str = "<tr><td>" + response.datas['exams'][j]['code'] + "<input type='hidden' value='";
                if (from_history == false) {
                        str += response.datas['exams'][j]['id'];
                    }
                    str += "'/></td><td colspan='5'>" +
                    response.datas['exams'][j]['name'] + "</td>" +
                    "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
                    "<td style='display:none;'>" + response.datas['exams'][j]['price'] + "</td></tr > ";

                $('#diagnosis_selected_exam').append(str);
            }

            for (var j in response.datas['tests']) {
                    
                var str = "<tr><td>" + response.datas['tests'][j]['code'] + "<input type='hidden' value='";
                if (from_history == false) {
                    str += response.datas['tests'][j]['id'];
                }
                str +=  "'/></td><td colspan='5'>" +
                    response.datas['tests'][j]['name'] + "</td>" +
                    "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" + 
                    "<td style='display:none;'>" + response.datas['tests'][j]['price']+ "</td></tr > ";
                $('#diagnosis_selected_test').append(str);
            }
                
            for (var j in response.datas['precedures']) {
                var str = "<tr><td>" + response.datas['precedures'][j]['code'] + "<input type='hidden' value='";
                if (from_history == false) {
                    str += response.datas['precedures'][j]['id'];
                }
                str += "'/></td><td colspan='5'>" +
                    response.datas['precedures'][j]['name'] + "</td>" +
                    "<td style='cursor:pointer' onclick='delete_this_td(this)'>" + "x" + "</td>" +
                    "<td style='display:none;'>" + response.datas['precedures'][j]['price'] + "</td></tr > ";
                $('#diagnosis_selected_precedure').append(str);
            }
                
            for (var j in response.datas['medicines']) {
                var str = "<tr><td>" + response.datas['medicines'][j]['code'] + "<input type='hidden' value='";
                if (from_history == false) {
                    str += response.datas['medicines'][j]['id'];
                }
                    str += "'/></td><td>" +
                    response.datas['medicines'][j]['name'] + "</td>" +
                    "<td style='text-align: center;'>" + response.datas['medicines'][j]['unit'] + "</td>"  + 
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
            $('#diagnosis_selected input').off('change');
            $('#diagnosis_selected input').change(function () {
                show_total_price();
            })
            $('#diagnosis_selected input').off('keyup');
            $('#diagnosis_selected input').keyup(function () {
                show_total_price();
            })
                
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
    //언어에 따라 날짜가 다르기 때문에 서버 형식에 맞게 재설정 후 전송
    if ($("#language").val() == 'vi') {
        date = moment(date, 'DD/MM/YYYY').format('YYYY-MM-DD')
        date_end = moment(date_end, 'DD/MM/YYYY').format('YYYY-MM-DD')
    }

    $.ajax({
        type: 'POST',
        url: '/doctor/reception_waiting/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'date': date,
            'date_end': date_end,
            'progress': progress,
            'string': string,
        },
        dataType: 'Json',
        success: function (response) {
            $('#Rectption_Status > tbody ').empty();
            if (response.datas.length == 0) {
                $('#Rectption_Status').append("<tr><td colspan='8'>" + gettext('No Result !!') + "</td></tr>");
            } else {
                for (var i in response.datas) {
                    var color;
                    var is_new = false;
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

                    str += response.datas[i]['chart'];
                    console.log(response.datas[i]['is_vaccine'])
                    if (response.datas[i]['is_vaccine'] == true) {
                        str += "<br/><label class='label label-success'>VACCINE<label>"
                    }
                    str += "</td>" +
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

                //알람 
                if (alarm && is_new)
                    play_alarm();
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
    window.open('/doctor/show_medical_report/' + $('#selected_reception').val().trim()+ '?', 'Medical Report', 'width=920,height=465,left=0,top=100,resizable=no,location=no,status=no,scrollbars=yes');

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
                    reception_waiting(true, true);
                } else {
                    reception_waiting(true,false);
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
    
    // if ($('#chief_complaint').val().trim() == '') {
    //     alert(gettext('Subjective Data is Empty.\nPlease fill in all the input of History Taking.'));
    //     return;
    // }
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
    if ($('#sub_clinical_test').val().trim() == '') {
        alert(gettext('Sub Clinical Test is Empty.\nPlease fill in all the input of History Taking.'));
        return;
    }


    chief_complaint = $('#chief_complaint').val();

    reservation_date = $("#reservation_date").val();
    reservation_type = $("#reservation_type").val();
    reservation_memo = $("#reservation_memo").val();

    if (reservation_date != '') {
        if (reservation_type == '') {
            alert(gettext('Select Reservation Type.'));
        }
    }
    if (reservation_type != '') {
        if (reservation_date == '') {
            alert(gettext('Select Date.'));
        }
    }


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
        temp_data['name']= $tds.eq(1).text();
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
            'sub_clinical_test': $("#sub_clinical_test").val(),
            'recommendation': $('#recommendation').val(),
            'datas': datas,
            'set': status,// set,
            'reservation_date': reservation_date,
            'reservation_type': reservation_type,
            'reservation_memo': reservation_memo,
            'family_history': $("#history_family").val(),
            'past_history': $("#history_past").val(),
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result == false) {
                alert(response.msg)
            } else {
                alert(gettext('Saved'));
                set_all_empty();
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
        $("#status_drop_down").attr('status','new');
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



function vaccine_img_kor() {
    window.open('/static/img/vaccine_kor.jpg', 'Vaccine Kor', 'height = ' + screen.height + ', width = ' + screen.width + 'fullscreen = yes')
}
function vaccine_img_vie() {
    window.open('/static/img/vaccine_vie.jpg', 'Vaccine Vie', 'height = ' + screen.height + ', width = ' + screen.width + 'fullscreen = yes')
}


//백신
function vaccine_history_list() {

    var patient_id = $('#patient_id').val();
    if (patient_id == '') {
        alert(gettext('Select patient first.'));
        return;
    }

    $('#past_vaccine_table tbody').empty();

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
            console.log(response.list_history)
            for (var i = 0; i < response.list_history.length; i++) {

                var str = "<tr><td>" + parseInt(i + 1) + "</td>" +

                    "<td>" + response.list_history[i]['vaccine_name'] + "</td>" +
                    "<td>" + response.list_history[i]['medicine_name'] + "</td>" +
                    "<td>" + response.list_history[i]['round'] + "</td>" +
                    "<td>" + response.list_history[i]['hospital'] + "</td>" +
                    "<td>" + response.list_history[i]['vaccine_date'] + "</td>" +
                    "<td>" + response.list_history[i]['reservation'] + "</td>" +
                    "<td>" + response.list_history[i]['re_reservation'] + "</td>" +
                    "<td>" + response.list_history[i]['memo'] + "</td>" +

                    "<td>" +
                    "<a class='btn btn-default btn-xs' style='margin-right:5px;' href='javascript: void (0);' onclick='vaccine_history_modal(" + response.list_history[i].id + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                    "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='vaccine_history_delete(" + response.list_history[i].id + ")' ><i class='fa fa-lg fa-trash'></i></a>" +

                    '</td></tr > ';

                $('#past_vaccine_table tbody').append(str);

            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })



    $('#past_vaccine_modal').modal({ backdrop: 'static' });
    $("#past_vaccine_modal").scrollTop(0);
    $("#past_vaccine_modal").modal('show');
}



function vaccine_history_modal(id = '') {

    $("#selected_vaccine_history").val('');
    $("#vaccine_name").val('');
    $("#medicine_name").val('');
    $("#round").val('');
    $("#vaccine_date").val('');
    $("#hospital").val('');
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
                $("#hospital").val(response.vaccine_hospital);
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
    var round = $("#round").val();
    var hospital = $("#hospital").val();
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
                'hospital': hospital,
                'round': round,
                'vaccine_date': vaccine_date,
                'memo': memo,
            },
            dataType: 'Json',
            success: function (response) {
                alert(gettext('Saved.'))

                vaccine_history_list(patient_id)

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