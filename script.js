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


  // =========================================================
  // 9주차: 팀원 모집 공고 등록 폼
  // =========================================================

  const STORAGE_KEY = 'devbridge-recruits';

  const recruitForm = document.getElementById('recruit-form');
  const recruitSummary = document.getElementById('recruit-summary');
  const recruitSummaryList = document.getElementById('recruit-summary-list');
  const recruitStatus = document.getElementById('recruit-status');
  const btnRecruitSubmit = document.getElementById('btn-recruit-submit');
  const btnRecruitReset = document.getElementById('btn-recruit-reset');
  const recruitResult = document.getElementById('recruit-result');
  const recruitResultTable = document.getElementById('recruit-result-table');
  const btnRecruitNew = document.getElementById('btn-recruit-new');
  const recruitTotal = document.getElementById('recruit-total');
  const recruitEmpty = document.getElementById('recruit-empty');
  const recruitList = document.getElementById('recruit-list');
  const btnRecruitClear = document.getElementById('btn-recruit-clear');

  const offlineArea = document.getElementById('offline-area');
  const deadlineArea = document.getElementById('deadline-area');
  const recruitRegion = document.getElementById('recruit-region');
  const recruitMeeting = document.getElementById('recruit-meeting');
  const recruitUseDeadline = document.getElementById('recruit-use-deadline');
  const recruitDeadline = document.getElementById('recruit-deadline');

  const SUBMIT_LABEL = btnRecruitSubmit.textContent;

  // 오늘 날짜(YYYY-MM-DD)를 마감일 최솟값으로 지정
  function getToday() {
    const now = new Date();
    const offset = now.getTimezoneOffset() * 60000;
    return new Date(now - offset).toISOString().slice(0, 10);
  }
  recruitDeadline.min = getToday();

  // 항목별 검증 규칙: 통과하면 null, 실패하면 수정 방법을 담은 문구 반환
  const recruitFields = {
    title: {
      label: '프로젝트명',
      input: document.getElementById('recruit-title'),
      max: 30,
      validate(value) {
        if (value === '') return '프로젝트명을 입력해 주세요.';
        if (value.length < 5) return `5자 이상 입력해 주세요. (${5 - value.length}자 더 필요)`;
        return null;
      }
    },
    category: {
      label: '프로젝트 분야',
      input: document.getElementById('recruit-category'),
      validate(value) {
        return value === '' ? '프로젝트 분야를 선택해 주세요.' : null;
      }
    },
    positions: {
      label: '모집 포지션',
      input: recruitForm.querySelector('input[name="positions"]'),
      getValue: () => [...recruitForm.querySelectorAll('input[name="positions"]:checked')].map(box => box.value),
      validate(value) {
        return value.length === 0 ? '모집할 포지션을 1개 이상 체크해 주세요.' : null;
      }
    },
    region: {
      label: '모임 지역',
      input: recruitRegion,
      validate(value) {
        if (value === '') return '오프라인 모임 지역을 입력해 주세요.';
        if (value.length < 2) return '지역을 2자 이상 입력해 주세요. 예: 서울 강남역';
        return null;
      }
    },
    meeting: {
      label: '오프라인 모임 주기',
      input: recruitMeeting,
      validate(value) {
        return value === '' ? '오프라인 모임 주기를 선택해 주세요.' : null;
      }
    },
    deadline: {
      label: '모집 마감일',
      input: recruitDeadline,
      validate(value) {
        if (value === '') return '마감일을 선택하거나, 상시 모집이면 [모집 마감일 지정하기] 체크를 해제해 주세요.';
        if (value < getToday()) return '지난 날짜는 선택할 수 없습니다. 오늘 이후 날짜를 골라 주세요.';
        return null;
      }
    },
    intro: {
      label: '프로젝트 소개',
      input: document.getElementById('recruit-intro'),
      max: 300,
      validate(value) {
        if (value === '') return '프로젝트 소개를 입력해 주세요.';
        if (value.length < 30) return `30자 이상 입력해 주세요. (${30 - value.length}자 더 필요) 사용할 기술이나 기대하는 팀원 모습을 덧붙여 보세요.`;
        return null;
      }
    },
    email: {
      label: '팀 리더 연락 이메일',
      input: document.getElementById('recruit-email'),
      validate(value) {
        if (value === '') return '연락받을 이메일 주소를 입력해 주세요.';
        if (!emailRegex.test(value)) return '이메일 형식이 올바르지 않습니다. @와 도메인을 포함해 주세요. 예: leader@example.com';
        return null;
      }
    }
  };

  // 오류 문구를 화면에 드러낼지 여부 (입력 후 포커스를 벗어났거나 제출을 시도한 항목)
  const shownFields = new Set();

  function getFieldValue(name) {
    const field = recruitFields[name];
    return field.getValue ? field.getValue() : field.input.value.trim();
  }

  function isFieldActive(name) {
    return !recruitFields[name].input.disabled;
  }

  // 한 항목의 상태(대기 / 충족 / 오류)를 문구와 색으로 함께 표시
  function renderField(name) {
    const field = recruitFields[name];
    const wrapper = recruitForm.querySelector(`[data-field="${name}"]`);
    const msg = document.getElementById(`recruit-${name}-msg`);
    const value = getFieldValue(name);
    const error = field.validate(value);
    const counter = field.max ? `${value.length} / ${field.max}자 · ` : '';

    wrapper.classList.remove('is-valid', 'is-invalid');

    if (!error) {
      wrapper.classList.add('is-valid');
      msg.textContent = `${counter}✔ 조건 충족`;
    } else if (shownFields.has(name)) {
      wrapper.classList.add('is-invalid');
      msg.textContent = `${counter}✖ ${error}`;
    } else {
      msg.textContent = field.max ? `${counter}${error}` : '';
    }

    if (field.input.tagName !== 'INPUT' || field.input.type !== 'checkbox') {
      field.input.setAttribute('aria-invalid', String(Boolean(error) && shownFields.has(name)));
    }
    return error;
  }

  // 조건부 입력 영역 표시 + disabled 전환
  function updateConditionalAreas() {
    const mode = recruitForm.querySelector('input[name="mode"]:checked').value;
    const showOffline = mode !== '온라인';
    offlineArea.classList.toggle('hidden', !showOffline);
    recruitRegion.disabled = !showOffline;
    recruitMeeting.disabled = !showOffline;

    const showDeadline = recruitUseDeadline.checked;
    deadlineArea.classList.toggle('hidden', !showDeadline);
    recruitDeadline.disabled = !showDeadline;

    // 숨겨진 영역은 오류 표시 대상에서 제외
    if (!showOffline) { shownFields.delete('region'); shownFields.delete('meeting'); }
    if (!showDeadline) shownFields.delete('deadline');
  }

  function updateSummary() {
    if (recruitSummary.classList.contains('hidden')) return;
    const errors = Object.keys(recruitFields).filter(name => isFieldActive(name) && recruitFields[name].validate(getFieldValue(name)));
    if (errors.length === 0) {
      recruitSummary.classList.add('hidden');
      return;
    }
    fillSummary(errors);
  }

  function fillSummary(errorNames) {
    recruitSummaryList.innerHTML = '';
    errorNames.forEach(name => {
      const field = recruitFields[name];
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#' + field.input.id;
      link.textContent = `${field.label}: ${field.validate(getFieldValue(name))}`;
      link.addEventListener('click', event => {
        event.preventDefault();
        field.input.focus();
      });
      item.appendChild(link);
      recruitSummaryList.appendChild(item);
    });
  }

  function setRecruitStatus(message, type) {
    recruitStatus.textContent = message;
    recruitStatus.className = 'submit-status ' + type;
  }

  function setSubmitting(isSubmitting) {
    btnRecruitSubmit.disabled = isSubmitting;
    btnRecruitReset.disabled = isSubmitting;
    btnRecruitSubmit.textContent = isSubmitting ? '등록 중…' : SUBMIT_LABEL;
    recruitForm.setAttribute('aria-busy', String(isSubmitting));
  }

  // 브라우저 저장소 읽기 / 쓰기
  function loadRecruits() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveRecruits(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function describeRecruit(post) {
    const place = post.mode === '온라인' ? '온라인' : `${post.mode} (${post.region}, ${post.meeting})`;
    return {
      '프로젝트명': post.title,
      '분야': post.category,
      '모집 포지션': post.positions.join(', '),
      '진행 방식': place,
      '마감일': post.deadline || '상시 모집',
      '연락 이메일': post.email
    };
  }

  function renderRecruitList() {
    const list = loadRecruits();
    recruitTotal.textContent = `${list.length}개`;
    recruitEmpty.classList.toggle('hidden', list.length > 0);
    btnRecruitClear.classList.toggle('hidden', list.length === 0);
    recruitList.innerHTML = '';

    list.slice().reverse().forEach(post => {
      const info = describeRecruit(post);
      const item = document.createElement('li');
      item.className = 'request-item';

      const box = document.createElement('div');
      box.className = 'request-info';

      const title = document.createElement('p');
      title.className = 'request-item-title';
      title.innerHTML = '<span class="badge">모집 중</span> ';
      title.appendChild(document.createTextNode(post.title));

      const meta = document.createElement('p');
      meta.className = 'request-meta';
      meta.textContent = `${info['분야']} · ${info['모집 포지션']} · ${info['진행 방식']} · 마감 ${info['마감일']}`;

      box.append(title, meta);
      item.appendChild(box);
      recruitList.appendChild(item);
    });
  }

  function resetRecruitForm() {
    recruitForm.reset();
    shownFields.clear();
    updateConditionalAreas();
    Object.keys(recruitFields).forEach(renderField);
    recruitSummary.classList.add('hidden');
    recruitStatus.className = 'submit-status hidden';
    setSubmitting(false);
  }

  // 입력하는 동안 글자 수·조건 충족 여부 갱신
  recruitForm.addEventListener('input', function (event) {
    const name = event.target.name;
    if (recruitFields[name]) renderField(name);
    updateSummary();
  });

  recruitForm.addEventListener('change', function (event) {
    const name = event.target.name;
    if (name === 'mode' || name === 'useDeadline') {
      updateConditionalAreas();
      ['region', 'meeting', 'deadline'].forEach(renderField);
    }
    if (name === 'positions' || name === 'category' || name === 'meeting' || name === 'deadline') {
      shownFields.add(name);
    }
    if (recruitFields[name]) renderField(name);
    updateSummary();
  });

  // 값을 입력하고 벗어난 항목부터 오류를 보여 줌
  recruitForm.addEventListener('focusout', function (event) {
    const name = event.target.name;
    if (!recruitFields[name] || event.target.type === 'checkbox') return;
    if (event.target.value.trim() !== '') {
      shownFields.add(name);
      renderField(name);
    }
  });

  recruitForm.addEventListener('submit', function (event) {
    event.preventDefault();

    // 1) 활성화된 항목만 검사 (숨겨진 disabled 항목은 제외)
    const activeNames = Object.keys(recruitFields).filter(isFieldActive);
    activeNames.forEach(name => shownFields.add(name));
    const errorNames = activeNames.filter(name => renderField(name));

    if (errorNames.length > 0) {
      fillSummary(errorNames);
      recruitSummary.classList.remove('hidden');
      setRecruitStatus(`등록하지 못했습니다. 수정이 필요한 항목 ${errorNames.length}개를 확인해 주세요.`, 'error');
      recruitSummary.focus();
      return;
    }

    recruitSummary.classList.add('hidden');

    // 2) 제출 중: 진행 문구 + 버튼 비활성화로 중복 제출 방지
    setSubmitting(true);
    setRecruitStatus('⏳ 모집 공고를 등록하는 중입니다. 잠시만 기다려 주세요…', 'pending');

    const post = {
      title: getFieldValue('title'),
      category: getFieldValue('category'),
      positions: getFieldValue('positions'),
      mode: recruitForm.querySelector('input[name="mode"]:checked').value,
      region: isFieldActive('region') ? getFieldValue('region') : '',
      meeting: isFieldActive('meeting') ? getFieldValue('meeting') : '',
      deadline: isFieldActive('deadline') ? getFieldValue('deadline') : '',
      intro: getFieldValue('intro'),
      email: getFieldValue('email'),
      createdAt: new Date().toISOString()
    };

    setTimeout(function () {
      const list = loadRecruits();

      // 3) 실패: 같은 이름의 공고가 이미 있으면 등록 거부 (입력값은 그대로 유지)
      const duplicated = list.some(item => item.title.toLowerCase() === post.title.toLowerCase());
      if (duplicated) {
        setSubmitting(false);
        setRecruitStatus(`❌ 등록 실패: ‘${post.title}’ 이름의 공고가 이미 있습니다. 입력한 내용은 그대로 남아 있으니 프로젝트명만 바꿔 다시 등록해 주세요.`, 'error');
        const titleWrapper = recruitForm.querySelector('[data-field="title"]');
        titleWrapper.classList.remove('is-valid');
        titleWrapper.classList.add('is-invalid');
        document.getElementById('recruit-title-msg').textContent = `${post.title.length} / 30자 · ✖ 이미 등록된 프로젝트명입니다. 다른 이름으로 바꿔 주세요.`;
        recruitFields.title.input.focus();
        return;
      }

      // 4) 실패: 브라우저 저장소에 저장할 수 없는 경우
      try {
        list.push(post);
        saveRecruits(list);
      } catch (e) {
        setSubmitting(false);
        setRecruitStatus('❌ 등록 실패: 브라우저 저장 공간에 저장하지 못했습니다. 입력 내용은 그대로 남아 있으니 잠시 후 다시 [모집 공고 등록하기]를 눌러 주세요.', 'error');
        return;
      }

      // 5) 성공: 완료 안내 + 등록 내용 요약
      const info = describeRecruit(post);
      recruitResultTable.innerHTML = '';
      Object.keys(info).forEach(label => {
        const row = document.createElement('div');
        row.className = 'summary-row';
        const key = document.createElement('span');
        key.className = 'summary-label';
        key.textContent = label;
        const val = document.createElement('span');
        val.className = 'summary-value';
        val.textContent = info[label];
        row.append(key, val);
        recruitResultTable.appendChild(row);
      });

      recruitForm.classList.add('hidden');
      recruitResult.classList.remove('hidden');
      renderRecruitList();
      recruitResult.focus();
    }, 1200);
  });

  btnRecruitReset.addEventListener('click', function () {
    resetRecruitForm();
    recruitFields.title.input.focus();
  });

  btnRecruitNew.addEventListener('click', function () {
    resetRecruitForm();
    recruitResult.classList.add('hidden');
    recruitForm.classList.remove('hidden');
    recruitFields.title.input.focus();
  });

  btnRecruitClear.addEventListener('click', function () {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* 저장소 접근 불가 시 무시 */ }
    renderRecruitList();
  });

  // 초기 상태
  resetRecruitForm();
  renderRecruitList();
});