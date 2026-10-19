document.addEventListener('DOMContentLoaded', function () {
  // ==========================================
  // 1. 탭 UI 기능 구현 (click 이벤트)
  // ==========================================
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      // 모든 탭 버튼 비활성화 및 클릭된 탭 활성화 (스타일 변경)
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      // 모든 콘텐츠 숨기기 및 선택된 탭 콘텐츠 표시 (문구/콘텐츠 변경)
      const targetTabId = button.getAttribute('data-tab');
      tabPanes.forEach(pane => {
        if (pane.id === targetTabId) {
          pane.classList.add('active');
        } else {
          pane.classList.remove('active');
        }
      });
    });
  });

  // ==========================================
  // 2. 포지션 선택 상자 처리 (change 이벤트)
  // ==========================================
  const positionSelect = document.getElementById('user-position');
  const positionFeedback = document.getElementById('position-feedback');

  positionSelect.addEventListener('change', function () {
    const selectedValue = positionSelect.value;
    const selectedText = positionSelect.options[positionSelect.selectedIndex].text;

    if (selectedValue === '') {
      // 선택 해제 시 문구 및 스타일 초기화
      positionFeedback.textContent = '포지션을 선택하면 우선 매칭 그룹이 지정됩니다.';
      positionFeedback.classList.remove('selected');
    } else {
      // 선택 시 문구 변경 및 배경/글자 스타일 변경 (복합 피드백)
      positionFeedback.textContent = `[우선 매칭 그룹 등록] ${selectedText} 분야의 프로젝트 오픈 시 1순위로 알림을 드립니다.`;
      positionFeedback.classList.add('selected');
    }
  });

  // ==========================================
  // 3. 실시간 이메일 검증 처리 (input 이벤트)
  // ==========================================
  const userEmailInput = document.getElementById('user-email');
  const submitBtn = document.getElementById('submit-btn');
  const formMessage = document.getElementById('form-message');
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  userEmailInput.addEventListener('input', function () {
    const emailVal = userEmailInput.value.trim();

    if (emailVal === '') {
      // 1) 빈 값: 메시지 숨김, 인풋 테두리 초기화, 버튼 비활성화
      formMessage.style.display = 'none';
      userEmailInput.classList.remove('is-valid', 'is-invalid');
      submitBtn.disabled = true;
    } else if (!emailRegex.test(emailVal)) {
      // 2) 유효하지 않은 형식: 에러 문구 표시, 빨간 테두리 스타일, 버튼 비활성화
      formMessage.textContent = '올바른 이메일 형식(@ 및 도메인 포함)을 입력해 주세요.';
      formMessage.className = 'message error';
      userEmailInput.classList.remove('is-valid');
      userEmailInput.classList.add('is-invalid');
      submitBtn.disabled = true;
    } else {
      // 3) 유효한 형식: 정상 안내 문구 표시, 초록 테두리 스타일, 버튼 활성화 (복합 피드백 동시 충족)
      formMessage.textContent = '사용 가능한 이메일 형식입니다. 신청 버튼을 눌러주세요.';
      formMessage.className = 'message success';
      userEmailInput.classList.remove('is-invalid');
      userEmailInput.classList.add('is-valid');
      submitBtn.disabled = false; // 버튼 상태 변경
    }
  });

  // ==========================================
  // 4. 폼 최종 제출 처리 (click / submit 이벤트)
  // ==========================================
  const preOrderForm = document.getElementById('pre-order-form');

  preOrderForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const emailVal = userEmailInput.value.trim();
    const positionText = positionSelect.value ? positionSelect.options[positionSelect.selectedIndex].text : '일반 개발자';

    // 최종 완료 피드백: 문구 변경 + 버튼 상태 비활성화 + 텍스트 변경
    formMessage.textContent = `🎉 [${positionText}] ${emailVal}님, 사전 등록이 성공적으로 완료되었습니다!`;
    formMessage.className = 'message success';

    submitBtn.textContent = '신청 완료';
    submitBtn.disabled = true;
    userEmailInput.disabled = true;
    positionSelect.disabled = true;
  });
});