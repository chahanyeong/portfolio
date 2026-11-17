

(function (root) {
  'use strict';
  function create(opts) {
    opts = opts || {};
    const ttl = opts.ttlMs == null ? 60000 : opts.ttlMs;
    const max = opts.maxEntries == null ? 120 : opts.maxEntries;
    const now = opts.now || (() => Date.now());
    const map = new Map();        
    const inflight = new Map();   
    const background = new Set(); 
    let gen = 0;                  

    const touch = (key, ent) => { map.delete(key); map.set(key, ent); };
    function put(key, value) {
      map.delete(key);
      map.set(key, { value, at: now(), text: JSON.stringify(value) });
      while (map.size > max) map.delete(map.keys().next().value);
    }
    function request(key, fetcher) {
      if (inflight.has(key)) return inflight.get(key);
      const g = gen;
      const p = new Promise((res) => res(fetcher())).then(   
        (v) => { inflight.delete(key); if (g === gen && v != null) put(key, v); return v; },
        (e) => { inflight.delete(key); throw e; });
      inflight.set(key, p);
      return p;
    }
    function track(p) { background.add(p); const done = () => background.delete(p); p.then(done, done); }

    function get(key) { const ent = map.get(key); if (!ent) return undefined; touch(key, ent); return ent.value; }
    function has(key) { return map.has(key); }
    function load(key, fetcher, onUpdate, onError) {
      const ent = map.get(key);
      if (!ent) return request(key, fetcher).then((value) => ({ value, cached: false }));
      touch(key, ent);
      if (now() - ent.at > ttl) {   
        const before = ent.text;
        track(request(key, fetcher).then(
          (v) => { if (v != null && JSON.stringify(v) !== before && onUpdate) onUpdate(v); },
          (e) => { if (onError) onError(e); }));
      }
      return Promise.resolve({ value: ent.value, cached: true });
    }
    function prefetch(key, fetcher) {
      if (map.has(key) || inflight.has(key)) return Promise.resolve();
      const p = request(key, fetcher).then(() => {}, () => {});
      track(p);
      return p;
    }
    function clear() { gen++; map.clear(); }
    function drop(pred) { gen++; Array.from(map.keys()).forEach(k => { if (pred(k)) map.delete(k); }); }
    function settled() { return Promise.all(Array.from(background)).then(() => (background.size ? settled() : undefined)); }
    return { get, has, load, prefetch, clear, drop, settled, size: () => map.size };
  }
  const api = { create };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.AbCache = api;
})(typeof window !== 'undefined' ? window : globalThis);
