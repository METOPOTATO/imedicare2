function show_memo_detail(){

    var id = $("#patient_package_registration_id").val();
    var patient_id = $("#patient_id").val();
    var depart_id = $("#depart_filter_reg").val();
    var doctor_id = $("#doctor_filter_reg").val();

    $.ajax({
        type: 'POST',
        url: '/receptionist/get_memo_detail/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            // 'id': id, //패키지 아이디
            'patient_id': patient_id,
            // 'depart_id': depart_id,
            // 'doctor_id': doctor_id,

            
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                $('#table_memo_detail > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                        var str = "<tr>"
    
                        str += 
                            "<td hidden>" + response.datas[i]['detail_memo_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + response.datas[i]['depart'] + "</td>" +
                            "<td>" + response.datas[i]['creator'] + "</td>" +
                            "<td><input type='text' class='form-control' value='" + response.datas[i]['memo'] + "'></input></td>" +
                            "<td>" + 
                            // "<a class='btn btn-default btn-xs' style='margin-right:10px;' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a> " +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a>" +
                            "</td></tr>";
    
                    $('#table_memo_detail > tbody').append(str);
    
                }
                // alert(gettext('Hello'))
                console.log(response.datas)
                $('#memo_detail_modal').modal('show')
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
    // $('#memo_detail_modal').modal('show')
}

function create_memo_detail(){

    var patient_id = $("#patient_id").val();
    var memo = $('#new_memo_detail').val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/create_memo_detail/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'patient_id': patient_id,
            'memo': memo,

        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                $('#table_memo_detail > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                        var str = "<tr>"
    
                        str += 
                            "<td hidden>" + response.datas[i]['detail_memo_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + response.datas[i]['depart'] + "</td>" +
                            "<td>" + response.datas[i]['creator'] + "</td>" +
                            "<td><input type='text' class='form-control' value='" + response.datas[i]['memo'] + "'></input></td>" +
                            "<td>" + 
                            // "<a class='btn btn-default btn-xs' style='margin-right:10px;' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a> " +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a> " +

                            "</td></tr>";
    
                    $('#table_memo_detail > tbody').append(str);
    
                }
                // alert(gettext('Hello'))
                console.log(response.datas)
                $('#memo_detail_modal').modal('show');
                $('#new_memo_detail').val('')
                alert(gettext('Created'));
            }

        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}





function delete_detail_memo(id){
    var patient_id = $("#patient_id").val();
    $.ajax({
        type: 'POST',
        url: '/receptionist/delete_memo_detail/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'memo_id': id,
            'patient_id': patient_id
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                $('#table_memo_detail > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                        var str = "<tr>"
    
                        str += 
                            "<td hidden>" + response.datas[i]['detail_memo_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + response.datas[i]['depart'] + "</td>" +
                            "<td>" + response.datas[i]['creator'] + "</td>" +
                            "<td><input type='text' class='form-control' value='" + response.datas[i]['memo'] + "'></input></td>" +
                            "<td>" + 
                            // "<a class='btn btn-default btn-xs' style='margin-right:10px;' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a> " +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a>" +
                            "</td></tr>";
    
                    $('#table_memo_detail > tbody').append(str);
    
                }
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}

function update_detail_memo(id){
    var patient_id = $("#patient_id").val();
    var memo = $(`#table_memo_detail > tbody > tr:contains("${id}")`).find('td:eq(4)').find('input').val()

    $.ajax({
        type: 'POST',
        url: '/receptionist/update_memo_detail/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),
            'memo_id': id,
            'patient_id': patient_id,
            'memo': memo,
        },
        dataType: 'Json',
        success: function (response) {
            if (response.result) {
                $('#table_memo_detail > tbody ').empty();
                for (var i = 0; i < response.datas.length; i++) {
                        var str = "<tr>"
    
                        str += 
                            "<td hidden>" + response.datas[i]['detail_memo_id'] + "</td>" + 
                            "<td>" + (i + 1) + "</td>" +
                            "<td>" + response.datas[i]['depart'] + "</td>" +
                            "<td>" + response.datas[i]['creator'] + "</td>" +
                            "<td><input type='text' class='form-control' value='" + response.datas[i]['memo'] + "'></input></td>" +
                            "<td>" + 
                            // "<a class='btn btn-default btn-xs' style='margin-right:10px;' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a>" +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='update_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-pencil'></i></a> " +
                            "<a class='btn btn-danger btn-xs' href='javascript: void (0);' onclick='delete_detail_memo(" + response.datas[i]['detail_memo_id'] + ")' ><i class='fa fa-lg fa-trash'></i></a></td> " +
                            "</tr>";
    
                    $('#table_memo_detail > tbody').append(str);
    
                }
                alert(gettext('Updated'));
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}