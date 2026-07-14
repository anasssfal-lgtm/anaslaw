import { useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase";

function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [groupBy, setGroupBy] = useState("date");
  const [loading, setLoading] = useState(true);

  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionResult, setSessionResult] = useState("");
  const [savingResult, setSavingResult] = useState(false);

  function getKuwaitDate(daysToAdd = 0) {
    const now = new Date();

    const kuwaitParts = new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Kuwait",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).formatToParts(now);

    const year = Number(
      kuwaitParts.find((part) => part.type === "year")?.value
    );

    const month = Number(
      kuwaitParts.find((part) => part.type === "month")?.value
    );

    const day = Number(
      kuwaitParts.find((part) => part.type === "day")?.value
    );

    const date = new Date(Date.UTC(year, month - 1, day));
    date.setUTCDate(date.getUTCDate() + daysToAdd);

    return [
      date.getUTCFullYear(),
      String(date.getUTCMonth() + 1).padStart(2, "0"),
      String(date.getUTCDate()).padStart(2, "0"),
    ].join("-");
  }

  function normalizeDate(value) {
    if (!value) return "";

    const text = String(value).trim();

    // 2026-07-14 أو 2026-07-14T...
    const yearFirst = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);

    if (yearFirst) {
      const [, year, month, day] = yearFirst;

      return `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    }

    // 14-07-2026 أو 14/07/2026
    const dayFirst = text.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);

    if (dayFirst) {
      const [, day, month, year] = dayFirst;

      return `${year}-${String(month).padStart(2, "0")}-${String(
        day
      ).padStart(2, "0")}`;
    }

    return "";
  }

  const today = getKuwaitDate(0);
  const tomorrow = getKuwaitDate(1);
  const nextWeek = getKuwaitDate(7);

  useEffect(() => {
    getSessions();
  }, []);

  async function getSessions() {
    setLoading(true);

    const { data, error } = await supabase
      .from("sessions")
      .select(`
        *,
        cases(
          id,
          client_name,
          case_number,
          case_type,
          court,
          lawyer,
          opponent_name,
          file_no,
          notes,
          status,
          verdict
        )
      `)
      .order("session_date", { ascending: true });

    setLoading(false);

    if (error) {
      alert("خطأ في جلب الجلسات: " + error.message);
      return;
    }

    setSessions(data || []);
  }

  function openSession(item) {
    setSelectedSession(item);
    setSessionResult(item.session_result || "");
  }

  function closeSession() {
    setSelectedSession(null);
    setSessionResult("");
  }

  async function saveSessionResult() {
    if (!selectedSession) return;

    setSavingResult(true);

    const cleanResult = sessionResult.trim();

    const { error } = await supabase
      .from("sessions")
      .update({ session_result: cleanResult })
      .eq("id", selectedSession.id);

    setSavingResult(false);

    if (error) {
      alert("خطأ أثناء حفظ قرار الجلسة: " + error.message);
      return;
    }

    setSessions((currentSessions) =>
      currentSessions.map((session) =>
        session.id === selectedSession.id
          ? { ...session, session_result: cleanResult }
          : session
      )
    );

    setSelectedSession((currentSession) => ({
      ...currentSession,
      session_result: cleanResult,
    }));

    alert("تم حفظ قرار الجلسة بنجاح ✅");
  }

  const filteredSessions = useMemo(() => {
    const normalizedFrom = normalizeDate(fromDate);
    const normalizedTo = normalizeDate(toDate);
    const normalizedSearch = search.trim().toLowerCase();

    return sessions.filter((item) => {
      const sessionDate = normalizeDate(item.session_date);

      const searchableText = `
        ${item.cases?.client_name || item.client_name || ""}
        ${item.cases?.case_number || ""}
        ${item.cases?.case_type || ""}
        ${item.cases?.court || ""}
        ${item.location || ""}
        ${item.notes || ""}
        ${item.session_result || ""}
        ${item.lawyer || item.cases?.lawyer || ""}
        ${item.hearing_type || ""}
        ${item.cases?.file_no || item.file_no || ""}
        ${item.cases?.opponent_name || ""}
      `.toLowerCase();

      const matchesSearch =
        !normalizedSearch || searchableText.includes(normalizedSearch);

      const matchesFrom =
        !normalizedFrom || (sessionDate && sessionDate >= normalizedFrom);

      const matchesTo =
        !normalizedTo || (sessionDate && sessionDate <= normalizedTo);

      return matchesSearch && matchesFrom && matchesTo;
    });
  }, [sessions, search, fromDate, toDate]);

  function getGroupName(session) {
    if (groupBy === "court") {
      return (
        session.cases?.court ||
        session.location ||
        "محكمة غير محددة"
      );
    }

    if (groupBy === "client") {
      return (
        session.cases?.client_name ||
        session.client_name ||
        "موكل غير محدد"
      );
    }

    if (groupBy === "lawyer") {
      return (
        session.lawyer ||
        session.cases?.lawyer ||
        "محامٍ غير محدد"
      );
    }

    return normalizeDate(session.session_date) || "بدون تاريخ";
  }

  const groupedSessions = useMemo(() => {
    return filteredSessions.reduce((groups, session) => {
      const groupName = getGroupName(session);

      if (!groups[groupName]) {
        groups[groupName] = [];
      }

      groups[groupName].push(session);

      return groups;
    }, {});
  }, [filteredSessions, groupBy]);

  const todaySessions = sessions.filter(
    (session) => normalizeDate(session.session_date) === today
  );

  const tomorrowSessions = sessions.filter(
    (session) => normalizeDate(session.session_date) === tomorrow
  );

  const weekSessions = sessions.filter((session) => {
    const sessionDate = normalizeDate(session.session_date);

    return (
      sessionDate &&
      sessionDate >= today &&
      sessionDate <= nextWeek
    );
  });

  function formatDate(dateString) {
    const normalized = normalizeDate(dateString);

    if (!normalized) return "بدون تاريخ";

    const date = new Date(`${normalized}T00:00:00`);

    const dayName = new Intl.DateTimeFormat("ar-KW", {
      weekday: "long",
      timeZone: "Asia/Kuwait",
    }).format(date);

    return `${dayName} ${normalized}`;
  }

  function getGroupTitle(groupName) {
    if (groupBy === "date") {
      return formatDate(groupName);
    }

    if (groupBy === "court") {
      return `🏛️ المحكمة: ${groupName}`;
    }

    if (groupBy === "client") {
      return `👤 الموكل: ${groupName}`;
    }

    return `⚖️ المحامي: ${groupName}`;
  }

  function showToday() {
    setFromDate(today);
    setToDate(today);
  }

  function showTomorrow() {
    setFromDate(tomorrow);
    setToDate(tomorrow);
  }

  function showWeek() {
    setFromDate(today);
    setToDate(nextWeek);
  }

  function showAll() {
    setFromDate("");
    setToDate("");
  }

  function printSessions() {
    window.print();
  }

  return (
    <div>
      <style>{`
        @media print {
          nav,
          .no-print,
          .session-modal-overlay {
            display: none !important;
          }

          .panel {
            box-shadow: none !important;
          }

          .print-header {
            display: block !important;
            text-align: center;
            margin-bottom: 20px;
          }
        }

        .print-header {
          display: none;
        }

        .group-header {
          background: #7c1c1c;
          color: white;
          padding: 10px 15px;
          font-weight: bold;
          font-size: 15px;
          margin-top: 18px;
          border-radius: 8px 8px 0 0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
        }

        .today-badge {
          background: #22c55e;
          color: white;
          padding: 2px 8px;
          border-radius: 10px;
          font-size: 12px;
          margin-right: 8px;
        }

        .sessions-table {
          width: 100%;
          border-collapse: collapse;
          direction: rtl;
        }

        .sessions-table th {
          background: #f5f5f5;
          padding: 10px;
          text-align: center;
          border: 1px solid #ddd;
          white-space: nowrap;
        }

        .sessions-table td {
          padding: 9px 10px;
          border: 1px solid #eee;
          text-align: center;
          vertical-align: middle;
        }

        .sessions-table tbody tr {
          cursor: pointer;
        }

        .sessions-table tbody tr:hover {
          background: #fff7f7;
        }

        .table-box {
          overflow-x: auto;
          border: 1px solid #eee;
          border-top: none;
          border-radius: 0 0 8px 8px;
        }

        .filter-btns {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 12px;
        }

        .filter-btn {
          padding: 9px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
          background: #eee;
          color: #333;
          font-family: inherit;
        }

        .filter-btn.active {
          background: #7c1c1c;
          color: white;
        }

        .filter-btn.print-btn {
          background: #1d4ed8;
          color: white;
        }

        .result-ready {
          color: #166534;
          font-weight: bold;
        }

        .result-empty {
          color: #999;
        }

        .session-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.55);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          z-index: 9999;
        }

        .session-modal {
          width: min(900px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 16px;
          padding: 22px;
          direction: rtl;
        }

        .session-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #eee;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }

        .close-btn {
          border: none;
          background: #ef4444;
          color: white;
          border-radius: 8px;
          padding: 8px 14px;
          cursor: pointer;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .detail-item {
          background: #f8f8f8;
          border-right: 3px solid #7c1c1c;
          border-radius: 8px;
          padding: 11px;
        }

        .detail-item b {
          display: block;
          color: #7c1c1c;
          font-size: 12px;
          margin-bottom: 5px;
        }

        .result-editor {
          background: #fff8e8;
          border: 1px solid #f0d58c;
          border-radius: 12px;
          padding: 15px;
        }

        .result-editor textarea {
          width: 100%;
          min-height: 140px;
          padding: 12px;
          border: 1px solid #d9c27e;
          border-radius: 8px;
          font-family: inherit;
          box-sizing: border-box;
        }

        .save-result-btn {
          margin-top: 10px;
          background: #16a34a;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 18px;
          cursor: pointer;
        }

        @media (max-width: 800px) {
          .details-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div className="print-header">
        <h2>⚖️ مكتب أنس الحيدر للمحاماة</h2>
        <h3>
          رول الجلسات — {fromDate || "الكل"} إلى {toDate || "الكل"}
        </h3>
      </div>

      <section className="panel no-print">
        <h1 style={{ textAlign: "center" }}>📅 رول الجلسات</h1>

        <div className="dashboard">
          <div className="stat blue">
            <h3>{sessions.length}</h3>
            <p>كل الجلسات</p>
          </div>

          <div className="stat green">
            <h3>{todaySessions.length}</h3>
            <p>جلسات اليوم</p>
          </div>

          <div className="stat yellow">
            <h3>{tomorrowSessions.length}</h3>
            <p>جلسات الغد</p>
          </div>

          <div className="stat purple">
            <h3>{weekSessions.length}</h3>
            <p>جلسات الأسبوع</p>
          </div>
        </div>
      </section>

      <section className="panel no-print">
        <h2>طريقة عرض الرول</h2>

        <div className="filter-btns">
          <button
            className={`filter-btn ${groupBy === "date" ? "active" : ""}`}
            onClick={() => setGroupBy("date")}
          >
            📅 حسب التاريخ
          </button>

          <button
            className={`filter-btn ${groupBy === "court" ? "active" : ""}`}
            onClick={() => setGroupBy("court")}
          >
            🏛️ حسب المحكمة
          </button>

          <button
            className={`filter-btn ${groupBy === "client" ? "active" : ""}`}
            onClick={() => setGroupBy("client")}
          >
            👤 حسب الموكل
          </button>

          <button
            className={`filter-btn ${groupBy === "lawyer" ? "active" : ""}`}
            onClick={() => setGroupBy("lawyer")}
          >
            ⚖️ حسب المحامي
          </button>
        </div>

        <h2>التصفية</h2>

        <div className="filter-btns">
          <button className="filter-btn" onClick={showToday}>
            📅 اليوم
          </button>

          <button className="filter-btn" onClick={showTomorrow}>
            📅 الغد
          </button>

          <button className="filter-btn" onClick={showWeek}>
            📅 الأسبوع
          </button>

          <button className="filter-btn" onClick={showAll}>
            🔄 الكل
          </button>

          <button className="filter-btn print-btn" onClick={printSessions}>
            🖨️ طباعة / PDF
          </button>
        </div>

        <div
          style={{
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <input
            type="date"
            value={fromDate}
            onChange={(event) => setFromDate(event.target.value)}
          />

          <span>إلى</span>

          <input
            type="date"
            value={toDate}
            onChange={(event) => setToDate(event.target.value)}
          />

          <input
            placeholder="🔍 بحث..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </section>

      <section className="panel">
        <p>عدد الجلسات: {filteredSessions.length}</p>

        {loading && <p style={{ textAlign: "center" }}>جاري تحميل الجلسات...</p>}

        {!loading &&
          Object.keys(groupedSessions)
            .sort()
            .map((groupName) => (
              <div key={groupName}>
                <div className="group-header">
                  <span>
                    {getGroupTitle(groupName)}

                    {groupBy === "date" && groupName === today && (
                      <span className="today-badge">اليوم</span>
                    )}
                  </span>

                  <span>{groupedSessions[groupName].length} جلسة</span>
                </div>

                <div className="table-box">
                  <table className="sessions-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>التاريخ</th>
                        <th>الوقت</th>
                        <th>الموكل</th>
                        <th>رقم القضية</th>
                        <th>المحكمة</th>
                        <th>نوع الجلسة</th>
                        <th>المسؤول</th>
                        <th>رقم الملف</th>
                        <th>قرار الجلسة</th>
                      </tr>
                    </thead>

                    <tbody>
                      {groupedSessions[groupName].map((item, index) => (
                        <tr
                          key={item.id}
                          onClick={() => openSession(item)}
                        >
                          <td>{index + 1}</td>
                          <td>{normalizeDate(item.session_date) || "—"}</td>
                          <td>{item.session_time || "—"}</td>
                          <td>
                            {item.cases?.client_name ||
                              item.client_name ||
                              "—"}
                          </td>
                          <td>{item.cases?.case_number || "—"}</td>
                          <td>
                            {item.cases?.court ||
                              item.location ||
                              "—"}
                          </td>
                          <td>{item.hearing_type || "—"}</td>
                          <td>
                            {item.lawyer ||
                              item.cases?.lawyer ||
                              "—"}
                          </td>
                          <td>
                            {item.cases?.file_no ||
                              item.file_no ||
                              "—"}
                          </td>
                          <td>
                            {item.session_result ? (
                              <span className="result-ready">
                                {item.session_result}
                              </span>
                            ) : (
                              <span className="result-empty">
                                اضغط لإضافة القرار
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

        {!loading && filteredSessions.length === 0 && (
          <p style={{ textAlign: "center", padding: "30px" }}>
            لا توجد جلسات في هذه الفترة
          </p>
        )}
      </section>

      {selectedSession && (
        <div className="session-modal-overlay" onClick={closeSession}>
          <div
            className="session-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="session-modal-header">
              <div>
                <h2>📂 تفاصيل الجلسة</h2>
                <p>
                  {selectedSession.cases?.client_name ||
                    selectedSession.client_name ||
                    "بدون اسم موكل"}
                </p>
              </div>

              <button className="close-btn" onClick={closeSession}>
                إغلاق ✕
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <b>تاريخ الجلسة</b>
                <span>{normalizeDate(selectedSession.session_date) || "—"}</span>
              </div>

              <div className="detail-item">
                <b>وقت الجلسة</b>
                <span>{selectedSession.session_time || "—"}</span>
              </div>

              <div className="detail-item">
                <b>مكان الجلسة</b>
                <span>{selectedSession.location || "—"}</span>
              </div>

              <div className="detail-item">
                <b>اسم الموكل</b>
                <span>
                  {selectedSession.cases?.client_name ||
                    selectedSession.client_name ||
                    "—"}
                </span>
              </div>

              <div className="detail-item">
                <b>رقم القضية</b>
                <span>{selectedSession.cases?.case_number || "—"}</span>
              </div>

              <div className="detail-item">
                <b>رقم الملف</b>
                <span>
                  {selectedSession.cases?.file_no ||
                    selectedSession.file_no ||
                    "—"}
                </span>
              </div>

              <div className="detail-item">
                <b>المحكمة</b>
                <span>{selectedSession.cases?.court || "—"}</span>
              </div>

              <div className="detail-item">
                <b>نوع الجلسة</b>
                <span>{selectedSession.hearing_type || "—"}</span>
              </div>

              <div className="detail-item">
                <b>المسؤول</b>
                <span>
                  {selectedSession.lawyer ||
                    selectedSession.cases?.lawyer ||
                    "—"}
                </span>
              </div>

              <div className="detail-item">
                <b>ملاحظات الجلسة</b>
                <span>{selectedSession.notes || "—"}</span>
              </div>
            </div>

            <div className="result-editor">
              <label>⚖️ قرار الجلسة</label>

              <textarea
                value={sessionResult}
                onChange={(event) =>
                  setSessionResult(event.target.value)
                }
                placeholder="اكتب قرار الجلسة..."
              />

              <button
                className="save-result-btn"
                onClick={saveSessionResult}
                disabled={savingResult}
              >
                {savingResult
                  ? "جاري الحفظ..."
                  : "💾 حفظ قرار الجلسة"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Sessions;