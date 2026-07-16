import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

function Dashboard() {
  const [cases, setCases] = useState([]);
  const [sessions, setSessions] = useState([]);
  const navigate = useNavigate();

  const today = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];
  const weekDate = new Date();
  weekDate.setDate(weekDate.getDate() + 7);
  const nextWeek = weekDate.toISOString().split("T")[0];

  useEffect(() => {
    getData();
  }, []);

  async function getData() {
    const { data: casesData } = await supabase.from("cases").select("*");
    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("*, cases(client_name, case_number, court, lawyer, file_no)")
      .gte("session_date", today)
      .order("session_date", { ascending: true });
    setCases(casesData || []);
    setSessions(sessionsData || []);
  }

  const todaySessions = sessions.filter((s) => s.session_date === today);
  const tomorrowSessions = sessions.filter((s) => s.session_date === tomorrow);
  const weekSessions = sessions.filter((s) => s.session_date >= today && s.session_date <= nextWeek);

  const activeSessionCases = new Set(sessions.map(s => s.case_id).filter(Boolean));
  const activeCasesWithSessions = cases.filter((c) => {
    const s = c.file_status || c.status || "";
    return !s.includes("مؤرشفة") && activeSessionCases.has(c.id);
  });

  function formatDate(dateStr) {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const d = new Date(dateStr);
    return `${days[d.getDay()]} ${dateStr}`;
  }

  return (
    <div>
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          .print-header { display: flex !important; }
          body { font-size: 12px; }
        }
        .print-header {
          display: none;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 2px solid #8B6914;
          margin-bottom: 20px;
        }
        .print-header img { width: 60px; height: 60px; object-fit: contain; }
        .print-header div h2 { margin: 0; color: #8B6914; font-size: 18px; }
        .print-header div p { margin: 0; color: #666; font-size: 13px; }
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 10px;
        }
        .quick-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 18px;
          background: white;
          border-radius: 12px;
          border: 2px solid #eee;
          cursor: pointer;
          transition: all 0.2s;
        }
        .quick-btn:hover { border-color: #7c1c1c; background: #fff8f8; }
        .quick-btn span { font-size: 26px; margin-bottom: 6px; }
        .quick-btn p { font-size: 13px; font-weight: bold; margin: 0; color: #333; }
        .stat { cursor: pointer; transition: transform 0.15s; }
        .stat:hover { transform: scale(1.04); }
      `}</style>

      {/* Print Header */}
      <div className="print-header">
        <img src="/logo.png" alt="logo" />
        <div>
          <h2>مكتب أنس الحيدر للمحاماة والاستشارات القانونية</h2>
          <p>لوحة التحكم — {formatDate(today)}</p>
        </div>
      </div>

      {/* الإحصائيات */}
      <section className="panel no-print">
        <h1 style={{ textAlign: "center", color: "#7c1c1c", margin: "0 0 15px 0" }}>
          📅 {formatDate(today)}
        </h1>
        <div className="dashboard">
          <div className="stat blue" onClick={() => navigate("/cases")}>
            <h3>{activeCasesWithSessions.length}</h3>
            <p>القضايا المتداولة</p>
          </div>
          <div className="stat green" onClick={() => navigate("/sessions")}>
            <h3>{todaySessions.length}</h3>
            <p>جلسات اليوم</p>
          </div>
          <div className="stat yellow" onClick={() => navigate("/sessions")}>
            <h3>{tomorrowSessions.length}</h3>
            <p>جلسات الغد</p>
          </div>
          <div className="stat purple" onClick={() => navigate("/sessions")}>
            <h3>{weekSessions.length}</h3>
            <p>جلسات الأسبوع</p>
          </div>
        </div>
      </section>

      {/* روابط سريعة */}
      <section className="panel no-print">
        <h2>الأقسام</h2>
        <div className="dashboard-grid">
          <div className="quick-btn" onClick={() => navigate("/cases")}>
            <span>📁</span><p>القضايا</p>
          </div>
          <div className="quick-btn" onClick={() => navigate("/sessions")}>
            <span>📅</span><p>رول الجلسات</p>
          </div>
          <div className="quick-btn" onClick={() => navigate("/clients")}>
            <span>👥</span><p>الموكلون</p>
          </div>
          <div className="quick-btn" onClick={() => navigate("/reports")}>
            <span>📊</span><p>التقارير</p>
          </div>
        </div>
      </section>

    </div>
  );
}

export default Dashboard;
