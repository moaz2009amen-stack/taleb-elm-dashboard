import { useEffect, useMemo, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PageHeader, Spinner, Stamp, EmptyState, useToast, useConfirm } from '../components/UI';

export default function Forum() {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradeFilter, setGradeFilter] = useState('الكل');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [replies, setReplies] = useState({});
  const toast = useToast();
  const confirm = useConfirm();

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
    const ok = await confirm('هتحذف السؤال ده وكل الردود عليه، متأكد؟', { danger: true, confirmLabel: 'حذف السؤال' });
    if (!ok) return;
    await supabase.from('forum_threads').delete().eq('id', id);
    setThreads((prev) => prev.filter((t) => t.id !== id));
    toast('تم حذف السؤال');
  };

  const deleteReply = async (threadId, replyId) => {
    const ok = await confirm('هتحذف الرد ده، متأكد؟', { danger: true, confirmLabel: 'حذف الرد' });
    if (!ok) return;
    await supabase.from('forum_replies').delete().eq('id', replyId);
    setReplies((prev) => ({ ...prev, [threadId]: prev[threadId].filter((r) => r.id !== replyId) }));
    setThreads((prev) => prev.map((t) => (t.id === threadId ? { ...t, replies_count: Math.max(0, t.replies_count - 1) } : t)));
    toast('تم حذف الرد');
  };

  const filtered = useMemo(() => {
    return threads
      .filter((t) => gradeFilter === 'الكل' || t.grade === gradeFilter)
      .filter((t) => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.body.toLowerCase().includes(q) || (t.author_name || '').toLowerCase().includes(q);
      });
  }, [threads, gradeFilter, search]);

  return (
    <div>
      <PageHeader eyebrow={`${threads.length} سؤال في المنتدى`} title="إدارة المنتدى" />

      <div className="card p-4 mb-6 flex flex-col md:flex-row gap-3">
        <input
          placeholder="ابحث في العناوين والأسئلة"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field md:flex-1"
        />
        <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="input-field md:w-56">
          {grades.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>

      {loading ? (
        <Spinner />
      ) : filtered.length === 0 ? (
        <EmptyState icon="◈" title="مفيش مواضيع مطابقة" />
      ) : (
        <div className="space-y-3">
          {filtered.map((t) => (
            <div key={t.id} className="card overflow-hidden">
              <div className="p-4 flex items-start justify-between gap-3">
                <div className="flex-1 cursor-pointer min-w-0" onClick={() => toggleExpand(t.id)}>
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <Stamp tone="ink">{t.grade}</Stamp>
                    {t.track && <span className="text-xs border border-parchment-line px-2 py-0.5 rounded-lg text-muted">{t.track}</span>}
                    {t.subject_name && <span className="text-xs bg-ink text-parchment px-2 py-0.5 rounded-lg">{t.subject_name}</span>}
                  </div>
                  <h3 className="font-bold">{t.title}</h3>
                  <p className="text-sm text-muted mt-1 line-clamp-2">{t.body}</p>
                  <p className="text-xs text-muted/70 mt-2">
                    {t.author_name} • {new Date(t.created_at).toLocaleDateString('ar-EG')} • {t.replies_count} رد
                  </p>
                </div>
                <button onClick={() => deleteThread(t.id)} className="btn-danger !px-3 !py-1.5 text-xs whitespace-nowrap shrink-0">
                  حذف السؤال
                </button>
              </div>

              {expandedId === t.id && (
                <div className="border-t border-parchment-line bg-parchment p-4 space-y-2">
                  {!replies[t.id] || replies[t.id].length === 0 ? (
                    <p className="text-sm text-muted">مفيش ردود</p>
                  ) : (
                    replies[t.id].map((r) => (
                      <div key={r.id} className="bg-parchment-card border border-parchment-line rounded-xl p-3 flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold">{r.author_name}</p>
                          <p className="text-sm text-muted">{r.body}</p>
                          <p className="text-xs text-muted/70 mt-1">{new Date(r.created_at).toLocaleDateString('ar-EG')}</p>
                        </div>
                        <button onClick={() => deleteReply(t.id, r.id)} className="text-xs font-semibold text-muted hover:text-coral px-2 py-1 whitespace-nowrap shrink-0">
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
