


$(function () {



    //문자 글자 고정
    $("input[type='text']").on("change", function () { text_rule(this) });
    $("input[type='text']").on("keydown", function () { text_rule(this) });


    waiting_list_sys_admin_get();
});

function text_rule(obj) {
    if ($(obj).val().length > 80) {
        $(obj).val($(obj).val().substring(0, 80));
    }
}



async function waiting_list_sys_admin_get() {


    $.ajax({
        type: 'POST',
        url: '/waiting_list_sys/admin/get/',
        data: {
            'csrfmiddlewaretoken': $("input[name='csrfmiddlewaretoken']").val(),
        },
        dataType: 'Json',
        success: function (response) {

            $("#interval").val(response.interval);
            $("#text_interval").val(response.text_interval);
            $("#text_1").val(response.text1);
            $("#text_2").val(response.text2);
            $("#text_3").val(response.text3);
            $("#text_4").val(response.text4);
            $("#text_5").val(response.text5);
            $("#text_6").val(response.text6);
            $("#text_7").val(response.text7);
            $("#text_8").val(response.text8);
            $("#text_9").val(response.text9);
            $("#text_10").val(response.text10);

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })


}


function waiting_list_sys_admin_set() {
   
    $.ajax({
        type: 'POST',
        url: '/waiting_list_sys/admin/set/',
        data: {
            'csrfmiddlewaretoken': $("input[name='csrfmiddlewaretoken']").val(),
            'interval_sec': $("#interval").val(),
            'text_interval_sec': $("#text_interval").val(),
            'text1': $("#text_1").val(),
            'text2': $("#text_2").val(),
            'text3': $("#text_3").val(),
            'text4': $("#text_4").val(),
            'text5': $("#text_5").val(),
            'text6': $("#text_6").val(),
            'text7': $("#text_7").val(),
            'text8': $("#text_8").val(),
            'text9': $("#text_9").val(),
            'text10': $("#text_10").val(),
        },
        dataType: 'Json',
        success: function (response) {
            alert("Saved");

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })
}

