import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function Reports() {
  const [sessions, setSessions] = useState([]);
  const [cases, setCases] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [lawyerFilter, setLawyerFilter] = useState("");
  const [courtFilter, setCourtFilter] = useState("");

  const today = new Date().toISOString().split("T")[0];
  const weekDate = new Date();
  weekDate.setDate(weekDate.getDate() + 7);
  const nextWeek = weekDate.toISOString().split("T")[0];
  const monthDate = new Date();
  monthDate.setDate(monthDate.getDate() + 30);
  const nextMonth = monthDate.toISOString().split("T")[0];

  const lawyers = ["انس الحيدر", "علي طه", "طلال الشطي"];

  useEffect(() => {
    setFromDate(today);
    setToDate(nextWeek);
    getData();
  }, []);

  async function getData() {
    const { data: sessionsData } = await supabase
      .from("sessions")
      .select("*, cases(client_name, case_number, court, lawyer, file_no, opponent_name)")
      .order("session_date", { ascending: true });

    const { data: casesData } = await supabase.from("cases").select("*");

    setSessions(sessionsData || []);
    setCases(casesData || []);
  }

  const filteredSessions = sessions.filter((s) => {
    const matchFrom = fromDate ? s.session_date >= fromDate : true;
    const matchTo = toDate ? s.session_date <= toDate : true;
    const lawyer = s.lawyer || s.cases?.lawyer || "";
    const court = s.cases?.court || s.location || "";
    const matchLawyer = lawyerFilter ? lawyer.includes(lawyerFilter) : true;
    const matchCourt = courtFilter ? court.includes(courtFilter) : true;
    return matchFrom && matchTo && matchLawyer && matchCourt;
  });

  const grouped = filteredSessions.reduce((acc, s) => {
    if (!acc[s.session_date]) acc[s.session_date] = [];
    acc[s.session_date].push(s);
    return acc;
  }, {});

  function formatDate(dateStr) {
    const days = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const d = new Date(dateStr);
    return `${days[d.getDay()]} ${dateStr}`;
  }

  const courts = [...new Set(sessions.map(s => s.cases?.court || s.location).filter(Boolean))];
  const activeCases = cases.filter((c) => !(c.file_status || c.status || "").includes("مؤرشفة") && !(c.file_status || c.status || "").includes("منتهية"));

  return (
    <div>
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          .print-header { display: flex !important; }
          body { font-size: 11px; }
          .report-table th, .report-table td { padding: 5px 6px !important; font-size: 10px; }
          .date-header { background: #7c1c1c !important; color: white !important; -webkit-print-color-adjust: exact; }
        }
        .print-header {
          display: none;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 2px solid #8B6914;
          margin-bottom: 20px;
        }
        .print-header img { width: 55px; height: 55px; object-fit: contain; }
        .print-header h2 { margin: 0; color: #8B6914; font-size: 17px; }
        .print-header p { margin: 4px 0 0 0; color: #666; font-size: 12px; }
        .report-tabs { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .report-tab { padding: 10px 20px; border-radius: 8px; border: 2px solid #eee; cursor: pointer; background: white; font-size: 14px; transition: all 0.2s; }
        .report-tab:hover { border-color: #7c1c1c; }
        .filter-row { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px; align-items: center; }
        .filter-row input, .filter-row select { padding: 8px 12px; border: 1px solid #ddd; border-radius: 8px; font-size: 13px; }
        .date-header { background: #7c1c1c; color: white; padding: 8px 15px; border-radius: 6px; margin-top: 15px; margin-bottom: 5px; display: flex; justify-content: space-between; font-weight: bold; font-size: 13px; }
        .report-table { width: 100%; border-collapse: collapse; direction: rtl; margin-bottom: 10px; }
        .report-table th { background: #f5f5f5; padding: 8px 10px; text-align: center; border: 1px solid #ddd; font-size: 12px; }
        .report-table td { padding: 7px 10px; border: 1px solid #eee; text-align: center; font-size: 12px; }
        .report-table tr:hover { background: #fafafa; }
        .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px; margin-bottom: 20px; }
        .stat-card { background: white; border-radius: 12px; padding: 20px; text-align: center; border: 1px solid #eee; box-shadow: 0 1px 4px rgba(0,0,0,0.05); }
        .stat-card h2 { margin: 0 0 6px 0; font-size: 32px; color: #7c1c1c; }
        .stat-card p { margin: 0; color: #666; font-size: 13px; }
        .print-btn { background: #1d4ed8; color: white; border: none; padding: 10px 20px; border-radius: 8px; cursor: pointer; font-size: 14px; }
      `}</style>

      {/* Print Header */}
      <div className="print-header">
        <img src="/logo.png" alt="logo" />
        <div>
          <h2>مكتب أنس الحيدر للمحاماة والاستشارات القانونية</h2>
          <p>رول الجلسات — من {fromDate} إلى {toDate}</p>
          {lawyerFilter && <p>المحامي: {lawyerFilter}</p>}
          {courtFilter && <p>المحكمة: {courtFilter}</p>}
        </div>
      </div>

      <section className="panel no-print">
        <h1 style={{ textAlign: "center" }}>📊 التقارير</h1>

        <div className="stats-grid">
          <div className="stat-card">
            <h2>{cases.length}</h2>
            <p>إجمالي القضايا</p>
          </div>
          <div className="stat-card">
            <h2>{activeCases.length}</h2>
            <p>القضايا المتداولة</p>
          </div>
          <div className="stat-card">
            <h2>{sessions.filter(s => s.session_date >= today).length}</h2>
            <p>الجلسات القادمة</p>
          </div>
        </div>

        <div className="report-tabs">
          <button className="report-tab" onClick={() => { setFromDate(today); setToDate(today); }}>📅 اليوم</button>
          <button className="report-tab" onClick={() => { setFromDate(today); setToDate(nextWeek); }}>📅 هذا الأسبوع</button>
          <button className="report-tab" onClick={() => { setFromDate(today); setToDate(nextMonth); }}>📅 هذا الشهر</button>
          <button className="report-tab" onClick={() => { setFromDate(""); setToDate(""); }}>📋 الكل</button>
        </div>
      </section>

      <section className="panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
          <h2>🗓️ رول الجلسات</h2>
          <button className="print-btn no-print" onClick={() => window.print()}>🖨️ طباعة / PDF</button>
        </div>

        <div className="filter-row no-print">
          <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          <span>إلى</span>
          <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          <select value={lawyerFilter} onChange={(e) => setLawyerFilter(e.target.value)}>
            <option value="">كل المحامين</option>
            {lawyers.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
          <select value={courtFilter} onChange={(e) => setCourtFilter(e.target.value)}>
            <option value="">كل المحاكم</option>
            {courts.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <p className="no-print" style={{ color: "#888", fontSize: "13px" }}>عدد الجلسات: {filteredSessions.length}</p>

        {Object.keys(grouped).sort().map((date) => (
          <div key={date}>
            <div className="date-header">
              <span>{formatDate(date)}</span>
              <span>{grouped[date].length} جلسة</span>
            </div>
            <table className="report-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>الوقت</th>
                  <th>الموكل</th>
                  <th>رقم القضية</th>
                  <th>المحكمة</th>
                  <th>نوع الجلسة</th>
                  <th>المسؤول</th>
                  <th>ملاحظات</th>
                </tr>
              </thead>
              <tbody>
                {grouped[date].map((s, i) => (
                  <tr key={s.id}>
                    <td>{i + 1}</td>
                    <td>{s.session_time || "—"}</td>
                    <td style={{ fontWeight: "bold", textAlign: "right" }}>{s.cases?.client_name || s.client_name || "—"}</td>
                    <td>{s.cases?.case_number || "—"}</td>
                    <td>{s.cases?.court || s.location || "—"}</td>
                    <td>{s.hearing_type || "—"}</td>
                    <td>{s.lawyer || s.cases?.lawyer || "—"}</td>
                    <td style={{ textAlign: "right" }}>{s.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}

        {filteredSessions.length === 0 && (
          <p style={{ textAlign: "center", color: "#999", padding: "30px" }}>
            لا توجد جلسات في هذه الفترة
          </p>
        )}
      </section>
    </div>
  );
}

export default Reports;
