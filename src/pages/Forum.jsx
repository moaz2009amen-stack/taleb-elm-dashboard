import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState('الكل');
  const [expandedId, setExpandedId] = useState(null);
  const [replies, setReplies] = useState({});

  const grades = ['الكل', 'الصف الأول الثانوي', 'الصف الثاني الثانوي', 'الصف الثالث الثانوي'];

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    setLoading(true);
    const { data } = await supabase.from('forum_threads').select('*').order('created_at', { ascending: false });
    setThreads(data || []);
    setLoading(false);
  };

  const toggleExpand = async (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (!replies[id]) {
      const { data } = await supabase.from('forum_replies').select('*').eq('thread_id', id).order('created_at');
      setReplies((prev) => ({ ...prev, [id]: data || [] }));
    }
  };

  const deleteThread = async (id) => {
    if (!confirm('هتحذف السؤال ده وكل الردود عليه، متأكد؟')) return;
    await supabase.from('forum_threads').delete().eq('id', id);
    setThreads((prev) => prev.filter((t) => t.id !== id));
  };

  const deleteReply = async (threadId, replyId) => {
    if (!confirm('هتحذف الرد ده، متأكد؟')) return;
    await supabase.from('forum_replies').delete().eq('id', replyId);
    setReplies((prev) => ({ ...prev, [threadId]: prev[threadId].filter((r) => r.id !== replyId) }));
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, replies_count: Math.max(0, t.replies_count - 1) } : t)));
  };

  const filtered = gradeFilter === 'الكل' ? threads : threads.filter((t) => t.grade === gradeFilter);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">إدارة المنتدى</h2>
        <select
          value={gradeFilter}
          onChange={(e) => setGradeFilter(e.target.value)}
          className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm"
        >
          {grades.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-slate-500">جارِ التحميل...</p>
      ) : filtered.length === 0 ? (
        <p className="text-slate-500">مفيش مواضيع</p>
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 cursor-pointer" onClick={() => toggleExpand(t.id)}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-lg">{t.grade}</span>
                    {t.track && <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-lg">{t.track}</span>}
                    {t.subject_name && <span className="text-xs bg-secondary/10 text-secondary px-2 py-0.5 rounded-lg">{t.subject_name}</span>}
                  </div>
                  <h3 className="font-bold">{t.title}</h3>
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">{t.body}</p>
                  <p className="text-xs text-slate-400 mt-2">
                    {t.author_name} • {new Date(t.created_at).toLocaleDateString('ar-EG')} • {t.replies_count} رد
                  </p>
                </div>
                <button
                  onClick={() => deleteThread(t.id)}
                  className="text-danger text-sm font-semibold hover:bg-danger/10 px-3 py-1.5 rounded-lg whitespace-nowrap"
                >
                  حذف السؤال
                </button>
              </div>

              {expandedId === t.id && (
                <div className="border-t border-slate-100 bg-slate-50 p-4 space-y-2">
                  {!replies[t.id] || replies[t.id].length === 0 ? (
                    <p className="text-sm text-slate-400">مفيش ردود</p>
                  ) : (
                    replies[t.id].map((r) => (
                      <div key={r.id} className="bg-white rounded-xl p-3 flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{r.author_name}</p>
                          <p className="text-sm text-slate-600">{r.body}</p>
                          <p className="text-xs text-slate-400 mt-1">{new Date(r.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                        <button
                          onClick={() => deleteReply(t.id, r.id)}
                          className="text-danger text-xs font-semibold hover:bg-danger/10 px-2 py-1 rounded-lg whitespace-nowrap"
                        >
                          حذف
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
