import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Overview() {
  const [stats, setStats] = useState({ users: 0, threads: 0, replies: 0, banned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [{ count: users }, { count: threads }, { count: replies }, { count: banned }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
      supabase.from('forum_replies').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('banned', true),
    ]);
    setStats({ users: users || 0, threads: threads || 0, replies: replies || 0, banned: banned || 0 });
    setLoading(false);
  };

  const cards = [
    { label: 'إجمالي الطلاب', value: stats.users, color: 'bg-primary/10 text-primary', icon: '👥' },
    { label: 'أسئلة المنتدى', value: stats.threads, color: 'bg-secondary/10 text-secondary', icon: '❓' },
    { label: 'الردود', value: stats.replies, color: 'bg-accent/10 text-accent', icon: '💬' },
    { label: 'حسابات محظورة', value: stats.banned, color: 'bg-danger/10 text-danger', icon: '🚫' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">نظرة عامة</h2>
      {loading ? (
        <p className="text-slate-500">جارِ التحميل...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="bg-white rounded-2xl shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 ${c.color}`}>{c.icon}</div>
              <p className="text-2xl font-extrabold">{c.value}</p>
              <p className="text-sm text-slate-500">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
