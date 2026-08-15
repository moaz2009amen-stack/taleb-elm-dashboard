import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PageHeader, Spinner, useToast } from '../components/UI';

const CONTACT_FIELDS = [
  { key: 'whatsapp', label: 'واتساب (رابط wa.me)' },
  { key: 'email', label: 'إيميل (mailto:...)' },
  { key: 'instagram', label: 'انستجرام' },
  { key: 'facebook', label: 'فيسبوك' },
  { key: 'telegram_group', label: 'جروب تليجرام' },
  { key: 'telegram_channel', label: 'قناة تليجرام' },
  { key: 'telegram_personal', label: 'تليجرام شخصي' },
];

async function readSetting(key, fallback) {
  const { data } = await supabase.from('app_settings').select('value').eq('key', key).maybeSingle();
  return data?.value ?? fallback;
}

async function writeSetting(key, value) {
  return supabase.from('app_settings').upsert({ key, value, updated_at: new Date().toISOString() });
}

function Section({ title, hint, children, onSave, saving }) {
  return (
    <div className="card p-5 mb-6 max-w-2xl">
      <p className="font-messiri font-bold mb-1">{title}</p>
      {hint && <p className="text-xs text-muted mb-4">{hint}</p>}
      {!hint && <div className="mb-4" />}
      {children}
      <button onClick={onSave} disabled={saving} className="btn-primary mt-4">
        {saving ? 'جارِ الحفظ...' : 'حفظ'}
      </button>
    </div>
  );
}

export default function Settings() {
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  // رسائل تحفيزية
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [savingMessages, setSavingMessages] = useState(false);

  // تواصل معنا
  const [contact, setContact] = useState({});
  const [savingContact, setSavingContact] = useState(false);

  // وضع الصيانة
  const [maintenance, setMaintenance] = useState({ enabled: false, message: '' });
  const [savingMaintenance, setSavingMaintenance] = useState(false);

  // إجبار التحديث
  const [minVersion, setMinVersion] = useState('');
  const [savingVersion, setSavingVersion] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [msgs, contactLinks, maint, ver] = await Promise.all([
        readSetting('focus_messages', []),
        readSetting('contact_links', {}),
        readSetting('maintenance', { enabled: false, message: '' }),
        readSetting('min_app_version', { android: '1.0.0' }),
      ]);
      setMessages(Array.isArray(msgs) ? msgs : []);
      setContact(contactLinks || {});
      setMaintenance(maint || { enabled: false, message: '' });
      setMinVersion(ver?.android || '1.0.0');
      setLoading(false);
    })();
  }, []);

  const addMessage = () => {
    const m = newMessage.trim();
    if (!m) return;
    setMessages((prev) => [...prev, m]);
    setNewMessage('');
  };

  const removeMessage = (i) => setMessages((prev) => prev.filter((_, idx) => idx !== i));

  const saveMessages = async () => {
    setSavingMessages(true);
    const { error } = await writeSetting('focus_messages', messages);
    setSavingMessages(false);
    if (error) { toast('تعذّر الحفظ', 'error'); return; }
    toast('تم حفظ الرسائل التحفيزية');
  };

  const saveContact = async () => {
    setSavingContact(true);
    const { error } = await writeSetting('contact_links', contact);
    setSavingContact(false);
    if (error) { toast('تعذّر الحفظ', 'error'); return; }
    toast('تم حفظ بيانات التواصل');
  };

  const saveMaintenance = async () => {
    setSavingMaintenance(true);
    const { error } = await writeSetting('maintenance', maintenance);
    setSavingMaintenance(false);
    if (error) { toast('تعذّر الحفظ', 'error'); return; }
    toast(maintenance.enabled ? 'تم تفعيل وضع الصيانة' : 'تم إيقاف وضع الصيانة');
  };

  const saveVersion = async () => {
    setSavingVersion(true);
    const { error } = await writeSetting('min_app_version', { android: minVersion.trim() });
    setSavingVersion(false);
    if (error) { toast('تعذّر الحفظ', 'error'); return; }
    toast('تم حفظ أقل إصدار مسموح');
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <PageHeader eyebrow="إعدادات تتحكم في التطبيق مباشرة" title="إعدادات التطبيق" />

      <Section
        title="وضع الصيانة"
        hint="لو فعّلته، هيتمنع كل المستخدمين من الدخول للتطبيق ويشوفوا الرسالة دي بس"
        onSave={saveMaintenance}
        saving={savingMaintenance}
      >
        <label className="flex items-center gap-3 mb-3 cursor-pointer">
          <input
            type="checkbox"
            checked={maintenance.enabled}
            onChange={(e) => setMaintenance({ ...maintenance, enabled: e.target.checked })}
            className="w-5 h-5 accent-coral"
          />
          <span className="font-semibold text-sm">تفعيل وضع الصيانة الآن</span>
        </label>
        <textarea
          value={maintenance.message}
          onChange={(e) => setMaintenance({ ...maintenance, message: e.target.value })}
          rows={2}
          placeholder="مثال: التطبيق تحت الصيانة حاليًا، هنرجع خلال ساعة إن شاء الله 🛠️"
          className="input-field"
        />
      </Section>

      <Section
        title="إجبار التحديث"
        hint="أي مستخدم بإصدار أقل من ده هيتمنع من استخدام التطبيق لحد ما يحدّث"
        onSave={saveVersion}
        saving={savingVersion}
      >
        <input
          value={minVersion}
          onChange={(e) => setMinVersion(e.target.value)}
          placeholder="مثال: 1.2.0"
          className="input-field max-w-xs"
        />
      </Section>

      <Section
        title="بيانات تواصل معنا"
        hint="الروابط اللي بتظهر في شاشة تواصل معنا جوه التطبيق"
        onSave={saveContact}
        saving={savingContact}
      >
        <div className="grid grid-cols-2 gap-3">
          {CONTACT_FIELDS.map((f) => (
            <div key={f.key}>
              <label className="text-xs text-muted font-semibold">{f.label}</label>
              <input
                value={contact[f.key] || ''}
                onChange={(e) => setContact({ ...contact, [f.key]: e.target.value })}
                className="input-field mt-1"
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="الرسائل التحفيزية"
        hint="بتتاخد منها 8 رسائل عشوائية يوميًا كإشعارات أثناء المذاكرة"
        onSave={saveMessages}
        saving={savingMessages}
      >
        <div className="flex gap-2 mb-3">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMessage()}
            placeholder="أضف رسالة تحفيزية جديدة"
            className="input-field"
          />
          <button onClick={addMessage} className="btn-ghost shrink-0">إضافة</button>
        </div>
        {messages.length === 0 ? (
          <p className="text-sm text-muted">مفيش رسائل مخصصة — التطبيق هيستخدم القائمة الافتراضية المكتوبة في كوده</p>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {messages.map((m, i) => (
              <div key={i} className="flex items-center justify-between gap-2 bg-parchment rounded-xl px-3 py-2">
                <p className="text-sm">{m}</p>
                <button onClick={() => removeMessage(i)} className="text-muted hover:text-coral font-bold shrink-0">×</button>
              </div>
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}
