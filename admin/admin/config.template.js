/* ═══════════════════════════════════════════════════════════════════════
   config.template.js — แม่แบบสำหรับหมู่บ้านใหม่ (tenant)
   วิธีใช้: คัดลอกเป็น config.js (ในโฟลเดอร์เดียวกับไฟล์ HTML) แล้วกรอกค่า — ไม่ต้องแก้ไฟล์ HTML
   • ค่าที่เว้นว่าง ('') = ไม่ใช้ค่าเดิมของหมู่บ้านต้นแบบ (ไม่มีลิงก์/เลขบัญชี/ชื่อของหมู่บ้านอื่นหลุดมา)
   • ห้ามใส่ความลับ: ใส่ได้เฉพาะ anon/publishable key ของ Supabase (ห้าม service_role / LINE token)
   ═══════════════════════════════════════════════════════════════════════ */
(function () {
  window.APP_CONFIG = {
    // ── tenant / backend ─────────────────────────────────────────────
    TENANT_KEY: 'your-slug',                                  // slug ที่สร้างผ่าน /api/platform/tenant_create
    SUPABASE_URL: 'https://YOUR-PROJECT.supabase.co',         // Project URL ของ tenant
    SUPABASE_KEY: 'sb_publishable_xxxxxxxxxxxxxxxxxxxxxxxx',  // anon/publishable key ของ tenant
    EDGE_FUNCTION_URL: 'https://MAIN-PROJECT.supabase.co/functions/v1/line-webhook',   // Edge Function ตัวกลาง (project หลัก)

    // ── LIFF ─────────────────────────────────────────────────────────
    MINI_APP_ID: '',                                          // LIFF Mini App ID ของ tenant (ว่าง = อ่านจาก system_settings.liff_mini_app_id)
    LIFF_FALLBACK: { register: '', crm: '', slip: '', admin: '', adminSettingsRegister: '', adminSettingsCrm: '' },
    //   admin = LIFF ID ที่หน้าแอดมินใช้ login (ถ้าตั้ง MINI_APP_ID แล้วหน้าแอดมินจะใช้ MINI_APP_ID แทน)

    // ── LINE OA ──────────────────────────────────────────────────────
    OA_ADD_FRIEND_URL: 'https://line.me/R/ti/p/@your-oa',     // ลิงก์เพิ่มเพื่อน OA ของ tenant
    DEFAULT_MEMBER_RICHMENU: '',                              // Rich Menu สมาชิก (ว่าง = ไม่เปลี่ยนเมนูให้อัตโนมัติจากหน้าลงทะเบียน)

    // ── แบรนด์ ───────────────────────────────────────────────────────
    BRAND: { village_th: 'ชื่อหมู่บ้านภาษาไทย', village_en: 'Village Name', short: 'Village', contact_email: '' },

    // ── ค่าเริ่มต้นเอกสาร/ใบแจ้งหนี้ในหน้าแอดมิน ─────────────────────
    VILLAGE_DEFAULTS: { village_name: '', juristic_name: '', juristic_name_th: '', bank_name: '', account_name: '', account_no: '' },

    // ── หน้าแจ้งชำระ ─────────────────────────────────────────────────
    SLIP: {
      payee_keywords: ['นิติบุคคล'],                          // คำที่ต้องมีในชื่อบัญชีผู้รับตามสลิป เช่น ชื่อนิติบุคคลของหมู่บ้าน
      id_prefix: 'village'                                    // คำนำหน้ารหัสรายการค่าส่วนกลาง (a-z)
    },

    // ── ชื่อ/ไอคอนผู้ส่งในแชท (ค่าเริ่มต้นในหน้าแอดมิน) ─────────────
    SENDER_NAMES: { admin: 'ผู้ช่วย Admin', ai_auto: 'AI อัตโนมัติ', serene: 'ผู้ช่วย AI' },
    SENDER_ICONS: { admin: '', ai_auto: '', serene: '' }
  };
})();
