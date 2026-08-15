import { supabase } from '../supabaseClient';

/**
 * يسجّل إجراء إداري في سجل النشاط. بيتنفّذ بهدوء (silent) — لو فشل التسجيل
 * لأي سبب، ميوقفش العملية الأساسية (زي الحظر أو الحذف) وميظهرش خطأ للمستخدم.
 */
export async function logAction({ adminId, adminName, action, targetType, targetId, details }) {
  try {
    await supabase.from('admin_audit_log').insert({
      admin_id: adminId,
      admin_name: adminName,
      action,
      target_type: targetType,
      target_id: targetId ? String(targetId) : null,
      details,
    });
  } catch {
    // متعمّد: التسجيل ثانوي ومش لازم يكسر تجربة الأدمن
  }
}
