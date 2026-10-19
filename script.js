// 1. 필요한 HTML 요소 선택
const preOrderForm = document.getElementById('pre-order-form');
const userEmailInput = document.getElementById('user-email');
const submitBtn = document.getElementById('submit-btn');
const formMessage = document.getElementById('form-message');

// 2. 폼 제출(버튼 클릭/엔터) 시 실행될 함수 연결
preOrderForm.addEventListener('submit', function (event) {
  // 기본 동작(새로고침) 방지
  event.preventDefault();

  // 변수 선언 및 입력값 가져오기
  const emailValue = userEmailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 형식 정규표현식

  // 조건문 분기 처리
  if (emailValue === '') {
    // [조건 1] 빈 값 입력 시
    formMessage.textContent = '이메일 주소를 입력해 주세요.';
    formMessage.className = 'message error'; // 스타일 변경 (빨간색)
    userEmailInput.focus();
    return;
  }

  if (!emailRegex.test(emailValue)) {
    // [조건 2] 이메일 형식이 잘못된 경우
    formMessage.textContent = '올바른 이메일 형식(@ 포함)으로 입력해 주세요.';
    formMessage.className = 'message error'; // 스타일 변경 (빨간색)
    userEmailInput.focus();
    return;
  }

  // [조건 3] 정상 입력 성공 시
  // 1) 맞춤 안내 문구 표시
  formMessage.textContent = `${emailValue}님, DevBridge 사전 알림 신청이 완료되었습니다!`;
  
  // 2) 문구 스타일 변경 (초록색)
  formMessage.className = 'message success';

  // 3) 버튼 상태 변경 (비활성화 및 문구 변경)
  submitBtn.disabled = true;
  submitBtn.textContent = '신청 완료';
  submitBtn.classList.add('disabled-btn');

  // 입력창 비활성화
  userEmailInput.disabled = true;
});