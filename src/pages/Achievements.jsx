import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const METRICS = [
  { value: 'study_hours', label: 'ساعات المذاكرة' },
  { value: 'tasks', label: 'المهام المنجزة' },
  { value: 'sessions', label: 'جلسات المذاكرة' },
  { value: 'streak', label: 'أيام متتالية' },
  { value: 'subjects_completed', label: 'مواد مكتملة' },
];

export default function Achievements() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ title: '', description: '', metric: 'study_hours', threshold: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('achievements_catalog').select('*').order('threshold');
    setItems(data || []);
    setLoading(false);
  };

  const add = async () => {
    if (!form.title.trim() || !form.threshold) return;
    await supabase.from('achievements_catalog').insert({
      title: form.title.trim(),
      description: form.description.trim() || form.title.trim(),
      metric: form.metric,
      threshold: Number(form.threshold),
    });
    setForm({ title: '', description: '', metric: 'study_hours', threshold: '' });
    load();
  };

  const remove = async (id) => {
    await supabase.from('achievements_catalog').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">الإنجازات</h2>

      <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 max-w-2xl">
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="اسم الإنجاز *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="وصف قصير"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-sm outline-none"
          />
          <select
            value={form.metric}
            onChange={(e) => setForm({ ...form, metric: e.target.value })}
            className="border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-sm outline-none"
          >
            {METRICS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>
          <input
            type="number"
            placeholder="الرقم المطلوب للفتح *"
            value={form.threshold}
            onChange={(e) => setForm({ ...form, threshold: e.target.value })}
            className="border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-sm outline-none"
          />
        </div>
        <button
          onClick={add}
          className="mt-3 border-2 border-black bg-black text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          إضافة الإنجاز
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">جارِ التحميل...</p>
      ) : (
        <div className="space-y-2">
          {items.map((i) => (
            <div key={i.id} className="bg-white border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{i.title}</p>
                <p className="text-xs text-neutral-500">
                  {METRICS.find((m) => m.value === i.metric)?.label} ≥ {i.threshold}
                </p>
              </div>
              <button onClick={() => remove(i.id)} className="text-xs font-semibold text-neutral-400 hover:text-black px-3 py-1.5">
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
