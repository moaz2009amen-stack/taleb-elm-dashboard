import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const GRADES = ['', 'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];
const SYSTEMS = ['', 'الثانوية العامة', 'البكالوريا المصرية'];

export default function StudyPlans() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ subject_name: '', title: '', description: '', target_system: '', target_grade: '' });

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('study_plan_tasks').select('*').order('created_at', { ascending: false });
    setPlans(data || []);
    setLoading(false);
  };

  const add = async () => {
    if (!form.subject_name.trim() || !form.title.trim()) return;
    await supabase.from('study_plan_tasks').insert({
      subject_name: form.subject_name.trim(),
      title: form.title.trim(),
      description: form.description.trim() || null,
      target_system: form.target_system || null,
      target_grade: form.target_grade || null,
    });
    setForm({ subject_name: '', title: '', description: '', target_system: '', target_grade: '' });
    load();
  };

  const remove = async (id) => {
    await supabase.from('study_plan_tasks').delete().eq('id', id);
    setPlans((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">خطط مذاكرة جاهزة</h2>

      <div className="bg-white border border-neutral-200 rounded-2xl p-5 mb-6 max-w-2xl">
        <p className="text-sm text-neutral-500 mb-4">أضف مهمة جاهزة لمادة معينة، وأي طالب يقدر يضيفها لخطته لو حب</p>
        <div className="grid grid-cols-2 gap-3">
          <input
            placeholder="اسم المادة *"
            value={form.subject_name}
            onChange={(e) => setForm({ ...form, subject_name: e.target.value })}
            className="border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-sm outline-none"
          />
          <input
            placeholder="عنوان المهمة *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-sm outline-none"
          />
          <select
            value={form.target_system}
            onChange={(e) => setForm({ ...form, target_system: e.target.value })}
            className="border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-sm outline-none"
          >
            {SYSTEMS.map((s) => <option key={s} value={s}>{s || 'كل الأنظمة'}</option>)}
          </select>
          <select
            value={form.target_grade}
            onChange={(e) => setForm({ ...form, target_grade: e.target.value })}
            className="border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-sm outline-none"
          >
            {GRADES.map((g) => <option key={g} value={g}>{g || 'كل الصفوف'}</option>)}
          </select>
          <textarea
            placeholder="وصف إضافي (اختياري)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-2 text-sm outline-none col-span-2"
            rows={2}
          />
        </div>
        <button
          onClick={add}
          className="mt-3 border-2 border-black bg-black text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-white hover:text-black transition"
        >
          إضافة المهمة
        </button>
      </div>

      {loading ? (
        <p className="text-neutral-500">جارِ التحميل...</p>
      ) : (
        <div className="space-y-2">
          {plans.map((p) => (
            <div key={p.id} className="bg-white border border-neutral-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="text-xs text-neutral-500">
                  {p.subject_name} {p.target_grade ? `• ${p.target_grade}` : ''} {p.target_system ? `• ${p.target_system}` : ''}
                </p>
              </div>
              <button onClick={() => remove(p.id)} className="text-xs font-semibold text-neutral-400 hover:text-black px-3 py-1.5">
                حذف
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
