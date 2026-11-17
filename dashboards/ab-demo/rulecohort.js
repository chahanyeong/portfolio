

(function () {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const st = { all: 0, cands: [], list: [], editing: null, sel: null, drafts: {}, draftTimer: null };   
  async function api(url, opts) {
    const r = await fetch(url, opts); let body = null; try { body = await r.json(); } catch (e) {  }
    if (!r.ok) { const d = body && body.detail; const err = new Error(d ? (typeof d === 'string' ? d : JSON.stringify(d)) : `HTTP ${r.status}`); err.status = r.status; throw err; }
    return body;
  }
  const msg = (t, bad) => { const el = $('rcMsg'); el.textContent = t || ''; el.style.color = bad ? '#DC2626' : '#6B7280'; };
  const fmtTs = (s) => s ? String(s).slice(0, 16) : '–';
  const META_IDS = ['rc-markingidx', 'rc-marking_no', 'rc-title', 'rc-split_desc', 'rc-exposure_start_ts', 'rc-planned_days', 'rc-primary_metric'];   
  
  const RUN_LABEL = { QUEUED: '대기열', STARTING: '시작 중', STARTED: '적재 중', SUCCESS: '적재 완료', FAILURE: '적재 실패(적재 잡 확인)', CANCELED: '취소됨' };
  let runTimer = null;
  function trackRun(run, prefix) {
    if (runTimer) { clearInterval(runTimer); runTimer = null; }
    if (!run) return;
    if (!run.launched) { msg(`${prefix} · ${run.reason || '즉시 실행 안 됨'}`); return; }
    const tick = async () => {
      try { const r = await api(`/api/runs/${run.run_id}`); msg(`${prefix} · 재계산 ${RUN_LABEL[r.status] || r.status}`, r.status === 'FAILURE');
        if (['SUCCESS', 'FAILURE', 'CANCELED'].includes(r.status)) { clearInterval(runTimer); runTimer = null; if (r.status === 'SUCCESS') { await loadList(); } } }
      catch (e) { msg(`${prefix} · 런 상태 조회 실패: ${e.message}`, true); clearInterval(runTimer); runTimer = null; }
    };
    tick(); runTimer = setInterval(tick, 10000);
  }

  const DRAFT_LABEL = { queued: '초안 대기(2분 내 시작)', running: '초안 작성 중…', done: '초안 완료', error: '초안 오류', cancelled: '취소' };
  async function loadDrafts() {
    try { const d = await api('/api/rule/draft/recent'); const map = {}; d.requests.forEach(r => { if (!map[r.markingidx]) map[r.markingidx] = r; }); st.drafts = map; }
    catch (e) {  }
    const active = Object.values(st.drafts).some(r => r.status === 'queued' || r.status === 'running');
    if (active && !st.draftTimer) st.draftTimer = setInterval(async () => { const before = JSON.stringify(Object.values(st.drafts).map(r => [r.id, r.status])); await loadDrafts(); if (JSON.stringify(Object.values(st.drafts).map(r => [r.id, r.status])) !== before) { await loadList(); await loadCandidates(); } else renderCandidates(); }, 20000);
    if (!active && st.draftTimer) { clearInterval(st.draftTimer); st.draftTimer = null; }
  }
  function draftChip(m) {
    const r = st.drafts[m]; if (!r) return '';
    const cls = r.status === 'done' ? 'new' : r.status === 'error' ? 'reg' : 'mark';
    const tip = r.status === 'error' ? esc(r.error || '') : (r.result && r.result.applied ? esc(r.result.applied.note || '') : '');
    return ` <span class="rc-badge ${cls}" title="${tip}">${DRAFT_LABEL[r.status] || esc(r.status)}</span>`;
  }
  window.rcDraft = async function (m, title) {
    msg(`#${m} 초안 요청 중…`);
    try { const d = await api('/api/rule/draft', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ markingidx: m, title: title || null, hint: $('rc-note').value.trim() || null }) });
      msg(d.existing ? `#${m} 는 이미 초안 요청이 진행 중입니다` : `#${m} 초안 요청 등록 — 초안 작성 도우미가 사내 문서와 기존 규칙 SQL 을 읽고 작성합니다(보통 2~5분). 완료되면 목록에 "초안(검토 전)"으로 나타납니다.`);
      await loadDrafts(); renderCandidates(); }
    catch (e) { msg(e.message, true); }
  };
  window.rcApprove = async function (m) {
    if (!confirm(`#${m} 의 현재 SQL 초안을 승인합니다. 승인 후에도 'SQL 보기/수정'으로 새 버전을 만들 수 있습니다.`)) return;
    try { const d = await api(`/api/rule/experiments/${m}/sql/approve`, { method: 'POST' }); msg(`#${m} 초안 승인됨`); await loadList(); await loadCandidates(); if (d && d.run) trackRun(d.run, `#${m} 초안 승인`); }
    catch (e) { msg(e.message, true); }
  };

  async function loadCandidates() {
    try { const d = await api('/api/rule/candidates'); st.cands = d.candidates; renderCandidates(); $('rcStatus').textContent = `후보 ${st.cands.length}건`; }
    catch (e) { $('rcCandidates').querySelector('tbody').innerHTML = `<tr><td colspan="5" class="rc-err">후보 조회 실패: ${esc(e.message)}</td></tr>`; }
  }
  function renderCandidates() {

    const touch = (c) => [c.start_date || '', c.update_date || ''].sort().pop();
    const rows = (st.all ? st.cands.slice() : st.cands.filter(c => !c.registered && !c.has_marking)).sort((a, b) => (touch(a) < touch(b) ? 1 : touch(a) > touch(b) ? -1 : b.markingidx - a.markingidx));
    const tb = $('rcCandidates').querySelector('tbody');
    if (!rows.length) { tb.innerHTML = `<tr><td colspan="5" style="color:#9CA3AF;">${st.all ? '후보 없음' : '등록하지 않은 규칙 실험이 없습니다 · 전체 보기 또는 직접 입력'}</td></tr>`; return; }
    tb.innerHTML = rows.map(c => `<tr class="${st.sel === c.markingidx ? 'rc-sel' : ''}">
      <td style="color:#9CA3AF;">${c.markingidx}</td>
      <td><div style="font-weight:600;color:#111;">${esc(c.title)}</div><div style="margin-top:3px;">${c.recent ? '<span class="rc-badge new">신규</span> ' : ''}${c.registered ? (c.registered_type === 'rule' ? `<span class="rc-badge reg">규칙 실험 등록됨 · ${esc(c.registered_status)}</span>` : `<span class="rc-badge mark">마킹형 · ${esc(c.registered_status)}</span>`) : (c.has_marking ? '<span class="rc-badge mark">마킹표 있음 · Pairwise AB 자동 후보 대상</span>' : '')}</div></td>
      <td style="font-size:11.5px;color:#6B7280;">${esc(c.test_condition)}</td>
      <td style="white-space:nowrap;">${fmtTs(c.start_date).slice(0, 10)}${c.update_date && String(c.update_date).slice(0, 10) !== String(c.start_date || '').slice(0, 10) ? `<div style="font-size:10px;color:#9CA3AF;">수정 ${String(c.update_date).slice(0, 10)}</div>` : ''}</td>
      <td style="white-space:nowrap;">${c.registered
        ? (c.registered_type === 'rule' ? `<button class="btn-mini" onclick="rcEdit(${c.markingidx})">SQL 보기/수정</button>` : `<a class="btn-mini" style="text-decoration:none;display:inline-block;" href="/?exp=${c.markingidx}&edit=1" title="마킹표가 있는 실험은 Pairwise AB 탭의 자동 후보 — 실험 편집에서 D0 와 추적을 설정하면 적재됩니다">Pairwise AB에서 설정 →</a>`)
        : `<button class="btn-mini" onclick="rcPick(${c.markingidx})">선택</button>${c.has_marking ? '' : ` <button class="btn-mini" onclick="rcDraft(${c.markingidx}, ${JSON.stringify(c.title || '')})" title="초안 작성 도우미가 사내 문서·기존 규칙 SQL 을 보고 조각 초안을 작성합니다(메모 칸의 내용은 힌트로 전달)">초안 생성</button>`}`}${draftChip(c.markingidx)}</td></tr>`).join('');
  }
  window.rcSetAll = function (v) { st.all = v; document.querySelectorAll('#rcCandToggle .rc-chip').forEach(b => b.classList.toggle('active', Number(b.dataset.all) === v)); renderCandidates(); };
  window.rcPick = function (m) {
    const c = st.cands.find(x => x.markingidx === m); if (!c) return;
    window.rcReset(); st.sel = m; renderCandidates();
    $('rc-markingidx').value = m; $('rc-title').value = c.title || ''; $('rc-split_desc').value = c.test_condition ? `실험군 : ${c.test_condition}` : ''; $('rc-marking_no').value = '';
    $('rc-exposure_start_ts').value = c.setting_start ? String(c.setting_start).slice(0, 19) : '';   
    msg(c.has_marking ? '마킹표가 있는 실험입니다 — 보통 Pairwise AB 탭의 자동 후보로 처리합니다. 규칙 코호트로 등록하려면 계속하세요.' : '공개 시각 D0(UTC)와 SQL 조각을 입력한 뒤 드라이런하세요.');
  };
  window.rcManual = function () { window.rcReset(); $('rc-markingidx').focus(); msg('후보에 없는 번호를 직접 입력합니다(예: 141처럼 조건이 바뀐 경우).'); };
  window.rcToggleSame = function () { $('rcAuWrap').style.display = $('rc-same').checked ? 'none' : ''; };
  window.rcReset = function () {
    st.editing = null; st.sel = null;
    [...META_IDS, 'rc-rev_sql', 'rc-au_sql', 'rc-note'].forEach(id => { $(id).value = ''; $(id).disabled = false; });
    $('rc-primary_metric').value = 'arpu'; $('rc-same').checked = true; window.rcToggleSame(); $('rcDryResult').style.display = 'none'; msg('');
    $('rcFormTitle').textContent = '등록 폼'; $('rcSaveBtn').textContent = '저장'; $('rcHistory').style.display = 'none'; renderCandidates();
  };

  function formSql() { return { rev_sql: $('rc-rev_sql').value.trim(), au_sql: $('rc-same').checked ? '' : $('rc-au_sql').value.trim() }; }
  function showDry(d) {
    const box = $('rcDryResult'); box.style.display = '';
    if (!d.ok) { box.innerHTML = `<div class="rc-err">드라이런 실패\n${esc(Object.entries(d.errors).map(([k, v]) => `${k}: ${v.join('; ')}`).join('\n'))}</div>`; return false; }
    const n = (v) => (v == null ? '–' : Number(v).toLocaleString());
    const row = (slot, p) => `<div><b>${slot === 'rev' ? '매출용' : 'AU용'}</b> · 행 ${n(p.rows)} · 유저 ${n(p.users)} · 실험군 ${n(p.test_rows)} / 대조군 ${n(p.cont_rows)}${p.first_mkdt ? ` · 편입 ${esc(p.first_mkdt)} ~ ${esc(p.last_mkdt)}` : ''}</div>`;
    box.innerHTML = `<div class="rc-ok" style="font-weight:600;margin-bottom:4px;">드라이런 통과${d.elapsed_ms ? ` (${d.elapsed_ms} ms)` : ''}</div>${row('rev', d.preview.rev || {})}${row('au', d.preview.au || {})}<div style="margin-top:6px;color:#9CA3AF;">인원이 기대와 다르면 저장 전에 SQL 을 다시 확인하세요 — 문법·열 오류는 잡지만 조건을 잘못 쓴 논리 오류는 드라이런이 잡지 못합니다.</div>`;
    return true;
  }
  window.rcDryRun = async function () {
    const e = st.editing ? st.list.find(x => x.markingidx === st.editing) : null;
    const start = e ? (e.exposure_start_ts || '') : $('rc-exposure_start_ts').value.trim();
    msg('드라이런 중… (최대 60초)');
    try { const d = await api('/api/rule/dryrun', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formSql(), start_dt: start }) }); showDry(d); msg(d.ok ? '드라이런 통과 — 인원을 확인하고 저장하세요' : '형식 또는 SQL 오류 — 아래 내용을 고치세요', !d.ok); }
    catch (err) { msg(`드라이런 오류: ${err.message}`, true); }
  };
  window.rcSave = async function () {
    msg('저장 중(드라이런 포함)…'); $('rcSaveBtn').disabled = true;
    try {
      if (st.editing) {
        const d = await api(`/api/rule/experiments/${st.editing}/sql`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...formSql(), note: $('rc-note').value.trim() || null }) });
        showDry({ ok: true, preview: d.preview }); trackRun(d.run, `#${st.editing} SQL 버전 ${d.sql.version} 저장`);
      } else {
        const body = { markingidx: $('rc-markingidx').value.trim(), marking_no: $('rc-marking_no').value.trim(), title: $('rc-title').value.trim(), split_desc: $('rc-split_desc').value.trim(), exposure_start_ts: $('rc-exposure_start_ts').value.trim(),
          planned_days: $('rc-planned_days').value.trim(), primary_metric: $('rc-primary_metric').value, note: $('rc-note').value.trim() || null, ...formSql() };
        const d = await api('/api/rule/experiments', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        showDry({ ok: true, preview: d.preview }); msg(`#${AbMath.displayNo(d.experiment)} 등록됨(running·추적 ON) — 10분 안에 D−28부터 적재되고 Non-pairwise AB 탭(실험 종류를 광고로 바꾸면 광고 AB 탭)에 나타납니다`);
      }
      await Promise.all([loadList(), loadCandidates()]);
    } catch (err) { msg(err.message, true); }
    finally { $('rcSaveBtn').disabled = false; }
  };

  async function loadList() {
    const tb = $('rcList').querySelector('tbody');
    try { st.list = (await api('/api/rule/experiments')).experiments; } catch (e) { tb.innerHTML = `<tr><td colspan="7" class="rc-err">${esc(e.message)}</td></tr>`; return; }
    tb.innerHTML = st.list.length ? st.list.map(e => `<tr><td style="color:#9CA3AF;">${AbMath.displayNo(e)}</td><td style="font-weight:600;color:#111;">${esc(e.title)}${e.sql_is_draft ? ' <span class="rc-badge mark" title="자동 초안 — 승인 전에도 그대로 적재됩니다. 근거는 SQL 보기/수정에서">초안(검토 전)</span>' : ''}${!e.exposure_start_ts ? ' <span class="rc-badge reg" title="실험 편집(Non-pairwise AB 탭)에서 공개 시각 D0 를 넣고 추적을 켜면 적재됩니다">D0 입력 필요</span>' : ''}</td><td>${esc(e.status)}${e.needs_recompute ? ' · <span style="color:#D97706;">재계산 대기</span>' : ''}</td><td style="white-space:nowrap;">${fmtTs(e.exposure_start_ts)}</td><td>${e.sql_version ? 'v' + e.sql_version : '<span class="rc-err">없음</span>'}</td><td style="white-space:nowrap;">${fmtTs(e.sql_created_at)}</td><td style="white-space:nowrap;">${e.sql_is_draft ? `<button class="btn-mini" onclick="rcApprove(${e.markingidx})">승인</button> ` : ''}<button class="btn-mini" onclick="rcEdit(${e.markingidx})">SQL 보기/수정</button>${!e.exposure_start_ts ? ` <a class="btn-mini" style="text-decoration:none;display:inline-block;" href="/?exp=${e.markingidx}&edit=1">D0 설정 →</a>` : ''}</td></tr>`).join('')
      : '<tr><td colspan="7" style="color:#9CA3AF;">등록된 규칙 실험이 없습니다</td></tr>';
  }
  window.rcEdit = async function (m) {
    const e = st.list.find(x => x.markingidx === m); if (!e) return;
    let versions = []; try { versions = (await api(`/api/rule/experiments/${m}/sql`)).versions; } catch (err) { msg(err.message, true); return; }
    const cur = versions.find(v => v.is_current) || versions[0];
    window.rcReset(); st.editing = m;
    $('rcFormTitle').textContent = `#${m} · ${e.title} — SQL 수정(저장하면 v${(cur ? cur.version : 0) + 1})`;
    $('rc-markingidx').value = m; $('rc-title').value = e.title || ''; $('rc-split_desc').value = e.split_desc || ''; $('rc-exposure_start_ts').value = e.exposure_start_ts || ''; $('rc-marking_no').value = e.marking_no || '';   
    $('rc-planned_days').value = e.planned_days ?? ''; $('rc-primary_metric').value = e.primary_metric || 'arpu';
    META_IDS.forEach(id => $(id).disabled = true);   
    if (cur) { $('rc-rev_sql').value = cur.rev_sql; const same = cur.rev_sql.trim() === cur.au_sql.trim(); $('rc-same').checked = same; window.rcToggleSame(); if (!same) $('rc-au_sql').value = cur.au_sql; }
    $('rcSaveBtn').textContent = '새 버전 저장';
    const h = $('rcHistory'); h.style.display = '';
    const pre = (sql) => `<pre class="rc-ta" style="margin:6px 0 0;max-height:220px;overflow:auto;">${esc(sql)}</pre>`;
    
    let draftBox = '';
    if (cur && cur.is_draft) {
      const req = st.drafts[m], res = (req && req.result) || {};
      const srcs = (cur.sources || res.sources || []).map(x => { const su = safeUrl(x.url); return `<li>${esc(x.type)} ${esc(x.id)}${x.title ? ' · ' + esc(x.title) : ''}${su ? ` · <a href="${esc(su)}" target="_blank" rel="noopener">열기</a>` : ''}</li>`; }).join('');
      const oq = (res.open_questions || []).map(q => `<li>${esc(q)}</li>`).join('');
      draftBox = `<div style="border:1px solid #FDE68A;background:#FFFBEB;border-radius:8px;padding:10px 12px;margin-bottom:12px;font-size:12px;line-height:1.6;">
        <div style="font-weight:700;color:#92400E;margin-bottom:4px;">초안(검토 전) · 확신도 ${esc(res.confidence || '?')}${res.d0_guess ? ` · D0 추정 ${esc(res.d0_guess)} (${esc(res.d0_basis || '')})` : ' · D0 추정 없음'}</div>
        <div style="white-space:pre-wrap;">${esc(cur.rationale || res.rationale || '')}</div>
        ${srcs ? `<div style="margin-top:6px;"><b>출처</b><ul style="margin:2px 0 0 16px;">${srcs}</ul></div>` : ''}
        ${oq ? `<div style="margin-top:6px;"><b>확인 필요</b><ul style="margin:2px 0 0 16px;">${oq}</ul></div>` : ''}
        <div style="margin-top:8px;"><button class="btn-mini" onclick="rcApprove(${m})">이 초안 승인</button> <span style="color:#9CA3AF;">틀리면 위 폼에서 고쳐 '새 버전 저장'</span></div></div>`;
    }
    h.innerHTML = draftBox + `<div class="rc-label" style="margin-bottom:6px;">#${m} SQL 이력</div>` + (versions.length
      ? versions.map(v => `<details style="margin-bottom:6px;"><summary style="cursor:pointer;font-size:12px;">v${v.version}${v.is_current ? ' <span class="rc-badge new">현재</span>' : ''}${v.is_draft ? ' <span class="rc-badge mark">초안</span>' : ''} · ${fmtTs(v.created_at)} · ${esc(v.created_by || '')}${v.note ? ' · ' + esc(v.note) : ''}</summary>${pre(v.rev_sql)}${v.rev_sql.trim() !== v.au_sql.trim() ? pre(v.au_sql) : ''}</details>`).join('')
      : '<div style="color:#9CA3AF;font-size:12px;">버전 없음</div>');
    $('rcFormCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  
  function safeUrl(u) { const s = String(u || ''); return /^https?:\/\//i.test(s) ? s : ''; }
  window.initRuleCohortPage = async function () { await loadDrafts(); loadCandidates(); loadList(); };
})();
