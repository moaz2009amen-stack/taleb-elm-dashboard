import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('forum_reports')
      .select('*, forum_threads(title, body), forum_replies(body)')
      .order('created_at', { ascending: false });
    setReports(data || []);
    setLoading(false);
  };

  const dismiss = async (id) => {
    await supabase.from('forum_reports').delete().eq('id', id);
    setReports((prev) => prev.filter((r) => r.id !== id));
  };

  const deleteReportedContent = async (report) => {
    if (report.thread_id) {
      await supabase.from('forum_threads').delete().eq('id', report.thread_id);
    } else if (report.reply_id) {
      await supabase.from('forum_replies').delete().eq('id', report.reply_id);
    }
    await dismiss(report.id);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">البلاغات</h2>
      {loading ? (
        <p className="text-neutral-500">جارِ التحميل...</p>
      ) : reports.length === 0 ? (
        <p className="text-neutral-500">مفيش بلاغات دلوقتي 🎉</p>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-white border border-neutral-200 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs bg-black text-white px-2 py-0.5 rounded-lg">{r.reason}</span>
                <span className="text-xs text-neutral-400">{new Date(r.created_at).toLocaleDateString('ar-EG')}</span>
              </div>
              <p className="text-sm font-semibold mb-1">{r.thread_id ? 'بلاغ عن سؤال' : 'بلاغ عن رد'}</p>
              <p className="text-sm text-neutral-600 bg-neutral-50 rounded-lg p-3">
                {r.thread_id ? (r.forum_threads?.title || 'محتوى محذوف') : (r.forum_replies?.body || 'محتوى محذوف')}
              </p>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => deleteReportedContent(r)}
                  className="border-2 border-black bg-black text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-white hover:text-black transition"
                >
                  حذف المحتوى المبلّغ عنه
                </button>
                <button
                  onClick={() => dismiss(r.id)}
                  className="border-2 border-neutral-300 text-xs font-semibold px-4 py-2 rounded-lg hover:border-black transition"
                >
                  تجاهل البلاغ
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
