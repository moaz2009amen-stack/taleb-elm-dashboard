import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { PageHeader, Spinner, EmptyState, useToast, useConfirm } from '../components/UI';

export default function ReligiousContent() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null); // بند بيتعدّل دلوقتي، أو null
  const toast = useToast();
  const confirm = useConfirm();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('religious_collections').select('*').order('kind').order('sort_order');
    setItems(data || []);
    setLoading(false);
  };

  // كل بند (فئة أذكار أو قايمة أدعية) عنده مصفوفة items جوّاه [{text, count, note}]
  // — التعديل هنا بسيط: تعديل النص الكامل كـ JSON في textarea، عشان مفيش
  // داعي نبني UI معقد لكل سطر لوحده. لو حبيت تجربة أسهل بعدين (سطر بسطر)،
  // ده تحسين مستقبلي مش أساسي دلوقتي.
  const saveItems = async (id, rawJson) => {
    let parsed;
    try {
      parsed = JSON.parse(rawJson);
      if (!Array.isArray(parsed)) throw new Error('لازم يكون array');
    } catch {
      toast('الصيغة غلط — لازم يكون JSON array صحيح', 'error');
      return;
    }
    const { error } = await supabase.from('religious_collections').update({ items: parsed }).eq('id', id);
    if (error) { toast('تعذّر الحفظ', 'error'); return; }
    toast('تم الحفظ');
    setEditingId(null);
    load();
  };

  const remove = async (id) => {
    const ok = await confirm('هتحذف الفئة/القايمة دي، متأكد؟', { danger: true, confirmLabel: 'حذف' });
    if (!ok) return;
    await supabase.from('religious_collections').delete().eq('id', id);
    setItems((prev) => prev.filter((i) => i.id !== id));
    toast('تم الحذف');
  };

  const azkarCats = items.filter((i) => i.kind === 'azkar_category');
  const duaLists = items.filter((i) => i.kind === 'dua_list');

  const renderItem = (item) => (
    <div key={item.id} className="card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{item.title} <span className="text-xs text-muted">({item.items.length} بند)</span></p>
        <div className="flex gap-2">
          <button onClick={() => setEditingId(editingId === item.id ? null : item.id)} className="text-xs font-semibold text-primary px-2 py-1">
            {editingId === item.id ? 'إلغاء' : 'تعديل'}
          </button>
          <button onClick={() => remove(item.id)} className="text-xs font-semibold text-muted hover:text-coral px-2 py-1">حذف</button>
        </div>
      </div>
      {editingId === item.id && (
        <ItemsEditor initial={item.items} onSave={(json) => saveItems(item.id, json)} />
      )}
    </div>
  );

  return (
    <div>
      <PageHeader eyebrow={`${azkarCats.length} فئة أذكار • ${duaLists.length} قايمة أدعية`} title="الأذكار والأدعية" />

      {loading ? <Spinner /> : (
        <>
          <h3 className="text-sm font-bold text-muted mb-3">فئات الأذكار</h3>
          <div className="space-y-3 max-w-2xl mb-8">
            {azkarCats.length === 0 ? <EmptyState icon="🕌" title="مفيش فئات أذكار" /> : azkarCats.map(renderItem)}
          </div>

          <h3 className="text-sm font-bold text-muted mb-3">قوائم الأدعية</h3>
          <div className="space-y-3 max-w-2xl">
            {duaLists.length === 0 ? <EmptyState icon="🤲" title="مفيش قوائم أدعية" /> : duaLists.map(renderItem)}
          </div>
        </>
      )}
    </div>
  );
}

// محرر JSON بسيط لبنود ذكر/دعاء واحدة — بيوري وبيحفظ [{text, count, note}]
function ItemsEditor({ initial, onSave }) {
  const [raw, setRaw] = useState(JSON.stringify(initial, null, 2));
  return (
    <div className="space-y-2">
      <textarea
        value={raw}
        onChange={(e) => setRaw(e.target.value)}
        rows={10}
        className="input-field font-mono text-xs w-full"
        dir="ltr"
      />
      <p className="text-xs text-muted">
        كل بند: {'{'}"text": "النص", "count": 1, "note": null{'}'} — count و note اختياريين
      </p>
      <button onClick={() => onSave(raw)} className="btn-primary text-sm">حفظ</button>
    </div>
  );
}
