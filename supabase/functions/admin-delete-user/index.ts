// supabase/functions/admin-delete-user/index.ts
//
// بيشتغل على سيرفر Supabase (Deno)، ومفتاح service_role بيتخزن كـ "secret"
// على مستوى المشروع — مش موجود في كود الموقع ولا بيوصل لمتصفح المستخدم أبدًا.
//
// النشر:
//   1) لازم Supabase CLI: https://supabase.com/docs/guides/cli
//   2) supabase login
//   3) supabase link --project-ref <project-ref-بتاعك>
//   4) supabase functions deploy admin-delete-user
//
// (مفتاح service_role موجود بالفعل تلقائيًا كـ SUPABASE_SERVICE_ROLE_KEY
//  جوه بيئة الـ Edge Function، مش محتاج تضيفه يدوي)

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'مفيش تفويض' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // عميل بصلاحيات المستخدم اللي بعت الطلب — نستخدمه بس عشان نتأكد إنه أدمن فعلاً
    const callerClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_ANON_KEY'),
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user: caller } } = await callerClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: 'مش متسجل دخول' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: callerProfile } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', caller.id)
      .single();

    if (callerProfile?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'الإجراء ده للأدمن الكامل بس' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { user_id } = await req.json();
    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id مطلوب' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // منع الأدمن من حذف نفسه بالغلط
    if (user_id === caller.id) {
      return new Response(JSON.stringify({ error: 'متقدرش تحذف حسابك الشخصي من هنا' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // عميل بصلاحيات service_role — هو الوحيد اللي يقدر يحذف حساب Auth فعليًا
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    );

    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);
    if (deleteError) {
      return new Response(JSON.stringify({ error: deleteError.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ملحوظة: صف الـ profile بيتحذف تلقائيًا لو عمود id فيه
    // "on delete cascade" مربوط بـ auth.users (الحالة الافتراضية في setup.sql)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
