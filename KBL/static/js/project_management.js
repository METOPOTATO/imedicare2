jQuery.browser = {};


function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(function () {

    $('.date_input').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        drops: "down",
        locale: {
            format: 'YYYY-MM-DD',
        },
    });
    $('.date_input').val('');
    $('#project_date_start').val(moment().subtract(3, 'M').format('YYYY-MM-DD'));
    $('#project_date_end').val(moment().format("YYYY-MM-DD"));

        
    //검색
    $('#project_search').keydown(function (key) {
        if (key.keyCode == 13) {
            search_project();
        }
    })

    $("#project_search_btn").click(function () {
        search_project();
    });

    $(".depart_select,#project_date_start,#project_date_end").change(function () {
        search_project();
    });



    // 오토컴플릿
    function split(val) {
        return val.split(/,\s*/);
    }
    function extractLast(term) {
        return split(term).pop();
    }
    // 회사 검색 
    $("#project_manage_company")
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
                    url: '/KBL/selectbox_search_company/',
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

                $("#project_manage_company").val(ui.item.value);

                $("#project_manage_company_id").val(ui.item.id);

                return false;
            }

        });


    // 비자 - 직원 검색 
    $("#visa_employee")
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
                    url: '/KBL/selectbox_search_employee/',
                    data: {
                        'csrfmiddlewaretoken': $('#csrf').val(),
                        'string': request.term,
                        'company_id': $("#visa_company_id").val(),
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

                $("#visa_employee").val(ui.item.value);

                $("#visa_employee_id").val(ui.item.id);

                return false;
            }

        });

    // 노동허가서 - 직원 검색 
    $("#wp_employee_name")
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
                    url: '/KBL/selectbox_search_employee/',
                    data: {
                        'csrfmiddlewaretoken': $('#csrf').val(),
                        'string': request.term,
                        'company_id': $("#wp_company_id").val(),
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

                $("#wp_employee_name").val(ui.item.value);

                $("#wp_employee_id").val(ui.item.id);

                return false;
            }

        });





    //파일

    //파일 세팅
    //$("#id_file").attr('accept', "image/*,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    //파일 버튼 선택
    $("#btn_file").click(function () {
        $("#id_file").click();
    });
    //파일 선택시 입력 창 변경
    $("#id_file").change(function (e) {
        for (i = 0; i < e.target.files.length; i++) {
            $("#new_edit_file_filename").val(document.getElementById("id_file").value);
        }
    });

    //파일 서브밋
    $('#id_ajax_upload_form').submit(function (e) {
        e.preventDefault();
        $form = $(this)
        var formData = new FormData(this);

        $("#overlay").fadeOut(300);
        $.ajax({
            url: '/KBL/file_save/',
            type: 'POST',
            data: formData,
            success: function (response) {
                $('.error').remove();
                console.log(response)
                if (response.error) {
                    $.each(response.errors, function (name, error) {
                        error = '<small class="text-muted error">' + error + '</small>'
                        $form.find('[name=' + name + ']').after(error);
                    })
                } else {

                    alert(gettext('Saved'));
                    $('#new_edit_file').modal('hide');
                    list_file($("#selected_file_list").val(), $("#board_type").val());


                }
            },
            cache: false,
            contentType: false,
            processData: false,
            complete: function () {
                $("#overlay").fadeOut(300);
            },
            beforeSend: function () {
                $("#overlay").fadeIn(300);
            },
        });
    });




    search_project();
    project_select();
});



function project_manage_modal(id = null) {

    $("#selected_project_id").val('');

    $("#project_manage_company").val('');
    $("#project_manage_company_id").val('');
    $("#project_manage_type").val('');
    $("#project_manage_project_name").val('');
    $("#project_manage_level").val('');
    $("#project_manage_priority").val('');
    $("#project_manage_date_start").val('');
    $("#project_manage_date_end").val('');
    $("#project_manage_date_expected").val('');
    $("#project_manage_progress").val('');
    $("#project_manage_in_charge1").val('');
    $("#project_manage_in_charge2").val('');
    $("#project_manage_in_charge3").val('');
    $("#project_manage_in_charge4").val('');
    $("#project_manage_approval").val('');
    $("#project_manage_note").val('');

    $("#project_manage_type").prop("disabled", false);


    if (id != null) {

        $("#selected_project_id").val(id);
        $("#project_manage_type").prop("disabled", true);
        $.ajax({
            type: 'POST',
            url: '/KBL/project_get/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,

            },
            dataType: 'Json',
            success: function (response) {

                $("#project_manage_company").val(response.project_manage_company);
                $("#project_manage_company_id").val(response.project_manage_company_id);
                $("#project_manage_type").val(response.project_manage_type);
                $("#project_manage_project_name").val(response.project_manage_project_name);
                $("#project_manage_level").val(response.project_manage_level);
                $("#project_manage_priority").val(response.project_manage_priority);
                $("#project_manage_date_start").val(response.project_manage_date_start);
                $("#project_manage_date_end").val(response.project_manage_date_end);
                $("#project_manage_date_expected").val(response.project_manage_date_expected);
                $("#project_manage_progress").val(response.project_manage_progress);
                $("#project_manage_in_charge1").val(response.project_manage_in_charge1);
                $("#project_manage_in_charge2").val(response.project_manage_in_charge2);
                $("#project_manage_in_charge3").val(response.project_manage_in_charge3);
                $("#project_manage_in_charge4").val(response.project_manage_in_charge4);
                $("#project_manage_approval").val(response.project_manage_approval);
                $("#project_manage_note").val(response.project_manage_note);


            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })


    }



    $('#project_manage_modal').modal({ backdrop: 'static', keyboard: false });
    $('#project_manage_modal').modal('show');

}

function detailed_info_modal(id = null) {
    var project_id = $("#selected_project_id").val();
    if (project_id == '') {
        alert(gettext('Select a project.'));
        return;
    }


    $("#selected_detail").val('');

    $("#detail_type").val('');
    $("#detail_project_details").val('');
    $("#detail_date").val('');
    $("#detail_note").val('');

    $("#detailed_info_modal .work_comment_wrap").hide();

    $("#detailed_info_modal .modal-dialog").width(650);
    $("#detailed_info_modal .content_footer").css('right', 0);

    if (id != null) {
        $("#detailed_info_modal .modal-dialog").width(1250);
        $("#detailed_info_modal .content_footer").css('right', 630);

        $("#selected_visa").val(id)
        $.ajax({
            type: 'POST',
            url: '/KBL/detail_get/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,

            },
            dataType: 'Json',
            success: function (response) {

                console.log(response)
                $("#selected_detail").val(id);
                $("#detail_type").val(response.detail_type);
                $("#detail_project_details").val(response.detail_project_details);
                $("#detail_date").val(response.detail_date);
                $("#detail_note").val(response.detail_note);


                $("#detailed_info_modal .work_comment_wrap").show();
                get_commnet('DETAIL',id)
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })


    }


    $('#detailed_info_modal').modal({ backdrop: 'static', keyboard: false });
    $('#detailed_info_modal').modal('show');
}

function visa_modal(id = '') {


    $("#selected_visa").val('');
    $("#visa_employee_id").val('');
    $("#visa_employee").val('');
    $("#visa_granted_company").val('');
    $("#visa_type").val('');
    $("#visa_service_type").val('');
    $("#visa_date_entry").val('');
    $("#visa_date_receipt_application").val('');
    $("#visa_date_receipt_doc").val('');
    $("#visa_date_subbmit_doc").val('');
    $("#visa_date_expected").val('');
    $("#visa_date_ordered").val('');
    $("#visa_application_status").val('');
    $("#visa_emergency").val('');
    $("#visa_status").val('');

    $("#visa_modal .work_comment_wrap").hide();


    $("#visa_modal .modal-dialog").width(650);
    $("#visa_modal .content_footer").css('right', 0);

    console.log(id)

    if ( id != '') {
        $("#visa_modal .modal-dialog").width(1250);
        $("#visa_modal .content_footer").css('right', 630);

        $("#selected_visa").val(id)
        $.ajax({
            type: 'POST',
            url: '/KBL/visa_get/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,

            },
            dataType: 'Json',
            success: function (response) {

                $("#visa_company_id").val(response.visa_company_id);
                $("#visa_company").val(response.visa_company);
                $("#visa_employee_id").val(response.visa_employee_id);
                $("#visa_employee").val(response.visa_employee);
                $("#visa_granted_company").val(response.visa_granted_company);
                $("#visa_type").val(response.visa_type);
                $("#visa_service_type").val(response.visa_service_type);
                $("#visa_date_entry").val(response.visa_date_entry);
                $("#visa_date_receipt_application").val(response.visa_date_receipt_application);
                $("#visa_date_receipt_doc").val(response.visa_date_receipt_doc);
                $("#visa_date_subbmit_doc").val(response.visa_date_subbmit_doc);
                $("#visa_date_expected").val(response.visa_date_expected);
                $("#visa_date_ordered").val(response.visa_date_ordered);
                $("#visa_application_status").val(response.visa_application_status);
                $("#visa_emergency").val(response.visa_emergency);
                $("#visa_status").val(response.visa_status);

                $("#visa_modal .work_comment_wrap").show();

                get_commnet('VISA', id)
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })


    }




    $('#visa_modal').modal({ backdrop: 'static', keyboard: false });
    $('#visa_modal').modal('show');
}



function work_permit_modal(id = null) {

    $("#selected_wp").val('');


    $("#wp_employee_name").val('');
    $("#wp_employee_id").val('');
    $("#wp_EA_application_date").val('');
    $("#wp_EA_exp_date").val('');
    $("#wp_application_date").val('');
    $("#wp_WP_exp_date").val('');
    $("#wp_exp_date").val('');
    $("#wp_requirement").val('');
    $("#wp_note").val('');
    $("#wp_status").val('');

    $("#work_permit_modal .work_comment_wrap").hide();

    $("#work_permit_modal .modal-dialog").width(650);
    $("#work_permit_modal .content_footer").css('right',0);

    if (id != null) {
        $("#work_permit_modal .modal-dialog").width(1250);
        $("#work_permit_modal .content_footer").css('right', 630);

        $("#selected_wp").val(id)
        $.ajax({
            type: 'POST',
            url: '/KBL/work_permit_get/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,

            },
            dataType: 'Json',
            success: function (response) {

                console.log(response)


                $("#wp_employee_name").val(response.wp_employee);
                $("#wp_employee_id").val(response.wp_employee_id);

                $("#wp_EA_application_date").val(response.wp_EA_application_date);
                $("#wp_EA_exp_date").val(response.wp_EA_exp_date);
                $("#wp_application_date").val(response.wp_WP_application_date);
                $("#wp_WP_exp_date").val(response.wp_WP_exp_date);
                $("#wp_exp_date").val(response.wp_expected_date);

                $("#wp_requirement").val(response.wp_requiredment);
                $("#wp_note").val(response.wp_note);
                $("#wp_status").val(response.wp_status);

                $("#work_permit_modal .work_comment_wrap").show();


            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    }

    $('#work_permit_modal').modal({ backdrop: 'static', keyboard: false });
    $('#work_permit_modal').modal('show');
}



function search_project(page = null) {
    var context_in_page = 9;

    var project_type = $('#project_type option:selected').val();
    var project_status = $('#project_status option:selected').val();
    var project_in_charge = $('#project_in_charge option:selected').val();

    var start = $('#project_date_start').val();
    var end = $('#project_date_end').val();

    var string = $('#project_search').val();

    var expected_done = $("#exclude_done").prop('checked');

    $.ajax({
        type: 'POST',
        url: '/KBL/project_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'project_type': project_type,
            'project_status': project_status,
            'project_in_charge': project_in_charge,
            'expected_done': expected_done,

            'start': start,
            'end': end,

            'string': string,

            'page': page,
            'context_in_page': context_in_page,
        },
        dataType: 'Json',
        success: function (response) {
            $('#project_list_table > tbody ').empty();
            for (var i = 0; i < context_in_page; i++) {
                if (response.datas[i]) {
                    var str = "<tr style='cursor:pointer;' onclick='project_select(this)'>";
                    str += "<td>" + response.datas[i]['id'] + "</td>" +
                        "<td>" + response.datas[i]['customer_name'] + "</td>" +
                        "<td>" + response.project_type_dict[response.datas[i]['type']]['name'] + "</td>" +
                        "<td>" + response.datas[i]['project_name'] + "</td>" +
                        "<td>" + response.datas[i]['level'] + "</td>" +
                        "<td>" + response.datas[i]['priority'] + "</td>" +
                        "<td>" + response.datas[i]['start_date'] + "</td>" +
                        "<td>" + response.datas[i]['end_date'] + "</td>" +
                        "<td>" + response.datas[i]['expected_date'] + "</td>" +
                        "<td><span class='" + response.project_status_dict[response.datas[i]['progress']]['class'] + "'>" + response.project_status_dict[response.datas[i]['progress']]['name'] + "</span></td>" +
                        "<td>" + response.datas[i]['in_charge1'] + "</td>" +
                        "<td>" + response.datas[i]['in_charge2'] + "</td>";
                    //if (response.datas[i]['in_charge3'] != '')
                    //    str += response.datas[i]['in_charge3'] + "<br/>";
                    //if (response.datas[i]['in_charge4'] != '')
                    //    str += response.datas[i]['in_charge4'] + "<br/>";
                    str += "</td>";
                    if (response.datas[i]['approval']) {
                        str += "<td><span class='" + response.project_approval_dict[response.datas[i]['approval']]['class'] + "'>" + response.project_approval_dict[response.datas[i]['approval']]['name'] + "</span></td>";
                    } else {
                        str += "<td></td>"
                    }
                        //"<td><span class='" + response.project_approval_dict[response.datas[i]['approval']]['class'] + "'>" + response.project_approval_dict[response.datas[i]['approval']]['name'] + "</span></td>" +
                        str += "<td>" + response.datas[i]['note'] + "</td>" +
                        "<td>" +
                        "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='project_manage_modal(" + response.datas[i]['id'] + ")' > <i class='fa fa-lg fa-pencil'></i></a >" +
                        "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='project_delete(" + response.datas[i]['id'] + ")' > <i class='fa fa-lg fa-trash'></i></a >" +
                        "</td >" +
                        "<td style='width:0px;'>" + response.datas[i]['type'] + "</td>" + 
                        "<td style='width:0px;'>" + response.datas[i]['customer_id'] + "</td></tr>";


                } else {
                    var str = "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>";
                }
                $('#project_list_table').append(str);
            }


            //페이징
            $('#table_pagnation').html('');
            str = '';
            if (response.has_previous == true) {
                str += '<li> <a onclick="search_project(' + (response.page_number - 1) + ')">&laquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&laquo;</span></li>';
            }

            for (var i = response.page_range_start; i < response.page_range_stop; i++) {
                if (response.page_number == i) {
                    str += '<li class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
                }
                else if (response.page_number + 5 > i && response.page_number - 5 < i) {
                    str += '<li><a onclick="search_project(' + i + ')">' + i + '</a></li>';
                }
                else {
                }

            }
            if (response.has_next == true) {
                str += '<li><a onclick="search_project(' + (response.page_number + 1) + ')">&raquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&raquo;</span></li>';
            }
            $('#table_pagnation').html(str);



        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function project_select(obj) {

    $("#project_list_table tr").removeClass('danger');
    $(obj).addClass('danger');

    $('li[role="presentation"]').hide();
    $('li[role="presentation"]').attr('class','');
    $('div[role="tabpanel"]').hide();

    var project_id = $(obj).find('td:nth-child(1)').html();
    var company = $(obj).find('td:nth-child(2)').html();
    var company_id = $(obj).find('td:nth-child(17)').html();
    var type = $(obj).find('td:nth-child(16)').html();


    $("#detail_list > body, #visa_list_table > body, #work_permit_list_table > body").empty();
    $("#selected_project_id").val(project_id);

    console.log(type)
    if (type == 'VISA') {
        $("#tab_visa_list").show();
        $("#tab_visa_list").attr('class', 'active');
        $("#visa_list").show();


        //회사 이름 고정
        $("#visa_company").val(company);
        $("#visa_company_id").val(company_id);



        get_visa_list(project_id);
    } else if (type == 'WORKPERMIT') {
        $("#tab_work_permit_list").show();
        $("#tab_work_permit_list").attr('class', 'active');
        $("#work_permit_list").show();

        

        //회사 이름 고정
        $("#wp_company_name").val(company)
        $("#wp_company_id").val(company_id)
        console.log(company_id)

        get_work_permit_list(project_id);

    } else {
        $("#tab_detailed_info").show();
        $("#tab_detailed_info").attr('class', 'active');
        $("#detailed_info").show();

        get_detail_list(project_id);

    }
}

function project_save() {

    var id = $("#selected_project_id").val();


    var project_manage_company = $("#project_manage_company").val();
    var project_manage_company_id = $("#project_manage_company_id").val();
    var project_manage_type = $("#project_manage_type").val();
    var project_manage_project_name = $("#project_manage_project_name").val();
    var project_manage_level = $("#project_manage_level").val();
    var project_manage_priority = $("#project_manage_priority").val();
    var project_manage_date_start = $("#project_manage_date_start").val();
    var project_manage_date_end = $("#project_manage_date_end").val();
    var project_manage_date_expected = $("#project_manage_date_expected").val();
    var project_manage_progress = $("#project_manage_progress").val();
    var project_manage_in_charge1 = $("#project_manage_in_charge1").val();
    var project_manage_in_charge2 = $("#project_manage_in_charge2").val();
    var project_manage_in_charge3 = $("#project_manage_in_charge3").val();
    var project_manage_in_charge4 = $("#project_manage_in_charge4").val();
    var project_manage_approval = $("#project_manage_approval").val();
    var project_manage_note = $("#project_manage_note").val();

    console.log(project_manage_in_charge1)
    console.log(project_manage_in_charge2)
    console.log(project_manage_in_charge3)
    console.log(project_manage_in_charge4)

    if (project_manage_company == '') {
        alert(gettext('Company field is empty.'));
        return;
    }
    if (project_manage_company_id == '') {
        alert(gettext('Please search and select Company.'));
        return;
    }
    if (project_manage_type == '') {
        alert(gettext('Type field is empty.'));
        return;
    }
    if (project_manage_project_name == '') {
        alert(gettext('Project Name field is empty.'));
        return;
    }
    if (project_manage_level == '') {
        alert(gettext('Level field is empty.'));
        return;
    }
    if (project_manage_progress == '') {
        alert(gettext('Progress field is empty.'));
        return;
    }
    //if (project_manage_approval == '') {
    //    alert(gettext('Approval field is empty.'));
    //    return;
    //}

    $.ajax({
        type: 'POST',
        url: '/KBL/project_save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'id': id,

            'project_manage_company': project_manage_company,
            'project_manage_company_id': project_manage_company_id,
            'project_manage_type': project_manage_type,
            'project_manage_project_name': project_manage_project_name,
            'project_manage_level': project_manage_level,
            'project_manage_priority': project_manage_priority,
            'project_manage_date_start': project_manage_date_start,
            'project_manage_date_end': project_manage_date_end,
            'project_manage_date_expected': project_manage_date_expected,
            'project_manage_progress': project_manage_progress,
            'project_manage_in_charge1': project_manage_in_charge1,
            'project_manage_in_charge2': project_manage_in_charge2,
            'project_manage_in_charge3': project_manage_in_charge3,
            'project_manage_in_charge4': project_manage_in_charge4,
            'project_manage_approval': project_manage_approval,
            'project_manage_note': project_manage_note,

        },
        dataType: 'Json',
        success: function (response) {
            alert(gettext('Saved.'));
            $('#project_manage_modal').modal('hide');
            search_project();

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function project_delete(id = null) {
    if (id == null) { return;}

    if (confirm(gettext('Do you want to delete?'))) {

        $.ajax({
            type: 'POST',
            url: '/KBL/project_delete/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,
            },
            dataType: 'Json',
            success: function (response) {
                alert(gettext('Deleted.'));
                search_project();

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        });
    }

}

function get_detail_list(selected_project_id = '') {
    if (selected_project_id == '') { return; }


    $.ajax({
        type: 'POST',
        url: '/KBL/detail_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'selected_project_id': selected_project_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#detail_list > tbody ').empty();
            console.log(response)
            for (var i = 0; i < response.datas.length; i++) {

                var str = "<tr><td>" + (i + 1) + "</td>" +
                    "<td>" +
                    "<label class='container'>" +
                    "<input type='checkbox' class='check_detail' detail-check='" + response.datas[i]['id'] + "' ";
                    if (response.datas[i]['check'] == true) { str += " checked " }
                str += "/>" +
                    "<span class='checkmark'></span></label>" +
                    "</td >" +
                    "<td>" + response.datas[i]['type'] + "</td>" +
                    "<td>" + response.datas[i]['project_details'] + "</td>" +
                    "<td>" + response.datas[i]['date'] + "</td>" +
                    "<td>" + response.datas[i]['note'] + "</td>" +
                    "<td>" +
                    '<a class="btn ';
                if (response.datas[i]['is_file']) {
                    str += 'btn btn-success btn-xs" href = "javascript: void(0);" onclick = "list_file(' + response.datas[i]["id"] + ',&#39;PROJECT_DTL&#39;)"> <i class="fa fa-lg fa-file"></i></a > ';
                } else {
                    str += 'btn btn-default btn-xs" href="javascript: void (0); " onclick="list_file(' + response.datas[i]["id"] + ',&#39;PROJECT_DTL&#39;)"> <i class="fa fa-lg fa-file-o"></i></a > ';
                }
                str += "</td>" +
                    "<td>" +
                    "<a class='btn btn-default btn-xs btn_default_tmp' href='javascript: void (0);' onclick='detailed_info_modal(" + response.datas[i]['id'] + ")' > <i class='fa fa-lg fa-pencil'></i></a >" +
                    "<a class='btn btn-danger btn-xs btn_danger_tmp' href='javascript: void (0);' onclick='detail_delete(" + response.datas[i]['id'] + ")' > <i class='fa fa-lg fa-trash'></i></a >" +
                    "</td ></tr>";


                $('#detail_list > tbody').append(str);
                for (var j = 0; j < response.datas[i].commnet_list.length; j++) {
                    str = '';
                    str += '<tr>';
                    str += '<td style="text-align:right;"><i class="fa fa-level-up fa-rotate-90"></i></td>';
                    str += '<td colspan="2" style="font-weight:700">';
                    str += response.datas[i].commnet_list[j].user;
                    if (response.datas[i].commnet_list[j].in_charge_id != '') {
                        str += '<p style="color:royalblue;">To : ' + response.datas[i].commnet_list[j].in_charge + '</p>';
                    }
                    str += '</td>';
                    str += '<td colspan="3" style="text-align:left;">';
                    if (response.datas[i].commnet_list[j].status_id != '') {
                        str += "<span class='" + response.datas[i].commnet_list[j].status.class + "' style='display:inline-block; margin-right:5px;'>" + response.datas[i].commnet_list[j].status.name + "</span>";
                    }
                    str += response.datas[i].commnet_list[j].comment;
                    str += '</td>';
                    str += '<td colspan="2">';
                    str += response.datas[i].commnet_list[j].datetime;
                    str += '</td>';
                    str += '</tr>';

                    $('#detail_list > tbody').append(str);
                }
            }


            //체크박스 이벤트
            $(".check_detail").unbind();
            $(".check_detail").bind('change',function(event){
                event.preventDefault();
                var id = $(this).attr('detail-check');
                var checked = $(this).is(':checked');

                var question = '';
                var checked_str = '0';
                if (!checked) {
                    question = gettext('Do you want to uncheck?');
                } else {
                    question = gettext('Do you want to check?');
                }

                if (confirm(question)) {
                    $.ajax({
                        type: 'POST',
                        url: '/KBL/detail_check/',
                        data: {
                            'csrfmiddlewaretoken': $('#csrf').val(),

                            'id': id,
                            'checked': checked,

                        },
                        dataType: 'Json',
                        success: function (response) {

                            get_detail_list(project_id);
                        },
                        error: function (request, status, error) {
                            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

                        },
                    });




                }

            });

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })


}


function detailed_info_save() {

    var id = $("#selected_detail").val()
    var project_id = $("#selected_project_id").val();


    var detail_type = $("#detail_type").val();
    var detail_project_details = $("#detail_project_details").val();
    var detail_date = $("#detail_date").val();
    var detail_note = $("#detail_note").val();



    if (project_id == '') {
        alert(gettext('Error occured. Please press F5 then retry.'));
        return;
    }
    if (detail_type == '') {
        alert(gettext('Type is empty.'));
        return;
    }
    if (detail_project_details == '') {
        alert(gettext('Project Progress Detail is empty.'));
        return;
    }
    console.log(id)
    
    $.ajax({
        type: 'POST',
        url: '/KBL/detail_save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'id': id,

            "project_id": project_id,

            'detail_type': detail_type,
            'detail_project_details': detail_project_details,
            'detail_date': detail_date,
            'detail_note': detail_note,

        },
        dataType: 'Json',
        success: function (response) {
            get_detail_list(project_id);
            alert(gettext('Saved.'));
            $('#detailed_info_modal').modal('hide');
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });
}


function detail_delete(id = null) {
    if (id == null) { return; }

    var project_id = $("#selected_project_id").val();

    if (confirm(gettext('Do you want to delete?'))) {
        $.ajax({
            type: 'POST',
            url: '/KBL/detail_delete/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,

            },
            dataType: 'Json',
            success: function (response) {

                get_detail_list(project_id);
                alert(gettext('Deleted.'));

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        });
    }
}

function get_visa_list(selected_project_id = '') {
    if (selected_project_id == '') { return; }

    $.ajax({
        type: 'POST',
        url: '/KBL/visa_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'selected_project_id': selected_project_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#visa_list_table > tbody ').empty();
            console.log(response)
            for (var i = 0; i < response.datas.length ; i++) {
                var str = "<tr>";
                if (response.datas[i]['emergency'] == '1') {
                    str += "<td><span class='label label-danger emc'>" + gettext('EMC') + "</span></td>";
                }
                else {
                    str += "<td>" + (i + 1) + "</td>";
                }
                str += "<td><span class='" + response.project_status_dict[response.datas[i]['status']]['class'] + "'>" + response.project_status_dict[response.datas[i]['status']]['name'] + "</span></td>" +
                    "<td>" + response.datas[i]['company'] + "</td>" +
                    "<td>" + response.datas[i]['employee'] + "</td>" +
                    "<td>" + response.datas[i]['granted_company'] + "</td>" +
                    "<td>" + response.datas[i]['date_receipt_application'] + "</td>" +
                    "<td>" + response.datas[i]['type'] + "</td>" +
                    "<td>" + response.datas[i]['service_type'] + "</td>" +
                    "<td>" + response.datas[i]['date_entry'] + "</td>" +
                    "<td>" + response.datas[i]['date_receipt_doc'] + "</td>" +
                    "<td>" + response.datas[i]['date_subbmit_doc'] + "</td>" +
                    "<td>" + response.datas[i]['date_expected'] + "</td>" +
                    "<td>" +
                    '<a class="btn ';
                if (response.datas[i]['is_file']) {
                    str += 'btn btn-success btn-xs btn_success_tmp" href = "javascript: void(0);" onclick = "list_file(' + response.datas[i]["id"] + ',&#39;VISA&#39;)" > <i class="fa fa-lg fa-file"></i></a > ';
                } else {
                    str += 'btn btn-default btn-xs" href="javascript: void (0); " onclick="list_file(' + response.datas[i]["id"] + ',&#39;VISA&#39;)" > <i class="fa fa-lg fa-file-o"></i></a > ';
                }
                str += "</td>" +
                    "<td>" +
                    "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='visa_modal(" + response.datas[i]['id'] + ")' > <i class='fa fa-lg fa-pencil'></i></a >" +
                    "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='visa_delete(" + response.datas[i]['id'] + ")' > <i class='fa fa-lg fa-trash'></i></a >" +
                    "</td ></tr>";
                

                $('#visa_list_table > tbody').append(str);
                for (var j = 0; j < response.datas[i].commnet_list.length; j++) {
                    str = '';
                    str += '<tr>';
                    str += '<td style="text-align:right;"><i class="fa fa-level-up fa-rotate-90"></i></td>';
                    str += '<td style="font-weight:700">';
                    str += response.datas[i].commnet_list[j].user;
                    if (response.datas[i].commnet_list[j].in_charge_id != '') {
                        str += '<p style="color:royalblue;">To : ' + response.datas[i].commnet_list[j].in_charge + '</p>';
                    }
                    str += '</td>';
                    str += '<td colspan="9" style="text-align:left;">';
                    if (response.datas[i].commnet_list[j].status_id != '') {
                        str += "<span class='" + response.datas[i].commnet_list[j].status.class + "' style='display:inline-block; margin-right:5px;'>" + response.datas[i].commnet_list[j].status.name + "</span>";
                    }
                    str += response.datas[i].commnet_list[j].comment;
                    str += '</td>';
                    str += '<td colspan="2">';
                    str += response.datas[i].commnet_list[j].datetime;
                    str += '</td>';
                    str += '</tr>';

                    $('#visa_list_table > tbody').append(str);
                }
            }


        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })


}

function visa_save() {

    var id = $("#selected_visa").val()
    var project_id = $("#selected_project_id").val();

    var visa_company_id = $("#visa_company_id").val();
    var visa_company = $("#visa_company").val();

    var visa_employee_id = $("#visa_employee_id").val();
    var visa_employee = $("#visa_employee").val();
    var visa_granted_company = $("#visa_granted_company").val();
    var visa_type = $("#visa_type").val();
    var visa_service_type = $("#visa_service_type").val();
    var visa_date_entry = $("#visa_date_entry").val();
    var visa_date_receipt_application = $("#visa_date_receipt_application").val();
    var visa_date_receipt_doc = $("#visa_date_receipt_doc").val();
    var visa_date_subbmit_doc = $("#visa_date_subbmit_doc").val();
    var visa_date_expected = $("#visa_date_expected").val();
    var visa_date_ordered = $("#visa_date_ordered").val();
    var visa_application_status = $("#visa_application_status").val();
    var visa_emergency = $("#visa_emergency").val();
    var visa_status = $("#visa_status").val();

    if (project_id == '') {
        alert(gettext('Error occured. Please press F5 then retry.'));
        return;
    }
    if (visa_employee_id == '') {
        alert(gettext('Please search and select Customer.'));
        return;
    }
    if (visa_employee == '') {
        alert(gettext('Customer Name is empty.'));
        return;
    }
    if (visa_type == '') {
        alert(gettext('Select Visa Type.'));
        return;
    }
    if (visa_emergency == '') {
        alert(gettext('Select is Emergency.'));
        return;
    }
    if (visa_status == '') {
        alert(gettext('Select Status.'));
        return;
    }

    $.ajax({
        type: 'POST',
        url: '/KBL/visa_save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'id': id,

            "project_id": project_id,

            "visa_company_id": visa_company_id,
            "visa_company": visa_company,
            "visa_employee_id": visa_employee_id,

            "visa_employee": visa_employee,
            "visa_granted_company": visa_granted_company,
            "visa_type": visa_type,
            "visa_service_type": visa_service_type,
            "visa_date_entry": visa_date_entry,
            "visa_date_receipt_application": visa_date_receipt_application,

            "visa_date_receipt_doc": visa_date_receipt_doc,
            "visa_date_subbmit_doc": visa_date_subbmit_doc,
            "visa_date_expected": visa_date_expected,
            "visa_date_ordered": visa_date_ordered,
            "visa_application_status": visa_application_status,
            "visa_emergency": visa_emergency,
            "visa_status": visa_status,


        },
        dataType: 'Json',
        success: function (response) {
            get_visa_list(project_id);
            alert(gettext('Saved.'));
            
            $('#visa_modal').modal('hide');
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });







}


function visa_delete(id = null) {
    if (id == null) { return;}

    var project_id = $("#selected_project_id").val();

    if (confirm(gettext('Do you want to delete?'))) {
        $.ajax({
            type: 'POST',
            url: '/KBL/visa_delete/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,

            },
            dataType: 'Json',
            success: function (response) {

                get_visa_list(project_id);
                alert(gettext('Deleted.'));

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        });
    }
    
}


function get_work_permit_list(selected_project_id = '') {
    if (selected_project_id == '') { return; }


    $.ajax({
        type: 'POST',
        url: '/KBL/work_permit_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'selected_project_id': selected_project_id,
        },
        dataType: 'Json',
        success: function (response) {
            $('#work_permit_list_table > tbody ').empty();
            console.log(response)
            for (var i = 0; i < response.datas.length; i++) {
                var str = "<tr>";
                str += "<td>" + (i + 1) + "</td>" +
                    "<td><span class='" + response.project_status_dict[response.datas[i]['status']]['class'] + "'>" + response.project_status_dict[response.datas[i]['status']]['name'] + "</span></td>" +
                    "<td>" + response.datas[i]['employee'] + "</td>" +
                    "<td>" + response.datas[i]['position'] + "</td>" +
                    "<td>" + response.datas[i]['requiredment'] + "</td>" +
                    "<td>" + response.datas[i]['EA_application_date'] + "</td>" +
                    "<td>" + response.datas[i]['EA_exp_date'] + "</td>" +
                    "<td>" + response.datas[i]['WP_application_date'] + "</td>" +
                    "<td>" + response.datas[i]['WP_exp_date'] + "</td>" +
                    "<td>" + response.datas[i]['expected_date'] + "</td>" +
                    "<td>" + response.datas[i]['note'] + "</td>" +
                    "<td>" +
                    '<a class="btn ';
                if (response.datas[i]['is_file']) {
                    str += 'btn btn-success btn - xs" href = "javascript: void(0);" onclick = "list_file(' + response.datas[i]["id"] + ',&#39;WORK_PERMIT&#39;)" > <i class="fa fa-lg fa-file"></i></a > ';
                } else {
                    str += 'btn btn-default btn - xs" href="javascript: void (0); " onclick="list_file(' + response.datas[i]["id"] + ',&#39;WORK_PERMIT&#39;)" > <i class="fa fa-lg fa-file-o"></i></a > ';
                }
                    str +="</td>" +
                    "<td>" +
                    "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='work_permit_modal(" + response.datas[i]['id'] + ")' > <i class='fa fa-lg fa-pencil'></i></a >" +
                    "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='work_permit_delete(" + response.datas[i]['id'] + ")' > <i class='fa fa-lg fa-trash'></i></a >" +
                    "</td ></tr>";


                $('#work_permit_list_table > tbody').append(str);
                for (var j = 0; j < response.datas[i].commnet_list.length; j++) {
                    str = '';
                    str += '<tr>';
                    str += '<td style="text-align:right;"><i class="fa fa-level-up fa-rotate-90"></i></td>';
                    str += '<td style="font-weight:700">';
                    str += response.datas[i].commnet_list[j].user;
                    if (response.datas[i].commnet_list[j].in_charge_id != '') {
                        str += '<p style="color:royalblue;">To : ' + response.datas[i].commnet_list[j].in_charge + '</p>';
                    }
                    str += '</td>';
                    str += '<td colspan="9" style="text-align:left;">';
                    if (response.datas[i].commnet_list[j].status_id != '') {
                        str += "<span class='" + response.datas[i].commnet_list[j].status.class + "' style='display:inline-block; margin-right:5px;'>" + response.datas[i].commnet_list[j].status.name + "</span>";
                    }
                    str += response.datas[i].commnet_list[j].comment;
                    str += '</td>';
                    str += '<td colspan="2">';
                    str += response.datas[i].commnet_list[j].datetime;
                    str += '</td>';
                    str += '</tr>';

                    $('#work_permit_list_table > tbody').append(str);
                }
            }


        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })


}


function work_permit_save() {

    var id = $("#selected_wp").val();
    var project_id = $("#selected_project_id").val();

    var wp_company_name = $("#wp_company_name").val();
    var wp_company_id = $("#wp_company_id").val();
    var wp_employee_name = $("#wp_employee_name").val();
    var wp_employee_id = $("#wp_employee_id").val();
    var wp_EA_application_date = $("#wp_EA_application_date").val();
    var wp_EA_exp_date = $("#wp_EA_exp_date").val();
    var wp_application_date = $("#wp_application_date").val();
    var wp_WP_exp_date = $("#wp_WP_exp_date").val();
    var wp_exp_date = $("#wp_exp_date").val();
    var wp_requirement = $("#wp_requirement").val();
    var wp_note = $("#wp_note").val();
    var wp_status = $("#wp_status").val();


    if (project_id == '') {
        alert(gettext('Error occured. Please press F5 then retry.'));
        return;
    }
    if (wp_employee_id == '') {
        alert(gettext('Please search and select Customer.'));
        return;
    }
    if (wp_employee_name == '') {
        alert(gettext('Customer Name is empty.'));
        return;
    }
    if (wp_status == '') {
        alert(gettext('Status is empty.'));
        return;
    }



    $.ajax({
        type: 'POST',
        url: '/KBL/work_permit_save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'id': id,
            'project_id': project_id,

            'wp_company_name': wp_company_name,
            'wp_company_id': wp_company_id,
            'wp_employee_name': wp_employee_name,
            'wp_employee_id': wp_employee_id,
            'wp_EA_application_date': wp_EA_application_date,
            'wp_EA_exp_date': wp_EA_exp_date,
            'wp_application_date': wp_application_date,
            'wp_WP_exp_date': wp_WP_exp_date,
            'wp_exp_date': wp_exp_date,
            'wp_requirement': wp_requirement,
            'wp_note': wp_note,
            'wp_status': wp_status,


        },
        dataType: 'Json',
        success: function (response) {
            get_work_permit_list(project_id);
            alert(gettext('Saved.'));
            
            $('#work_permit_modal').modal('hide');
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });
}

function work_permit_delete(id = null) {
    if (id == null) { return; }

    var project_id = $("#selected_project_id").val();

    if (confirm(gettext('Do you want to delete?'))) {
        $.ajax({
            type: 'POST',
            url: '/KBL/work_permit_delete/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,

            },
            dataType: 'Json',
            success: function (response) {

                get_work_permit_list(project_id);
                alert(gettext('Deleted.'));

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        });
    }

}







/////////////          file




function list_file(id = null,type) {
    if (id == null) {
        return;
    }

    $("#board_type").val(type);

    $.ajax({
        type: 'POST',
        url: '/KBL/file_list/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'id': id,
            'type': type,
        },
        dataType: 'Json',
        success: function (response) {


            if (response.result) {

                $("#file_table tbody").empty();

                for (var i = 0; i < response.datas.length; i++) {
                    var str = '<tr><td>' + (i + 1) + '</td>' +
                        '<td>' + response.datas[i].name + ' <a href="' + response.datas[i].url + '"download="' + response.datas[i].origin_name + '"><i class="fa fa-lg fa-download"></i></a></td>' +
                        '<td>' + response.datas[i].date + '</td>' +
                        '<td>' + response.datas[i].creator + '</td>' +
                        '<td>' + response.datas[i].memo + '</td>' +
                        "<td>" +
                        "<a class='btn btn-default btn-xs' style='margin-right:5px;' href='javascript: void (0);' onclick='file_add_modal(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                        "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_file(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-trash'></i></a>" +

                        '</td></tr > ';

                    $("#file_table tbody").append(str);
                }


                $("#selected_file_list").val(id);

                $('#new_edit_file_list').modal({ backdrop: 'static', keyboard: false });
                $('#new_edit_file_list').modal('show');

            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function file_add_modal(id = '') {

    $("#selected_file_id").val(id);

    $("#id_file").val('');

    $("#new_edit_file_name").val('');//Document Name
    $("#new_edit_file_remark").val('');
    $("#new_edit_file_filename").val('');

    $("#new_edit_file_old_file").html('');
    $("#new_edit_file_old_file_div").hide();
    if (id != '') { // 불러오기
        $.ajax({
            type: 'POST',
            url: '/KBL/file_get/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,
            },
            dataType: 'Json',
            success: function (response) {

                $("#new_edit_file_name").val(response.title);
                $("#new_edit_file_remark").val(response.memo);

                $("#new_edit_file_old_file_div").show();
                $("#new_edit_file_old_file").html(response.origin_name);
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })

    }

    $('#new_edit_file').modal({ backdrop: 'static', keyboard: false });
    $('#new_edit_file').modal('show');
}

function save_file() {
    id = $("#selected_file_id").val();
    draft_id = $("#selected_file_list").val();
    //신규
    if (id == '') {
        if ($("#id_file").val() == '') {
            alert(gettext('Select File.'));
            return;
        }
    }
    //수정


    file_name = $("#new_edit_file_name").val();//문서이름
    if (file_name == '') {
        alert(gettext('File Name is Empty.'));
        return;
    }

    remark = $("#new_edit_file_remark").val();




    $('#id_ajax_upload_form').submit();

}

function delete_file(id = '') {

    if (id == '') {
        return;
    }

    if (confirm(gettext('Do you want to delete?'))) {
        $.ajax({
            type: 'POST',
            url: '/KBL/file_delete/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,
            },
            dataType: 'Json',
            success: function (response) {
                if (response.result) {
                    alert(gettext('Deleted.'));
                    list_file($("#selected_file_list").val());
                }
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    }

}



function get_commnet(type = null, content_id = null) {

    var select_user_list = [];
    $.each($("#comment_select_user").prop("options"), function (i, opt) {
        select_user_list.push({
            'id': opt.value,
            'name': opt.textContent,
        })
    })

    var select_status_list = [];
    $.each($("#comment_status").prop("options"), function (i, opt) {
        select_status_list.push({
            'id': opt.value,
            'name': opt.textContent,
        })
    })

    $.ajax({
        type: 'POST',
        url: '/KBL/get_commnet/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
    
            'type': type,
            'content_id': content_id,
        },
        dataType: 'Json',
        success: function (response) {
            var table_div = ''
            if(type == 'DETAIL') {
                table_div = '#detailed_info_modal '
            } else if (type == 'VISA') {
                table_div = '#visa_modal '
            } else if (type == 'WP') {
                table_div = '#work_permit_modal '
            }

            $(table_div + '#work_comment_content').empty();

            $("#comment_count").html(response.datas.length);
            for (var i = 0; i < response.datas.length; i++) {
                var str = '';
    
                str += '<div class="comment_div">';
                if (response.datas[i].in_charge != '' && response.datas[i].depth == 0 ) {
                    str += '<div class="work_comment_new_option1">';
                    str += '<div class="input-group input-group-h" style="margin-bottom: 0px;">';
                    str += '<span class="input-group-addon" id="basic-addon1">' + gettext('User ID') + '</span>';
                    str += '<select class="form-control" id="comment_select_user_' + response.datas[i].id + '" disabled>';
                    for (var j = 0; j < select_user_list.length; j++) {
                        str += '<option value="' + select_user_list[j].id + '"';
                        if (response.datas[i].in_charge_id == select_user_list[j].id)
                            str += ' selected';
                        str += '>' + select_user_list[j].name +'</option>';
                    }
                    str += '</select>';
                    str += '</div>';
                    str += '<div class="input-group input-group-h" style="margin-bottom: 0px;">';
                    str += '<span class="input-group-addon" id="basic-addon1">' + gettext('Status') + '</span>';
                    str += '<select class="form-control" id="comment_status_' + response.datas[i].id + '">';
                    for (var j = 0; j < select_status_list.length; j++) {
                        str += '<option value="' + select_status_list[j].id + '"';
                        if (response.datas[i].status_id == select_status_list[j].id)
                            str += ' selected';
                        str += '>' + select_status_list[j].name + '</option>';
                    }
                    str += '</select>';
                    str += '</div>';
                    str += '</div>';
                }

                str += '<div class="comment">';
                for (var j = 0; j < response.datas[i].depth; j++) {
                    str += '<div class="comment_depth"></div>';
                }
                if (response.datas[i].depth) {
                    str += '<div class="comment_depth_stair">ㄴ</div>';
                }
                str += '<div class="comment_user_name">';
                str += '<p>' + response.datas[i].user + '</p>';
                if (response.datas[i].in_charge != '' && response.datas[i].depth == 0) {
                    str += '<p style="color:royalblue;">To : ' + response.datas[i].in_charge + '</p>';
                }
                str += '</div>';

                str += '<div class="comment_item">';
                str += '<p id="comment_item_' + response.datas[i].id + '">' + response.datas[i].comment + '</p>';
                str += '</div>';
                str += '<div class="comment_date">';
                str += '<p>';
                str += response.datas[i].datetime;
                str += '&nbsp;&nbsp;<i class="fa fa-reply fa-flip-vertical i_coursor reply_comment" aria-hidden="true" id="reply_comment_' + response.datas[i].id + '" comment-top=' + response.datas[i].comment_top + '></i>';
                if (response.datas[i].is_creator) {
                    str += '<i class="fa fa-pencil fa-fw i_coursor edit_comment" aria-hidden="true" id="edit_comment_' + response.datas[i].id + '" comment-top=' + response.datas[i].comment_top + '></i>';
                    str += '<i class="fa fa-trash fa - fw i_coursor delete_comment" aria-hidden="true" id="delete_comment_' + response.datas[i].id + '"></i>';
                }
                str += '</p>';
                str += '</div>';
                str += '</div>';


                str += '<div class="comment_reply_wrap" id="reply_comment_div_' + response.datas[i].id + '">';
                str += '<div class="comment_reply">';
                str += '<span class="fl" id="comment_text_front_' + response.datas[i].id + '"></span>';
                str += '<div class="input-group">';
                str += '<textarea class="form-control reply_comment_text" id="reply_comment_text_' + response.datas[i].id + '" style="height:60px;"></textarea>';
                str += '<span class="input-group-btn">';
                str += '<a class="btn btn-default add_reply_comment" id="add_reply_comment_' + response.datas[i].id + '">' + gettext('Add<br/>Comment') + '</a>';
                str += '</span>';
                str += '</div>';
                str += '</div>';
                str += '</div>';


                str += '</div>';
    
                $(table_div + "#work_comment_content").append(str);
            }


            //이벤트 재등록
            //답글
            var reply_content = '';
            var reply_textarea = '';
            var reply_upper = '';
            var is_edit = false;
            var top_id = '';
            $(".reply_comment").click(function () {
                $(".comment_reply_wrap").hide();
                //$(".content_comment_option_additional_div").hide();
                var this_id = $(this).attr('id');
                var split_id = this_id.split('_');

                reply_content = $("#reply_comment_div_" + split_id[2]);
                reply_textarea = $("#reply_comment_text_" + split_id[2]);
                reply_textarea.val('');

                $("#comment_text_front_" + split_id[2]).html('ㄴ');
                reply_upper = split_id[2];
                reply_content.show();
                is_edit = false;

                top_id = $(this).attr('comment-top');
            });

            //수정
            $(".edit_comment").click(function () {
                $(".comment_reply_wrap").hide();
                //$(".content_comment_option_additional_div").hide();
                var this_id = $(this).attr('id');
                var split_id = this_id.split('_');

                reply_content = $("#reply_comment_div_" + split_id[2]);
                reply_textarea = $("#reply_comment_text_" + split_id[2]);
                reply_textarea.val($("#comment_item_" + split_id[2]).html());
                reply_upper = split_id[2];
                $("#comment_text_front_" + split_id[2]).html('Edit:');
                reply_content.show();

                top_id = $(this).attr('comment-top');
                is_edit = true;
            });
            $(".add_reply_comment").click(function () {
                if (is_edit) {// 수정
                    set_edit(reply_upper, top_id,type, content_id);
                } else {// 추가
                    add_comment(type, reply_upper, top_id,);
                }
            });
            //삭제
            $(".delete_comment").click(function () {
                var this_id = $(this).attr('id');
                var split_id = this_id.split('_');

                delete_comment(split_id[2],type, content_id);
            });
    
    
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    
        },
    })

}


function add_comment(type = null, upper = null, top_id = null) {
    var content_id = ''
    var comment_id = ''
    var modal_id = ''
    if (type == null) {
        return;
    } else if (type == 'DETAIL') {
        content_id = $("#selected_detail").val()
        modal_id = '#detailed_info_modal ' 
    } else if (type == 'VISA') {
        content_id = $("#selected_visa").val()
        modal_id = '#visa_modal '
    } else if (type == 'WP') {
        content_id = $("#selected_wp").val()
        modal_id = '#work_permit_modal '
    }

    if (upper == null) {
        comment = $(modal_id + "#text_comment_new").val();
    }
    else {
        comment = $(modal_id + "#reply_comment_text_" + upper).val();
    }


    if (comment == '') {
        alert(gettext('Input Text'));
        return;
    }
    var comment_status = $(modal_id + "#comment_status").val();
    var comment_select_user = $(modal_id + "#comment_select_user").val();

    $.ajax({
        type: 'POST',
        url: '/KBL/add_comment/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'comment_id': comment_id,
            'upper_id': upper,

            'content_id': content_id,
            'content_type': type,

            'comment': comment,
            'status': comment_status,
            'select_user': comment_select_user,

        },
        dataType: 'Json',
        success: function (response) {
            alert(gettext('Comment saved.'));
            $(modal_id + "#text_comment_new").val('');
            $(modal_id + "#comment_status").val('');
            $(modal_id + "#comment_select_user").val('');

            get_commnet(type, content_id);
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })



}



//댓글 수정
function set_edit(id, top_id, type, content_id) {
    comment = $("#reply_comment_text_" + id).val();
    if (comment == '') {
        alert(gettext('Input Text'));
        return;
    }

    var select_user = $("#comment_select_user_" + top_id).val();
    var status = $("#comment_status_" + top_id).val();


    $.ajax({
        type: 'POST',
        url: '/KBL/edit_comment/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id': id,   //댓글  ID
            'comment': comment,     //댓글 내용

            'top_id': top_id,     //최상위

            'select_user': select_user,
            'status': status,
        },
        dataType: 'Json',
        success: function (response) {
            get_commnet(type, content_id);
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });
}


//댓글 삭제
function delete_comment(id,type,content_id) {

    if (confirm(gettext('Do you want to delete this comment?'))) {
        $.ajax({
            type: 'POST',
            url: '/KBL/delete_comment/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'content_id': $("#content_id").val(),   //게시 글 
                'id': id,
            },
            dataType: 'Json',
            success: function (response) {
                get_commnet(type, content_id);
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        });
    }
}



function excel_download() {


    var start_date = $("#project_date_start").val();
    var end_date = $("#project_date_end").val();
    var type = $("#project_date_end").val();

    var url = '/manage/KBL_project_excel?'
    url += 'start_date=' + start_date + '&';
    url += 'end_date=' + end_date + '&';

    window.open(url);
    ///$.ajax({
    ///    type: 'POST',
    ///    url: '/manage/audit_excel/',
    ///    data: {
    ///        'csrfmiddlewaretoken': $('#csrf').val(),
    ///    },
    ///    dataType: 'Json',
    ///    success: function (response) {
    ///        
    ///
    ///    },
    ///    error: function (request, status, error) {
    ///        console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
    ///
    ///    },
    ///})
}

