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
    email: '',
    submitted: false
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

    // 신청 완료 → 추천 프로젝트 영역 잠금 해제
    flowState.submitted = true;
    unlockRecommend();

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

    // 추천 프로젝트 / 참여 요청 상태도 함께 초기화
    flowState.submitted = false;
    resetRecommend();


    goToStep(1);
  });


  // =========================================================
  // 중간고사 신규 기능: 추천 프로젝트 탐색 및 참여 요청
  // =========================================================

  // 모집 중인 프로젝트 데이터
  const projects = [
    { id: 1, title: '개발자 포트폴리오 SaaS 대시보드', category: '웹 플랫폼 / SaaS', positions: ['프론트엔드 엔지니어', '백엔드 엔지니어'], stack: ['React', 'TypeScript', 'Spring Boot'], slots: 2 },
    { id: 2, title: '사이드 프로젝트 일정 관리 웹앱', category: '웹 플랫폼 / SaaS', positions: ['풀스택 엔지니어'], stack: ['Next.js', 'Node.js', 'PostgreSQL'], slots: 1 },
    { id: 3, title: '동네 러닝 크루 모임 앱', category: '모바일 커뮤니티', positions: ['프론트엔드 엔지니어', '백엔드 엔지니어'], stack: ['React Native', 'Firebase'], slots: 0 },
    { id: 4, title: '대학생 스터디 매칭 커뮤니티', category: '모바일 커뮤니티', positions: ['백엔드 엔지니어', '풀스택 엔지니어'], stack: ['Flutter', 'Spring Boot', 'MySQL'], slots: 2 },
    { id: 5, title: 'LLM 기반 코드 리뷰 챗봇', category: '인공지능 도구 개발', positions: ['AI / ML 엔지니어', '백엔드 엔지니어'], stack: ['Python', 'FastAPI', 'LangChain'], slots: 2 },
    { id: 6, title: '회의록 자동 요약 도구', category: '인공지능 도구 개발', positions: ['AI / ML 엔지니어', '프론트엔드 엔지니어'], stack: ['PyTorch', 'React'], slots: 1 },
    { id: 7, title: '핸드메이드 마켓 쇼핑몰', category: '이커머스 / 결제', positions: ['프론트엔드 엔지니어', '풀스택 엔지니어'], stack: ['Vue.js', 'Node.js', 'Toss Payments'], slots: 1 },
    { id: 8, title: '중고 개발 장비 거래 플랫폼', category: '이커머스 / 결제', positions: ['백엔드 엔지니어'], stack: ['Java', 'Spring Boot', 'Redis'], slots: 2 }
  ];

  const MAX_REQUESTS = 3;
  const MIN_MESSAGE = 20;

  // 추천 / 요청 상태 모델
  const recommendState = {
    keyword: '',
    onlyCategory: true,
    onlyPosition: false,
    selectedProjectId: null,
    requests: [] // { projectId, title, hours, message, confirming }
  };

  // DOM 요소 선택
  const recommendSection = document.getElementById('recommend');
  const recommendLocked = document.getElementById('recommend-locked');
  const recommendContent = document.getElementById('recommend-content');
  const btnGoFlow = document.getElementById('btn-go-flow');
  const btnGoRecommend = document.getElementById('btn-go-recommend');

  const recName = document.getElementById('rec-name');
  const recPosition = document.getElementById('rec-position');
  const recCategory = document.getElementById('rec-category');

  const recKeyword = document.getElementById('rec-keyword');
  const recOnlyCategory = document.getElementById('rec-only-category');
  const recOnlyPosition = document.getElementById('rec-only-position');
  const recCount = document.getElementById('rec-count');
  const recList = document.getElementById('rec-list');
  const recEmpty = document.getElementById('rec-empty');
  const btnClearKeyword = document.getElementById('btn-clear-keyword');
  const btnShowAll = document.getElementById('btn-show-all');

  const requestPanel = document.getElementById('request-panel');
  const requestProject = document.getElementById('request-project');
  const requestPosition = document.getElementById('request-position');
  const requestHours = document.getElementById('request-hours');
  const requestMessage = document.getElementById('request-message');
  const requestCounter = document.getElementById('request-counter');
  const errorRequest = document.getElementById('error-request');
  const btnCancelRequest = document.getElementById('btn-cancel-request');
  const btnSendRequest = document.getElementById('btn-send-request');

  const recNotice = document.getElementById('rec-notice');
  const requestTotal = document.getElementById('request-total');
  const requestEmpty = document.getElementById('request-empty');
  const requestList = document.getElementById('request-list');

  // 처리 결과 알림 표시 (success / info / error)
  function showNotice(message, type) {
    recNotice.textContent = message;
    recNotice.className = 'rec-notice ' + type;
  }

  function hideNotice() {
    recNotice.className = 'rec-notice hidden';
  }

  function findRequest(projectId) {
    return recommendState.requests.find(req => req.projectId === projectId);
  }

  // 검색어·필터 조건에 맞는 프로젝트만 걸러내기
  function getFilteredProjects() {
    const keyword = recommendState.keyword.toLowerCase();

    return projects.filter(project => {
      if (recommendState.onlyCategory && project.category !== flowState.category) return false;
      if (recommendState.onlyPosition && !project.positions.includes(flowState.position)) return false;
      if (keyword === '') return true;

      const target = (project.title + ' ' + project.stack.join(' ')).toLowerCase();
      return target.includes(keyword);
    });
  }

  // 카드 버튼 상태 결정: 요청 완료 > 모집 마감 > 포지션 불일치 > 요청 가능
  function getCardAction(project) {
    if (findRequest(project.id)) return { label: '요청 완료 (응답 대기)', disabled: true, state: 'requested' };
    if (project.slots === 0) return { label: '모집 마감', disabled: true, state: 'closed' };
    if (!project.positions.includes(flowState.position)) return { label: '내 포지션 모집 없음', disabled: true, state: 'mismatch' };
    return { label: '참여 요청하기', disabled: false, state: 'open' };
  }

  function renderProjects() {
    const filtered = getFilteredProjects();
    recList.innerHTML = '';

    if (filtered.length === 0) {
      recCount.textContent = '검색 결과 0개';
      recEmpty.classList.remove('hidden');
      return;
    }

    recEmpty.classList.add('hidden');
    recCount.textContent = `조건에 맞는 프로젝트 ${filtered.length}개`;

    filtered.forEach(project => {
      const action = getCardAction(project);
      const card = document.createElement('article');
      card.className = 'rec-card ' + action.state;
      if (project.id === recommendState.selectedProjectId) card.classList.add('selected');

      const positionTags = project.positions.map(pos => {
        const mine = pos === flowState.position ? ' mine' : '';
        return `<span class="tag${mine}">${pos}</span>`;
      }).join('');

      card.innerHTML = `
        <p class="rec-category">${project.category}</p>
        <h4>${project.title}</h4>
        <p class="rec-stack"><strong>기술:</strong> ${project.stack.join(', ')}</p>
        <div class="rec-tags">${positionTags}</div>
        <p class="rec-slots">${project.slots > 0 ? `남은 자리 ${project.slots}명` : '모집 인원 마감'}</p>
      `;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn ' + (action.disabled ? 'secondary-btn' : 'primary-btn');
      button.textContent = action.label;
      button.disabled = action.disabled;
      button.addEventListener('click', () => openRequestPanel(project));
      card.appendChild(button);

      recList.appendChild(card);
    });
  }

  function renderRequests() {
    const requests = recommendState.requests;
    requestTotal.textContent = `${requests.length} / ${MAX_REQUESTS}`;
    requestTotal.classList.toggle('full', requests.length >= MAX_REQUESTS);
    requestEmpty.classList.toggle('hidden', requests.length > 0);
    requestList.innerHTML = '';

    requests.forEach(req => {
      const item = document.createElement('li');
      item.className = 'request-item';

      const info = document.createElement('div');
      info.className = 'request-info';

      const title = document.createElement('p');
      title.className = 'request-item-title';
      title.innerHTML = '<span class="badge">응답 대기</span> ';
      title.appendChild(document.createTextNode(req.title));

      const meta = document.createElement('p');
      meta.className = 'request-meta';
      meta.textContent = `${flowState.position} · ${req.hours}`;

      const message = document.createElement('p');
      message.className = 'request-message';
      message.textContent = `“${req.message}”`;

      info.append(title, meta, message);

      const actions = document.createElement('div');
      actions.className = 'request-actions';

      if (req.confirming) {
        // 취소 전 한 번 더 확인
        const ask = document.createElement('span');
        ask.className = 'confirm-text';
        ask.textContent = '정말 요청을 취소할까요?';

        const btnYes = document.createElement('button');
        btnYes.type = 'button';
        btnYes.className = 'btn danger-btn';
        btnYes.textContent = '네, 취소합니다';
        btnYes.addEventListener('click', () => cancelRequest(req.projectId));

        const btnNo = document.createElement('button');
        btnNo.type = 'button';
        btnNo.className = 'btn secondary-btn';
        btnNo.textContent = '요청 유지';
        btnNo.addEventListener('click', () => {
          req.confirming = false;
          renderRequests();
        });

        actions.append(ask, btnYes, btnNo);
      } else {
        const btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.className = 'btn secondary-btn';
        btnCancel.textContent = '요청 취소';
        btnCancel.addEventListener('click', () => {
          req.confirming = true;
          renderRequests();
        });
        actions.appendChild(btnCancel);
      }

      item.append(info, actions);
      requestList.appendChild(item);
    });
  }

  function updateCounter() {
    const length = requestMessage.value.trim().length;
    requestCounter.textContent = `${length} / 200자 (최소 ${MIN_MESSAGE}자)`;
    requestCounter.classList.toggle('ok', length >= MIN_MESSAGE);
  }

  function openRequestPanel(project) {
    // 조건: 동시에 보낼 수 있는 요청은 최대 3개
    if (recommendState.requests.length >= MAX_REQUESTS) {
      showNotice(`⚠️ 참여 요청은 동시에 ${MAX_REQUESTS}개까지 보낼 수 있습니다. 아래 목록에서 기존 요청을 취소한 뒤 다시 시도해 주세요.`, 'error');
      recNotice.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    hideNotice();
    recommendState.selectedProjectId = project.id;

    // 새 요청서는 빈 상태로 시작
    requestProject.textContent = project.title;
    requestPosition.textContent = flowState.position;
    requestHours.value = '';
    requestMessage.value = '';
    errorRequest.classList.remove('show');
    updateCounter();

    requestPanel.classList.remove('hidden');
    renderProjects();
    requestPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    requestHours.focus({ preventScroll: true });
  }

  function closeRequestPanel() {
    recommendState.selectedProjectId = null;
    requestPanel.classList.add('hidden');
    errorRequest.classList.remove('show');
    renderProjects();
  }

  function cancelRequest(projectId) {
    const target = findRequest(projectId);
    recommendState.requests = recommendState.requests.filter(req => req.projectId !== projectId);
    showNotice(`‘${target.title}’ 참여 요청을 취소했습니다. 다른 프로젝트에 다시 요청할 수 있어요.`, 'info');
    renderRequests();
    renderProjects();
  }

  function unlockRecommend() {
    recName.textContent = flowState.name;
    recPosition.textContent = flowState.position;
    recCategory.textContent = flowState.category;

    recommendLocked.classList.add('hidden');
    recommendContent.classList.remove('hidden');
    renderProjects();
    renderRequests();
  }

  function resetRecommend() {
    recommendState.keyword = '';
    recommendState.onlyCategory = true;
    recommendState.onlyPosition = false;
    recommendState.selectedProjectId = null;
    recommendState.requests = [];

    recKeyword.value = '';
    recOnlyCategory.checked = true;
    recOnlyPosition.checked = false;
    requestHours.value = '';
    requestMessage.value = '';
    requestPanel.classList.add('hidden');
    errorRequest.classList.remove('show');
    hideNotice();

    recommendContent.classList.add('hidden');
    recommendLocked.classList.remove('hidden');
  }

  // 완료 화면 → 추천 프로젝트로 이동
  btnGoRecommend.addEventListener('click', function () {
    recommendSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // 잠금 상태 → 매칭 신청으로 이동
  btnGoFlow.addEventListener('click', function () {
    document.getElementById('matching-flow').scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // 검색어 입력 시 실시간 필터링
  recKeyword.addEventListener('input', function () {
    recommendState.keyword = recKeyword.value.trim();
    renderProjects();
  });

  recOnlyCategory.addEventListener('change', function () {
    recommendState.onlyCategory = recOnlyCategory.checked;
    renderProjects();
  });

  recOnlyPosition.addEventListener('change', function () {
    recommendState.onlyPosition = recOnlyPosition.checked;
    renderProjects();
  });

  // 결과 없음 → 다음 행동
  btnClearKeyword.addEventListener('click', function () {
    recommendState.keyword = '';
    recKeyword.value = '';
    renderProjects();
    recKeyword.focus();
  });

  btnShowAll.addEventListener('click', function () {
    recommendState.keyword = '';
    recommendState.onlyCategory = false;
    recommendState.onlyPosition = false;
    recKeyword.value = '';
    recOnlyCategory.checked = false;
    recOnlyPosition.checked = false;
    renderProjects();
  });

  requestMessage.addEventListener('input', updateCounter);

  btnCancelRequest.addEventListener('click', function () {
    closeRequestPanel();
    showNotice('요청서 작성을 취소했습니다. 목록에서 다른 프로젝트를 골라 보세요.', 'info');
  });

  btnSendRequest.addEventListener('click', function () {
    const hours = requestHours.value;
    const message = requestMessage.value.trim();

    if (!hours) {
      errorRequest.textContent = '⚠️ 주당 참여 가능 시간을 선택해 주세요.';
      errorRequest.classList.add('show');
      requestHours.focus();
      return;
    }

    if (message.length < MIN_MESSAGE) {
      errorRequest.textContent = `⚠️ 자기소개를 ${MIN_MESSAGE}자 이상 적어 주세요. (현재 ${message.length}자, ${MIN_MESSAGE - message.length}자 더 필요) 사용해 본 기술이나 참여하고 싶은 이유를 적으면 좋아요.`;
      errorRequest.classList.add('show');
      requestMessage.focus();
      return;
    }

    const project = projects.find(p => p.id === recommendState.selectedProjectId);
    recommendState.requests.push({
      projectId: project.id,
      title: project.title,
      hours: hours,
      message: message,
      confirming: false
    });

    closeRequestPanel();
    renderRequests();
    showNotice(`✅ ‘${project.title}’ 팀에 참여 요청을 보냈습니다. 팀 리더가 수락하면 ${flowState.email} 주소로 알려 드립니다.`, 'success');
    recNotice.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});