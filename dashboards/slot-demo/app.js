/*
 * 신규 슬롯 트래킹 대시보드 · 데모 렌더러
 * 목적  : data.js 의 합성 시나리오를 선택해 판정 카드·표·차트 6개 섹션을 다시 그린다.
 * 입력  : window.SLOT_DATA (data.js), URL 해시(#weak | #strong | #avg)로 초기 시나리오 지정 가능
 * 출력  : DOM 렌더링(Chart.js 4.4). 외부 요청 없음.
 * 색    : 금주=파랑, 전주=주황, 기준(8개 평균)=회색(비교 기준은 무채색). 판정 색(초록/빨강)은 최근 8개 슬롯 범위를 벗어난 값에만 사용.
 */
(function () {
  'use strict';
  var D = window.SLOT_DATA.scenarios;
  var C = { s1: '#2a78d6', s2: '#eb6834', s3: '#1baf7a', s4: '#eda100', ref: '#6B7280', other: '#C4C9D4', grid: '#EEF0F3', tick: '#9CA3AF' };
  var CAT_COLORS = [C.s1, C.s2, C.s3, C.s4, C.other];
  var charts = [];
  var MINUS = '−';

  function $(id) { return document.getElementById(id); }
  function sg(v, d) { d = d == null ? 1 : d; var s = Math.abs(v).toFixed(d); return (v < 0 ? MINUS : '+') + s; }
  function pct(v, d) { return v == null ? '–' : v.toFixed(d == null ? 1 : d) + '%'; }
  function int(v) { return Math.round(v).toLocaleString('en-US'); }
  function spinFmt(v) { return v >= 1e6 ? int(v / 1e4) + '만 회' : int(v) + ' 회'; }
  function auFmt(v) { return int(v) + '명'; }

  // 최근 8개 슬롯 범위 대비 상태: 범위 밖일 때만 색(g/b). higherGood=값이 클수록 유리한 지표인지
  function status(v, lo, hi, higherGood) {
    if (v < lo) return { c: higherGood ? 'b' : 'g', t: '범위 하회', i: '▼' };
    if (v > hi) return { c: higherGood ? 'g' : 'b', t: '범위 상회', i: '▲' };
    return { c: 'n', t: '범위 내', i: '●' };
  }
  function chip(st) { return '<span class="k-chip ' + st.c + '"><span aria-hidden="true">' + st.i + '</span>' + st.t + '</span>'; }

  // ---------- 판정 + KPI ----------
  function renderVerdict(s) {
    var M = s.M, now = s.now;
    var lowPeak = M.cur.peak < M.peak.avg;
    var fastDrop = M.cur.dropPct > M.dropPct.avg;
    var review = lowPeak && fastDrop;
    var el = $('v-badge');
    el.className = 'v-badge ' + (review ? 'review' : 'hold');
    el.textContent = review ? '추가 출시 검토' : '추가 출시 불필요 · 관찰 유지';
    var dp = M.cur.peak - M.peak.avg;
    var txt = review
      ? '<b>초반 매출 비중이 낮고(최근 8개 슬롯 평균 대비 ' + sg(dp) + '%p) 최고치 이후 하락도 평균보다 빠름</b> (' + MINUS + M.cur.dropPct.toFixed(0) + '% vs 평균 ' + MINUS + M.dropPct.avg.toFixed(0) + '%). 두 조건 모두 해당하여 추가 출시 여부 검토 필요.'
      : '<b>' + (lowPeak ? '초반 매출 비중은 최근 8개 슬롯 평균보다 낮으나' : '초반 매출 비중이 최근 8개 슬롯 평균 이상(' + sg(dp) + '%p)이고') + (fastDrop ? ' 하락 속도는 평균보다 다소 빠름' : ' 하락 속도는 평균 이하') + '</b> (' + MINUS + M.cur.dropPct.toFixed(0) + '% vs 평균 ' + MINUS + M.dropPct.avg.toFixed(0) + '%). 두 조건이 동시에 충족되지 않아 현 상태 관찰 유지.';
    $('v-sum').innerHTML = txt;

    var base = '최근 8개 슬롯 같은 경과 시간(' + now + '시간) 평균';
    var stPk = status(M.cur.peak, M.peak.min, M.peak.max, true);
    var stNow = status(M.cur.cur, M.now.min, M.now.max, true);
    var stDr = status(M.cur.dropPct, M.dropPct.min, M.dropPct.max, false);
    var stAu = status(s.AU.cur, s.AU.min, s.AU.max, true);
    var stSp = status(s.SP.cur, s.SP.min, s.SP.max, true);
    var auD = (s.AU.cur / s.AU.avg - 1) * 100, spD = (s.SP.cur / s.SP.avg - 1) * 100;
    var drDiff = M.cur.dropPct - M.dropPct.avg;
    var tiles = [
      { l: '초반 매출 비중 최고치', n: pct(M.cur.peak), st: stPk,
        sub: '최근 8개 슬롯 평균 ' + pct(M.peak.avg) + ' 대비 ' + sg(M.cur.peak - M.peak.avg) + '%p<br>8개 슬롯 범위 ' + M.peak.min.toFixed(1) + '~' + M.peak.max.toFixed(1) + '%' },
      { l: '현재 매출 비중 (6시간 이동평균)', n: pct(M.cur.cur), st: stNow,
        sub: base + ' ' + pct(M.now.avg) + ' 대비 ' + sg(M.cur.cur - M.now.avg) + '%p<br>8개 슬롯 범위 ' + M.now.min.toFixed(1) + '~' + M.now.max.toFixed(1) + '%' },
      { l: '최고치 대비 하락폭', n: MINUS + M.cur.dropPct.toFixed(0) + '%', st: stDr, small: '(' + MINUS + M.cur.dropPp.toFixed(1) + '%p)',
        sub: base + ' ' + MINUS + M.dropPct.avg.toFixed(0) + '% 대비 ' + Math.abs(drDiff).toFixed(0) + '%p ' + (drDiff > 0 ? '더 큰' : '더 작은') + ' 하락<br>8개 슬롯 범위 ' + MINUS + M.dropPct.min.toFixed(0) + '~' + MINUS + M.dropPct.max.toFixed(0) + '%' },
      { l: '누적 AU (오픈 후 같은 경과 시간)', n: sg(auD, 0) + '%', st: stAu,
        sub: base + ' ' + auFmt(s.AU.avg) + ' 대비<br>누적 스핀 ' + sg(spD, 0) + '% (' + stSp.t + ')' }
    ];
    $('kpis').innerHTML = tiles.map(function (t) {
      return '<div class="kpi"><div class="k-label">' + t.l + '</div><div class="k-num num">' + t.n + (t.small ? '<small>' + t.small + '</small>' : '') + '</div>' + chip(t.st) + '<div class="k-sub">' + t.sub + '</div></div>';
    }).join('');
  }

  // ---------- 공용 차트 헬퍼 ----------
  function legend(el, items) {
    el.innerHTML = items.map(function (it) {
      var cls = it.kind === 'box' ? 'sw box' : it.kind === 'band' ? 'sw band' : it.kind === 'thick' ? 'sw thick' : 'sw';
      var st = it.kind === 'box' || it.kind === 'band' ? (it.kind === 'box' ? 'background:' + it.color : '') : 'border-color:' + it.color + (it.dash ? ';border-top-style:dashed' : '');
      return '<span><i class="' + cls + '" style="' + st + '"></i>' + it.text + '</span>';
    }).join('');
  }
  var baseOpts = function () {
    return {
      responsive: true, maintainAspectRatio: false, animation: false,
      interaction: { mode: 'index', intersect: false },
      layout: { padding: { top: 4, right: 16 } },
      plugins: {
        legend: { display: false },
        tooltip: { backgroundColor: 'rgba(17,24,39,.92)', padding: 10, titleFont: { size: 11.5, weight: '600' }, bodyFont: { size: 11.5 }, boxWidth: 8, boxHeight: 8, usePointStyle: true, cornerRadius: 8 }
      }
    };
  };
  function yScale(fmt, extra) {
    var o = { grid: { color: C.grid, drawTicks: false }, border: { display: false }, ticks: { color: C.tick, font: { size: 10.5 }, padding: 6, maxTicksLimit: 6, callback: fmt } };
    Object.keys(extra || {}).forEach(function (k) { o[k] = extra[k]; });
    return o;
  }
  var xCat = { grid: { display: false }, border: { color: '#E5E7EB' }, ticks: { color: C.tick, font: { size: 10.5 }, padding: 4, maxRotation: 0, autoSkip: true } };

  // 세로 십자선 + 현재 시점 점선(섹션 1)
  var markers = {
    id: 'markers',
    afterDatasetsDraw: function (ch) {
      var x = ch.scales.x, y = ch.scales.y, c = ch.ctx, o = ch.options.plugins.markers;
      if (!o) return;
      c.save();
      if (o.now != null) {
        var px = x.getPixelForValue(o.now);
        c.setLineDash([4, 4]); c.strokeStyle = 'rgba(79,70,229,.55)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(px, y.top); c.lineTo(px, y.bottom); c.stroke(); c.setLineDash([]);
        c.fillStyle = '#4F46E5'; c.font = '600 10.5px sans-serif';
        var label = '현재 ' + o.now + '시간';
        var w = c.measureText(label).width;
        var lx = px + 6 + w > x.right ? px - w - 6 : px + 6;
        c.fillText(label, lx, y.top + 11);
      }
      var tt = ch.tooltip;
      if (tt && tt.getActiveElements && tt.getActiveElements().length) {
        var ax = tt.getActiveElements()[0].element.x;
        c.strokeStyle = 'rgba(17,24,39,.28)'; c.lineWidth = 1;
        c.beginPath(); c.moveTo(ax, y.top); c.lineTo(ax, y.bottom); c.stroke();
      }
      c.restore();
    }
  };

  // ---------- 1. 시간 단위 매출 비중 흐름 ----------
  function chart1(s) {
    var pts = function (arr) { return arr.map(function (v, i) { return { x: i, y: +v.toFixed(3) }; }); };
    var now = s.now;
    var cur = pts(s.curMa);
    var rt = cur.slice(Math.max(0, now - 5));
    var o = baseOpts();
    o.parsing = false;
    o.plugins.markers = { now: now };
    o.plugins.tooltip.filter = function (it) { return it.dataset.tt !== false; };
    o.plugins.tooltip.callbacks = {
      title: function (it) { var h = it[0].parsed.x; return '오픈 후 ' + h + '시간 (D+' + Math.floor(h / 24) + ')'; },
      label: function (it) { return ' ' + it.dataset.label + ': ' + it.parsed.y.toFixed(1) + '%'; },
      afterBody: function (it) {
        var h = it[0].parsed.x;
        return ['최근 8개 슬롯 범위: ' + s.lo[h].toFixed(1) + '~' + s.hi[h].toFixed(1) + '%'];
      }
    };
    o.scales = {
      x: { type: 'linear', min: 0, max: 336, grid: { display: false }, border: { color: '#E5E7EB' },
        ticks: { stepSize: 24, color: C.tick, font: { size: 10.5 }, padding: 4, callback: function (v) { return v === 0 ? '오픈' : v + 'h'; } },
        title: { display: true, text: '오픈 후 경과 시간', color: C.tick, font: { size: 10.5 } } },
      y: yScale(function (v) { return v + '%'; }, { beginAtZero: true })
    };
    o.onResize = function (ch, size) { ch.options.scales.x.ticks.stepSize = size.width < 520 ? 72 : size.width < 800 ? 48 : 24; };
    var line = function (label, data, color, extra) {
      return Object.assign({ label: label, data: data, borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 0, pointHoverRadius: 4, pointHoverBackgroundColor: color, pointHoverBorderColor: '#fff', pointHoverBorderWidth: 2, tension: 0.25 }, extra || {});
    };
    charts.push(new Chart($('c1'), {
      type: 'line', plugins: [markers],
      data: { datasets: [
        line('최근 8개 최소', pts(s.lo), 'rgba(0,0,0,0)', { tt: false, borderWidth: 0, pointHoverRadius: 0, order: 6 }),
        line('최근 8개 범위', pts(s.hi), 'rgba(0,0,0,0)', { tt: false, borderWidth: 0, pointHoverRadius: 0, fill: '-1', backgroundColor: 'rgba(107,114,128,.14)', order: 6 }),
        line('최근 8개 슬롯 평균', pts(s.avg), C.ref, { order: 4 }),
        line('전주 오픈 슬롯', pts(s.prevMa), C.s2, { order: 3 }),
        line('금주 오픈 슬롯', cur, C.s1, { order: 2 }),
        line('실시간', rt, C.s1, { tt: false, borderWidth: 5, pointRadius: function (c) { return c.dataIndex === rt.length - 1 ? 5 : 0; }, pointBackgroundColor: '#fff', pointBorderColor: C.s1, pointBorderWidth: 2.5, order: 1 })
      ] },
      options: o
    }));
    legend($('lg1'), [
      { text: '금주 오픈 슬롯', color: C.s1 }, { text: '실시간 (최근 6시간)', color: C.s1, kind: 'thick' },
      { text: '전주 오픈 슬롯', color: C.s2 }, { text: '최근 8개 슬롯 평균', color: C.ref }, { text: '최근 8개 슬롯 범위', kind: 'band' }
    ]);
  }

  // ---------- 2. 누적 AU · 스핀 (불릿 바) ----------
  function renderBullets(s) {
    $('s2sub').textContent = '오픈 후 ' + s.now + '시간(D+' + Math.floor(s.now / 24) + ') 시점 · 같은 경과 시간 기준 금주 슬롯 vs 최근 8개 슬롯 평균';
    var one = function (title, o, f) {
      var mx = Math.max(o.cur, o.max) * 1.06;
      var w = function (v) { return (v / mx * 100).toFixed(1) + '%'; };
      var d = (o.cur / o.avg - 1) * 100, st = status(o.cur, o.min, o.max, true);
      return '<div class="bul"><div class="bul-h"><b>' + title + '</b><span class="delta ' + st.c + '">최근 8개 슬롯 같은 경과 시간 평균 대비 ' + sg(d, 1) + '% · ' + st.t + '</span></div>' +
        '<div class="brow"><span class="bl">금주</span><div class="track" title="금주 ' + f(o.cur) + '"><div class="fill" style="width:' + w(o.cur) + ';background:' + C.s1 + '"></div></div><span class="bv num">' + f(o.cur) + '</span></div>' +
        '<div class="brow"><span class="bl">8개 평균</span><div class="track" title="8개 평균 ' + f(o.avg) + ' (범위 ' + f(o.min) + ' ~ ' + f(o.max) + ')"><div class="fill" style="width:' + w(o.avg) + ';background:' + C.ref + ';opacity:.7"></div>' +
        '<div class="rangebar" style="left:' + w(o.min) + ';width:calc(' + w(o.max) + ' - ' + w(o.min) + ');top:5px;background:rgba(255,255,255,.9);box-shadow:0 0 0 1px rgba(17,24,39,.35)"></div></div><span class="bv num">' + f(o.avg) + '</span></div>' +
        '<div class="cmp">8개 슬롯 범위 ' + f(o.min) + ' ~ ' + f(o.max) + '</div></div>';
    };
    $('bul').innerHTML = one('누적 AU', s.AU, auFmt) + one('누적 스핀', s.SP, spinFmt);
  }

  // ---------- 3. 일별 매출 비중 표 ----------
  function renderDaily(s) {
    var mx = 0;
    s.daily.forEach(function (r) { mx = Math.max(mx, r.cur || 0, r.prev || 0, r.avg); });
    var tint = function (v) { return 'background:rgba(42,120,214,' + (0.04 + v / mx * 0.2).toFixed(3) + ')'; };
    var rows = s.daily.map(function (r) {
      var c = r.reached
        ? '<td class="num ' + (r.reached === 1 ? 'part' : '') + '" style="' + tint(r.cur) + '">' + pct(r.cur) + (r.reached === 1 ? '<span class="tag">진행 중</span>' : '') + '</td>'
        : '<td class="dim">–</td>';
      var dl = r.reached ? '<td class="num" style="color:var(--ink2)">' + sg(r.cur - r.avg) + '%p</td>' : '<td class="dim">–</td>';
      return '<tr><td>D+' + r.d + '</td>' + c + (r.prevReached ? '<td class="num ' + (r.prevReached === 1 ? 'part' : '') + '" style="' + tint(r.prev) + '">' + pct(r.prev) + (r.prevReached === 1 ? '<span class="tag">진행 중</span>' : '') + '</td>' : '<td class="dim">–</td>') + '<td class="num" style="' + tint(r.avg) + '">' + pct(r.avg) + '</td>' + dl + '</tr>';
    }).join('');
    $('t3').innerHTML = '<thead><tr><th>경과일</th><th>금주</th><th>전주</th><th>최근 8개 평균</th><th>평균 대비</th></tr></thead><tbody>' + rows + '</tbody>';
  }

  // ---------- 4. 스핀 구간별 유저 수 ----------
  function renderRetention(s) {
    var rows = s.stepLabels.map(function (st, j) {
      var a = s.ret.cur, b = s.ret.avg;
      var cell = function (r, cls) {
        return '<td class="num ' + cls + '">' + int(r.users[j]) + '</td><td class="num"><div class="vb"><i style="width:' + Math.max(2, r.pctFirst[j] * 0.7).toFixed(0) + 'px"></i>' + pct(r.pctFirst[j]) + '</div></td><td class="num">' + (j === 0 ? '–' : pct(r.pctPrev[j])) + '</td>';
      };
      return '<tr><td>spin_' + int(st) + '</td>' + cell(a, 'sep') + cell(b, 'sep') + '</tr>';
    }).join('');
    $('t4').innerHTML = '<thead><tr><th rowspan="2" style="vertical-align:bottom">구간</th><th class="grp sep" colspan="3">금주 오픈 슬롯</th><th class="grp sep" colspan="3">최근 8개 슬롯 평균</th></tr>' +
      '<tr><th class="sep">유저 수</th><th>% 첫 구간</th><th>% Previous</th><th class="sep">유저 수</th><th>% 첫 구간</th><th>% Previous</th></tr></thead><tbody>' + rows + '</tbody>';
  }

  // ---------- 5. 스핀 단계별 4종 ----------
  function chart5(s) {
    var labels = s.stepLabels.map(function (v) { return int(v); });
    var mk = function (id, key, fmt, yopt) {
      var o = baseOpts();
      o.plugins.tooltip.callbacks = {
        title: function (it) { return 'spin_' + it[0].label; },
        label: function (it) { return ' ' + it.dataset.label + ': ' + fmt(it.parsed.y); }
      };
      o.scales = { x: Object.assign({}, xCat, { title: { display: true, text: '스핀 구간', color: C.tick, font: { size: 10 } } }), y: yScale(fmt, yopt) };
      var ds = function (label, data, color) {
        return { label: label, data: data, borderColor: color, backgroundColor: color, borderWidth: 2, pointRadius: 3, pointHoverRadius: 5, pointBorderColor: '#fff', pointBorderWidth: 1.5, tension: 0.3 };
      };
      charts.push(new Chart($(id), { type: 'line', plugins: [markers], data: { labels: labels, datasets: [ds('기준 슬롯 (8개 평균)', s.steps[key].base, C.ref), ds('금주 슬롯', s.steps[key].cur, C.s1)] }, options: o }));
    };
    mk('c5a', 'arpu', function (v) { return '$' + v.toFixed(v < 1 ? 2 : 1); }, { beginAtZero: true });
    mk('c5b', 'conv', function (v) { return v.toFixed(1) + '%'; }, { beginAtZero: true });
    mk('c5c', 'rtp', function (v) { return v.toFixed(1) + '%'; }, { min: 90, max: 102 });
    mk('c5d', 'unit', function (v) { return v.toFixed(1) + '%'; }, {});
    legend($('lg5'), [{ text: '금주 슬롯', color: C.s1 }, { text: '기준 슬롯 (최근 8개 평균)', color: C.ref }]);
  }

  // ---------- 6. 큐레이션 100% 누적 막대 ----------
  function chart6(s) {
    var lbl = s.dates.map(function (d, i) { return i === s.openIdx ? d + '*' : d; });
    var mk = function (id, rows) {
      var o = baseOpts();
      o.plugins.tooltip.callbacks = {
        title: function (it) { return it[0].label.replace('*', '') + (it[0].label.indexOf('*') > -1 ? ' · 금주 슬롯 오픈일' : ''); },
        label: function (it) { return ' ' + it.dataset.label + ': ' + it.parsed.y.toFixed(1) + '%'; }
      };
      o.scales = { x: Object.assign({}, xCat, { stacked: true, ticks: Object.assign({}, xCat.ticks, { font: { size: 10 }, autoSkip: false, maxRotation: 60, minRotation: window.innerWidth < 560 ? 60 : 0 }) }), y: yScale(function (v) { return v + '%'; }, { stacked: true, min: 0, max: 100, ticks: { color: C.tick, font: { size: 10.5 }, stepSize: 25, padding: 6, callback: function (v) { return v + '%'; } } }) };
      var ds = s.cats.map(function (c, k) {
        return { label: c, data: rows.map(function (r) { return r[k]; }), backgroundColor: CAT_COLORS[k], borderColor: '#fff', borderWidth: 2, borderSkipped: false, barPercentage: 0.82, categoryPercentage: 0.9 };
      });
      charts.push(new Chart($(id), { type: 'bar', data: { labels: lbl, datasets: ds }, options: o }));
    };
    mk('c6a', s.cur.rev); mk('c6b', s.cur.spin);
    legend($('lg6'), s.cats.map(function (c, k) { return { text: c, color: CAT_COLORS[k], kind: 'box' }; }));
    var tbl = function (rows) {
      return '<thead><tr><th>일자</th>' + s.cats.map(function (c) { return '<th>' + c + '</th>'; }).join('') + '</tr></thead><tbody>' +
        rows.map(function (r, i) { return '<tr><td>' + lbl[i] + '</td>' + r.map(function (v) { return '<td class="num">' + v.toFixed(1) + '%</td>'; }).join('') + '</tr>'; }).join('') + '</tbody>';
    };
    $('t6a').innerHTML = '<caption style="text-align:left;font-weight:600;font-size:12px;padding-bottom:4px">매출 비중</caption>' + tbl(s.cur.rev);
    $('t6b').innerHTML = '<caption style="text-align:left;font-weight:600;font-size:12px;padding-bottom:4px">스핀 비중</caption>' + tbl(s.cur.spin);
  }

  // ---------- 전체 렌더 ----------
  function render(idx) {
    var s = D[idx];
    charts.forEach(function (c) { c.destroy(); }); charts = [];
    $('asof').textContent = s.asof;
    $('p-prev').textContent = s.prevLabel;
    $('p-base').textContent = s.baseRange;
    renderVerdict(s); chart1(s); renderBullets(s); renderDaily(s); renderRetention(s); chart5(s); chart6(s);
    try { history.replaceState(null, '', '#' + s.key); } catch (e) {}
  }

  var sel = $('sel');
  sel.innerHTML = D.map(function (s, i) { return '<option value="' + i + '">' + s.label + ' · ' + s.tab + '</option>'; }).join('');
  sel.addEventListener('change', function () { render(+sel.value); });
  $('tg6').addEventListener('click', function () {
    var on = this.getAttribute('aria-pressed') !== 'true';
    this.setAttribute('aria-pressed', on); this.textContent = on ? '차트로 보기' : '표로 보기';
    $('s6c').classList.toggle('hide', on); $('s6t').classList.toggle('hide', !on);
  });
  var h = (location.hash || '').slice(1), start = 0;
  D.forEach(function (s, i) { if (s.key === h) start = i; });
  sel.value = start;
  render(start);
})();
