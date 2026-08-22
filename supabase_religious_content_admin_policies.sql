-- ============================================
-- طالب علم — سياسة كتابة الأدمن للأذكار/الأدعية والصدقة الجارية
-- شغّل الكود ده في: Supabase Dashboard → SQL Editor → New Query → Run
-- (بعد ما تكون شغّلت supabase_religious_content_seed.sql اللي عمل الجدولين
-- وسياسة القراءة بس — الملف ده بيكمّل عليه بسياسة كتابة الأدمن الناقصة)
-- ============================================

create policy "Admins can manage religious collections"
  on public.religious_collections for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can manage sadaqah jariyah"
  on public.sadaqah_jariyah for all
  using (public.is_admin())
  with check (public.is_admin());

-- ملحوظة: ده بيستخدم public.is_admin()، نفس الدالة والباترن المستخدم بالظبط
-- في سياسة الكتابة على achievements_catalog (supabase_features.sql) —
-- فبدون السطرين دول، لوحة التحكم تقدر تعرض المحتوى بس مش تقدر تعدّل/تحذف/
-- تضيف فيه، لأن سياسة القراءة اللي في ملف الـ seed مفتوحة للجميع بس مفيهاش
-- سياسة كتابة خالص.
