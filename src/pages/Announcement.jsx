import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Announcement() {
  const [current, setCurrent] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('announcements')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();
    setCurrent(data);
    setMessage(data?.message || '');
    setLoading(false);
  };

  const publish = async () => {
    if (!message.trim()) return;
    setSaving(true);
    // نعطل أي إعلان قديم فعّال، وننشر الجديد
    await supabase.from('announcements').update({ active: false }).eq('active', true);
    await supabase.from('announcements').insert({ message: message.trim(), active: true });
    setSaving(false);
    load();
  };

  const removeAnnouncement = async () => {
    await supabase.from('announcements').update({ active: false }).eq('active', true);
    setMessage('');
    setCurrent(null);
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">رسالة عامة للطلاب</h2>
      <div className="bg-white border border-neutral-200 rounded-2xl p-5 max-w-xl">
        <p className="text-sm text-neutral-500 mb-3">
          الرسالة دي هتظهر لكل الطلاب فوق الصفحة الرئيسية (تاب "اليوم") لحد ما تشيلها أو تستبدلها
        </p>
        {loading ? (
          <p className="text-neutral-400">جارِ التحميل...</p>
        ) : (
          <>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              placeholder="مثال: امتحانات نصف العام هتبدأ الأسبوع الجاي، ركزوا في المراجعة 💪"
              className="w-full border-2 border-neutral-200 focus:border-black rounded-xl p-3 text-sm outline-none transition"
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={publish}
                disabled={saving || !message.trim()}
                className="border-2 border-black bg-black text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-white hover:text-black transition disabled:opacity-40"
              >
                {saving ? 'جارِ النشر...' : 'نشر الرسالة'}
              </button>
              {current && (
                <button
                  onClick={removeAnnouncement}
                  className="border-2 border-neutral-300 text-sm font-semibold px-5 py-2 rounded-lg hover:border-black transition"
                >
                  حذف الرسالة الحالية
                </button>
              )}
            </div>
            {current && (
              <p className="text-xs text-neutral-400 mt-3">
                آخر نشر: {new Date(current.created_at).toLocaleString('ar-EG')}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
