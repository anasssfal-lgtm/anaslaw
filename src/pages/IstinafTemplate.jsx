import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function IstinafTemplate() {
  const [printMode, setPrintMode] = useState(false);

  useEffect(() => {
    return () => document.body.classList.remove("print-mode");
  }, []);

  const [form, setForm] = useState({
    lawyer: "",
    registry_no: "",
    original_case_no: "",
    original_case_session: "",
    electronic_no: "",
    session_day: "",
    session_date: "",
    appellant_name: "",
    appellant_nationality: "",
    appellant_civil_id: "",
    address_block: "",
    address_street: "",
    address_house: "",
    address_electronic_no: "",
    appellee_name: "",
    appellee_nationality: "",
    appellee_civil_id: "",
    appellee_case_no: "",
    appellee_circuit: "",
    ruling_text: "",
    substantive_reasons: "",
    hearing_court_circuit: "",
    hearing_day: "",
    hearing_date: "",
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

        .template-doc .quote {
          margin: 10px 24px;
        }
      `}</style>

      {!printMode && (
        <section className="panel">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
            <h1>📄 صحيفة استئناف</h1>
            <div style={{ display: "flex", gap: "10px" }}>
              <Link to="/templates">
                <button type="button">⬅️ رجوع</button>
              </Link>
              <button type="button" onClick={printPage}>
                🖨️ طباعة
              </button>
            </div>
          </div>

          <p style={{ color: "#888" }}>
            الحجج الإجرائية الثابتة (قبول الاستئناف شكلاً + الأثر الناقل للاستئناف) موجودة تلقائياً.
            أسباب الاستئناف الموضوعية (حسب موضوع كل قضية) تكتبها انت بالحقل بالأسفل.
          </p>

          <div className="edit-grid">
            <div className="edit-field">
              <label>المحامي الوكيل</label>
              <input value={form.lawyer} onChange={(e) => set("lawyer", e.target.value)} placeholder="أنس فيصل الحيدر" />
            </div>

            <div className="edit-field">
              <label>رقم القيد</label>
              <input value={form.registry_no} onChange={(e) => set("registry_no", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>رقم الدعوى المستأنف حكمها</label>
              <input value={form.original_case_no} onChange={(e) => set("original_case_no", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>تاريخ جلسة صدور الحكم المستأنف</label>
              <input type="date" value={form.original_case_session} onChange={(e) => set("original_case_session", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>الرقم الآلي</label>
              <input value={form.electronic_no} onChange={(e) => set("electronic_no", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>يوم/تاريخ تحرير الصحيفة</label>
              <input value={form.session_day} onChange={(e) => set("session_day", e.target.value)} placeholder="مثال: الثلاثاء" />
            </div>

            <div className="edit-field">
              <label>تاريخ تحرير الصحيفة</label>
              <input type="date" value={form.session_date} onChange={(e) => set("session_date", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>اسم المستأنف</label>
              <input value={form.appellant_name} onChange={(e) => set("appellant_name", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>جنسية المستأنف</label>
              <input value={form.appellant_nationality} onChange={(e) => set("appellant_nationality", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>الرقم المدني للمستأنف</label>
              <input value={form.appellant_civil_id} onChange={(e) => set("appellant_civil_id", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>قطعة (عنوان الإعلان)</label>
              <input value={form.address_block} onChange={(e) => set("address_block", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>شارع (عنوان الإعلان)</label>
              <input value={form.address_street} onChange={(e) => set("address_street", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>منزل (عنوان الإعلان)</label>
              <input value={form.address_house} onChange={(e) => set("address_house", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>الرقم الآلي للعنوان</label>
              <input value={form.address_electronic_no} onChange={(e) => set("address_electronic_no", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>اسم المستأنف ضده</label>
              <input value={form.appellee_name} onChange={(e) => set("appellee_name", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>جنسية المستأنف ضده</label>
              <input value={form.appellee_nationality} onChange={(e) => set("appellee_nationality", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>الرقم المدني للمستأنف ضده</label>
              <input value={form.appellee_civil_id} onChange={(e) => set("appellee_civil_id", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>رقم دعوى المستأنف ضده (الدعوى الأصلية)</label>
              <input value={form.appellee_case_no} onChange={(e) => set("appellee_case_no", e.target.value)} placeholder="مثال: 1234/2026" />
            </div>

            <div className="edit-field">
              <label>دائرة الدعوى الأصلية</label>
              <input value={form.appellee_circuit} onChange={(e) => set("appellee_circuit", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>محكمة/دائرة الاستئناف (جلسة الحضور)</label>
              <input value={form.hearing_court_circuit} onChange={(e) => set("hearing_court_circuit", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>يوم جلسة الحضور</label>
              <input value={form.hearing_day} onChange={(e) => set("hearing_day", e.target.value)} placeholder="مثال: الأربعاء" />
            </div>

            <div className="edit-field">
              <label>تاريخ جلسة الحضور</label>
              <input type="date" value={form.hearing_date} onChange={(e) => set("hearing_date", e.target.value)} />
            </div>

            <div className="edit-field full-width" style={{ gridColumn: "span 2" }}>
              <label>منطوق الحكم المستأنف (حكمت المحكمة في مادة)</label>
              <textarea rows={3} value={form.ruling_text} onChange={(e) => set("ruling_text", e.target.value)} />
            </div>

            <div className="edit-field full-width" style={{ gridColumn: "span 2" }}>
              <label>أسباب الاستئناف الموضوعية (ثانياً)</label>
              <textarea rows={8} value={form.substantive_reasons} onChange={(e) => set("substantive_reasons", e.target.value)} />
            </div>

            <div className="edit-field full-width" style={{ gridColumn: "span 2" }}>
              <label>الطلبات الختامية (ثانياً بعد "بقبول الاستئناف شكلاً")</label>
              <textarea rows={3} value={form.claims} onChange={(e) => set("claims", e.target.value)} />
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
            <p className="bold underline">
              إستئناف الحكم الصادر في الدعوى رقم {form.original_case_no || "......"}{" "}
              / الصادر بجلسة {form.original_case_session || ".../.../2026"}
            </p>
            <p className="bold underline">
              الرقم الآلي: {form.electronic_no || "......"}
            </p>
            <p className="center bold">وكيل المستأنف: {form.lawyer || "—"}</p>
            <p className="center bold">المحامي</p>

            <p className="bold">رقم القيد: {form.registry_no || "......"}</p>
            <p className="bold">درجة القيد: دستورية وتمييز</p>

            <h2 className="center underline">صحيفة إستئناف</h2>

            <p>
              إنه في يوم: {form.session_day || "..........."} الموافق:{" "}
              {form.session_date || ".../.../2026"} الساعة: ...........
            </p>

            <p className="bold">
              بناء على طلب السيد/ ـ {form.appellant_name || "..........."} -
              الجنسية {form.appellant_nationality || "......"} - ب.م (
              {form.appellant_civil_id || "......"}).
            </p>

            <p className="bold">
              ومحله المختار مكتب المحاميان / طلال عبد اللطيف الشطي &amp; أنس
              فيصل الحيدر - الكائن في: بنيد القار ـ قطعة 3 ـ مجمع ديما ـ
              الدور 10 ـ مكتب 35.
            </p>

            <p>أنا مندوب الإعلان بمحكمة الاستئناف بوزارة العدل قد انتقلت وأعلنت: ـ</p>

            <p className="bold">
              السيد/ {form.appellee_name || "..........."} - الجنسية{" "}
              {form.appellee_nationality || "......"} - ب.م (
              {form.appellee_civil_id || "......"}) ويعلن في: - قطعة{" "}
              {form.address_block || " "} - شارع {form.address_street || " "} -
              منزل {form.address_house || " "} - الرقم الآلي للعنوان (
              {form.address_electronic_no || " "}).
            </p>

            <p className="bold">مخاطباً مع /</p>

            <p>
              أقام المستأنف ضده ضد المستأنف الدعوى رقم /
              {form.appellee_case_no || "......"} دائرة{" "}
              {form.appellee_circuit || "......"} بطلب الحكم
            </p>

            <p className="bold underline">حكمت المحكمة في مادة:</p>
            <p style={{ whiteSpace: "pre-wrap" }}>{form.ruling_text || "—"}</p>

            <p className="bold">
              ولما كان هذا الحكم فيما قضي به في الدعوى الأصلية صدر مجحفاً
              بحقوق المستأنف وضاراً به لمخالفته للقانون والفساد في الإستدلال
              فانه يقيم الطعن عليه بالإستئناف للأسباب الآتية:
            </p>

            <p className="bold center">أسباب الإستئناف</p>

            <div className="section">
              <p className="bold underline">من حيث الشكل: ـ</p>
              <p className="bold">
                يلتمس المستأنف قبول الإستئناف شكلاً للتقرير به في الميعاد
                القانوني.
              </p>
              <p className="bold">
                من المقرر بنص المادة 141 من قانون المرافعات المدنية
                والتجارية.
              </p>
              <p className="quote">"ميعاد الإستئناف ثلاثون يوماً ما لم ينص القانون على غير ذلك"</p>
              <p>
                ولما كان الحكم المستأنف صدر بجلسة{" "}
                {form.original_case_session || ".../.../2026"} الأمر الذي يكون معه
                الإستئناف أقيم في الميعاد القانوني فهو مقبول شكلاً.
              </p>
            </div>

            <div className="section">
              <p className="bold underline">من حيث الموضوع: ـ</p>
              <p className="bold underline">أولاً: الأثر الناقل للإستئناف</p>
              <p className="bold">
                من المقرر بنص المادة 144 من قانون المرافعات التجارية والمدنية
              </p>
              <p className="quote">
                "الإستئناف ينقل الدعوى بحالتها التي كانت عليها قبل صدور الحكم
                المستأنف بالنسبة لما رفع عنه الإستئناف فقط، وتنظر محكمة
                الإستئناف على أساس ما يقدم لها من أدلة ودفوع جديدة وما كان
                قد قدم لمحكمة أول درجة"
              </p>
              <p className="bold">من المقرر بقضاء التمييز</p>
              <p className="quote">
                "من المقرر قانوناً بنص المادة 144 من قانون المرافعات المدنية
                والتجارية وعلى ما جرى به قضاء هذه المحكمة أن يترتب على رفع
                الإستئناف نقل موضوع النزاع برمته إلى محكمة الإستئناف بحالته
                التي كانت عليها قبل صدور الحكم المستأنف، وإعادة طرحه عليها
                على أسانيده القانونية وأدلته الواقعية التي لم يتم التنازل
                عنها، وذلك في حدود ما رفع عنه الإستئناف فقط، ولا يجوز لمحكمة
                الإستئناف عملاً بالفقرة الثانية من المادة 127 أن تسوّئ مركز
                المستأنف في الإستئناف المرفوع منه وحده"
              </p>
              <p className="bold">الطعنين رقمي 457، 442/2001 مدني جلسة 21/10/2002</p>
            </div>

            <div className="section">
              <p className="bold underline">ثانياً:</p>
              <p style={{ whiteSpace: "pre-wrap" }}>
                {form.substantive_reasons || "—"}
              </p>
            </div>

            <p className="bold underline">
              لهذه الأسباب والأسباب الأخرى التي سيبديها المستأنف أمام المحكمة
            </p>

            <div className="section">
              <p className="bold">بناءً عليه</p>
              <p>
                أنا مندوب الإعلان سالف الذكر انتقلت وأعلنت المعلن إليه
                وسلمته صورة من هذه الصحيفة وكلفته بالحضور أمام محكمة
                الاستئناف {form.hearing_court_circuit || "................"}{" "}
                وذلك بجلستها التي ستنعقد علناً في صباح يوم{" "}
                {form.hearing_day || "................"} الموافق{" "}
                {form.hearing_date || ".../.../2026"} في تمام الساعة التاسعة
                والنصف صباحاً وما بعدها لسماع الحكم بالآتي: -
              </p>
            </div>

            <p>
              <span className="underline bold">أولاً:</span> بقبول
              الإستئناف شكلاً.
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

export default IstinafTemplate;
