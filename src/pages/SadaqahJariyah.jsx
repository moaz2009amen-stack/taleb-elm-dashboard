import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PageHeader, Spinner, EmptyState, useToast, useConfirm } from '../components/UI';

export default function SadaqahJariyah() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: 'صدقة جارية', name: '', body: '', date: '', dua_request: '', image_url: '' });
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('sadaqah_jariyah').select('*').order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  const add = async () => {
    if (!form.name.trim() || !form.body.trim() || !form.dua_request.trim()) {
      toast('الاسم والنص والدعاء مطلوبين', 'error');
      return;
    }
    const { error } = await supabase.from('sadaqah_jariyah').insert({
      title: form.title.trim() || 'صدقة جارية',
      name: form.name.trim(),
      body: form.body.trim(),
      date: form.date.trim(),
      dua_request: form.dua_request.trim(),
      image_url: form.image_url.trim() || null,
      sort_order: items.length,
    });
    if (error) { toast('تعذّر الإضافة', 'error'); return; }
    setForm({ title: 'صدقة جارية', name: '', body: '', date: '', dua_request: '', image_url: '' });
    toast('تمت الإضافة');
    load();
  };

  const remove = async (id) => {
    const ok = await confirm('هتحذف الصدقة الجارية دي، متأكد؟', { danger: true, confirmLabel: 'حذف' });
    if (!ok) return;
    await supabase.from('sadaqah_jariyah').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast('تم الحذف');
  };

  return (
    <div>
      <PageHeader eyebrow={`${items.length} صدقة جارية`} title="الصدقة الجارية" />

      <div className="card p-5 mb-8 max-w-2xl space-y-3">
        <input placeholder="الاسم *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-field" />
        <textarea placeholder="النص/الدعاء الكامل *" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={4} className="input-field" />
        <div className="grid grid-cols-2 gap-3">
          <input placeholder="التاريخ (اختياري، نص حر زي 23/5/2023)" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="input-field" />
          <input placeholder="نص الدعوة للدعاء *" value={form.dua_request} onChange={(e) => setForm({ ...form, dua_request: e.target.value })} className="input-field" />
        </div>
        <input placeholder="رابط صورة (اختياري — ارفعها على Supabase Storage الأول وحط الرابط هنا)" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="input-field" dir="ltr" />
        <button onClick={add} className="btn-primary">إضافة</button>
      </div>

      {loading ? <Spinner /> : items.length === 0 ? <EmptyState icon="🤍" title="مفيش صدقات جارية مسجّلة" /> : (
        <div className="space-y-2 max-w-2xl">
          {items.map((i) => (
            <div key={i.id} className="card p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold">{i.name}</p>
                <p className="text-xs text-muted truncate">{i.body}</p>
              </div>
              <button onClick={() => remove(i.id)} className="text-xs font-semibold text-muted hover:text-coral px-3 py-1.5 shrink-0">حذف</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
