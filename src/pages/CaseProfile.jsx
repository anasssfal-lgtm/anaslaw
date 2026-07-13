import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function CaseProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseItem, setCaseItem] = useState(null);
  const [excelCase, setExcelCase] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    loadCase();
  }, [id]);

  function clean(value) {
    if (value === null || value === undefined) return "";
    const text = String(value).trim();
    if (!text) return "";
    if (["غير موجود", "غير محدد", "غير محددة", "null", "undefined"].includes(text)) return "";
    return text;
  }

  async function loadCase() {
    const { data: caseData, error: caseError } = await supabase
      .from("cases")
      .select("*")
      .eq("id", id)
      .single();

    if (caseError) {
      alert("خطأ في جلب ملف القضية: " + caseError.message);
      return;
    }

    setEditForm({
      client_name: caseData.client_name || "",
      case_number: caseData.case_number || "",
      file_no: caseData.file_no || "",
      case_type: caseData.case_type || "",
      court: caseData.court || "",
      lawyer: caseData.lawyer || "",
      opponent_name: caseData.opponent_name || "",
      status: caseData.status || "",
      notes: caseData.notes || "",
    });

    const caseNumber = clean(caseData.case_number);
    const parts = caseNumber.split("-");
    const normalizedCaseNumber = parts.length === 2 ? `${parts[1]}-${parts[0]}` : caseNumber;

    const { data: excelRows, error: excelError } = await supabase
      .from("excel_case_levels")
      .select("*")
      .eq("CourtCaseNo", normalizedCaseNumber)
      .limit(1);

    if (excelError) console.log("EXCEL ERROR:", excelError);

    let excel = excelRows?.[0] || null;

    if (!excel && normalizedCaseNumber) {
      const { data: allRows } = await supabase.from("excel_case_levels").select("*");
      excel = allRows?.find((row) => {
        const a = clean(row.CourtCaseNo).replace(/\s/g, "");
        const b = normalizedCaseNumber.replace(/\s/g, "");
        return a === b;
      }) || null;
    }

    setCaseItem(caseData);
    setExcelCase(excel);

    const linkedFileNo = clean(caseData.file_no) || clean(excel?.FileNo);
    let sessionsQuery = supabase.from("sessions").select("*").order("session_date", { ascending: false });
    if (linkedFileNo) {
      sessionsQuery = sessionsQuery.or(`case_id.eq.${id},file_no.eq.${linkedFileNo}`);
    } else {
      sessionsQuery = sessionsQuery.eq("case_id", id);
    }
    const { data: sessionsData } = await sessionsQuery;
    setSessions(sessionsData || []);
  }

  async function saveEdit() {
    const { error } = await supabase.from("cases").update(editForm).eq("id", id);
    if (error) { alert("خطأ أثناء الحفظ: " + error.message); return; }
    alert("تم حفظ التعديلات بنجاح ✅");
    setEditing(false);
    loadCase();
  }

  if (!caseItem) {
    return <h2 style={{ textAlign: "center" }}>جاري تحميل ملف القضية...</h2>;
  }

  const clientName = clean(caseItem.client_name) || clean(excelCase?.Client) || "بدون اسم موكل";
  const caseNumber = clean(caseItem.case_number) || clean(excelCase?.CourtCaseNo) || "غير موجود";
  const fileNo = clean(caseItem.file_no) || clean(excelCase?.FileNo) || "غير موجود";
  const caseType = clean(caseItem.case_type) || clean(excelCase?.LevelCaseType) || clean(excelCase?.LevelType) || "غير محدد";
  const court = clean(caseItem.court) || clean(excelCase?.Court) || "غير محددة";
  const status = clean(caseItem.file_status) || clean(caseItem.status) || clean(excelCase?.FileStatus) || clean(excelCase?.CaseStatus) || "غير محددة";
  const opponent = clean(caseItem.opponent_name) || clean(excelCase?.OpponentStatus) || "غير موجود";

  return (
    <div>
      <style>{`
        @media print {
          nav, .no-print { display: none !important; }
          .print-header { display: flex !important; }
        }
        .print-header {
          display: none;
          align-items: center;
          gap: 15px;
          padding: 15px 0;
          border-bottom: 2px solid #8B6914;
          margin-bottom: 20px;
        }
        .print-header img { width: 50px; height: 50px; object-fit: contain; }
        .print-header h2 { margin: 0; color: #8B6914; }
        .info-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-top: 15px;
        }
        .info-item {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 10px 14px;
          border-right: 3px solid #7c1c1c;
        }
        .info-item b { display: block; color: #7c1c1c; font-size: 12px; margin-bottom: 4px; }
        .info-item span { font-size: 14px; color: #333; }
        .edit-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 15px;
        }
        .edit-field { display: flex; flex-direction: column; gap: 4px; }
        .edit-field label { font-size: 12px; color: #7c1c1c; font-weight: bold; }
        .edit-field input, .edit-field textarea, .edit-field select {
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }
        .session-card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 12px;
          margin-bottom: 10px;
          border-right: 3px solid #7c1c1c;
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
        }
        .upcoming-session {
          border-right: 3px solid #22c55e;
          background: #f0fff4;
        }
        .btn-edit { background: #f59e0b; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .btn-save { background: #22c55e; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
        .btn-cancel { background: #ef4444; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; }
      `}</style>

      {/* Print Header */}
      <div className="print-header">
        <img src="/logo.png" alt="logo" />
        <div>
          <h2>مكتب أنس الحيدر للمحاماة</h2>
          <p>ملف القضية — {clientName}</p>
        </div>
      </div>

      <section className="panel">
        <h1 style={{ textAlign: "center" }}>📂 ملف القضية</h1>
        <h2 style={{ textAlign: "center", color: "#7c1c1c" }}>{clientName}</h2>

        {/* أزرار */}
        <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", margin: "15px 0" }} className="no-print">
          <Link to="/cases"><button type="button">⬅️ رجوع</button></Link>
          {!editing && <button className="btn-edit" onClick={() => setEditing(true)}>✏️ تعديل</button>}
          {editing && <button className="btn-save" onClick={saveEdit}>💾 حفظ</button>}
          {editing && <button className="btn-cancel" onClick={() => setEditing(false)}>❌ إلغاء</button>}
          <button type="button" onClick={() => window.print()}>🖨️ طباعة</button>
        </div>

        {/* وضع العرض */}
        {!editing && (
          <div className="info-grid">
            <div className="info-item"><b>رقم النظام</b><span>{caseItem.id}</span></div>
            <div className="info-item"><b>رقم القضية</b><span>{caseNumber}</span></div>
            <div className="info-item"><b>رقم الملف</b><span>{fileNo}</span></div>
            <div className="info-item"><b>نوع القضية</b><span>{caseType}</span></div>
            <div className="info-item"><b>المحكمة</b><span>{court}</span></div>
            <div className="info-item"><b>الدائرة</b><span>{clean(excelCase?.Chamber) || "—"}</span></div>
            <div className="info-item"><b>الدور</b><span>{clean(excelCase?.Floor) || "—"}</span></div>
            <div className="info-item"><b>الرقم الإلكتروني</b><span>{clean(excelCase?.ElectronicNo) || "—"}</span></div>
            <div className="info-item"><b>رقم الدائرة/الهيئة</b><span>{clean(excelCase?.JuryNo) || "—"}</span></div>
            <div className="info-item"><b>بداية القضية</b><span>{clean(excelCase?.CaseStartDate) || "—"}</span></div>
            <div className="info-item"><b>نهاية القضية</b><span>{clean(excelCase?.CaseEndDate) || "—"}</span></div>
            <div className="info-item"><b>الحالة</b><span>{status}</span></div>
            <div className="info-item"><b>صفة الموكل</b><span>{clean(excelCase?.ClientStatus) || "—"}</span></div>
            <div className="info-item"><b>صفة الخصم</b><span>{clean(excelCase?.OpponentStatus) || "—"}</span></div>
            <div className="info-item"><b>تاريخ الحكم</b><span>{clean(excelCase?.VerdictDate) || "—"}</span></div>
            <div className="info-item"><b>نتيجة الحكم</b><span>{clean(excelCase?.VerdictResult) || "—"}</span></div>
            <div className="info-item"><b>الحكم</b><span>{clean(excelCase?.Verdict) || "—"}</span></div>
            <div className="info-item"><b>المسؤول</b><span>{clean(caseItem.lawyer) || "—"}</span></div>
            <div className="info-item"><b>الخصم</b><span>{opponent}</span></div>
            <div className="info-item" style={{ gridColumn: "span 3" }}><b>ملاحظات</b><span>{clean(caseItem.notes) || "لا توجد"}</span></div>
          </div>
        )}

        {/* وضع التعديل */}
        {editing && (
          <div className="edit-grid">
            <div className="edit-field">
              <label>اسم الموكل</label>
              <input value={editForm.client_name} onChange={(e) => setEditForm({ ...editForm, client_name: e.target.value })} />
            </div>
            <div className="edit-field">
              <label>رقم القضية</label>
              <input value={editForm.case_number} onChange={(e) => setEditForm({ ...editForm, case_number: e.target.value })} />
            </div>
            <div className="edit-field">
              <label>رقم الملف</label>
              <input value={editForm.file_no} onChange={(e) => setEditForm({ ...editForm, file_no: e.target.value })} />
            </div>
            <div className="edit-field">
              <label>نوع القضية</label>
              <input value={editForm.case_type} onChange={(e) => setEditForm({ ...editForm, case_type: e.target.value })} />
            </div>
            <div className="edit-field">
              <label>المحكمة</label>
              <input value={editForm.court} onChange={(e) => setEditForm({ ...editForm, court: e.target.value })} />
            </div>
            <div className="edit-field">
              <label>المسؤول</label>
              <input value={editForm.lawyer} onChange={(e) => setEditForm({ ...editForm, lawyer: e.target.value })} />
            </div>
            <div className="edit-field">
              <label>الخصم</label>
              <input value={editForm.opponent_name} onChange={(e) => setEditForm({ ...editForm, opponent_name: e.target.value })} />
            </div>
            <div className="edit-field">
              <label>الحالة</label>
              <select value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}>
                <option>متداولة</option>
                <option>منتهية</option>
                <option>التنفيذ</option>
                <option>الحفظ</option>
                <option>موقوفة</option>
                <option>مؤرشفة</option>
              </select>
            </div>
            <div className="edit-field" style={{ gridColumn: "span 2" }}>
              <label>ملاحظات</label>
              <textarea rows={3} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
            </div>
          </div>
        )}
      </section>

      {/* الجلسات */}
      <section className="panel">
        <h2>📅 جلسات القضية ({sessions.length})</h2>
        {sessions.length === 0 ? (
          <p className="empty">لا توجد جلسات مرتبطة بهذه القضية</p>
        ) : (
          sessions.map((s) => {
            const isUpcoming = s.session_date >= new Date().toISOString().split("T")[0];
            return (
              <div className={`session-card ${isUpcoming ? "upcoming-session" : ""}`} key={s.id}>
                <div><b>📅 التاريخ</b><span>{s.session_date}</span></div>
                <div><b>🕐 الوقت</b><span>{clean(s.session_time) || "—"}</span></div>
                <div><b>📍 المكان</b><span>{clean(s.location) || "—"}</span></div>
                <div><b>نوع الجلسة</b><span>{clean(s.hearing_type) || "—"}</span></div>
                <div><b>المسؤول</b><span>{clean(s.lawyer) || "—"}</span></div>
                <div><b>ملاحظات</b><span>{clean(s.notes) || "—"}</span></div>
              </div>
            );
          })
        )}
      </section>
    </div>
  );
}

export default CaseProfile;
