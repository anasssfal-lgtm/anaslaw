import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function LawsuitTemplate() {
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    return () => document.body.classList.remove("print-mode");
  }, []);

  const [form, setForm] = useState({
    lawyer: "",
    plaintiff_name: "",
    plaintiff_nationality: "",
    plaintiff_civil_id: "",
    plaintiff_email: "",
    defendant_name: "",
    defendant_nationality: "",
    defendant_civil_id: "",
    address_block: "",
    address_street: "",
    address_parcel: "",
    address_electronic_no: "",
    court: "",
    circuit: "",
    session_day: "",
    session_date: "",
    claims: "",
  });

  function set(field, value) {
    setForm({ ...form, [field]: value });
  }

  function printPage() {
    document.body.classList.add("print-mode");
    setPrintMode(true);

    const exitPrint = () => {
      setPrintMode(false);
      document.body.classList.remove("print-mode");
      window.removeEventListener("afterprint", exitPrint);
    };

    window.addEventListener("afterprint", exitPrint);
    setTimeout(() => window.print(), 100);
  }

  function closePrint() {
    setPrintMode(false);
    document.body.classList.remove("print-mode");
  }

  return (
    <div>
      <style>{`
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

        @media (max-width: 800px) {
          .edit-grid {
            grid-template-columns: 1fr;
          }
        }

        .lawsuit-print-btn {
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

        @media print {
          .no-print {
            display: none !important;
          }
        }

        .lawsuit-doc {
          text-align: right;
          direction: rtl;
          line-height: 2;
          font-size: 15px;
        }

        .lawsuit-doc .center {
          text-align: center;
        }

        .lawsuit-doc .bold {
          font-weight: bold;
        }

        .lawsuit-doc .underline {
          text-decoration: underline;
        }

        .lawsuit-doc .section {
          margin: 18px 0;
        }
      `}</style>

      {!printMode && (
        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h1>📄 صحيفة دعوى</h1>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/templates">
                <button type="button">⬅️ رجوع</button>
              </Link>
              <button type="button" onClick={printPage}>
                🖨️ طباعة
              </button>
            </div>
          </div>

          <div className="edit-grid">
            <div className="edit-field">
              <label>المحامي الوكيل</label>
              <input
                value={form.lawyer}
                onChange={(e) => set("lawyer", e.target.value)}
                placeholder="أنس فيصل الحيدر"
              />
            </div>

            <div className="edit-field">
              <label>اسم المدعي</label>
              <input
                value={form.plaintiff_name}
                onChange={(e) => set("plaintiff_name", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>جنسية المدعي</label>
              <input
                value={form.plaintiff_nationality}
                onChange={(e) => set("plaintiff_nationality", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>الرقم المدني للمدعي</label>
              <input
                value={form.plaintiff_civil_id}
                onChange={(e) => set("plaintiff_civil_id", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>البريد الإلكتروني للمدعي</label>
              <input
                value={form.plaintiff_email}
                onChange={(e) => set("plaintiff_email", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>اسم المدعى عليه</label>
              <input
                value={form.defendant_name}
                onChange={(e) => set("defendant_name", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>جنسية المدعى عليه</label>
              <input
                value={form.defendant_nationality}
                onChange={(e) => set("defendant_nationality", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>الرقم المدني للمدعى عليه</label>
              <input
                value={form.defendant_civil_id}
                onChange={(e) => set("defendant_civil_id", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>قطعة (عنوان الإعلان)</label>
              <input
                value={form.address_block}
                onChange={(e) => set("address_block", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>شارع (عنوان الإعلان)</label>
              <input
                value={form.address_street}
                onChange={(e) => set("address_street", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>قسيمة (عنوان الإعلان)</label>
              <input
                value={form.address_parcel}
                onChange={(e) => set("address_parcel", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>الرقم الآلي للعنوان</label>
              <input
                value={form.address_electronic_no}
                onChange={(e) => set("address_electronic_no", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>المحكمة</label>
              <input
                value={form.court}
                onChange={(e) => set("court", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>الدائرة</label>
              <input
                value={form.circuit}
                onChange={(e) => set("circuit", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>يوم الجلسة</label>
              <input
                value={form.session_day}
                onChange={(e) => set("session_day", e.target.value)}
                placeholder="مثال: الأحد"
              />
            </div>

            <div className="edit-field">
              <label>تاريخ الجلسة</label>
              <input
                type="date"
                value={form.session_date}
                onChange={(e) => set("session_date", e.target.value)}
              />
            </div>

            <div className="edit-field full-width" style={{ gridColumn: "span 2" }}>
              <label>موضوع الدعوى / الطلبات (ثانياً)</label>
              <textarea
                rows={6}
                value={form.claims}
                onChange={(e) => set("claims", e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {printMode && (
        <div>
          <button type="button" className="lawsuit-print-btn no-print" onClick={closePrint}>
            🔙 رجوع
          </button>

          <div className="print-letterhead">
            <div className="firm-name">
              <h2>مكتب أنس الحيدر وطلال الشطي</h2>
              <p>محامون ومستشارون قانونيون</p>
            </div>
            <img src="/logo.png" alt="logo" />
          </div>

          <div className="lawsuit-doc">
            <p className="center bold">وكيل المدعي: {form.lawyer || "—"}</p>
            <p className="center bold">المحامي</p>

            <h2 className="center">صحيفة دعوى</h2>

            <p>
              إنه في يوم: {form.session_day || "..........."} الموافق{" "}
              {form.session_date || ".../.../2026"} الساعة: ...........
            </p>

            <p>
              بناءً على طلب <b>السيد /</b> {form.plaintiff_name || "..........."} -{" "}
              {form.plaintiff_nationality || "الجنسية"} - ب.م (
              {form.plaintiff_civil_id || "......"}).
            </p>

            <p>البريد الإلكتروني: {form.plaintiff_email || "..........."}</p>

            <p className="bold">
              ومحله المختار مكتب المحاميان / طلال عبد اللطيف الشطي &amp; أنس فيصل
              الحيدر - الكائن في: بنيد القار - قطعة 3 - مجمع ديما - الدور 10 -
              مكتب 35.
            </p>

            <p>أنا / مندوب الإعلان بوزارة العدل انتقلت إلى حيث أعلنت: -</p>

            <p className="bold">
              1. السيد / {form.defendant_name || "..........."} -{" "}
              {form.defendant_nationality || "الجنسية"} - ب.م (
              {form.defendant_civil_id || "......"}).
            </p>

            <p>
              <span className="underline bold">ويعلن في:</span> - قطعة{" "}
              {form.address_block || "( )"} - شارع {form.address_street || "( )"} -
              قسيمة {form.address_parcel || "( )"} - الرقم الآلي للعنوان (
              {form.address_electronic_no || " "}).
            </p>

            <p className="bold underline">مخاطباً مع:-</p>

            <div className="section">
              <p className="underline bold">بناءً عليه</p>
              <p>
                أنا مندوب الإعلان سالف الذكر انتقلت وأعلنت المعلن إليهما وسلمتهما
                صورة من هذه الصحيفة وكلفتهما بالحضور لمقر محكمة{" "}
                {form.court || "................"} دائرة{" "}
                {form.circuit || "................"} وذلك بجلستها التي ستنعقد
                علناً في صباح يوم {form.session_day || "................"}{" "}
                الموافق {form.session_date || ".../.../2026"} في تمام الساعة
                الثامنة صباحاً وما بعدها لسماع الحكم بالآتي: -
              </p>
            </div>

            <p>
              <span className="underline bold">أولاً:</span> بقبول الدعوى شكلاً.
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>
              <span className="underline bold">ثانياً:</span>{" "}
              {form.claims || "—"}
            </p>

            <p className="bold" style={{ marginTop: "30px" }}>
              ولأجل العلم ،،،
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default LawsuitTemplate;
