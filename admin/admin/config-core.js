/* ═══════════════════════════════════════════════════════════════════════
   config-core.js — ตัวช่วยกลาง (ใช้ร่วมกันทุก tenant · ไม่ต้องแก้) 2026
   • appCfg()/appCfgIn(): อ่านค่าจาก config.js (ไม่มีคีย์ → ใช้ค่าเดิมที่หน้าส่งมา)
   • แนบ x-tenant และ LINE access token ให้ทุกคำขอไป Edge Function
   • DB_PROXY: ส่งคำสั่งฐานข้อมูลของทุกหน้าผ่าน Edge Function (/api/dbq) แทนการเรียก Supabase ตรง (ดู migration_security_hardening.sql)
   • แทนชื่อหมู่บ้านเดิมที่ฝังในข้อความด้วย BRAND ใน config.js (เฉพาะเมื่อต่างจากค่าเดิม)
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  var C = window.APP_CONFIG || {};
  // อ่านค่า: มีคีย์ใน config → ใช้ค่านั้น (แม้เป็นค่าว่าง) · ไม่มี → ใช้ค่าเดิมที่ส่งมา
  function has(o, k) { return !!o && Object.prototype.hasOwnProperty.call(o, k); }
  window.appCfg = function (key, legacy) { return has(window.APP_CONFIG, key) ? window.APP_CONFIG[key] : legacy; };
  window.appCfgIn = function (key, sub, legacy) { var o = window.APP_CONFIG && window.APP_CONFIG[key]; return has(o, sub) ? o[sub] : legacy; };

  // ── Edge Function: แนบ x-tenant และ LINE access token ให้ทุกคำขอโดยอัตโนมัติ (ไม่ทับ header ที่หน้าใส่เอง) ──
  var EDGE_RE = /\/functions\/v1\//;
  function isEdge(u) { return EDGE_RE.test(String(u || '')); }
  function lineToken() {
    try { if (window.liff && typeof liff.isLoggedIn === 'function' && liff.isLoggedIn()) return liff.getAccessToken() || ''; } catch (e) {}
    return '';
  }
  if (typeof window.fetch === 'function' && !window.fetch.__appCfgWrapped) {
    var orig = window.fetch.bind(window);
    var wrapped = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : (input && input.url) || (input && input.href) || '';
        if (isEdge(url)) {
          var tenant = String(window.APP_CONFIG && window.APP_CONFIG.TENANT_KEY || '').trim();
          var tok = lineToken();
          if (tenant || tok) {
            var baseHeaders = (init && init.headers) || (typeof input !== 'string' && input && input.headers) || undefined;
            var h = new Headers(baseHeaders);
            if (tenant && !h.has('x-tenant')) h.set('x-tenant', tenant);
            if (tok && !h.has('x-line-token')) h.set('x-line-token', tok);
            init = Object.assign({}, init || {}, { headers: h });
          }
        }
      } catch (e) { /* ไม่ให้การแนบ header ทำให้คำขอพัง */ }
      var p = orig(input, init);
      // 🏠 server ตอบ 403 not_registered (ยังไม่ได้ลงทะเบียนสมาชิก) จาก /api/crm/* → พาไปหน้าลงทะเบียนทันที (regGate จัดการ + กันวนลูป)
      try {
        var u2 = typeof input === 'string' ? input : (input && input.url) || (input && input.href) || '';
        if (isEdge(u2) && /\/api\/crm\//.test(u2)) {
          p = p.then(function (res) {
            if (res && res.status === 403) {
              try { res.clone().json().then(function (j) { if (j && j.not_registered && typeof window.regGateRedirect === 'function') window.regGateRedirect(); }, function () {}); } catch (e) { /* ignore */ }
            }
            return res;
          });
        }
      } catch (e) { /* ไม่ให้การตรวจผลทำให้คำขอพัง */ }
      return p;
    };
    wrapped.__appCfgWrapped = true;
    window.fetch = wrapped;
  }

  // ── 🔒 ตัวกลางฐานข้อมูล (DB_PROXY): ส่งทุก supabaseClient.from()/rpc() ไป Edge Function (/api/dbq) แทนการเรียก Supabase ตรงด้วย anon key ──
  //    เปิดด้วย DB_PROXY: true ใน config.js · เซิร์ฟเวอร์ตรวจสิทธิ์ราย "ตาราง×การกระทำ" ด้วย LINE token แล้วรันด้วย service_role
  //    (หลังเปิดแล้วรัน migration_security_hardening.sql เพื่อปิดสิทธิ์ anon ทั้งหมด) · storage/auth ยังเรียกตรงตามเดิม
  //    ส่วนที่ไม่เปลี่ยน: โค้ดหน้าเว็บเดิม (.from('x').select().eq()... / await / .then) ใช้ได้เหมือนเดิม ผลลัพธ์ { data, error, count }
  function dbProxyOn() { return !!(window.APP_CONFIG && window.APP_CONFIG.DB_PROXY); }
  function edgeBase(supabaseUrl) {
    var e = String(appCfg('EDGE_FUNCTION_URL', '') || '').replace(/\/+$/, '');
    return e || (String(supabaseUrl || '').replace(/\/+$/, '') + '/functions/v1/line-webhook');
  }
  function dbqHeaders() {
    var h = { 'Content-Type': 'application/json' };
    var t = String(window.APP_CONFIG && window.APP_CONFIG.TENANT_KEY || '').trim(); if (t) h['x-tenant'] = t;
    var k = lineToken(); if (k) h['x-line-token'] = k;
    return h;
  }
  function dbqPost(base, body, signal) {
    return window.fetch(base + '/api/dbq', { method: 'POST', headers: dbqHeaders(), body: JSON.stringify(body), signal: signal })
      .then(function (res) {
        return res.json().then(function (j) { return { res: res, j: j }; }, function () { return { res: res, j: null }; });
      });
  }
  function dbqBuilder(base, init) {
    var st = { body: init, steps: [], throwOn: false, signal: undefined, p: null };
    function run() {
      if (st.p) return st.p;
      var body = st.body.rpc ? { rpc: st.body.rpc, args: st.body.args || {} } : { table: st.body.table, chain: st.steps };
      st.p = dbqPost(base, body, st.signal).then(function (o) {
        var j = o.j;
        var out = (j && typeof j === 'object' && ('data' in j || 'error' in j))
          ? { data: j.data === undefined ? null : j.data, error: j.error || null, count: j.count == null ? null : j.count, status: j.status || o.res.status, statusText: '' }
          : { data: null, error: { message: (j && j.error) || ('HTTP ' + o.res.status), code: String(o.res.status), details: null, hint: null }, count: null, status: o.res.status, statusText: '' };
        if (st.throwOn && out.error) { var er = new Error(out.error.message || 'dbq error'); for (var k in out.error) er[k] = out.error[k]; throw er; }
        return out;
      }, function (e) {
        var out = { data: null, error: { message: (e && e.message) || 'Failed to fetch', code: '', details: null, hint: null }, count: null, status: 0, statusText: '' };
        if (st.throwOn) throw e; return out;
      });
      return st.p;
    }
    var p = new Proxy(function () {}, {
      get: function (_t, prop) {
        if (prop === 'then') return function (a, b) { return run().then(a, b); };
        if (prop === 'catch') return function (b) { return run().catch(b); };
        if (prop === 'finally') return function (f) { return run().finally(f); };
        if (typeof prop === 'symbol') return undefined;
        if (prop === 'throwOnError') return function () { st.throwOn = true; return p; };
        if (prop === 'abortSignal') return function (sig) { st.signal = sig; return p; };
        if (prop === 'returns' || prop === 'overrideTypes' || prop === 'setHeader') return function () { return p; };
        return function () { st.steps.push([String(prop), Array.prototype.slice.call(arguments)]); return p; };
      }
    });
    return p;
  }
  function installDbProxy(client, supabaseUrl) {
    if (!client || client.__dbq) return client;
    var base = edgeBase(supabaseUrl);
    client.from = function (table) { return dbqBuilder(base, { table: String(table) }); };
    client.rpc = function (name, args) { return dbqBuilder(base, { rpc: String(name), args: args || {} }); };
    client.__dbq = true;
    return client;
  }
  // ตรวจรหัส PIN หน้าตรวจค่าส่วนกลางที่เซิร์ฟเวอร์ (เดิมอ่าน admin_pin มาเทียบในเบราว์เซอร์)
  window.dbqPinCheck = function (pin, supabaseUrl) {
    return dbqPost(edgeBase(supabaseUrl || (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL)), { pin_check: String(pin) }).then(function (o) {
      return (o.j && typeof o.j === 'object') ? o.j : { ok: false, admin: false, error: 'HTTP ' + o.res.status };
    }, function () { return { ok: false, admin: false, error: 'network' }; });
  };
  // เรียกตรง (ไม่ผ่าน supabase-js) สำหรับหน้าที่ไม่ได้โหลด SDK เช่น index.html · คืน { data, error, ... } หรือ null ถ้าล้มเหลว
  window.dbqQuery = function (table, chain, supabaseUrl) {
    return dbqPost(edgeBase(supabaseUrl || (window.APP_CONFIG && window.APP_CONFIG.SUPABASE_URL)), { table: String(table), chain: chain || [] })
      .then(function (o) { return o.j; }, function () { return null; });
  };
  window.dbProxyEnabled = dbProxyOn;
  if (dbProxyOn()) {
    var patchSb = function (sb) {
      if (!sb || sb.__dbqPatched || typeof sb.createClient !== 'function') return sb;
      var copy = Object.assign({}, sb), orig = sb.createClient;
      copy.createClient = function (url) { return installDbProxy(orig.apply(this, arguments), url); };
      copy.__dbqPatched = true;
      return copy;
    };
    if (window.supabase) { window.supabase = patchSb(window.supabase); }
    else {
      var _sbVal;
      try {
        Object.defineProperty(window, 'supabase', { configurable: true, enumerable: true, get: function () { return _sbVal; }, set: function (v) { _sbVal = patchSb(v); } });
      } catch (e) { /* ถ้า define ไม่ได้ ให้หน้าเว็บทำงานแบบเดิม (เรียกตรง) */ }
    }
  }

  // ── แบรนด์: แทนชื่อหมู่บ้านเดิมที่ฝังในข้อความด้วยชื่อใน BRAND (เฉพาะเมื่อ BRAND ต่างจากค่าเดิม) ──
  //    ข้ามหน้าที่ใส่ <html data-brand-replace="off"> (หน้าแอดมิน) · ไม่แตะ script/style/ช่องกรอก
  var B = C.BRAND || {};
  var rules = [];
  function addRule(re, to, keepCase) { if (to != null) rules.push({ re: re, to: String(to), keepCase: !!keepCase }); }
  // อีเมลต้องมาก่อนกฎชื่อสั้น (ไม่งั้น serene ในอีเมลถูกแทนก่อน)
  if (B.contact_email != null && B.contact_email !== 'goldenland.serene@gmail.com') addRule(/goldenland\.serene@gmail\.com/gi, B.contact_email);
  if (B.village_th && B.village_th !== 'โกลเด้นแลนด์ ซีรีน') addRule(/โกลเด้นแลนด์\s*ซีรีน/g, B.village_th);
  if (B.village_en && B.village_en !== 'Golden Land Serene') addRule(/Golden\s?Land\s+Serene|Goldenland\s+Serene|GOLDEN\s?LAND\s+SERENE/gi, B.village_en);
  if (B.short && B.short !== 'Serene') addRule(/\bserene\b/gi, B.short, true);
  function applyRules(s) {
    var out = s;
    for (var i = 0; i < rules.length; i++) {
      var r = rules[i];
      out = out.replace(r.re, function (m) {
        if (!r.keepCase) return r.to;
        return m === m.toUpperCase() ? r.to.toUpperCase() : (m === m.toLowerCase() ? r.to.toLowerCase() : r.to);
      });
    }
    return out;
  }
  function walk(root) {
    if (!root) return;
    if (root.nodeType === 3) { var p = root.parentNode && root.parentNode.nodeName; if (/^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT)$/.test(p)) return; var v = root.nodeValue, n = applyRules(v); if (n !== v) root.nodeValue = n; return; }
    if (root.nodeType !== 1 || /^(SCRIPT|STYLE|TEXTAREA|NOSCRIPT|INPUT)$/.test(root.nodeName)) return;
    for (var c = root.firstChild; c; c = c.nextSibling) walk(c);
  }
  function runBrand() {
    if (!rules.length || document.documentElement.getAttribute('data-brand-replace') === 'off') return;
    if (document.title) document.title = applyRules(document.title);
    walk(document.body);
    if (typeof MutationObserver === 'function' && document.body) {
      new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === 'characterData') walk(m.target);
          else for (var j = 0; j < m.addedNodes.length; j++) walk(m.addedNodes[j]);
        }
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    }
  }
  window.appBrandApply = applyRules;   // ใช้ทดสอบ/เรียกเองได้
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', runBrand); else runBrand();
})();

/* ═════════════════════════════════════════════════════════════════
   🏠 regGate — ด่านลงทะเบียนกลางของทุกหน้า LIFF
   ใช้: หลังรู้ LINE userId แล้ว  →  if (!(await regGate({ uid: profile.userId, page: 'car.html' }))) return;
   • ลงทะเบียนแล้ว (มีชื่อ-สกุล + บ้านเลขที่ใน userhome) → คืน true ให้หน้าทำงานต่อ
   • ยังไม่ลงทะเบียน → พาไปหน้า liff_register พร้อมแนบลิงก์หน้าเดิม (?return=) แล้วคืน false · สมัครเสร็จหน้า register พากลับมาเอง
   • ถ้ากลับมาแล้ว (rg=1) ยังไม่ผ่านอีก → ไม่พาไปซ้ำ (กันวนลูป) แสดงข้อความ + ปุ่มลงทะเบียนเอง
   • ลงทะเบียนแล้วแต่บทบาทไม่มีสิทธิ์ใช้หน้านี้ (สิทธิ์เมนูสมาชิก) → แสดงข้อความ + ปุ่มปิด แล้วคืน false
   • ตรวจไม่ได้ (เน็ต/เซิร์ฟเวอร์ล่ม) → ปล่อยให้หน้าทำงานต่อ (เป็นตัวนำทาง ไม่ใช่ด่านความปลอดภัย)
   • ข้ามบางหน้าได้ใน config.js: REG_GATE_SKIP: ['gallery.html', 'new.html']
   ═════════════════════════════════════════════════════════════════ */
(function () {
  var passed = {};
  var lastUid = '';
  var redirecting = false;
  function lastSeg() { var p = String(location.pathname || '').split('/').filter(Boolean); return p.length ? p[p.length - 1] : ''; }
  function edgeUrl(o) {
    var e = String(o.edge || (window.appCfg ? window.appCfg('EDGE_FUNCTION_URL', '') : '') || '').replace(/\/+$/, '');
    if (e) return e;
    var s = String(o.supabaseUrl || (window.appCfg ? window.appCfg('SUPABASE_URL', '') : '') || '').replace(/\/+$/, '');
    return s ? s + '/functions/v1/line-webhook' : '';
  }
  function closeWin() { try { liff.closeWindow(); } catch (e) { try { history.back(); } catch (e2) { /* ปิดเองไม่ได้ */ } } }
  function showOverlay(title, text, buttons) {
    try {
      var old = document.getElementById('reg-gate-overlay'); if (old) old.remove();
      var ov = document.createElement('div'); ov.id = 'reg-gate-overlay';
      ov.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483000;background:#f8fafc;display:flex;align-items:center;justify-content:center;padding:24px;font-family:system-ui,-apple-system,"Segoe UI",Tahoma,sans-serif;';
      var card = document.createElement('div'); card.style.cssText = 'max-width:360px;width:100%;text-align:center;';
      var ic = document.createElement('div'); ic.style.cssText = 'font-size:52px;margin-bottom:8px;'; ic.textContent = '🏠'; card.appendChild(ic);
      var h = document.createElement('div'); h.setAttribute('data-testid', 'reg-gate-title'); h.style.cssText = 'font-size:18px;font-weight:800;color:#1e293b;margin-bottom:6px;'; h.textContent = title; card.appendChild(h);
      var p = document.createElement('div'); p.setAttribute('data-testid', 'reg-gate-text'); p.style.cssText = 'font-size:13px;color:#64748b;line-height:1.6;margin-bottom:16px;'; p.textContent = text; card.appendChild(p);
      (buttons || []).forEach(function (b) {
        var el = document.createElement('button'); el.type = 'button'; el.textContent = b.label; el.setAttribute('data-testid', b.id || '');
        el.style.cssText = 'display:block;width:100%;margin:8px 0;padding:12px;border-radius:14px;font-size:14px;font-weight:700;cursor:pointer;border:' + (b.primary ? '0;background:#06b6d4;color:#fff' : '1px solid #e2e8f0;background:#fff;color:#475569') + ';';
        el.onclick = b.onclick; card.appendChild(el);
      });
      ov.appendChild(card); document.body.appendChild(ov);
    } catch (e) { /* แสดงข้อความไม่ได้ก็ยังพาไปต่อได้ */ }
  }
  window.regGate = async function (o) {
    o = o || {};
    try {
      var uid = String(o.uid || '');
      if (uid) lastUid = uid;
      var page = o.page || lastSeg();
      var skip = (window.appCfg ? window.appCfg('REG_GATE_SKIP', []) : []) || [];
      if (!uid || !page || (Array.isArray(skip) && skip.indexOf(page) >= 0)) return true;
      if (o.force) delete passed[uid + '|' + page];
      if (passed[uid + '|' + page]) return true;
      var base = edgeUrl(o);
      if (!base) return true;

      var d = null;
      var ctl = (typeof AbortController === 'function') ? new AbortController() : null;
      var timer = ctl ? setTimeout(function () { try { ctl.abort(); } catch (e) { /* ignore */ } }, 8000) : null;
      try {
        var qs = String(location.search || '').slice(0, 800);
        var res = await fetch(base + '/api/admin/audience/registration_gate?uid=' + encodeURIComponent(uid) + '&page=' + encodeURIComponent(page) + '&query=' + encodeURIComponent(qs), ctl ? { signal: ctl.signal } : undefined);
        if (res.ok) d = await res.json();
        else console.warn('regGate: HTTP ' + res.status + ' (ปล่อยผ่าน)');
      } catch (e) { console.warn('regGate: ตรวจไม่ได้ (ปล่อยผ่าน)', e); }
      finally { if (timer) clearTimeout(timer); }

      if (!d || typeof d.registered !== 'boolean') return true;
      try { window.__regGateInfo = { uid: uid, page: page, d: d }; } catch (e) { /* ignore */ }   // ให้หน้าเว็บใช้ผลซ้ำ (เช่น status_confirmed) ไม่ต้องเรียก API อีกรอบ
      if (d.registered && d.denied) {
        // 🧭 สิทธิ์เมนูตามบทบาท (ตั้งที่หน้าแอดมิน "สิทธิ์เมนูสมาชิก") — บทบาทนี้ใช้หน้านี้ไม่ได้
        showOverlay('ไม่มีสิทธิ์ใช้เมนูนี้', String(d.denied.message || 'บทบาทของท่านไม่มีสิทธิ์ใช้เมนูนี้ หากคิดว่าผิดพลาดกรุณาติดต่อนิติบุคคล'),
          [{ id: 'reg-gate-close', label: 'ปิด', primary: true, onclick: closeWin }]);
        return false;
      }
      if (d.registered) { passed[uid + '|' + page] = true; return true; }

      var looped = false;
      try { looped = new URLSearchParams(location.search).get('rg') === '1'; } catch (e) { /* ignore */ }
      var go = function () { location.href = d.registerUrl; };
      if (!d.registerUrl) {
        showOverlay('ยังไม่ได้ลงทะเบียน', 'กรุณาลงทะเบียนสมาชิกผ่านเมนู "ลงทะเบียน" ในแชท LINE ก่อนใช้งานหน้านี้ (ระบบยังไม่ได้ตั้งค่าหน้าลงทะเบียน กรุณาแจ้งผู้ดูแล)', [{ id: 'reg-gate-close', label: 'ปิด', onclick: closeWin }]);
      } else if (looped) {
        showOverlay('ลงทะเบียนยังไม่เสร็จสมบูรณ์', 'ยังไม่พบข้อมูลสมาชิกของคุณ (ชื่อ-สกุลและบ้านเลขที่) กรุณาลงทะเบียนให้ครบ หรือติดต่อนิติบุคคล', [
          { id: 'reg-gate-go', label: 'ไปหน้าลงทะเบียน', primary: true, onclick: go }, { id: 'reg-gate-close', label: 'ปิด', onclick: closeWin }]);
      } else {
        showOverlay('ยังไม่ได้ลงทะเบียน', 'กำลังพาไปหน้าลงทะเบียน เมื่อลงทะเบียนเสร็จจะพากลับมาหน้านี้อัตโนมัติ...', [{ id: 'reg-gate-go', label: 'ไปหน้าลงทะเบียนทันที', primary: true, onclick: go }]);
        setTimeout(go, o.delay == null ? 150 : o.delay);   // ไปหน้าลงทะเบียนทันที (หน่วงแค่พอให้เห็นข้อความ)
      }
      return false;
    } catch (e) { console.warn('regGate error (ปล่อยผ่าน)', e); return true; }
  };
  // server แจ้งว่ายังไม่ได้ลงทะเบียน (403 not_registered) ระหว่างใช้งาน → ตรวจซ้ำแล้วพาไปหน้าลงทะเบียน (เรียกครั้งเดียว)
  window.regGateRedirect = function () {
    if (redirecting || !lastUid) return;
    redirecting = true;
    window.regGate({ uid: lastUid, force: true }).then(function (okNow) { if (okNow) redirecting = false; }, function () { redirecting = false; });
  };
})();
