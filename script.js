document.addEventListener('DOMContentLoaded', function () {
  // =========================================================
  // 12주차: 재사용 UI 컴포넌트 (탭 / 아코디언 / 모달)
  //  - HTML에 정해진 클래스·data 속성만 붙이면 같은 함수로 동작
  // =========================================================

  // 방향키 이동 공통 처리: 목록에서 다음 위치 계산 (탭·아코디언이 함께 사용)
  function getRovingIndex(key, index, length) {
    const map = { ArrowRight: index + 1, ArrowDown: index + 1, ArrowLeft: index - 1, ArrowUp: index - 1, Home: 0, End: length - 1 };
    if (!(key in map)) return -1;
    return (map[key] + length) % length;
  }

  // ----- 컴포넌트 1: 탭 -----
  // [role=tablist][data-tabs] 안의 [role=tab] 버튼과 aria-controls로 연결된 패널을 묶어 동작
  function initTabs(tablist) {
    const tabs = Array.from(tablist.querySelectorAll('[role="tab"]'));
    const panels = tabs.map(tab => document.getElementById(tab.getAttribute('aria-controls')));

    function select(tab) {
      tabs.forEach((t, i) => {
        const selected = t === tab;
        t.classList.toggle('active', selected);            // 스타일로 현재 탭 표시
        t.setAttribute('aria-selected', String(selected)); // 스크린리더에 선택 상태 전달
        t.tabIndex = selected ? 0 : -1;                    // 선택된 탭만 Tab 순서에 포함
        panels[i].classList.toggle('active', selected);
      });
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => select(tab));
      // ← → Home End 키로 탭 이동 (↑ ↓는 페이지 스크롤에 남겨 둠)
      tab.addEventListener('keydown', event => {
        if (event.key === 'ArrowUp' || event.key === 'ArrowDown') return;
        const next = getRovingIndex(event.key, index, tabs.length);
        if (next < 0) return;
        event.preventDefault();
        select(tabs[next]);
        tabs[next].focus();
      });
    });
  }

  // ----- 컴포넌트 2: 아코디언 -----
  // [data-accordion] 안의 .accordion-trigger 버튼이 aria-controls로 연결된 패널을 열고 닫음
  // data-accordion="single"이면 하나를 열 때 나머지는 자동으로 닫힘
  function setAccordionItem(trigger, open) {
    const panel = document.getElementById(trigger.getAttribute('aria-controls'));
    trigger.setAttribute('aria-expanded', String(open));
    trigger.closest('.accordion-item').classList.toggle('is-open', open);
    panel.hidden = !open;
    const state = trigger.querySelector('.accordion-state');
    if (state) state.textContent = open ? '접기' : '펼치기';  // 색이 아닌 문구로도 상태 표시
  }

  function initAccordion(root) {
    const triggers = Array.from(root.querySelectorAll('.accordion-trigger'));
    const single = root.dataset.accordion === 'single';

    triggers.forEach((trigger, index) => {
      trigger.addEventListener('click', () => {
        const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
        if (single && willOpen) triggers.forEach(t => { if (t !== trigger) setAccordionItem(t, false); });
        setAccordionItem(trigger, willOpen);
      });
      // ↑ ↓ Home End 키로 질문 사이 이동 (Enter·Space는 버튼 기본 동작으로 열고 닫음)
      trigger.addEventListener('keydown', event => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') return;
        const next = getRovingIndex(event.key, index, triggers.length);
        if (next < 0) return;
        event.preventDefault();
        triggers[next].focus();
      });
    });
  }

  // ----- 컴포넌트 3: 모달 -----
  // .modal 구조 하나로 여러 창을 사용. 열면 배경 비활성(inert) + 창 안에 초점 가두기,
  // Esc·닫기 버튼·배경 클릭으로 닫고, 닫으면 창을 연 버튼으로 초점을 되돌림
  const modalState = { current: null, trigger: null };
  const pageRegions = document.querySelectorAll('body > header, body > main, body > footer, body > .skip-link');
  const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function getFocusable(modal) {
    return Array.from(modal.querySelectorAll(FOCUSABLE)).filter(el => el.getClientRects().length);
  }

  function openModal(modal, trigger) {
    if (modalState.current) closeModal(null);
    modalState.current = modal;
    modalState.trigger = trigger || document.activeElement;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    pageRegions.forEach(region => { region.inert = true; });
    if (trigger && trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'true');
    // 위험한 동작이 있는 창은 [data-modal-initial](취소)에, 나머지는 첫 번째 버튼에 초점
    const first = modal.querySelector('[data-modal-initial]') || getFocusable(modal)[0];
    if (first) first.focus();
  }

  // returnFocus: 닫은 뒤 초점을 보낼 곳 (생략하면 창을 연 버튼, null이면 이동 안 함)
  function closeModal(returnFocus) {
    const modal = modalState.current;
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    pageRegions.forEach(region => { region.inert = false; });
    const trigger = modalState.trigger;
    if (trigger && trigger.hasAttribute('aria-expanded')) trigger.setAttribute('aria-expanded', 'false');
    modalState.current = null;
    modalState.trigger = null;
    const target = returnFocus === undefined ? trigger : returnFocus;
    if (target && document.contains(target)) target.focus();
  }

  // 공통 이벤트 처리: data-modal-close가 붙은 요소(✕, 닫기, 배경)는 모두 같은 방식으로 닫음
  document.addEventListener('click', event => {
    if (modalState.current && event.target.closest('[data-modal-close]')) closeModal();
  });

  document.addEventListener('keydown', event => {
    const modal = modalState.current;
    if (!modal) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeModal();
    } else if (event.key === 'Tab') {
      // 초점 가두기: 마지막 요소에서 Tab → 첫 요소, 첫 요소에서 Shift+Tab → 마지막 요소
      const items = getFocusable(modal);
      const first = items[0];
      const last = items[items.length - 1];
      if (!modal.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  // 요약 표(라벨-값 행) 그리기: 등록 결과 화면과 공고 상세 모달에서 함께 사용
  function renderSummaryRows(container, info) {
    container.innerHTML = '';
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
      container.appendChild(row);
    });
  }

  // 페이지 안의 모든 탭·아코디언을 같은 함수로 초기화
  document.querySelectorAll('[data-tabs]').forEach(initTabs);
  document.querySelectorAll('[data-accordion]').forEach(initAccordion);


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

    // 상단 인디케이터 상태 갱신: 색 + 기호(✓) + 문구(완료 / 현재 단계)
    stepIndicators.forEach((indicator, idx) => {
      const stepNum = idx + 1;
      const num = indicator.querySelector('.step-num');
      const state = indicator.querySelector('.step-state');
      indicator.classList.remove('active', 'completed');
      indicator.removeAttribute('aria-current');
      num.textContent = stepNum;
      state.textContent = '';

      if (stepNum === targetStep) {
        indicator.classList.add('active');
        indicator.setAttribute('aria-current', 'step');
        state.textContent = ' (현재 단계)';
      } else if (stepNum < targetStep) {
        indicator.classList.add('completed');
        num.textContent = '✓';
        state.textContent = ' (완료)';
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

    // 11주차: 누른 버튼이 사라져도 키보드 초점이 페이지 맨 위로 튀지 않도록 새 단계 제목으로 이동
    const heading = wizardSteps[targetStep - 1].querySelector('h3');
    if (heading) heading.focus({ preventScroll: true });
  }

  // 11주차: 오류가 있는 입력칸을 aria-invalid로 표시
  function markInvalid(fields, invalidFields) {
    fields.forEach(field => field.setAttribute('aria-invalid', String(invalidFields.includes(field))));
  }


  btnToStep2.addEventListener('click', function () {
    const selectedPosition = flowPosition.value;
    const selectedCategory = flowCategory.value;

    // 조건 검증: 빠진 항목을 구체적으로 안내하고 첫 번째 빈 칸으로 초점 이동
    const missing = [];
    if (!selectedPosition) missing.push(flowPosition);
    if (!selectedCategory) missing.push(flowCategory);

    if (missing.length > 0) {
      const names = missing.map(field => field === flowPosition ? '희망 포지션' : '관심 프로젝트 분야');
      errorStep1.textContent = `⚠️ 선택하지 않은 항목이 있습니다: ${names.join(", ")}. 목록을 열어 하나씩 골라 주세요.`;
      errorStep1.classList.add('show');
      markInvalid([flowPosition, flowCategory], missing);
      missing[0].focus();
      return;
    }

    // 통과 시 상태 저장 및 에러 초기화
    errorStep1.classList.remove('show');
    markInvalid([flowPosition, flowCategory], []);
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
      errorStep2.textContent = '⚠️ 신청자 이름이 비어 있습니다. 이름이나 닉네임을 입력해 주세요. (예: 김개발)';
      errorStep2.classList.add('show');
      markInvalid([flowName, flowEmail], [flowName]);
      flowName.focus();
      return;
    }


    if (!emailRegex.test(inputEmail)) {
      errorStep2.textContent = inputEmail === ''
        ? '⚠️ 이메일 주소가 비어 있습니다. 매칭 안내를 받을 이메일을 입력해 주세요. (예: dev@example.com)'
        : '⚠️ 이메일 형식이 올바르지 않습니다. @와 도메인(.com 등)을 포함해 주세요. (예: dev@example.com)';
      errorStep2.classList.add('show');
      markInvalid([flowName, flowEmail], [flowEmail]);
      flowEmail.focus();
      return;
    }

    errorStep2.classList.remove('show');
    markInvalid([flowName, flowEmail], []);
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
        <h3>${project.title}</h3>
        <p class="rec-stack"><strong>기술:</strong> ${project.stack.join(', ')}</p>
        <div class="rec-tags">${positionTags}</div>
        <p class="rec-slots">${project.slots > 0 ? `남은 자리 ${project.slots}명` : '모집 인원 마감'}</p>
      `;

      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'btn ' + (action.disabled ? 'secondary-btn' : 'primary-btn');
      button.textContent = action.label;
      // 같은 이름의 버튼이 여러 개라 스크린리더에서는 프로젝트명까지 읽도록 함
      button.setAttribute('aria-label', `‘${project.title}’ ${action.label}`);
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
        btnYes.setAttribute('aria-label', `네, 취소합니다 (‘${req.title}’ 참여 요청)`);
        btnYes.addEventListener('click', () => cancelRequest(req.projectId));

        const btnNo = document.createElement('button');
        btnNo.type = 'button';
        btnNo.className = 'btn secondary-btn';
        btnNo.textContent = '요청 유지';
        btnNo.setAttribute('aria-label', `요청 유지 (‘${req.title}’)`);
        btnNo.addEventListener('click', () => {
          req.confirming = false;
          renderRequests();
          focusRequestButton(req.projectId);
        });

        actions.append(ask, btnYes, btnNo);
      } else {
        const btnCancel = document.createElement('button');
        btnCancel.type = 'button';
        btnCancel.className = 'btn secondary-btn';
        btnCancel.textContent = '요청 취소';
        btnCancel.setAttribute('aria-label', `요청 취소 (‘${req.title}’)`);
        btnCancel.addEventListener('click', () => {
          req.confirming = true;
          renderRequests();
          focusRequestButton(req.projectId);
        });
        actions.appendChild(btnCancel);
      }

      item.dataset.projectId = req.projectId;

      item.append(info, actions);
      requestList.appendChild(item);
    });
  }

  // 11주차: 목록을 다시 그린 뒤 같은 요청 항목의 첫 버튼으로 초점 복귀
  function focusRequestButton(projectId) {
    const item = requestList.querySelector(`[data-project-id="${projectId}"]`);
    const button = item && item.querySelector('button');
    if (button) button.focus();
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
      recNotice.focus({ preventScroll: true });
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
    recNotice.focus();
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
    recNotice.focus();
  });

  btnSendRequest.addEventListener('click', function () {
    const hours = requestHours.value;
    const message = requestMessage.value.trim();

    if (!hours) {
      errorRequest.textContent = '⚠️ 주당 참여 가능 시간을 선택하지 않았습니다. 목록에서 참여할 수 있는 시간을 골라 주세요.';
      errorRequest.classList.add('show');
      requestHours.setAttribute('aria-invalid', 'true');
      requestHours.focus();
      return;
    }
    requestHours.setAttribute('aria-invalid', 'false');

    if (message.length < MIN_MESSAGE) {
      errorRequest.textContent = `⚠️ 자기소개를 ${MIN_MESSAGE}자 이상 적어 주세요. (현재 ${message.length}자, ${MIN_MESSAGE - message.length}자 더 필요) 사용해 본 기술이나 참여하고 싶은 이유를 적으면 좋아요.`;
      errorRequest.classList.add('show');
      requestMessage.setAttribute('aria-invalid', 'true');
      requestMessage.focus();
      return;
    }
    requestMessage.setAttribute('aria-invalid', 'false');

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
    recNotice.focus({ preventScroll: true });
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

  // 10주차: 진행 방식 필터 상태
  const filterButtons = document.querySelectorAll('.filter-btn');
  const recruitResultCount = document.getElementById('recruit-result-count');
  const recruitFilterEmpty = document.getElementById('recruit-filter-empty');
  const recruitFilterEmptyText = document.getElementById('recruit-filter-empty-text');
  let recruitFilter = '전체';

  function setRecruitFilter(filter) {
    recruitFilter = filter;
    // 선택 표시(색)와 aria-pressed를 함께 갱신
    filterButtons.forEach(btn => {
      const selected = btn.dataset.filter === filter;
      btn.classList.toggle('active', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    renderRecruitList();
  }

  function renderRecruitList() {
    const list = loadRecruits();
    const filtered = recruitFilter === '전체' ? list : list.filter(post => post.mode === recruitFilter);

    recruitTotal.textContent = `${list.length}개`;
    btnRecruitClear.classList.toggle('hidden', list.length === 0);

    // 필터 버튼마다 해당 공고 수 표시
    filterButtons.forEach(btn => {
      const filter = btn.dataset.filter;
      const count = filter === '전체' ? list.length : list.filter(post => post.mode === filter).length;
      btn.querySelector('.filter-count').textContent = count;
    });

    // 결과 수 안내 + 빈 결과 두 가지 구분
    recruitEmpty.classList.add('hidden');
    recruitFilterEmpty.classList.add('hidden');

    if (list.length === 0) {
      recruitResultCount.textContent = '등록된 공고 0개';
      recruitEmpty.classList.remove('hidden');
    } else if (filtered.length === 0) {
      recruitResultCount.textContent = `전체 ${list.length}개 중 ‘${recruitFilter}’ 공고 0개`;
      recruitFilterEmptyText.textContent = `‘${recruitFilter}’ 방식으로 등록된 공고가 없습니다.`;
      recruitFilterEmpty.classList.remove('hidden');
    } else if (recruitFilter === '전체') {
      recruitResultCount.textContent = `전체 공고 ${list.length}개를 표시하고 있습니다.`;
    } else {
      recruitResultCount.textContent = `전체 ${list.length}개 중 ‘${recruitFilter}’ 공고 ${filtered.length}개를 표시하고 있습니다.`;
    }

    recruitList.innerHTML = '';

    filtered.slice().reverse().forEach(post => {
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

      // 12주차: 공고 상세 보기 모달 열기 버튼 (버튼 이름에 공고명 포함)
      const actions = document.createElement('div');
      actions.className = 'request-actions';
      const detailBtn = document.createElement('button');
      detailBtn.type = 'button';
      detailBtn.className = 'btn secondary-btn small-btn';
      detailBtn.textContent = '상세 보기';
      detailBtn.setAttribute('aria-label', `‘${post.title}’ 상세 보기`);
      detailBtn.setAttribute('aria-haspopup', 'dialog');
      detailBtn.setAttribute('aria-expanded', 'false');
      detailBtn.addEventListener('click', () => openRecruitDetail(post, detailBtn));
      actions.appendChild(detailBtn);

      item.append(box, actions);
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
      renderSummaryRows(recruitResultTable, info);

      recruitForm.classList.add('hidden');
      recruitResult.classList.remove('hidden');
      // 방금 등록한 공고가 목록에서 보이도록 필터를 '전체'로 되돌림
      setRecruitFilter('전체');
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

  // 12주차: 모달 1 - 공고 상세 보기
  const modalRecruit = document.getElementById('modal-recruit');
  const modalClear = document.getElementById('modal-clear');

  function openRecruitDetail(post, trigger) {
    const info = describeRecruit(post);
    document.getElementById('modal-recruit-title').textContent = post.title;
    document.getElementById('modal-recruit-mode').textContent = `${post.mode} 진행 · 마감 ${info['마감일']}`;
    delete info['프로젝트명'];
    renderSummaryRows(document.getElementById('modal-recruit-table'), info);
    document.getElementById('modal-recruit-intro').textContent = post.intro || '등록된 소개가 없습니다.';
    const apply = document.getElementById('modal-recruit-apply');
    apply.href = `mailto:${post.email}?subject=${encodeURIComponent(`[DevBridge] ‘${post.title}’ 참여 지원`)}`;
    apply.setAttribute('aria-label', `‘${post.title}’ 팀 리더에게 이메일로 지원하기`);
    openModal(modalRecruit, trigger);
  }

  // 12주차: 모달 2 - 모두 삭제 전 확인 (누르자마자 삭제되던 동작을 확인 창으로 개선)
  btnRecruitClear.addEventListener('click', function () {
    document.getElementById('modal-clear-count').textContent = `${loadRecruits().length}개`;
    openModal(modalClear, btnRecruitClear);
  });

  document.getElementById('btn-clear-confirm').addEventListener('click', function () {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) { /* 저장소 접근 불가 시 무시 */ }
    renderRecruitList();
    recruitResultCount.textContent = '저장된 모집 공고를 모두 삭제했습니다. 등록된 공고 0개';
    // 삭제 버튼이 사라지므로 목록 제목으로 초점 이동
    closeModal(document.getElementById('recruit-list-title'));
  });

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => setRecruitFilter(btn.dataset.filter));
  });

  // 조건 결과 없음 → 전체 보기
  document.getElementById('btn-recruit-filter-all').addEventListener('click', function () {
    setRecruitFilter('전체');
  });

  // 전체 목록 없음 → 공고 작성하러 가기
  document.getElementById('btn-recruit-write').addEventListener('click', function () {
    if (!recruitResult.classList.contains('hidden')) btnRecruitNew.click();
    recruitForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
    recruitFields.title.input.focus({ preventScroll: true });
  });

  // 전체 목록 없음 → 예시 공고 불러오기
  document.getElementById('btn-recruit-sample').addEventListener('click', function () {
    const samples = [
      { title: '개발자 커뮤니티 Q&A 웹 서비스', category: '웹 플랫폼 / SaaS', positions: ['프론트엔드 엔지니어', '백엔드 엔지니어'], mode: '온라인', region: '', meeting: '', deadline: '', intro: 'React와 Spring Boot로 개발자 질문·답변 커뮤니티를 만듭니다. 매주 온라인 회의로 진행합니다.', email: 'leader1@example.com' },
      { title: '캠퍼스 중고거래 모바일 앱', category: '모바일 커뮤니티', positions: ['풀스택 엔지니어'], mode: '오프라인', region: '서울 신촌역', meeting: '주 1회', deadline: '', intro: 'Flutter와 Firebase로 대학가 중고거래 앱을 만듭니다. 신촌에서 주 1회 모여 작업합니다.', email: 'leader2@example.com' },
      { title: 'AI 면접 연습 도우미', category: '인공지능 도구 개발', positions: ['AI / ML 엔지니어', '프론트엔드 엔지니어'], mode: '온라인', region: '', meeting: '', deadline: '', intro: 'LLM API로 개발자 기술 면접 질문을 만들고 답변을 피드백하는 도구를 개발합니다.', email: 'leader3@example.com' }
    ].map(post => ({ ...post, createdAt: new Date().toISOString() }));

    try {
      saveRecruits(samples);
    } catch (e) {
      recruitResultCount.textContent = '브라우저 저장 공간을 사용할 수 없어 예시 공고를 불러오지 못했습니다.';
      return;
    }
    setRecruitFilter('전체');
  });

  // 초기 상태
  resetRecruitForm();
  renderRecruitList();


  // =========================================================
  // 10주차: 주요 메뉴 현재 위치 표시 + 모바일 메뉴
  // =========================================================

  const siteHeader = document.getElementById('site-header');
  const menuToggle = document.getElementById('menu-toggle');
  const menuToggleText = menuToggle.querySelector('.menu-toggle-text');
  const menuIcon = menuToggle.querySelector('.menu-icon');
  const mainNav = document.querySelector('.main-nav');
  const menuLinks = document.querySelectorAll('.main-menu a');
  const mobileQuery = window.matchMedia('(max-width: 768px)');

  // 페이지 순서대로 [섹션, 해당 메뉴] 짝 만들기
  const sectionMenuPairs = [];
  menuLinks.forEach(link => {
    link.dataset.sections.split(' ').forEach(id => {
      const section = document.getElementById(id);
      if (section) sectionMenuPairs.push({ section, link });
    });
  });
  sectionMenuPairs.sort((a, b) => a.section.offsetTop - b.section.offsetTop);

  function setCurrentMenu(currentLink) {
    menuLinks.forEach(link => {
      const isCurrent = link === currentLink;
      link.classList.toggle('current', isCurrent);
      if (isCurrent) {
        link.setAttribute('aria-current', 'location');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  // 실제 화면 위치를 기준으로 현재 메뉴 계산
  function updateCurrentFromScroll() {
    const offset = siteHeader.offsetHeight + 40;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let current = sectionMenuPairs[0];

    if (atBottom) {
      current = sectionMenuPairs[sectionMenuPairs.length - 1];
    } else {
      sectionMenuPairs.forEach(pair => {
        if (pair.section.getBoundingClientRect().top <= offset) current = pair;
      });
    }
    setCurrentMenu(current.link);
  }

  // 메뉴 클릭 직후 부드러운 스크롤 동안 표시가 깜박이지 않도록 잠시 고정
  let lockUntil = 0;

  window.addEventListener('scroll', function () {
    if (Date.now() >= lockUntil) updateCurrentFromScroll();
  }, { passive: true });

  // 스크롤이 끝나면 고정을 풀고 실제 위치로 다시 맞춤
  window.addEventListener('scrollend', function () {
    lockUntil = 0;
    updateCurrentFromScroll();
  });

  // 뒤로 가기·앞으로 가기로 위치가 바뀐 경우
  window.addEventListener('hashchange', function () {
    setTimeout(updateCurrentFromScroll, 50);
  });
  window.addEventListener('popstate', function () {
    setTimeout(updateCurrentFromScroll, 50);
  });

  // 헤더 높이를 CSS 변수로 전달해 이동한 섹션 제목이 헤더에 가리지 않게 함
  function syncHeaderHeight() {
    document.documentElement.style.setProperty('--header-h', siteHeader.offsetHeight + 'px');
  }

  function setMenuOpen(open) {
    mainNav.classList.toggle('is-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggleText.textContent = open ? '메뉴 닫기' : '메뉴 열기';
    menuIcon.textContent = open ? '✕' : '☰';
  }

  menuToggle.addEventListener('click', function () {
    setMenuOpen(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  menuLinks.forEach(link => {
    link.addEventListener('click', function () {
      setCurrentMenu(link);
      lockUntil = Date.now() + 1000;
      // 목적지를 고르면 모바일 메뉴 닫기
      if (mobileQuery.matches) setMenuOpen(false);
    });
  });

  // Esc 키로 모바일 메뉴 닫기
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && mainNav.classList.contains('is-open')) {
      setMenuOpen(false);
      menuToggle.focus();
    }
  });

  // 넓은 화면으로 바뀌면 모바일 메뉴 상태 초기화
  mobileQuery.addEventListener('change', function () {
    setMenuOpen(false);
    syncHeaderHeight();
  });

  window.addEventListener('resize', syncHeaderHeight);

  // 첫 로드 / 새로고침: 브라우저가 스크롤 위치를 복원한 뒤 계산
  syncHeaderHeight();
  updateCurrentFromScroll();
  window.addEventListener('load', function () {
    syncHeaderHeight();
    updateCurrentFromScroll();
  });
});