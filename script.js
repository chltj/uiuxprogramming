// 1. 필요한 HTML 요소 선택
const preOrderForm = document.getElementById('pre-order-form');
const userEmailInput = document.getElementById('user-email');
const submitBtn = document.getElementById('submit-btn');
const formMessage = document.getElementById('form-message');

// 2. 이벤트 리스너 등록 (폼 제출 시 함수 실행)
preOrderForm.addEventListener('submit', function (event) {
  // 기본 폼 제출 동작(새로고침) 방지
  event.preventDefault();

  // 3. 변수 선언 및 입력값 처리
  const emailValue = userEmailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 간단한 이메일 형식 정규표현식

  // 4. 조건문을 활용한 입력값 검증 및 분기 처리
  if (emailValue === '') {
    // 빈 값인 경우
    formMessage.textContent = '이메일 주소를 입력해 주세요.';
    formMessage.className = 'message error';
    userEmailInput.focus();
    return;
  }

  if (!emailRegex.test(emailValue)) {
    // 이메일 형식이 유효하지 않은 경우
    formMessage.textContent = '올바른 이메일 형식(@ 포함)으로 입력해 주세요.';
    formMessage.className = 'message error';
    userEmailInput.focus();
    return;
  }

  // 5. 성공 시 사용자 피드백 및 상태 변경
  // 안내 문구 및 스타일 변경
  formMessage.textContent = `${emailValue}님, DevBridge 사전 신청이 완료되었습니다! 출시일에 가장 먼저 소식을 보내드릴게요.`;
  formMessage.className = 'message success';

  // 버튼 상태 및 텍스트 변경 (중복 제출 방지)
  submitBtn.disabled = true;
  submitBtn.textContent = '신청 완료';
  submitBtn.classList.add('disabled-btn');

  // 입력창 비활성화
  userEmailInput.disabled = true;
});