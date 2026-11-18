/*
 * 신규 슬롯 트래킹 대시보드 · 데모 데이터 생성기
 * 목적  : 시나리오 3종(약세/강세/평균)의 합성 데이터를 시드 고정 난수로 생성한다(스크린샷 재현성).
 * 입력  : 없음(전부 이 파일의 파라미터로 생성). 실제 슬롯 번호·수치와 무관한 가상 값.
 * 출력  : window.SLOT_DATA = { scenarios: [...] }
 * 비고  : 외부 요청 없음. app.js 가 이 객체를 읽어 렌더링한다.
 */
(function () {
  'use strict';

  // 시드 고정 난수(mulberry32) — 같은 시드면 항상 같은 값
  function rng(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var HOURS = 336;                                   // 오픈 후 14일
  var STEPS = [1, 10, 50, 100, 200, 500, 1000, 2000]; // 스핀 구간
  var CATS = ['NEW', 'HOT', 'HIGH LIMIT', 'FAN', '기타'];

  // 시간당 매출 비중 원시값(%): 급상승 후 지수 감쇠 + 하루 주기 리플 + 잔잔한 잡음
  function hourlyShare(p, rand) {
    var out = [];
    for (var t = 0; t <= HOURS; t++) {
      var rise = 1 - Math.exp(-(t + 0.5) / p.rise);
      var decay = Math.exp(-Math.max(0, t - p.t0) / p.tau);
      var base = p.F + (p.P - p.F) * rise * decay;
      var ripple = 1 + 0.05 * Math.sin(2 * Math.PI * (t + 3) / 24) + (rand() - 0.5) * 0.06;
      out.push(base * ripple);
    }
    return out;
  }

  // 6시간 이동평균(초반 6시간 미만 구간은 가용 구간 평균)
  function ma6(arr) {
    return arr.map(function (_, i) {
      var s = 0, n = 0;
      for (var k = Math.max(0, i - 5); k <= i; k++) { s += arr[k]; n++; }
      return s / n;
    });
  }

  function mean(a) { return a.reduce(function (x, y) { return x + y; }, 0) / a.length; }
  function r1(x) { return Math.round(x * 10) / 10; }

  // 누적 AU / 스핀 곡선(경과 시간 t 기준, 슬롯별 배율 a·b)
  function cumAU(t, a) { return a * (52000 * (1 - Math.exp(-t / 16)) + 22000 * (1 - Math.exp(-t / 160))); }
  function cumSpin(t, b) { return b * 9.6e6 * (1 - Math.exp(-t / 70)) * (0.55 + 0.45 * (1 - Math.exp(-t / 24))); }

  // 스핀 단계별 기준(8개 평균) 곡선
  var BASE = {
    prev: [1, 0.80, 0.62, 0.74, 0.69, 0.51, 0.46, 0.42],            // % Previous
    arpu: [0.05, 0.38, 1.10, 1.92, 3.20, 6.40, 11.60, 18.80],       // 달러
    conv: [1.2, 3.4, 6.7, 9.6, 13.0, 19.0, 25.5, 32.0],             // %
    rtp: [95.6, 96.9, 95.8, 96.5, 96.0, 96.4, 96.1, 96.2]           // 누적 승률 %
  };

  var DEFS = [
    {
      key: 'weak', tab: '약세 · 오픈 후 30시간',
      label: 'S-128 · 11-17 (화) 오픈', prevLabel: 'S-127 · 11-10 (화) 오픈', baseRange: 'S-120 ~ S-127',
      openWd: '화', openDate: '2026-11-17', asof: '2026-11-18 15:00', now: 30,
      cur: { P: 6.3, F: 1.9, rise: 2.6, t0: 5, tau: 20 },
      f: { au: 0.76, sp: 0.80, prev: 0.88, arpu: 0.78, conv: 0.86, rtp: -0.9 }, seed: 11
    },
    {
      key: 'strong', tab: '강세 · 오픈 후 27시간',
      label: 'S-124 · 10-20 (화) 오픈', prevLabel: 'S-123 · 10-13 (화) 오픈', baseRange: 'S-116 ~ S-123',
      openWd: '화', openDate: '2026-10-20', asof: '2026-10-21 12:00', now: 27,
      cur: { P: 12.9, F: 3.6, rise: 2.8, t0: 7, tau: 62 },
      f: { au: 1.24, sp: 1.20, prev: 1.10, arpu: 1.22, conv: 1.15, rtp: 0.5 }, seed: 23
    },
    {
      key: 'avg', tab: '평균 · 오픈 후 7일',
      label: 'S-119 · 09-15 (화) 오픈', prevLabel: 'S-118 · 09-08 (화) 오픈', baseRange: 'S-111 ~ S-118',
      openWd: '화', openDate: '2026-09-15', asof: '2026-09-22 09:00', now: 168,
      cur: { P: 9.0, F: 2.9, rise: 2.7, t0: 7, tau: 38 },
      f: { au: 1.02, sp: 0.99, prev: 1.02, arpu: 1.03, conv: 1.01, rtp: 0.1 }, seed: 37
    }
  ];

  function build(d) {
    var R = rng(d.seed * 1000 + 7);
    var now = d.now;

    // 최근 8개 슬롯(개별 파라미터는 평균 주변에서 시드 난수로 분산)
    var slots = [];
    for (var i = 0; i < 8; i++) {
      var p = {
        P: 7.6 + R() * 2.6,            // 초반 최고 비중 7.6~10.2
        F: 2.3 + R() * 1.2,
        rise: 2.2 + R() * 1.2,
        t0: 5 + R() * 5,
        tau: 30 + R() * 22
      };
      var raw = hourlyShare(p, rng(d.seed * 100 + i));
      slots.push({
        raw: raw, ma: ma6(raw),
        a: 0.86 + R() * 0.30, b: 0.86 + R() * 0.30
      });
    }
    // 전주 슬롯 = 8개 중 가장 최근(마지막) 슬롯
    var prevSlot = slots[7];

    var curRaw = hourlyShare(d.cur, rng(d.seed * 100 + 99));
    var curMa = ma6(curRaw);

    // 시간별 평균·최소·최대(이동평균 기준)
    var avg = [], lo = [], hi = [];
    for (var t = 0; t <= HOURS; t++) {
      var vs = slots.map(function (s) { return s.ma[t]; });
      avg.push(mean(vs)); lo.push(Math.min.apply(null, vs)); hi.push(Math.max.apply(null, vs));
    }

    // 판정용 지표: 초반 최고치 / 현재 / 최고치 대비 하락(비율) / 누적 AU·스핀
    function metrics(ma, t) {
      var pk = Math.max.apply(null, ma.slice(0, t + 1));
      var cu = ma[t];
      return { peak: pk, cur: cu, dropPp: pk - cu, dropPct: (pk - cu) / pk * 100 };
    }
    var cm = metrics(curMa, now);
    var sm = slots.map(function (s) { return metrics(s.ma, now); });
    function rng2(key) {
      var v = sm.map(function (x) { return x[key]; });
      return { avg: mean(v), min: Math.min.apply(null, v), max: Math.max.apply(null, v) };
    }
    var M = {
      cur: cm, peak: rng2('peak'), now: rng2('cur'), dropPp: rng2('dropPp'), dropPct: rng2('dropPct')
    };
    var auV = slots.map(function (s) { return cumAU(now, s.a); });
    var spV = slots.map(function (s) { return cumSpin(now, s.b); });
    var AU = { cur: cumAU(now, d.f.au), avg: mean(auV), min: Math.min.apply(null, auV), max: Math.max.apply(null, auV) };
    var SP = { cur: cumSpin(now, d.f.sp), avg: mean(spV), min: Math.min.apply(null, spV), max: Math.max.apply(null, spV) };

    // 일별 매출 비중 D+0..D+13(해당 24시간 원시값 평균). reached: 0 미도달 / 1 진행 중 / 2 완료
    var prevNow = Math.min(HOURS, now + 168);                   // 전주 슬롯 경과 시간(7일 먼저 오픈) — 이후는 아직 없는 데이터
    var daily = [];
    for (var k = 0; k < 14; k++) {
      var a0 = k * 24, a1 = a0 + 23;
      var reached = now >= a1 ? 2 : (now >= a0 ? 1 : 0);
      var part = function (raw, lim) { return mean(raw.slice(a0, Math.min(a1, lim) + 1)); };
      var cv = reached ? part(curRaw, now) : null;
      var prevReached = prevNow >= a1 ? 2 : (prevNow >= a0 ? 1 : 0);
      var pv = prevReached ? part(prevSlot.raw, prevNow) : null;
      var av = mean(slots.map(function (s) { return part(s.raw, HOURS); }));
      daily.push({ d: k, cur: cv, prev: pv, avg: av, reached: reached, prevReached: prevReached });
    }

    // 스핀 구간별 유저 수(리텐션)
    function chain(first, prevRatios) {
      var users = [first], pct = [100], pv2 = [null];
      for (var j = 1; j < STEPS.length; j++) {
        users.push(Math.round(users[j - 1] * prevRatios[j]));
        pv2.push(prevRatios[j] * 100);
        pct.push(users[j] / first * 100);
      }
      return { users: users, pctFirst: pct, pctPrev: pv2 };
    }
    var ratiosCur = BASE.prev.map(function (v, j) { return j === 0 ? 1 : Math.min(0.97, v * d.f.prev * (1 + (R() - 0.5) * 0.06)); });
    var ratiosAvg = BASE.prev.map(function (v, j) { return j === 0 ? 1 : v; });
    var ret = { cur: chain(Math.round(AU.cur), ratiosCur), avg: chain(Math.round(AU.avg), ratiosAvg) };

    // 스핀 단계별 ARPU·전환율·승률·단위 승률: 평균=매끈, 금주=배율+완만한 잡음(초반일수록 큼)
    var R2 = rng(d.seed * 31 + 5);
    var steps = { arpu: { cur: [], base: [] }, conv: { cur: [], base: [] }, rtp: { cur: [], base: [] }, unit: { cur: [], base: [] } };
    STEPS.forEach(function (s, j) {
      var damp = 1 / Math.sqrt(s / 4 + 1);                      // 스핀이 적을수록 잡음 큼
      var cn = function (amp) { return (R2() - 0.5) * 2 * amp * damp; };
      steps.arpu.base.push(BASE.arpu[j]);
      steps.arpu.cur.push(BASE.arpu[j] * d.f.arpu * (1 + cn(0.18)));
      steps.conv.base.push(BASE.conv[j]);
      steps.conv.cur.push(BASE.conv[j] * d.f.conv * (1 + cn(0.14)));
      steps.rtp.base.push(BASE.rtp[j]);
      steps.rtp.cur.push(BASE.rtp[j] + d.f.rtp + cn(2.4));
      // 단위 승률: 직전 구간 대비 스핀 구간의 승률(누적보다 변동 큼, 후반에 수렴)
      var ub = 96.2 + Math.sin(j * 1.7) * 2.4 * damp * 1.5;
      steps.unit.base.push(ub);
      steps.unit.cur.push(96.0 + d.f.rtp + cn(13) + Math.cos(j * 1.3) * 1.2 * damp * 3);
    });

    // 큐레이션별 매출·스핀 비중(최근 14일, 오픈일부터 NEW 비중 상승)
    var day0 = new Date(Date.UTC(+d.openDate.slice(0, 4), +d.openDate.slice(5, 7) - 1, +d.openDate.slice(8, 10)));
    var nowDay = Math.floor((now) / 24);                          // 오픈일 기준 경과 일수
    var dates = [], openIdx = -1;
    for (var q = 13; q >= 0; q--) {
      var dt = new Date(day0.getTime() + (nowDay - q) * 86400000);
      var mm = ('0' + (dt.getUTCMonth() + 1)).slice(-2), dd = ('0' + dt.getUTCDate()).slice(-2);
      dates.push(mm + '-' + dd);
      if (nowDay - q === 0) openIdx = 13 - q;
    }
    var R3 = rng(d.seed * 53 + 9);
    function cur6(base, newBoost) {
      return dates.map(function (_, idx) {
        var v = base.map(function (b) { return b * (1 + (R3() - 0.5) * 0.08); });
        if (idx >= openIdx && openIdx >= 0) {
          var boost = newBoost * Math.exp(-(idx - openIdx) / 6);
          v[0] += boost;
        }
        var sum = v.reduce(function (x, y) { return x + y; }, 0);
        return v.map(function (x) { return r1(x / sum * 1000) / 10 * 1; }).map(function (x) { return Math.round(x * 10) / 10; });
      });
    }
    var cur = {
      rev: cur6([13, 31, 24, 19, 13], d.key === 'strong' ? 9 : d.key === 'weak' ? 3 : 5.5),
      spin: cur6([15, 30, 12, 27, 16], d.key === 'strong' ? 7 : d.key === 'weak' ? 2 : 4)
    };

    return {
      key: d.key, tab: d.tab, label: d.label, prevLabel: d.prevLabel, baseRange: d.baseRange,
      asof: d.asof, now: now, openWd: d.openWd, openDate: d.openDate,
      curMa: curMa.slice(0, now + 1), prevMa: prevSlot.ma.slice(0, prevNow + 1), avg: avg, lo: lo, hi: hi,
      M: M, AU: AU, SP: SP, daily: daily, ret: ret, steps: steps, stepLabels: STEPS,
      cur: cur, dates: dates, openIdx: openIdx, cats: CATS
    };
  }

  window.SLOT_DATA = { scenarios: DEFS.map(build) };
})();
