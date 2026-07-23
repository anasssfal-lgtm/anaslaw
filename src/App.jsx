import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Sessions from "./pages/Sessions";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import Templates from "./pages/Templates";
import Settings from "./pages/Settings";
import CaseProfile from "./pages/CaseProfile";
import Login from "./pages/Login";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <p>جاري التحميل...</p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  return (
    <BrowserRouter>
      <div className="app" dir="rtl">
        <nav className="navbar">
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: "10px", textDecoration: "none" }}>
            <img src="/logo.png" alt="logo" style={{ height: "50px", objectFit: "contain" }} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "white", fontSize: "16px", fontWeight: "bold", lineHeight: "1.3" }}>مكتب أنس الحيدر</span>
              <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "11px", lineHeight: "1.3" }}>للمحاماة والاستشارات القانونية</span>
            </div>
          </Link>

          <div className="menu">
            <Link to="/">الرئيسية</Link>
            <Link to="/cases">القضايا</Link>
            <Link to="/sessions">الجلسات</Link>
            <Link to="/clients">الموكلون</Link>
            <Link to="/templates">النماذج</Link>
            <Link to="/reports">التقارير</Link>
            <button
              onClick={handleLogout}
              style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "none", padding: "6px 14px", borderRadius: "8px", cursor: "pointer", fontSize: "13px" }}
            >
              🚪 خروج
            </button>
          </div>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/cases/:id" element={<CaseProfile />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
