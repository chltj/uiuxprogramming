
const preOrderForm = document.getElementById('pre-order-form');
const userEmailInput = document.getElementById('user-email');
const submitBtn = document.getElementById('submit-btn');
const formMessage = document.getElementById('form-message');

preOrderForm.addEventListener('submit', function (event) {
 
  event.preventDefault();


  const emailValue = userEmailInput.value.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 


  if (emailValue === '') {
  
    formMessage.textContent = '이메일 주소를 입력해 주세요.';
    formMessage.className = 'message error';
    userEmailInput.focus();
    return;
  }

  if (!emailRegex.test(emailValue)) {

    formMessage.textContent = '올바른 이메일 형식(@ 포함)으로 입력해 주세요.';
    formMessage.className = 'message error';
    userEmailInput.focus();
    return;
  }


  formMessage.textContent = `${emailValue}님, DevBridge 사전 신청이 완료되었습니다! 출시일에 가장 먼저 소식을 보내드릴게요.`;
  formMessage.className = 'message success';


  submitBtn.disabled = true;
  submitBtn.textContent = '신청 완료';
  submitBtn.classList.add('disabled-btn');

  userEmailInput.disabled = true;
});