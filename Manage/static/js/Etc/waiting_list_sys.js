//1	PED
//2	IM
//3	URO
//4	PS
//5	ENT
//6	DERM
//7	PM
//8	DENTAL
//9	OBGYN

const list_depart_id = [
    {//2	IM
        'id': 2,
        'color':"rgb(136,182,67);",
        'class':"depart_bg_im",
        'kor':"내과",
        'vie': "Nội khoa",
        'img':'waiting_list_im_icon.png'
    },
    {//5	ENT
        'id': 5,
        'color': "rgb(249,167,83)",
        'class': "depart_bg_ent",
        'kor': "이비인후과",
        'vie': "Khoa tai mũi họng",
        'img': 'waiting_list_ent_icon.png'
    },
    {//6	DERM
        'id': 6,
        'color': "rgb(143,100,145)",
        'class': "depart_bg_derm",
        'kor': "피부과",
        'vie': "Da liễu",
        'img': 'waiting_list_derm_icon.png'
    },
    {//7	PM
        'id': 7,
        'color': "rgb(96,171,200)",
        'class': "depart_bg_pm",
        'kor': "통증과",
        'vie': "PHCN",
        'img': 'waiting_list_pm_icon.png'
    },
    {//8	DENTAL
        'id': 8,
        'color': "rgb(67,116,185)",
        'class': "depart_bg_dental",
        'kor': "치과",
        'vie': "Nha khoa",
        'img': 'waiting_list_dental_icon.png'
    },
    {//8	PS
        'id': 4,
        'color': "rgb(67,116,185)",
        'class': "depart_bg_ps",
        'kor': "성형과",
        'vie': "Phẫu thuật thẩm mỹ",
        'img': 'waiting_list_ps_icon.png'
    },
    {//8	OBGYN
        'id': 9,
        'color': "rgb(67,116,185)",
        'class': "depart_bg_obgyn",
        'kor': "산부인과",
        'vie': "Sản - Phụ khoa",
        'img': 'waiting_list_obgyn_icon.png'
    },]
    
var interval_sec = 5;
var text_interval_sec = 7;
var text_interval_sec_cnt = 0;
var is_focus = true;

$(function () {

    get_info();


    clock();
    setInterval(clock, 1000);
    //info_slide();
    //setInterval(info_slide, 1000 * 7);


    get_waiting_list();


});

function get_info() {
    $.ajax({
        type: 'POST',
        url: '/waiting_list_sys/admin/get/',
        data: {
            'csrfmiddlewaretoken': $("input[name='csrfmiddlewaretoken']").val(),
        },
        dataType: 'Json',
        success: function (response) {

            interval_sec = parseInt(response.interval) 
            text_interval_sec = parseInt(response.text_interval) 

            console.log()

            $("#ticker").empty();
            var li_str = ''
            for (var i = 1; i <= 10; i++) {
                var tmp = eval("response.text" + i);
                if (tmp != '') {
                    li_str += "<li><a>";
                    li_str += eval( "response.text" + i) ;
                    li_str += "</a></li>";
                }
            }
            $("#ticker").append(li_str)

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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function get_waiting_list() {

    while (true) {
        for (var i = 0; i < list_depart_id.length; i++) {

            var configuration = list_depart_id[i]

            $.ajax({
                type: 'POST',
                url: '/waiting_list_sys_get/',
                data: {
                    'csrfmiddlewaretoken': $("input[name='csrfmiddlewaretoken']").val(),
                    'depart_id': configuration['id'],
                },
                dataType: 'Json',
                success: function (response) {

                    //console.log(configuration['color'])
                    //$(".top_depart").css("background", configuration['color']);

                    for (var j = 0; j < list_depart_id.length; j++) {
                        $(".top_depart").removeClass(list_depart_id[j]['class']);
                    }

                    $(".top_depart").addClass(configuration['class']);

                    $("#depart_img").attr("src", "/static/" + configuration['img']);
                    $("#depart_name_kor").html(configuration['kor'])
                    $("#depart_name_vie").html(configuration['vie'])

                    //waiting
                    for (var i = 0; i < 5; i++) {
                        $("#patient_waiting_" + (i + 1)).removeClass("letter-small");
                        if (response.list_waiting[i]) {
                            $("#patient_waiting_" + (i + 1)).html(response.list_waiting[i].name);
                            //$("#patient_waiting_time_" + (i + 1)).html("( " + response.list_waiting[i].time + " )");
                            $("#patient_waiting_" + (i + 1)).removeClass("letter-small");
                            if (response.list_waiting[i].nationality != 'Korea') {
                                $("#patient_waiting_" + (i + 1)).addClass("letter-small");
                            }
                        }
                        else {
                            $("#patient_waiting_" + (i + 1)).html("-");
                            //$("#patient_waiting_time_" + (i + 1)).html("");
                        }
                    }
                    $("#patient_waiting_more").html( response.list_waiting.length );
                    //if (response.list_waiting.length > 5) {
                    //    $("#patient_waiting_more").html("외 " + (response.list_waiting.length - 5) + "명");
                    //} else {
                    //    $("#patient_waiting_more").html("-");
                    //}
                    //under treatement
                    for (var i = 0; i < 5; i++) {
                        if (response.list_under_treatement[i]) {
                            console.log(response.list_under_treatement[i].start_treatement)
                            $("#patient_on_treatement_" + (i + 1)).html(response.list_under_treatement[i].name);
                            $("#patient_on_treatement_time_" + (i + 1)).html("( " + response.list_under_treatement[i].start_treatement + " ~ )");
                            $("#patient_on_treatement_" + (i + 1)).removeClass("letter-small");
                            if (response.list_under_treatement[i].nationality != 'Korea') {
                                $("#patient_on_treatement_" + (i + 1)).addClass("letter-small");
                            }
                        }
                        else {
                            $("#patient_on_treatement_" + (i + 1)).html("-");
                            $("#patient_on_treatement_time_" + (i + 1)).html("");
                        }
                    }
                    $("#patient_on_treatement_more").html(response.list_under_treatement.length );
                    //if (response.list_under_treatement.length > 5) {
                    //    $("#patient_on_treatement_more").html("외 " + (response.list_under_treatement.length - 5) + "명");
                    //} else {
                    //    $("#patient_on_treatement_more").html("-");
                    //}


                    //pay waiting
                    for (var i = 0; i < 5; i++) {
                        if (response.list_waiting_payment[i]) {
                            $("#patient_waiting_pay_" + (i + 1)).html(response.list_waiting_payment[i].name);
                            //$("#patient_waiting_pay_time_" + (i + 1)).html("( " + response.list_waiting_payment[i].time + " )");
                            $("#patient_waiting_pay_" + (i + 1)).removeClass("letter-small");
                            if (response.list_waiting_payment[i].nationality != 'Korea') {
                                $("#patient_waiting_pay_" + (i + 1)).addClass("letter-small");
                            }
                        }
                        else {

                            $("#patient_waiting_pay_" + (i + 1)).html("-");
                            //$("#patient_waiting_pay_time_" + (i + 1)).html("");
                        }
                    }
                    $("#patient_waiting_pay_more").html( response.list_waiting_payment.length );
                    //if (response.list_waiting.length > 5) {
                    //    $("#patient_waiting_pay_more").html("외 " + (response.list_waiting_payment.length - 5) + "명");
                    //} else {
                    //    $("#patient_waiting_pay_more").html("-");
                    //}


                },
                error: function (request, status, error) {
                    console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);
                },
            })


            await sleep(1000 * parseInt(interval_sec));


        }
    }

    

}

function numberPad(n, width) {
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

var week = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

function clock() {
    let today = new Date();

    var year = today.getYear() - 100;
    var month = today.getMonth() + 1;
    var day = today.getDate();
    var hour = today.getHours();
    var min = today.getMinutes();
    var sec = today.getSeconds();

    var day_of_week = week[today.getDay()];



    var str = numberPad(month, 2) + "." + numberPad(day, 2) + " " + day_of_week + " " + numberPad(hour, 2) + ":" + numberPad(min, 2);//+ ":" + numberPad(sec, 2);

    $("#date_clock").html(str);

    if (is_focus) {
        if (text_interval_sec_cnt == text_interval_sec +2 ) {
            info_slide();
            text_interval_sec_cnt = 0;
        }
        text_interval_sec_cnt += 1
    }
    

}

//글자 슬라이드
function info_slide() {

    $('#ticker li:first').stop().animate({ marginTop: '-100px' }, 2000, function () {
        $(this).detach().appendTo('ul#ticker').removeAttr('style');
    });

}


$(window).focus(function () {
    is_focus = true;
});
$(window).blur(function () {
    //is_focus = false;
});
