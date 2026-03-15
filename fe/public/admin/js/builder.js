/**
 * 도파민 공작소 — 심리테스트 빌더 (builder.js)
 * Benchmarked: Interact (results-first flow, correlation matrix)
 *              Riddle (weighted scoring -5~+5 per answer per type)
 *              involve.me (per-result page design, balance checker)
 */
(function (global) {
  'use strict';

  /* ── 외부 의존성 (admin.js에서 init으로 주입) ── */
  let _db, _contentEl, _showToast, _navigate, _persistData, _getAllServices, _escHtml;

  /* ── 빌더 전역 상태 ── */
  let _def     = null;  // 현재 편집 중인 테스트 정의
  let _step    = 1;     // 현재 단계 1~5
  let _qIdx    = 0;     // Step3: 선택된 질문 인덱스
  let _rIdx    = 0;     // Step2/5: 선택된 결과 유형 인덱스

  /* ── 단계 레이블 ── */
  const STEPS = [
    { n: 1, label: '기본 정보' },
    { n: 2, label: '결과 유형' },
    { n: 3, label: '질문' },
    { n: 4, label: '채점 연결' },
    { n: 5, label: '결과 & 발행' },
  ];

  const DEFAULT_COLORS = ['#6366F1','#F43F5E','#10B981','#F59E0B','#8B5CF6','#EC4899','#06B6D4','#84CC16'];

  /* ════════════════════════════════════════════════
     PUBLIC API
  ════════════════════════════════════════════════ */
  function init(deps) {
    _db           = deps.db;
    _contentEl    = deps.contentEl;
    _showToast    = deps.showToast;
    _navigate     = deps.navigate;
    _persistData  = deps.persistData;
    _getAllServices = deps.getAllServices;
    _escHtml      = deps.escHtml;
  }

  function render() {
    if (!_def) { _renderCreateForm(); return; }
    _renderWizard();
  }

  async function editService(id) {
    try {
      const snap = await _db.collection('siteConfig').doc('builderService-' + id).get();
      if (!snap.exists) { _showToast('서비스를 찾을 수 없습니다.'); return; }
      _def  = snap.data();
      _step = 1; _qIdx = 0; _rIdx = 0;
      _navigate('builder');
    } catch (e) { _showToast('로드 실패.'); }
  }

  async function previewOpen() {
    if (!_def) return;
    _showToast('미리보기 준비 중...');
    try {
      await _db.collection('siteConfig').doc('builderService-' + _def.id).set({
        ..._def,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
    } catch (_e) { _showToast('저장 실패 — 미리보기를 열 수 없습니다'); return; }
    const route = '/dunsmile/service-app/?s=' + encodeURIComponent(_def.id);
    const existing = document.getElementById('bld-preview-modal');
    if (existing) existing.remove();
    const modal = document.createElement('div');
    modal.id = 'bld-preview-modal';
    modal.style.cssText = 'position:fixed;inset:0;z-index:9999;background:rgba(0,0,0,0.85);display:flex;flex-direction:column;';
    modal.innerHTML = `
      <div style="display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--adm-surface);border-bottom:1px solid var(--adm-border);flex-shrink:0;">
        <span style="font-size:18px;">${_escHtml(_def.emoji||'✨')}</span>
        <span style="font-weight:600;font-size:14px;color:var(--adm-text);">${_escHtml(_def.name)}</span>
        <code style="font-size:11px;color:var(--adm-text-muted);background:var(--adm-surface-2);padding:2px 8px;border-radius:4px;">${route}</code>
        <button onclick="document.getElementById('bld-preview-modal').remove()" class="adm-btn adm-btn--ghost" style="margin-left:auto;padding:5px 14px;font-size:13px;">× 닫기</button>
      </div>
      <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;">
        <iframe src="${route}" style="width:390px;height:min(844px,80vh);border:none;border-radius:16px;box-shadow:0 24px 48px rgba(0,0,0,0.5);" title="서비스 미리보기"></iframe>
      </div>`;
    document.body.appendChild(modal);
  }

  async function publish() {
    if (!_def) return;
    const validation = _validateDef();
    if (validation) { _showToast(validation); return; }
    const route = '/dunsmile/service-app/?s=' + encodeURIComponent(_def.id);
    try {
      await _db.collection('siteConfig').doc('builderService-' + _def.id).set({
        ..._def, updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      });
      const svcs = _getAllServices();
      const existing = svcs.find(s => s.id === _def.id);
      if (existing) {
        Object.assign(existing, { name: _def.name, emoji: _def.emoji, category: _def.category, desc: _def.desc, route, builderMade: true, builderType: 'quiz' });
      } else {
        svcs.push({
          id: _def.id, name: _def.name, fullName: _def.name,
          emoji: _def.emoji, category: _def.category, desc: _def.desc,
          status: 'active', homeVisible: true,
          route, trendingScore: 50, tags: [], builderMade: true, builderType: 'quiz',
        });
      }
      await _persistData();
      _showToast(`✓ "${_def.name}" 발행 완료!`);
      _def = null; _step = 1;
      setTimeout(() => _navigate('services'), 1200);
    } catch (e) { _showToast('저장 실패. 네트워크를 확인하세요.'); }
  }

  function exit() {
    if (_def && !confirm('나가면 저장되지 않은 변경사항이 사라집니다.\n계속할까요?')) return;
    _def = null; _step = 1;
    _navigate('services');
  }

  /* ════════════════════════════════════════════════
     INTERNAL: 위저드 셸
  ════════════════════════════════════════════════ */
  function _renderWizard() {
    _contentEl.innerHTML = `
      <!-- 상단 바 -->
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap;">
        <button class="adm-btn adm-btn--ghost" onclick="window.__bldExit()" style="padding:5px 12px;font-size:12px;">← 나가기</button>
        <span style="font-size:18px;">${_escHtml(_def.emoji||'✨')}</span>
        <strong style="font-size:15px;color:var(--adm-text);">${_escHtml(_def.name||'새 테스트')}</strong>
        <div style="margin-left:auto;display:flex;gap:8px;">
          <button class="adm-btn adm-btn--ghost" style="font-size:12px;" onclick="window.__bldPreviewOpen()">미리보기</button>
          <button class="adm-btn adm-btn--primary" onclick="window.__bldPublish()">발행하기</button>
        </div>
      </div>

      <!-- 단계 네비게이터 -->
      <div style="display:flex;gap:4px;margin-bottom:20px;background:var(--adm-surface-2);border-radius:12px;padding:4px;">
        ${STEPS.map(s => `
          <button onclick="window.__bldGoStep(${s.n})"
            style="flex:1;padding:8px 4px;border:none;border-radius:9px;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit;transition:all 0.15s;
              background:${_step===s.n?'var(--adm-accent)':'transparent'};
              color:${_step===s.n?'#fff':'var(--adm-text-muted)'};">
            ${s.n}. ${s.label}
          </button>`).join('')}
      </div>

      <!-- 단계 콘텐츠 -->
      <div id="bld-step-content"></div>`;

    const el = document.getElementById('bld-step-content');
    if (_step === 1) _renderStep1(el);
    else if (_step === 2) _renderStep2(el);
    else if (_step === 3) _renderStep3(el);
    else if (_step === 4) _renderStep4(el);
    else if (_step === 5) _renderStep5(el);
  }

  /* ════════════════════════════════════════════════
     서비스 생성 폼 (def 없을 때 첫 진입)
  ════════════════════════════════════════════════ */
  function _renderCreateForm() {
    _contentEl.innerHTML = `
      <div style="max-width:480px;margin:0 auto;padding-top:24px;">
        <h2 style="font-size:20px;font-weight:700;color:var(--adm-text);margin-bottom:6px;">새 심리테스트 만들기</h2>
        <p style="font-size:13px;color:var(--adm-text-muted);margin-bottom:24px;">MBTI 스타일의 퍼스널리티 테스트를 5단계로 제작합니다.</p>

        <label class="adm-label">서비스 ID (영문, 소문자, 하이픈)</label>
        <input class="adm-input" id="bld-new-id" placeholder="my-psychology-test" style="margin-bottom:12px;">

        <label class="adm-label">테스트 이름 *</label>
        <input class="adm-input" id="bld-new-name" placeholder="당신의 직장 유형은?" style="margin-bottom:12px;">

        <label class="adm-label">대표 이모지</label>
        <input class="adm-input" id="bld-new-emoji" placeholder="🧠" style="margin-bottom:12px;width:80px;">

        <label class="adm-label">카테고리</label>
        <select class="adm-input" id="bld-new-cat" style="margin-bottom:24px;">
          <option value="fortune">🔮 운세/심리</option>
          <option value="fun" selected>🎯 놀이/테스트</option>
          <option value="luck">🍀 행운/번호</option>
          <option value="experimental">🧪 실험실</option>
        </select>

        <div style="display:flex;gap:8px;">
          <button class="adm-btn adm-btn--ghost" onclick="window.__admNavigate('services')">취소</button>
          <button class="adm-btn adm-btn--primary" onclick="window.__bldCreate()" style="flex:1;">시작하기 →</button>
        </div>
      </div>`;
  }

  /* ════════════════════════════════════════════════
     STEP 1 — 기본 정보
  ════════════════════════════════════════════════ */
  function _renderStep1(el) {
    const m = _def.meta || {};
    el.innerHTML = `
      <div style="max-width:560px;">
        <h3 class="adm-panel__title" style="margin-bottom:16px;">1단계: 기본 정보</h3>

        <label class="adm-label">테스트 제목 *</label>
        <input class="adm-input" id="s1-title" value="${_escHtml(m.title||_def.name||'')}" placeholder="당신의 직장 유형은?" style="margin-bottom:12px;">

        <label class="adm-label">설명 (홈 카드·공유 문구에 사용)</label>
        <textarea class="adm-input" id="s1-desc" rows="2" placeholder="12개의 질문으로 알아보는 당신의 직장 성격 유형" style="margin-bottom:12px;resize:vertical;">${_escHtml(m.description||_def.desc||'')}</textarea>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px;">
          <div>
            <label class="adm-label">시작 버튼 문구</label>
            <input class="adm-input" id="s1-start-btn" value="${_escHtml(m.start_button_text||'테스트 시작하기')}" placeholder="테스트 시작하기">
          </div>
          <div>
            <label class="adm-label">예상 소요 시간</label>
            <input class="adm-input" id="s1-duration" value="${_escHtml(m.estimated_duration||'약 3분')}" placeholder="약 3분">
          </div>
        </div>

        <label class="adm-label">커버 이미지 URL (선택)</label>
        <input class="adm-input" id="s1-cover" value="${_escHtml(m.cover_image_url||'')}" placeholder="https://..." style="margin-bottom:12px;">

        <label class="adm-label">카테고리</label>
        <select class="adm-input" id="s1-cat" style="margin-bottom:24px;">
          ${['fortune:🔮 운세/심리','fun:🎯 놀이/테스트','luck:🍀 행운/번호','experimental:🧪 실험실'].map(v=>{
            const[val,lbl]=v.split(':');
            return `<option value="${val}"${(_def.category||'fun')===val?' selected':''}>${lbl}</option>`;
          }).join('')}
        </select>

        <div style="display:flex;justify-content:flex-end;">
          <button class="adm-btn adm-btn--primary" onclick="window.__bldGoStep(2)">다음: 결과 유형 정의 →</button>
        </div>
      </div>`;

    // 자동 저장: blur 이벤트
    el.querySelectorAll('input,textarea,select').forEach(inp => {
      inp.addEventListener('change', _saveStep1);
    });
  }

  function _saveStep1() {
    if (!_def) return;
    _def.meta = _def.meta || {};
    _def.name  = document.getElementById('s1-title')?.value || _def.name;
    _def.desc  = document.getElementById('s1-desc')?.value || _def.desc;
    _def.category = document.getElementById('s1-cat')?.value || _def.category;
    _def.meta.title              = _def.name;
    _def.meta.description        = _def.desc;
    _def.meta.start_button_text  = document.getElementById('s1-start-btn')?.value || '테스트 시작하기';
    _def.meta.estimated_duration = document.getElementById('s1-duration')?.value || '약 3분';
    _def.meta.cover_image_url    = document.getElementById('s1-cover')?.value || '';
  }

  /* ════════════════════════════════════════════════
     STEP 2 — 결과 유형 정의 (Interact "results first")
  ════════════════════════════════════════════════ */
  function _renderStep2(el) {
    const types = _def.result_types || [];
    el.innerHTML = `
      <div style="max-width:700px;">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:8px;">
          <h3 class="adm-panel__title">2단계: 결과 유형 정의</h3>
          <button class="adm-btn adm-btn--ghost" style="font-size:12px;padding:4px 12px;margin-left:auto;" onclick="window.__bldAddResult()">+ 유형 추가</button>
        </div>
        <p style="font-size:13px;color:var(--adm-text-muted);margin-bottom:16px;">질문을 작성하기 전에 먼저 결과 유형을 정의하세요. 권장: 4~8개</p>

        <div id="bld-result-list">
          ${types.map((t,i) => _resultTypeCard(t,i)).join('')}
        </div>
        ${types.length===0?`<div style="text-align:center;padding:32px;color:var(--adm-text-muted);font-size:14px;">유형이 없습니다. [+ 유형 추가] 버튼을 눌러 시작하세요.</div>`:''}

        <div style="display:flex;justify-content:space-between;margin-top:20px;">
          <button class="adm-btn adm-btn--ghost" onclick="window.__bldGoStep(1)">← 이전</button>
          <button class="adm-btn adm-btn--primary" onclick="window.__bldGoStep(3)" ${types.length<2?'disabled':''}>다음: 질문 추가 →</button>
        </div>
      </div>`;
  }

  function _resultTypeCard(t, i) {
    return `
      <div class="adm-card" style="margin-bottom:10px;border-left:3px solid ${_escHtml(t.color||'#6366f1')};">
        <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
          <span style="font-size:22px;">${_escHtml(t.emoji||'✨')}</span>
          <strong style="font-size:14px;color:var(--adm-text);">${_escHtml(t.name||'(이름 없음)')}</strong>
          <code style="font-size:11px;background:var(--adm-surface-2);padding:2px 6px;border-radius:4px;color:var(--adm-text-muted);">${_escHtml(t.code)}</code>
          <button onclick="window.__bldDeleteResult(${i})" style="margin-left:auto;background:none;border:none;color:var(--adm-danger);cursor:pointer;font-size:18px;line-height:1;" title="삭제">×</button>
        </div>
        <div style="display:grid;grid-template-columns:80px 1fr 1fr 64px;gap:8px;margin-bottom:8px;">
          <div>
            <label class="adm-label">이모지</label>
            <input class="adm-input" value="${_escHtml(t.emoji||'✨')}" oninput="window.__bldResultField(${i},'emoji',this.value)" style="text-align:center;font-size:18px;">
          </div>
          <div>
            <label class="adm-label">내부 코드 *</label>
            <input class="adm-input" value="${_escHtml(t.code)}" oninput="window.__bldResultField(${i},'code',this.value.toUpperCase().replace(/[^A-Z0-9_]/g,''))" placeholder="TYPE_A">
          </div>
          <div>
            <label class="adm-label">유형 이름 *</label>
            <input class="adm-input" value="${_escHtml(t.name||'')}" oninput="window.__bldResultField(${i},'name',this.value)" placeholder="개척형 리더십">
          </div>
          <div>
            <label class="adm-label">색상</label>
            <input type="color" value="${t.color||'#6366f1'}" oninput="window.__bldResultField(${i},'color',this.value)" style="width:100%;height:36px;border:none;background:none;cursor:pointer;border-radius:6px;">
          </div>
        </div>
        <div>
          <label class="adm-label">부제목 / 한 줄 설명</label>
          <input class="adm-input" value="${_escHtml(t.subtitle||'')}" oninput="window.__bldResultField(${i},'subtitle',this.value)" placeholder="도전을 즐기는 선구자">
        </div>
      </div>`;
  }

  /* ════════════════════════════════════════════════
     STEP 3 — 질문 추가 (좌측 목록 + 우측 에디터)
  ════════════════════════════════════════════════ */
  function _renderStep3(el) {
    const qs = _def.questions || [];
    const q  = qs[_qIdx];
    el.innerHTML = `
      <div style="display:grid;grid-template-columns:220px 1fr;gap:12px;min-height:60vh;">
        <!-- 좌측: 질문 목록 -->
        <div style="background:var(--adm-surface);border:1px solid var(--adm-border);border-radius:12px;overflow:hidden;display:flex;flex-direction:column;">
          <div style="padding:12px;border-bottom:1px solid var(--adm-border);display:flex;align-items:center;justify-content:space-between;">
            <span style="font-size:13px;font-weight:600;color:var(--adm-text);">질문 ${qs.length}개</span>
            <button class="adm-btn adm-btn--primary" style="padding:4px 10px;font-size:12px;" onclick="window.__bldAddQ()">+ 추가</button>
          </div>
          <div style="overflow-y:auto;flex:1;">
            ${qs.map((q,i)=>`
              <div onclick="window.__bldSelectQ(${i})"
                style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--adm-border);
                  background:${i===_qIdx?'rgba(99,102,241,0.12)':'transparent'};
                  border-left:3px solid ${i===_qIdx?'var(--adm-accent)':'transparent'};">
                <div style="font-size:12px;font-weight:700;color:var(--adm-accent);">Q${i+1}</div>
                <div style="font-size:12px;color:var(--adm-text);margin-top:2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:180px;">
                  ${_escHtml(q.text||'(질문 없음)')}
                </div>
                <div style="font-size:11px;color:var(--adm-text-muted);margin-top:2px;">${(q.answers||[]).length}개 답변</div>
              </div>`).join('')}
            ${qs.length===0?`<div style="padding:24px;text-align:center;font-size:13px;color:var(--adm-text-muted);">질문이 없습니다</div>`:''}
          </div>
        </div>

        <!-- 우측: 질문 에디터 -->
        <div style="background:var(--adm-surface);border:1px solid var(--adm-border);border-radius:12px;padding:16px;">
          ${q ? _renderQEditor(q, _qIdx) : `<div style="color:var(--adm-text-muted);text-align:center;padding-top:60px;">좌측에서 질문을 선택하거나 추가하세요.</div>`}
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-top:16px;">
        <button class="adm-btn adm-btn--ghost" onclick="window.__bldGoStep(2)">← 이전</button>
        <button class="adm-btn adm-btn--primary" onclick="window.__bldGoStep(4)" ${qs.length===0?'disabled':''}>다음: 채점 연결 →</button>
      </div>`;
  }

  function _renderQEditor(q, qi) {
    return `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;">
        <span style="font-size:14px;font-weight:700;color:var(--adm-accent);">Q${qi+1}</span>
        <button onclick="window.__bldDeleteQ(${qi})" style="background:none;border:none;color:var(--adm-danger);cursor:pointer;font-size:13px;">× 질문 삭제</button>
      </div>

      <label class="adm-label">질문 텍스트 *</label>
      <textarea class="adm-input" rows="2" style="margin-bottom:14px;resize:vertical;" placeholder="회의 중 반대 의견이 나왔을 때 당신은?"
        oninput="window.__bldQField('text',this.value)">${_escHtml(q.text||'')}</textarea>

      <label class="adm-label">답변 선택지</label>
      <div id="bld-answers" style="margin-bottom:12px;">
        ${(q.answers||[]).map((a,ai)=>`
          <div style="display:flex;gap:8px;align-items:center;margin-bottom:6px;">
            <span style="font-size:12px;font-weight:700;color:var(--adm-accent);width:20px;">${a.label||String.fromCharCode(65+ai)}</span>
            <input class="adm-input" style="flex:1;" value="${_escHtml(a.text||'')}"
              oninput="window.__bldAnswerText(${ai},this.value)" placeholder="답변 ${ai+1}">
            ${(q.answers.length>2)?`<button onclick="window.__bldDeleteAnswer(${ai})" style="background:none;border:none;color:var(--adm-danger);cursor:pointer;font-size:16px;">×</button>`:''}
          </div>`).join('')}
      </div>
      ${(q.answers||[]).length<6?`<button class="adm-btn adm-btn--ghost" style="font-size:12px;padding:5px 12px;" onclick="window.__bldAddAnswer()">+ 답변 추가</button>`:''}`;
  }

  /* ════════════════════════════════════════════════
     STEP 4 — 채점 연결 (Interact 간단 + Riddle 정밀)
  ════════════════════════════════════════════════ */
  function _renderStep4(el) {
    const qs    = _def.questions || [];
    const types = _def.result_types || [];
    const mode  = _def.scoring_mode || 'simple';
    const q     = qs[_qIdx] || qs[0];
    if (!q) { _qIdx = 0; }

    const balance = _calcBalance();

    el.innerHTML = `
      <div>
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;flex-wrap:wrap;">
          <h3 class="adm-panel__title">4단계: 채점 연결</h3>
          <div style="margin-left:auto;display:flex;gap:4px;background:var(--adm-surface-2);border-radius:8px;padding:3px;">
            <button onclick="window.__bldScoreMode('simple')"
              class="adm-btn" style="padding:5px 14px;font-size:12px;border-radius:6px;
                background:${mode==='simple'?'var(--adm-accent)':'transparent'};
                color:${mode==='simple'?'#fff':'var(--adm-text-muted)'};">
              간단 (+1)
            </button>
            <button onclick="window.__bldScoreMode('weighted')"
              class="adm-btn" style="padding:5px 14px;font-size:12px;border-radius:6px;
                background:${mode==='weighted'?'var(--adm-accent)':'transparent'};
                color:${mode==='weighted'?'#fff':'var(--adm-text-muted)'};">
              정밀 (가중치)
            </button>
          </div>
        </div>

        ${mode==='simple'
          ? `<p style="font-size:12px;color:var(--adm-text-muted);margin-bottom:12px;">각 답변이 어떤 유형에 해당하는지 선택하세요. (1:1 연결, +1점)</p>`
          : `<p style="font-size:12px;color:var(--adm-text-muted);margin-bottom:12px;">각 답변이 각 유형에 기여하는 점수를 입력하세요. (-5 ~ +5, 빈칸=0)</p>`}

        <!-- 질문 탭 -->
        <div style="display:flex;gap:4px;overflow-x:auto;padding-bottom:6px;margin-bottom:12px;">
          ${qs.map((q,i)=>`
            <button onclick="window.__bldSelectQ(${i})" class="adm-btn" style="flex-shrink:0;padding:5px 12px;font-size:12px;
              background:${i===_qIdx?'var(--adm-accent)':'var(--adm-surface-2)'};
              color:${i===_qIdx?'#fff':'var(--adm-text-muted)'};border-radius:8px;">
              Q${i+1}
            </button>`).join('')}
        </div>

        <!-- 채점 매트릭스 -->
        ${q ? _renderScoreMatrix(q, _qIdx, types, mode) : ''}

        <!-- 균형 현황 -->
        <div style="margin-top:16px;padding:12px 14px;background:var(--adm-surface);border:1px solid var(--adm-border);border-radius:10px;">
          <div style="font-size:12px;font-weight:700;color:var(--adm-text);margin-bottom:8px;">균형 현황 (최대 획득 가능 점수)</div>
          ${types.map(t => {
            const max = balance[t.code] || 0;
            const maxAll = Math.max(...Object.values(balance), 1);
            const pct = Math.round((max/maxAll)*100);
            const warn = max < maxAll * 0.6;
            return `
              <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
                <span style="font-size:13px;width:24px;text-align:center;">${_escHtml(t.emoji||'')}</span>
                <span style="font-size:12px;color:var(--adm-text);width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_escHtml(t.name)}</span>
                <div style="flex:1;background:var(--adm-surface-2);border-radius:4px;height:8px;">
                  <div style="height:100%;border-radius:4px;background:${warn?'var(--adm-warning)':'var(--adm-accent)'};width:${pct}%;transition:width 0.3s;"></div>
                </div>
                <span style="font-size:12px;color:${warn?'var(--adm-warning)':'var(--adm-text-muted)'};width:30px;text-align:right;">${max}pt</span>
                ${warn?`<span style="font-size:11px;color:var(--adm-warning);">⚠</span>`:''}
              </div>`;
          }).join('')}
          ${Object.values(balance).some((v,_,a)=>v < Math.max(...a)*0.6)
            ? `<p style="font-size:12px;color:var(--adm-warning);margin-top:6px;">⚠ 일부 유형의 점수가 낮습니다. 해당 유형에 더 많은 답변을 연결하세요.</p>`
            : `<p style="font-size:12px;color:var(--adm-success);margin-top:6px;">✓ 균형이 잡혀있습니다.</p>`}
        </div>

        <div style="display:flex;justify-content:space-between;margin-top:16px;">
          <button class="adm-btn adm-btn--ghost" onclick="window.__bldGoStep(3)">← 이전</button>
          <button class="adm-btn adm-btn--primary" onclick="window.__bldGoStep(5)">다음: 결과 페이지 →</button>
        </div>
      </div>`;
  }

  function _renderScoreMatrix(q, qi, types, mode) {
    const answers = q.answers || [];
    return `
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;background:var(--adm-surface);border-radius:10px;overflow:hidden;border:1px solid var(--adm-border);">
          <thead>
            <tr style="background:var(--adm-surface-2);">
              <th style="padding:10px 12px;text-align:left;font-size:12px;color:var(--adm-text-muted);font-weight:600;width:180px;">답변</th>
              ${types.map(t=>`
                <th style="padding:10px 8px;text-align:center;font-size:12px;color:var(--adm-text);font-weight:600;min-width:80px;">
                  <div>${_escHtml(t.emoji||'')}</div>
                  <div style="font-size:10px;color:var(--adm-text-muted);">${_escHtml(t.code)}</div>
                </th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${answers.map((a,ai)=>`
              <tr style="border-top:1px solid var(--adm-border);">
                <td style="padding:10px 12px;font-size:13px;color:var(--adm-text);">
                  <span style="color:var(--adm-accent);font-weight:700;margin-right:6px;">${_escHtml(a.label||String.fromCharCode(65+ai))}</span>
                  ${_escHtml((a.text||'').slice(0,28))}${(a.text||'').length>28?'…':''}
                </td>
                ${types.map(t=>`
                  <td style="padding:6px 8px;text-align:center;">
                    ${mode==='simple'
                      ? `<input type="radio" name="q${qi}_a${ai}" value="${_escHtml(t.code)}"
                          ${(a.scores||{})[t.code]>0?'checked':''}
                          onchange="window.__bldScoreSimple(${qi},${ai},'${_escHtml(t.code)}')"
                          style="width:18px;height:18px;cursor:pointer;">`
                      : `<input type="number" min="-5" max="5" step="1"
                          value="${((a.scores||{})[t.code])||0}"
                          oninput="window.__bldScoreWeighted(${qi},${ai},'${_escHtml(t.code)}',parseInt(this.value)||0)"
                          style="width:52px;text-align:center;padding:4px;border-radius:6px;border:1px solid var(--adm-border);background:var(--adm-surface-2);color:var(--adm-text);font-size:13px;">`}
                  </td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  /* ════════════════════════════════════════════════
     STEP 5 — 결과 페이지 설정 + 발행
  ════════════════════════════════════════════════ */
  function _renderStep5(el) {
    const types = _def.result_types || [];
    const t     = types[_rIdx];
    const checks = _getChecklist();

    el.innerHTML = `
      <div style="display:grid;grid-template-columns:200px 1fr;gap:12px;min-height:60vh;">
        <!-- 좌측: 유형 목록 -->
        <div style="background:var(--adm-surface);border:1px solid var(--adm-border);border-radius:12px;overflow:hidden;">
          <div style="padding:10px 12px;border-bottom:1px solid var(--adm-border);font-size:13px;font-weight:600;color:var(--adm-text);">결과 유형</div>
          ${types.map((t,i)=>`
            <div onclick="window.__bldSelectResult(${i})"
              style="padding:10px 12px;cursor:pointer;border-bottom:1px solid var(--adm-border);display:flex;align-items:center;gap:8px;
                background:${i===_rIdx?'rgba(99,102,241,0.12)':'transparent'};
                border-left:3px solid ${i===_rIdx?'var(--adm-accent)':'transparent'};">
              <span style="font-size:16px;">${_escHtml(t.emoji||'✨')}</span>
              <span style="font-size:12px;color:var(--adm-text);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${_escHtml(t.name||t.code)}</span>
            </div>`).join('')}
        </div>

        <!-- 우측: 결과 페이지 편집 -->
        <div style="background:var(--adm-surface);border:1px solid var(--adm-border);border-radius:12px;padding:16px;">
          ${t ? _renderResultPageEditor(t, _rIdx) : '<p style="color:var(--adm-text-muted);">좌측에서 유형을 선택하세요.</p>'}
        </div>
      </div>

      <!-- 발행 체크리스트 -->
      <div style="margin-top:16px;padding:14px 16px;background:var(--adm-surface);border:1px solid var(--adm-border);border-radius:12px;">
        <div style="font-size:13px;font-weight:700;color:var(--adm-text);margin-bottom:10px;">발행 체크리스트</div>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:6px;">
          ${checks.map(c=>`
            <div style="display:flex;align-items:center;gap:8px;font-size:13px;color:${c.ok?'var(--adm-success)':'var(--adm-warning)'};">
              ${c.ok?'✅':'⚠️'} ${c.label}
            </div>`).join('')}
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;margin-top:16px;">
        <button class="adm-btn adm-btn--ghost" onclick="window.__bldGoStep(4)">← 이전</button>
        <div style="display:flex;gap:8px;">
          <button class="adm-btn adm-btn--ghost" onclick="window.__bldPreviewOpen()">미리보기</button>
          <button class="adm-btn adm-btn--primary" onclick="window.__bldPublish()" ${checks.every(c=>c.ok)?'':'style="opacity:0.7;"'}>🚀 발행하기</button>
        </div>
      </div>`;
  }

  function _renderResultPageEditor(t, ri) {
    const rp = t.result_page || {};
    return `
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
        <span style="font-size:22px;">${_escHtml(t.emoji||'✨')}</span>
        <strong style="font-size:14px;color:var(--adm-text);">${_escHtml(t.name)}</strong>
        <code style="font-size:11px;background:var(--adm-surface-2);padding:2px 6px;border-radius:4px;color:var(--adm-text-muted);">${_escHtml(t.code)}</code>
      </div>

      <label class="adm-label">결과 페이지 제목</label>
      <input class="adm-input" value="${_escHtml(rp.title||t.name||'')}" style="margin-bottom:10px;"
        placeholder="${_escHtml(t.emoji||'✨')} 당신은 ${_escHtml(t.name||'')}!"
        oninput="window.__bldResultPageField(${ri},'title',this.value)">

      <label class="adm-label">결과 설명 *</label>
      <textarea class="adm-input" rows="4" style="margin-bottom:10px;resize:vertical;"
        placeholder="당신은 새로운 아이디어를 두려워하지 않고 앞서 나가는 타입입니다..."
        oninput="window.__bldResultPageField(${ri},'body',this.value)">${_escHtml(rp.body||t.description||'')}</textarea>

      <label class="adm-label">결과 이미지 URL (선택)</label>
      <input class="adm-input" value="${_escHtml(rp.image_url||t.image_url||'')}" style="margin-bottom:10px;"
        placeholder="https://..."
        oninput="window.__bldResultPageField(${ri},'image_url',this.value)">

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div>
          <label class="adm-label">CTA 버튼 문구 (선택)</label>
          <input class="adm-input" value="${_escHtml(rp.cta_label||'')}" placeholder="다시 테스트하기"
            oninput="window.__bldResultPageField(${ri},'cta_label',this.value)">
        </div>
        <div>
          <label class="adm-label">CTA 링크 (선택)</label>
          <input class="adm-input" value="${_escHtml(rp.cta_url||'')}" placeholder="https://..."
            oninput="window.__bldResultPageField(${ri},'cta_url',this.value)">
        </div>
      </div>

      <label class="adm-label">카카오/SNS 공유 문구</label>
      <input class="adm-input" value="${_escHtml(rp.share_title||'나는 '+t.name+'!||')}" style="margin-bottom:4px;"
        placeholder="나는 ${_escHtml(t.name)}!"
        oninput="window.__bldResultPageField(${ri},'share_title',this.value)">`;
  }

  /* ════════════════════════════════════════════════
     WINDOW HANDLERS (admin.js에서 접근)
  ════════════════════════════════════════════════ */
  function _bindHandlers() {
    // 단계 이동
    global.__bldGoStep = function(n) {
      if (n === 1) _saveStep1();  // step1은 blur 안 탈 수도 있으므로 강제 저장
      _step = n;
      _renderWizard();
    };

    // 서비스 최초 생성
    global.__bldCreate = function() {
      const id   = document.getElementById('bld-new-id')?.value.trim().replace(/[^a-z0-9-]/g,'');
      const name = document.getElementById('bld-new-name')?.value.trim();
      const cat  = document.getElementById('bld-new-cat')?.value;
      const emoji= document.getElementById('bld-new-emoji')?.value.trim() || '🧠';
      if (!id)   { _showToast('서비스 ID를 입력하세요.'); return; }
      if (!name) { _showToast('테스트 이름을 입력하세요.'); return; }
      _def = {
        id, name, emoji, category: cat,
        builderType: 'quiz',
        desc: '',
        meta: { title: name, description: '', start_button_text: '테스트 시작하기', estimated_duration: '약 3분', cover_image_url: '' },
        scoring_mode: 'simple',
        result_types: [],
        questions: [],
      };
      _step = 1; _qIdx = 0; _rIdx = 0;
      _renderWizard();
    };

    // 결과 유형
    global.__bldAddResult = function() {
      const types = _def.result_types;
      const idx   = types.length;
      types.push({
        id: _uid(), code: 'TYPE_' + String.fromCharCode(65+idx),
        name: '', subtitle: '', description: '',
        emoji: '✨', color: DEFAULT_COLORS[idx % DEFAULT_COLORS.length],
        image_url: '', result_page: {},
      });
      _rIdx = idx;
      _step = 2; _renderWizard();
    };
    global.__bldDeleteResult = function(i) {
      if (!confirm('이 유형을 삭제할까요?')) return;
      _def.result_types.splice(i,1);
      _rIdx = Math.max(0, _rIdx-1);
      _renderWizard();
    };
    global.__bldResultField = function(i, key, val) {
      if (_def.result_types[i]) _def.result_types[i][key] = val;
    };
    global.__bldSelectResult = function(i) {
      _rIdx = i; _renderWizard();
    };
    global.__bldResultPageField = function(i, key, val) {
      if (!_def.result_types[i]) return;
      _def.result_types[i].result_page = _def.result_types[i].result_page || {};
      _def.result_types[i].result_page[key] = val;
    };

    // 질문
    global.__bldAddQ = function() {
      const idx = _def.questions.length;
      _def.questions.push({
        id: _uid(), order: idx+1, text: '', image_url: '',
        answers: [
          { id: _uid(), label:'A', text:'', scores:{} },
          { id: _uid(), label:'B', text:'', scores:{} },
          { id: _uid(), label:'C', text:'', scores:{} },
          { id: _uid(), label:'D', text:'', scores:{} },
        ],
      });
      _qIdx = idx;
      _renderWizard();
    };
    global.__bldDeleteQ = function(i) {
      if (!confirm('이 질문을 삭제할까요?')) return;
      _def.questions.splice(i,1);
      _qIdx = Math.max(0, _qIdx-1);
      _renderWizard();
    };
    global.__bldSelectQ = function(i) {
      _qIdx = i; _renderWizard();
    };
    global.__bldQField = function(key, val) {
      if (_def.questions[_qIdx]) _def.questions[_qIdx][key] = val;
    };
    global.__bldAddAnswer = function() {
      const q = _def.questions[_qIdx]; if (!q) return;
      const ai = q.answers.length;
      q.answers.push({ id: _uid(), label: String.fromCharCode(65+ai), text: '', scores: {} });
      _renderWizard();
    };
    global.__bldDeleteAnswer = function(ai) {
      const q = _def.questions[_qIdx]; if (!q || q.answers.length<=2) return;
      q.answers.splice(ai,1);
      _renderWizard();
    };
    global.__bldAnswerText = function(ai, val) {
      const q = _def.questions[_qIdx]; if (q && q.answers[ai]) q.answers[ai].text = val;
    };

    // 채점
    global.__bldScoreMode = function(mode) {
      _def.scoring_mode = mode;
      _renderWizard();
    };
    global.__bldScoreSimple = function(qi, ai, typeCode) {
      // 같은 질문의 모든 답변에서 해당 유형 점수를 0으로 리셋 후, 선택된 답변만 1
      const q = _def.questions[qi]; if (!q) return;
      q.answers.forEach((a,i) => {
        a.scores = a.scores || {};
        a.scores[typeCode] = (i===ai) ? 1 : 0;
      });
    };
    global.__bldScoreWeighted = function(qi, ai, typeCode, val) {
      const q = _def.questions[qi]; if (!q || !q.answers[ai]) return;
      q.answers[ai].scores = q.answers[ai].scores || {};
      q.answers[ai].scores[typeCode] = val;
    };
  }

  /* ════════════════════════════════════════════════
     HELPERS
  ════════════════════════════════════════════════ */
  function _calcBalance() {
    const totals = {};
    (_def.result_types||[]).forEach(t => { totals[t.code] = 0; });
    (_def.questions||[]).forEach(q => {
      (_def.result_types||[]).forEach(t => {
        const max = Math.max(...(q.answers||[]).map(a => ((a.scores||{})[t.code])||0), 0);
        totals[t.code] = (totals[t.code]||0) + max;
      });
    });
    return totals;
  }

  function _getChecklist() {
    const qs = _def.questions || [];
    const types = _def.result_types || [];
    const balance = _calcBalance();
    const maxScore = Math.max(...Object.values(balance), 1);
    return [
      { label: `기본 정보 완료`, ok: !!(_def.name && _def.desc) },
      { label: `결과 유형 2개 이상 (${types.length}개)`, ok: types.length >= 2 },
      { label: `질문 5개 이상 (${qs.length}개)`, ok: qs.length >= 5 },
      { label: `모든 답변에 채점 연결`, ok: qs.every(q=>(q.answers||[]).every(a=>Object.values(a.scores||{}).some(v=>v!==0))) },
      { label: `결과 균형 (최저 점수 ≥ 60%)`, ok: Object.values(balance).every(v=>v >= maxScore*0.6) },
      { label: `모든 유형 설명 입력`, ok: types.every(t=>!!(t.result_page?.body || t.description)) },
    ];
  }

  function _validateDef() {
    if (!_def.name)            return '테스트 이름을 입력하세요.';
    if (!(_def.result_types||[]).length >= 2) return '결과 유형을 2개 이상 정의하세요.';
    if (!(_def.questions||[]).length)         return '질문을 추가하세요.';
    return null;
  }

  function _uid() {
    return Math.random().toString(36).slice(2,10);
  }

  /* ════════════════════════════════════════════════
     서비스 만들기 첫 진입 (admin.js PAGES 시스템)
  ════════════════════════════════════════════════ */
  function _renderCreateForm() {
    _contentEl.innerHTML = `
      <div style="max-width:480px;margin:0 auto;padding-top:24px;">
        <h2 style="font-size:20px;font-weight:700;color:var(--adm-text);margin-bottom:6px;">새 심리테스트 만들기</h2>
        <p style="font-size:13px;color:var(--adm-text-muted);margin-bottom:24px;">MBTI 스타일의 퍼스널리티 테스트를 5단계로 제작합니다.</p>

        <label class="adm-label">서비스 ID (영문 소문자, 하이픈만)</label>
        <input class="adm-input" id="bld-new-id" placeholder="my-psychology-test" style="margin-bottom:12px;">

        <label class="adm-label">테스트 이름 *</label>
        <input class="adm-input" id="bld-new-name" placeholder="당신의 직장 유형은?" style="margin-bottom:12px;">

        <label class="adm-label">대표 이모지</label>
        <input class="adm-input" id="bld-new-emoji" placeholder="🧠" style="margin-bottom:12px;width:80px;">

        <label class="adm-label">카테고리</label>
        <select class="adm-input" id="bld-new-cat" style="margin-bottom:24px;">
          <option value="fortune">🔮 운세/심리</option>
          <option value="fun" selected>🎯 놀이/테스트</option>
          <option value="luck">🍀 행운/번호</option>
          <option value="experimental">🧪 실험실</option>
        </select>

        <div style="display:flex;gap:8px;">
          <button class="adm-btn adm-btn--ghost" onclick="window.__admNavigate('services')">취소</button>
          <button class="adm-btn adm-btn--primary" onclick="window.__bldCreate()" style="flex:1;">시작하기 →</button>
        </div>
      </div>`;
  }

  /* ── 모듈 등록 ── */
  _bindHandlers();

  global.DPBuilder = { init, render, editService, previewOpen, publish, exit };

})(window);
