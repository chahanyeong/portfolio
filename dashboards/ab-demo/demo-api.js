/* AB 대시보드 데모 shim — window.fetch 를 가로채 '/api/...' 요청을 demo-data.js(합성 데이터)로 응답한다.
 * 서버가 없는 정적 호스팅(file:// 포함)에서도 동작하며, 외부로 나가는 요청은 없다. 저장·재계산·승인 같은 쓰기는 실제로 저장하지 않고 토스트로 알린다. */
(function () {
  'use strict';
  var D = window.__DEMO__ || {};
  var realFetch = window.fetch ? window.fetch.bind(window) : null;
  var exps = JSON.parse(JSON.stringify(D.experiments || { experiments: [] }));   // 편집 패널 저장을 화면 안에서만 반영하기 위한 사본
  var NOTE = '데모에서는 저장되지 않아요';

  function json(body, status) {
    return Promise.resolve(new Response(JSON.stringify(body), { status: status || 200, headers: { 'Content-Type': 'application/json' } }));
  }
  function scopeKey(s) {   // '1,0' → '0,1' (중복 제거·정렬)
    var a = String(s || '').split(',').map(Number).filter(function (n) { return !isNaN(n); });
    a = a.filter(function (v, i) { return a.indexOf(v) === i; }).sort(function (x, y) { return x - y; });
    return a.join(',');
  }
  function defaultScope(m) {
    var e = exps.experiments.filter(function (r) { return r.markingidx === m; })[0];
    return e ? scopeKey(e.default_scope) : '1';
  }
  var toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!document.body) return;
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.style.cssText = 'position:fixed;left:50%;bottom:56px;transform:translateX(-50%);background:#111827;color:#fff;font-size:13px;padding:9px 16px;border-radius:999px;z-index:100001;box-shadow:0 6px 20px rgba(0,0,0,.25);transition:opacity .2s;pointer-events:none;max-width:90vw;';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg; toastEl.style.opacity = '1';
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { toastEl.style.opacity = '0'; }, 2600);
  }
  window.__demoToast = toast;

  function route(method, path, query, body) {
    var m, q = new URLSearchParams(query || '');
    if (method === 'GET') {
      if (path === 'experiments') return json(exps);
      if ((m = path.match(/^experiments\/(\d+)\/series$/))) {
        var key = m[1] + '|' + (q.get('scope') != null ? scopeKey(q.get('scope')) : defaultScope(+m[1]));
        return D.series && D.series[key] ? json(D.series[key]) : json({ detail: '적재 대기' }, 404);
      }
      if ((m = path.match(/^experiments\/(\d+)\/sa$/))) {
        var k2 = m[1] + '|' + (q.get('scope') != null ? scopeKey(q.get('scope')) : defaultScope(+m[1])) + '|' + (q.get('segment') || 'all');
        return D.sa && D.sa[k2] ? json(D.sa[k2]) : json({ detail: '유저 단위 자료 없음' }, 404);
      }
      if ((m = path.match(/^experiments\/(\d+)\/runs\/latest$/))) return json({ run: (D.runs || {})[m[1]] || null });
      if ((m = path.match(/^runs\/(.+)$/))) return json({ run_id: m[1], status: 'SUCCESS', start_time: null, end_time: null });
      if (path === 'rule/experiments') return json(D.rule_experiments || { experiments: [] });
      if ((m = path.match(/^rule\/experiments\/(\d+)\/sql$/))) return json({ versions: (D.rule_sql || {})[m[1]] || [] });
      if (path === 'rule/candidates') return json(D.rule_candidates || { candidates: [], recent_days: 28 });
      if (path === 'rule/draft/recent' || path === 'rule/draft') return json(D.rule_draft_recent || { requests: [] });
      if (path === 'guide/queries') return json(D.guide_queries || { ready: false, queries: [] });
      return json({});
    }
    // ── 쓰기 요청: 저장하지 않는다 ──
    toast(NOTE);
    var b = {}; try { b = body ? JSON.parse(body) : {}; } catch (e) { b = {}; }
    if ((m = path.match(/^experiments\/(\d+)$/)) && method === 'PUT') {
      var row = exps.experiments.filter(function (r) { return r.markingidx === +m[1]; })[0];
      var skip = { exposure_start_ts: 1, end_ts: 1, full_rollout_ts: 1, status: 1, needs_recompute: 1, planned_days: 1, default_scope: 1, exp_kind: 1 };
      if (row) Object.keys(b).forEach(function (k) { if (!skip[k] && k in row) row[k] = b[k]; });   // 글자 필드만 화면 안에서 반영(새로고침하면 원래대로)
      return json({ experiment: row || b });
    }
    if (/\/recompute$/.test(path)) return json({ launched: true, run_id: 'demo-run', status: 'SUCCESS' });
    if (path === 'rule/dryrun') return json(D.rule_dryrun || { ok: true, preview: {} });
    if (path === 'rule/experiments') return json({ experiment: Object.assign({ status: 'running', cohort_type: 'rule' }, b), preview: (D.rule_dryrun || {}).preview || {} }, 201);
    if (/^rule\/experiments\/\d+\/sql$/.test(path)) return json({ sql: { version: 2 }, preview: (D.rule_dryrun || {}).preview || {}, run: { launched: false, reason: NOTE } });
    if (/\/sql\/approve$/.test(path)) return json({ sql: { is_draft: false } });
    if (path === 'rule/draft') return json({ existing: false, request: { id: 0, status: 'queued' } }, 201);
    return json({ ok: true });
  }

  window.fetch = function (input, init) {
    var url = typeof input === 'string' ? input : (input && input.url) || String(input);
    var m = url.match(/(?:^|\/)api\/([^?#]*)(?:\?([^#]*))?/);
    if (!m) return realFetch ? realFetch(input, init) : Promise.reject(new Error('offline demo'));
    var method = ((init && init.method) || (input && input.method) || 'GET').toUpperCase();
    return route(method, m[1].replace(/\/+$/, ''), m[2] || '', init && init.body);
  };

  // 상단 안내 배너(레이아웃을 밀지 않도록 오른쪽 아래 고정 · 클릭 불가)
  function banner() {
    var b = document.createElement('div');
    b.textContent = '포트폴리오용 데모 · 모든 수치는 예시 데이터입니다';
    b.style.cssText = 'position:fixed;right:12px;bottom:10px;z-index:100000;background:rgba(17,24,39,.86);color:#fff;font-size:11.5px;letter-spacing:.01em;padding:6px 12px;border-radius:999px;pointer-events:none;box-shadow:0 2px 8px rgba(0,0,0,.18);';
    document.body.appendChild(b);
  }
  if (document.body) banner(); else document.addEventListener('DOMContentLoaded', banner);
})();
