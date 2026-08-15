import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PageHeader, Spinner, Stamp, EmptyState } from '../components/UI';

const ACTION_TONE = {
  ban: 'coral',
  unban: 'forest',
  promote: 'gold',
  demote: 'coral',
  delete_thread: 'coral',
  delete_reply: 'coral',
  delete_report_content: 'coral',
  edit_profile: 'ink',
  publish_announcement: 'ink',
  hide_announcement: 'coral',
  bulk_ban: 'coral',
  bulk_delete_threads: 'coral',
};

const ACTION_LABEL = {
  ban: 'حظر حساب',
  unban: 'إلغاء حظر',
  promote: 'ترقية',
  demote: 'سحب صلاحية',
  delete_thread: 'حذف سؤال',
  delete_reply: 'حذف رد',
  delete_report_content: 'حذف محتوى مُبلّغ عنه',
  edit_profile: 'تعديل بيانات حساب',
  publish_announcement: 'نشر رسالة عامة',
  hide_announcement: 'إخفاء رسالة عامة',
  bulk_ban: 'حظر جماعي',
  bulk_delete_threads: 'حذف جماعي لأسئلة',
};

export default function AuditLog() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);
    setRows(data || []);
    setLoading(false);
  };

  return (
    <div>
      <PageHeader eyebrow="شفافية وتتبّع" title="سجل النشاط" />

      {loading ? (
        <Spinner />
      ) : rows.length === 0 ? (
        <EmptyState icon="⧉" title="مفيش نشاط مسجّل لسه" hint="كل إجراء إداري (حظر، حذف، ترقية) هيظهر هنا تلقائيًا" />
      ) : (
        <div className="card divide-y divide-parchment-line overflow-hidden">
          {rows.map((r) => (
            <div key={r.id} className="p-4 flex items-start gap-3">
              <Stamp tone={ACTION_TONE[r.action] || 'ink'}>{ACTION_LABEL[r.action] || r.action}</Stamp>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">{r.details || r.target_type}</p>
                <p className="text-xs text-muted mt-0.5">
                  {r.admin_name || 'أدمن'} · {new Date(r.created_at).toLocaleString('ar-EG')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
