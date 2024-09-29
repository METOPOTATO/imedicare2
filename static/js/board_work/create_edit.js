$(function () {
    $("#id_file").change(function (e) {

        $("#select_files").empty();
        var str = '';

        for (i = 0; i < e.target.files.length; i++) {
            str += '<li><div class="file_origin_name">' + e.target.files[i].name; + '</div></li>'

        }
        $("#select_files").append(str);
    });



    $('#id_file').attr("multiple", "true");





    //√Îº“
    $("#cancel").click(function () {
        if ( confirm( gettext('Are you sure you want to cancel writing?') ) ) {
            location.replace('/manage/board_work');
        }
    });


    $("#select_depart_to1,#select_depart_to2,#select_depart_to3,#select_depart_to4").change(function () {
        get_user_by_depart(this)
    })
});


function get_user_by_depart(obj,selected_user = null) {
    var depart = $(obj).val();
    var tmp_str = $(obj).attr('id').split('_');
    var slt_user_id = '#select_user_' + tmp_str[tmp_str.length - 1];

    if (depart == '') {
        $(slt_user_id).empty();
        $(slt_user_id).append(new Option('----------', ''));

        return;
    }


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
            $(slt_user_id).append(new Option(gettext('All'), 'all'));
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


function delete_file(id = null) {
    if (id == null) {
        return;
    }
    if (confirm(gettext('Do you want to delete ? '))) {

        $.ajax({
            type: 'POST',
            url: '/manage/board/delete_file/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'id': id,
            },
            dataType: 'Json',
            success: function (response) {
                if (response.result == true) {
                    $("#current_file_" + id).hide();
                }
            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    }
    
    


}