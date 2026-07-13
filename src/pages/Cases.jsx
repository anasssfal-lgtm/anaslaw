import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function Cases() {
  const [cases, setCases] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [sessionForm, setSessionForm] = useState({});
  const [caseSearch, setCaseSearch] = useState("");
  const [view, setView] = useState("متداولة");
  const [clients, setClients] = useState([]);
  const [openSessionForm, setOpenSessionForm] = useState(null);

  const [caseForm, setCaseForm] = useState({
    client_name: "",
    case_number: "",
    case_type: "",
    court: "",
    lawyer: "",
    opponent_name: "",
    file_no: "",
    status: "متداولة",
    notes: "",
  });

  useEffect(() => {
    getCases();
    getSessions();
  }, []);

  async function getCases() {
    const { data, error } = await supabase
      .from("cases")
      .select("*")
      .order("id", { ascending: false })
      .limit(2000);
    if (error) return alert("خطأ في جلب القضايا: " + error.message);
    const all = data || [];
    window.__cases = all;
    setCases(all);
    const names = [...new Set(all.map((c) => c.client_name).filter(Boolean))].sort();
    setClients(names);
  }

  async function getSessions() {
    const today = new Date().toISOString().split('T')[0];
    const { data, error } = await supabase
      .from("sessions")
      .select("*")
      .gte("session_date", today)
      .order("session_date", { ascending: true });
    if (error) return alert("خطأ في جلب الجلسات: " + error.message);
    window.__sessions = data;
    setSessions(data || []);
  }

  async function addCase() {
    if (!caseForm.client_name) return alert("اكتب اسم الموكل");
    if (!caseForm.case_number) return alert("اكتب رقم القضية");
    if (!caseForm.case_type) return alert("اكتب نوع القضية");
    if (!caseForm.court) return alert("اكتب المحكمة");
    const { error } = await supabase.from("cases").insert([caseForm]);
    if (error) return alert("خطأ أثناء حفظ القضية: " + error.message);
    alert("تم حفظ القضية بنجاح ✅");
    setCaseForm({ client_name: "", case_number: "", case_type: "", court: "", lawyer: "", opponent_name: "", file_no: "", status: "متداولة", notes: "" });
    getCases();
  }

  async function addSession(caseItem) {
    const session = sessionForm[caseItem.id];
    if (!session?.session_date) return alert("اختر تاريخ الجلسة");
    const { error } = await supabase.from("sessions").insert([{
      case_id: caseItem.id,
      file_no: caseItem.file_no || "",
      client_name: caseItem.client_name || "",
      session_date: session.session_date,
      session_time: session.session_time || "",
      location: session.location || "",
      hearing_type: session.hearing_type || "",
      lawyer: session.lawyer || "",
      notes: session.notes || "",
    }]);
    if (error) return alert("خطأ أثناء حفظ الجلسة: " + error.message);
    setSessionForm({ ...sessionForm, [caseItem.id]: {} });
    setOpenSessionForm(null);
    getSessions();
    alert("تم حفظ الجلسة ✅");
  }

  async function archiveCase(id) {
    const ok = confirm("هل تريد أرشفة هذه القضية؟");
    if (!ok) return;
    const { error } = await supabase.from("cases").update({ status: "مؤرشفة", file_status: "مؤرشفة" }).eq("id", id);
    if (error) return alert("خطأ أثناء الأرشفة: " + error.message);
    getCases();
  }

  async function restoreCase(id) {
    const { error } = await supabase.from("cases").update({ status: "متداولة", file_status: "متداولة" }).eq("id", id);
    if (error) return alert("خطأ أثناء الاستعادة: " + error.message);
    getCases();
  }

  async function deleteCase(id) {
    const ok = confirm("تحذير: سيتم حذف القضية نهائياً. هل أنت متأكد؟");
    if (!ok) return;
    await supabase.from("sessions").delete().eq("case_id", id);
    const { error } = await supabase.from("cases").delete().eq("id", id);
    if (error) return alert("خطأ أثناء الحذف: " + error.message);
    getCases();
    getSessions();
  }

  function getCaseSessions(caseItem) {
    return sessions.filter(
      (s) =>
        Number(s.case_id) === Number(caseItem.id) ||
        (caseItem.file_no && String(s.file_no).trim() === String(caseItem.file_no).trim())
    );
  }

  function getUpcomingSessions(caseItem) {
    return getCaseSessions(caseItem);
  }

  const filteredCases = cases.filter((item) => {
    const statusText = item.file_status || item.status || "";
    const isArchived = statusText.includes("مؤرشفة");
    const hasUpcoming = getUpcomingSessions(item).length > 0;

    let matchView = false;
    if (view === "متداولة") matchView = !isArchived && hasUpcoming;
    else if (view === "أرشيف") matchView = isArchived;
    else matchView = true;

    const text = `${item.client_name || ""} ${item.case_number || ""} ${item.case_type || ""} ${item.court || ""} ${item.lawyer || ""}`;
    return matchView && text.toLowerCase().includes(caseSearch.toLowerCase());
  });

  const activeCount = cases.filter((c) => getUpcomingSessions(c).length > 0 && !(c.file_status || c.status || "").includes("مؤرشفة")).length;
  const archivedCount = cases.filter((c) => (c.file_status || c.status || "").includes("مؤرشفة")).length;

  return (
    <div>
      <style>{`
        .case-card-new {
          background: white;
          border-radius: 12px;
          border: 1px solid #eee;
          margin-bottom: 15px;
          overflow: hidden;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .case-card-header {
          background: linear-gradient(135deg, #7c1c1c, #a83232);
          color: white;
          padding: 12px 16px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .case-card-header h3 { margin: 0; font-size: 16px; }
        .case-card-header span { background: rgba(255,255,255,0.2); padding: 2px 10px; border-radius: 10px; font-size: 12px; }
        .case-card-body { padding: 12px 16px; }
        .case-info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 10px;
        }
        .case-info-item { font-size: 13px; color: #555; }
        .case-info-item b { color: #333; display: block; font-size: 11px; }
        .upcoming-box {
          background: #f0fff4;
          border-radius: 8px;
          padding: 10px;
          margin-bottom: 10px;
          border-right: 3px solid #22c55e;
        }
        .upcoming-box h4 { margin: 0 0 8px 0; color: #166534; font-size: 13px; }
        .upcoming-session-row { display: flex; gap: 10px; font-size: 12px; color: #444; padding: 4px 0; border-bottom: 1px solid #dcfce7; }
        .case-card-actions { display: flex; gap: 8px; flex-wrap: wrap; padding: 10px 16px; background: #fafafa; border-top: 1px solid #eee; }
        .case-card-actions button { padding: 6px 12px; border-radius: 6px; border: none; cursor: pointer; font-size: 12px; }
        .btn-open { background: #7c1c1c; color: white; }
        .btn-session { background: #3b82f6; color: white; }
        .btn-archive { background: #f59e0b; color: white; }
        .btn-restore { background: #22c55e; color: white; }
        .btn-delete { background: #ef4444; color: white; }
        .session-add-form {
          background: #eff6ff;
          border-radius: 8px;
          padding: 12px;
          margin: 10px 16px;
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 8px;
        }
        .session-add-form input, .session-add-form textarea, .session-add-form select {
          padding: 7px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 13px;
          font-family: inherit;
        }
        .session-add-form button { background: #3b82f6; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; }
      `}</style>

      {/* الإحصائيات */}
      <section className="panel">
        <h1 style={{ textAlign: "center" }}>📁 إدارة القضايا</h1>
        <div className="dashboard">
          <div className="stat blue"><h3>{cases.length}</h3><p>كل القضايا</p></div>
          <div className="stat green"><h3>{activeCount}</h3><p>القضايا المتداولة</p></div>
          <div className="stat yellow"><h3>{archivedCount}</h3><p>الأرشيف</p></div>
          <div className="stat purple"><h3>{sessions.length}</h3><p>الجلسات القادمة</p></div>
        </div>
      </section>

      {/* إضافة قضية */}
      <section className="panel">
        <h2>➕ إضافة قضية جديدة</h2>
        <div className="form">
          <select value="" onChange={(e) => { if (e.target.value) setCaseForm({ ...caseForm, client_name: e.target.value }); }}>
            <option value="">-- اختر موكل موجود --</option>
            {clients.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input placeholder="أو اكتب اسم موكل جديد" value={caseForm.client_name} onChange={(e) => setCaseForm({ ...caseForm, client_name: e.target.value })} />
          <input placeholder="رقم القضية" value={caseForm.case_number} onChange={(e) => setCaseForm({ ...caseForm, case_number: e.target.value })} />
          <input placeholder="رقم الملف" value={caseForm.file_no} onChange={(e) => setCaseForm({ ...caseForm, file_no: e.target.value })} />
          <input placeholder="نوع القضية" value={caseForm.case_type} onChange={(e) => setCaseForm({ ...caseForm, case_type: e.target.value })} />
          <input placeholder="المحكمة" value={caseForm.court} onChange={(e) => setCaseForm({ ...caseForm, court: e.target.value })} />
          <input placeholder="المسؤول" value={caseForm.lawyer} onChange={(e) => setCaseForm({ ...caseForm, lawyer: e.target.value })} />
          <input placeholder="الخصم" value={caseForm.opponent_name} onChange={(e) => setCaseForm({ ...caseForm, opponent_name: e.target.value })} />
          <select value={caseForm.status} onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}>
            <option>متداولة</option>
            <option>منتهية</option>
            <option>التنفيذ</option>
            <option>الحفظ</option>
            <option>موقوفة</option>
          </select>
          <textarea placeholder="ملاحظات" value={caseForm.notes} onChange={(e) => setCaseForm({ ...caseForm, notes: e.target.value })} />
          <button type="button" onClick={addCase}>💾 حفظ القضية</button>
        </div>
      </section>

      {/* قائمة القضايا */}
      <section className="panel">
        <h2>القضايا</h2>
        <div style={{ display: "flex", gap: "10px", marginBottom: "15px", flexWrap: "wrap" }}>
          <button type="button" onClick={() => setView("متداولة")} style={{ background: view === "متداولة" ? "#7c1c1c" : "#eee", color: view === "متداولة" ? "#fff" : "#333", padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
            ⚖️ المتداولة ({activeCount})
          </button>
          <button type="button" onClick={() => setView("أرشيف")} style={{ background: view === "أرشيف" ? "#7c1c1c" : "#eee", color: view === "أرشيف" ? "#fff" : "#333", padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
            🗄️ الأرشيف ({archivedCount})
          </button>
          <button type="button" onClick={() => setView("كل")} style={{ background: view === "كل" ? "#7c1c1c" : "#eee", color: view === "كل" ? "#fff" : "#333", padding: "8px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}>
            📋 الكل ({cases.length})
          </button>
        </div>

        <input
          placeholder="🔍 ابحث باسم الموكل أو رقم القضية أو المحكمة..."
          value={caseSearch}
          onChange={(e) => setCaseSearch(e.target.value)}
          style={{ width: "100%", padding: "10px", marginBottom: "15px", borderRadius: "8px", border: "1px solid #ddd" }}
        />

        <p style={{ color: "#888", fontSize: "13px" }}>عدد النتائج: {filteredCases.length}</p>

        {filteredCases.map((item) => {
          const upcomingSessions = getUpcomingSessions(item);
          return (
            <div className="case-card-new" key={item.id}>
              <div className="case-card-header">
                <h3>{item.client_name || "بدون اسم موكل"}</h3>
                <span>{item.file_status || item.status || "متداولة"}</span>
              </div>

              <div className="case-card-body">
                <div className="case-info-grid">
                  <div className="case-info-item"><b>رقم القضية</b>{item.case_number || "—"}</div>
                  <div className="case-info-item"><b>رقم الملف</b>{item.file_no || "—"}</div>
                  <div className="case-info-item"><b>نوع القضية</b>{item.case_type || "—"}</div>
                  <div className="case-info-item"><b>المحكمة</b>{item.court || "—"}</div>
                  <div className="case-info-item"><b>المسؤول</b>{item.lawyer || "—"}</div>
                  <div className="case-info-item"><b>الخصم</b>{item.opponent_name || "—"}</div>
                </div>

                {upcomingSessions.length > 0 && (
                  <div className="upcoming-box">
                    <h4>📅 جلسات قادمة ({upcomingSessions.length})</h4>
                    {upcomingSessions.slice(0, 3).map((s) => (
                      <div className="upcoming-session-row" key={s.id}>
                        <span>📅 {s.session_date}</span>
                        <span>🕐 {s.session_time || "—"}</span>
                        <span>📍 {s.location || "—"}</span>
                        <span>{s.notes || ""}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* فورم إضافة جلسة */}
              {openSessionForm === item.id && (
                <div className="session-add-form">
                  <input type="date" value={sessionForm[item.id]?.session_date || ""} onChange={(e) => setSessionForm({ ...sessionForm, [item.id]: { ...sessionForm[item.id], session_date: e.target.value } })} />
                  <input placeholder="وقت الجلسة" value={sessionForm[item.id]?.session_time || ""} onChange={(e) => setSessionForm({ ...sessionForm, [item.id]: { ...sessionForm[item.id], session_time: e.target.value } })} />
                  <input placeholder="المكان" value={sessionForm[item.id]?.location || ""} onChange={(e) => setSessionForm({ ...sessionForm, [item.id]: { ...sessionForm[item.id], location: e.target.value } })} />
                  <input placeholder="المسؤول" value={sessionForm[item.id]?.lawyer || ""} onChange={(e) => setSessionForm({ ...sessionForm, [item.id]: { ...sessionForm[item.id], lawyer: e.target.value } })} />
                  <input placeholder="نوع الجلسة" value={sessionForm[item.id]?.hearing_type || ""} onChange={(e) => setSessionForm({ ...sessionForm, [item.id]: { ...sessionForm[item.id], hearing_type: e.target.value } })} />
                  <textarea placeholder="ملاحظات" style={{ gridColumn: "span 2" }} value={sessionForm[item.id]?.notes || ""} onChange={(e) => setSessionForm({ ...sessionForm, [item.id]: { ...sessionForm[item.id], notes: e.target.value } })} />
                  <button onClick={() => addSession(item)} style={{ gridColumn: "span 2" }}>💾 حفظ الجلسة</button>
                </div>
              )}

              <div className="case-card-actions">
                <Link to={`/cases/${item.id}`}><button className="btn-open">📂 فتح الملف</button></Link>
                <button className="btn-session" onClick={() => setOpenSessionForm(openSessionForm === item.id ? null : item.id)}>
                  {openSessionForm === item.id ? "❌ إلغاء" : "➕ جلسة جديدة"}
                </button>
                <button className="btn-archive" onClick={() => archiveCase(item.id)}>🗄️ أرشفة</button>
                {view === "أرشيف" && <button className="btn-restore" onClick={() => restoreCase(item.id)}>♻️ استعادة</button>}
                <button className="btn-delete" onClick={() => deleteCase(item.id)}>🗑️ حذف</button>
              </div>
            </div>
          );
        })}

        {filteredCases.length === 0 && (
          <p className="empty" style={{ textAlign: "center", padding: "30px" }}>
            {view === "متداولة" ? "لا توجد قضايا متداولة حالياً" : "لا توجد نتائج"}
          </p>
        )}
      </section>
    </div>
  );
}

export default Cases;
