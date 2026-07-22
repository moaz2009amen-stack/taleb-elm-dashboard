import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Overview() {
  const [stats, setStats] = useState({ users: 0, threads: 0, replies: 0, banned: 0, reports: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const [{ count: users }, { count: threads }, { count: replies }, { count: banned }, { count: reports }] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('forum_threads').select('*', { count: 'exact', head: true }),
      supabase.from('forum_replies').select('*', { count: 'exact', head: true }),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('banned', true),
      supabase.from('forum_reports').select('*', { count: 'exact', head: true }),
    ]);
    setStats({ users: users || 0, threads: threads || 0, replies: replies || 0, banned: banned || 0, reports: reports || 0 });
    setLoading(false);
  };

  const cards = [
    { label: 'إجمالي الطلاب', value: stats.users, icon: '◉' },
    { label: 'أسئلة المنتدى', value: stats.threads, icon: '◈' },
    { label: 'الردود', value: stats.replies, icon: '✎' },
    { label: 'بلاغات', value: stats.reports, icon: '⚑' },
    { label: 'حسابات محظورة', value: stats.banned, icon: '⊘' },
  ];

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">نظرة عامة</h2>
      {loading ? (
        <p className="text-neutral-500">جارِ التحميل...</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {cards.map((c) => (
            <div key={c.label} className="border-2 border-black rounded-2xl p-5">
              <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center text-lg mb-3">{c.icon}</div>
              <p className="text-2xl font-extrabold">{c.value}</p>
              <p className="text-sm text-neutral-500">{c.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
