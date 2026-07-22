import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const GRADES = ['الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];
const SYSTEMS = ['الثانوية العامة', 'البكالوريا المصرية'];

export default function Accounts() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    setProfiles(data || []);
    setLoading(false);
  };

  const toggleBan = async (id, current) => {
    await supabase.from('profiles').update({ banned: !current }).eq('id', id);
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, banned: !current } : p)));
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({ name: p.name || '', system: p.system || '', grade: p.grade || '', track: p.track || '' });
  };

  const saveEdit = async (id) => {
    await supabase.from('profiles').update(editForm).eq('id', id);
    setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, ...editForm } : p)));
    setEditingId(null);
  };

  const filtered = profiles.filter((p) => (p.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">إدارة الحسابات</h2>
        <input
          placeholder="ابحث بالاسم"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-2 border-black rounded-lg px-4 py-2 text-sm w-56 outline-none"
        />
      </div>

      {loading ? (
        <p className="text-neutral-500">جارِ التحميل...</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="border-2 border-black rounded-2xl p-4">
              {editingId === p.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-neutral-500">الاسم</label>
                      <input
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-1.5 text-sm mt-1 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">النظام</label>
                      <select
                        value={editForm.system}
                        onChange={(e) => setEditForm({ ...editForm, system: e.target.value, track: '' })}
                        className="w-full border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-1.5 text-sm mt-1 outline-none"
                      >
                        <option value="">—</option>
                        {SYSTEMS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">الصف</label>
                      <select
                        value={editForm.grade}
                        onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                        className="w-full border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-1.5 text-sm mt-1 outline-none"
                      >
                        <option value="">—</option>
                        {GRADES.map((g) => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-neutral-500">الشعبة/المسار</label>
                      <input
                        value={editForm.track}
                        onChange={(e) => setEditForm({ ...editForm, track: e.target.value })}
                        className="w-full border-2 border-neutral-200 focus:border-black rounded-lg px-3 py-1.5 text-sm mt-1 outline-none"
                        placeholder="مثال: علمي علوم"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => saveEdit(p.id)} className="border-2 border-black bg-black text-white text-sm font-semibold px-4 py-1.5 rounded-lg hover:bg-white hover:text-black transition">
                      حفظ
                    </button>
                    <button onClick={() => setEditingId(null)} className="border-2 border-neutral-300 text-sm font-semibold px-4 py-1.5 rounded-lg hover:border-black transition">
                      إلغاء
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} className="w-9 h-9 rounded-full object-cover border-2 border-black" alt="" />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-black text-white flex items-center justify-center text-xs">◉</div>
                    )}
                    <div>
                      <p className="font-semibold flex items-center gap-2">
                        {p.name || '—'}
                        {p.role === 'admin' && <span className="text-xs bg-black text-white px-2 py-0.5 rounded-lg">أدمن</span>}
                        {p.banned && <span className="text-xs border border-black px-2 py-0.5 rounded-lg">محظور</span>}
                      </p>
                      <p className="text-xs text-neutral-500">
                        {p.system || '—'} • {p.grade || '—'} {p.track ? `• ${p.track}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="text-xs font-semibold border-2 border-neutral-300 hover:border-black px-3 py-1.5 rounded-lg transition">
                      تعديل البيانات
                    </button>
                    {p.role !== 'admin' && (
                      <button
                        onClick={() => toggleBan(p.id, p.banned)}
                        className="text-xs font-semibold border-2 border-black px-3 py-1.5 rounded-lg hover:bg-black hover:text-white transition"
                      >
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
