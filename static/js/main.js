
$(function () {
    // F12 버튼 방지
    $(document).ready(function () {
        $(document).bind('keydown', function (e) {
            if (e.keyCode == 123 /* F12 */) {
                e.preventDefault();
                e.returnValue = false;
            }
        });
    });

    // 우측 클릭 방지
    //document.onmousedown = disableclick;
    //status = gettext("Right click is not available.");
    //
    //function disableclick(event) {
    //    if (event.button == 2) {
    //        alert(status);
    //        return false;
    //    }
    //}


    $("#alert_mini").click(function () {
        $("#alert_wrap").show();
        $("#alert_mini").hide();
    })
    $("#close_menu").click(function () {
        $("#alert_wrap").hide();
        $("#alert_mini").show();
    })



    //페이지 리프레시 마다 알람 가져오기
    get_new_alert();
});


function get_new_alert() {

    $.ajax({
        type: 'POST',
        url: '/manage/get_alert/',
        data: {
            'csrfmiddlewaretoken': $('#csrf').val(),

        },
        dataType: 'Json',
        success: function (response) {
            console.log(response)
            //alert
            if (response.cowork_count + response.draft_count + response.project_count + response.vaccine_reserv_count) {
                $("#alarm_nores_wrap").hide();
                ////Cowork
                if (response.cowork_count == 0) {
                    $("#alarm_cowork_wrap").hide();
                } else {
                    $("#alarm_cowork_wrap").show();
                    (!response.cowork_point) ? $("#co_work_pointed_week").hide() : $("#co_work_pointed_week").html("<span> - " + gettext('Comment(s) that pointed me out for a week') + " : " + response.cowork_point + "</span>");
                    (!response.cowork_expected) ? $("#co_work_expected_week").hide() : $("#co_work_expected_week").html("<span> - " + gettext('Post(s) scheduled to be completed in less than a week') + " : " + response.cowork_expected + "</span>");

                    $("#badge_board_coboard").html(response.cowork_point + response.cowork_expected);
                    $("#badge_board_coboard").show();
                }

                //Draft
                
                if (response.draft_count == 0) {
                    $("#alarm_draft_wrap").hide();
                } else {
                    $("#alarm_draft_wrap").show();
                    (!response.draft_requested) ? $("#draft_requested").hide() : $("#draft_requested").html("<span> - " + gettext('Draft(s) that are requested') + " : " + response.draft_requested + "</span>");
                    (!response.draft_waiting) ? $("#draft_waiting").hide() : $("#draft_waiting").html("<span> - " + gettext('Draft(s) that are waiting') + " : " + response.draft_waiting + "</span>");
                    (!response.draft_pending) ? $("#draft_pending").hide() : $("#draft_pending").html("<span> - " + gettext('Draft(s) that are pending') + " : " + response.draft_pending + "</span>");

                    $("#badge_draft").html(response.draft_requested + response.draft_waiting + response.draft_pending  );
                    $("#badge_draft").show();
                }

                //Project
                if (response.project_count == 0) {
                    $("#alarm_project_wrap").hide();
                
                } else {
                    $("#alarm_project_wrap").show();
                    (!response.project_main) ? $("#project_main").hide() : $("#project_main").html("<span> - " + gettext('Draft(s) that are waiting') + " : " + response.project_main + "</span>");
                    (!response.project_comment) ? $("#project_comment").hide() : $("#project_comment").html("<span> - " + gettext('Draft(s) that are waiting') + " : " + response.project_comment + "</span>")

                    $("#badge_project_mgt").html(response.project_main + response.project_comment);
                    $("#badge_project_mgt").show();
                }

                //Vaccine
                if (response.vaccine_reserv_count == 0) {
                    $("#alarm_vaccine_warp").hide();

                } else {
                    $("#alarm_vaccine_warp").show();
                    (!response.vaccine_reserv_count) ? $("#reservation_pointed_week").hide() : $("#reservation_pointed_week").html("<span> - " + gettext('Number of Patients(s) who are reserved within a week') + " : " + response.vaccine_reserv_count + "</span>");

                }
            }
            else {
                $("#content_menu > div").hide();
                $("#alarm_nores_wrap").show();
            }
        },
        error: function (request, status, error) {
            console.log("code:" + request.status + "\n" + "message:" + request.responseText + "\n" + "error:" + error);

        },
    })
}



function printClock() {
    var clock = document.getElementById("clock");            // 출력할 장소 선택
    var currentDate = new Date();                                     // 현재시간
    var calendar = currentDate.getFullYear() + "-" + (currentDate.getMonth() + 1) + "-" + currentDate.getDate() // 현재 날짜
    var amPm = 'AM'; // 초기값 AM
    var currentHours = addZeros(currentDate.getHours(), 2);
    var currentMinute = addZeros(currentDate.getMinutes(), 2);
    var currentSeconds = addZeros(currentDate.getSeconds(), 2);

    if (currentHours >= 12) { // 시간이 12보다 클 때 PM으로 세팅, 12를 빼줌
        amPm = 'PM';
        currentHours = addZeros(currentHours - 12, 2);
    }

    if (currentSeconds >= 50) {// 50초 이상일 때 색을 변환해 준다.
        currentSeconds = '<span style="color:#de1951;font-size:20px; height:50px ;">' + currentSeconds + '</span>'
    }
    clock.innerHTML = currentHours + ":" + currentMinute + ":" + currentSeconds + " <span style='font-size:20px; height:50px; '>" + amPm + "</span>"; //날짜를 출력해 줌

    setTimeout("printClock()", 1000);         // 1초마다 printClock() 함수 호출
}

function addZeros(num, digit) { // 자릿수 맞춰주기
    var zero = '';
    num = num.toString();
    if (num.length < digit) {
        for (i = 0; i < digit - num.length; i++) {
            zero += '0';
        }
    }
    return zero + num;
}

