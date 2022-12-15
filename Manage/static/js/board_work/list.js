$(document).ready(function () {
    //Daterangepicker
    $(".date_input").daterangepicker({
        autoUpdateInput: false,
        timePicker: true,
        timePicker24Hour:false,
        singleDatePicker: true,
        showDropdowns: true,
        drops: "down",
        locale: {
            format: 'YYYY-MM-DD hh A',
            locale: { cancelLabel: 'Clear' }
        },
    }).on('apply.daterangepicker', function (ev, picker) {
        $(this).val(picker.endDate.format('YYYY-MM-DD hh A'))
    });

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
        //$("#content_comment_option_additional_div_" + top_id).show();
        //$("#comment_select_user_" + top_id).attr('disabled', true);
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


        //$("#content_comment_option_additional_div_" + split_id[2]).show();
        //$("#comment_select_user_" + split_id[2]).attr('disabled', false);
        top_id = $(this).attr('comment-top');
        is_edit = true;
    });


    $(".add_reply_comment").click(function () {
        if (is_edit) {// 수정
            set_edit(reply_upper, top_id);
        } else {// 추가
            add_comment(reply_upper, top_id);
        }
    });

    //삭제
    $(".delete_comment").click(function () {
        var this_id = $(this).attr('id');
        var split_id = this_id.split('_');

        delete_comment(split_id[2]);
    });


    //comments_update();

    $(".emoji").click(function () {


    })
});
//댓글 새로고침
function comments_update(contents_id) {
    $.ajax({
        type: 'POST',
        url: '/manage/board/comment/get',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'content_id': $("#content_id").val(),   //게시 글 ID
        },
        dataType: 'Json',
        success: function (response) {
            console.log(response);
            $("#content_comment_list").html('');

            var str = '';
            for (var i = 0; i < response.list_comment.length; i++) {
                str += "<div class='comment_div'><div class='comment'>";
                for (var j = 0; j < response.list_comment[i].depth; j++) {
                    str += "<div class='comment_depth'></div>";
                }
                if (response.list_comment[i].depth > 0) {
                    str += "<div class='comment_depth_stair'>ㄴ</div>";
                }
                str += "<div class='comment_user_name'><p>" + response.list_comment[i].user;
                if (response.list_comment[i].start_date != '') {//시작시간 설정 시
                    var start_date = moment(response.list_comment[i].start_date,'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh A')
                    str += '<p>S:' + start_date + '</p>'
                }
                if (response.list_comment[i].expected_date != '') {//예상시간 설정 시
                    var start_date = moment(response.list_comment[i].expected_date, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh A')
                    str += '<p>E:' + start_date + '</p>'
                }
                if (response.list_comment[i].end_date != '') {//종료시간 설정 시
                    var start_date = moment(response.list_comment[i].end_date, 'YYYY-MM-DD hh:mm:ss').format('YYYY-MM-DD hh A')
                    str += '<p>D:' + start_date + '</p>'
                }

                str += "</p></div>" + "<div class='comment_item'>";

                if (response.list_comment[i].depth == 0 && response.list_comment[i].in_charge != '') {
                    str += '<p><b style="color:blue">@ To : ' + response.list_comment[i].in_charge + ' </b> - ' + response.list_comment[i].status + ' </p>'
                }
                str += "<p id='comment_item_" + response.list_comment[i].id + "'>" + response.list_comment[i].comment + "</p></div>" +
                    "<div class='comment_date'><p>" + response.list_comment[i].datetime + 
                    "&emsp;<i class='fa fa-reply fa-flip-vertical i_coursor reply_comment' aria-hidden='true' id='reply_comment_" + response.list_comment[i].id + "'></i>";

                
                if (response.list_comment[i].is_creator == true) {
                    str += "<i class='fa fa-pencil fa-fw i_coursor edit_comment' aria-hidden='true' id='edit_comment_" + response.list_comment[i].id +"'></i>" +
                        "<i class='fa fa-trash fa-fw i_coursor delete_comment' aria-hidden='true' id='delete_comment_" + response.list_comment[i].id +"'></i>";
                }    
                str += "</p></div></div>" +
                    "<div class='comment_reply_wrap' id='reply_comment_div_" + response.list_comment[i].id + "'>" +
                    "<div class='comment_reply'><span class='fl' id='comment_text_front_" + response.list_comment[i].id + "'></span><div class='input-group'>";
                //댓글이 최상위 , 담당자가 있을때만 표시
                if (response.list_comment[i].depth == 0 && response.list_comment[i].in_charge != '') {
                   
                    //시작시간
                    str += '<table class="table"><tr>' + 
                        '<td><div class="input-group start_date_div"><span class="input-group-addon" id="basic-addon1">' + gettext('Start Date') + '</span>' +
                        '<input type="text" id="comment_start_date" class="form-control date_input" aria-describedby="basic-addon1" autocomplete="off" value=""/>' +
                        '</div></td>';
                    //예상시간
                    str += '<td><div class="input-group start_date_div"><span class="input-group-addon" id="basic-addon1">' + gettext('Expected Date') + '</span>' +
                        '<input type="text" id="comment_start_date" class="form-control date_input" aria-describedby="basic-addon1" autocomplete="off" value=""/>' +
                        '</div></td>';
                    //종료시간
                    str += '<td><div class="input-group start_date_div"><span class="input-group-addon" id="basic-addon1">' + gettext('Due Date') + '</span>' +
                        '<input type="text" id="comment_start_date" class="form-control date_input" aria-describedby="basic-addon1" autocomplete="off" value=""/>' +
                        '</div></td>';
                    //진행상태
                    str += '<td><div class="input-group start_date_div"><span class="input-group-addon" id="basic-addon1">' + gettext('Status Date') + '</span>' +
                        '<select class="form-control" name="comment_status" id="comment_status"><option value="">----------</option>' +
                        '</div></tr></table>';
                }
                    str += "<textarea class='form-control reply_comment_text' id = 'reply_comment_text_" + response.list_comment[i].id + "' ></textarea >" +
                    "<span class='input-group-btn'>" +
                    "<a class='btn btn-default add_reply_comment' id='add_reply_comment_" + response.list_comment[i].id + "'>" + gettext('Add<br />Comment') + "</a></span > " +
                    "</div></div>" +
                    "</div > " +
                    "</div>";
            }
            $("#content_comment_list").html(str);

            //답글
            var reply_content = '';
            var reply_textarea = '';
            var reply_upper = '';
            var is_edit = false;
            $(".reply_comment").click(function () {
                $(".comment_reply_wrap").hide();
                var this_id = $(this).attr('id');
                var split_id = this_id.split('_');

                reply_content = $("#reply_comment_div_" + split_id[2]);
                reply_textarea = $("#reply_comment_text_" + split_id[2]);
                reply_textarea.val('');

                $("#comment_text_front_" + split_id[2]).html('ㄴ');
                reply_upper = split_id[2];
                reply_content.show();
                is_edit = false;
                
            });
            //$(".add_reply_comment").click(function () {
            //    if (is_edit) {// 수정
            //        set_edit(reply_upper);
            //    } else {// 추가
            //        add_comment(reply_upper);
            //    }
            //    
            //});

            //수정
            $(".edit_comment").click(function () {
                $(".comment_reply_wrap").hide();
                var this_id = $(this).attr('id');
                var split_id = this_id.split('_');

                reply_content = $("#reply_comment_div_" + split_id[2]);
                reply_textarea = $("#reply_comment_text_" + split_id[2]);
                reply_textarea.val($("#comment_item_" + split_id[2]).html());
                reply_upper = split_id[2];
                $("#comment_text_front_" + split_id[2]).html('Edit:');
                reply_content.show();


                is_edit = true;
            });

            //삭제
            $(".delete_comment").click(function () {
                var this_id = $(this).attr('id');
                var split_id = this_id.split('_');

                delete_comment(split_id[2]);
            });


            $("#content_comment_count").html(gettext('Comments') + '(' + response.conntents_count + ')');
            $("#content_comment_count_top").html(response.conntents_count )
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}

//댓글 등록
function add_comment(upper = null, top_id =null) {
    var comment = ''
    var select_user = '';
    var start_date = '';
    var expected_date = '';
    var due_date = '';
    var status = '';

    if (upper == null) {
        comment = $("#text_comment_new").val();
    }
    else {
        comment = $("#reply_comment_text_" + upper).val();
    }

    if (comment == '') {
        alert(gettext('Input Text'));
        return;
    }

    if (top_id != null) {
        select_user = $("#comment_select_user_" + top_id).val();
        start_date = $("#comment_start_date_" + top_id);
        expected_date = $("#comment_expected_date_" + top_id);
        due_date = $("#comment_due_date_" + top_id);
        status = $("#comment_status_" + top_id).val();
    } else {
        select_user = $("#comment_select_user").val();
        start_date = $("#comment_start_date");
        expected_date = $("#comment_expected_date");
        due_date = $("#comment_due_date");
        status = $("#comment_status").val();
    }


    if ($(start_date).val() != '') {
        start_date = $(start_date).data('daterangepicker').startDate.format('YYYY-MM-DD HH:00:00')
    } else {
        start_date = '0000-00-00 00:00:00'
    }
    if ($(expected_date).val() != '') {
        expected_date = $(expected_date).data('daterangepicker').startDate.format('YYYY-MM-DD HH:00:00')
    } else {
        expected_date = '0000-00-00 00:00:00'
    }
    if ($(due_date).val() != '') {
        due_date = $(due_date).data('daterangepicker').startDate.format('YYYY-MM-DD HH:00:00')
    } else {
        due_date = '0000-00-00 00:00:00'
    }



    $.ajax({
        type: 'POST',
        url: '/manage/board_work/comment/add',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'content_id': $("#content_id").val(),   //게시 글 ID
            'comment': comment,     //댓글 내용
            'upper_id': upper,
            'top_id': top_id,

            'select_user': select_user,
            'start_date': start_date,
            'expected_date': expected_date,
            'due_date': due_date,
            'status': status,
        },
        dataType: 'Json',
        success: function (response) {
            comments_update($("#content_id").val());
            $("#text_comment_new").val('');
            $("#comment_select_user").val('');
            $("#comment_start_date").val('');
            $("#comment_expected_date").val('');
            $("#comment_due_date").val('');
            $("#comment_status").val('');

            location.reload();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    });
}

//댓글 수정
function set_edit(id,top_id) {
    comment = $("#reply_comment_text_" + id).val();
    if (comment == '') {
        alert(gettext('Input Text'));
        return;
    }

    var select_user = $("#comment_select_user_" + top_id).val();
    var start_date = $("#comment_start_date_" + top_id);
    var expected_date = $("#comment_expected_date_" + top_id);
    var due_date = $("#comment_due_date_" + top_id);
    var status = $("#comment_status_" + top_id).val();

    if ($(start_date).val() != '') {
        start_date = $(start_date).data('daterangepicker').startDate.format('YYYY-MM-DD HH:00:00')
    } else {
        start_date = '0000-00-00 00:00:00'
    }
    if ($(expected_date).val() != '') {
        expected_date = $(expected_date).data('daterangepicker').startDate.format('YYYY-MM-DD HH:00:00')
    } else {
        expected_date = '0000-00-00 00:00:00'
    }
    if ($(due_date).val() != '') {
        due_date = $(due_date).data('daterangepicker').startDate.format('YYYY-MM-DD HH:00:00')
    } else {
        due_date = '0000-00-00 00:00:00'
    }

    console.log(start_date)
    console.log(expected_date)
    console.log(due_date)
    $.ajax({
        type: 'POST',
        url: '/manage/board_work/comment/edit/' + id + '/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'content_id': id,   //댓글  ID
            'comment': comment,     //댓글 내용

            'top_id': top_id,     //최상위

            'select_user': select_user,
            'start_date': start_date,
            'expected_date': expected_date,
            'due_date': due_date,
            'status': status,
        },
        dataType: 'Json',
        success: function (response) {
            comments_update($("#content_id").val());
            $("#text_comment_new").val();
            location.reload();
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });
}


//댓글 삭제
function delete_comment(id) {
    
    if (confirm(gettext('Do you want to delete this comment?'))) {
        var url = '/manage/board/comment/delete/' + id + '/';


        $.ajax({
            type: 'POST',
            url: url,
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'content_id': $("#content_id").val(),   //게시 글 
                'id':id,
            },
            dataType: 'Json',
            success: function (response) {
                comments_update($("#content_id").val());
                $("#text_comment_new").val();
                location.reload();
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        });
    }
}



function toggle_comment(obj, content_id) {



    if ($(obj).hasClass("fa-chevron-up")) {
        $(".comment_tr[content-id-data=" + content_id + "]").hide();

        $(obj).removeClass("fa-chevron-up");
        $(obj).addClass("fa-chevron-down");
    } else {
        $(".comment_tr[content-id-data=" + content_id + "]").show();

        $(obj).removeClass("fa-chevron-down");
        $(obj).addClass("fa-chevron-up");
    }


}


function btn_emoji(obj, number, comment_id) {

    var emiji = ''
    if (number == 1)
        emiji = '📖';
    else if (number == 2)
        emiji = '📝';
    else if (number == 3)
        emiji = '👍';
    else if (number == 4)
        emiji = '🔍';



    $.ajax({
        type: 'POST',
        url: '/manage/board_work/comment/emoji/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'comment_id': comment_id,
            'number':number,
        },
        dataType: 'Json',
        success: function (response) {

            console.log(response)
            if (response.result == true) {
                $(obj).children('span').html(emiji)
            } else {
                $(obj).children('span').html('')
            }
            

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });
}