import { useState } from "react";
import { Link } from "react-router-dom";

function AmrAdaaTemplate() {
  const [printMode, setPrintMode] = useState(false);

  const [form, setForm] = useState({
    lawyer: "",
    judge_court: "",
    applicant_name: "",
    applicant_nationality: "",
    applicant_civil_id: "",
    defendant_name: "",
    defendant_nationality: "",
    defendant_civil_id: "",
    address_block: "",
    address_street: "",
    address_building: "",
    address_electronic_no: "",
    facts: "",
    amount: "",
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

        .template-print-btn {
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
          .page-break {
            page-break-before: always;
          }
        }

        .template-doc {
          text-align: right;
          direction: rtl;
          line-height: 2;
          font-size: 15px;
        }

        .template-doc .center {
          text-align: center;
        }

        .template-doc .bold {
          font-weight: bold;
        }

        .template-doc .underline {
          text-decoration: underline;
        }

        .template-doc .section {
          margin: 18px 0;
        }
      `}</style>

      {!printMode && (
        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h1>📄 طلب استصدار أمر أداء</h1>
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
              <label>محكمة القاضي المرفوع أمامه الطلب</label>
              <input
                value={form.judge_court}
                onChange={(e) => set("judge_court", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>اسم الطالب (الدائن)</label>
              <input
                value={form.applicant_name}
                onChange={(e) => set("applicant_name", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>جنسية الطالب</label>
              <input
                value={form.applicant_nationality}
                onChange={(e) => set("applicant_nationality", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>الرقم المدني للطالب</label>
              <input
                value={form.applicant_civil_id}
                onChange={(e) => set("applicant_civil_id", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>اسم المقدم ضده (المدين)</label>
              <input
                value={form.defendant_name}
                onChange={(e) => set("defendant_name", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>جنسية المقدم ضده</label>
              <input
                value={form.defendant_nationality}
                onChange={(e) => set("defendant_nationality", e.target.value)}
              />
            </div>

            <div className="edit-field">
              <label>الرقم المدني للمقدم ضده</label>
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
              <label>مبنى (عنوان الإعلان)</label>
              <input
                value={form.address_building}
                onChange={(e) => set("address_building", e.target.value)}
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
              <label>المبلغ المطلوب (د.ك)</label>
              <input
                value={form.amount}
                onChange={(e) => set("amount", e.target.value)}
              />
            </div>

            <div className="edit-field full-width" style={{ gridColumn: "span 2" }}>
              <label>عرض الوقائع والأسباب</label>
              <textarea
                rows={6}
                value={form.facts}
                onChange={(e) => set("facts", e.target.value)}
              />
            </div>
          </div>
        </section>
      )}

      {printMode && (
        <div>
          <button type="button" className="template-print-btn no-print" onClick={closePrint}>
            🔙 رجوع
          </button>

          <div className="print-letterhead">
            <div className="firm-name">
              <h2>مكتب أنس الحيدر وطلال الشطي</h2>
              <p>محامون ومستشارون قانونيون</p>
            </div>
            <img src="/logo.png" alt="logo" />
          </div>

          <div className="template-doc">
            <h2 className="center underline">طلب استصدار أمر أداء</h2>

            <p className="bold">
              السيد المستشار / قاضي محكمة {form.judge_court || "................"}{" "}
              المحترم ،،،
            </p>
            <p>تحية طيبة و بعد ،،،</p>

            <p className="bold">
              مقدمة لسيادتك {form.applicant_name || "..........."} - الجنسية{" "}
              {form.applicant_nationality || "......"} / بطاقة مدنية رقم (
              {form.applicant_civil_id || "......"}) ـ
            </p>

            <p className="bold">
              ومحله المختار مكتب المحاميان / طلال عبد اللطيف الشطي &amp; أنس فيصل
              الحيدر ـ والكائن في: بنيد القار ـ قطعة 3 ـ مجمع ديما ـ الدور
              العاشر ـ مكتب 35.
            </p>

            <p className="bold underline">ضد</p>

            <p className="bold">
              السيد / {form.defendant_name || "..........."} - الجنسية{" "}
              {form.defendant_nationality || "......"} - ب.م (
              {form.defendant_civil_id || "......"}) - ويعلن في: - قطعة{" "}
              {form.address_block || "( )"} - شارع{" "}
              {form.address_street || "( )"} - مبنى{" "}
              {form.address_building || "( )"} - الرقم الآلي للعنوان (
              {form.address_electronic_no || " "}).
            </p>

            <p className="bold underline">نتشرف بعرض الآتي: ـ</p>
            <p style={{ whiteSpace: "pre-wrap" }}>{form.facts || "—"}</p>

            <p className="bold center" style={{ marginTop: "30px" }}>
              الطالب
            </p>

            <div className="page-break" />

            <h2 className="center bold">وزارة العدل</h2>
            <p className="center bold">باسم صاحب السمو أمير دولة الكويت</p>
            <p className="center bold">أمر أداء رقم / 2026</p>

            <p className="bold">
              نأمر نحن / .......................................... قاضي
              محكمة الجزئية
            </p>

            <p>
              بعد الإطلاع على هذا الطلب وعلى المستندات المرفقة، وعملاً بنص
              المواد 166، 167، 168 من قانون المرافعات المدنية والتجارية.
            </p>

            <p>نأمر المقدم ضده السيد / {form.defendant_name || "..........."}.</p>

            <p>
              بأن يؤدي إلى الطالب / مبلغ ({form.amount || "......"} د.ك)، مع
              شمول الأمر بالنفاذ المعجل وبلا كفالة.
            </p>

            <p className="underline bold" style={{ marginTop: "40px" }}>
              قاضي محكمة الجزئية
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default AmrAdaaTemplate;
