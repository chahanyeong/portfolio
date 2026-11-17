

(function (root) {
  'use strict';
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  
  function cumToDaily(arr) {
    return arr.map((v, i) => {
      if (!isNum(v)) return null;
      if (i === 0) return v;
      return isNum(arr[i - 1]) ? v - arr[i - 1] : null;
    });
  }
  
  function movingAvg(arr, w) {
    return arr.map((_, i) => {
      const win = arr.slice(Math.max(0, i - w + 1), i + 1).filter(isNum);
      return win.length ? win.reduce((a, b) => a + b, 0) / win.length : null;
    });
  }
  
  function relDiff(test, cont) {
    return test.map((t, i) => (isNum(t) && isNum(cont[i]) && cont[i] !== 0) ? (t - cont[i]) / cont[i] * 100 : null);   
  }
  
  function sliceRange(n, d0Idx, mode, custom) {
    const last = Math.max(0, n - 1);
    const clamp = (i) => Math.min(last, Math.max(0, Math.round(i)));
    if (mode === 'post') return [d0Idx >= 0 ? d0Idx : 0, last];
    if (mode === 'last14') return [clamp(n - 14), last];
    if (mode === 'last7') return [clamp(n - 7), last];
    if (mode === 'custom' && custom && custom.length === 2) { const a = clamp(custom[0]), b = clamp(custom[1]); return a <= b ? [a, b] : [b, a]; }
    return [0, last];
  }
  
  function toCsv(labels, cols) {
    const cell = (v) => (v == null ? '' : String(v));
    const lines = ['d,' + cols.map(c => c[0]).join(',')];
    labels.forEach((l, i) => lines.push([l].concat(cols.map(c => cell(c[1][i]))).join(',')));
    return lines.join('\n') + '\n';
  }
  
  function autoMin(vals) {
    const v = vals.filter(isNum); if (!v.length) return undefined;
    const mn = Math.min(...v), mx = Math.max(...v);
    return (mn >= 0 && mn <= mx * 0.25) ? 0 : undefined;
  }
  
  function dateAt(startUtc, d) {
    if (!startUtc) return '';
    const t = Date.parse(startUtc.replace(' ', 'T') + ':00Z'); if (Number.isNaN(t)) return '';
    return new Date(t + d * 86400000).toISOString().slice(0, 10);
  }
  
  function fmtSigned(v, f) { if (!isNum(v)) return '–'; return (v > 0 ? '+' : v < 0 ? '−' : '') + f(Math.abs(v)); }

  function byEndDesc(a, b) {
    const ea = (a && a.end_ts) || '', eb = (b && b.end_ts) || '';
    if (ea !== eb) return ea < eb ? 1 : -1;
    return ((b && b.markingidx) || 0) - ((a && a.markingidx) || 0);
  }

  function durationDays(startTs, endTs) {
    if (!startTs || !endTs) return null;
    const a = Date.parse(String(startTs).replace(' ', 'T') + 'Z'), b = Date.parse(String(endTs).replace(' ', 'T') + 'Z');
    if (!Number.isFinite(a) || !Number.isFinite(b) || b < a) return null;
    return Math.floor((b - a) / 86400000);
  }

  function displayNo(e) {
    if (!e) return null;
    return isNum(e.marking_no) ? e.marking_no : (isNum(e.markingidx) ? e.markingidx : null);
  }
  const AbMath = { cumToDaily, movingAvg, relDiff, sliceRange, toCsv, autoMin, dateAt, fmtSigned, byEndDesc, durationDays, displayNo };
  if (typeof module !== 'undefined' && module.exports) module.exports = AbMath; else root.AbMath = AbMath;
})(typeof window !== 'undefined' ? window : globalThis);
