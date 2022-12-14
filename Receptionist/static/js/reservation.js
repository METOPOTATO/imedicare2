
$(function () {

    $('#reservation_search_date, #re_reservation_date').daterangepicker({
        autoUpdateInput: true,
        singleDatePicker: true,
        showDropdowns: true,
        drops: "down",
        locale: {
            format: 'YYYY-MM-DD HH:mm:ss',
            locale: { cancelLabel: 'Clear' }
        },
    });
    //초기값
    if ($("#language").val() == 'vi') {
        var today = moment().format('DD[/]MM[/]YYYY');
        $('#reservation_search_date').val(today);
    }
    //선택 시 
    $('#reservation_search_date').on('apply.daterangepicker', function (ev, picker) {
        var today = moment().format('YYYY[-]MM[-]DD');
        if ($("#language").val() == 'vi') {
            $(this).val(picker.startDate.format('DD/MM/YYYY'));
        }
    });

    $('#reservation_search_doctor').empty();
    $('#reservation_search_doctor').append(new Option('---------', ''));
    $("#reservation_search_depart").change(function () {
        if (this.value == '') {
            $('#reservation_search_doctor').empty();
            return;
        }
        $.ajax({
            type: 'POST',
            url: '/receptionist/get_depart_doctor/',
            data: {
                'csrfmiddlewaretoken': $('#csrf').val(),
                'depart': this.value
            },
            dataType: 'Json',
            success: function (response) {
                $('#reservation_search_doctor').empty();
                $('#reservation_search_doctor').append(new Option('---------', ''));
                for (var i in response.datas)
                    $('#reservation_search_doctor').append("<option value='" + response.datas[i] + "'>" + i + "</Option>");

            },
            error: function (request, status, error) {
                console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

            },
        })
    });



});


function get_doctor(part, depart = null) {
    var part_id = part.attr('id');
    var doctor;
    if (part_id == 'reservation_search_depart') {
        doctor = $('#reservation_search_doctor');
    } else if (part_id == 'reservation_depart') {
        doctor = $('#reservation_doctor');
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
            for (var i in response.datas)
                doctor.append("<option value='" + response.datas[i] + "'>" + i + "</Option>");

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })

}