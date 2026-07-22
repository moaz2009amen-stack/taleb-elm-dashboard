import { useEffect, useState } from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Forum from './pages/Forum';
import Accounts from './pages/Accounts';
import Reports from './pages/Reports';
import Announcement from './pages/Announcement';
import StudyPlans from './pages/StudyPlans';
import Achievements from './pages/Achievements';

function Layout({ onLogout }) {
  const navItems = [
    { to: '/', label: 'نظرة عامة', icon: '◇', end: true },
    { to: '/forum', label: 'المنتدى', icon: '◈' },
    { to: '/reports', label: 'البلاغات', icon: '⚑' },
    { to: '/accounts', label: 'الحسابات', icon: '◉' },
    { to: '/announcement', label: 'رسالة عامة', icon: '✉' },
    { to: '/study-plans', label: 'خطط مذاكرة', icon: '▤' },
    { to: '/achievements', label: 'الإنجازات', icon: '★' },
  ];

  return (
    <div className="min-h-screen flex bg-neutral-50 text-black">
      <aside className="w-64 bg-black text-white p-5 hidden md:flex md:flex-col">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-lg bg-white text-black flex items-center justify-center font-black">ط</div>
          <div>
            <p className="font-extrabold">طالب علم</p>
            <p className="text-xs text-neutral-400">لوحة التحكم</p>
          </div>
        </div>
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition border-2 ${
                  isActive ? 'bg-white text-black border-white' : 'text-neutral-300 border-transparent hover:border-neutral-700'
                }`
              }
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold text-white border-2 border-neutral-700 hover:border-white transition"
        >
          <span className="w-4 text-center">⏻</span> تسجيل خروج
        </button>
      </aside>

      <main className="flex-1 p-6 md:p-8">
        <Routes>
          <Route path="/" element={<Overview />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/accounts" element={<Accounts />} />
          <Route path="/announcement" element={<Announcement />} />
          <Route path="/study-plans" element={<StudyPlans />} />
          <Route path="/achievements" element={<Achievements />} />
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
    return <div className="min-h-screen flex items-center justify-center text-neutral-400 bg-white">جارِ التحميل...</div>;
  }

  if (!session) {
    return <Login onLoggedIn={() => window.location.reload()} />;
  }

  return <Layout onLogout={handleLogout} />;
}
