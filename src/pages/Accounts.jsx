import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PageHeader, Spinner, Stamp, EmptyState, useToast, useConfirm } from '../components/UI';

const GRADES = ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];
const SYSTEMS = ['الثانوية العامة', 'البكالوريا المصرية'];

export default function Accounts() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('الكل');
  const [statusFilter, setStatusFilter] = useState('الكل');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const toast = useToast();
  const confirm = useConfirm();

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

  const toggleBan = async (p) => {
    const ok = await confirm(
      p.banned ? `هل تريد إلغاء حظر "${p.name || 'الحساب'}"؟` : `هل تريد حظر "${p.name || 'الحساب'}"؟ لن يقدر يدخل التطبيق بعدها.`,
      { danger: !p.banned, confirmLabel: p.banned ? 'إلغاء الحظر' : 'حظر الحساب' }
    );
    if (!ok) return;
    const { error } = await supabase.from('profiles').update({ banned: !p.banned }).eq('id', p.id);
    if (error) { toast('حصل خطأ، حاول تاني', 'error'); return; }
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, banned: !p.banned } : x)));
    toast(p.banned ? 'تم إلغاء الحظر' : 'تم حظر الحساب');
  };

  const toggleAdmin = async (p) => {
    const makingAdmin = p.role !== 'admin';
    const ok = await confirm(
      makingAdmin
        ? `هل تريد ترقية "${p.name || 'الحساب'}" ليصبح أدمن؟ هيقدر يدخل لوحة التحكم دي بالكامل.`
        : `هل تريد إزالة صلاحيات الأدمن من "${p.name || 'الحساب'}"؟`,
      { danger: !makingAdmin, confirmLabel: makingAdmin ? 'ترقية لأدمن' : 'إزالة الصلاحية' }
    );
    if (!ok) return;
    const { error } = await supabase.from('profiles').update({ role: makingAdmin ? 'admin' : 'student' }).eq('id', p.id);
    if (error) { toast('حصل خطأ، حاول تاني', 'error'); return; }
    setProfiles((prev) => prev.map((x) => (x.id === p.id ? { ...x, role: makingAdmin ? 'admin' : 'student' } : x)));
    toast(makingAdmin ? 'تمت الترقية لأدمن' : 'تم سحب صلاحية الأدمن');
  };

  const sendPasswordReset = async (p) => {
    if (!p.email) { toast('مفيش إيميل مسجل لهذا الحساب', 'error'); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(p.email);
    if (error) { toast('تعذّر إرسال الرابط', 'error'); return; }
    toast(`تم إرسال رابط تغيير كلمة المرور إلى ${p.email}`);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({ name: p.name || '', system: p.system || '', grade: p.grade || '', track: p.track || '' });
  };

  const saveEdit = async (id) => {
    const { error } = await supabase.from('profiles').update(editForm).eq('id', id);
    if (error) { toast('تعذّر حفظ التعديل', 'error'); return; }
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...editForm } : p)));
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
        (statusFilter === 'نشط' && !p.banned && p.role !== 'admin');
      return matchesSearch && matchesGrade && matchesStatus;
    });
  }, [profiles, search, gradeFilter, statusFilter]);

  return (
    <div>
      <PageHeader eyebrow={`${profiles.length} حساب مسجّل`} title="إدارة الحسابات" />

      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3">
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
          {['الكل', 'نشط', 'أدمن', 'محظور'].map((s) => <option key={s}>{s}</option>)}
        </select>
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
                        {p.banned && <Stamp tone="coral">محظور</Stamp>}
                      </p>
                      <p className="text-xs text-muted truncate">
                        {p.email || '—'} · {p.system || '—'} • {p.grade || '—'} {p.track ? `• ${p.track}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => startEdit(p)} className="btn-ghost !px-3 !py-1.5 text-xs">تعديل البيانات</button>
                    <button onClick={() => sendPasswordReset(p)} className="btn-ghost !px-3 !py-1.5 text-xs">رابط تغيير كلمة المرور</button>
                    <button onClick={() => toggleAdmin(p)} className="btn-ghost !px-3 !py-1.5 text-xs">
                      {p.role === 'admin' ? 'إزالة صلاحية الأدمن' : 'ترقية لأدمن'}
                    </button>
                    {p.role !== 'admin' && (
                      <button onClick={() => toggleBan(p)} className={p.banned ? 'btn-ghost !px-3 !py-1.5 text-xs' : 'btn-danger !px-3 !py-1.5 text-xs'}>
                        {p.banned ? 'إلغاء الحظر' : 'حظر الحساب'}
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
