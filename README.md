# لوحة تحكم طالب علم

لوحة تحكم إدارية لتطبيق **طالب علم**، مبنية بـ React (Vite) وSupabase.

## المميزات

- **إدارة الحسابات**: ترقية/تنزيل أدمن، حظر حسابات، إرسال روابط تغيير كلمة مرور، فلاتر وبحث (بالاسم/الإيميل/الصف/الحالة)
- **صلاحيات متدرجة**: أدمن كامل (كل الصلاحيات) ومشرف (Moderator) بصلاحيات محدودة على المنتدى والبلاغات
- **إدارة المنتدى**: بحث نصي، ودورة حياة كاملة للبلاغات (معلّقة ← تمت المراجعة ← أرشفة)
- **رسائل عامة مستهدفة**: نشر أكتر من رسالة، كل واحدة تستهدف نظام دراسي أو صف معيّن، مع إمكانية الجدولة (`starts_at`/`ends_at`)
- **لوحة تصنيف**: ترتيب الطلاب حسب ساعات المذاكرة، الاستمرارية، والإنجازات
- **سجل نشاط إداري** (Audit Log) لكل الإجراءات
- **فلتر كلمات ممنوعة** يمنع نشر محتوى غير لائق في المنتدى تلقائيًا
- **نظرة عامة (Dashboard)**: رسم بياني للتسجيلات وقائمة بآخر نشاط

## التقنيات المستخدمة

- [React](https://react.dev/) + [Vite](https://vite.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (قاعدة بيانات، مصادقة، Edge Functions)
- [React Router](https://reactrouter.com/)

---

## دليل الإعداد والنشر

### 1) قاعدة البيانات — شغّل ملفات SQL بالترتيب

في `SQL Editor` بمشروع Supabase بتاعك، شغّل الملفات دي بالترتيب (تخطّى أي ملف سبق شغّلته):

1. `supabase_setup.sql`
2. `supabase_forum.sql`
3. `supabase_admin.sql`
4. `supabase_moderation.sql`
5. `supabase_features.sql`
6. `supabase_dashboard_v2.sql`
7. `supabase_dashboard_v3.sql`

**ملف v2** بيضيف عمود `email` لجدول `profiles` (لإرسال روابط تغيير كلمة المرور)، و`target_system`/`target_grade` لاستهداف الرسائل العامة، وفهارس لتسريع البحث والفلترة.

**ملف v3** بيضيف صلاحية "مشرف" (moderator)، جدول `admin_audit_log`، جدولة الرسائل العامة (`starts_at`/`ends_at` — يحتاج تفعيل `pg_cron`، تفاصيل تحت)، جدول `app_settings`، وجدول `banned_words` مع فلتر تلقائي.

**تفعيل الجدولة التلقائية للرسائل (اختياري):** من `Supabase Dashboard → Database → Extensions`، فعّل `pg_cron`، وبعدين أعد تشغيل `supabase_dashboard_v3.sql`. من غير الخطوة دي، الرسائل هتفضل شغالة زي ما هي لحد ما تشيلها يدويًا من اللوحة.

### 2) نشر خاصية "الحذف النهائي للحساب" (Edge Function)

زرار "حذف نهائي" في صفحة الحسابات محتاج Edge Function منشورة (الكود جاهز في `supabase/functions/admin-delete-user/`):

```bash
npm install -g supabase
supabase login
supabase link --project-ref <project-ref-بتاعك>
supabase functions deploy admin-delete-user
```

مفتاح `service_role` بيتحقن تلقائيًا جوه بيئة الدالة من Supabase — مش محتاج تضيفه بنفسك ولا تحطه في أي كود موقع. لو مش عايز الخاصية دي دلوقتي، استخدم "حظر الحساب" العادي بدلها.

### 3) خلّي حسابك أدمن (أول مرة بس)

في آخر سطر من `supabase_admin.sql`:

```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'ضع_إيميلك_هنا@example.com');
```

انسخه لوحده في SQL Editor، غيّر الإيميل، وشغّله (لازم يكون عندك بروفايل موجود بالفعل). بعد كده تقدر ترقّي أي حساب تاني لأدمن مباشرة من صفحة "الحسابات".

### 4) التشغيل محليًا

```bash
npm install
npm run dev
```

### 5) الرفع والنشر على Vercel

```bash
git init
git add .
git commit -m "لوحة تحكم طالب علم"
git remote add origin <رابط الريبو الخاص بيك>
git branch -M main
git push -u origin main
```

بعدين على vercel.com: **Add New → Project** → اختار الـ repo → Deploy (هيكتشف مشروع Vite تلقائيًا).

> ملف `vercel.json` موجود بيحل مشكلة الـ 404 عند عمل ريفرش في أي صفحة غير الرئيسية (لازم إعادة نشر بعد أي تعديل عشان يتفعّل).

### 6) رابط "تغيير كلمة المرور" — إعداد لازم في Supabase

عشان روابط تغيير كلمة المرور تشتغل صح:

1. `Supabase Dashboard → مشروعك → Authentication → URL Configuration`
2. **Site URL**: دومين موقعك بعد النشر (مثال: `https://your-domain.vercel.app`)
3. **Redirect URLs**: ضيف `https://your-domain.vercel.app/reset-password`

بعدها أي طالب يضغط على رابط تغيير كلمة المرور اللي جاله بالإيميل هيفتح صفحة `/reset-password` (صفحة عامة، مش محتاجة تسجيل دخول).

## ملاحظات أمان

- الريبو المفروض يكون **Private**.
- كل الحماية الحقيقية شغّالة من قاعدة البيانات (RLS) مش بس من الواجهة.
- ممكن تضيف حماية إضافية بكلمة سر من `Vercel → Settings → Deployment Protection`.
- **حذف حساب نهائيًا** محتاج صلاحيات `service_role`، ومفيش طريقة آمنة تحطها في كود بيشتغل في متصفح المستخدم — لذلك تم فصلها في Edge Function منفصلة تعمل على السيرفر (راجع الخطوة 2).

## الترخيص

هذا المشروع ملكية خاصة (Proprietary). جميع الحقوق محفوظة، وغير مرخّص للاستخدام أو النسخ أو التعديل العام. راجع ملف [LICENSE](./LICENSE) للتفاصيل.