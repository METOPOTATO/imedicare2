

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
function checkTax(checkbox){
    var checkboxes = document.getElementsByName('tax_invoice');
    checkboxes.forEach((item) => {
        if (item !== checkbox) {
            console.log(item)
            item.checked = false
            console.log('here')
        }
    })
}

function checkInsurance(checkbox){
    var checkboxes = document.getElementsByName('insurance');
    checkboxes.forEach((item) => {
        if (item !== checkbox) {
            console.log(item)
            item.checked = false
            console.log('here')
        }
    })
}

function get_document(id){
    $.ajax({
        type: 'POST',
        url: '/receptionist/get_document/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'rec_id': id,
        },
        dataType: 'Json',
        success: function(response){
            console.log(response.data);
            $('#rec_id').val(response.data.id);
            $('#patient_id').val(response.data.patient_id);
            $('#depart').val(response.data.depart);
            $('#txt_address').val(response.data.address);
            $('#patient_name').val(response.data.name);
            $('#txt_time').val(response.data.date_time);
            $('#txt_email').val(response.data.email);
            $('#txt_tax').val(response.data.tax_code);
            $('#txt_invoice_address').val(response.data.address2);         
            $('#txt_memo_email').val(response.data.memo_email);
            if (response.data.medical_receipt== true) {
                $('#download_pdf1').show();
                $('#upload1').show()
            }else{
                $('#download_pdf1').hide()
                $('#upload1').hide()
            }

            if (response.data.medicine_receipt== true) {
                $('#download_pdf2').show()
                $('#upload2').show()
            }else{
                $('#download_pdf2').hide()
                $('#upload2').hide()
            }

            if (response.data.subclinical == true) {
                $('#download_pdf3').show()
                $('#upload3').show()
            }else{
                $('#download_pdf3').hide()
                $('#upload3').hide()
            }
            if (response.data.medical_report == true) {
                $('#download_pdf4').show()
                $('#upload4').show()
            }else{
                $('#download_pdf4').hide()
                $('#upload4').hide()
            }
            if (response.data.prescription == true) {
                $('#download_pdf5').show()
                $('#upload5').show()
            }else{
                $('#download_pdf5').hide()
                $('#upload5').hide()
            }
            if (response.data.lab_report == true) {
                $('#download_pdf6').show()
                $('#upload6').show()
            }else{
                $('#download_pdf6').hide()
                $('#upload6').hide()
            }
            if (response.data.vaccine_certificate == true) {                
                $('#download_pdf7').show()
                $('#upload7').show()
            }else{
                $('#download_pdf7').hide()
                $('#upload7').hide()
            }

            $('#need_invoice').prop('checked', false)
            $('#need_insurance').prop('checked', false)
            $('#need_insurance_p').prop('checked', false)
            $('#need_invoice_p').prop('checked', false)
            $('#wo_name').prop('checked', false)
            $('#wo_email').prop('checked', false)
            $('#wo_today').prop('checked', false)
            // console.log(response.need_invoice)
            if (response.data.need_invoice) {
                console.log('here')
                $('#need_invoice').prop('checked', true)
            }
            if (response.data.need_invoice_p) {
                
                $('#need_invoice_p').prop('checked', true)
            }
            if (response.data.need_insurance) {
                $('#need_insurance').prop('checked', true)
            }
            if (response.data.need_insurance_p) {
                $('#need_insurance_p').prop('checked', true)
            }
            if (response.data.wo_name) {
                $('#wo_name').prop('checked', true)
            }
            if (response.data.wo_email) {
                $('#wo_email').prop('checked', true)
            }
            if (response.data.wo_today) {
                console.log('here')
                $('#wo_today').prop('checked', true)
            }
            
            console.log(response.data.send_invoice_status)

            if( response.data.send_invoice_status){
                $('#btn_update_invoice').removeClass("btn-success").addClass("btn-secondary"); 
                $('#btn_update_invoice').val('Sent')
            }else{
                $('#btn_update_invoice').removeClass("btn-success").addClass("btn-success"); 
                $('#btn_update_invoice').val('Update Invoice Status')
            }

        },
        error: function(request, status, error){

        },
    });
}

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

                    
                    var tr_class = '';
                    if(response.datas[i].send_email_status == '1'){
                        tr_class  = "class ='green'";
                    }
                    else if(response.datas[i].send_email_status == '2'){
                        tr_class  = "class ='warning'";
                    }
                    
                    str = "<tr onclick='get_document(" + response.datas[i].id + ")'" + tr_class + "><td>" + (i + 1) + "</td>" +
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
                        // '<td>' + response.datas[i].address + '</td>' +
                        '<td>' + response.datas[i].phone + '</td>' ;
                    
                    str += '<td>' + response.datas[i].send_invoice_status + '</td>' ;
                    str += '</tr>'
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


function print_medical_report() {
    var id = $('#rec_id').val();
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_medical_report/' + id);

    $('#dynamic_div').printThis({
    });
}


function print_subclinical_report() {
    var id = $('#rec_id').val();
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_subclinical/' + id);

    $('#dynamic_div').printThis({
    });


}

function print_prescription() {
    var id = $('#rec_id').val();
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_prescription/' + id);

    $('#dynamic_div').printThis({
    });
}

function print_lab_report() {
    var id = $('#rec_id').val();
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_lab/'+id);

    $('#dynamic_div').printThis({
    });
}

function print_lab_report2() {
    var id = $('#rec_id').val();
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_lab2/'+id);

    $('#dynamic_div').printThis({
    });
}

function print_medical_receipt() {
    var id = $('#rec_id').val();
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_medical_receipt/' + id);

    $('#dynamic_div').printThis({
    });
}

function print_medicine_receipt() {
    var id = $('#rec_id').val();
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_medicine_receipt/' + id);

    $('#dynamic_div').printThis({
    });
}


function print_vaccine_certificate() {
    var id = $('#rec_id').val();
    $("#dynamic_div").html('');
    $('#dynamic_div').load('/receptionist/document_vaccine_certificate/' + id);

    $('#dynamic_div').printThis({
    });
}

function excel_download() {
    var id = $('#rec_id').val();

    // var start_date = $("#date_start").val();
    // var end_date = $("#date_end").val();

    // var contents_filter_depart = $("#contents_filter_depart").val();

    var url = '/receptionist/document_excel/' + id
    // url += 'start_date=' + start_date + '&';
    // url += 'end_date=' + end_date + '&';
    // url += 'depart=' + contents_filter_depart + '&';

    window.open(url);
}

function update_send_mail_status(e, status=1){
    var rec_id = $('#rec_id').val();
    var document_control_start = $('#document_control_start').val();
    var document_control_end = $('#document_control_end').val();
    var document_control_depart = $('#document_control_depart').val();
    var document_control_input = $('#document_control_input').val();

    if ($("#language").val() == 'vi') {
        document_control_start = moment(document_control_start, 'DD/MM/YYYY').format('YYYY-MM-DD');
        document_control_end = moment(document_control_end, 'DD/MM/YYYY').format('YYYY-MM-DD');
    }
    console.log('+++++')
    console.log(status)


    $.ajax({
        type: 'POST',
        url: '/receptionist/update_send_mail_status/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'document_control_start': document_control_start,
            'document_control_end': document_control_end,
            'document_control_depart': document_control_depart,
            'document_control_input': document_control_input,
            'id': rec_id,
            'status': status,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result == true) {
                $('#document_contents').empty();
                for (var i = 0; i < response.datas.length; i++) {

                    
                    var tr_class = '';
                    if(response.datas[i].send_email_status == 1){
                        tr_class  = "class ='green'";
                    }
                    else if(response.datas[i].send_email_status == '2'){
                        tr_class  = "class ='warning'";
                    }
                    
                    str = "<tr onclick='get_document(" + response.datas[i].id + ")'" + tr_class + "><td>" + (i + 1) + "</td>" +
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
                        '<td>' + response.datas[i].phone + '</td>'
                    str += '<td>' + response.datas[i].send_invoice_status + '</td>' ;
                    str += '</tr>'

                    $("#document_contents").append(str);
                }
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });
}

function upload_pdf(file_name, data){

    // event.preventDefault();

    
    var p_id = $('#patient_id').val()
    var depart = $('#depart').val()
    var form_data = new FormData();

    form_data.append('pdf_file', data)
    form_data.append('patient_id', p_id)
    form_data.append('file_name', file_name)
    form_data.append('depart', depart)
    $.ajax({
        type: 'POST',
        headers:{'X-CSRFToken':$('#csrf').val()},
        url: '/receptionist/upload_pdf/',
        data: form_data,
        cache: false,
        processData: false,
        contentType: false,

        success: function(response) {
            alert('Upload success');
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    });
    return false;
}

function send_email_document(){
    var rec_id = $('#rec_id').val();
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
        headers:{'X-CSRFToken':$('#csrf').val()},
        url: '/receptionist/send_email_document/',
        data: {
            'patient_id': $('#patient_id').val(),
            'patient_name': $('#patient_name').val(),
            'email': $('#txt_email').val(),
            'depart': $('#depart').val(),
            'rec_id': $('#rec_id').val(),

            'document_control_start': document_control_start,
            'document_control_end': document_control_end,
            'document_control_depart': document_control_depart,
            'document_control_input': document_control_input,
            'id': rec_id,
            'status': 2,
        },


        success: function(response) {
            if (response.result == true) {
                $('#document_contents').empty();
                for (var i = 0; i < response.datas.length; i++) {

                    
                    var tr_class = '';
                    if(response.datas[i].send_email_status == 1){
                        tr_class  = "class ='green'";
                    }
                    else if(response.datas[i].send_email_status == '2'){
                        tr_class  = "class ='warning'";
                    }
                    
                    str = "<tr onclick='get_document(" + response.datas[i].id + ")'" + tr_class + "><td>" + (i + 1) + "</td>" +
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
                        '<td>' + response.datas[i].phone + '</td>'
                    str += '</tr>'

                    $("#document_contents").append(str);
                }
            }   
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
        },
    });
    return false;
}

function upload_pdf1(){
    var data = $('#pdf_file1').prop("files")[0];
    upload_pdf('imedicare.pdf', data);
}

function upload_pdf2(){
    var data = $('#pdf_file2').prop("files")[0];
    upload_pdf('medicine_receipt.pdf', data);
}
function upload_pdf3(){
    var data = $('#pdf_file3').prop("files")[0];
    upload_pdf('subclinical.pdf', data);
}
function upload_pdf4(){
    var data = $('#pdf_file4').prop("files")[0];
    upload_pdf('medical_report.pdf', data);
}
function upload_pdf5(){
    var data = $('#pdf_file5').prop("files")[0];
    upload_pdf('prescription.pdf', data);
}
function upload_pdf6(){
    var data = $('#pdf_file6').prop("files")[0];
    upload_pdf('lab_result.pdf', data);
}
function upload_pdf7(){
    var data = $('#pdf_file7').prop("files")[0];
    upload_pdf('vaccine.pdf', data);
}

// function get_tax(){
//     $.ajax({
//         url: 'https://api.vietqr.io/v2/business/0900289842',
//         dataType: 'Json',
//         success: function(response){
//             console.log(response)
//         }
//     })
// }

function update_send_invoice_status(){
    var rec_id = $('#rec_id').val();

    $.ajax({
        type: 'POST',
        url: '/receptionist/update_send_invoice_status/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id': rec_id
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result){
                $('#btn_update_invoice').removeClass("btn-success").addClass("btn-secondary"); 
                $('#btn_update_invoice').val('Sent')
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    });
}

function save_memo_email(){
    var rec_id = $('#rec_id').val();
    var txt_memo_email = $('#txt_memo_email').val()
    $.ajax({
        type: 'POST',
        url: '/receptionist/save_memo_email/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'id': rec_id,
            'memo_email': txt_memo_email
        },
        dataType: 'Json',
        success: function (response) {
            alert('Saved!')
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error)
        },
    });
}
