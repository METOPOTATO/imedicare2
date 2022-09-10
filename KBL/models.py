from django.db import models

# Create your models here.

class Customer_Company(models.Model):
    #고객 번호
    serial = models.CharField(
        max_length = 8,
        default='',
        )

    #구분 - 회사 / 개인
    type = models.CharField(
        max_length = 8,
        default='',
        )

    #한글 이름
    name_kor = models.CharField(
        max_length = 32,
        default='',
        )

    #영문 이름
    name_eng= models.CharField(
        max_length = 32,
        default='',
        )

    #베트남어 이름
    name_vie = models.CharField(
        max_length = 32,
        default='',
        )

    #대표자 이름
    ceo_name = models.CharField(
        max_length = 16,
        default='',
        )



    #업종
    business_type = models.CharField(
        max_length = 32,
        default='',
        )

    #법인번호
    corporation_no = models.CharField(
        max_length = 32,
        default='',
        )

    #직원 수 
    count_employee = models.CharField(
        max_length = 6,
        default='0',
        )

    #전화번호1
    phone1 = models.CharField(
        max_length = 16,
        default='',
        )

    #전화번호2 
    phone2 = models.CharField(
        max_length = 16,
        default='',
        )

    #팩스
    fax = models.CharField(
        max_length = 32,
        default='',
        )

    #주소1
    add1 = models.CharField(
        max_length = 128,
        default='',
        )
    #주소2
    add2 = models.CharField(
        max_length = 128,
        default='',
        )

    #memo
    memo = models.CharField(
        max_length = 256,
        default='',
        )

    #설립일
    date_establishment= models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #memo
    condition = models.CharField(
        max_length = 8,
        default='',
        )

    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )


class Customer_Employee(models.Model):
    #등록 회사 - 논리 FK
    company_id = models.CharField(
        max_length = 8,
        default='',
        )

    #구분 - 국내 / 외국인
    type = models.CharField(
        max_length = 8,
        default='',
        )
    #직급
    position = models.CharField(
        max_length = 16,
        default='',
        )
    #베트남 이름
    name_vie = models.CharField(
        max_length = 32,
        default='',
        )
    #한글 이름
    name_kor = models.CharField(
        max_length = 32,
        default='',
        )

    #영문 이름
    name_eng= models.CharField(
        max_length = 32,
        default='',
        )

    #생년월일
    date_of_birth = models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #여권번호
    passport_no = models.CharField(
        max_length = 16,
        default=''
        )

    #여권 만료 기간
    passport_expiration_date = models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #비자 기간
    visa_expiration_date = models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #거주증 기간
    residence_expiration_date = models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #주민번호 ,시민번호
    Identity_no = models.CharField(
        max_length = 32,
        default=''
        )
    #전화번호
    phone = models.CharField(
        max_length = 16,
        default='',
        )

    #주소
    add1 = models.CharField(
        max_length = 128,
        default='',
        )

    #이메일
    email = models.CharField(
        max_length = 64,
        default='',
        )

    #memo
    memo = models.TextField(
        default='',
        )

    #상태
    status = models.CharField(
        max_length = 16,
        default='',
        )
    
    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )


class Estimate_Sheet(models.Model):

    #구분
    classification = models.CharField(
        max_length = 16,
        default='',
        )

    #수신
    recipient = models.CharField(
        max_length = 16,
        default='',
        )

    #이메일
    email = models.CharField(
        max_length = 128,
        default='',
        )


    #제목
    title = models.CharField(
        max_length = 32,
        default='',
        )

    #비고
    remark = models.CharField(
        max_length = 256,
        default='',
        )

    #금액 구분
    paid_by = models.CharField(
        max_length = 8,
        default='',
        )

    #담당자
    in_charge = models.CharField(
        max_length = 8,
        default='',
        )

    #보내는 메일
    in_charge_email = models.CharField(
        max_length = 128,
        default='',
        )

    #부가세 여부
    is_VAT = models.CharField(
        max_length = 1,
        default='N',
        )


    #Status
    status = models.CharField(
        max_length = 16,
        default='',
        )

    #견적 날짜
    date= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #발송일
    date_sent = models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #발송 여부
    is_sent = models.CharField(
        max_length = 2,
        default='N',
        )

    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )


class Estimate_Sheet_Detail(models.Model):


    #상위 아이템 - 논리FK
    estimate_id = models.CharField(
        max_length = 16,
        default='',
        )

    #구분
    type = models.CharField(
        max_length = 16,
        default='',
        )

    #내용
    content = models.TextField(
        default='',
        )

    #단가
    unit_price= models.CharField(
        max_length = 16,
        default='',
        )

    #수량
    quantity = models.CharField(
        max_length = 32,
        default='',
        )

    #비용
    cost = models.CharField(
        max_length = 16,
        default='',
        )

    #단위
    unit = models.CharField(
        max_length = 50,
        default='',
        )

    #비고
    note = models.CharField(
        max_length = 256,
        default='',
        )

    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    
class Project_Manage(models.Model):


    #고객 이름
    customer_name = models.CharField(
        max_length = 64,
        default='',
        )

    #회사 이름  - 회사 FK
    customer_id= models.CharField(
        max_length = 8,
        default='',
        )

    #구분
    type= models.CharField(
        max_length = 32,
        default='',
        )

    #프로젝트 이름
    project_name= models.CharField(
        max_length = 64,
        default='',
        )

    #중요도
    level = models.CharField(
        max_length = 4,
        default='',
        )

    #우선순위
    priority = models.CharField(
        max_length = 4,
        default='',
        )

    #시작일
    start_date =models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #종료일
    end_date =models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #예정일
    expected_date =models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #진행상태
    progress = models.CharField(
        max_length = 16,
        default='',
        )

    #담당자1
    in_charge1 = models.CharField(
        max_length = 32,
        default='',
        )
    #담당자2
    in_charge2 = models.CharField(
        max_length = 32,
        default='',
        )
    #담당자3
    in_charge3 = models.CharField(
        max_length = 32,
        default='',
        )
    #담당자4
    in_charge4 = models.CharField(
        max_length = 32,
        default='',
        )

    #결재 승인 상태
    approval = models.CharField(
        max_length = 16,
        default='',
        )
    
    #비고
    note = models.CharField(
        max_length = 256,
        default='',
        )



    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )


class Project_Manage_Detail(models.Model):

    #프로젝트 정보 - FK 물리
    project = models.ForeignKey(
        to = Project_Manage,
        on_delete = models.DO_NOTHING,
        )

    #구분
    type = models.CharField(
        max_length = 64,
        default='',
        )

    #프로젝트 진행 상태
    project_details = models.CharField(
        max_length = 256,
        default='',
        )

    #비고
    note = models.CharField(
        max_length = 256,
        default='',
        )

    #날짜
    date = models.CharField(
        max_length = 10,
        default='0000-00-00',
        )

    #비고
    check = models.CharField(
        max_length = 2,
        default='0',
        )

    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )


class Work_Permit_Manage(models.Model):
    #프로젝트 정보 - FK 물리
    project = models.ForeignKey(
        to = Project_Manage,
        on_delete = models.DO_NOTHING,
        )

    #회사 정보 - FK 논리
    company_id = models.CharField(
        max_length = 8,
        default='',
        )

    #회사 이름
    company_name = models.CharField(
        max_length = 64,
        default='',
        )

    #직원 정보 - FK 논리
    employee_id = models.CharField(
        max_length = 8,
        default='',
        )

    #직원 이름
    employee_name = models.CharField(
        max_length = 64,
        default='',
        )

    #채용수요승인서 신청일
    EA_application_date =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )
    #채용수요승인서 결과 예정일
    EA_exp_date =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )
    #노동허가서 접수일
    WP_application_date =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )
    #노동허가서 결과 예정일
    WP_exp_date =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #결과 예정일
    expected_date =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #필요 서류
    requiredment = models.CharField(
        max_length = 256,
        default='',
        )
    
    
    #비고
    note = models.CharField(
        max_length = 256,
        default='',
        )

    #진행상태
    status = models.CharField(
        max_length = 16,
        default='',
        )




    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )


class Visa_Manage(models.Model):

    #프로젝트 정보 - FK 물리
    project = models.ForeignKey(
        to = Project_Manage,
        on_delete = models.DO_NOTHING,
        )


    #회사 정보 - FK 논리
    company_id = models.CharField(
        max_length = 8,
        default='',
        )

    #회사 이름
    company_name = models.CharField(
        max_length = 64,
        default='',
        )

    #직원 정보 - FK 논리
    employee_id = models.CharField(
        max_length = 8,
        default='',
        )

    #직원 이름
    employee_name = models.CharField(
        max_length = 32,
        default='',
        )

    #보증 회사
    granted_company = models.CharField(
        max_length = 64,
        default='',
        )

    #비자 구분
    type= models.CharField(
        max_length = 16,
        default='',
        )

    #서비스 구분
    service_type= models.CharField(
        max_length = 16,
        default='',
        )


    #입국일
    date_entry =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )
    
    #신청서 수령일
    date_receipt_application =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #서류 수령일
    date_receipt_doc =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #서류 접수일
    date_subbmit_doc =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )


    #결과 예정일
    date_expected =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #주문일
    date_ordered =models.CharField(
        max_length = 10,
        default='0000-00-00'
        )


    #신청서 수령여부
    application_status = models.CharField(
        max_length = 20,
        default='',
        )

    #긴급여부
    emergency = models.CharField(
        max_length = 20,
        default='',
        )

    #상태
    status = models.CharField(
        max_length = 20,
        default='',
        )
    

    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )


class Audit_Manage(models.Model):


    
    #회사 정보 - FK 논리
    company_id = models.CharField(
        max_length = 8,
        default='',
        )

    #회사 이름
    company_name = models.CharField(
        max_length = 64,
        default='',
        )

    #서비스 구분
    type = models.CharField(
        max_length = 16,
        default='',
        )

    #서비스 제목
    title = models.CharField(
        max_length = 64,
        default='',
        )

    #갯수
    quantity = models.CharField(
        max_length = 4,
        default='',
        )

    #서비스 fee
    service_fee = models.CharField(
        max_length = 20,
        default='',
        )

    #서비스 fee 부가세
    service_fee_vat = models.CharField(
        max_length = 20,
        default='',
        )

    #서비스 fee Total
    service_fee_total = models.CharField(
        max_length = 20,
        default='',
        )

    #지불 금액
    paid = models.CharField(
        max_length = 20,
        default='',
        )
    #지불 날짜
    date_paid =  models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #담당자
    in_charge = models.CharField(
        max_length = 32,
        default=''
        )

    #확인 / 담당 / 사용자 아이디 논리 FK
    user_id_in_charge  = models.CharField(
        max_length = 8,
        default='',
        )

    #확인 담당자
    check_in_charge = models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #확인 / 팀장 / 사용자 아이디 논리 FK
    user_id_leader = models.CharField(
        max_length = 8,
        default='',
        )

    #확인 팀장
    check_leader= models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #확인 / 담당 / 사용자 아이디 논리 FK
    user_id_account= models.CharField(
        max_length = 8,
        default='',
        )

    #확인 회계
    check_account= models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #확인 / 담당 / 사용자 아이디 논리 FK
    user_id_ceo= models.CharField(
        max_length = 8,
        default='',
        )

    #확인 대표
    check_ceo= models.CharField(
        max_length = 10,
        default='0000-00-00'
        )

    #상태
    status = models.CharField(
        max_length = 20,
        default='',
        )
   
    #인보이스 여부 ?? 
    invoice = models.CharField(
        max_length = 8,
        default='',
        )

    #메모
    note = models.CharField(
        max_length = 256,
        default='',
        )

    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )


class Invoice_Manage(models.Model):

    #전표번호
    serial = models.CharField(
        max_length = 10,
        default='',
        )


    #회사 정보 - FK 논리
    company_id = models.CharField(
        max_length = 8,
        default='',
        )

    #회사 이름
    company_name = models.CharField(
        max_length = 64,
        default='',
        )


    #서비스 구분
    type = models.CharField(
        max_length = 64,
        default=''
        )

    #서비스 이름
    title = models.CharField(
        max_length = 64,
        default=''
        )

    #수신자
    recipient = models.CharField(
        max_length = 64,
        default=''
        )

    #계좌 번호 
    selected_acc = models.CharField(
        max_length = 256,
        default='',
        )

    #담당자
    in_charge = models.CharField(
        max_length = 32,
        default=''
        )


    #발송 날짜 시간
    date_sent= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #발송 여부
    is_sent = models.CharField(
        max_length = 2,
        default='N',
        )

    #상태
    status = models.CharField(
        max_length = 20,
        default='NOT',
        )


    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default='Y',
        )

    #등록자 - 논리 FK
    registrant = models.CharField(
        max_length = 4,
        default='',
        )

    #등록 날짜 시간
    date_register= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #마지막 수정자 - 논리 FK
    modifier = models.CharField(
        max_length = 4,
        default='',
        )

    #마지막 수정 날짜 시간
    date_modify= models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )


class Project_Comment(models.Model):
    #게시글 번호 - 논리 FK
    content_id = models.CharField(
        max_length = 8,
        default='',
        )

    #type
    content_type = models.CharField(
        max_length = 16,
        default='',
        )

    #첫 글과, 그 글의 답글들에게 같은 groupno을 주어서 보여주기 위함
    groupno = models.IntegerField(
        default=0
        )

    #같은 groupno의 게시글들을 최신순으로 위로 올리기 위함
    orderno = models.IntegerField(
        default=0
        )

    #답글들을 한 칸씩 밀려서 보이게 하기 위함
    depth = models.IntegerField(
        default=0
        )
 
    #담당자 설정
    in_charge = models.CharField(
        max_length = 8,
        default = '',
        )

    #시작일
    start_date =models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #종료일
    end_date =models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #종료 예정일
    expected_date =models.CharField(
        max_length = 20,
        default='0000-00-00 00:00:00'
        )

    #진행상태
    progress = models.CharField(
        max_length = 16,
        default='',
        )


    #내용 - 
    comment = models.TextField()

    #사용 유무
    use_yn = models.CharField(
        max_length = 2,
        default = 'Y',
        )

    #작성자 - 논리 FK = user_id
    creator = models.CharField(
        max_length = 8,
        default = '',
        )
    #최초 작성 일자
    created_date = models.DateTimeField(
        auto_now_add=True,
        blank=True,
        )

    #마지막 수정 자 - 논리 FK = user_id
    lastest_modifier = models.CharField(
        max_length = 8,
        default = '',
        )
    #마지막 수정 일
    lastest_modified_date = models.DateTimeField(
        auto_now_add=True,
        blank=True,
        )