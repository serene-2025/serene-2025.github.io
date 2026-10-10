/* ═══════════════════════════════════════════════════════════════════════
   config.js — ตั้งค่ากลางของทุกหน้า (แก้ไฟล์นี้ไฟล์เดียวต่อ 1 หมู่บ้าน/tenant)
   ───────────────────────────────────────────────────────────────────────
   • ทุกหน้า HTML โหลดไฟล์นี้ก่อนสคริปต์ของตัวเอง แล้วอ่านค่าผ่าน appCfg()/appCfgIn()
   • ถ้าไม่มีไฟล์นี้ หน้าเว็บจะใช้ค่าที่ฝังไว้เดิมของหมู่บ้านเดิม (ทำงานเหมือนเดิม)
   • หมู่บ้านใหม่ (tenant): คัดลอก config.template.js เป็น config.js แล้วกรอกค่า — ไม่ต้องแก้ไฟล์ HTML
   • ห้ามใส่ความลับ: ที่นี่ใส่ได้เฉพาะ anon/publishable key เท่านั้น (ห้าม service_role / LINE token)
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  window.APP_CONFIG = {
    // ── tenant / backend ──────────────────────────────────────────────
    TENANT_KEY: '',                                                          // slug ของ tenant (ว่าง = หมู่บ้านเดิม) → ส่งเป็น header x-tenant ทุกคำขอไป Edge Function
    SUPABASE_URL: 'https://zmdywddraaeegzkvpwsw.supabase.co',
    SUPABASE_KEY: 'sb_publishable_v6Srw8MV1VE-K3A8alvqHQ_T_O26qVQ',          // anon/publishable key เท่านั้น
    EDGE_FUNCTION_URL: 'https://zmdywddraaeegzkvpwsw.supabase.co/functions/v1/line-webhook',

    // ── LIFF ──────────────────────────────────────────────────────────
    MINI_APP_ID: '',                                                         // LIFF Mini App ID เดียวทุกหน้า (ว่าง = อ่านจาก system_settings.liff_mini_app_id)
    LIFF_FALLBACK: {                                                         // LIFF ID สำรองเมื่อ system_settings ยังไม่ตั้ง (tenant ใหม่: ปล่อยว่างทั้งหมด)
      register: '2000143615-Mp3la3EK', crm: '2009022424-9o19KWRH', slip: '2000143615-yk0LA09G', admin: '2009815540-mD9OJXZa',
      adminSettingsRegister: '2000143615-GxkrLkE5', adminSettingsCrm: '2009022424-9o19KWRH'
    },

    // ── LINE OA ───────────────────────────────────────────────────────
    OA_ADD_FRIEND_URL: 'https://line.me/R/ti/p/@500vulmn',                     // ลิงก์เพิ่มเพื่อน OA (https://line.me/R/ti/p/@<Basic ID>)
    DEFAULT_MEMBER_RICHMENU: 'richmenu-6dbab648fe7753fd311142e0c706ae1f',   // Rich Menu สำรองของสมาชิก (ว่าง = ไม่เปลี่ยนเมนู)

    // ── แบรนด์ (ข้อความที่แสดงในหน้า) ────────────────────────────────
    //   หน้า tenant: กรอกชื่อของตัวเอง → config.js จะแทนชื่อหมู่บ้านเดิมที่ฝังในหน้าให้อัตโนมัติ (best-effort)
    BRAND: {
      village_th: 'โกลเด้นแลนด์ ซีรีน', village_en: 'Golden Land Serene', short: 'Serene',
      contact_email: 'goldenland.serene@gmail.com'
    },

    // ── ค่าเริ่มต้นเอกสาร/ใบแจ้งหนี้ในหน้าแอดมิน (ก่อนมีค่าใน payment_settings) ──
    VILLAGE_DEFAULTS: {
      village_name: 'Golden Land Serene',
      juristic_name: 'นิติบุคคลหมู่บ้านจัดสรร GOLDENLAND SERENE',
      juristic_name_th: 'นิติบุคคลหมู่บ้านจัดสรร โกลเด้นแลนด์ ซีรีน',
      bank_name: 'ไทยพาณิชย์', account_name: 'นิติบุคคลหมู่บ้านจัดสรร GOLDENLAND SERENE', account_no: '4271924463'
    },

    // ── หน้าแจ้งชำระ (slip.html) ──────────────────────────────────────
    SLIP: {
      payee_keywords: ['โกลเด้นแลนด์', 'GOLDENLAND', 'นิติบุคคล'],   // คำที่ต้องมีในชื่อบัญชีผู้รับตามสลิป (ตัวพิมพ์เล็ก/ใหญ่ไม่สำคัญ)
      id_prefix: 'serene'                                           // คำนำหน้ารหัสรายการ common_fees (ห้ามเปลี่ยนถ้ามีข้อมูลเดิม)
    },

    // ── ชื่อ/ไอคอนผู้ส่งในแชท (ค่าเริ่มต้นในหน้าแอดมิน) ──────────────
    SENDER_NAMES: { admin: 'ผู้ช่วย Admin', ai_auto: 'AI อัตโนมัติ', serene: 'น้องซีรีน AI' },
    SENDER_ICONS: {
      admin: 'https://raw.githubusercontent.com/serene-2025/serene-2025.github.io/refs/heads/main/bot03.png',
      ai_auto: 'https://raw.githubusercontent.com/serene-2025/serene-2025.github.io/refs/heads/main/bot02.png',
      serene: 'https://raw.githubusercontent.com/serene-2025/serene-2025.github.io/refs/heads/main/bot04.png'
    }
  };
})();
