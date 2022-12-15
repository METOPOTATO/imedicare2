

jQuery.browser = {};
$(function () {
    

});


function inventory_menu_get(obj,id = null) {
    if (id == null) return;

    $("#inventory_database_table tr").removeClass('danger')
    $(obj).addClass('danger')


    $("#selected_depart").val('')
    $(".menu_item_wrap input[type='checkbox']").prop('checked', false);


    $.ajax({
        type: 'POST',
        url: '/manage/inventory_menu_get/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id': id,
        },
        dataType: 'Json',
        success: function (response) {

            $("#selected_depart").val(id);

            for (var i = 0; i < response.test_list.length; i++) {
                $("#test_" + response.test_list[i].id).prop('checked', true);
            }

            for (var i = 0; i < response.precedure_list.length; i++) {
                $("#precedure_" + response.precedure_list[i].id).prop('checked', true);
            }

            for (var i = 0; i < response.medicine_list.length; i++) {
                $("#medicine_" + response.medicine_list[i].id).prop('checked', true);
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })

}

function inventory_menu_set() {

    var depart_id = $("#selected_depart").val();
    if (depart_id == '') {
        alert(gettext('Depart is not selected'))
    }



    var test_array = []
    var test_checked = $(".div_test_class input:checked");
    for (var i = 0; i < test_checked.length; i++) {
        test_array.push($(test_checked[i]).attr('id'))
    }

    var precedure_array = []
    var precedure_checked = $(".div_precedure_class input:checked");
    for (var i = 0; i < precedure_checked.length; i++) {
        precedure_array.push($(precedure_checked[i]).attr('id'))
    }

    var medicine_array = []
    var medicine_checked = $(".div_medicine_class input:checked");
    for (var i = 0; i < medicine_checked.length; i++) {
        medicine_array.push($(medicine_checked[i]).attr('id'))
    }


    $.ajax({
        type: 'POST',
        url: '/manage/inventory_menu_set/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'depart_id': depart_id,

            'test_array[]': test_array,
            'precedure_array[]': precedure_array,
            'medicine_array[]': medicine_array,

        },
        dataType: 'Json',
        success: function (response) {
            alert(gettext('Saved'))
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    })

}