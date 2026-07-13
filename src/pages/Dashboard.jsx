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

  const grouped = sessions.reduce((acc, s) => {
    if (s.session_date > nextWeek) return acc;
    if (!acc[s.session_date]) acc[s.session_date] = [];
    acc[s.session_date].push(s);
    return acc;
  }, {});

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
        .date-group-header {
          background: #7c1c1c;
          color: white;
          padding: 10px 15px;
          font-weight: bold;
          font-size: 14px;
          margin-top: 15px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .today-badge { background: #22c55e; color: white; padding: 2px 10px; border-radius: 10px; font-size: 12px; margin-right: 8px; }
        .tomorrow-badge { background: #f59e0b; color: white; padding: 2px 10px; border-radius: 10px; font-size: 12px; margin-right: 8px; }
        .session-row {
          display: grid;
          grid-template-columns: 25px 80px 1fr 100px 120px 90px;
          gap: 8px;
          padding: 10px 8px;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
        }
        .session-row:hover { background: #fafafa; }
        .session-time { background: #7c1c1c; color: white; padding: 4px 6px; border-radius: 6px; font-size: 11px; text-align: center; }
        .session-client { font-weight: bold; font-size: 13px; }
        .session-detail { color: #666; font-size: 12px; }
        .session-lawyer { background: #f0f0ff; color: #334; padding: 2px 6px; border-radius: 6px; font-size: 11px; text-align: center; }
        .stat { cursor: pointer; transition: transform 0.15s; }
        .stat:hover { transform: scale(1.04); }
      `}</style>

      {/* Print Header */}
      <div className="print-header">
        <img src="/logo.png" alt="logo" />
        <div>
          <h2>مكتب أنس الحيدر للمحاماة والاستشارات القانونية</h2>
          <p>رول جلسات الأسبوع — من {today} إلى {nextWeek}</p>
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

      {/* جلسات الأسبوع */}
      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }} className="no-print">
          <h2>📅 جلسات الأسبوع</h2>
          <button onClick={() => window.print()} style={{ background: "#1d4ed8", color: "white", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer" }}>
            🖨️ طباعة / PDF
          </button>
        </div>

        {Object.keys(grouped).sort().map((date) => (
          <div key={date}>
            <div className="date-group-header">
              <span>
                {formatDate(date)}
                {date === today && <span className="today-badge">اليوم</span>}
                {date === tomorrow && <span className="tomorrow-badge">الغد</span>}
              </span>
              <span>{grouped[date].length} جلسة</span>
            </div>

            {grouped[date].map((s, i) => (
              <div className="session-row" key={s.id}>
                <span style={{ color: "#bbb", fontSize: "12px" }}>{i + 1}</span>
                <span className="session-time">{s.session_time || "--:--"}</span>
                <span className="session-client">{s.cases?.client_name || s.client_name || "—"}</span>
                <span className="session-detail">{s.cases?.case_number || "—"}</span>
                <span className="session-detail">{s.cases?.court || s.location || "—"}</span>
                <span className="session-lawyer">{s.lawyer || s.cases?.lawyer || "—"}</span>
              </div>
            ))}
          </div>
        ))}

        {Object.keys(grouped).length === 0 && (
          <p style={{ textAlign: "center", color: "#999", padding: "30px" }}>
            لا توجد جلسات هذا الأسبوع
          </p>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
