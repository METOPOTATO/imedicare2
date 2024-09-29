jQuery.browser = {};

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
$(function () {
    $('.search_date').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        autoApply: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    $("#new_edit_search_date_start").val(moment().subtract(7, 'd').format('YYYY-MM-DD'));



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


        $.ajax({
            url: '/manage/draft/save_file/',
            type: 'POST',
            data: formData,
            success: function (response) {
                $('.error').remove();
                if (response.error) {
                    $.each(response.errors, function (name, error) {
                        error = '<small class="text-muted error">' + error + '</small>'
                        $form.find('[name=' + name + ']').after(error);
                    })
                } else {
                    
                    alert(gettext('Saved'));
                    $('#new_edit_file').modal('hide');
                    list_file($("#selected_file_list").val());
                }
            },
            cache: false,
            contentType: false,
            processData: false
        });
    });


    $("#new_edit_content").summernote({
        toolbar: [
            ['style', ['style']],
            ['fontsize', ['fontsize']],
            ['font', ['bold', 'italic', 'underline', 'clear']],
            ['fontname', ['fontname']],
            ['color', ['color']],
            ['para', ['ul', 'ol', 'paragraph']],
            ['height', ['height']],
            ['insert', ['checkbox','picture', 'hr']],
            ['table', ['table']],
            ['help', ['undo', 'redo']],
            ['code', ['codeview']]
        ],
        height: 350,
        disableResizeEditor: true,
        fontSizes: ['5', '6', '7', '8', '9', '10', '11', '12', '14', '15', '16', '17', '18', '19', '20'],

    });

    // init the state from the input
    $(".checkbox").each(function () {
        if ($(this).find('input[type="checkbox"]').first().attr("checked")) {
            $(this).addClass('image-checkbox-checked');
        } else {
            $(this).removeClass('image-checkbox-checked');
        }
    });

    // sync the state to the input
    $(".checkbox").on("click", function (e) {
        $(this).toggleClass('image-checkbox-checked');
        var $checkbox = $(this).find('input[type="checkbox"]');
        $checkbox.prop("checked", !$checkbox.prop("checked"));
        if ($checkbox.prop("checked")) {
            $($_this).summernote('insertImage', $(this).find('input[type="checkbox"]').val());
        }
        e.preventDefault();
    });




    $('.note-editable').css('font-size', '12px');

    //추가 버튼
    $("#btn_new").click(function () {
        show_new_edit_draft();
    })

    //폼 불러오기
    $("#new_edit_type").change(function () {
        get_form();
    });




    $("#new_edit_search_type, #new_edit_search_requester, #new_edit_search_status, .search_date").change(function () {
        draft_search();
    });

    $('#new_edit_search_title').keydown(function (key) {
        if (key.keyCode == 13) {
            draft_search();
        }
    })

    draft_search();


    $("#new_edit_type").change(function () {
        show_new_edit_submenu();
    })


    $("#consultation_depart_1,#consultation_incharge1,#consultation_depart_2,#consultation_incharge2").change(function () {
        set_select_color("#" + $(this).attr('id'), $(this).val() )
    });

    $("#consultation_depart_1,#consultation_depart_2").change(function () {
        get_user_by_depart(this);
    });

});


function set_select_color(obj_id, val) {

    $(obj_id).attr("class", "form-control " + $(obj_id)[0].options[$(obj_id)[0].selectedIndex].className)

}



function show_new_edit_submenu() {
    selected = $("#new_edit_type").val();

    $("#draft_request_type").hide();
    $("#draft_payment_type").hide();
    $("#new_edit_depart_div").hide();


    $("#draft_request_type").val('');
    $("#draft_payment_type").val('');
    $("#new_edit_depart_div").val('');

    if (selected == 'PAYMENT') {

        $("#new_edit_depart_div").show();
        $("#draft_request_type").show();
        $("#draft_payment_type").show();
    } 
}

function show_new_edit_submenu_valid() {
    selected = $("#new_edit_type").val();

    if (selected == 'PAYMENT') {
        if ($("#new_edit_depart").val() == '') {
            alert(gettext('Select Request Depart Type'));
            return false;
        }
        if ($("#new_edit_request_type").val() == '') {
            alert(gettext('Select Request Type'));
            return false;
        }
         if ($("#new_edit_payment_type").val() == '') {
            alert(gettext('Select Payment Type'));
            return false;
         }
        
        
    }
    return true;
}


function show_new_edit_draft(id = null) {

    $("#consultation_depart_1 option:eq(0)").prop("selected", true);
    $("#consultation_incharge1 option:eq(0)").prop("selected", true);
    $("#consultation_depart_2 option:eq(0)").prop("selected", true);
    $("#consultation_incharge2 option:eq(0)").prop("selected", true);

    set_select_color("#consultation_depart_1", '');
    set_select_color("#consultation_incharge1", '');
    set_select_color("#consultation_depart_2", '');
    set_select_color("#consultation_incharge2", '');


    $("#new_edit_draft input").val('');
    $('#new_edit_content').summernote('code', '');


    $("#new_edit_type option:eq(0)").prop("selected", true);
    $("#new_edit_depart option:eq(0)").prop("selected", true);
    $("#new_edit_status option:eq(0)").prop("selected", true);
    $("#new_edit_code option:eq(0)").prop("selected", true);

    show_new_edit_submenu();
     if (id)  {//불러오기
        $.ajax({
            type: 'POST',
            url: '/manage/draft/get_data/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,

            },
            dataType: 'Json',
            success: function (response) {
                if (response.result) {

                    $("#selected_form_id").val(id);

                    $("#new_edit_type").val(response.type);
                    show_new_edit_submenu();
                    $("#new_edit_depart").val(response.depart);
                    $("#new_edit_name").val(response.request_user);
                    $("#new_edit_cost_name").val(response.cost_name);
                    $("#new_edit_title").val(response.title);
                    $("#new_edit_consultation").val(response.consultation);
                    $("#new_edit_MORE_CMNTS").val(response.additional);
                    $("#new_edit_payment_type").val(response.payment_type);
                    $("#new_edit_request_type").val(response.request_type);
                    $("#new_edit_code").val(response.doc_type);



                    $('#new_edit_content').summernote('code', response.contents);

                    // init the state from the input
                    $(".note-checkbox").each(function () {
                        if ($(this).find('input[type="checkbox"]').first().attr("checked")) {
                            $(this).addClass('note-checkbox-checked');
                        } else {
                            $(this).removeClass('note-checkbox-checked');
                        }
                    });

                    // sync the state to the input
                    $(".note-checkbox").on("click", function (e) {
                        $(this).toggleClass('note-checkbox-checked');

                        var $checkbox = $(this).find('input[type="checkbox"]');
                        $checkbox.prop("checked", !$checkbox.prop("checked"));

                        if ($checkbox.prop("checked")) {
                            $($_this).summernote('insertImage', $(this).find('input[type="checkbox"]').val());
                        }
                        e.preventDefault();
                    });



                    $("#consultation_depart_1").val(response.consultation_depart1);
                    $("#consultation_depart_2").val(response.consultation_depart2);
                    $("#consultation_incharge1").val(response.consultation_incharge1);
                    $("#consultation_incharge2").val(response.consultation_incharge2);
                    $("#consultation_content1").val(response.consultation_content1);
                    $("#consultation_content2").val(response.consultation_content2);

                    set_select_color("#consultation_depart_1", response.consultation_depart1);
                    set_select_color("#consultation_depart_2", response.consultation_depart2);
                    set_select_color("#consultation_incharge1", response.consultation_incharge1);
                    set_select_color("#consultation_incharge2", response.consultation_incharge2);


                }

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })


    } 



    $('#new_edit_draft').modal({ backdrop: 'static', keyboard: false });
    $('#new_edit_draft').modal('show');
}



function get_form() {

    var form_id = $("#new_edit_type").val();
    $.ajax({
        type: 'POST',
        url: '/manage/draft/get_form/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'form_id': form_id,

        },
        dataType: 'Json',
        success: function (response) {
            $('#new_edit_content').summernote('code', response.data);

            // init the state from the input
            $(".note-checkbox").each(function () {
                if ($(this).find('input[type="checkbox"]').first().attr("checked")) {
                    $(this).addClass('note-checkbox-checked');
                } else {
                    $(this).removeClass('note-checkbox-checked');
                }
            });

            // sync the state to the input
            $(".note-checkbox").on("click", function (e) {
                $("span").attr('readonly', true)

                $(this).toggleClass('note-checkbox-checked');

                var $checkbox = $(this).find('input[type="checkbox"]');
                $checkbox.prop("checked", !$checkbox.prop("checked"));

                if ($checkbox.prop("checked")) {
                    $($_this).summernote('insertImage', $(this).find('input[type="checkbox"]').val());
                }
                e.preventDefault();
            });


        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}


function get_user_by_depart(obj, selected_user = null) {
    var depart = $(obj).val();
    var tmp_str = $(obj).attr('id').split('_');
    var slt_user_id = '#consultation_incharge' + tmp_str[tmp_str.length - 1];

    if (depart == '') {
        $(slt_user_id).empty();
        $(slt_user_id).append(new Option('----------', ''));

        return;
    }
    console.log(tmp_str)
    console.log(slt_user_id)

    $.ajax({
        type: 'POST',
        url: '/manage/get_user_by_depart/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'depart': depart,
        },
        dataType: 'Json',
        success: function (response) {

            $(slt_user_id).empty();


            $(slt_user_id).append("< option value = '' class='text_gray' > {{ _('None') }}({{ _('Name') }}) </option >");
            for (var i = 0; i < response.datas.length; i++) {
                $(slt_user_id).append(new Option(response.datas[i].name, response.datas[i].id));
            }
            $(slt_user_id).val(selected_user);

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function save_draft() {

    var id = $("#selected_form_id").val(); 


    var new_edit_type = $("#new_edit_type").val();
    var new_edit_payment_type = $("#new_edit_payment_type").val();
    var new_edit_request_type = $("#new_edit_request_type").val();
    var new_edit_depart = $("#new_edit_depart").val();
    var new_edit_name = $("#new_edit_name").val();
    var new_edit_cost_name = $("#new_edit_cost_name").val();
    var new_edit_title = $("#new_edit_title").val();
    var new_edit_consultation = $("#new_edit_consultation").val();
    var new_edit_MORE_CMNTS = $("#new_edit_MORE_CMNTS").val();
    var new_edit_approval1 = $("#new_edit_approval1").val();
    var new_edit_approval2 = $("#new_edit_approval2").val();

    var consultation_depart1 = $("#consultation_depart_1").val();
    var consultation_incharge1 = $("#consultation_incharge1").val();
    var consultation_content1 = $("#consultation_content1").val();
    var consultation_depart2 = $("#consultation_depart_2").val();
    var consultation_incharge2 = $("#consultation_incharge2").val();
    var consultation_content2 = $("#consultation_content2").val();

    var new_edit_status = $("#new_edit_status").val();
    var new_edit_code = $("#new_edit_code").val();


    //valid
    if (new_edit_type == '') {
        alert(gettext('Select Type'));
        return;
    }
    if (new_edit_code == '') {
        alert(gettext('Select Document Code'));
        return;
    }
    if (!show_new_edit_submenu_valid()) {
        return;
    }
    if (new_edit_cost_name == '') {
        alert(gettext('Cost Name is Empty'));
        return;
    }
    if (new_edit_name == '') {
        alert(gettext('Requester Name is Empty'));
        return;
    }

    if (new_edit_title == '') {
        alert(gettext('Title is Empty'));
        return;
    }

    //if (new_edit_consultation == '') {
    //    alert(gettext('Select CNSLT_DPRTM'));
    //    return;
    //}
    //
    //if (new_edit_MORE_CMNTS == '') {
    //    alert(gettext('Select MORE_CMNTS'));
    //    return;
    //}

    

    var new_edit_content = $('#new_edit_content').summernote('code');


    $.ajax({
        type: 'POST',
        url: '/manage/draft/save/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'id':id,

            'new_edit_type': new_edit_type,
            'new_edit_payment_type': new_edit_payment_type,
            'new_edit_request_type': new_edit_request_type,
            'new_edit_depart': new_edit_depart,
            'new_edit_cost_name': new_edit_cost_name,
            'new_edit_name': new_edit_name,
            'new_edit_title': new_edit_title,
            'new_edit_content': new_edit_content,
            'new_edit_consultation': new_edit_consultation,
            'new_edit_MORE_CMNTS': new_edit_MORE_CMNTS,
            'new_edit_approval1': new_edit_approval1,
            'new_edit_approval2': new_edit_approval2,

            'consultation_depart1': consultation_depart1,
            'consultation_incharge1': consultation_incharge1,
            'consultation_content1': consultation_content1,
            'consultation_depart2': consultation_depart2,
            'consultation_incharge2': consultation_incharge2,
            'consultation_content2': consultation_content2,

            'new_edit_status': new_edit_status,
            'new_edit_code': new_edit_code,

        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                $("#new_edit_draft").modal('hide');
                draft_search();
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function delete_draft(id=null) {
    if (id == null) {
        alert(gettext('Select Item.'));
        return;
    }

    if (confirm(gettext('Do you want to delete?'))) {

        $.ajax({
            type: 'POST',
            url: '/manage/draft/delete/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': id,



            },
            dataType: 'Json',
            success: function (response) {
                if (response.result) {
                    alert(gettext('Deleted'));
                    draft_search();
                }

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })

    }

}


function draft_search(page=null) {
    var page_context = 10;


    var start = $("#new_edit_search_date_start").val();
    var end = $("#new_edit_search_date_end").val();
    
    var string = $("#new_edit_search_title").val();

    var type = $("#new_edit_search_type").val();
    var requester = $("#new_edit_search_requester").val();
    var status = $("#new_edit_search_status").val();

    $.ajax({
        type: 'POST',
        url: '/manage/draft/search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'page_context': page_context,
            'page': page,

            'start': start,
            'end': end,
            'string': string,
            'type': type,
            'requester': requester,
            'status': status,


        },
        dataType: 'Json',
        success: function (response) {
            //이벤트 중복 방지
            $(".check_approve").unbind('click');
            console.log(response)

            $("#draft_table tbody").empty();
            for (var i = 0; i < page_context; i++){

                if (response.datas[i]) {

                    var status_span = '';
                    switch (response.datas[i].status) {
                        case "REQUEST":
                            status_span = "<span class='label label-info'>" + response.datas[i].status_val + "</span>"
                            break;
                        case "CANCEL":
                            status_span = "<span class='label label-warning'>" + response.datas[i].status_val + "</span>"
                            break;
                        case "PENDING":
                            status_span = "<span class='label' style='background-color:rgb(200,191,231);'>" + response.datas[i].status_val + "</span>"
                            break;
                        case "WAITING":
                            status_span = "<span class='label label-success'>" + response.datas[i].status_val + "</span>"
                            break;
                        case "DONE":
                            status_span = "<span class='label label-danger'>" + response.datas[i].status_val + "</span>"
                            break;
                        default:
                            status_span = "<span class='label label-default'>" + response.datas[i].status_val + "</span>"
                            break;

                    }

                    var str = "<tr><td>" + response.datas[i].id + "</td>" +
                        //상태
                        "<td>" + status_span + "</td>" +
                        "<td>" + response.type_dict[response.datas[i].type] + "</td>" +
                        "<td>" + response.datas[i].title + "</td>" +
                        "<td>" + response.datas[i].requester + "</td>" +
                        "<td>" + response.datas[i].RQSTD_DATE + "</td>" +
                        //담당자 승인
                        "<td><input type='checkbox' class='check_approve check_incharge' aprv_id=" + response.datas[i].in_charge_id + " id='check_incharge_" + response.datas[i].id + "' onclick='check(this)' " +
                        ((response.datas[i].in_charge == null) ? '' : 'checked' ) + "/><br/ >" + 
                        ((response.datas[i].in_charge == null) ? '' : response.datas[i].in_charge) + "</td > " +
                        //팀장 승인
                        "<td><input type='checkbox' class='check_approve' id='check_leader_" + response.datas[i].id + "'  onclick='check(this)' " +
                        ((response.datas[i].leader == null) ? '' : 'checked' )+ "/><br/ > " +
                        ((response.datas[i].leader == null) ? '' : response.datas[i].leader) + "</td>" +
                        //회계 승인 - THE 고정
                        "<td><input type='checkbox' class='check_approve SIGN_THE' id='check_accounting_" + response.datas[i].id + "'  onclick='check(this)' " +
                        ((response.datas[i].accounting == null) ? '' : 'checked') + "/><br/ > " +
                        ((response.datas[i].accounting == null) ? '' : response.datas[i].accounting) + "</td > " +
                        //대표 승인 - 안대표님 고정
                        "<td><input type='checkbox' class='check_approve SIGN_AN' id='check_ceo_" + response.datas[i].id + "'  onclick='check(this)' " +
                        ((response.datas[i].ceo == null) ? '' : 'checked') + "/><br/ > " +
                        ((response.datas[i].ceo == null) ? '' : response.datas[i].ceo) + "</td>" +
                        "<td>" + "<a class='btn btn-default btn-xs' style='margin-right:5px;' href='javascript: void (0);' onclick='list_file(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-file-o'></i></a>" + "</td>" +
                        "<td>" +
                        "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='show_new_edit_draft(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                        "<a class='btn btn-danger btn-xs' style='margin:0px 5px;' href='javascript: void (0);' onclick='delete_draft(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-trash'></i></a>" +
                        "<a class='btn btn-success btn-xs' href='javascript: void (0);' onclick='print_draft(" + response.datas[i]['id'] + ")' ><i class='fa fa-lg fa-print'></i></a>" +
                        "</td></tr>";
                    
                } else {
                    var str = "<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>"
                
                }
                $("#draft_table tbody").append(str);
               
            }
            //페이징
            $('#table_pagnation').html('');
            str = '';
            if (response.has_previous == true) {
                str += '<li> <a onclick="draft_search(' + (response.page_number - 1) + ')">&laquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&laquo;</span></li>';
            }

            for (var i = response.page_range_start; i < response.page_range_stop; i++) {
                if (response.page_number == i) {
                    str += '<li class="active"><span>' + i + ' <span class="sr-only">(current)</span></span></li>';
                }
                else if (response.page_number + 5 > i && response.page_number - 5 < i) {
                    str += '<li> <a onclick="draft_search(' + i + ')">' + i + '</a></li>';
                }
                else {
                }

            }
            if (response.has_next == true) {
                str += '<li><a onclick="draft_search(' + (response.page_number + 1) + ')">&raquo;</a></li>';
            } else {
                str += '<li class="disabled"><span>&raquo;</span></li>';
            }
            $('#table_pagnation').html(str);

            //이벤트 재등록
            $(".check_approve").bind('click');
            check_approval_checkbox();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}


function check(obj = null) {
    if (obj == null) {
        return;
    }

    var str = '';
    is_check = $(obj).prop("checked");
    if (is_check) {
        str = gettext('Do you want to approve?');
    } else {
        str = gettext('Do you want cancel approval?');
    }
    //승인 확인 시
    if (confirm(str)) {
        //승인 시 작동
        var tmp_id = $(obj).attr('id');

        var split_data = tmp_id.split('_');
        $.ajax({
            type: 'POST',
            url: '/manage/draft/check_appraove/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),

                'id': split_data[2],
                'type': split_data[1],
                'val': $(obj).prop("checked"),

            },
            dataType: 'Json',
            success: function (response) {
                if (response.result) {
                    draft_search();
                }

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })

    } else {
        if (is_check) {
            $(obj).prop("checked", false);
        } else {
            $(obj).prop("checked",true);
        }
    }

}


function list_file(id = null) {
    if (id == null) {
        return;
    }


    $.ajax({
        type: 'POST',
        url: '/manage/draft/list_file/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'id': id,
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
            url: '/manage/draft/get_file/',
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
            url: '/manage/draft/delete_file/',
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



function print_draft(id = null) {
    if (id == null) {
        return;
    }

    $("#dynamic_div").html('');
    $('#dynamic_div').load('/manage/draft/print/' + id);
    $('#dynamic_div').printThis({});


}

