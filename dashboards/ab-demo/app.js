

(function () {
  'use strict';
  const state = { experiments: [], kpi: null, kpiByType: null, loaded: false, current: null, scope: [1], charts: {}, chartsInited: false, lastSeries: null, editTarget: null, pollTimer: null, menuList: [], historyOpen: false,
    page: 'abpair', abPage: 'abpair', seriesSeq: 0, loadStatus: null, saSeq: 0, saSegment: 'all', sa: null, dataSig: null, busyTimer: null, guideQueries: null, doneYear: null, expTab: 'running' };   
  
  const AB_PAGES = {   
    abpair: { kpi: 'marking', title: 'Pairwise AB', sub: '마킹표 is_pair 분할 실험 · 결과 분석 · 일 1회 갱신(14:10 KST)', badge: 'navAbPairBadge' },
    abrule: { kpi: 'rule', title: 'Non-pairwise AB', sub: '마킹표 없이 SQL 규칙으로 대상자를 정한 실험(광고 매출 포함 실험은 광고 AB) · 결과 분석 · 일 1회 갱신(14:10 KST)', badge: 'navAbRuleBadge' },
    abiaa: { kpi: 'iaa', title: '광고 AB', sub: '광고 매출(전면 · 리워드)을 포함하는 실험 · Total ARPU 기준 · 광고 매출은 약 2일 지연', badge: 'navAbIaaBadge' },
  };
  const kindOf = (e) => (e && e.exp_kind === 'iaa' ? 'iaa' : 'iap');                 
  const pageOf = (e) => (!e ? 'abpair' : e.exp_kind === 'iaa' ? 'abiaa' : e.cohort_type === 'rule' ? 'abrule' : 'abpair');   
  const abVisible = () => state.experiments.filter(e => pageOf(e) === state.abPage);   
  const $ = (id) => document.getElementById(id);
  
  const COLORS = { green: '#059669', amber: '#D97706', gray: '#9CA3AF', brand: '#4F46E5', test: '#E5484D', cont: '#3B82F6' };

  const DIFF_HUE = {
    tarpu: { line: '#3CB44B', dark: '#1A7A26', above: 'rgba(60,180,75,0.40)',  below: 'rgba(26,122,38,0.72)' },    
    ad_is: { line: '#F28E2B', dark: '#B4560A', above: 'rgba(242,142,43,0.40)', below: 'rgba(180,86,10,0.72)' },
    ad_rv: { line: '#B35FB3', dark: '#7B1F86', above: 'rgba(179,95,179,0.40)', below: 'rgba(123,31,134,0.72)' },
    adrev: { line: '#F28E2B', dark: '#B4560A', above: 'rgba(242,142,43,0.40)', below: 'rgba(180,86,10,0.72)' },    
    ret:   { line: '#B35FB3', dark: '#7B1F86', above: 'rgba(179,95,179,0.40)', below: 'rgba(123,31,134,0.72)' },    
    ecpm_is: { line: '#3CB44B', dark: '#1A7A26', above: 'rgba(60,180,75,0.40)', below: 'rgba(26,122,38,0.72)' },
    rev:  { line: '#3CB44B', dark: '#1A7A26', above: 'rgba(60,180,75,0.40)',  below: 'rgba(26,122,38,0.72)' },
    au:   { line: '#3CB44B', dark: '#1A7A26', above: 'rgba(60,180,75,0.55)', below: 'rgba(26,122,38,0.85)' },  
    pur:  { line: '#F28E2B', dark: '#B4560A', above: 'rgba(242,142,43,0.40)', below: 'rgba(180,86,10,0.72)' },
    arpu: { line: '#B35FB3', dark: '#7B1F86', above: 'rgba(179,95,179,0.40)', below: 'rgba(123,31,134,0.72)' },
  };
  const METRIC_LABEL = { rev: '누적 매출', au: '일별 AU', pur: '구매 전환율', arpu: 'ARPU', tarpu: 'Total ARPU', adrev: '광고 매출/유저', ret: '리텐션 D+k', ad_is: '전면광고 매출/유저', ad_rv: '리워드 광고 매출/유저', ecpm_is: '전면광고 eCPM' };

  const SLOTS = ['rev', 'au', 'pur', 'arpu'];
  const SLOT_METRICS = { iap: { rev: 'rev', au: 'au', pur: 'pur', arpu: 'arpu' }, iaa: { rev: 'tarpu', au: 'au', pur: 'adrev', arpu: 'ret' } };
  const CARD_TAG = { rev: 'REVENUE', au: 'ACTIVE USERS', pur: 'PURCHASE RATE', arpu: 'ARPU', tarpu: 'TOTAL ARPU · IAP + AD', adrev: 'AD REVENUE · INTER + REWARD', ret: 'RETENTION · LOGIN D+K', ad_is: 'INTERSTITIAL', ad_rv: 'REWARDED', ecpm_is: 'ECPM' };
  const slotMetric = (slot, kind) => SLOT_METRICS[kind || kindOf(state.current)][slot];
  const isLevel = (k) => k === 'au' || k === 'ret';           
  const isRateKind = (k) => k === 'pur' || k === 'ret';       
  function retHeadKey(hs) { return ['ret7', 'ret3', 'ret1'].find(x => hs && hs[x] && !hs[x].guard) || 'ret1'; }   

  const fmtD = (d) => (d < 0 ? `D${d}` : d === 0 ? 'D0' : `D+${d}`);
  const fmt = {
    rev: (v) => '$' + Math.round(v).toLocaleString(),
    au: (v) => Math.round(v).toLocaleString(),
    pur: (v) => (Math.abs(v) >= 0.1 || v === 0 ? (+v).toFixed(2) : Number((+v).toPrecision(2)).toString()) + '%',   
    arpu: (v) => '$' + (Math.abs(v) >= 1 ? (+v).toFixed(2) : Number((+v).toPrecision(2)).toString()),   
    rel: (v) => (+v).toFixed(2) + '%',   
  };
  fmt.tarpu = fmt.arpu; fmt.ad_is = fmt.arpu; fmt.ad_rv = fmt.arpu; fmt.adrev = fmt.arpu; fmt.ecpm_is = (v) => '$' + (+v).toFixed(1);   
  fmt.ret = (v) => (+v).toFixed(1) + '%';   
  
  const sigColor = (label, v, neutral) => (label === '유의' && v != null && v > 0) ? COLORS.green : (label === '유의' && v != null && v < 0) ? '#DC2626' : (neutral || '#6B7280');
  const sigPillClass = (label, v) => 'ab-pill' + (label === '유의' && v != null ? (v > 0 ? ' up' : v < 0 ? ' down' : '') : '');   
  const fmtPct = (v, digits = 1) => (v == null ? '–' : (v >= 0 ? '+' : '') + v.toFixed(digits) + '%');
  const kst = (utc) => (utc ? utc.replace(' ', 'T') : null);
  const setText = (id, text, color) => { const el = $(id); if (!el) return; el.textContent = text; if (color) el.style.color = color; };
  const status = (msg, isError) => { setText('abStatus', msg || '', isError ? '#DC2626' : '#9CA3AF'); setText('abTopStatus', msg || ''); };

  const cache = AbCache.create({ ttlMs: 60000, maxEntries: 160 });
  const seriesKey = (m, scope) => `series|${m}|${scope.join(',')}`;
  const saKey = (m, scope, seg) => `sa|${m}|${scope.join(',')}|${seg || 'all'}`;
  const seriesUrl = (m, scope) => `/api/experiments/${m}/series?scope=${scope.join(',')}`;
  const saUrl = (m, scope, seg) => `/api/experiments/${m}/sa?scope=${scope.join(',')}&segment=${seg || 'all'}`;
  
  function dataSignature(exps) { return JSON.stringify(exps.map(e => [e.markingidx, e.updated_at, e.last_load && e.last_load.run_ts, !!e.needs_recompute])); }
  
  function setBusy(on) {
    const card = $('abMonitorCard'); if (!card) return;
    if (state.busyTimer) { clearTimeout(state.busyTimer); state.busyTimer = null; }
    if (on) state.busyTimer = setTimeout(() => card.classList.add('ab-loading'), 120); else card.classList.remove('ab-loading');
  }
  async function api(path, opts) {
    const r = await fetch(path, opts);
    let body = null; try { body = await r.json(); } catch (e) {  }
    if (!r.ok) { const err = new Error((body && body.detail) || `HTTP ${r.status}`); err.status = r.status; throw err; }
    return body;
  }

  async function loadExperiments(keepCurrent) {
    const data = await api('/api/experiments');
    state.experiments = data.experiments; state.kpi = data.kpi; state.kpiByType = data.kpi_by_type || null; state.loadStatus = data.load_status || null; state.loaded = true;
    { const sig = dataSignature(data.experiments); if (state.dataSig !== null && sig !== state.dataSig) cache.clear(); state.dataSig = sig; }   
    renderKpi(); renderLists(); fillSelect(); renderFreshness();
    const prev = keepCurrent && state.current ? state.current.markingidx : null;
    const urlExp = keepCurrent ? null : (Number(new URLSearchParams(location.search).get('exp')) || null);   
    const urlQ = keepCurrent ? null : new URLSearchParams(location.search);
    if (urlQ && urlQ.get('scope')) state.urlScope = urlQ.get('scope');   
    const vis = abVisible();   
    const pick = vis.find(e => e.markingidx === prev) || state.experiments.find(e => e.markingidx === urlExp)
      || vis.find(e => e.status === 'running') || vis[0];
    if (pick) { $('abExpSelect').value = String(pick.markingidx); await selectExperiment(pick.markingidx); }
    else emptyAbPage();
    if (urlQ && pick && urlQ.get('edit') === '1' && $('abEditPanel').style.display === 'none') window.toggleEditPanel();   
    if (urlQ && pick && urlQ.get('detail')) window.openAbDetail(urlQ.get('detail'), Object.fromEntries(urlQ.entries()));   
  }

  function kstLabel(ts) { if (!ts) return '없음'; const d = new Date(String(ts).replace(' ', 'T') + 'Z'); if (isNaN(d)) return String(ts); const k = new Date(d.getTime() + 9 * 3600e3); const p = (n) => String(n).padStart(2, '0'); return `${p(k.getUTCMonth() + 1)}-${p(k.getUTCDate())} ${p(k.getUTCHours())}:${p(k.getUTCMinutes())} KST`; }
  function renderFreshness() {
    const el = $('abFreshness'); if (!el) return;
    const ls = state.loadStatus; if (!ls) { el.textContent = ''; return; }
    let txt = `마지막 적재 ${kstLabel(ls.last_ok_ts)}`; let bad = !!ls.stale;
    if (ls.stale) txt += ' — 26시간 넘게 성공 적재 없음(적재 잡 확인)';
    if (ls.errors && ls.errors.length) { txt += ` · 마지막 적재 실패 #${ls.errors.join(', #')}`; bad = true; }
    const cur = state.current && state.current.last_load;
    if (cur && cur.status === 'error') txt += ` · 이 실험: ${String(cur.error || '실패').slice(0, 120)}`;
    else if (cur && cur.status === 'skipped') txt += ` · 이 실험: 적재 건너뜀(${String(cur.error || '').slice(0, 80)})`;
    el.textContent = txt; el.style.color = bad ? '#DC2626' : '#6B7280';
  }
  function renderKpi() {
    const ab = AB_PAGES[state.abPage];
    const k = (state.kpiByType && state.kpiByType[ab.kpi]) || state.kpi || {};   
    setText('kpiRunning', k.running_count ?? '–');
    const running = abVisible().filter(e => e.status === 'running').map(e => e.title);
    setText('kpiRunningSub', running.slice(0, 2).join(' · ') + (running.length > 2 ? ` 외 ${running.length - 2}` : ''));
    
    setText('kpiDone', k.done_year_count ?? '–');
    setText('kpiDoneSub', k.done_year_adopted_pct == null ? '올해 완료 없음' : `채택률 ${k.done_year_adopted_pct.toFixed(0)}% · 채택 ${k.done_year_adopted_count}건`);
    Object.values(AB_PAGES).forEach(pg => {   
      const n = state.kpiByType && state.kpiByType[pg.kpi] ? state.kpiByType[pg.kpi].running_count : null;
      const el = $(pg.badge); if (el) { el.textContent = n ? String(n) : ''; el.style.display = n ? '' : 'none'; }
    });
  }

  function pill(e) {
    const ad = e.exp_kind === 'iaa' ? '<span class="pill-green">광고</span> ' : '';   
    if (e.cohort_type === 'rule') return `${ad}<span class="pill-amber">규칙 코호트</span>`;
    return `${ad}<span class="pill-blue">마킹 ${e.default_scope === '-1' ? '' : 'is_pair ' + e.default_scope}</span>`;
  }
  function upliftBadge(h) {
    if (!h) return `<span class="ab-guard">적재 대기</span>`;
    if (h.uplift_pct == null) return `<span class="ab-guard">${h.guard || '–'}</span>`;
    const cls = h.uplift_pct >= 0 ? 'badge-up' : 'badge-up';   
    const color = sigColor(h.guard ? null : h.label, h.uplift_pct);   
    return `<span class="${cls}" style="font-size:13px;color:${color};">${fmtPct(h.uplift_pct)}</span>${h.guard ? ` <span class="ab-guard">(${h.guard})</span>` : ''}`;
  }
  function confCell(h) {
    if (!h || h.confidence_pct == null) return `<span class="ab-guard">${h && h.guard ? h.guard : '–'}</span>`;
    const prefix = h.color === 'gray' ? '참고 ' : '';
    return `<span style="font-size:13px;font-weight:700;color:${COLORS[h.color] || COLORS.gray};">${prefix}${h.confidence_pct.toFixed(0)}%</span>`;
  }
  
  const kstYear = (ts) => { if (!ts) return null; const d = new Date(String(ts).replace(' ', 'T') + 'Z'); return isNaN(d) ? null : new Date(d.getTime() + 9 * 3600e3).getUTCFullYear(); };
  const thisYear = () => (state.kpi && Number(state.kpi.year_label)) || kstYear(new Date().toISOString().slice(0, 19).replace('T', ' '));
  function renderYearTabs(doneAll) {
    const box = $('expYearTabs'); if (!box) return;
    const years = [...new Set(doneAll.map(e => kstYear(e.exposure_start_ts)).filter(Boolean).concat([thisYear()]))].sort((a, b) => b - a);
    if (!years.includes(state.doneYear)) state.doneYear = thisYear();
    const sel = doneAll.filter(e => kstYear(e.exposure_start_ts) === state.doneYear), adopted = sel.filter(e => e.result === 'adopted').length;
    box.style.display = (state.expTab === 'done' && doneAll.length) ? 'inline-flex' : 'none';
    box.innerHTML = `<span class="yr-sum">${sel.length ? `${sel.length}건 · 채택 ${adopted}건(${Math.round(adopted / sel.length * 100)}%)` : '완료 없음'}</span>`
      + `<span class="ab-seg">${years.map(y => `<button class="ab-chip${y === state.doneYear ? ' active' : ''}" data-year="${y}">${y}</button>`).join('')}</span>`;
    box.querySelectorAll('[data-year]').forEach(b => b.addEventListener('click', () => { state.doneYear = +b.dataset.year; renderLists(); }));
  }
  function renderLists() {
    const running = abVisible().filter(e => e.status === 'running' || e.status === 'candidate');
    const doneAll = abVisible().filter(e => e.status === 'done');
    if (state.doneYear == null) state.doneYear = thisYear();
    renderYearTabs(doneAll);
    const done = doneAll.filter(e => kstYear(e.exposure_start_ts) === state.doneYear).sort(AbMath.byEndDesc);   
    const nCand = running.filter(e => e.status === 'candidate').length;   
    setText('expCountRunning', nCand ? `${running.length - nCand} · 후보 ${nCand}` : running.length); setText('expCountDone', done.length);   
    { const ce = $('expCountRunning'); if (ce) ce.title = nCand ? `진행중 ${running.length - nCand} · 후보(미확정) ${nCand}` : ''; }
    const rb = document.querySelector('#expListRunning tbody');
    rb.innerHTML = running.map(e => {
      const k = e.day_k;   
      const prog = k == null ? '<span class="ab-guard">시작 시각 미확정</span>' : `Day ${k}`;
      return `<tr data-m="${e.markingidx}" style="cursor:pointer;">
        <td><div style="font-weight:600;color:#111;font-size:13px;">${esc(e.title)}</div><div style="font-size:10px;color:#9CA3AF;margin-top:2px;">#${AbMath.displayNo(e)} · ${esc(e.split_desc || e.target_desc || '')}</div></td>
        <td>${pill(e)}</td>
        <td><div style="font-size:12px;color:#374151;font-variant-numeric:tabular-nums;">${prog}</div></td>
        <td>${upliftBadge(e.headline)}</td>
        <td>${confCell(e.headline)}</td>
        <td>${e.status === 'running' ? '<span class="exp-status-running"><span class="dot-live"></span>Running</span>' : (e.exposure_start_ts ? '<span class="pill-gray" title="실험 편집에서 시작 시각을 확인하고 저장하면 진행중으로 올라갑니다">후보 · 시작 시각 확인</span>' : '<span class="pill-gray" title="실험 편집에서 시작 시각을 넣고 저장하면 진행중으로 올라갑니다">후보 · 시작 시각 입력</span>')}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="6" class="ab-guard" style="padding:12px;">진행중 실험 없음</td></tr>';
    const db = document.querySelector('#expListDone tbody');
    db.innerHTML = done.map(e => `<tr data-m="${e.markingidx}" style="cursor:pointer;">
        <td><div style="font-weight:600;color:#111;font-size:13px;">${esc(e.title)}</div><div style="font-size:10px;color:#9CA3AF;margin-top:2px;">#${AbMath.displayNo(e)}</div></td>
        <td>${pill(e)}</td>
        <td style="font-size:12px;">${(e.exposure_start_ts || '').slice(0, 10)} ~ ${(e.end_ts || '').slice(0, 10)}</td>
        <td>${e.final_uplift_pct == null ? '<span class="ab-guard">미동결</span>' : `<span class="badge-up" style="font-size:13px;color:${sigColor(e.headline && !e.headline.guard ? e.headline.label : null, e.final_uplift_pct)};">${fmtPct(e.final_uplift_pct)}</span>`}</td>
        <td>${e.result === 'adopted' ? '<span class="pill-green">채택</span>' : e.result === 'rejected' ? '<span class="pill-gray">기각</span>' : '<span class="pill-amber">미정</span>'}</td>
        <td style="font-size:12px;">${(e.end_ts || '').slice(0, 10)}</td>
      </tr>`).join('') || `<tr><td colspan="6" class="ab-guard" style="padding:12px;">${state.doneYear}년에 시작한 완료 실험 없음</td></tr>`;
    document.querySelectorAll('#expListRunning tr[data-m], #expListDone tr[data-m]').forEach(tr => tr.addEventListener('click', () => {
      $('abExpSelect').value = tr.dataset.m; selectExperiment(+tr.dataset.m);
    }));
  }
  function fillSelect() {
    
    const sel = $('abExpSelect');
    const order = { running: 0, candidate: 1, done: 2, archived: 3 };
    const list = abVisible().filter(e => e.select_visible !== false)   
      .sort((a, b) => (order[a.status] ?? 9) - (order[b.status] ?? 9));
    state.menuList = list;
    sel.innerHTML = list.map(e => `<option value="${e.markingidx}">#${AbMath.displayNo(e)} ${esc(e.title)}${e.status !== 'running' ? ` (${e.status})` : ''}</option>`).join('');
    if (state.current) setPickerText(state.current);
    if (state.historyOpen) renderHistory();
  }
  function setPickerText(e) { setText('abExpPickerText', e ? `#${AbMath.displayNo(e)} · ${e.title}` : '실험 선택'); }
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  async function selectExperiment(m) {
    const e = state.experiments.find(x => x.markingidx === m); if (!e) return;
    if (!state.current || state.current.markingidx !== m) state.saSegment = 'all';   
    state.current = e;
    if (pageOf(e) !== state.abPage) {   
      if (AB_PAGES[state.page]) activateAbPage(pageOf(e)); else state.abPage = pageOf(e);
      if (state.loaded) { renderKpi(); renderLists(); fillSelect(); }
    }
    syncAbUrl();   
    setPickerText(e);
    state.scope = (e.default_scope || '1').split(',').map(Number);
    if (state.urlScope) { const sc = state.urlScope.split(',').map(Number).filter(n => [0, 1, 2].includes(n)); if (sc.length) state.scope = [...new Set(sc)].sort(); state.urlScope = null; }   
    const isRule = e.cohort_type === 'rule';
    $('isPairGroup').style.display = isRule ? 'none' : 'flex';   
    const help = $('abRuleHelp');
    help.style.display = isRule ? '' : 'none';
    help.textContent = isRule ? (m === 9106 ? '규칙 코호트 · 로그인 시점 상태로 편입' : m === 9108 || m === 9109 ? '규칙 코호트(광고) · 비결제자, 사전 매출 0' : '규칙 코호트 · SQL 규칙 대상자(칩 없음)') : '';   
    syncChips();
    renderInfo(e);   
    renderFreshness();
    if ($('abEditPanel').style.display !== 'none') fillEdit(e);   
    syncRecomputeNote();
    { const el = $('abDraftNote'); if (el) { const on = !!e.sql_is_draft; el.style.display = on ? 'block' : 'none'; if (on) el.innerHTML = `규칙 SQL <b>초안(검토 전)</b> — 초안 작성 도우미가 쓴 대상자 SQL 로 적재된 값입니다. <a href="/?page=rulecohort" style="color:#92400E;text-decoration:underline;">규칙 코호트 등록 탭</a>에서 근거를 보고 승인하거나 고치세요.`; } }   
    await loadSeries();
  }

  function renderInfo(e) {
    setText('param-mid-val', e ? String(e.markingidx) : '–');
    const tv = $('param-type-val'), tg = $('param-target-val'), sp = $('param-split-val'), st = $('param-state-val'); if (!tv) return;
    if (!e) { [tv, tg, sp, st].forEach(el => { el.textContent = '–'; el.classList.remove('muted'); el.removeAttribute('title'); }); return; }
    tv.textContent = (e.cohort_type === 'rule' ? 'Non-pairwise · SQL 규칙' : 'Pairwise · 마킹표') + (e.exp_kind === 'iaa' ? ' · 광고 매출 포함' : '');
    const target = (e.target_desc || '').trim();
    tg.textContent = target || '미입력 · 실험 편집에서 입력'; tg.classList.toggle('muted', !target); tg.title = target;   
    const cond = (e.split_desc || '').replace(/^\s*실험군\s*[:：]\s*/, '').trim();
    sp.innerHTML = cond ? `<code>${esc(cond)}</code>` : '–'; sp.classList.toggle('muted', !cond); sp.title = cond;   
    const res = e.result === 'adopted' ? ['pill-green', '완료 · 채택'] : e.result === 'rejected' ? ['pill-gray', '완료 · 기각'] : ['pill-amber', '완료 · 결과 미정'];
    st.innerHTML = e.status === 'running' ? '<span class="exp-status-running"><span class="dot-live"></span>진행중</span>'
      : e.status === 'done' ? `<span class="${res[0]}">${res[1]}</span>`
      : `<span class="pill-gray">${e.status === 'archived' ? '보관' : '후보'}</span>`;
  }
  function syncChips() { [0, 1, 2].forEach(i => $('isPairBtn' + i).classList.toggle('active', state.scope.includes(i))); }
  window.toggleIsPair = function (n) {
    if (!state.current || state.current.cohort_type === 'rule') return;
    const has = state.scope.includes(n);
    if (has && state.scope.length === 1) return;          
    state.scope = has ? state.scope.filter(x => x !== n) : [...state.scope, n].sort();
    syncChips(); loadSeries();
  };
  window.switchExpTab = function (tab) {
    state.expTab = tab; { const yt = $('expYearTabs'); if (yt) yt.style.display = (tab === 'done' && yt.innerHTML) ? 'inline-flex' : 'none'; }   
    $('expTabRunning').classList.toggle('active', tab === 'running');
    $('expTabDone').classList.toggle('active', tab === 'done');
    $('expListRunning').style.display = tab === 'running' ? '' : 'none';
    $('expListDone').style.display = tab === 'done' ? '' : 'none';
  };

  async function loadSeries() {
    const e = state.current; if (!e) return;
    const seq = ++state.seriesSeq;   
    const m = e.markingidx, scope = state.scope.slice(), key = seriesKey(m, scope);
    setBusy(!cache.has(key));        
    try {
      const { value: d } = await cache.load(key, () => api(seriesUrl(m, scope)),
        (fresh) => { if (seq === state.seriesSeq) { state.lastSeries = fresh; applySeries(fresh); } });   
      if (seq !== state.seriesSeq) return;
      state.lastSeries = d; status('');
      applySeries(d);
      schedulePrefetch();
    } catch (err) {
      if (seq !== state.seriesSeq) return;
      state.lastSeries = null;
      clearCharts();
      status(err.status === 404 ? `#${AbMath.displayNo(e)}: ${err.message} (D0 확정·추적 ON 후 다음 적재에 반영)` : `오류: ${err.message}`, err.status !== 404);
      ['rev', 'au', 'pur', 'arpu'].forEach(k => setText('abUplift-' + k, '–', COLORS.gray));
      setText('param-start-val', e.exposure_start_ts ? e.exposure_start_ts.slice(0, 16) : '미확정');
      setText('param-day-val', e.day_k == null ? '–' : `Day ${e.day_k}`, COLORS.brand);
      $('abPreGap').style.display = 'none';
    } finally {
      if (seq === state.seriesSeq) setBusy(false);
    }
  }

  function prefetchTargets() {
    const out = []; const cur = state.current;
    Object.keys(AB_PAGES).forEach(pg => {
      if (pg === state.abPage) return;
      const vis = state.experiments.filter(x => pageOf(x) === pg);
      const pick = vis.find(x => x.status === 'running') || vis[0];
      if (pick) out.push([pick.markingidx, (pick.default_scope || '1').split(',').map(Number)]);
    });
    if (cur && cur.cohort_type !== 'rule') [0, 1, 2].forEach(n => {
      const has = state.scope.includes(n); if (has && state.scope.length === 1) return;
      out.push([cur.markingidx, has ? state.scope.filter(x => x !== n) : [...state.scope, n].sort()]);
    });
    return out;
  }
  function schedulePrefetch() {
    const run = () => prefetchTargets().forEach(([m, scope]) => {
      cache.prefetch(seriesKey(m, scope), () => api(seriesUrl(m, scope)));
      cache.prefetch(saKey(m, scope, 'all'), () => api(saUrl(m, scope, 'all') + '&cached=1'));
    });
    if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(run, { timeout: 1500 }); else setTimeout(run, 300);
  }

  const RUN_LABEL = { QUEUED: '대기열', STARTING: '시작 중', STARTED: '적재 실행 중', SUCCESS: '적재 완료', FAILURE: '적재 실패', CANCELED: '취소됨' };
  function syncRecomputeNote() {
    const el = $('abRecomputeNote'), e = state.current, on = !!(e && e.needs_recompute);
    if (el) {
      el.style.display = on ? 'block' : 'none';   
      if (on) {
        el.innerHTML = `재계산 대기 중 — 설정·SQL 변경이 반영되려면 적재가 한 번 돌아야 합니다. 그동안 이전 값이 표시되고 완료되면 자동 갱신됩니다(즉시 재계산은 어제 00:00 UTC까지, 최신 하루는 14:10 KST 정기 적재가 채움). <span id="abRunState"></span> <button class="btn-mini" style="margin-left:6px;" onclick="recomputeNow()">지금 재계산</button>`;
        
        api(`/api/experiments/${e.markingidx}/runs/latest`).then(d => { const r = d.run, s = $('abRunState'); if (!s) return;
          s.textContent = r ? `런 ${RUN_LABEL[r.status] || r.status}${r.start_time ? ' · 시작 ' + new Date(r.start_time * 1000).toISOString().slice(11, 16) + ' UTC' : ''}` : '즉시 실행 런 없음 — 10분 센서가 받습니다'; }).catch(() => {});
      }
    }
    if (on && !state.pollTimer) state.pollTimer = setInterval(() => loadExperiments(true).catch(() => {}), 15000);   
    if (!on && state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
  }
  window.recomputeNow = async function () {
    const e = state.current; if (!e) return;
    try { const r = await api(`/api/experiments/${e.markingidx}/recompute`, { method: 'POST' }); status(`재계산 런 실행됨(${r.status})`); syncRecomputeNote(); }
    catch (err) { status(`재계산 실행 실패: ${err.message}`, true); }
  };

  function metricHasPre(d, k) {
    const idx0 = d.d_days.indexOf(0); if (idx0 <= 0) return false;
    const s = d.series[k]; if (!s) return false;   
    const pre = [...s.test.slice(0, idx0), ...s.cont.slice(0, idx0)];
    return pre.some(v => v != null && (k === 'au' || v !== 0));
  }
  function fullRolloutIdx(d) {
    const p = d.params || {}; const fd = p.full_rollout_d != null ? p.full_rollout_d : p.end_d;   
    return (fd == null) ? -1 : d.d_days.indexOf(fd);
  }
  
  function moneyShort(v) {
    if (v == null) return '–'; const a = Math.abs(v), sign = v < 0 ? '−' : '';
    const body = a >= 1e6 ? (a / 1e6).toFixed(2) + 'M' : a >= 1e3 ? (a / 1e3).toFixed(1) + 'K' : a.toFixed(2);
    return `${sign}$${body}`;
  }
  
  const SA_SEG = [['all', '전체'], ['new', '신규'], ['nonpayer', '비결제'], ['active', '활성 결제자'], ['dormant', '휴면 결제자']];
  const SA_ROWS = [['arpu', 'ARPU'], ['arppu', 'ARPPU'], ['pur', '결제율'], ['spins', '플레이/일'], ['ret1', '리텐션 D+1'], ['ret3', '리텐션 D+3'], ['ret7', '리텐션 D+7'], ['r0r1', 'R1/R0 이중차분']];   
  const IAP_NAME = { pur: 'IAP 결제율', arpu: 'IAP ARPU', arppu: 'IAP ARPPU' };   
  const SA_HEAD = '<thead><tr><th>지표</th><th>실험군</th><th>대조군</th><th>차이</th><th>95% CI / MDE</th><th>p</th><th>판정</th><th>효과 크기</th><th>원본(캡 없음)</th></tr></thead>';
  const saName = (name, small) => `<td class="name">${name}${small ? `<small>${small}</small>` : ''}</td>`;
  function renderSaFallback(err) {   
    const body = $('abSaBody'); if (!body) return;
    const hs = state.lastSeries && state.lastSeries.headlines; const msg = `<div class="ab-sa-empty">${esc(err && err.status === 404 ? err.message : '오류: ' + (err && err.message))}</div>`;
    const money = (v) => (v == null ? '–' : '$' + (+v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    const rows = ['arppu', 'ret1', 'ret3', 'ret7'].map(k => { const h = hs && hs[k]; if (!h) return '';
      const f = isRate(k) ? (v) => (v == null ? '–' : (+v).toFixed(2) + '%') : money;
      return `<tr>${saName((kindOf(state.current) === 'iaa' && IAP_NAME[k]) || VNAME[k], '')}<td>${f(h.test)}</td><td>${f(h.control)}</td><td style="color:${vcolor(h)};font-weight:700;">${vval(k, h)}</td><td class="muted">${h.mde == null ? '–' : 'MDE ' + (isRate(k) ? h.mde.toFixed(2) + '%p' : h.mde.toFixed(1) + '%')}</td><td>${h.p_value == null ? '–' : h.p_value < 0.001 ? '<0.001' : h.p_value.toFixed(3)}</td><td>${verdictPill(h, k === 'arppu' ? 'aux' : 'guard')}</td><td class="muted">${h.effect_size == null ? '–' : h.effect_kind + ' ' + h.effect_size.toFixed(3)}</td><td class="muted">–</td></tr>`; }).join('');
    body.innerHTML = msg + (rows ? `<div style="overflow:auto;"><table class="ab-sa">${SA_HEAD}<tbody>${rows}</tbody></table></div><div class="ab-sa-foot"><span class="muted">일 단위 요약(유저 단위 자료 적재 전)</span></div>` : '');
  }

  function saPending(body, hit) {
    if (hit) return () => {};
    const t = setTimeout(() => { body.innerHTML = '<div class="ab-sa-empty">유저 단위 자료 계산 중… 처음 계산하는 조합은 수십 초~수 분 걸립니다(한 번 계산하면 다음 적재 전까지 바로 뜹니다)</div>'; }, 150);
    return () => clearTimeout(t);
  }
  function showSa(d) {
    state.sa = d; renderSa(d);
    if (state.lastSeries && !state.lastSeries.ad && state.lastSeries.m_rate) renderMrate(state.lastSeries.m_rate);   
  }
  async function loadSa() {
    const e = state.current; const body = $('abSaBody'); if (!e || !body) return;
    const seq = ++state.saSeq; const seg = state.saSegment || 'all';
    const m = e.markingidx, scope = state.scope.slice(), key = saKey(m, scope, seg);
    const done = saPending(body, cache.has(key));
    try {
      const { value: d } = await cache.load(key, () => api(saUrl(m, scope, seg)), (fresh) => { if (seq === state.saSeq) showSa(fresh); });
      if (seq !== state.saSeq) return;   
      showSa(d);
    } catch (err) {
      if (seq !== state.saSeq) return;
      state.sa = null; renderSaSeg(null); renderSaFallback(err);
      const n = $('abSaNote'); if (n) n.style.display = 'none';
    } finally {
      done();
    }
  }
  function renderSaSeg(d) {   
    const box = $('abSaSeg'); if (!box) return;
    const cur = state.saSegment || 'all';
    box.innerHTML = SA_SEG.map(([k, l]) => { const n = d && d.segments ? (d.segments[k] || 0) : null; const off = n === 0 && k !== 'all';   
      return `<button class="ab-chip${k === cur ? ' active' : ''}" data-seg="${k}"${off ? ' disabled style="opacity:.45;cursor:not-allowed;"' : ''}>${l}${n != null ? ` <span class="muted">${n.toLocaleString()}</span>` : ''}</button>`; }).join('');
    box.querySelectorAll('[data-seg]').forEach(b => b.addEventListener('click', () => { state.saSegment = b.dataset.seg; renderSaSeg(state.sa); loadSa(); }));
  }
  function renderSa(d) {
    const body = $('abSaBody'); if (!body) return;
    renderSaSeg(d);
    const note = $('abSaNote'); if (note) { note.style.display = ''; note.className = 'ab-pill'; note.textContent = `유저 자료 ${kstLabel(d.computed_at)} · 실험군 ${d.n_test.toLocaleString()} · 대조군 ${d.n_cont.toLocaleString()} · B ${d.B.toLocaleString()}${d.ad && d.ad.asof ? ` · 광고 ${String(d.ad.asof).slice(5)} 까지` : ''}`; }
    const money = (v, dec = 2) => (v == null ? '–' : '$' + (+v).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }));
    const pct = (v, dec = 2) => (v == null ? '–' : (+v).toFixed(dec) + '%');
    const num = (v, dec = 1) => (v == null ? '–' : (+v).toLocaleString(undefined, { minimumFractionDigits: dec, maximumFractionDigits: dec }));
    const pv = (p) => (p == null ? '–' : p < 0.001 ? '<0.001' : p.toFixed(3));
    const labelPill = (label, neg, guard) => guard ? `<span class="ab-pill" title="${esc(guard)}">${esc(guard)}</span>`
      : label === '유의' ? `<span class="ab-pill ${neg ? 'down' : 'up'}">${neg ? '유의(악화)' : '유의'}</span>` : label === '경계' ? `<span class="ab-pill partial">경계</span>` : `<span class="ab-pill">${esc(label || '검정 없음')}</span>`;
    const signed = (v, f) => (v == null ? '–' : AbMath.fmtSigned(v, f));
    const diffColor = (v, label) => (v == null ? '#111' : sigColor(label, v, '#111'));   
    const m = d.metrics || {};   
    const adRows = m.tarpu ? [['tarpu', 'Total ARPU'], ['adrev', '광고 매출/유저 (전면+리워드)'], ['ad_is', '전면광고 매출/유저'], ['ad_rv', '리워드 광고 매출/유저']] : [];   
    const saRows = m.tarpu ? SA_ROWS.map(([k, name]) => [k, IAP_NAME[k] || name]) : SA_ROWS;   
    const rows = [...adRows, ...saRows].map(([k, name]) => {
      const x = m[k]; if (!x) return '';
      if (k === 'r0r1') {   
        if (!x.applicable) return `<tr>${saName(name, '')}<td colspan="8" class="muted">${esc(x.reason || '불가')} (R0 결제자 ${x.n_test.toLocaleString()} / ${x.n_cont.toLocaleString()})</td></tr>`;
        const neg = x.did_pct < 0;
        return `<tr>${saName(name, `R0 결제자 ${x.n_test.toLocaleString()} / ${x.n_cont.toLocaleString()} · 캡 R0 ${money(x.cut_r0, 0)} · R1 ${money(x.cut_r1, 0)}`)}
          <td>${num(x.ratio_test, 4)}</td><td>${num(x.ratio_cont, 4)}</td><td style="color:${diffColor(x.did_pct, x.label)};font-weight:700;">${signed(x.did_pct, (v) => v.toFixed(2) + '%')}</td>
          <td class="muted">[${signed(x.ci_low, (v) => v.toFixed(2) + '%')}, ${signed(x.ci_high, (v) => v.toFixed(2) + '%')}]</td><td>${pv(x.p)}</td><td>${labelPill(x.label, neg)}</td>
          <td class="muted">환산 손익 ${signed(x.benefit, (v) => '$' + Math.round(v).toLocaleString())}</td><td class="muted">${signed(x.raw_did_pct, (v) => v.toFixed(2) + '%')}</td></tr>`;
      }
      if (k === 'pur' || k.startsWith('ret')) {   
        const neg = x.diff_pp != null && x.diff_pp < 0;
        return `<tr>${saName(name, k.startsWith('ret') ? `${x.n_test.toLocaleString()} / ${x.n_cont.toLocaleString()}명` : '')}
          <td>${pct(x.test)}</td><td>${pct(x.cont)}</td><td style="color:${diffColor(x.diff_pp, x.guard ? null : x.label)};font-weight:700;">${signed(x.diff_pp, (v) => v.toFixed(2) + '%p')}</td>
          <td class="muted">MDE ${x.mde_pp == null ? '–' : x.mde_pp.toFixed(2) + '%p'}</td><td>${pv(x.p)}</td><td>${labelPill(x.label, neg, x.guard)}</td>
          <td class="muted">h ${x.effect_h == null ? '–' : x.effect_h.toFixed(3)}</td><td class="muted">–</td></tr>`;
      }
      const w = x.winsor || {}, r = x.raw || {}; const neg = w.uplift_pct != null && w.uplift_pct < 0;   
      const fmt = k === 'spins' ? (v) => num(v, 1) : (v) => money(v);
      const extra = [w.cut != null ? `캡 ${fmt(w.cut)}${x.cap_note ? '(' + x.cap_note + ')' : ''}` : '', k === 'arppu' && x.n_test != null ? `결제자 ${x.n_test.toLocaleString()} / ${x.n_cont.toLocaleString()}` : '',
        k === 'tarpu' && x.n_test != null ? `광고 코호트 ${x.n_test.toLocaleString()} / ${x.n_cont.toLocaleString()}` : '',
        x.pre_uplift_pct != null ? `사전 ${fmtPct(x.pre_uplift_pct)} → 보정 ${x.did_pct == null ? '–' : fmtPct(x.did_pct)}` : ''].filter(Boolean).join(' · ');   
      return `<tr>${saName(name, extra)}
        <td>${fmt(w.test)}</td><td>${fmt(w.cont)}</td><td style="color:${diffColor(w.uplift_pct, w.guard ? null : w.label)};font-weight:700;">${k === 'ad_is' && w.test != null && w.cont != null ? signed(w.test - w.cont, fmt) + '/유저' : signed(w.uplift_pct, (v) => v.toFixed(2) + '%')}</td>
        <td class="muted">[${w.ci_low == null ? '–' : signed(w.ci_low, fmt)}, ${w.ci_high == null ? '–' : signed(w.ci_high, fmt)}]</td><td>${pv(w.p)}</td><td>${labelPill(w.label, neg, w.guard)}</td>
        <td class="muted">d ${w.effect_d == null ? '–' : w.effect_d.toFixed(3)}</td><td class="muted">${fmt(r.test)} / ${fmt(r.cont)} (${signed(r.uplift_pct, (v) => v.toFixed(2) + '%')})</td></tr>`;
    }).join('');
    const b = d.balance || {}; const r0 = b.r0, dt = b.d0_timing;
    const foot = [
      r0 && !r0.payer_share_test && !r0.payer_share_cont ? `<span><span class="ab-pill">사전 결제 없음</span> <span class="muted">비결제 코호트 — R0 균형·R1/R0 해당 없음</span></span>` :   
      r0 ? `<span>${r0.ok ? '<span class="ab-pill ok">R0 균형 OK</span>' : '<span class="ab-pill down">R0 불균형</span>'} 결제자 비율 <b>${pct(r0.payer_share_test, 1)}</b> / <b>${pct(r0.payer_share_cont, 1)}</b> (p ${pv(r0.payer_share_p)}) · 1인당 R0 평균 차이 <b>${signed(r0.mean_ratio_pct, (v) => v.toFixed(1) + '%')}</b> · SMD <b>${r0.smd == null ? '–' : r0.smd.toFixed(3)}</b></span>` : '',
      dt ? `<span>${dt.ok ? '<span class="ab-pill ok">D0 타이밍 OK</span>' : '<span class="ab-pill partial">D0 타이밍 차이</span>'} 시작→D0 평균 <b>${num(dt.mean_days_test, 1)}일</b> / <b>${num(dt.mean_days_cont, 1)}일</b> · 3일 내 편입 <b>${pct(dt.within3_test, 1)}</b> / <b>${pct(dt.within3_cont, 1)}</b></span>` : '',
    ].filter(Boolean).join('');
    body.innerHTML = `<div style="overflow:auto;"><table class="ab-sa">${SA_HEAD}<tbody>${rows}</tbody></table></div><div class="ab-sa-foot">${foot}</div>`;
  }

  const VNAME = { rev: '누적 매출', au: 'AU 평균', pur: '결제율', arpu: 'ARPU', arppu: 'ARPPU', ret1: '리텐션 D+1', ret3: '리텐션 D+3', ret7: '리텐션 D+7', tarpu: 'Total ARPU', adrev: '광고 매출/유저', ad_is: '전면광고 매출/유저', ad_rv: '리워드 광고 매출/유저' };
  const isRate = (k) => k === 'pur' || k.startsWith('ret');
  const pLabel = (p) => (p == null ? null : p < 0.001 ? 'p <0.001' : 'p ' + p.toFixed(3));
  
  function verdictPill(h, role) {
    if (!h) return '';
    if (h.guard) return `<span class="ab-pill" title="${esc(h.guard)}">${esc(h.guard)}</span>`;
    const bad = h.uplift_pct != null && h.uplift_pct < 0;
    if (h.label === '유의') return `<span class="ab-pill ${bad ? 'down' : 'up'}">${role === 'guard' ? (bad ? '악화' : '양호') : (bad ? '유의(악화)' : '유의')}</span>`;
    if (h.label === '경계') return `<span class="ab-pill partial">${role === 'guard' && bad ? '악화 경계' : '경계'}</span>`;
    if (!h.label || h.label === '검정 없음') return role === 'guard' ? '' : `<span class="ab-pill">검정 없음</span>`;
    return `<span class="ab-pill">비유의</span>`;
  }
  const vval = (k, h) => { if (!h || h.uplift_pct == null) return '–'; if (isRate(k) && h.test != null && h.control != null) return AbMath.fmtSigned(h.test - h.control, (v) => v.toFixed(2) + '%p'); return fmtPct(h.uplift_pct); };
  const vcolor = (h) => (!h || h.guard || h.uplift_pct == null ? '#6B7280' : sigColor(h.label, h.uplift_pct));   
  
  function renderAdStrip(d) {
    const a = d.ad; if (!a) { renderMrate(null); return; }
    const t = a.test, c = a.cont;
    const m = (v) => (v == null ? '–' : '$' + (Math.abs(v) >= 1 ? (+v).toFixed(2) : (+v).toFixed(3)));
    const th = d.headlines && d.headlines.tarpu, tlab = th && !th.guard ? th.label : null;   
    const col = (v, lab = tlab) => sigColor(lab, v, '#111');
    const setBar = (id, v, max) => { const el = $(id); if (el) el.style.width = (v == null || !max) ? '0%' : `${Math.max(0, Math.min(100, v / max * 100)).toFixed(1)}%`; };
    setText('abMrateTitle', 'Total ARPU · 광고 포함');
    { const info = $('abMrateInfo'); if (info) { info.dataset.guide = 'iaa'; info.title = 'Total ARPU = (IAP + 전면광고 + 리워드 광고) ÷ 광고 코호트 유저 수(광고 매출 도착일 전 편입) · D0 이후 누적 · 광고 매출은 약 2일 지연 — 가이드 §8(클릭)'; } }
    setText('abMrateTLabel', '실험군 Total ARPU'); setText('abMrateCLabel', '대조군 Total ARPU'); setText('abMrateDiffLabel', '차이(실험군−대조군)');
    { const bt = $('abMrateBLabel') && $('abMrateBLabel').closest('.ab-mrate-tile'); if (bt) bt.style.display = 'none'; }   
    const max = Math.max(t ? t.tarpu : 0, c ? c.tarpu : 0) || 1;
    const side = (id, g) => { setText(id, g ? m(g.tarpu) : '–', '#111'); setBar(id + 'Bar', g ? g.tarpu : null, max);
      $(id + 'Sub').innerHTML = g ? `<b>${g.users.toLocaleString()}명</b> · 전면 ${(+g.is_pu).toFixed(3)} · 리워드 ${(+g.rv_pu).toFixed(3)} · IAP ${(+g.iap_pu).toFixed(3)}` : ''; };   
    side('abMrateT', t); side('abMrateC', c);
    setText('abMrateDiff', a.diff == null ? '–' : AbMath.fmtSigned(a.diff, m) + (a.diff > 0 ? ' ▲' : a.diff < 0 ? ' ▼' : ''), a.diff == null ? '#111' : col(a.diff));
    const pill = $('abMrateDiffPill');
    if (pill) { pill.style.display = a.uplift_pct == null ? 'none' : ''; pill.className = sigPillClass(tlab, a.uplift_pct); pill.textContent = a.uplift_pct == null ? '' : `대조군 대비 ${AbMath.fmtSigned(a.uplift_pct, (v) => v.toFixed(1) + '%')}`; }
    const h = d.headlines && d.headlines.tarpu;
    $('abMrateDiffSub').innerHTML = h && h.p_value != null ? `${pLabel(h.p_value)} · ${esc(h.label || '')}` : (h && h.guard ? esc(h.guard) : '');
    const money0 = (v) => '$' + Math.round(v).toLocaleString();
    { const tile = $('abMrateTotTile');   
      if (tile) { tile.style.display = ''; setText('abMrateTotLabel', '누적 총매출 차이 · IAP + 광고');
        setText('abMrateTot', a.tot_diff == null ? '–' : AbMath.fmtSigned(a.tot_diff, money0) + (a.tot_diff > 0 ? ' ▲' : a.tot_diff < 0 ? ' ▼' : ''), a.tot_diff == null ? '#111' : col(a.tot_diff));
        $('abMrateTotSub').innerHTML = (t && c) ? `실험군 <b>${money0(t.tot_rev)}</b> · 대조군 <b>${money0(c.tot_rev)}</b>${a.tot_uplift_pct == null ? '' : ` (${fmtPct(a.tot_uplift_pct)})`}` : ''; } }

    { const rk = retHeadKey(d.headlines), rh = d.headlines && d.headlines[rk];
      setText('abMrateRLabel', `리텐션 D+${rk.slice(3)}`);
      const ok = rh && rh.test != null && rh.control != null, dpp = ok ? rh.test - rh.control : null;
      setText('abMrateR0', ok ? AbMath.fmtSigned(dpp, (v) => v.toFixed(2) + '%p') + (dpp > 0 ? ' ▲' : dpp < 0 ? ' ▼' : '') : (rh && rh.guard) || '–', ok ? col(dpp, rh.guard ? null : rh.label) : '#111');
      $('abMrateR0Sub').innerHTML = ok ? `<b>${rh.test.toFixed(2)}%</b> vs <b>${rh.control.toFixed(2)}%</b>${rh.p_value != null ? ' · ' + pLabel(rh.p_value) : ''} ${verdictPill(rh, 'guard')}` : ''; }   
    
    { const aux = $('abMrateAux'); if (aux) { if (!t || t.ecpm_recent == null) aux.style.display = 'none'; else { aux.style.display = ''; aux.className = 'ab-pill';
          aux.textContent = `도달 ${t.reach_pct.toFixed(1)}% · eCPM $${t.ecpm_recent.toFixed(1)}${t.ecpm_first == null ? '' : ` (1일차 $${t.ecpm_first.toFixed(1)})`}`;
          aux.title = `전면광고 — 도달 = D0 이후 1회 이상 본 실험군 유저 비율 · eCPM = 매출 ÷ 노출 × 1,000(최근 3일, 1일차와 비교해 단가 추세) · 노출 ${Math.round(t.is_imp).toLocaleString()}회 — 가이드 §8`; } } }
    { const b = $('abMrateBalance'); if (b) { const bal = a.rv_pre_balance;   
        if (!bal) b.style.display = 'none'; else { b.style.display = ''; b.className = 'ab-pill ' + (bal.ok ? 'ok' : 'down'); b.textContent = `사전 리워드 균형 ${bal.ok ? 'OK' : '어긋남'} ${AbMath.fmtSigned(bal.ratio_pct, (v) => v.toFixed(1) + '%')}`;
          b.title = `D−28~D−1 리워드 광고 매출/유저 실험군 ${m(bal.test)} · 대조군 ${m(bal.cont)}${bal.ok ? '' : ' — 리워드 잠식은 세부 분석의 보정값으로 볼 것'}`; } } }
    { const note = $('abMrateNote'); if (note) { note.style.display = ''; note.className = 'ab-pill partial'; note.textContent = `광고 매출 ${a.ad_asof ? String(a.ad_asof).slice(5) : '–'} 까지 · D0~D+${a.last_d}`; } }
  }
  function renderMrate(m) {
    const ids = ['abMrateT', 'abMrateC', 'abMrateDiff', 'abMrateBenefit', 'abMrateR0'];
    if (!$('abMrateT')) return;
    { const tile = $('abMrateTotTile'); if (tile) tile.style.display = 'none';   
      const bt = $('abMrateBLabel') && $('abMrateBLabel').closest('.ab-mrate-tile'); if (bt) bt.style.display = '';   
      const aux = $('abMrateAux'); if (aux) aux.style.display = 'none'; }   
    setText('abMrateTitle', '매출 유지율 R1/R0'); setText('abMrateBLabel', '기대 매출 효과'); setText('abMrateRLabel', 'R0 합계');   
    { const info = $('abMrateInfo'); if (info && info.dataset.guide !== 'r0r1') { info.dataset.guide = 'r0r1'; info.title = 'R0 = 유저별 D0 전 28일 매출 · R1 = D0 후 28일 매출 · R1/R0 = 집단 매출 유지율 — 가이드 §3(클릭)'; } }
    const note = $('abMrateNote'), pill = $('abMrateDiffPill');
    const setBar = (id, v, max) => { const el = $(id); if (el) el.style.width = (v == null || !max) ? '0%' : `${Math.max(0, Math.min(100, v / max * 100)).toFixed(1)}%`; };
    if (!m || (!m.test && !m.cont)) {
      ids.forEach(id => { setText(id, '–', '#111'); setText(id + 'Sub', ''); }); setBar('abMrateTBar', null, 1); setBar('abMrateCBar', null, 1);
      if (pill) { pill.textContent = ''; pill.className = 'ab-pill'; pill.style.display = 'none'; }
      if (note) { note.textContent = ''; note.className = 'ab-pill'; note.style.display = 'none'; }
      { const b = $('abMrateBalance'); if (b) b.style.display = 'none'; }
      return;
    }
    const t = m.test || {}, c = m.cont || {};
    const ratio = (v) => (v == null ? '–' : (+v).toFixed(4));
    
    const r = (state.sa && state.sa.metrics && state.sa.metrics.r0r1 && (state.saSegment || 'all') === 'all') ? state.sa.metrics.r0r1 : null;
    const rlab = r && r.applicable ? r.label : null;
    const col = (v) => sigColor(rlab, v, '#111');
    const arrow = (v) => (v > 0 ? ' ▲' : v < 0 ? ' ▼' : '');
    const noR0 = t.m_rate == null && c.m_rate == null && (t.r0 || 0) === 0 && (c.r0 || 0) === 0;   
    setText('abMrateTLabel', noR0 ? '실험군 R1 (R0 = 0)' : '실험군 R1/R0'); setText('abMrateCLabel', noR0 ? '대조군 R1 (R0 = 0)' : '대조군 R1/R0');
    setText('abMrateDiffLabel', noR0 ? 'R1 차이(실험군−대조군)' : '차이(실험군−대조군)');
    const side = (id, g) => {
      setText(id, noR0 ? moneyShort(g.r1) : (g.m_rate == null ? '–' : ratio(g.m_rate)), '#111');
      $(id + 'Sub').innerHTML = g.users == null ? '' : `<b>${g.users.toLocaleString()}명</b> · R1 ${moneyShort(g.r1)} / R0 ${moneyShort(g.r0)}` + (!noR0 && g.m_rate == null ? ' · R0 없음' : '');
    };
    side('abMrateT', t); side('abMrateC', c);
    if (noR0) {
      const r1max = Math.max(t.r1 || 0, c.r1 || 0) || 1;                 
      setBar('abMrateTBar', t.r1, r1max); setBar('abMrateCBar', c.r1, r1max);
      const d = (t.r1 != null && c.r1 != null) ? t.r1 - c.r1 : null;
      setText('abMrateDiff', d == null ? '–' : AbMath.fmtSigned(d, (v) => '$' + Math.round(v).toLocaleString()) + arrow(d), d == null ? '#111' : col(d));
      if (pill) { const rel = (d != null && c.r1) ? d / c.r1 * 100 : null; pill.style.display = rel == null ? 'none' : ''; pill.className = sigPillClass(rlab, rel); pill.textContent = rel == null ? '' : `대조군 대비 ${AbMath.fmtSigned(rel, (v) => v.toFixed(1) + '%')}`; }
      $('abMrateDiffSub').innerHTML = '';
      setText('abMrateBenefit', '–', '#111'); $('abMrateBenefitSub').innerHTML = 'R0 = 0 · 정의 불가';   
    } else {
      const barMax = Math.max(1, t.m_rate || 0, c.m_rate || 0);          
      setBar('abMrateTBar', t.m_rate, barMax); setBar('abMrateCBar', c.m_rate, barMax);
      setText('abMrateDiff', m.diff == null ? '–' : AbMath.fmtSigned(m.diff, (v) => v.toFixed(4)) + arrow(m.diff), m.diff == null ? '#111' : col(m.diff));
      if (pill) {
        const rel = (m.diff != null && c.m_rate) ? m.diff / c.m_rate * 100 : null;
        pill.style.display = rel == null ? 'none' : ''; pill.className = sigPillClass(rlab, rel);
        pill.textContent = rel == null ? '' : `대조군 대비 ${AbMath.fmtSigned(rel, (v) => v.toFixed(1) + '%')}`;
      }
      $('abMrateDiffSub').innerHTML = (r && r.applicable && r.p != null) ? `${pLabel(r.p)} · ${esc(r.label || '')}` : '';   
      
      const sb = m.sa_benefit != null ? m.sa_benefit : m.rev_benefit;
      setText('abMrateBenefit', sb == null ? '–' : AbMath.fmtSigned(sb, (v) => '$' + Math.round(v).toLocaleString()), sb == null ? '#111' : col(sb));
      $('abMrateBenefitSub').innerHTML = (m.rev_benefit != null && m.sa_benefit != null) ? `비율 차 × ΣR0 ${moneyShort(m.rev_benefit)}` : '';   
    }
    setText('abMrateR0', moneyShort(m.r0_total), '#111');
    $('abMrateR0Sub').innerHTML = `실험군 ${moneyShort(t.r0)} + 대조군 ${moneyShort(c.r0)}`;
    { const b = $('abMrateBalance'); if (b) { const bal = m.balance;   
        if (!bal) { b.style.display = 'none'; } else { b.style.display = ''; b.className = 'ab-pill ' + (bal.ok ? 'ok' : 'down');
          b.textContent = `R0 균형 ${bal.ok ? 'OK' : '어긋남'} ${AbMath.fmtSigned(bal.r0_per_user_ratio_pct, (v) => v.toFixed(1) + '%')}`;
          b.title = bal.ok ? '실험군·대조군의 1인당 사전 28일 매출이 ±5% 안 — R0/R1 비교를 그대로 쓸 수 있다' : '1인당 사전 매출이 5% 넘게 다르다 — R0/R1 결과는 참고용(SA 4.3)'; } } }
    if (note) {
      note.style.display = ''; note.className = 'ab-pill ' + (m.partial ? 'partial' : 'ok');
      note.textContent = m.partial ? `R1 창 ${m.post_days}/${m.window}일 · 부분값` : `R1 창 ${m.window}일 완결`;
    }
  }
  function applySeries(d) {
    ensureCharts(d.params && d.params.exp_kind === 'iaa' ? 'iaa' : 'iap');   
    renderCharts(d);

    if (state.current) state.sa = cache.get(saKey(state.current.markingidx, state.scope, state.saSegment)) || null;
    if (d.ad) renderAdStrip(d); else renderMrate(d.m_rate);
    loadSa();   
    if (detail.open) renderDetail();   
    const primary = (d.params && d.params.primary_metric) || 'arpu';
    SLOTS.forEach(slot => {   
      const k = slotMetric(slot, d.params && d.params.exp_kind === 'iaa' ? 'iaa' : 'iap');
      const hk = k === 'ret' ? retHeadKey(d.headlines) : k;   
      const h = d.headlines[hk]; const pe = $('abChartPill-' + slot), pp = $('abChartP-' + slot);
      if (!h) { setText('abUplift-' + slot, '–', COLORS.gray); if (pe) pe.innerHTML = ''; if (pp) pp.textContent = ''; return; }
      
      const absDiff = k === 'ad_is' && h.test != null && h.control != null;
      const ppDiff = k === 'ret' && h.test != null && h.control != null;
      const txt = h.uplift_pct == null ? (h.guard || '–')
        : (absDiff ? AbMath.fmtSigned(h.test - h.control, fmt.arpu) + '/유저' : ppDiff ? `D+${hk.slice(3)} ` + AbMath.fmtSigned(h.test - h.control, (v) => v.toFixed(2) + '%p') : fmtPct(h.uplift_pct)) + (h.guard ? ` (${h.guard})` : '');
      setText('abUplift-' + slot, txt, h.uplift_pct == null ? COLORS.gray : sigColor(h.guard ? null : h.label, h.uplift_pct, COLORS.gray));   
      if (pe) pe.innerHTML = verdictPill(h, isLevel(k) ? 'guard' : (k === primary ? 'main' : 'aux'));
      if (pp) pp.textContent = h.guard ? '' : (pLabel(h.p_value) || '');
    });
    const p = d.params;
    if (p.full_rollout_utc) {
      const future = p.full_rollout_d != null && p.day_k != null && p.full_rollout_d > p.day_k;
      $('param-rollout-val').innerHTML = `${esc(p.full_rollout_utc)} UTC<br><span style="font-size:10px;color:${future ? '#D97706' : '#9CA3AF'};font-weight:500;">${future ? '전면 적용 예정 · ' : '전면 적용 · '}D+${p.full_rollout_d}</span>`;   
    } else if (p.end_utc) {
      $('param-rollout-val').innerHTML = `${esc(p.end_utc)} UTC<br><span style="font-size:10px;color:#9CA3AF;font-weight:500;">${p.result === 'rejected' ? '중단 · ' : '종료 · '}D+${p.end_d}</span>`;
    } else $('param-rollout-val').textContent = '–';
    $('param-start-val').innerHTML = `${esc(p.start_utc)} UTC<br><span style="font-size:10px;color:#9CA3AF;font-weight:500;">${esc(p.start_kst)} KST</span>`;
    
    const endD = p.full_rollout_d != null ? p.full_rollout_d : p.end_d;
    if (p.status === 'done' && endD != null && endD <= p.day_k) setText('param-day-val', `${endD}일 진행 후 종료`, '#374151');
    else setText('param-day-val', `Day ${p.day_k}`, COLORS.brand);
    const pg = $('abPreGap');
    if (d.pre_gap && d.pre_gap.flagged) {
      pg.style.display = '';
      pg.innerHTML = `<span class="ab-badge-warn">사전 불균형 (D−1 격차 ${fmtPct(d.pre_gap.uplift_pct)})</span>`;
    } else pg.style.display = 'none';
  }

  const AXIS_W = 50;                 
  const SURFACE = '#FFFFFF';         
  const HAIRLINE = '#EEF0F3';        
  const lastIndex = (arr) => { for (let i = arr.length - 1; i >= 0; i--) if (arr[i] != null) return i; return -1; };
  
  const diffText = (kind, t, c) => { const d = t - c; const rel = (c && kind !== 'ad_is' && kind !== 'ret') ? ` (${fmtPct((t / c - 1) * 100)})` : ''; const abs = fmt[kind](Math.abs(d)); return `${d < 0 ? '−' : '+'}${isRateKind(kind) ? abs + 'p' : abs}${rel}`; };   

  function decimalsFor(step) { let s = Math.abs(step), d = 0; while (d < 6 && Math.abs(Math.round(s) - s) > 1e-9) { s *= 10; d++; } return d; }
  
  function axisLabel(kind, v, step, maxAbs, signed) {
    if (v === 0) return '0';
    const sign = v < 0 ? '−' : (signed ? '+' : ''), a = Math.abs(v);
    if (isRateKind(kind)) return sign + a.toFixed(decimalsFor(step)) + (signed ? '%p' : '%');   
    if (kind === 'rel') return sign + a.toFixed(decimalsFor(step)) + '%';                     
    const [div, suf] = maxAbs >= 1e6 ? [1e6, 'M'] : maxAbs >= 1e3 ? [1e3, 'K'] : [1, ''];
    const num = (a / div).toFixed(decimalsFor(step / div)) + suf;
    return sign + (kind === 'au' ? num : '$' + num);
  }
  const axisTickCb = (kind, signed) => function (val, idx, ticks) {
    if (val == null) return '';
    const vals = ticks.map(t => t.value);
    const step = vals.length > 1 ? Math.abs(vals[1] - vals[0]) : (Math.abs(val) || 1);
    return axisLabel(kind, val, step, Math.max(...vals.map(Math.abs)), signed);
  };
  
  function xTickCb(val, idx) {
    const labels = this.chart.data.labels, n = labels.length, last = n - 1, d0 = labels.indexOf('D0');
    const step = n <= 8 ? 1 : n <= 20 ? 2 : n <= 45 ? 7 : 14;
    if (idx === last || idx === d0) return labels[idx];
    const gap = Math.max(1, Math.ceil(step / 2));
    if (last - idx < gap || (d0 >= 0 && Math.abs(idx - d0) < gap)) return '';
    return (idx - Math.max(0, d0)) % step === 0 ? labels[idx] : '';
  }

  function renderCharts(d) {
    const idx0 = d.d_days.indexOf(0);
    const ri = fullRolloutIdx(d), rolloutLabel = ri >= 0 ? fmtD(d.d_days[ri]) : null;   
    const anyPre = SLOTS.some(slot => metricHasPre(d, state.charts[slot].metric));
    SLOTS.forEach(k0 => {   
      const { main, strip, metric: k } = state.charts[k0]; const s = d.series[k];
      if (!s) { [main, strip].forEach(ch => { ch.data.labels = []; ch.data.datasets.forEach(ds => ds.data = []); ch.update('none'); }); setText('abDiffLast-' + k0, '–'); return; }
      const hasPre = metricHasPre(d, k), start = (hasPre || idx0 < 0) ? 0 : idx0;
      const labels = d.d_days.slice(start).map(fmtD);
      main.$abHasPre = hasPre; strip.$abHasPre = hasPre;                               
      const test = s.test.slice(start), cont = s.cont.slice(start);
      const diff = test.map((t, i) => (t == null || cont[i] == null) ? null : t - cont[i]);
      main.data.labels = labels; main.data.datasets[0].data = test; main.data.datasets[1].data = cont; main.$abRolloutLabel = rolloutLabel;
      
      main.options.scales.y.min = AbMath.autoMin([...test, ...cont]);   
      strip.data.labels = labels; strip.data.datasets[0].data = diff; strip.$abRolloutLabel = rolloutLabel;

      main.update('none'); strip.update('none');

      const li = lastIndex(diff), el = $('abDiffLast-' + k0);
      if (el) el.innerHTML = li < 0 ? '–'
        : `<span style="display:inline-block;width:6px;height:6px;border-radius:50%;background:${diff[li] >= 0 ? DIFF_HUE[k].line : DIFF_HUE[k].dark};margin-right:5px;vertical-align:1px;"></span>${isLevel(k) ? labels[li] + ' 당일 · ' : labels[li] + '까지 · '}${diff[li] >= 0 ? '실험군' : '대조군'} 우세 ${diffText(k, test[li], cont[li])}`;
    });
    setText('abPreLegend', anyPre ? '실험 전 구간 (D−28~D−1)' : '실험 전 구간 없음');
  }
  function clearCharts() {
    renderMrate(null); state.saSeq++; state.sa = null; renderSaSeg(null); { const b = $('abSaBody'); if (b) b.innerHTML = '<div class="ab-sa-empty">–</div>'; const n = $('abSaNote'); if (n) n.style.display = 'none'; }
    if (detail.open) renderDetail();   
    if (!state.chartsInited) return;
    Object.values(state.charts).forEach(({ main, strip }) => [main, strip].forEach(ch => { ch.data.labels = []; ch.data.datasets.forEach(ds => ds.data = []); ch.update('none'); }));
    SLOTS.forEach(k => setText('abDiffLast-' + k, '–'));
  }

  const abSplitPlugin = {
    id: 'abSplit',
    beforeDraw(chart) {
      const { ctx, chartArea, scales } = chart;
      if (!chartArea || !scales.x || !chart.data.labels.includes('D0')) return;
      const d0Px = scales.x.getPixelForValue('D0');
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.032)';
      ctx.fillRect(chartArea.left, chartArea.top, d0Px - chartArea.left, chartArea.bottom - chartArea.top);
      ctx.strokeStyle = 'rgba(99,102,241,0.45)'; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
      ctx.beginPath(); ctx.moveTo(d0Px, chartArea.top); ctx.lineTo(d0Px, chartArea.bottom); ctx.stroke();
      
      if (chart.$abRolloutLabel && chart.data.labels.includes(chart.$abRolloutLabel)) {
        const rPx = scales.x.getPixelForValue(chart.$abRolloutLabel);
        ctx.strokeStyle = 'rgba(217,119,6,0.7)'; ctx.lineWidth = 1.5; ctx.setLineDash([3.5, 2.5]);
        ctx.beginPath(); ctx.moveTo(rPx, chartArea.top); ctx.lineTo(rPx, chartArea.bottom); ctx.stroke();
      }
      ctx.restore();
    }
  };
  
  const abLinkPlugin = {
    id: 'abLink',
    afterEvent(chart, args) {
      const link = chart.$abLink; if (!link) return;
      const ev = args.event; let idx = null;
      if (ev.type !== 'mouseout') { const els = chart.getElementsAtEventForMode(ev, 'index', { intersect: false }, false); if (els.length) idx = els[0].index; }
      if (link.hoverIdx === idx) return;
      link.hoverIdx = idx; args.changed = true;
      if (chart === link.strip) {
        const main = link.main;
        const act = idx == null ? [] : [0, 1].filter(di => main.data.datasets[di].data[idx] != null).map(di => ({ datasetIndex: di, index: idx }));
        main.tooltip.setActiveElements(act, { x: idx == null ? 0 : main.scales.x.getPixelForValue(idx), y: main.chartArea.top });
        main.update('none');
      } else link.strip.draw();
    },
    afterDatasetsDraw(chart) {
      const link = chart.$abLink; if (!link || link.hoverIdx == null) return;
      const { ctx, chartArea, scales } = chart; const x = scales.x.getPixelForValue(link.hoverIdx);
      ctx.save(); ctx.strokeStyle = 'rgba(17,24,39,0.22)'; ctx.lineWidth = 1; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom); ctx.stroke(); ctx.restore();
    }
  };
  
  const abZeroLinePlugin = {
    id: 'abZeroLine',
    beforeDatasetsDraw(chart) {
      const { ctx, chartArea, scales: { y } } = chart; if (!y) return;
      const py = y.getPixelForValue(0); if (py < chartArea.top || py > chartArea.bottom) return;
      ctx.save(); ctx.strokeStyle = '#C7CBD3'; ctx.lineWidth = 1; ctx.setLineDash([]);
      ctx.beginPath(); ctx.moveTo(chartArea.left, py); ctx.lineTo(chartArea.right, py); ctx.stroke(); ctx.restore();
    }
  };
  const tooltipOpts = (kind) => ({
    enabled: true, mode: 'index', intersect: false, usePointStyle: true, boxWidth: 6, boxHeight: 6, boxPadding: 3,
    backgroundColor: SURFACE, borderColor: '#E4E7EE', borderWidth: 1, titleColor: '#6B7280', bodyColor: '#111827', footerColor: '#9CA3AF',
    padding: 9, titleFont: { size: 10, weight: '600' }, bodyFont: { size: 11.5, weight: '600' }, footerFont: { size: 9.5, weight: '400' }, footerMarginTop: 6,
    callbacks: {
      label: c => ` ${c.dataset.label}  ${c.raw == null ? '—' : fmt[kind](c.raw)}`,
      afterBody: items => {            
        const t = items.find(i => i.datasetIndex === 0), c = items.find(i => i.datasetIndex === 1);
        return (!t || !c || t.raw == null || c.raw == null) ? [] : [`    ${kind === 'au' ? '일별 차이' : kind === 'ret' ? '당일 차이' : '누적 차이'}  ${diffText(kind, t.raw, c.raw)}`];
      },
      footer: (items) => kind === 'ret' ? '유저별 D0 기준 k일째 로그인 비율 · 그 날을 채운 유저만 분모' : kind === 'au' ? '달력일 기준 일별 값 · 헤더 uplift는 D0 이후'
        : ((items.length && items[0].chart.$abHasPre) ? '현행 기준(D−28부터 누적) · 헤더 uplift는 D0 이후' : 'D0부터 누적(실험 전 값 없음) · 헤더 uplift는 D0 이후'),
    }
  });
  
  function mkChart(id, kind) {
    const count = (ctx) => ctx.chart.data.labels.length;
    const marker = (ctx) => (count(ctx) <= 16 || ctx.dataIndex === count(ctx) - 1) ? 3 : 0;
    const line = (label, color, dash) => ({ label, data: [], borderColor: color, borderWidth: 2, borderDash: dash || [], borderCapStyle: 'round', borderJoinStyle: 'round',
      pointRadius: marker, pointHoverRadius: 4.5, pointBackgroundColor: color, pointBorderColor: SURFACE, pointBorderWidth: 2, pointHoverBorderWidth: 2,
      fill: false, tension: 0, spanGaps: false });   
    return new Chart($(id).getContext('2d'), {
      type: 'line',
      data: { labels: [], datasets: [line('실험군', COLORS.test), line('대조군', COLORS.cont, [4, 3])] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false, layout: { padding: { top: 6, right: 6 } },
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: tooltipOpts(kind) },
        scales: {
          x: { offset: true, grid: { display: false }, border: { display: false }, ticks: { display: false } },   
          y: { afterFit: s => { s.width = AXIS_W; }, grace: 0, grid: { color: HAIRLINE, drawTicks: false }, border: { display: false },   
               ticks: { color: '#9CA3AF', font: { size: 9.5 }, padding: 4, maxTicksLimit: 5, callback: axisTickCb(kind, false) } }
        }
      },
      plugins: [abSplitPlugin, abLinkPlugin]
    });
  }
  
  function mkDiffChart(id, kind) {
    const hue = DIFF_HUE[kind];
    const isBar = kind === 'au';   
    const segColor = (ctx) => (ctx.p0.parsed.y < 0 && ctx.p1.parsed.y < 0) ? hue.dark : hue.line;
    const barColor = (strong) => (ctx) => (ctx.raw == null || ctx.raw >= 0) ? (strong ? hue.line : hue.above) : (strong ? hue.dark : hue.below);
    const dataset = isBar
      ? { label: '차이', data: [], backgroundColor: barColor(false), hoverBackgroundColor: barColor(true), borderRadius: 2, borderSkipped: 'start', maxBarThickness: 14, barPercentage: 0.72, categoryPercentage: 1 }
      : { label: '차이', data: [], borderColor: hue.line, borderWidth: 1.5, tension: 0, spanGaps: false,
          pointRadius: 0, pointHoverRadius: 3, pointHoverBackgroundColor: hue.line, pointHoverBorderColor: SURFACE, pointHoverBorderWidth: 1.5,
          segment: { borderColor: segColor }, fill: hue.above ? { target: 'origin', above: hue.above, below: hue.below } : false };
    return new Chart($(id).getContext('2d'), {
      type: isBar ? 'bar' : 'line',
      data: { labels: [], datasets: [dataset] },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false, layout: { padding: { right: 6 } },
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: false }, tooltip: { enabled: false } },      
        scales: {
          x: { offset: true, grid: { display: false }, border: { display: false }, ticks: { autoSkip: false, maxRotation: 0, color: '#C4C9D4', font: { size: 9 }, padding: 2, callback: xTickCb } },
          y: { afterFit: s => { s.width = AXIS_W; }, beginAtZero: true, grace: '10%', border: { display: false, dash: [3, 3] },   
               grid: { drawTicks: false, color: c => (c.tick.value === 0 ? 'transparent' : '#E5E7EB') },
               ticks: { color: '#9CA3AF', font: { size: 9 }, padding: 4, maxTicksLimit: 4, includeBounds: false, callback: axisTickCb(kind, true) } }
        }
      },
      plugins: [abSplitPlugin, abLinkPlugin, abZeroLinePlugin]
    });
  }
  function ensureCharts(kind) {   
    kind = kind || kindOf(state.current);
    if (state.chartsInited && state.chartsKind === kind) return;
    if (state.chartsInited) Object.values(state.charts).forEach(({ main, strip }) => { main.destroy(); strip.destroy(); });
    state.charts = {};
    [['rev', 'abRevChart', 'abRevDiff'], ['au', 'abAuChart', 'abAuDiff'], ['pur', 'abPurChart', 'abPurDiff'], ['arpu', 'abArpuChart', 'abArpuDiff']].forEach(([slot, mid, sid]) => {
      const k = SLOT_METRICS[kind][slot];
      const main = mkChart(mid, k), strip = mkDiffChart(sid, k);
      const link = { main, strip, hoverIdx: null }; main.$abLink = link; strip.$abLink = link;
      state.charts[slot] = { main, strip, metric: k };
      setText('abCardTag-' + slot, CARD_TAG[k]); setText('abCardTitle-' + slot, METRIC_LABEL[k]);
      
      setText('abDiffLabel-' + slot, k === 'au' ? '일별 차이 · 실험군 − 대조군' : k === 'ret' ? '당일 차이 · 실험군 − 대조군' : '누적 차이 · 실험군 − 대조군');
      { const tipEl = $('abDiffTip-' + slot); if (tipEl && k !== 'au') tipEl.title = k === 'ret'
          ? '영역 = 그날의 실험군 리텐션 − 대조군 리텐션(%p, 유저별 D0 기준 k일째 · 그 날을 채운 유저만). 0선 위 밝은 면 = 실험군 우세, 아래 짙은 면 = 대조군 우세'
          : '영역 = 차트 시작일(실험 전 값이 있으면 D−28, 없으면 D0)부터 그날까지 누적한 실험군 값 − 누적한 대조군 값(그날 하루의 증분이 아님). 0선 위 밝은 면 = 실험군 우세, 아래 짙은 면 = 대조군 우세'; }
      
      const sw = $('abDiffSwatch-' + slot), h = DIFF_HUE[k];
      if (sw) sw.innerHTML = k === 'au'
        ? `<svg width="16" height="10" style="display:block;"><rect x="2" y="0.5" width="4" height="4.5" rx="1" fill="${h.above}"/><rect x="10" y="5" width="4" height="4.5" rx="1" fill="${h.below}"/><rect x="0" y="4.5" width="16" height="1" fill="#D1D5DB"/></svg>`
        : `<svg width="16" height="10" style="display:block;"><rect x="0" y="0.5" width="16" height="4.5" fill="${h.above}"/><rect x="0" y="5" width="16" height="4.5" fill="${h.below}"/><rect x="0" y="4.5" width="16" height="1" fill="#D1D5DB"/></svg>`;   
    });
    document.querySelectorAll('#abDetailTabs [data-metric]').forEach((b, i) => { const k = SLOT_METRICS[kind][SLOTS[i]]; if (k) { b.dataset.metric = k; b.textContent = DETAIL_TITLE[k]; } });   
    state.chartsInited = true; state.chartsKind = kind;
  }

  function prettySelect(sel) {
    if (!sel || sel.dataset.pretty) return; sel.dataset.pretty = '1';
    const wrap = document.createElement('div'); wrap.className = 'ab-dd';
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'ab-select-btn'; btn.setAttribute('aria-haspopup', 'listbox'); btn.setAttribute('aria-expanded', 'false');
    btn.innerHTML = '<span></span><svg width="10" height="6" viewBox="0 0 10 6" fill="none"><path d="M1 1l4 4 4-4" stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    const menu = document.createElement('div'); menu.className = 'ab-select-menu'; menu.setAttribute('role', 'listbox');
    sel.style.display = 'none'; sel.parentNode.insertBefore(wrap, sel.nextSibling); wrap.appendChild(btn); wrap.appendChild(menu);
    let focus = -1;
    const opts = () => Array.from(sel.options);
    const sync = () => { const o = sel.options[sel.selectedIndex]; btn.firstChild.textContent = o ? o.textContent : ''; btn.disabled = sel.disabled; };
    const paint = () => { menu.innerHTML = opts().map((o, i) => `<div class="ab-select-item${o.value === sel.value ? ' selected' : ''}${i === focus ? ' focus' : ''}" role="option" data-i="${i}">${esc(o.textContent)}<span class="ck">✓</span></div>`).join(''); };
    const close = () => { menu.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); document.removeEventListener('mousedown', outside, true); };
    const outside = (ev) => { if (!wrap.contains(ev.target)) close(); };
    const open = () => { if (sel.disabled) return; focus = sel.selectedIndex; paint(); menu.classList.add('open'); btn.setAttribute('aria-expanded', 'true'); document.addEventListener('mousedown', outside, true); };
    const choose = (i) => { const o = opts()[i]; if (!o) return; const changed = sel.value !== o.value; nativeSet.call(sel, o.value); sync(); close(); if (changed) sel.dispatchEvent(new Event('change', { bubbles: true })); btn.focus(); };
    btn.addEventListener('click', (ev) => { ev.preventDefault(); menu.classList.contains('open') ? close() : open(); });
    btn.addEventListener('keydown', (ev) => {
      const isOpen = menu.classList.contains('open'), n = sel.options.length;
      if (ev.key === 'Escape' && isOpen) { ev.preventDefault(); close(); }
      else if (ev.key === 'ArrowDown' || ev.key === 'ArrowUp') { ev.preventDefault(); if (!isOpen) open(); else { focus = (focus + (ev.key === 'ArrowDown' ? 1 : n - 1)) % n; paint(); } }
      else if ((ev.key === 'Enter' || ev.key === ' ') && isOpen) { ev.preventDefault(); choose(focus); }
    });
    menu.addEventListener('mousedown', (ev) => { const it = ev.target.closest('[data-i]'); if (it) { ev.preventDefault(); choose(+it.dataset.i); } });
    
    const desc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value'); const nativeSet = desc.set;
    Object.defineProperty(sel, 'value', { configurable: true, get() { return desc.get.call(sel); }, set(v) { nativeSet.call(sel, v); sync(); } });
    sel.addEventListener('change', sync);
    new MutationObserver(sync).observe(sel, { attributes: true, attributeFilter: ['disabled'], childList: true });   
    sync();
  }
  document.querySelectorAll('select.ed-in, select.rc-in').forEach(prettySelect);

  window.toggleEditPanel = function () {
    const p = $('abEditPanel'); const open = p.style.display === 'none';
    if (open && state.current) fillEdit(state.current);
    p.style.display = open ? '' : 'none';
  };
  function fillEdit(e) {
    state.editTarget = e.markingidx;   
    setText('abEditTitle', `#${AbMath.displayNo(e)} · ${e.cohort_type}`); setText('abEditMsg', '');
    $('ed-title').value = e.title || ''; $('ed-exposure_start_ts').value = e.exposure_start_ts || '';
    $('ed-exposure_start_ts').placeholder = e.marking_start_ts ? `${e.marking_start_ts} (마킹 시작, 참고)` : '2026-06-15 03:00:00';
    $('ed-end_ts').value = e.full_rollout_ts || e.end_ts || '';   
    $('ed-result').value = e.result || ''; $('ed-exp_kind').value = e.exp_kind || 'iap';
    $('ed-target_desc').value = e.target_desc || ''; $('ed-notes').value = e.notes || ''; $('ed-needs_recompute').checked = false;
    
  }
  window.submitEdit = async function () {
    const e = state.current; if (!e) return;
    if (state.editTarget !== e.markingidx) { $('abEditMsg').style.color = '#DC2626'; setText('abEditMsg', `편집 대상(#${state.editTarget})과 선택 실험(#${AbMath.displayNo(e)})이 다릅니다. 패널을 다시 여세요.`); return; }
    const patch = {};
    const str = (id, key) => { const v = $(id).value.trim(); const cur = e[key] ?? ''; if (v !== String(cur)) patch[key] = v === '' ? null : v; };
    str('ed-title', 'title'); str('ed-exposure_start_ts', 'exposure_start_ts');

    const endVal = $('ed-end_ts').value.trim(), curEnd = String(e.full_rollout_ts || e.end_ts || ''), resSel = $('ed-result').value;
    if (endVal !== curEnd || (endVal && resSel !== (e.result || ''))) {
      if (!endVal) { if (e.end_ts) patch.end_ts = null; if (e.full_rollout_ts) patch.full_rollout_ts = null; }
      else if (resSel === 'adopted') { if (endVal !== String(e.full_rollout_ts || '')) patch.full_rollout_ts = endVal; }
      else { if (endVal !== String(e.end_ts || '')) patch.end_ts = endVal; if (e.full_rollout_ts) patch.full_rollout_ts = null; }
    }
    str('ed-target_desc', 'target_desc'); str('ed-notes', 'notes');
    const res = $('ed-result').value; if (res !== (e.result || '')) patch.result = res || null;
    const ek = $('ed-exp_kind').value; if (ek !== (e.exp_kind || 'iap')) patch.exp_kind = ek;   
    
    if (e.status === 'candidate' && !('exposure_start_ts' in patch)) { const d0 = $('ed-exposure_start_ts').value.trim(); if (d0) patch.exposure_start_ts = d0; }
    if ($('ed-needs_recompute').checked) patch.needs_recompute = true;
    if (patch.title === null) { setText('abEditMsg', '제목은 비울 수 없습니다'); return; }
    if (!Object.keys(patch).length) { setText('abEditMsg', '바뀐 값이 없습니다'); return; }
    try {
      const saved = await api(`/api/experiments/${e.markingidx}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(patch) });
      const now = (saved && (saved.experiment || saved).status) || e.status;   
      const done = now !== e.status ? (now === 'done' ? '저장됨 — 완료 실험으로 올렸습니다(지표 반영까지 10~15분)' : now === 'running' ? '저장됨 — 진행중으로 올렸습니다(지표 반영까지 10~15분)' : '저장됨') : '저장됨';
      await loadExperiments(true);
      
      $('abEditMsg').style.color = COLORS.green; setText('abEditMsg', done);
    } catch (err) { $('abEditMsg').style.color = '#DC2626'; setText('abEditMsg', err.message); }
  };

  const DETAIL_DEFAULT = { metric: 'rev', view: 'level', agg: 'cum', xr: 'all', xc: null, y: 'auto', ymin: null, ymax: null };
  const detail = Object.assign({ open: false, chart: null, returnTo: null }, DETAIL_DEFAULT);
  const DETAIL_TITLE = { rev: '누적 매출', au: '일별 AU', pur: '구매 전환율', arpu: '유저당 매출', tarpu: 'Total ARPU(IAP + 광고)', adrev: '광고 매출/유저(전면 + 리워드)', ret: '리텐션 D+k', ad_is: '전면광고 매출/유저', ad_rv: '리워드 광고 매출/유저' };
  const AGG_LABEL = { cum: '누적', daily: '일별', ma7: '7일 평균' };
  const XR_LABEL = { all: '전체 구간', post: 'D0 이후', last14: '최근 14일', last7: '최근 7일', custom: '드래그 구간' };
  const REL_HUE = { line: '#4F46E5', dark: '#312E81', above: 'rgba(79,70,229,0.26)', below: 'rgba(49,46,129,0.52)' };   
  const DETAIL_URL_KEYS = ['detail', 'view', 'agg', 'xr', 'xc', 'y', 'ymin', 'ymax', 'scope'];
  
  const signedText = (kind, v) => (v < 0 ? '−' : '+') + (kind === 'rel' ? Math.abs(v).toFixed(2) + '%' : fmt[kind](Math.abs(v)) + (kind === 'pur' ? 'p' : ''));

  function detailSeries(d, k, agg, xr, xc) {
    const idx0 = d.d_days.indexOf(0), hasPre = metricHasPre(d, k), start = (hasPre || idx0 < 0) ? 0 : idx0;
    const days = d.d_days.slice(start); let test = d.series[k].test.slice(start), cont = d.series[k].cont.slice(start);
    if (!isLevel(k) && agg !== 'cum') { test = AbMath.cumToDaily(test); cont = AbMath.cumToDaily(cont); }   
    if (agg === 'ma7') { test = AbMath.movingAvg(test, 7); cont = AbMath.movingAvg(cont, 7); }
    let custom = null;
    if (xr === 'custom' && xc) {
      const from = days.findIndex(x => x >= xc[0]); let to = -1; days.forEach((x, i) => { if (x <= xc[1]) to = i; });
      custom = [from < 0 ? 0 : from, to < 0 ? days.length - 1 : to];
    }
    const [a, b] = AbMath.sliceRange(days.length, days.indexOf(0), xr, custom);
    const sl = (arr) => arr.slice(a, b + 1);
    return { days: sl(days), test: sl(test), cont: sl(cont), hasPre, allDays: days };
  }
  
  const abBgPlugin = { id: 'abBg', beforeDraw(chart) { const { ctx } = chart; ctx.save(); ctx.fillStyle = SURFACE; ctx.fillRect(0, 0, chart.width, chart.height); ctx.restore(); } };
  
  const abSelPlugin = {
    id: 'abSel',
    afterDatasetsDraw(chart) {
      const sel = chart.$abSel; if (!sel || sel.x1 == null) return;
      const { ctx, chartArea } = chart, x0 = Math.max(chartArea.left, Math.min(sel.x0, sel.x1)), x1 = Math.min(chartArea.right, Math.max(sel.x0, sel.x1));
      ctx.save(); ctx.fillStyle = 'rgba(79,70,229,0.10)'; ctx.fillRect(x0, chartArea.top, x1 - x0, chartArea.bottom - chartArea.top);
      ctx.strokeStyle = 'rgba(79,70,229,0.55)'; ctx.lineWidth = 1; ctx.setLineDash([3, 3]);
      ctx.beginPath(); ctx.moveTo(x0, chartArea.top); ctx.lineTo(x0, chartArea.bottom); ctx.moveTo(x1, chartArea.top); ctx.lineTo(x1, chartArea.bottom); ctx.stroke(); ctx.restore();
    }
  };
  function detailTooltip(kind, view, agg, hasPre) {
    const base = tooltipOpts(kind === 'rel' ? 'arpu' : kind);   
    const aggWord = AGG_LABEL[agg] + (agg === 'cum' ? (hasPre ? '(D−28부터)' : '(D0부터)') : '');
    return Object.assign({}, base, { callbacks: {
      label: c => ` ${c.dataset.label}  ${c.raw == null ? '—' : (view === 'level' ? fmt[kind](c.raw) : signedText(kind, c.raw))}`,
      afterBody: items => {
        if (view !== 'level') return [];
        const t = items.find(i => i.datasetIndex === 0), c = items.find(i => i.datasetIndex === 1);
        return (!t || !c || t.raw == null || c.raw == null) ? [] : [`    차이  ${signedText(kind, t.raw - c.raw)}${c.raw ? ` (${fmtPct((t.raw - c.raw) / c.raw * 100, 2)})` : ''}`];
      },
      footer: () => `${aggWord} · 헤더 uplift는 D0 이후`,
    } });
  }
  
  function detailXTickCb(val, idx) {
    const labels = this.chart.data.labels, n = labels.length, last = n - 1, d0 = labels.indexOf('D0');
    const step = n <= 24 ? 1 : n <= 48 ? 2 : n <= 96 ? 4 : n <= 160 ? 7 : 14;
    if (idx === last || idx === d0) return labels[idx];
    const gap = Math.max(1, Math.ceil(step / 2));
    if (last - idx < gap || (d0 >= 0 && Math.abs(idx - d0) < gap)) return '';
    return (idx - Math.max(0, d0)) % step === 0 ? labels[idx] : '';
  }
  function mkDetailChart(k, s, view) {
    const d = state.lastSeries, labels = s.days.map(fmtD), isAu = k === 'au';
    const kind = view === 'rel' ? 'rel' : k, signed = view !== 'level';
    const ri = fullRolloutIdx(d), rolloutLabel = ri >= 0 ? fmtD(d.d_days[ri]) : null;
    const marker = (ctx) => (labels.length <= 24 || ctx.dataIndex === labels.length - 1) ? 3 : 0;
    const line = (label, color, data, dash) => ({ label, data, borderColor: color, borderWidth: 2, borderDash: dash || [], borderCapStyle: 'round', borderJoinStyle: 'round',
      pointRadius: marker, pointHoverRadius: 5, pointBackgroundColor: color, pointBorderColor: SURFACE, pointBorderWidth: 2, pointHoverBorderWidth: 2, fill: false, tension: 0, spanGaps: false });
    let datasets, type = 'line';
    if (view === 'level') datasets = [line('실험군', COLORS.test, s.test), line('대조군', COLORS.cont, s.cont, [4, 3])];
    else {
      const hue = view === 'rel' ? REL_HUE : DIFF_HUE[k];
      const data = view === 'rel' ? AbMath.relDiff(s.test, s.cont) : s.test.map((t, i) => (t == null || s.cont[i] == null) ? null : t - s.cont[i]);
      const bar = view === 'diff' && isAu && detail.agg !== 'ma7';   
      type = bar ? 'bar' : 'line';
      const barColor = (strong) => (ctx) => (ctx.raw == null || ctx.raw >= 0) ? (strong ? hue.line : hue.above) : (strong ? hue.dark : hue.below);
      datasets = [bar
        ? { label: '차이', data, backgroundColor: barColor(false), hoverBackgroundColor: barColor(true), borderRadius: 2, borderSkipped: 'start', maxBarThickness: 22, barPercentage: 0.72, categoryPercentage: 1 }
        : { label: view === 'rel' ? '상대 차이' : '차이', data, borderColor: hue.line, borderWidth: 2, tension: 0, spanGaps: false, pointRadius: marker, pointHoverRadius: 4.5,
            pointBackgroundColor: hue.line, pointBorderColor: SURFACE, pointBorderWidth: 2,
            segment: { borderColor: (ctx) => (ctx.p0.parsed.y < 0 && ctx.p1.parsed.y < 0) ? hue.dark : hue.line }, fill: { target: 'origin', above: hue.above, below: hue.below } }];
    }
    
    const vals = datasets.flatMap(ds => ds.data).filter(v => v != null);
    const y = { grid: { color: HAIRLINE, drawTicks: false }, border: { display: false }, ticks: { color: '#9CA3AF', font: { size: 11 }, padding: 6, maxTicksLimit: 8, callback: axisTickCb(kind, signed) } };
    let yNote = '';
    if (detail.y === 'log' && view === 'level' && vals.length && vals.every(v => v > 0)) { y.type = 'logarithmic'; y.ticks.callback = (v) => fmt[k](v); }
    else {
      if (detail.y === 'log') yNote = '로그 축은 양수 값의 실험군·대조군 보기에서만 쓸 수 있어 자동 축으로 표시';
      if (detail.y === 'custom') { if (detail.ymin != null) y.min = detail.ymin; if (detail.ymax != null) y.max = detail.ymax; }
      else if (view !== 'level') { y.beginAtZero = true; y.grace = '10%'; }
      else if (detail.y === 'zero') y.beginAtZero = true;
      else { const mn = AbMath.autoMin(vals); if (mn !== undefined) y.min = mn; }
    }
    if (detail.chart) { detail.chart.destroy(); detail.chart = null; }
    const chart = new Chart($('abDetailCanvas').getContext('2d'), {
      type, data: { labels, datasets },
      options: {
        responsive: true, maintainAspectRatio: false, animation: false, layout: { padding: { top: 8, right: 14 } },
        interaction: { mode: 'index', intersect: false },
        plugins: { legend: { display: view === 'level', position: 'top', align: 'end', labels: { usePointStyle: true, boxWidth: 8, boxHeight: 8, padding: 14, font: { size: 11, weight: '600' }, color: '#6B7280' } },
                   tooltip: detailTooltip(kind, view, detail.agg, s.hasPre) },
        scales: { x: { offset: true, grid: { display: false }, border: { display: false }, ticks: { autoSkip: false, maxRotation: 0, color: '#9CA3AF', font: { size: 10.5 }, callback: detailXTickCb } }, y }
      },
      plugins: [abBgPlugin, abSplitPlugin].concat(view !== 'level' ? [abZeroLinePlugin] : []).concat([abSelPlugin])
    });
    chart.$abRolloutLabel = rolloutLabel; chart.$abHasPre = s.hasPre; chart.$abDays = s.days;
    detail.chart = chart;
    return yNote;
  }
  function renderDetailTable(k, s) {
    const kind = k, d = state.lastSeries, isAu = k === 'au', startUtc = d.params.start_utc;
    const cell = (v) => (v == null ? '<span style="color:#C4C9D4;">—</span>' : fmt[kind](v));
    const rows = s.days.map((dv, i) => {
      const t = s.test[i], c = s.cont[i], ok = t != null && c != null;
      return `<tr${dv === 0 ? ' class="d0"' : ''}><td>${fmtD(dv)}</td>${isAu ? `<td>${AbMath.dateAt(startUtc, dv)}</td>` : ''}<td>${cell(t)}</td><td>${cell(c)}</td>` +
        `<td>${ok ? signedText(kind, t - c) : '—'}</td><td>${ok && c ? fmtPct((t - c) / c * 100, 2) : '—'}</td></tr>`;
    });
    $('abDetailTable').innerHTML = `<table><thead><tr><th>D</th>${isAu ? '<th>달력일 (UTC)</th>' : ''}<th>실험군</th><th>대조군</th><th>차이</th><th>상대 차이</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
  }
  
  function syncDetailControls() {
    document.querySelectorAll('#abDetailTabs [data-metric]').forEach(b => b.classList.toggle('active', b.dataset.metric === detail.metric));
    document.querySelectorAll('#abDetailBar [data-ctl]').forEach(b => {
      const ctl = b.dataset.ctl, val = b.dataset.val;
      b.classList.toggle('active', detail[ctl] === val);
      b.disabled = (ctl === 'agg' && val === 'cum' && isLevel(detail.metric)) || (ctl === 'y' && val === 'log' && detail.view !== 'level') || (ctl === 'y' && detail.view === 'table');
    });
    $('abDetailYMin').value = detail.ymin == null ? '' : String(detail.ymin); $('abDetailYMax').value = detail.ymax == null ? '' : String(detail.ymax);
    $('abDetailYMin').disabled = $('abDetailYMax').disabled = detail.view === 'table';
    { const yc = $('abDetailYCustom'); if (yc) yc.style.display = detail.y === 'custom' ? 'inline-flex' : 'none'; }   
    { const xp = $('abDetailXCustom'); if (xp) { const on = detail.xr === 'custom' && detail.xc; xp.style.display = on ? '' : 'none';
        if (on) xp.innerHTML = `드래그 구간 ${fmtD(detail.xc[0])}~${fmtD(detail.xc[1])} <span style="cursor:pointer;margin-left:4px;" onclick="abDetailSet('xr','all')" title="전체로 되돌리기">×</span>`; } }
  }
  function syncDetailUrl() {
    try {
      const u = new URL(location.href), p = u.searchParams;
      DETAIL_URL_KEYS.forEach(x => p.delete(x));
      if (detail.open) {
        p.set('page', pageOf(state.current)); if (state.current) p.set('exp', String(state.current.markingidx));
        p.set('detail', detail.metric); p.set('view', detail.view); p.set('agg', detail.agg); p.set('xr', detail.xr);
        if (detail.xr === 'custom' && detail.xc) p.set('xc', detail.xc.join(','));
        p.set('y', detail.y); if (detail.y === 'custom') { if (detail.ymin != null) p.set('ymin', String(detail.ymin)); if (detail.ymax != null) p.set('ymax', String(detail.ymax)); }
        if (state.current && state.current.cohort_type !== 'rule') p.set('scope', state.scope.join(','));
        $('abDetailNewTab').href = u.toString();
      }
      history.replaceState(null, '', u.toString());
    } catch (err) {  }
  }
  function renderDetail() {
    if (!detail.open) return;
    const d = state.lastSeries, e = state.current, k = detail.metric;
    if (isLevel(detail.metric) && detail.agg === 'cum') detail.agg = 'daily';
    syncDetailControls();
    setText('abDetailTitle', e ? `#${AbMath.displayNo(e)} · ${e.title}` : '–');
    if (!d) { $('abDetailTable').style.display = 'none'; if (detail.chart) { detail.chart.destroy(); detail.chart = null; } setText('abDetailSummary', '표시할 데이터가 없습니다'); setText('abDetailBasis', ''); syncDetailUrl(); return; }
    const s = detailSeries(d, k, detail.agg, detail.xr, detail.xc);
    const isTable = detail.view === 'table';
    $('abDetailTable').style.display = isTable ? 'block' : 'none';
    document.querySelector('.ab-detail-plot').style.visibility = isTable ? 'hidden' : 'visible';
    let yNote = '';
    if (isTable) renderDetailTable(k, s); else yNote = mkDetailChart(k, s, detail.view);
    
    const li = lastIndex(s.test.map((t, i) => (t == null || s.cont[i] == null) ? null : t));
    if (li < 0) setText('abDetailSummary', '표시 구간에 값이 없습니다');
    else {
      const t = s.test[li], c = s.cont[li], dd = t - c;
      $('abDetailSummary').innerHTML = `<b style="color:#111;">${fmtD(s.days[li])}${isLevel(k) || detail.agg !== 'cum' ? ' 당일' : '까지'}</b> · 실험군 <b style="color:${COLORS.test};">${fmt[k](t)}</b> · 대조군 <b style="color:${COLORS.cont};">${fmt[k](c)}</b> · 차이 <b style="color:#111;">${signedText(k, dd)}</b>${c ? ` (${fmtPct(dd / c * 100, 2)})` : ''}`;
    }
    const basis = [`${DETAIL_TITLE[k]} · ${AGG_LABEL[detail.agg]}${detail.agg === 'cum' ? (s.hasPre ? '(현행 기준 D−28부터)' : '(D0부터 · 실험 전 값 없음)') : (isLevel(k) ? '' : '(누적의 하루 증분)')}`,
      XR_LABEL[detail.xr] + (detail.xr === 'custom' && detail.xc ? ` ${fmtD(detail.xc[0])}~${fmtD(detail.xc[1])}` : ''),
      e && e.cohort_type !== 'rule' ? `is_pair ${state.scope.join(',')}` : '규칙 코호트',
      k === 'au' ? 'AU 의 D 는 달력일' : k === 'ret' ? '리텐션의 D+k 는 유저별 D0(시작 후 첫 로그인) 기준 k일째 · 그 날을 채운 유저만 분모' : '매출 계열의 D 는 유저별 D0(시작 후 첫 로그인) 기준(달력일 아님)', yNote].filter(Boolean);
    setText('abDetailBasis', basis.join(' · '));
    syncDetailUrl();
  }
  
  window.openAbDetail = function (metric, opts) {
    if (!DETAIL_TITLE[metric] || (state.lastSeries && !state.lastSeries.series[metric])) metric = slotMetric('rev');   
    Object.assign(detail, DETAIL_DEFAULT, { metric });
    if (opts) {
      if (['level', 'diff', 'rel', 'table'].includes(opts.view)) detail.view = opts.view;
      if (['cum', 'daily', 'ma7'].includes(opts.agg)) detail.agg = opts.agg;
      if (['all', 'post', 'last14', 'last7', 'custom'].includes(opts.xr)) detail.xr = opts.xr;
      if (opts.xc) { const xc = String(opts.xc).split(',').map(Number); if (xc.length === 2 && xc.every(Number.isFinite)) detail.xc = xc; }
      if (detail.xr === 'custom' && !detail.xc) detail.xr = 'all';
      if (['auto', 'zero', 'log', 'custom'].includes(opts.y)) detail.y = opts.y;
      if (detail.y === 'custom') { const mn = Number(opts.ymin), mx = Number(opts.ymax); detail.ymin = opts.ymin != null && opts.ymin !== '' && Number.isFinite(mn) ? mn : null; detail.ymax = opts.ymax != null && opts.ymax !== '' && Number.isFinite(mx) ? mx : null; if (detail.ymin == null && detail.ymax == null) detail.y = 'auto'; }
    }
    detail.open = true; detail.returnTo = document.activeElement;
    $('abDetail').classList.add('open');
    document.addEventListener('keydown', onDetailKey);
    renderDetail();
    const closeBtn = document.querySelector('#abDetailBox .ab-detail-close'); if (closeBtn) closeBtn.focus();
  };
  window.closeAbDetail = function () {
    if (!detail.open) return;
    detail.open = false; $('abDetail').classList.remove('open');
    document.removeEventListener('keydown', onDetailKey);
    if (detail.chart) { detail.chart.destroy(); detail.chart = null; }
    syncDetailUrl();
    if (detail.returnTo && detail.returnTo.focus) detail.returnTo.focus();
  };
  function onDetailKey(ev) { if (ev.key === 'Escape') window.closeAbDetail(); }
  
  window.abDetailSet = function (ctl, val) {
    if (ctl === 'metric') detail.metric = val; else detail[ctl] = val;
    if (ctl === 'xr' && val !== 'custom') detail.xc = null;
    if (ctl === 'y' && val !== 'custom') { detail.ymin = null; detail.ymax = null; }
    if (detail.view !== 'level' && detail.y === 'log') detail.y = 'auto';
    renderDetail();
    if (ctl === 'y' && val === 'custom') setTimeout(() => { const el = $('abDetailYMin'); if (el) el.focus(); }, 0);   
  };
  window.abDetailApplyY = function () {
    const mn = $('abDetailYMin').value.trim(), mx = $('abDetailYMax').value.trim();
    detail.ymin = mn === '' || !Number.isFinite(Number(mn)) ? null : Number(mn); detail.ymax = mx === '' || !Number.isFinite(Number(mx)) ? null : Number(mx);
    detail.y = (detail.ymin == null && detail.ymax == null) ? 'auto' : 'custom';
    renderDetail();
  };
  const download = (name, href) => { const a = document.createElement('a'); a.href = href; a.download = name; document.body.appendChild(a); a.click(); a.remove(); };
  window.abDetailPng = function () {
    if (!detail.chart) return;
    download(`ab_${state.current ? state.current.markingidx : 'x'}_${detail.metric}_${detail.view}_${detail.agg}.png`, detail.chart.toBase64Image('image/png', 1));
  };
  window.abDetailCsv = function () {
    const d = state.lastSeries; if (!d) return;
    const s = detailSeries(d, detail.metric, detail.agg, detail.xr, detail.xc);
    const r4 = (v) => (v == null ? null : Math.round(v * 10000) / 10000);
    const diff = s.test.map((t, i) => (t == null || s.cont[i] == null) ? null : r4(t - s.cont[i]));
    const cols = [['d_day', s.days], ['test', s.test.map(r4)], ['control', s.cont.map(r4)], ['diff', diff], ['rel_pct', AbMath.relDiff(s.test, s.cont).map(r4)]];
    if (detail.metric === 'au') cols.splice(1, 0, ['date_utc', s.days.map(dv => AbMath.dateAt(d.params.start_utc, dv))]);
    const csv = AbMath.toCsv(s.days.map(fmtD), cols);
    download(`ab_${state.current ? state.current.markingidx : 'x'}_${detail.metric}_${detail.agg}.csv`, 'data:text/csv;charset=utf-8,﻿' + encodeURIComponent(csv));
  };
  
  (function wireDetailDrag() {
    const cv = $('abDetailCanvas'); if (!cv) return;
    let drag = null;
    cv.addEventListener('mousedown', ev => { if (ev.button !== 0 || !detail.chart) return; drag = { x0: ev.offsetX }; detail.chart.$abSel = { x0: ev.offsetX, x1: null }; });
    cv.addEventListener('mousemove', ev => { if (!drag || !detail.chart) return; detail.chart.$abSel.x1 = ev.offsetX; detail.chart.draw(); });
    const finish = (ev) => {
      if (!drag) return; const ch = detail.chart, sel = ch && ch.$abSel; const x1 = ev.offsetX; drag = null; if (!ch || !sel) return;
      ch.$abSel = null;
      if (Math.abs(x1 - sel.x0) < 6) { ch.draw(); return; }
      const days = ch.$abDays, last = days.length - 1;
      const toIdx = (px) => Math.min(last, Math.max(0, Math.round(ch.scales.x.getValueForPixel(px))));
      const i0 = toIdx(Math.min(sel.x0, x1)), i1 = toIdx(Math.max(sel.x0, x1));
      if (i0 === i1) { ch.draw(); return; }
      detail.xr = 'custom'; detail.xc = [days[i0], days[i1]]; renderDetail();
    };
    cv.addEventListener('mouseup', finish);
    cv.addEventListener('mouseleave', ev => { if (drag) finish(ev); });
    cv.addEventListener('dblclick', () => { detail.xr = 'all'; detail.xc = null; renderDetail(); });
  })();
  
  document.querySelectorAll('.ab-chart-card').forEach(card => {
    card.addEventListener('click', () => window.openAbDetail(slotMetric(card.dataset.metric)));   
    card.addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); window.openAbDetail(slotMetric(card.dataset.metric)); } });
  });
  { const tabs = $('abDetailTabs'); if (tabs) tabs.addEventListener('click', ev => { const b = ev.target.closest('[data-metric]'); if (b) window.abDetailSet('metric', b.dataset.metric); }); }
  { const bar = $('abDetailBar'); if (bar) bar.addEventListener('click', ev => { const b = ev.target.closest('[data-ctl]'); if (b && !b.disabled) window.abDetailSet(b.dataset.ctl, b.dataset.val); }); }
  { const yin = ['abDetailYMin', 'abDetailYMax'].map($); yin.forEach(el => el && el.addEventListener('keydown', ev => { if (ev.key === 'Enter') window.abDetailApplyY(); })); }

  const PAGE_TITLES = { gamemonitor: 'Slot Performance', rulecohort: 'A/B Testing', abguide: 'A/B Testing' };   
  let gameMonitorInited = false;
  function activateAbPage(page) {   
    const ab = AB_PAGES[page]; state.abPage = page; state.page = page;
    document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-abtesting'));
    setText('pageTitle', 'A/B Testing'); setText('abPageTitle', ab.title); setText('abPageSub', ab.sub);
  }
  function ensureCurrentVisible() {   
    const vis = abVisible();
    if (state.current && vis.some(e => e.markingidx === state.current.markingidx)) { syncAbUrl(); return; }
    const pick = vis.find(e => e.status === 'running') || vis[0];
    if (pick) { $('abExpSelect').value = String(pick.markingidx); selectExperiment(pick.markingidx); }
    else emptyAbPage();
  }
  function emptyAbPage() {   
    state.current = null; state.lastSeries = null; state.editTarget = null; state.seriesSeq++; setPickerText(null); clearCharts();
    if (state.pollTimer) { clearInterval(state.pollTimer); state.pollTimer = null; }
    if ($('abEditPanel').style.display !== 'none') window.toggleEditPanel();
    ['isPairGroup', 'abRuleHelp', 'abDraftNote', 'abRecomputeNote', 'abPreGap'].forEach(id => { const el = $(id); if (el) el.style.display = 'none'; });
    ['rev', 'au', 'pur', 'arpu'].forEach(k => { setText('abUplift-' + k, '–', COLORS.gray); const pe = $('abChartPill-' + k), pp = $('abChartP-' + k); if (pe) pe.innerHTML = ''; if (pp) pp.textContent = ''; });
    renderInfo(null); setText('param-start-val', '–'); setText('param-rollout-val', '–'); setText('param-day-val', '–', COLORS.gray);
    renderFreshness();
    status(`${AB_PAGES[state.abPage].title} 탭에 등록된 실험이 없습니다`);
    syncAbUrl();
  }
  function syncAbUrl() {   
    if (!state.loaded) return;   
    if (detail.open) { syncDetailUrl(); return; }
    try {
      const p = new URLSearchParams();
      p.set('page', state.page); if (state.current) p.set('exp', String(state.current.markingidx));
      history.replaceState(null, '', '?' + p.toString());
    } catch (err) {  }
  }
  function showPage(page) {
    if (page === 'abtesting') page = state.current ? pageOf(state.current) : 'abpair';   
    if (AB_PAGES[page]) {
      const changed = state.abPage !== page || !AB_PAGES[state.page];
      activateAbPage(page);
      if (changed && state.loaded) { renderKpi(); renderLists(); fillSelect(); ensureCurrentVisible(); }   
      else syncAbUrl();
    } else {
      state.page = page;
      document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
      document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === 'page-' + page));
      setText('pageTitle', PAGE_TITLES[page] || '');
      syncAbUrl();
    }
    const sc = document.querySelector('.content-scroll'); if (sc) sc.scrollTop = 0;
    if (page === 'gamemonitor' && !gameMonitorInited && typeof window.initGameMonitorCharts === 'function') { gameMonitorInited = true; window.initGameMonitorCharts(); }
    if (page === 'rulecohort' && typeof window.initRuleCohortPage === 'function') window.initRuleCohortPage();   
    if (page === 'abguide') { loadGuideQueries(); guideSpy(); }   
  }
  document.querySelectorAll('.nav-item[data-page]').forEach(item => item.addEventListener('click', ev => { ev.preventDefault(); showPage(item.dataset.page); }));

  const GUIDE_QUERIES = {
    rev: { group: 'metric', title: '매출 · 구매 전환율 · ARPU · R1/R0', feeds: ['누적 매출', '구매 전환율', '유저당 매출', '매출 유지율 R1/R0'],
      notes: ['결제(완료 건)를 유저별 D0 기준 경과 일수로 바꿔, 그룹(is_pair × 실험군 · 대조군) × 일차의 누적 값을 낸다. 창은 D−28 ~ D+112.',
              '화면 계산: 누적 매출 = rev_cum · 구매 전환율 = payers_cum ÷ users_total · ARPU = rev_cum ÷ users_total. 머리 숫자는 D0 이후 성분(rev_cum_post · buyers_post_cum)으로 낸다.',
              'R0 = D−28~D−1 의 일 매출(rev_day) 합, R1 = D0~D+27 의 합. revsq_* 는 검정(Welch t)의 분산 계산용 제곱합이다.'] },
    au: { group: 'metric', title: '일별 AU', feeds: ['일별 AU'],
      notes: ['코호트 유저 중 그날 접속해 플레이한 유저 수(활동 로그 기준)를 달력일별로 센다. 일차는 유저별이 아니라 실험 시작일 기준 달력일이다.',
              '오늘(미완결)은 빼고, 완료 실험은 종료 시각의 자정까지만 센다.'] },
    ret: { group: 'metric', title: '리텐션 D+k', feeds: ['리텐션 D+k 차트(광고 AB)', '리텐션 타일'],
      notes: ['유저별 D0 기준 k일째에 로그인한 유저 수(ret_login_users)와 k일째 날을 다 채운 유저 수(ret_base_users)를 낸다. 화면 값 = 앞 ÷ 뒤.',
              '못 채운 유저를 분모에서 빼야 늦게 들어온 유저가 이탈로 읽히지 않는다.'] },
    ad: { group: 'metric', title: '광고 매출 포함 실험 — Total ARPU · 광고 매출', feeds: ['Total ARPU', '광고 매출/유저', '누적 총매출 차이', '도달 · eCPM'],
      notes: ['실험 종류가 광고 매출 포함인 실험만 실행한다. 광고 원천(광고 네트워크 노출 단위)이 약 2일 늦어, 광고 도착일 다음날 0시로 코호트 · IAP · 광고를 같은 시점에서 자른다.',
              '화면 계산: Total ARPU = (ad_iap_cum_post + ad_is_cum_post + ad_rv_cum_post) ÷ ad_users_total · 광고 매출/유저 = (ad_is_cum_post + ad_rv_cum_post) ÷ ad_users_total.'] },
    user: { group: 'metric', title: '세부 분석 — 유저 단위', feeds: ['세부 분석 표', 'R1/R0 검정(타일의 p · 색)'],
      notes: ['실험 × 유저 한 줄: R0 · R1 · 결제 여부 · 로그인 D+1/3/7 · 플레이 수 · 가입 시각 · D0 이전 결제 이력(세그먼트 구분용).',
              '상위 결제자 보정(캡) · bootstrap · 세그먼트 계산은 이 행들로 웹이 한다. 정기 적재(14:10 KST)와 완료 처리 때만 실행한다.'] },
    user_ad: { group: 'metric', title: '세부 분석 — 유저 단위 광고 성분', feeds: ['세부 분석 표(광고 AB)'],
      notes: ['광고 매출 포함 실험만. 유저별 D0 이후 IAP · 전면광고 · 리워드 광고 매출과 노출 수, 리워드의 사전 28일 매출(사전 불균형 보정용).'] },
    cohort_marking_rev: { group: 'cohort', title: '마킹표 실험 — 매출 · 리텐션 · 세부 분석용', feeds: ['Pairwise AB'],
      notes: ['{cohort_sql} 자리에 들어가는 조각. 마킹표에서 실험 번호로 유저를 고르고(한 유저가 여러 줄이면 먼저 마킹된 줄 하나), 실험 시작 뒤 첫 로그인 시각을 편입 시각(mkdt = 유저별 D0)으로 붙인다.',
              '시작 뒤 한 번도 로그인하지 않은 유저는 빠진다. 내부 테스트 계정은 넣지 않는다.'] },
    cohort_marking_au: { group: 'cohort', title: '마킹표 실험 — 일별 AU 용', feeds: ['Pairwise AB'],
      notes: ['마킹표의 줄을 그대로 쓴다(로그인 조인 · 중복 제거 없음) — 기존 대시보드 AU 쿼리와 같은 정의다.'] },
  };
  const GUIDE_PH = { '{cohort_sql}': '대상자 SQL — 실험마다 다르다', '{start_dt}': '실험 시작 시각(D0, UTC)', '{upper_dt}': '집계 상한(진행중 = 오늘 0시, 완료 = 종료 시각)', '{markingidx}': '실험 번호' };
  const sqlHtml = (text) => esc(text).replace(/\{(?:cohort_sql|start_dt|upper_dt|markingidx)\}/g, (ph) => `<span class="g-ph" title="${GUIDE_PH[ph]}">${ph}</span>`);   
  function copyText(text, done) {   
    if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(text).then(done, () => {}); return; }
    const ta = document.createElement('textarea'); ta.value = text; ta.style.cssText = 'position:fixed;left:-9999px;top:0;'; document.body.appendChild(ta); ta.select();
    try { if (document.execCommand('copy')) done(); } catch (e) {  } ta.remove();
  }
  const guideOpenKey = new URLSearchParams(location.search).get('q');   
  async function loadGuideQueries() {   
    const box = $('guideQueries'); if (!box || state.guideQueries) return;
    try { const d = await api('/api/guide/queries'); renderGuideQueries(d); }
    catch (err) {
      box.innerHTML = `<div class="g-q-empty">쿼리 목록을 불러오지 못했습니다(${esc(err.message)}). <button class="g-q-toggle" id="guideQueriesRetry">다시 시도</button></div>`;
      const b = $('guideQueriesRetry'); if (b) b.addEventListener('click', loadGuideQueries);
    }
  }
  function renderGuideQueries(d) {
    const box = $('guideQueries'); if (!box) return;
    if (!d || !d.ready || !d.queries.length) { box.innerHTML = '<div class="g-q-empty">쿼리 목록이 아직 없습니다 — 다음 지표 적재(14:10 KST) 뒤에 채워집니다.</div>'; return; }   
    state.guideQueries = d;
    const metaOf = (q) => GUIDE_QUERIES[q.key] || { group: 'metric', title: q.key, feeds: [], notes: [] };
    const item = (q) => { const meta = metaOf(q);
      return `<details class="g-q" data-key="${esc(q.key)}"><summary><span class="g-q-caret"></span><span class="g-q-title">${esc(meta.title)}</span><span class="g-q-feeds">${meta.feeds.map(f => `<span>${esc(f)}</span>`).join('')}</span><span class="g-q-meta">${q.sql.split('\n').length}줄</span></summary>`
        + `<div class="g-q-body">${meta.notes.length ? `<ul>${meta.notes.map(n => `<li>${sqlHtml(n)}</li>`).join('')}</ul>` : ''}<div class="g-sql-wrap"><button class="g-copy" data-copy="${esc(q.key)}">복사</button><pre class="g-sql">${sqlHtml(q.sql)}</pre></div></div></details>`; };
    const metric = d.queries.filter(q => metaOf(q).group !== 'cohort'), cohort = d.queries.filter(q => metaOf(q).group === 'cohort');
    const stamp = d.queries.map(q => q.updated_at).filter(Boolean).sort().pop();
    box.innerHTML = `<div class="g-q-bar"><span class="g-q-group">지표 쿼리 · 모든 실험 공통</span><span style="display:flex;align-items:center;gap:10px;"><span class="g-q-meta">${stamp ? '원문 갱신 ' + kstLabel(stamp) : ''}</span><button class="g-q-toggle" id="guideQueriesToggle">모두 펼치기</button></span></div>`
      + metric.map(item).join('')
      + (cohort.length ? '<div class="g-q-bar"><span class="g-q-group">대상자 SQL · 실험마다 다른 부분(마킹표 실험의 고정 조각)</span></div>' + cohort.map(item).join('') : '');
    box.querySelectorAll('.g-copy').forEach(btn => btn.addEventListener('click', () => { const q = d.queries.find(x => x.key === btn.dataset.copy); if (!q) return;
      copyText(q.sql, () => { btn.textContent = '복사됨'; setTimeout(() => { btn.textContent = '복사'; }, 1200); }); }));
    const tg = $('guideQueriesToggle'); if (tg) tg.addEventListener('click', () => { const all = Array.from(box.querySelectorAll('details.g-q')); const open = all.some(x => !x.open);
      all.forEach(x => { x.open = open; }); tg.textContent = open ? '모두 접기' : '모두 펼치기'; });
    if (guideOpenKey) { const el = Array.from(box.querySelectorAll('details.g-q')).find(x => x.dataset.key === guideOpenKey);
      if (el) { el.open = true; setTimeout(() => el.scrollIntoView({ block: 'start' }), 0); } }
  }
  
  let guideSpyBound = false;
  function guideSpy() {
    const sc = document.querySelector('.content-scroll'); const links = Array.from(document.querySelectorAll('#page-abguide .guide-toc a'));
    if (!sc || !links.length) return;
    const update = () => { if (state.page !== 'abguide') return;
      const top = sc.getBoundingClientRect().top + 90; let cur = links[0].dataset.sec;
      links.forEach(a => { const el = $(a.dataset.sec); if (el && el.getBoundingClientRect().top <= top) cur = a.dataset.sec; });
      if (sc.scrollTop + sc.clientHeight >= sc.scrollHeight - 4) cur = links[links.length - 1].dataset.sec;   
      links.forEach(a => a.classList.toggle('active', a.dataset.sec === cur)); };
    if (!guideSpyBound) { guideSpyBound = true; let raf = 0; sc.addEventListener('scroll', () => { if (raf) return; raf = requestAnimationFrame(() => { raf = 0; update(); }); }, { passive: true }); }
    update();
  }
  
  function openGuide(sec) { showPage('abguide'); const el = sec ? $('g-' + sec) : null; if (el) setTimeout(() => el.scrollIntoView({ block: 'start', behavior: 'smooth' }), 0); }
  window.openAdGuide = () => openGuide('iaa');   
  window.openGuide = openGuide;
  document.addEventListener('click', ev => { const t = ev.target.closest && ev.target.closest('.ab-info[data-guide]'); if (t) { ev.preventDefault(); ev.stopPropagation(); openGuide(t.dataset.guide); } }, true);
  document.querySelectorAll('#page-abguide .guide-toc a').forEach(a => a.addEventListener('click', () => { const el = $(a.dataset.sec); if (el) el.scrollIntoView({ block: 'start', behavior: 'smooth' }); }));
  { const pg = new URLSearchParams(location.search).get('page'); if (pg && (AB_PAGES[pg] || pg === 'abtesting' || document.getElementById('page-' + pg))) showPage(pg); }   
  
  document.querySelectorAll('.period-tab').forEach(btn => btn.addEventListener('click', () => {
    const group = btn.closest('.card, .placeholder-page');
    (group || document).querySelectorAll('.period-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  }));
  $('abExpSelect').addEventListener('change', ev => selectExperiment(+ev.target.value));
  window.togglePanel = function () {};   

  let menuEl = null;
  function statusMeta(e) {
    if (e.status === 'running') return { label: 'Running', color: COLORS.green, dot: true };
    if (e.status === 'candidate') return { label: '후보', color: '#B45309', dot: false };
    if (e.status === 'done') return { label: e.result === 'adopted' ? '완료·채택' : e.result === 'rejected' ? '완료·기각' : '완료', color: '#6B7280', dot: false };
    return { label: e.status, color: '#9CA3AF', dot: false };
  }
  function menuItem(e) {
    const m = statusMeta(e); const h = e.headline;
    const up = h && h.uplift_pct != null ? fmtPct(h.uplift_pct) : (h && h.guard ? h.guard : '–');
    const upColor = h && h.uplift_pct != null ? sigColor(h.guard ? null : h.label, h.uplift_pct, COLORS.gray) : COLORS.gray;   
    const dur = e.status === 'done' ? AbMath.durationDays(e.exposure_start_ts, e.end_ts) : null;   
    const days = dur != null ? `${dur}일 진행` : (e.day_k != null ? `D${e.day_k}` : 'D0 미정');
    const meta = [days, e.cohort_type === 'rule' ? '규칙' : `is_pair ${e.default_scope}`].join(' · ');
    return `<div class="ab-menu-item${state.current && state.current.markingidx === e.markingidx ? ' active' : ''}" data-m="${e.markingidx}" role="option">
      <span class="mi-id">#${AbMath.displayNo(e)}</span><span class="mi-title" title="${esc(e.title)}">${esc(e.title)}</span>
      <span class="mi-meta">${meta}</span>
      <span class="mi-meta" style="color:${m.color};font-weight:600;">${m.dot ? '● ' : ''}${m.label}</span>
      <span class="mi-up" style="color:${upColor};">${up}</span></div>`;
  }
  function openMenu() {
    closeMenu();
    const groups = [['진행중', state.menuList.filter(e => e.status === 'running')], ['후보 (D0·추적 설정 필요)', state.menuList.filter(e => e.status === 'candidate')], ['완료 (올해 시작한 실험)', state.menuList.filter(e => e.status === 'done').sort(AbMath.byEndDesc)]];   
    menuEl = document.createElement('div'); menuEl.id = 'abExpMenu'; menuEl.className = 'ab-menu'; menuEl.setAttribute('role', 'listbox');
    menuEl.innerHTML = groups.filter(([, l]) => l.length).map(([g, l]) => `<div class="ab-menu-group">${g} · ${l.length}</div>` + l.map(menuItem).join('')).join('') || '<div class="ab-menu-group">표시할 실험 없음</div>';
    const r = $('abExpPicker').getBoundingClientRect();
    menuEl.style.left = `${Math.max(8, r.left)}px`; menuEl.style.top = `${r.bottom + 6}px`;
    menuEl.style.minWidth = `${Math.max(440, r.width)}px`; menuEl.style.maxWidth = `${Math.min(640, window.innerWidth - r.left - 16)}px`;
    menuEl.style.maxHeight = `${Math.max(160, Math.min(380, window.innerHeight - r.bottom - 20))}px`;
    document.body.appendChild(menuEl);
    menuEl.querySelectorAll('.ab-menu-item').forEach(it => it.addEventListener('click', () => { closeMenu(); selectExperiment(+it.dataset.m); }));
    setTimeout(() => document.addEventListener('click', onDocClick), 0);
    document.addEventListener('keydown', onKey); window.addEventListener('resize', closeMenu); document.querySelector('.content-scroll')?.addEventListener('scroll', closeMenu, { once: true });
  }
  function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; } document.removeEventListener('click', onDocClick); document.removeEventListener('keydown', onKey); window.removeEventListener('resize', closeMenu); }
  function onDocClick(ev) { if (menuEl && !menuEl.contains(ev.target) && !$('abExpPicker').contains(ev.target)) closeMenu(); }
  function onKey(ev) { if (ev.key === 'Escape') closeMenu(); }
  $('abExpPicker').addEventListener('click', ev => { ev.preventDefault(); menuEl ? closeMenu() : openMenu(); });
  $('abExpPicker').addEventListener('keydown', ev => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); menuEl ? closeMenu() : openMenu(); } });

  window.toggleHistory = function () { state.historyOpen = !state.historyOpen; $('abHistoryPanel').style.display = state.historyOpen ? '' : 'none'; setText('abHistoryToggle', state.historyOpen ? '이력 닫기 ↑' : '이력 전체 보기 →'); if (state.historyOpen) renderHistory(); };
  function renderHistory() {
    const rows = abVisible().sort((a, b) => String(b.marking_start_ts || b.exposure_start_ts || '').localeCompare(String(a.marking_start_ts || a.exposure_start_ts || '')));   
    const d10 = (v) => (v ? String(v).slice(0, 10) : '–');
    $('abHistoryPanel').innerHTML = `<div style="font-size:11px;color:#9CA3AF;margin-bottom:8px;">전체 ${rows.length}건 · archived는 마킹 시작이 2026-09 이전인 과거 실험(자동 보관). "편집"으로 D0·종료일·결과를 넣고 추적을 켜면 다음 적재 때 완료 탭에 최종값이 들어온다.</div>
      <div style="max-height:380px;overflow:auto;border:1px solid #ECEEF2;border-radius:8px;"><table class="ab-hist"><thead><tr><th>#</th><th>실험명</th><th>상태</th><th>마킹 시작</th><th>D0</th><th>종료</th><th>결과</th><th>추적</th><th></th></tr></thead><tbody>
      ${rows.map(e => `<tr><td style="color:#9CA3AF;">${AbMath.displayNo(e)}</td><td style="font-weight:600;color:#111;">${esc(e.title)}</td><td style="color:${statusMeta(e).color};">${statusMeta(e).label}</td><td>${d10(e.marking_start_ts)}</td><td>${d10(e.exposure_start_ts)}</td><td>${d10(e.end_ts)}</td><td>${e.result === 'adopted' ? '채택' : e.result === 'rejected' ? '기각' : '–'}</td><td>${e.is_tracked ? 'ON' : 'off'}</td><td><button class="btn-mini" onclick="editExperiment(${e.markingidx})">편집</button></td></tr>`).join('')}
      </tbody></table></div>`;
  }
  window.editExperiment = async function (m) {
    await selectExperiment(m);
    if ($('abEditPanel').style.display === 'none') toggleEditPanel(); else fillEdit(state.current);
    $('abEditPanel').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  document.addEventListener('DOMContentLoaded', () => { loadExperiments().catch(err => status(`목록 로드 실패: ${err.message}`, true)); });
})();
