import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PageHeader, Spinner, Stamp, EmptyState, useToast, useConfirm } from '../components/UI';
import { useAppUser } from '../context/AppUser';
import { logAction } from '../lib/audit';
import { exportToCsv } from '../lib/csv';

const GRADES = ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];
const SYSTEMS = ['الثانوية العامة', 'البكالوريا المصرية'];
const ROLES = [
  { value: 'student', label: 'طالب' },
  { value: 'moderator', label: 'مشرف' },
  { value: 'admin', label: 'أدمن كامل' },
];

export default function Accounts() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [selected, setSelected] = useState(new Set());
  const toast = useToast();
  const confirm = useConfirm();
  const me = useAppUser();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) toast('تعذّر تحميل الحسابات', 'error');
    setProfiles(data || []);
    setLoading(false);
  };

  const audit = (action, targetId, details) =>
    logAction({ adminId: me?.id, adminName: me?.name || 'أدمن', action, targetType: 'profile', targetId, details });

  const toggleBan = async (p) => {
    const ok = await confirm(
      p.banned ? `هل تريد إلغاء حظر "${p.name || 'الحساب'}"؟` : `هل تريد حظر "${p.name || 'الحساب'}"؟ لن يقدر يدخل التطبيق بعدها.`,
      { danger: !p.banned, confirmLabel: p.banned ? 'إلغاء الحظر' : 'حظر الحساب' }
    );
    if (!ok) return;
    const { error } = await supabase.from('profiles').update({ banned: !p.banned }).eq('id', p.id);
    if (error) { toast('حصل خطأ، حاول تاني', 'error'); return; }
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, banned: !p.banned } : x)));
    audit(p.banned ? 'unban' : 'ban', p.id, `${p.banned ? 'إلغاء حظر' : 'حظر'} ${p.name || p.email || p.id}`);
    toast(p.banned ? 'تم إلغاء الحظر' : 'تم حظر الحساب');
  };

  const changeRole = async (p, newRole) => {
    if (newRole === p.role) return;
    const ok = await confirm(
      `هل تريد تغيير دور "${p.name || 'الحساب'}" إلى "${ROLES.find((r) => r.value === newRole)?.label}"؟`,
      { danger: newRole === 'student', confirmLabel: 'تأكيد التغيير' }
    );
    if (!ok) return;
    const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', p.id);
    if (error) { toast('حصل خطأ، حاول تاني', 'error'); return; }
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, role: newRole } : x)));
    audit(newRole === 'student' ? 'demote' : 'promote', p.id, `تغيير دور ${p.name || p.email || p.id} إلى ${newRole}`);
    toast('تم تحديث الصلاحية');
  };

  const sendPasswordReset = async (p) => {
    if (!p.email) { toast('مفيش إيميل مسجل لهذا الحساب', 'error'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(p.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) { toast('تعذّر إرسال الرابط', 'error'); return; }
    toast(`تم إرسال رابط تغيير كلمة المرور إلى ${p.email}`);
  };

  const deleteAccountPermanently = async (p) => {
    const ok = await confirm(
      `حذف نهائي لحساب "${p.name || p.email}" — هيتحذف الحساب وكل بياناته من قاعدة البيانات بشكل لا رجعة فيه. متأكد؟`,
      { danger: true, confirmLabel: 'حذف نهائي لا رجعة فيه' }
    );
    if (!ok) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const { error } = await supabase.functions.invoke('admin-delete-user', {
      body: { user_id: p.id },
      headers: { Authorization: `Bearer ${sessionData.session.access_token}` },
    });
    if (error) { toast('تعذّر الحذف — تأكد إن الـ Edge Function متنشورة (راجع README)', 'error'); return; }
    setProfiles((prev) => prev.filter((x) => x.id !== p.id));
    audit('delete_account', p.id, `حذف نهائي لحساب ${p.name || p.email || p.id}`);
    toast('تم حذف الحساب نهائيًا');
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({ name: p.name || '', system: p.system || '', grade: p.grade || '', track: p.track || '' });
  };

  const saveEdit = async (id) => {
    const { error } = await supabase.from('profiles').update(editForm).eq('id', id);
    if (error) { toast('تعذّر حفظ التعديل', 'error'); return; }
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...editForm } : p)));
    audit('edit_profile', id, `تعديل بيانات ${editForm.name || id}`);
    setEditingId(null);
    toast('تم حفظ التعديلات');
  };

  const filtered = useMemo(() => {
    return profiles.filter((p) => {
      const matchesSearch =
        (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
        (p.email || '').toLowerCase().includes(search.toLowerCase());
      const matchesGrade = gradeFilter === 'الكل' || p.grade === gradeFilter;
      const matchesStatus =
        statusFilter === 'الكل' ||
        (statusFilter === 'محظور' && p.banned) ||
        (statusFilter === 'أدمن' && p.role === 'admin') ||
        (statusFilter === 'مشرف' && p.role === 'moderator') ||
        (statusFilter === 'نشط' && !p.banned && p.role === 'student');
      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [profiles, search, gradeFilter, statusFilter]);

  const toggleSelect = (id) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectAllVisible = () => {
    setSelected(new Set(filtered.filter((p) => p.role !== 'admin').map((p) => p.id)));
  };

  const clearSelection = () => setSelected(new Set());

  const bulkBan = async () => {
    const ids = [...selected];
    if (ids.length === 0) return;
    const ok = await confirm(`هتحظر ${ids.length} حساب دفعة واحدة، متأكد؟`, { danger: true, confirmLabel: `حظر ${ids.length} حساب` });
    if (!ok) return;
    const { error } = await supabase.from('profiles').update({ banned: true }).in('id', ids);
    if (error) { toast('حصل خطأ أثناء الحظر الجماعي', 'error'); return; }
    setProfiles((prev) => prev.map((p) => (ids.includes(p.id) ? { ...p, banned: true } : p)));
    audit('bulk_ban', null, `حظر جماعي لـ ${ids.length} حساب`);
    toast(`تم حظر ${ids.length} حساب`);
    clearSelection();
  };

  const exportCsv = () => {
    exportToCsv(
      'حسابات-طالب-علم.csv',
      filtered,
      [
        { key: 'name', label: 'الاسم' },
        { key: 'email', label: 'الإيميل' },
        { key: 'system', label: 'النظام' },
        { key: 'grade', label: 'الصف' },
        { key: 'track', label: 'الشعبة' },
        { key: 'role', label: 'الدور' },
        { key: 'banned', label: 'محظور' },
        { key: 'created_at', label: 'تاريخ التسجيل' },
      ]
    );
  };

  return (
    <div>
      <PageHeader
        eyebrow={`${profiles.length} حساب مسجّل`}
        title="إدارة الحسابات"
        action={<button onClick={exportCsv} className="btn-ghost">تصدير CSV ⭳</button>}
      />

      <div className="card p-4 mb-4 flex flex-col md:flex-row gap-3">
        <input
          placeholder="ابحث بالاسم أو الإيميل"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field md:flex-1"
        />
        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="input-field md:w-56">
          <option>الكل</option>
          {GRADES.map((g) => <option key={g}>{g}</option>)}
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field md:w-40">
          {['الكل', 'نشط', 'مشرف', 'أدمن', 'محظور'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex gap-2 text-sm">
          <button onClick={selectAllVisible} className="font-semibold text-muted hover:text-inktext">تحديد الكل ({filtered.length})</button>
          {selected.size > 0 && (
            <button onClick={clearSelection} className="font-semibold text-muted hover:text-inktext">إلغاء التحديد</button>
          )}
        </div>
        {selected.size > 0 && (
          <button onClick={bulkBan} className="btn-danger !px-4 !py-2 text-sm">حظر المحدَّدين ({selected.size})</button>
        )}
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon="◉" title="مفيش حسابات مطابقة" hint="جرّب تغيّر البحث أو الفلاتر" />
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="card p-4">
              {editingId === p.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted font-semibold">الاسم</label>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="input-field mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-muted font-semibold">النظام</label>
                      <select
                        value={editForm.system}
                        onChange={(e) => setEditForm({ ...editForm, system: e.target.value, track: '' })}
                        className="input-field mt-1"
                      >
                        <option value="">—</option>
                        {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted font-semibold">الصف</label>
                      <select
                        value={editForm.grade}
                        onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                        className="input-field mt-1"
                      >
                        <option value="">—</option>
                        {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-muted font-semibold">الشعبة/المسار</label>
                      <input
                        value={editForm.track}
                        onChange={(e) => setEditForm({ ...editForm, track: e.target.value })}
                        className="input-field mt-1"
                        placeholder="مثال: علمي علوم"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(p.id)} className="btn-primary !px-4 !py-1.5 text-sm">حفظ</button>
                    <button onClick={() => setEditingId(null)} className="btn-ghost !px-4 !py-1.5 text-sm">إلغاء</button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.role !== 'admin' && (
                      <input
                        type="checkbox"
                        checked={selected.has(p.id)}
                        onChange={() => toggleSelect(p.id)}
                        className="w-4 h-4 accent-ink shrink-0"
                      />
                    )}
                    {p.avatar_url ? (
                      <img src={p.avatar_url} className="w-10 h-10 rounded-full object-cover border-2 border-ink shrink-0" alt="" />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-ink text-gold flex items-center justify-center text-sm font-messiri shrink-0">
                        {(p.name || '؟').charAt(0)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold flex items-center gap-2 flex-wrap">
                        {p.name || 'بدون اسم'}
                        {p.role === 'admin' && <Stamp tone="gold">أدمن</Stamp>}
                        {p.role === 'moderator' && <Stamp tone="ink">مشرف</Stamp>}
                        {p.banned && <Stamp tone="coral">محظور</Stamp>}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {p.email || '—'} · {p.system || '—'} • {p.grade || '—'} {p.track ? `• ${p.track}` : ''}
                      </p>
                      <p className="text-xs text-muted/70 mt-0.5">
                        سجّل في {new Date(p.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap items-center">
                    <select
                      value={p.role || 'student'}
                      onChange={(e) => changeRole(p, e.target.value)}
                      className="input-field !w-auto !py-1.5 text-xs"
                    >
                      {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                    </select>
                    <button onClick={() => startEdit(p)} className="btn-ghost !px-3 !py-1.5 text-xs">تعديل البيانات</button>
                    <button onClick={() => sendPasswordReset(p)} className="btn-ghost !px-3 !py-1.5 text-xs">رابط كلمة المرور</button>
                    {p.role !== 'admin' && (
                      <button onClick={() => toggleBan(p)} className={p.banned ? 'btn-ghost !px-3 !py-1.5 text-xs' : 'btn-danger !px-3 !py-1.5 text-xs'}>
                        {p.banned ? 'إلغاء الحظر' : 'حظر'}
                      </button>
                    )}
                    {p.role !== 'admin' && (
                      <button onClick={() => deleteAccountPermanently(p)} className="text-xs font-semibold text-coral-dark hover:underline px-1">
                        حذف نهائي
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
