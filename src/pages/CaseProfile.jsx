import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../supabase";

function CaseProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [caseItem, setCaseItem] = useState(null);
  const [excelCase, setExcelCase] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

  const [notices, setNotices] = useState([]);
  const [showNoticeForm, setShowNoticeForm] = useState(false);
  const [noticeForm, setNoticeForm] = useState({});
  const [savingNotice, setSavingNotice] = useState(false);

  const [showSessionForm, setShowSessionForm] = useState(false);
  const [sessionForm, setSessionForm] = useState({});
  const [savingSession, setSavingSession] = useState(false);

  const [editingSessionId, setEditingSessionId] = useState(null);
  const [sessionEditForm, setSessionEditForm] = useState({});
  const [savingSessionEdit, setSavingSessionEdit] = useState(false);

  const [profilePrintMode, setProfilePrintMode] = useState(false);
  const [noticeToPrint, setNoticeToPrint] = useState(null);
  const printExitRef = useRef(null);

  const [parentCase, setParentCase] = useState(null);
  const [childCases, setChildCases] = useState([]);
  const [creatingAppeal, setCreatingAppeal] = useState(false);

  useEffect(() => {
    loadCase();
    loadNotices();
  }, [id]);

  function clean(value) {
    if (value === null || value === undefined) return "";

    const text = String(value).trim();

    if (!text) return "";

    if (
      [
        "غير موجود",
        "غير محدد",
        "غير محددة",
        "null",
        "undefined",
      ].includes(text)
    ) {
      return "";
    }

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

    const normalizedCaseNumber = clean(caseData.case_number);

    const { data: excelRows, error: excelError } = await supabase
      .from("excel_case_levels")
      .select("*")
      .eq("CourtCaseNo", normalizedCaseNumber)
      .limit(1);

    if (excelError) {
      console.log("EXCEL ERROR:", excelError);
    }

    let excel = excelRows?.[0] || null;

    if (!excel && normalizedCaseNumber) {
      const { data: allRows, error: allRowsError } = await supabase
        .from("excel_case_levels")
        .select("*");

      if (allRowsError) {
        console.log("ALL EXCEL ROWS ERROR:", allRowsError);
      }

      excel =
        allRows?.find((row) => {
          const excelNumber = clean(row.CourtCaseNo).replace(/\s/g, "");
          const caseNumber = normalizedCaseNumber.replace(/\s/g, "");

          return excelNumber === caseNumber;
        }) || null;
    }

    setCaseItem(caseData);
    setExcelCase(excel);

    setEditForm({
      client_name: caseData.client_name || "",
      case_number: caseData.case_number || "",
      file_no: caseData.file_no || "",
      case_type: caseData.case_type || "",
      court: caseData.court || "",
      lawyer: caseData.lawyer || "",
      opponent_name: caseData.opponent_name || "",
      status: caseData.status || "",
      verdict: caseData.verdict || "",
      notes: caseData.notes || "",
      chamber: caseData.chamber || clean(excel?.Chamber) || "",
      floor: caseData.floor || clean(excel?.Floor) || "",
      jury_no: caseData.jury_no || clean(excel?.JuryNo) || "",
      electronic_no:
        caseData.electronic_no || clean(excel?.ElectronicNo) || "",
      case_start_date:
        caseData.case_start_date || clean(excel?.CaseStartDate) || "",
      client_status:
        caseData.client_status || clean(excel?.ClientStatus) || "",
      opponent_status:
        caseData.opponent_status || clean(excel?.OpponentStatus) || "",
      old_verdict_date:
        caseData.old_verdict_date || clean(excel?.VerdictDate) || "",
      old_verdict_result:
        caseData.old_verdict_result || clean(excel?.VerdictResult) || "",
    });

    const linkedFileNo =
      clean(caseData.file_no) || clean(excel?.FileNo);

    let sessionsQuery = supabase
      .from("sessions")
      .select("*")
      .order("session_date", { ascending: false });

    if (linkedFileNo) {
      sessionsQuery = sessionsQuery.or(
        `case_id.eq.${id},file_no.eq.${linkedFileNo}`
      );
    } else {
      sessionsQuery = sessionsQuery.eq("case_id", id);
    }

    const { data: sessionsData, error: sessionsError } =
      await sessionsQuery;

    if (sessionsError) {
      console.log("SESSIONS ERROR:", sessionsError);
    }

    setSessions(sessionsData || []);

    if (caseData.parent_case_id) {
      const { data: parentData, error: parentError } = await supabase
        .from("cases")
        .select("id, client_name, case_number, case_level")
        .eq("id", caseData.parent_case_id)
        .maybeSingle();

      if (parentError) {
        console.log("PARENT CASE ERROR:", parentError);
      }

      setParentCase(parentData || null);
    } else {
      setParentCase(null);
    }

    const { data: childData, error: childError } = await supabase
      .from("cases")
      .select("id, client_name, case_number, case_level")
      .eq("parent_case_id", id);

    if (childError) {
      console.log("CHILD CASES ERROR:", childError);
    }

    setChildCases(childData || []);
  }

  async function loadNotices() {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("case_id", id)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("NOTICES ERROR:", error);
      return;
    }

    setNotices(data || []);
  }

  async function saveEdit() {
    const updateData = {
      client_name: editForm.client_name?.trim() || "",
      case_number: editForm.case_number?.trim() || "",
      file_no: editForm.file_no?.trim() || "",
      case_type: editForm.case_type?.trim() || "",
      court: editForm.court?.trim() || "",
      lawyer: editForm.lawyer?.trim() || "",
      opponent_name: editForm.opponent_name?.trim() || "",
      status: editForm.status || "",
      verdict: editForm.verdict?.trim() || "",
      notes: editForm.notes?.trim() || "",
      chamber: editForm.chamber?.trim() || "",
      floor: editForm.floor?.trim() || "",
      jury_no: editForm.jury_no?.trim() || "",
      electronic_no: editForm.electronic_no?.trim() || "",
      case_start_date: editForm.case_start_date?.trim() || "",
      client_status: editForm.client_status?.trim() || "",
      opponent_status: editForm.opponent_status?.trim() || "",
      old_verdict_date: editForm.old_verdict_date?.trim() || "",
      old_verdict_result: editForm.old_verdict_result?.trim() || "",
    };

    const { error } = await supabase
      .from("cases")
      .update(updateData)
      .eq("id", id);

    if (error) {
      alert("خطأ أثناء الحفظ: " + error.message);
      return;
    }

    alert("تم حفظ التعديلات والحكم بنجاح ✅");

    setEditing(false);
    await loadCase();
  }

  async function deleteCase() {
    const ok = confirm(
      "تحذير: سيتم حذف القضية وكل جلساتها نهائياً. هل أنت متأكد؟"
    );
    if (!ok) return;

    await supabase.from("sessions").delete().eq("case_id", id);

    const { error } = await supabase.from("cases").delete().eq("id", id);

    if (error) {
      alert("خطأ أثناء حذف القضية: " + error.message);
      return;
    }

    navigate("/cases");
  }

  async function createAppealCase() {
    const ok = confirm(
      "بينسوى ملف قضية جديد منفصل تماماً لدرجة الاستئناف (معبّى ببيانات الموكل والخصم)، بدون أي تعديل على ملف أول درجة الحالي. تكمل؟"
    );
    if (!ok) return;

    setCreatingAppeal(true);

    const { data: newCase, error } = await supabase
      .from("cases")
      .insert([
        {
          client_name: caseItem.client_name || "",
          opponent_name: caseItem.opponent_name || "",
          case_type: caseItem.case_type || "",
          lawyer: caseItem.lawyer || "",
          client_status: caseItem.client_status || "",
          opponent_status: caseItem.opponent_status || "",
          notes: caseItem.notes || "",
          status: "متداولة",
          verdict: "",
          old_verdict_result: caseItem.verdict || "",
          parent_case_id: id,
          case_level: "استئناف",
        },
      ])
      .select()
      .single();

    setCreatingAppeal(false);

    if (error) {
      alert("خطأ أثناء إنشاء ملف الاستئناف: " + error.message);
      return;
    }

    navigate(`/cases/${newCase.id}`);
  }

  function cancelEdit() {
    setEditForm({
      client_name: caseItem.client_name || "",
      case_number: caseItem.case_number || "",
      file_no: caseItem.file_no || "",
      case_type: caseItem.case_type || "",
      court: caseItem.court || "",
      lawyer: caseItem.lawyer || "",
      opponent_name: caseItem.opponent_name || "",
      status: caseItem.status || "",
      verdict: caseItem.verdict || "",
      notes: caseItem.notes || "",
      chamber: caseItem.chamber || clean(excelCase?.Chamber) || "",
      floor: caseItem.floor || clean(excelCase?.Floor) || "",
      jury_no: caseItem.jury_no || clean(excelCase?.JuryNo) || "",
      electronic_no:
        caseItem.electronic_no || clean(excelCase?.ElectronicNo) || "",
      case_start_date:
        caseItem.case_start_date || clean(excelCase?.CaseStartDate) || "",
      client_status:
        caseItem.client_status || clean(excelCase?.ClientStatus) || "",
      opponent_status:
        caseItem.opponent_status || clean(excelCase?.OpponentStatus) || "",
      old_verdict_date:
        caseItem.old_verdict_date || clean(excelCase?.VerdictDate) || "",
      old_verdict_result:
        caseItem.old_verdict_result || clean(excelCase?.VerdictResult) || "",
    });

    setEditing(false);
  }

  function openNoticeForm() {
    const todayStr = new Date().toISOString().split("T")[0];

    setNoticeForm({
      recipient_name: clean(caseItem?.opponent_name) || "",
      notice_date: todayStr,
      plaintiff_name: clean(caseItem?.client_name) || "",
      defendant_name: clean(caseItem?.opponent_name) || "",
      case_subject: clean(caseItem?.case_type) || "",
      verdict_date: todayStr,
      verdict_text: clean(caseItem?.verdict) || "",
      reference_no: "",
      additional_notes: "",
    });

    setShowNoticeForm(true);
  }

  function cancelNoticeForm() {
    setShowNoticeForm(false);
  }

  async function deleteNotice(noticeId) {
    const ok = confirm("هل تريد حذف هذا الإخطار نهائياً؟");
    if (!ok) return;

    const { error } = await supabase
      .from("notices")
      .delete()
      .eq("id", noticeId);

    if (error) {
      alert("خطأ أثناء حذف الإخطار: " + error.message);
      return;
    }

    await loadNotices();
  }

  function openSessionForm() {
    setSessionForm({
      session_date: "",
      session_time: "",
      location: "",
      hearing_type: "",
      lawyer: clean(caseItem?.lawyer) || "",
      notes: "",
    });
    setShowSessionForm(true);
  }

  function cancelSessionForm() {
    setShowSessionForm(false);
  }

  async function saveSession() {
    if (!sessionForm.session_date) {
      alert("اختر تاريخ الجلسة");
      return;
    }

    setSavingSession(true);

    const { error } = await supabase.from("sessions").insert([
      {
        case_id: id,
        file_no: caseItem?.file_no || "",
        client_name: caseItem?.client_name || "",
        session_date: sessionForm.session_date,
        session_time: sessionForm.session_time || "",
        location: sessionForm.location || "",
        hearing_type: sessionForm.hearing_type || "",
        lawyer: sessionForm.lawyer || "",
        notes: sessionForm.notes || "",
      },
    ]);

    setSavingSession(false);

    if (error) {
      alert("خطأ أثناء حفظ الجلسة: " + error.message);
      return;
    }

    setShowSessionForm(false);
    await loadCase();
  }

  async function deleteSession(sessionId) {
    const ok = confirm("هل تريد حذف هذه الجلسة نهائياً؟");
    if (!ok) return;

    const { error } = await supabase
      .from("sessions")
      .delete()
      .eq("id", sessionId);

    if (error) {
      alert("خطأ أثناء حذف الجلسة: " + error.message);
      return;
    }

    await loadCase();
  }

  function startEditSession(session) {
    setEditingSessionId(session.id);
    setSessionEditForm({
      session_date: session.session_date || "",
      session_time: session.session_time || "",
      location: session.location || "",
      hearing_type: session.hearing_type || "",
      lawyer: session.lawyer || "",
      notes: session.notes || "",
    });
  }

  function cancelEditSession() {
    setEditingSessionId(null);
    setSessionEditForm({});
  }

  async function saveEditSession(sessionId) {
    if (!sessionEditForm.session_date) {
      alert("اختر تاريخ الجلسة");
      return;
    }

    setSavingSessionEdit(true);

    const { error } = await supabase
      .from("sessions")
      .update({
        session_date: sessionEditForm.session_date,
        session_time: sessionEditForm.session_time || "",
        location: sessionEditForm.location || "",
        hearing_type: sessionEditForm.hearing_type || "",
        lawyer: sessionEditForm.lawyer || "",
        notes: sessionEditForm.notes || "",
      })
      .eq("id", sessionId);

    setSavingSessionEdit(false);

    if (error) {
      alert("خطأ أثناء حفظ تعديل الجلسة: " + error.message);
      return;
    }

    setEditingSessionId(null);
    await loadCase();
  }

  async function saveNotice() {
    if (!noticeForm.recipient_name?.trim()) {
      alert("اكتب اسم المرسل إليه (السادة)");
      return;
    }

    setSavingNotice(true);

    const { data, error } = await supabase
      .from("notices")
      .insert([
        {
          case_id: id,
          recipient_name: noticeForm.recipient_name?.trim() || "",
          notice_date: noticeForm.notice_date || null,
          plaintiff_name: noticeForm.plaintiff_name?.trim() || "",
          defendant_name: noticeForm.defendant_name?.trim() || "",
          case_subject: noticeForm.case_subject?.trim() || "",
          verdict_date: noticeForm.verdict_date || null,
          verdict_text: noticeForm.verdict_text?.trim() || "",
          reference_no: noticeForm.reference_no?.trim() || "",
          additional_notes: noticeForm.additional_notes?.trim() || "",
        },
      ])
      .select()
      .single();

    setSavingNotice(false);

    if (error) {
      alert("خطأ أثناء حفظ الإخطار: " + error.message);
      return;
    }

    setShowNoticeForm(false);
    await loadNotices();
    printNotice(data);
  }

  function runPrintFlow(onEnter, onExit) {
    document.body.classList.add("print-mode");

    let fallbackTimer;

    const exitPrint = () => {
      onExit();
      document.body.classList.remove("print-mode");
      window.removeEventListener("afterprint", exitPrint);
      clearTimeout(fallbackTimer);
      printExitRef.current = null;
    };

    printExitRef.current = exitPrint;

    onEnter();
    fallbackTimer = setTimeout(exitPrint, 10000);
    window.addEventListener("afterprint", exitPrint);

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        window.print();
      });
    });
  }

  function closePrintView() {
    if (printExitRef.current) {
      printExitRef.current();
    } else {
      setProfilePrintMode(false);
      setNoticeToPrint(null);
      document.body.classList.remove("print-mode");
    }
  }

  function printProfile() {
    runPrintFlow(
      () => setProfilePrintMode(true),
      () => setProfilePrintMode(false)
    );
  }

  function printNotice(notice) {
    runPrintFlow(
      () => setNoticeToPrint(notice),
      () => setNoticeToPrint(null)
    );
  }

  if (!caseItem) {
    return (
      <h2 style={{ textAlign: "center" }}>
        جاري تحميل ملف القضية...
      </h2>
    );
  }

  const clientName =
    clean(caseItem.client_name) ||
    clean(excelCase?.Client) ||
    "بدون اسم موكل";

  const caseNumber =
    clean(caseItem.case_number) ||
    clean(excelCase?.CourtCaseNo) ||
    "غير موجود";

  const fileNo =
    clean(caseItem.file_no) ||
    clean(excelCase?.FileNo) ||
    "غير موجود";

  const caseType =
    clean(caseItem.case_type) ||
    clean(excelCase?.LevelCaseType) ||
    clean(excelCase?.LevelType) ||
    "غير محدد";

  const court =
    clean(caseItem.court) ||
    clean(excelCase?.Court) ||
    "غير محددة";

  const status =
    clean(caseItem.file_status) ||
    clean(caseItem.status) ||
    clean(excelCase?.FileStatus) ||
    clean(excelCase?.CaseStatus) ||
    "غير محددة";

  const opponent =
    clean(caseItem.opponent_name) ||
    clean(excelCase?.OpponentStatus) ||
    "غير موجود";

  const verdict =
    clean(caseItem.verdict) ||
    clean(excelCase?.Verdict) ||
    "لا يوجد حكم مسجل";

  return (
    <div>
      <style>{`
        @media print {
          .notice-card,
          .print-letterhead {
            break-inside: avoid;
          }

          .no-print {
            display: none !important;
          }
        }

        .back-from-print-btn {
          display: block;
          margin: 0 0 16px auto;
          background: #374151;
          color: white;
          border: none;
          padding: 8px 18px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
        }

        .print-letterhead {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 3px solid #7c1c1c;
          padding-bottom: 12px;
          margin-bottom: 18px;
        }

        .print-letterhead img {
          height: 55px;
          object-fit: contain;
        }

        .print-letterhead .firm-name {
          text-align: right;
        }

        .print-letterhead .firm-name h2 {
          margin: 0;
          color: #7c1c1c;
          font-size: 18px;
        }

        .print-letterhead .firm-name p {
          margin: 2px 0 0 0;
          color: #666;
          font-size: 11px;
        }

        .notice-card {
          border: 2px solid #7c1c1c;
          border-radius: 12px;
          padding: 10px 20px;
        }

        .notice-title {
          color: #7c1c1c;
          font-weight: bold;
          font-size: 17px;
          text-align: center;
          margin-bottom: 10px;
        }

        .notice-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding: 10px 0;
          border-bottom: 1px dashed #ddd;
        }

        .notice-row:last-child {
          border-bottom: none;
        }

        .notice-label {
          background: #f3f3f3;
          border: 1px solid #ddd;
          border-radius: 6px;
          padding: 6px 14px;
          font-weight: bold;
          color: #7c1c1c;
          font-size: 13px;
          white-space: nowrap;
        }

        .notice-value {
          flex: 1;
          text-align: right;
          font-size: 14px;
          color: #222;
        }

        .notice-history-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          background: #f9f9f9;
          border-radius: 8px;
          padding: 10px 14px;
          margin-bottom: 8px;
          border-right: 3px solid #7c1c1c;
          flex-wrap: wrap;
        }

        .notice-history-item .btn-print-notice {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

        .notice-history-item .btn-delete {
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 14px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 12px;
        }

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

        .info-item b {
          display: block;
          color: #7c1c1c;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .info-item span {
          font-size: 14px;
          color: #333;
          white-space: pre-wrap;
        }

        .verdict-item {
          background: #fff8e8;
          border-right-color: #d99a00;
        }

        .verdict-item b {
          color: #9a6900;
        }

        .edit-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 15px;
        }

        .edit-field {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .edit-field label {
          font-size: 12px;
          color: #7c1c1c;
          font-weight: bold;
        }

        .edit-field input,
        .edit-field textarea,
        .edit-field select {
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

        .session-card div {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .upcoming-session {
          border-right: 3px solid #22c55e;
          background: #f0fff4;
        }

        .btn-edit {
          background: #f59e0b;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-notice {
          background: #7c1c1c;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-save {
          background: #22c55e;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-cancel {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .btn-delete {
          background: #991b1b;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
        }

        .case-level-links {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          margin: 0 0 15px;
        }

        .case-level-links a {
          background: #fef3c7;
          color: #92400e;
          border: 1px solid #fde68a;
          padding: 6px 14px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 13px;
          font-weight: bold;
        }

        @media (max-width: 800px) {
          .info-grid,
          .edit-grid,
          .session-card {
            grid-template-columns: 1fr;
          }

          .full-width {
            grid-column: span 1 !important;
          }

          .notice-row {
            flex-direction: column;
            align-items: flex-start;
          }

          .notice-value {
            text-align: right;
          }
        }
      `}</style>

      {profilePrintMode && (
        <div>
          <button
            type="button"
            className="back-from-print-btn no-print"
            onClick={closePrintView}
          >
            🔙 رجوع
          </button>

          <div className="print-letterhead">
            <div className="firm-name">
              <h2>مكتب أنس الحيدر</h2>
              <p>للمحاماة والاستشارات القانونية</p>
            </div>
            <img src="/logo.png" alt="logo" />
          </div>

          <h2 style={{ textAlign: "center", color: "#7c1c1c" }}>
            {clientName}
          </h2>

          <div className="info-grid">
            <div className="info-item">
              <b>رقم القضية</b>
              <span>{caseNumber}</span>
            </div>

            <div className="info-item">
              <b>رقم الملف</b>
              <span>{fileNo}</span>
            </div>

            <div className="info-item">
              <b>نوع القضية</b>
              <span>{caseType}</span>
            </div>

            <div className="info-item">
              <b>المحكمة</b>
              <span>{court}</span>
            </div>

            <div className="info-item">
              <b>الحالة</b>
              <span>{status}</span>
            </div>

            <div className="info-item">
              <b>المسؤول</b>
              <span>{clean(caseItem.lawyer) || "—"}</span>
            </div>

            <div className="info-item">
              <b>الخصم</b>
              <span>{opponent}</span>
            </div>

            <div
              className="info-item verdict-item full-width"
              style={{ gridColumn: "span 3" }}
            >
              <b>⚖️ الحكم</b>
              <span>{verdict}</span>
            </div>

            <div
              className="info-item full-width"
              style={{ gridColumn: "span 3" }}
            >
              <b>ملاحظات</b>
              <span>{clean(caseItem.notes) || "لا توجد"}</span>
            </div>
          </div>
        </div>
      )}

      {noticeToPrint && (
        <div>
          <button
            type="button"
            className="back-from-print-btn no-print"
            onClick={closePrintView}
          >
            🔙 رجوع
          </button>

          <div className="print-letterhead">
            <div className="firm-name">
              <h2>مكتب أنس الحيدر</h2>
              <p>للمحاماة والاستشارات القانونية</p>
            </div>
            <img src="/logo.png" alt="logo" />
          </div>

          <div className="notice-card">
            <div className="notice-title">إخطار بحكم المحكمة</div>

            <div className="notice-row">
              <span className="notice-label">التاريخ</span>
              <span className="notice-value">{noticeToPrint.notice_date || "—"}</span>
            </div>

            <div className="notice-row">
              <span className="notice-label">السادة</span>
              <span className="notice-value">{noticeToPrint.recipient_name || "—"}</span>
            </div>

            <div className="notice-row">
              <span className="notice-label">نفيدكم بأن القضية</span>
              <span className="notice-value">
                {caseNumber} {caseType ? `- ${caseType}` : ""}
              </span>
            </div>

            {noticeToPrint.reference_no && (
              <div className="notice-row">
                <span className="notice-label">الرقم الآلي</span>
                <span className="notice-value">{noticeToPrint.reference_no}</span>
              </div>
            )}

            <div className="notice-row">
              <span className="notice-label">المقامة من</span>
              <span className="notice-value">{noticeToPrint.plaintiff_name || "—"}</span>
            </div>

            <div className="notice-row">
              <span className="notice-label">ضد</span>
              <span className="notice-value">{noticeToPrint.defendant_name || "—"}</span>
            </div>

            <div className="notice-row">
              <span className="notice-label">موضوعها</span>
              <span className="notice-value">{noticeToPrint.case_subject || "—"}</span>
            </div>

            <div className="notice-row">
              <span className="notice-label">أمام محكمة</span>
              <span className="notice-value">{court}</span>
            </div>

            <div className="notice-row">
              <span className="notice-label">تاريخ الحكم</span>
              <span className="notice-value">{noticeToPrint.verdict_date || "—"}</span>
            </div>

            <div className="notice-row">
              <span className="notice-label">حكمت المحكمة</span>
              <span className="notice-value">{noticeToPrint.verdict_text || "—"}</span>
            </div>

            {noticeToPrint.additional_notes && (
              <div className="notice-row">
                <span className="notice-label">ملاحظات إضافية</span>
                <span className="notice-value">{noticeToPrint.additional_notes}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {!profilePrintMode && !noticeToPrint && (
        <>
          <section className="panel">
            <h1 style={{ textAlign: "center" }}>📂 ملف القضية</h1>

            <h2
              style={{
                textAlign: "center",
                color: "#7c1c1c",
              }}
            >
              {clientName}
            </h2>

            <div
              style={{
                display: "flex",
                gap: "10px",
                justifyContent: "center",
                flexWrap: "wrap",
                margin: "15px 0",
              }}
            >
              <Link to="/cases">
                <button type="button">⬅️ رجوع</button>
              </Link>

              {!editing && (
                <button
                  type="button"
                  className="btn-edit"
                  onClick={() => setEditing(true)}
                >
                  ✏️ تعديل وإضافة حكم
                </button>
              )}

              {editing && (
                <button
                  type="button"
                  className="btn-save"
                  onClick={saveEdit}
                >
                  💾 حفظ
                </button>
              )}

              {editing && (
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={cancelEdit}
                >
                  ❌ إلغاء
                </button>
              )}

              <button
                type="button"
                className="btn-notice"
                onClick={openNoticeForm}
              >
                📄 إصدار إخطار
              </button>

              <button
                type="button"
                onClick={printProfile}
              >
                🖨️ طباعة
              </button>

              {!editing && clean(caseItem.verdict) && (
                <button
                  type="button"
                  className="btn-notice"
                  onClick={createAppealCase}
                  disabled={creatingAppeal}
                >
                  {creatingAppeal
                    ? "جاري الإنشاء..."
                    : "➕ إضافة ملف استئناف"}
                </button>
              )}

              {!editing && (
                <button
                  type="button"
                  className="btn-delete"
                  onClick={deleteCase}
                >
                  🗑️ حذف القضية
                </button>
              )}
            </div>

            {(parentCase || childCases.length > 0) && (
              <div className="case-level-links">
                {parentCase && (
                  <Link to={`/cases/${parentCase.id}`}>
                    ⬅️ ملف الدرجة السابقة ({parentCase.case_number || parentCase.client_name})
                  </Link>
                )}

                {childCases.map((child) => (
                  <Link to={`/cases/${child.id}`} key={child.id}>
                    ➡️ ملف {child.case_level || "الاستئناف"} ({child.case_number || child.client_name})
                  </Link>
                ))}
              </div>
            )}

            {!editing && (
              <div className="info-grid">
                <div className="info-item">
                  <b>رقم القضية</b>
                  <span>{caseNumber}</span>
                </div>

                <div className="info-item">
                  <b>رقم الملف</b>
                  <span>{fileNo}</span>
                </div>

                <div className="info-item">
                  <b>نوع القضية</b>
                  <span>{caseType}</span>
                </div>

                <div className="info-item">
                  <b>المحكمة</b>
                  <span>{court}</span>
                </div>

                <div className="info-item">
                  <b>رقم القاعة</b>
                  <span>{clean(caseItem.chamber) || clean(excelCase?.Chamber) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>الدور</b>
                  <span>{clean(caseItem.floor) || clean(excelCase?.Floor) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>الرقم الآلي</b>
                  <span>{clean(caseItem.electronic_no) || clean(excelCase?.ElectronicNo) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>رقم الهيئة</b>
                  <span>{clean(caseItem.jury_no) || clean(excelCase?.JuryNo) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>بداية القضية</b>
                  <span>{clean(caseItem.case_start_date) || clean(excelCase?.CaseStartDate) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>نهاية القضية</b>
                  <span>{clean(excelCase?.CaseEndDate) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>الحالة</b>
                  <span>{status}</span>
                </div>

                <div className="info-item">
                  <b>صفة الموكل</b>
                  <span>{clean(caseItem.client_status) || clean(excelCase?.ClientStatus) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>صفة الخصم</b>
                  <span>{clean(caseItem.opponent_status) || clean(excelCase?.OpponentStatus) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>تاريخ الحكم القديم</b>
                  <span>{clean(caseItem.old_verdict_date) || clean(excelCase?.VerdictDate) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>نتيجة الحكم القديمة</b>
                  <span>{clean(caseItem.old_verdict_result) || clean(excelCase?.VerdictResult) || "—"}</span>
                </div>

                <div
                  className="info-item verdict-item full-width"
                  style={{ gridColumn: "span 3" }}
                >
                  <b>⚖️ الحكم</b>
                  <span>{verdict}</span>
                </div>

                <div className="info-item">
                  <b>المسؤول</b>
                  <span>{clean(caseItem.lawyer) || "—"}</span>
                </div>

                <div className="info-item">
                  <b>الخصم</b>
                  <span>{opponent}</span>
                </div>

                <div
                  className="info-item full-width"
                  style={{ gridColumn: "span 3" }}
                >
                  <b>ملاحظات</b>
                  <span>{clean(caseItem.notes) || "لا توجد"}</span>
                </div>
              </div>
            )}

            {editing && (
              <div className="edit-grid">
                <div className="edit-field">
                  <label>اسم الموكل</label>
                  <input
                    value={editForm.client_name || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        client_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>رقم القضية</label>
                  <input
                    value={editForm.case_number || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        case_number: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>رقم الملف</label>
                  <input
                    value={editForm.file_no || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        file_no: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>نوع القضية</label>
                  <input
                    value={editForm.case_type || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        case_type: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>المحكمة</label>
                  <input
                    value={editForm.court || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        court: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>المسؤول</label>
                  <input
                    value={editForm.lawyer || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        lawyer: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>الخصم</label>
                  <input
                    value={editForm.opponent_name || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        opponent_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>الحالة</label>
                  <select
                    value={editForm.status || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="">اختر الحالة</option>
                    <option value="متداولة">متداولة</option>
                    <option value="منتهية">منتهية</option>
                    <option value="التنفيذ">التنفيذ</option>
                    <option value="الحفظ">الحفظ</option>
                    <option value="موقوفة">موقوفة</option>
                    <option value="مؤرشفة">مؤرشفة</option>
                  </select>
                </div>

                <div className="edit-field">
                  <label>رقم القاعة</label>
                  <input
                    value={editForm.chamber || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        chamber: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>الدور</label>
                  <input
                    value={editForm.floor || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        floor: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>الرقم الآلي</label>
                  <input
                    value={editForm.electronic_no || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        electronic_no: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>رقم الهيئة</label>
                  <input
                    value={editForm.jury_no || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        jury_no: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>بداية القضية</label>
                  <input
                    value={editForm.case_start_date || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        case_start_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>صفة الموكل</label>
                  <input
                    value={editForm.client_status || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        client_status: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>صفة الخصم</label>
                  <input
                    value={editForm.opponent_status || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        opponent_status: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>تاريخ الحكم القديم</label>
                  <input
                    value={editForm.old_verdict_date || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        old_verdict_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>نتيجة الحكم القديمة</label>
                  <input
                    value={editForm.old_verdict_result || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        old_verdict_result: e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  className="edit-field full-width"
                  style={{ gridColumn: "span 2" }}
                >
                  <label>⚖️ الحكم</label>

                  <textarea
                    rows={5}
                    placeholder="اكتب منطوق الحكم أو تفاصيل الحكم هنا..."
                    value={editForm.verdict || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        verdict: e.target.value,
                      })
                    }
                  />
                </div>

                <div
                  className="edit-field full-width"
                  style={{ gridColumn: "span 2" }}
                >
                  <label>ملاحظات</label>

                  <textarea
                    rows={3}
                    value={editForm.notes || ""}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </section>

          <section className="panel">
            <h2>📄 الإخطارات ({notices.length})</h2>

            {showNoticeForm && (
              <div className="edit-grid">
                <div className="edit-field">
                  <label>السادة (المرسل إليه)</label>
                  <input
                    value={noticeForm.recipient_name || ""}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        recipient_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>تاريخ الإخطار</label>
                  <input
                    type="date"
                    value={noticeForm.notice_date || ""}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        notice_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>المقامة من</label>
                  <input
                    value={noticeForm.plaintiff_name || ""}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        plaintiff_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>ضد</label>
                  <input
                    value={noticeForm.defendant_name || ""}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        defendant_name: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>موضوع الدعوى</label>
                  <input
                    value={noticeForm.case_subject || ""}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        case_subject: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>تاريخ الحكم</label>
                  <input
                    type="date"
                    value={noticeForm.verdict_date || ""}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        verdict_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>الرقم الآلي (اختياري)</label>
                  <input
                    value={noticeForm.reference_no || ""}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        reference_no: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field full-width" style={{ gridColumn: "span 2" }}>
                  <label>حكمت المحكمة (نص الحكم)</label>
                  <textarea
                    rows={4}
                    value={noticeForm.verdict_text || ""}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        verdict_text: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field full-width" style={{ gridColumn: "span 2" }}>
                  <label>ملاحظات إضافية (اختياري)</label>
                  <textarea
                    rows={3}
                    value={noticeForm.additional_notes || ""}
                    onChange={(e) =>
                      setNoticeForm({
                        ...noticeForm,
                        additional_notes: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", gridColumn: "span 2" }}>
                  <button
                    type="button"
                    className="btn-save"
                    onClick={saveNotice}
                    disabled={savingNotice}
                  >
                    {savingNotice ? "جاري الحفظ..." : "💾 حفظ وإصدار"}
                  </button>

                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={cancelNoticeForm}
                  >
                    ❌ إلغاء
                  </button>
                </div>
              </div>
            )}

            {!showNoticeForm && notices.length === 0 && (
              <p className="empty">لا توجد إخطارات صادرة لهذه القضية</p>
            )}

            {!showNoticeForm &&
              notices.map((notice) => (
                <div className="notice-history-item" key={notice.id}>
                  <div>
                    <b>{notice.recipient_name || "بدون اسم"}</b>
                    {" — "}
                    {notice.notice_date || "بدون تاريخ"}
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      className="btn-print-notice"
                      onClick={() => printNotice(notice)}
                    >
                      🖨️ إعادة طباعة
                    </button>

                    <button
                      type="button"
                      className="btn-delete"
                      onClick={() => deleteNotice(notice.id)}
                    >
                      🗑️ حذف
                    </button>
                  </div>
                </div>
              ))}
          </section>

          <section className="panel">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              <h2>📅 جلسات القضية ({sessions.length})</h2>

              {!showSessionForm && (
                <button
                  type="button"
                  className="btn-notice"
                  onClick={openSessionForm}
                >
                  ➕ جلسة جديدة
                </button>
              )}
            </div>

            {showSessionForm && (
              <div className="edit-grid">
                <div className="edit-field">
                  <label>تاريخ الجلسة</label>
                  <input
                    type="date"
                    value={sessionForm.session_date || ""}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        session_date: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>وقت الجلسة</label>
                  <input
                    value={sessionForm.session_time || ""}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        session_time: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>المكان</label>
                  <input
                    value={sessionForm.location || ""}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        location: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>نوع الجلسة</label>
                  <input
                    value={sessionForm.hearing_type || ""}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        hearing_type: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field">
                  <label>المسؤول</label>
                  <input
                    value={sessionForm.lawyer || ""}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        lawyer: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="edit-field full-width" style={{ gridColumn: "span 2" }}>
                  <label>ملاحظات</label>
                  <textarea
                    rows={3}
                    value={sessionForm.notes || ""}
                    onChange={(e) =>
                      setSessionForm({
                        ...sessionForm,
                        notes: e.target.value,
                      })
                    }
                  />
                </div>

                <div style={{ display: "flex", gap: "10px", gridColumn: "span 2" }}>
                  <button
                    type="button"
                    className="btn-save"
                    onClick={saveSession}
                    disabled={savingSession}
                  >
                    {savingSession ? "جاري الحفظ..." : "💾 حفظ الجلسة"}
                  </button>

                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={cancelSessionForm}
                  >
                    ❌ إلغاء
                  </button>
                </div>
              </div>
            )}

            {!showSessionForm && sessions.length === 0 && (
              <p className="empty">
                لا توجد جلسات مرتبطة بهذه القضية
              </p>
            )}

            {!showSessionForm &&
              sessions.map((session) => {
                const today = new Date().toISOString().split("T")[0];

                const isUpcoming =
                  session.session_date &&
                  session.session_date >= today;

                if (editingSessionId === session.id) {
                  return (
                    <div className="edit-grid" key={session.id} style={{ marginBottom: "10px" }}>
                      <div className="edit-field">
                        <label>تاريخ الجلسة</label>
                        <input
                          type="date"
                          value={sessionEditForm.session_date || ""}
                          onChange={(e) =>
                            setSessionEditForm({
                              ...sessionEditForm,
                              session_date: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="edit-field">
                        <label>وقت الجلسة</label>
                        <input
                          value={sessionEditForm.session_time || ""}
                          onChange={(e) =>
                            setSessionEditForm({
                              ...sessionEditForm,
                              session_time: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="edit-field">
                        <label>المكان</label>
                        <input
                          value={sessionEditForm.location || ""}
                          onChange={(e) =>
                            setSessionEditForm({
                              ...sessionEditForm,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="edit-field">
                        <label>نوع الجلسة</label>
                        <input
                          value={sessionEditForm.hearing_type || ""}
                          onChange={(e) =>
                            setSessionEditForm({
                              ...sessionEditForm,
                              hearing_type: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="edit-field">
                        <label>المسؤول</label>
                        <input
                          value={sessionEditForm.lawyer || ""}
                          onChange={(e) =>
                            setSessionEditForm({
                              ...sessionEditForm,
                              lawyer: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="edit-field full-width" style={{ gridColumn: "span 2" }}>
                        <label>ملاحظات</label>
                        <textarea
                          rows={3}
                          value={sessionEditForm.notes || ""}
                          onChange={(e) =>
                            setSessionEditForm({
                              ...sessionEditForm,
                              notes: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div style={{ display: "flex", gap: "10px", gridColumn: "span 2" }}>
                        <button
                          type="button"
                          className="btn-save"
                          onClick={() => saveEditSession(session.id)}
                          disabled={savingSessionEdit}
                        >
                          {savingSessionEdit ? "جاري الحفظ..." : "💾 حفظ"}
                        </button>

                        <button
                          type="button"
                          className="btn-cancel"
                          onClick={cancelEditSession}
                        >
                          ❌ إلغاء
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    className={`session-card ${
                      isUpcoming ? "upcoming-session" : ""
                    }`}
                    key={session.id}
                  >
                    <div>
                      <b>📅 التاريخ</b>
                      <span>{session.session_date || "—"}</span>
                    </div>

                    <div>
                      <b>🕐 الوقت</b>
                      <span>{clean(session.session_time) || "—"}</span>
                    </div>

                    <div>
                      <b>📍 المكان</b>
                      <span>{clean(session.location) || "—"}</span>
                    </div>

                    <div>
                      <b>نوع الجلسة</b>
                      <span>{clean(session.hearing_type) || "—"}</span>
                    </div>

                    <div>
                      <b>المسؤول</b>
                      <span>{clean(session.lawyer) || "—"}</span>
                    </div>

                    <div>
                      <b>ملاحظات</b>
                      <span>{clean(session.notes) || "—"}</span>
                    </div>

                    <div style={{ flexDirection: "row", gap: "8px" }}>
                      <b> </b>
                      <button
                        type="button"
                        className="btn-edit"
                        onClick={() => startEditSession(session)}
                      >
                        ✏️ تعديل
                      </button>

                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => deleteSession(session.id)}
                      >
                        🗑️ حذف
                      </button>
                    </div>
                  </div>
                );
              })}
          </section>
        </>
      )}
    </div>
  );
}

export default CaseProfile;
