# لوحة تحكم طالب علم — دليل الرفع على Vercel

## 1) قبل أي حاجة: شغّل ملفات SQL في Supabase
لو لسه معملتش كده، شغّل بالترتيب ده في `SQL Editor`:
1. `supabase_setup.sql`
2. `supabase_forum.sql`
3. `supabase_admin.sql`

## 2) خلّي حسابك أدمن
في آخر سطر من `supabase_admin.sql` فيه أمر معلّق (بعلامة `--`):
```sql
update public.profiles set role = 'admin' where id = (select id from auth.users where email = 'ضع_إيميلك_هنا@example.com');
```
انسخه لوحده في SQL Editor، غيّر الإيميل بإيميلك المسجل بيه في تطبيق الموبايل، وشغّله.

**ملاحظة:** لازم يكون عندك بروفايل موجود بالفعل (يعني تكون سجلت دخول وعملت onboarding في التطبيق مرة واحدة على الأقل) قبل ما تشغل السطر ده.

## 3) جرّب لوحة التحكم محليًا (اختياري بس مفيد)
```bash
cd admin_dashboard
npm install
npm run dev
```
هيفتحلك رابط محلي (localhost) جرّب تسجل دخول بإيميلك.

## 4) ارفعها على GitHub
```bash
cd admin_dashboard
git init
git add .
git commit -m "لوحة تحكم طالب علم"
```
بعدين اعمل repository جديد على GitHub (خاص/Private يفضل لأنه لوحة إدارة)، واربطه:
```bash
git remote add origin https://github.com/USERNAME/taleb-elm-admin.git
git branch -M main
git push -u origin main
```

## 5) انشرها على Vercel
1. روح **https://vercel.com** وسجل دخول (بحساب GitHub بتاعك)
2. **Add New** → **Project**
3. اختار الـ repository اللي رفعته (`taleb-elm-admin`)
4. Vercel هيكتشف إنه مشروع Vite تلقائيًا — سيب الإعدادات زي ما هي
5. اضغط **Deploy**

بعد دقيقة أو اتنين هيديك رابط زي:
```
https://taleb-elm-admin.vercel.app
```

ده رابط لوحة التحكم بتاعتك. افتحه وسجل دخول بنفس إيميل التطبيق اللي عملته أدمن.

## ملاحظات أمان مهمة
- الـ Repository خليه **Private** لأنه لوحة إدارة حساسة
- أي حد يعرف الرابط مش هيقدر يعمل حاجة إلا لو عنده حساب بـ role = 'admin' فعليًا (محمي من قاعدة البيانات نفسها، مش بس من الواجهة)
- ممكن تضيف حماية إضافية بكلمة سر على مستوى Vercel نفسه من `Settings → Deployment Protection` لو حبيت طبقة أمان زيادة

## اللي تقدر تعمله من اللوحة
- **نظرة عامة**: عدد الطلاب، الأسئلة، الردود، الحسابات المحظورة
- **المنتدى**: تشوف كل الأسئلة (بفلترة حسب الصف)، تفتح أي سؤال تشوف ردوده، تحذف سؤال أو رد غير لائق
- **الحسابات**: تشوف كل الطلاب المسجلين وبياناتهم، وتقدر تحظر/تلغي حظر أي حساب (الحساب المحظور مش هيقدر يسجل دخول في التطبيق تاني)
