import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Forum from './pages/Forum';
import Accounts from './pages/Accounts';

function Layout({ onLogout }) {
  const navItems = [
    { to: '/', label: 'نظرة عامة', icon: '📊', end: true },
    { to: '/forum', label: 'المنتدى', icon: '💬' },
    { to: '/accounts', label: 'الحسابات', icon: '👥' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50">
      <aside className="w-64 bg-white border-l border-slate-100 p-5 hidden md:flex md:flex-col">
        <div className="flex items-center gap-2 mb-8">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="font-extrabold">طالب علم</p>
            <p className="text-xs text-slate-400">لوحة التحكم</p>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                  isActive ? 'bg-primary text-white' : 'text-slate-600 hover:bg-slate-100'
                }`
              }
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-danger hover:bg-danger/10"
        >
          🚪 تسجيل خروج
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/accounts" element={<Accounts />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setChecking(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
    navigate('/');
  };

  if (checking) {
    return <div className="min-h-screen flex items-center justify-center text-slate-400">جارِ التحميل...</div>;
  }

  if (!session) {
    return <Login onLoggedIn={() => window.location.reload()} />;
  }

  return <Layout onLogout={handleLogout} />;
}
