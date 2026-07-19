import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Accounts() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  const filtered = profiles.filter((p) => (p.name || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">إدارة الحسابات</h2>
        <input
          placeholder="ابحث بالاسم"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm w-56"
        />
      </div>

      {loading ? (
        <p className="text-slate-500">جارِ التحميل...</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                <th className="text-right p-3 font-semibold">الاسم</th>
                <th className="text-right p-3 font-semibold">النظام</th>
                <th className="text-right p-3 font-semibold">الصف</th>
                <th className="text-right p-3 font-semibold">الشعبة/المسار</th>
                <th className="text-right p-3 font-semibold">تاريخ التسجيل</th>
                <th className="text-right p-3 font-semibold">الحالة</th>
                <th className="text-right p-3 font-semibold"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-slate-100">
                  <td className="p-3 font-semibold flex items-center gap-2">
                    {p.avatar_url ? (
                      <img src={p.avatar_url} className="w-7 h-7 rounded-full object-cover" alt="" />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center text-xs">👤</div>
                    )}
                    {p.name || '—'}
                    {p.role === 'admin' && <span className="text-xs bg-warning/10 text-warning px-2 py-0.5 rounded-lg">أدمن</span>}
                  </td>
                  <td className="p-3">{p.system || '—'}</td>
                  <td className="p-3">{p.grade || '—'}</td>
                  <td className="p-3">{p.track || '—'}</td>
                  <td className="p-3 text-slate-500">{new Date(p.created_at).toLocaleDateString('ar-EG')}</td>
                  <td className="p-3">
                    {p.banned ? (
                      <span className="text-xs bg-danger/10 text-danger px-2 py-1 rounded-lg">محظور</span>
                    ) : (
                      <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-lg">نشط</span>
                    )}
                  </td>
                  <td className="p-3">
                    {p.role !== 'admin' && (
                      <button
                        onClick={() => toggleBan(p.id, p.banned)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg ${
                          p.banned ? 'text-success hover:bg-success/10' : 'text-danger hover:bg-danger/10'
                        }`}
                      >
                        {p.banned ? 'إلغاء الحظر' : 'حظر الحساب'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
