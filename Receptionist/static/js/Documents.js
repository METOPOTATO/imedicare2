

$(function () {
    //init
    $("#document_control_start").daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        //startDate: moment().subtract(1, 'months'),
        locale: {
            format: 'YYYY-MM-DD',
        },
    })
    $("#document_control_end").daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD',
        },
    });
    if ($("#language").val() == 'vi') {
        var today = moment().format('DD/MM/YYYY');
        $('#document_control_start,#document_control_end').val(today);
    }
    $('#document_control_start,#document_control_end').on('apply.daterangepicker', function (ev, picker) {
        var today = moment().format('YYYY[-]MM[-]DD');
        if ($("#language").val() == 'vi') {
            $(this).val(picker.startDate.format('DD/MM/YYYY'));
        }
    });

    $('#document_control_input').keydown(function (key) {
        if (key.keyCode == 13) {
            document_search();
        }
    })

    $("#document_control_search").click(function () {
        document_search();
    })


    $("#document_control_start ,#document_control_end, #document_control_depart_div").change(function () {
        document_search();
    });

    document_search();

});

function document_search() {

    var document_control_start = $('#document_control_start').val();
    var document_control_end = $('#document_control_end').val();
    var document_control_depart = $('#document_control_depart').val();
    var document_control_input = $('#document_control_input').val();

    if ($("#language").val() == 'vi') {
        document_control_start = moment(document_control_start, 'DD/MM/YYYY').format('YYYY-MM-DD');
        document_control_end = moment(document_control_end, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }



    $.ajax({
        type: 'POST',
        url: '/receptionist/document_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'document_control_start': document_control_start,
            'document_control_end': document_control_end,
            'document_control_depart': document_control_depart,
            'document_control_input': document_control_input,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result == true) {
                $('#document_contents').empty();
                for (var i = 0; i < response.datas.length; i++) {

                    var str = '<tr><td>' + (i + 1) + '</td>' +
                        '<td>' + response.datas[i].chart + '</td>' +
                        '<td>' + response.datas[i].name + '</td>' +
                        '<td>';
                    if ($("#language").val() == 'vi') {
                        str += moment(response.datas[i].date_of_birth, 'YYYY-MM-DD').format('DD/MM/YYYY');
                    } else {
                        str += response.datas[i].date_of_birth;
                    }
                    str += '</td>' +
                        '<td>' + response.datas[i].depart + '</td>' +
                        '<td>' + response.datas[i].address + '</td>' +
                        '<td>' + response.datas[i].phone + '</td>' +
                        '<td>';
                    if ($("#language").val() == 'vi') {
                        str += moment(response.datas[i].date_time, 'YYYY-MM-DD HH:mm').format('HH:mm DD/MM/YYYY');
                    } else {
                        str += response.datas[i].date_time;
                    }
                    str += '</td>';
                    // Passport
                    console.log('======================')
                    str += '<td>' + response.datas[i].passport + '</td>' 

                    if (response.datas[i].medical_receipt== true) {
                        str += '<td>' + "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='print_medical_receipt(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-print'></i></a>" + '</td>';
                    }
                    else {
                        str += '<td></td>';
                    }

                    if (response.datas[i].medicine_receipt== true) {
                        str += '<td>' + "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='print_medicine_receipt(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-print'></i></a>" + '</td>';
                    }
                    else {
                        str += '<td></td>';
                    }

                    if (response.datas[i].subclinical == true) {
                        str += '<td>' + "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='print_subclinical_report(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-print'></i></a>" + '</td>';
                    }
                    else {
                        str += '<td></td>';
                    }


                    if (response.datas[i].medical_report == true) {
                        str += '<td>' + "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='print_medical_report(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-print'></i></a>"+'</td>';
                    }
                    else {
                        str += '<td></td>';
                    }

                    if (response.datas[i].prescription == true) {
                        str += '<td>' + "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='print_prescription(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-print'></i></a>"+'</td>';
                    }
                    else {
                        str += '<td></td>';
                    }

                    if (response.datas[i].lab_report == true) {
                        str += '<td>' + "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='print_lab_report(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-print'></i></a>"+  '</td>';
                    }
                    else {
                        str += '<td></td>';
                    }

                    if (response.datas[i].vaccine_certificate == true) {
                        str += '<td>' + "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='print_vaccine_certificate(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-print'></i></a>" + '</td>';
                    }
                    else {
                        str += '<td></td>';
                    }
                    // if (response.datas[i].vaccine_certificate == true) {
                        str += '<td>' + "<a class='btn btn-default btn-xs' href='javascript: void (0);' onclick='excel_download(" + response.datas[i].id + ")' ><i class='fa fa-lg fa-file-excel-o'></i></a>" + '</td>';
                    // }
                    // else {
                    //     str += '<td></td>';
                    // }


                    $("#document_contents").append(str);
                }


            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });
}


function print_medical_report(id) {
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_medical_report/' + id);

    $('#dynamic_div').printThis({
    });
}


function print_subclinical_report(id) {
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_subclinical/' + id);

    $('#dynamic_div').printThis({
    });


}

function print_prescription(id) {
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_prescription/' + id);

    $('#dynamic_div').printThis({
    });
}

function print_lab_report(id) {
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_lab/'+id);

    $('#dynamic_div').printThis({
    });
}

function print_lab_report2(id) {
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_lab2/'+id);

    $('#dynamic_div').printThis({
    });
}

function print_medical_receipt(id) {
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_medical_receipt/' + id);

    $('#dynamic_div').printThis({
    });
}

function print_medicine_receipt(id) {
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_medicine_receipt/' + id);

    $('#dynamic_div').printThis({
    });
}


function print_vaccine_certificate(id) {
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_vaccine_certificate/' + id);

    $('#dynamic_div').printThis({
    });
}

function excel_download(id) {


    // var start_date = $("#date_start").val();
    // var end_date = $("#date_end").val();

    // var contents_filter_depart = $("#contents_filter_depart").val();

    var url = '/receptionist/document_excel/' + id
    // url += 'start_date=' + start_date + '&';
    // url += 'end_date=' + end_date + '&';
    // url += 'depart=' + contents_filter_depart + '&';

    window.open(url);
}