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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <form onSubmit={handleLogin} className="bg-white shadow-sm rounded-2xl p-8 w-full max-w-sm">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
          <span className="text-2xl">🎓</span>
        </div>
        <h1 className="text-xl font-bold mb-1">لوحة تحكم طالب علم</h1>
        <p className="text-sm text-slate-500 mb-6">تسجيل دخول خاص بالإدارة فقط</p>

        <label className="text-sm font-semibold block mb-1">الإيميل</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border-0 bg-slate-100 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-primary"
          required
        />

        <label className="text-sm font-semibold block mb-1">كلمة المرور</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border-0 bg-slate-100 rounded-xl px-4 py-3 mb-4 outline-none focus:ring-2 focus:ring-primary"
          required
        />

        {error && <p className="text-danger text-sm mb-4">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-secondary text-white font-bold py-3 rounded-xl hover:opacity-90 transition disabled:opacity-50"
        >
          {loading ? 'جارِ الدخول...' : 'تسجيل الدخول'}
        </button>
      </form>
    </div>
  );
}
