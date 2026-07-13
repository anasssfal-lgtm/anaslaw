import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split("T")[0];
  const weekDate = new Date();
  weekDate.setDate(weekDate.getDate() + 7);
  const nextWeek = weekDate.toISOString().split("T")[0];

  useEffect(() => {
    getSessions();
    setFromDate(today);
    setToDate(nextWeek);
  }, []);

  async function getSessions() {
    const { data, error } = await supabase
      .from("sessions")
      .select("*, cases(client_name, case_number, court, lawyer, opponent_name, file_no)")
      .gte("session_date", today)
      .order("session_date", { ascending: true });

    if (error) { alert("خطأ في جلب الجلسات: " + error.message); return; }
    setSessions(data || []);
  }

  const filteredSessions = sessions.filter((item) => {
    const text = `
      ${item.cases?.client_name || item.client_name || ""}
      ${item.cases?.case_number || ""}
      ${item.cases?.court || ""}
      ${item.location || ""}
      ${item.notes || ""}
      ${item.lawyer || item.cases?.lawyer || ""}
      ${item.hearing_type || ""}
    `;
    const matchSearch = text.toLowerCase().includes(search.toLowerCase());
    const matchFrom = fromDate ? item.session_date >= fromDate : true;
    const matchTo = toDate ? item.session_date <= toDate : true;
    return matchSearch && matchFrom && matchTo;
  });

  // تجميع الجلسات حسب التاريخ
  const grouped = filteredSessions.reduce((acc, s) => {
    const d = s.session_date;
    if (!acc[d]) acc[d] = [];
    acc[d].push(s);
    return acc;
  }, {});

  const todaySessions = sessions.filter((s) => s.session_date === today);
  const tomorrowSessions = sessions.filter((s) => s.session_date === tomorrow);
  const weekSessions = sessions.filter((s) => s.session_date >= today && s.session_date <= nextWeek);

  function formatDate(dateStr) {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const d = new Date(dateStr);
    return `${days[d.getDay()]} ${dateStr}`;
  }

  function printSessions() {
    window.print();
  }

  return (
    <div>
      {/* Print Style */}
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          .panel { box-shadow: none !important; }
          .print-header { display: block !important; text-align: center; margin-bottom: 20px; }
          body { font-size: 12px; }
          .sessions-table th, .sessions-table td { padding: 6px 8px !important; font-size: 11px; }
          .date-group-header { background: #eee !important; color: #000 !important; }
        }
        .print-header { display: none; }
        .date-group-header {
          background: #7c1c1c;
          color: white;
          padding: 8px 15px;
          font-weight: bold;
          font-size: 15px;
          margin-top: 15px;
          border-radius: 6px;
        }
        .today-badge {
          background: #22c55e;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          margin-right: 8px;
        }
        .sessions-table { width: 100%; border-collapse: collapse; direction: rtl; }
        .sessions-table th { background: #f5f5f5; padding: 10px; text-align: center; border: 1px solid #ddd; }
        .sessions-table td { padding: 8px 10px; border: 1px solid #eee; text-align: center; vertical-align: middle; }
        .sessions-table tr:hover { background: #fafafa; }
        .table-box { overflow-x: auto; }
        .filter-btns { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
        .filter-btn { padding: 8px 16px; border-radius: 8px; border: none; cursor: pointer; background: #eee; }
        .filter-btn.active { background: #7c1c1c; color: white; }
        .filter-btn.print-btn { background: #1d4ed8; color: white; }
      `}</style>

      {/* Print Header */}
      <div className="print-header">
        <h2>⚖️ أنس للمحاماة</h2>
        <h3>رول الجلسات — {fromDate} إلى {toDate}</h3>
      </div>

      <section className="panel no-print">
        <h1 style={{ textAlign: "center" }}>📅 رول الجلسات</h1>
        <div className="dashboard">
          <div className="stat blue"><h3>{sessions.length}</h3><p>كل الجلسات القادمة</p></div>
          <div className="stat green"><h3>{todaySessions.length}</h3><p>جلسات اليوم</p></div>
          <div className="stat yellow"><h3>{tomorrowSessions.length}</h3><p>جلسات الغد</p></div>
          <div className="stat purple"><h3>{weekSessions.length}</h3><p>جلسات الأسبوع</p></div>
        </div>
      </section>

      <section className="panel no-print">
        <h2>التصفية</h2>
        <div className="filter-btns">
          <button className="filter-btn" onClick={() => { setFromDate(today); setToDate(today); }}>📅 اليوم</button>
          <button className="filter-btn" onClick={() => { setFromDate(tomorrow); setToDate(tomorrow); }}>📅 الغد</button>
          <button className="filter-btn" onClick={() => { setFromDate(today); setToDate(nextWeek); }}>📅 الأسبوع</button>
          <button className="filter-btn" onClick={() => { setFromDate(""); setToDate(""); }}>🔄 الكل</button>
          <button className="filter-btn print-btn" onClick={printSessions}>🖨️ طباعة / PDF</button>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "10px" }}>
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
          <span style={{ alignSelf: "center" }}>إلى</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd" }} />
          <input
            placeholder="🔍 بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ padding: "8px", borderRadius: "6px", border: "1px solid #ddd", flex: 1 }}
          />
        </div>
      </section>

      <section className="panel">
        <p className="no-print">عدد الجلسات: {filteredSessions.length}</p>

        {Object.keys(grouped).sort().map((date) => (
          <div key={date}>
            <div className="date-group-header">
              {formatDate(date)}
              {date === today && <span className="today-badge">اليوم</span>}
              {date === tomorrow && <span className="today-badge" style={{ background: "#f59e0b" }}>الغد</span>}
              <span style={{ float: "left", fontWeight: "normal", fontSize: "13px" }}>
                {grouped[date].length} جلسة
              </span>
            </div>

            <div className="table-box">
              <table className="sessions-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الوقت</th>
                    <th>الموكل</th>
                    <th>رقم القضية</th>
                    <th>المحكمة</th>
                    <th>نوع الجلسة</th>
                    <th>المسؤول</th>
                    <th>رقم الملف</th>
                    <th>ملاحظات</th>
                  </tr>
                </thead>
                <tbody>
                  {grouped[date].map((item, index) => (
                    <tr key={item.id}>
                      <td>{index + 1}</td>
                      <td>{item.session_time || "—"}</td>
                      <td style={{ fontWeight: "bold" }}>{item.cases?.client_name || item.client_name || "—"}</td>
                      <td>{item.cases?.case_number || "—"}</td>
                      <td>{item.cases?.court || item.location || "—"}</td>
                      <td>{item.hearing_type || "—"}</td>
                      <td>{item.lawyer || item.cases?.lawyer || "—"}</td>
                      <td>{item.cases?.file_no || item.file_no || "—"}</td>
                      <td>{item.notes || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <p style={{ textAlign: "center", padding: "30px", color: "#888" }}>
            لا توجد جلسات في هذه الفترة
          </p>
        )}
      </section>
    </div>
  );
}

export default Sessions;
