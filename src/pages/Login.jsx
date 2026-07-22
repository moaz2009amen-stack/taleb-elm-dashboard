import { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login({ onLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError('الإيميل أو كلمة المرور غلط');
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', data.user.id).single();

    if (profile?.role !== 'admin') {
      setError('الحساب ده مش أدمن — لوحة التحكم دي مخصصة للإدارة بس');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    setLoading(false);
    onLoggedIn();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form onSubmit={handleLogin} className="border-2 border-black rounded-2xl p-8 w-full max-w-sm">
        <div className="w-14 h-14 rounded-xl bg-black text-white flex items-center justify-center mb-4 font-black text-xl">ط</div>
        <h1 className="text-xl font-bold mb-1">لوحة تحكم طالب علم</h1>
        <p className="text-sm text-neutral-500 mb-6">تسجيل دخول خاص بالإدارة فقط</p>

        <label className="text-sm font-semibold block mb-1">الإيميل</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-2 border-neutral-200 focus:border-black rounded-lg px-4 py-3 mb-4 outline-none transition"
          required
        />

        <label className="text-sm font-semibold block mb-1">كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-2 border-neutral-200 focus:border-black rounded-lg px-4 py-3 mb-4 outline-none transition"
          required
        />

        {error && <p className="text-black bg-neutral-100 border border-neutral-300 rounded-lg px-3 py-2 text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full border-2 border-black bg-black text-white font-bold py-3 rounded-lg hover:bg-white hover:text-black transition disabled:opacity-50"
        >
          {loading ? 'جارِ الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  );
}
