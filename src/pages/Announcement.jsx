import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PageHeader, Spinner, EmptyState, useToast, useConfirm } from '../components/UI';

const GRADES = ['', 'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];
const SYSTEMS = ['', 'الثانوية العامة', 'البكالوريا المصرية'];

export default function Announcement() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ message: '', target_system: '', target_grade: '' });
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('announcements').select('*').eq('active', true).order('created_at', { ascending: false });
    setAnnouncements(data || []);
    setLoading(false);
  };

  const publish = async () => {
    if (!form.message.trim()) return;
    setSaving(true);
    const { error } = await supabase.from('announcements').insert({
      message: form.message.trim(),
      active: true,
      target_system: form.target_system || null,
      target_grade: form.target_grade || null,
    });
    setSaving(false);
    if (error) { toast('تعذّر نشر الرسالة', 'error'); return; }
    setForm({ message: '', target_system: '', target_grade: '' });
    toast('تم نشر الرسالة');
    load();
  };

  const remove = async (id) => {
    const ok = await confirm('هتشيل الرسالة دي من الظهور، متأكد؟', { danger: true, confirmLabel: 'إخفاء الرسالة' });
    if (!ok) return;
    await supabase.from('announcements').update({ active: false }).eq('id', id);
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    toast('تم إخفاء الرسالة');
  };

  return (
    <div>
      <PageHeader eyebrow="التواصل مع الطلاب" title="رسالة عامة" />

      <div className="card p-4 mb-6 bg-gold/10 border-gold/40 text-sm text-inktext leading-relaxed">
        ملحوظة: التطبيق حاليًا بيعرض دايمًا آخر رسالة نشطة لكل الطلاب بغض النظر عن الاستهداف. لو حبيت الاستهداف
        (لصف أو نظام معين) يشتغل فعليًا جوه التطبيق، محتاجين تعديل بسيط في كود الفلاتر بعدين — دلوقتي البيانات
        بتتسجل وجاهزة للاستخدام.
      </div>

      <div className="card p-5 mb-8 max-w-xl">
        <p className="text-sm text-muted mb-4">أضف رسالة جديدة تظهر لكل الطلاب فوق شاشة "اليوم"</p>
        <textarea
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          rows={3}
          placeholder="مثال: امتحانات نصف العام هتبدأ الأسبوع الجاي، ركزوا في المراجعة 💪"
          className="input-field mb-3"
        />
        <div className="grid grid-cols-2 gap-3 mb-3">
          <select value={form.target_system} onChange={(e) => setForm({ ...form, target_system: e.target.value })} className="input-field">
            {SYSTEMS.map((s) => <option key={s} value={s}>{s || 'كل الأنظمة'}</option>)}
          </select>
          <select value={form.target_grade} onChange={(e) => setForm({ ...form, target_grade: e.target.value })} className="input-field">
            {GRADES.map((g) => <option key={g} value={g}>{g || 'كل الصفوف'}</option>)}
          </select>
        </div>
        <button onClick={publish} disabled={saving || !form.message.trim()} className="btn-primary">
          {saving ? 'جارِ النشر...' : 'نشر الرسالة'}
        </button>
      </div>

      <p className="font-messiri font-bold mb-3">الرسائل النشطة</p>
      {loading ? (
        <Spinner />
      ) : announcements.length === 0 ? (
        <EmptyState icon="✉" title="مفيش رسائل نشطة حاليًا" />
      ) : (
        <div className="space-y-3 max-w-xl">
          {announcements.map((a) => (
            <div key={a.id} className="card p-4">
              <p className="text-sm mb-2">{a.message}</p>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <p className="text-xs text-muted">
                  {a.target_system || 'كل الأنظمة'} • {a.target_grade || 'كل الصفوف'} · {new Date(a.created_at).toLocaleString('ar-EG')}
                </p>
                <button onClick={() => remove(a.id)} className="text-xs font-semibold text-muted hover:text-coral px-2 py-1">إخفاء</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
