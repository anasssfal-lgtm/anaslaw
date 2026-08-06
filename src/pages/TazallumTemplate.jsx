import { useState } from "react";
import { Link } from "react-router-dom";

function TazallumTemplate() {
  const [printMode, setPrintMode] = useState(false);

  const [form, setForm] = useState({
    lawyer: "",
    ban_order_no: "",
    execution_file_no: "",
    session_day: "",
    session_date: "",
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
    circuit_no: "",
    hearing_day: "",
    hearing_date: "",
    execution_court: "",
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
            <h1>📄 صحيفة تظلم من أمر منع سفر</h1>
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
            الأسباب القانونية (الأحكام والطعون المذكورة بالنموذج) ثابتة زي ما هي، تعبي بس بيانات القضية.
          </p>

          <div className="edit-grid">
            <div className="edit-field">
              <label>المحامي الوكيل</label>
              <input value={form.lawyer} onChange={(e) => set("lawyer", e.target.value)} placeholder="أنس فيصل الحيدر" />
            </div>

            <div className="edit-field">
              <label>رقم أمر منع السفر</label>
              <input value={form.ban_order_no} onChange={(e) => set("ban_order_no", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>رقم ملف التنفيذ</label>
              <input value={form.execution_file_no} onChange={(e) => set("execution_file_no", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>محكمة التنفيذ</label>
              <input value={form.execution_court} onChange={(e) => set("execution_court", e.target.value)} placeholder="محكمة - تنفيذ الأفراد" />
            </div>

            <div className="edit-field">
              <label>يوم/تاريخ تحرير الصحيفة</label>
              <input value={form.session_day} onChange={(e) => set("session_day", e.target.value)} placeholder="مثال: الأحد" />
            </div>

            <div className="edit-field">
              <label>تاريخ تحرير الصحيفة</label>
              <input type="date" value={form.session_date} onChange={(e) => set("session_date", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>اسم المتظلم</label>
              <input value={form.plaintiff_name} onChange={(e) => set("plaintiff_name", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>جنسية المتظلم</label>
              <input value={form.plaintiff_nationality} onChange={(e) => set("plaintiff_nationality", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>الرقم المدني للمتظلم</label>
              <input value={form.plaintiff_civil_id} onChange={(e) => set("plaintiff_civil_id", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>البريد الإلكتروني</label>
              <input value={form.plaintiff_email} onChange={(e) => set("plaintiff_email", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>اسم المتظلم ضده الأول</label>
              <input value={form.defendant_name} onChange={(e) => set("defendant_name", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>جنسية المتظلم ضده</label>
              <input value={form.defendant_nationality} onChange={(e) => set("defendant_nationality", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>الرقم المدني للمتظلم ضده</label>
              <input value={form.defendant_civil_id} onChange={(e) => set("defendant_civil_id", e.target.value)} />
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
              <label>قسيمة (عنوان الإعلان)</label>
              <input value={form.address_parcel} onChange={(e) => set("address_parcel", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>الرقم الآلي للعنوان</label>
              <input value={form.address_electronic_no} onChange={(e) => set("address_electronic_no", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>رقم دائرة التظلمات</label>
              <input value={form.circuit_no} onChange={(e) => set("circuit_no", e.target.value)} />
            </div>

            <div className="edit-field">
              <label>يوم جلسة الحضور</label>
              <input value={form.hearing_day} onChange={(e) => set("hearing_day", e.target.value)} placeholder="مثال: الاثنين" />
            </div>

            <div className="edit-field">
              <label>تاريخ جلسة الحضور</label>
              <input type="date" value={form.hearing_date} onChange={(e) => set("hearing_date", e.target.value)} />
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
              تظلم من أمر منع سفر رقم {form.ban_order_no || "......"}
            </p>
            <p className="bold underline">
              المودع ملف التنفيذ رقم {form.execution_file_no || "......"}
            </p>
            <p className="center bold">وكيل المتظلم: {form.lawyer || "—"}</p>
            <p className="center bold">المحامي</p>

            <h2 className="center underline">صحيفة تظلم من أمر منع سفر</h2>

            <p>
              إنه في يوم: {form.session_day || "..........."} الموافق:{" "}
              {form.session_date || ".../.../2026"} الساعة: ...........
            </p>

            <p className="bold">
              بناء على طلب السيد/ {form.plaintiff_name || "..........."} - الجنسية{" "}
              {form.plaintiff_nationality || "......"} ـ ب.م (
              {form.plaintiff_civil_id || "......"}).
            </p>

            <p className="underline">
              البريد الالكتروني: {form.plaintiff_email || "..........."}
            </p>

            <p className="bold">
              ومحله المختار مكتب المحاميان / طلال عبد اللطيف الشطي &amp; ناصر
              عثمان الخضر ـ الكائن في: بنيد القار ـ قطعة 3 ـ مجمع ديما ـ الدور
              10 ـ مكتب 35.
            </p>

            <p>أنا مندوب الإعلان بالمحكمة الكلية بوزارة العدل قد انتقلت وأعلنت: ـ</p>

            <p className="bold">
              1- السيد/ {form.defendant_name || "..........."} - الجنسية{" "}
              {form.defendant_nationality || "......"} - ب.م (
              {form.defendant_civil_id || "......"})
            </p>

            <p className="bold">
              ويعلن في: - قطعة ({form.address_block || " "}) - شارع{" "}
              {form.address_street || "......"} - قسيمة (
              {form.address_parcel || " "}) - الرقم الآلي للعنوان (
              {form.address_electronic_no || " "}).
            </p>

            <p className="bold">مخاطباً مع /</p>
            <p className="bold">2- السيد / مدير إدارة التنفيذ بصفته</p>
            <p>
              <span className="underline bold">ويعلن في:</span> الفتوى
              والتشريع - شرق - شارع أحمد الجابر - أبراج الفتوى.
            </p>
            <p className="bold">مخاطباً مع /</p>

            <div className="section">
              <p className="bold">أسباب التظلم</p>
              <p className="bold underline">
                صدر أمر المنع المتظلم منه بالمخالفة لأحكام القانون
              </p>
              <p className="bold">من المقرر في قضاء محكمة التمييز أنه:</p>
              <p className="quote">
                (مما يشترط لصدور الأمر بالمنع من السفر على ما نصت عليه المادة
                (297) من قانون المرافعات أن يكون المدين قادر علي الوفاء وأن
                تقوم أسباب جدية تدعو إلى الظن بفراره من الدين ويقع على عاتق
                الدائن إثبات توافر هذين الشرطين، وأن تقدير موجبات إصدار الأمر
                بالمنع من السفر وتقدير أسباب التظلم من ذلك الأمر هو من الأمور
                الموضوعية التي يستقل بها القاضي الذي يطلب منه توقيع الأمر ومن
                بعده المحكمة التي يرفع إليها التظلم بغير معقب من محكمة
                التمييز مادام قد أقيم على أسباب سائغة تكفي لحمله)
              </p>
              <p className="bold">( الطعن رقم 193/93 تجاري جلسة 8/2/1994 )</p>

              <p className="bold underline">كما أنه من المقرر أن :</p>
              <p className="quote">
                (منع السفر ليس وسيلة تنفيذ، بل هو إجراء وقتي قصد به مواجهة
                حالة معينة إن توافرت شروطها لأنه قيد على الحريات فيجعله
                المشرع في أضيق نطاق)
              </p>
              <p className="bold">( الطعن رقم 84/1985 تجاري جلسة 17/7/1985 )</p>

              <p>
                وحيث أن مؤدي نص المادتين (297، 298) من قانون المرافعات
                المدنية والتجارية وما جاء عنهما في المذكرة الإيضاحية أنه
                يشترط لإستصدار الأمر بمنع السفر بوصفه إجراء وقتي أن يكون حق
                الدائن محقق الوجود وحال الأداء وأن يقدم الدائن الدليل علي
                أسباب جدية تدعو إلى الظن بخشية فرار مدينه من الدين وأن يثبت
                أن مدينه قادر علي الوفاء.
              </p>
            </div>

            <div className="section">
              <p className="bold underline">
                بطلان أمر منع السفر لعدم إعلانه للمتظلم:
              </p>
              <p>
                ولما كان الأمر المتظلم منه لم يتم إعلانه للمتظلم وفقاً لأحكام
                القانون، مما يبطله ويجعله كأن لم يكن.
              </p>
              <p className="bold">
                مما سبق يتضح أن أمر المنع من السفر المتظلم منه فاقداً لشروط
                إصداره، الأمر الذي يقطع ببطلانه ومن ثم يلتمس المتظلم القضاء
                بإلغائه.
              </p>
            </div>

            <div className="section">
              <p className="bold">بــناءً عـليـه</p>
              <p>
                أنا مندوب الإعلان سالف البيان قد إنتقلت بتاريخه أعلاه إلي حيث
                يوجد المعلن اليهما وسلمت كل منهما صورة من هذه الصحيفة
                وكلفتهما بالحضور إلي مقر المحكمة الكلية أمام دائرة التظلمات
                رقم ({form.circuit_no || " "}) وذلك بجلستها المنعقدة علناً في
                تمام الساعة التاسعة وما بعدها من صباح يوم{" "}
                {form.hearing_day || "................"} الموافق{" "}
                {form.hearing_date || ".../.../2026"} وذلك لسماع الحكم: -
              </p>
              <p>
                بإلغاء أمر المنع من السفر رقم {form.ban_order_no || "......"}{" "}
                المودع ملف التنفيذ رقم {form.execution_file_no || "......"}{" "}
                {form.execution_court || "محكمة -- تنفيذ الأفراد"} واعتباره
                كأن لم يكن، مع إلزام المتظلم ضده الأول بالمصروفات ومقابل
                أتعاب المحاماة الفعلية.
              </p>
            </div>

            <p className="bold" style={{ marginTop: "30px" }}>
              ولأجل العلم ..
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default TazallumTemplate;
