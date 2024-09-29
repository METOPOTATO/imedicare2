

jQuery.browser = {};
$(function () {

    //Init
    //get date
    var date = new Date();
    var year_now = date.getFullYear();
    var month_now = date.getMonth() + 1;
    //set date
    $("#contents_filter_year").val(year_now);
    $("#contents_filter_month").val(month_now);
    //search
    database_search();

    //inventory history
    $('.date_input').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        locale: {
            format: 'YYYY-MM-DD'
        }
    });
    $("#date_start").val(moment().subtract(7, 'd').format('YYYY-MM-DD'));
    $('.date_input, #contents_filter_year,#contents_filter_month').change(function () {
        database_search();
    })



    //database_search();

    
});

function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}



function database_search() {

    var year = $("#contents_filter_year").val();
    var month = $("#contents_filter_month").val();
    //var type = $("#contents_filter_type").val();

    $('#statistics_table_body').empty();
    $.ajax({
        type: 'POST',
        url: '/doctor/statistics_PM_search/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

            'year': year,
            'month': month,
            //'type': type,
        },
        dataType: 'Json',
        success: function (response) {
            console.log(response)
            //New / Reapeat 
            $("#statistics_table_tbody_new_re").empty();
            var str = "<tr>" +
                "<td>" + numberWithCommas(response.new_count) + "</td>" + 
                "<td>" + numberWithCommas(response.repeat_count) + "</td>" + 
                "<td>" + numberWithCommas(response.new_count + response.repeat_count) + "</td>" + 
                "</tr>"
            $("#statistics_table_tbody_new_re").append(str);

            var total_count = 0;
            var total_amount = 0;
            // monthly
            $('#statistics_table_body_month').empty();
            for (var i = 0; i < response.list_by_day.length; i++) {

                str = "<tr><td>" + response.list_by_day[i]['day'] + "</td>" +
                    "<td>" + numberWithCommas(response.list_by_day[i]['count']) + "</td>" +
                    "<td>" + numberWithCommas(response.list_by_day[i]['amount']) + "</td></tr>";

                $('#statistics_table_body_month').append(str);

                total_count += parseInt(response.list_by_day[i]['count']);
                total_amount += parseInt(response.list_by_day[i]['amount']);
            }

            str = "<tr><td><b>Total</b></td>" +
                "<td>" + numberWithCommas(total_count) + "</td>" +
                "<td>" + numberWithCommas(total_amount) + "</td></tr>";
            $('#statistics_table_body_month').append(str);

            $("#total_service_fee").html(numberWithCommas(response.total_service_fee));
            $("#total_service_fee_vat").html(numberWithCommas(response.total_service_fee_vat));
            $("#total_service_fee_total").html(numberWithCommas(response.total_service_fee_total));
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}




function excel_download() {
    var year = $("#contents_filter_year").val();
    var month = $("#contents_filter_month").val();
    //var type = $("#contents_filter_type").val();

    var url = '/manage/PM_SPECIAL1_excel?'
    url += 'year=' + year + '&';
    url += 'month=' + month + '&';

    window.open(url);
}