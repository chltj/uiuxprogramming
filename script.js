document.addEventListener('DOMContentLoaded', function () {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabPanes = document.querySelectorAll('.tab-pane');

  tabButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      tabButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');

      const targetTabId = button.getAttribute('data-tab');
      tabPanes.forEach(pane => {
        pane.classList.toggle('active', pane.id === targetTabId);
      });
    });
  });


  // 1. 상태(State) 데이터 모델
  const flowState = {
    currentStep: 1,
    position: '',
    category: '',
    name: '',
    email: ''
  };

  // DOM 요소 선택
  const stepIndicators = document.querySelectorAll('.step-indicator');
  const wizardSteps = document.querySelectorAll('.wizard-step');

  // Step 1 요소
  const flowPosition = document.getElementById('flow-position');
  const flowCategory = document.getElementById('flow-category');
  const errorStep1 = document.getElementById('error-step-1');
  const btnToStep2 = document.getElementById('btn-to-step2');

  // Step 2 요소
  const flowName = document.getElementById('flow-name');
  const flowEmail = document.getElementById('flow-email');
  const errorStep2 = document.getElementById('error-step-2');
  const btnBackToStep1 = document.getElementById('btn-back-to-step1');
  const btnToStep3 = document.getElementById('btn-to-step3');

  // Step 3 요소 (확인)
  const summaryPosition = document.getElementById('summary-position');
  const summaryCategory = document.getElementById('summary-category');
  const summaryName = document.getElementById('summary-name');
  const summaryEmail = document.getElementById('summary-email');
  const btnBackToStep2 = document.getElementById('btn-back-to-step2');
  const btnSubmitMatching = document.getElementById('btn-submit-matching');

  // Step 4 요소 (완료 및 재시작)
  const completeName = document.getElementById('complete-name');
  const completeEmail = document.getElementById('complete-email');
  const receiptId = document.getElementById('receipt-id');
  const btnRestartFlow = document.getElementById('btn-restart-flow');

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // 단계 이동 및 화면 갱신 함수
  function goToStep(targetStep) {
    flowState.currentStep = targetStep;

    // 단계별 섹션 노출 토글
    wizardSteps.forEach((step, idx) => {
      step.classList.toggle('active', idx + 1 === targetStep);
    });

    // 상단 인디케이터 상태 갱신
    stepIndicators.forEach((indicator, idx) => {
      const stepNum = idx + 1;
      indicator.classList.remove('active', 'completed');
      if (stepNum === targetStep) {
        indicator.classList.add('active');
      } else if (stepNum < targetStep) {
        indicator.classList.add('completed');
      }
    });

    // 3단계(확인)에 진입 시 저장된 상태값을 확인 테이블에 주입
    if (targetStep === 3) {
      summaryPosition.textContent = flowState.position;
      summaryCategory.textContent = flowState.category;
      summaryName.textContent = flowState.name;
      summaryEmail.textContent = flowState.email;
    }

    // 모바일 등에서 단계 전환 시 폼 상단으로 부드럽게 스크롤
    document.getElementById('matching-flow').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

 
  btnToStep2.addEventListener('click', function () {
    const selectedPosition = flowPosition.value;
    const selectedCategory = flowCategory.value;

    // 조건 검증: 필수 선택 누락 여부 확인
    if (!selectedPosition || !selectedCategory) {
      errorStep1.textContent = '⚠️ 희망 포지션과 관심 프로젝트 분야를 모두 선택해 주세요.';
      errorStep1.classList.add('show');
      return;
    }

    // 통과 시 상태 저장 및 에러 초기화
    errorStep1.classList.remove('show');
    flowState.position = selectedPosition;
    flowState.category = selectedCategory;

    // 2단계로 진행
    goToStep(2);
  });

 
  btnBackToStep1.addEventListener('click', function () {
    // 이전으로 돌아가도 Step 2에 입력한 텍스트 임시 저장
    flowState.name = flowName.value.trim();
    flowState.email = flowEmail.value.trim();
    errorStep2.classList.remove('show');

    // 1단계 셀렉트 박스에 기존 상태 유지 확인
    flowPosition.value = flowState.position;
    flowCategory.value = flowState.category;

    goToStep(1);
  });

--
  btnToStep3.addEventListener('click', function () {
    const inputName = flowName.value.trim();
    const inputEmail = flowEmail.value.trim();


    if (inputName === '') {
      errorStep2.textContent = '⚠️ 신청자 이름을 입력해 주세요.';
      errorStep2.classList.add('show');
      flowName.focus();
      return;
    }

    
    if (!emailRegex.test(inputEmail)) {
      errorStep2.textContent = '⚠️ 올바른 이메일 형식(예: dev@example.com)을 입력해 주세요.';
      errorStep2.classList.add('show');
      flowEmail.focus();
      return;
    }

    errorStep2.classList.remove('show');
    flowState.name = inputName;
    flowState.email = inputEmail;

    goToStep(3);
  });

  btnBackToStep2.addEventListener('click', function () {
    // 2단계 인풋창에 기존 저장된 값 복원 유지
    flowName.value = flowState.name;
    flowEmail.value = flowState.email;
    goToStep(2);
  });


  btnSubmitMatching.addEventListener('click', function () {
    // 랜덤 접수 번호 생성 (DB-2026-XXXX)
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const generatedReceipt = `DB-2026-${randomCode}`;

    // 완료 화면에 신청자 정보 바인딩
    completeName.textContent = flowState.name;
    completeEmail.textContent = flowState.email;
    receiptId.textContent = generatedReceipt;

    goToStep(4);
  });


  btnRestartFlow.addEventListener('click', function () {
    // 1. 상태 모델 초기화
    flowState.currentStep = 1;
    flowState.position = '';
    flowState.category = '';
    flowState.name = '';
    flowState.email = '';

    
    flowPosition.value = '';
    flowCategory.value = '';
    flowName.value = '';
    flowEmail.value = '';

   
    errorStep1.classList.remove('show');
    errorStep2.classList.remove('show');

  
    goToStep(1);
  });
});