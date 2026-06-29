import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Cases from "./pages/Cases";
import Sessions from "./pages/Sessions";
import Clients from "./pages/Clients";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <div className="app" dir="rtl">
        <nav className="navbar">
          <h2>⚖️ أنس للمحاماة</h2>

          <div className="menu">
            <Link to="/">الرئيسية</Link>
            <Link to="/cases">القضايا</Link>
            <Link to="/sessions">الجلسات</Link>
            <Link to="/clients">الموكلون</Link>
            <Link to="/reports">التقارير</Link>
            <Link to="/settings">الإعدادات</Link>
          </div>
        </nav>

        <div className="content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/cases" element={<Cases />} />
            <Route path="/sessions" element={<Sessions />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;