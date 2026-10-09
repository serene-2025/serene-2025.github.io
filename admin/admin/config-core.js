/* ═══════════════════════════════════════════════════════════════════════
   config-core.js — ตัวช่วยกลาง (ใช้ร่วมกันทุก tenant · ไม่ต้องแก้)
   • appCfg()/appCfgIn(): อ่านค่าจาก config.js (ไม่มีคีย์ → ใช้ค่าเดิมที่หน้าส่งมา)
   • แนบ x-tenant และ LINE access token ให้ทุกคำขอไป Edge Function
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
      return orig(input, init);
    };
    wrapped.__appCfgWrapped = true;
    window.fetch = wrapped;
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
