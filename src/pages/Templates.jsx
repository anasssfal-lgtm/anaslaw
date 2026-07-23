const templates = [
  {
    name: "توكيل خاص بالقضايا",
    description: "خطاب لوزارة العدل - إدارة التسجيل العقاري والتوثيقات",
    file: "/templates/tawkeel-khas-bil-qadaya.docx",
  },
  {
    name: "طلب استصدار أمر أداء",
    description: "طلب موجّه لقاضي المحكمة لاستصدار أمر أداء",
    file: "/templates/talab-istisdar-amr-adaa.docx",
  },
  {
    name: "صحيفة دعوى",
    description: "نموذج صحيفة دعوى قضائية",
    file: "/templates/saheefat-dawa.docx",
  },
  {
    name: "صحيفة تظلم من أمر منع سفر",
    description: "نموذج تظلم من أمر منع سفر مودع بملف تنفيذ",
    file: "/templates/saheefat-tazallum-man-safar.docx",
  },
  {
    name: "صحيفة استئناف",
    description: "نموذج استئناف حكم صادر بدعوى",
    file: "/templates/saheefat-istinaf.docx",
  },
];

function Templates() {
  return (
    <section className="panel">
      <h1>📄 النماذج</h1>

      <p style={{ color: "#888", marginBottom: "20px" }}>
        اضغط على أي نموذج لتحميله وفتحه بـ Word وتعبئته يدوياً.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "15px",
        }}
      >
        {templates.map((tpl) => (
          <a
            key={tpl.file}
            href={tpl.file}
            download
            style={{
              display: "block",
              background: "#f9f9f9",
              border: "1px solid #eee",
              borderRight: "3px solid #7c1c1c",
              borderRadius: "10px",
              padding: "16px",
              textDecoration: "none",
              color: "#222",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
              📄 {tpl.name}
            </div>
            <div style={{ fontSize: "13px", color: "#888" }}>
              {tpl.description}
            </div>
            <div style={{ marginTop: "10px", color: "#7c1c1c", fontSize: "13px", fontWeight: "bold" }}>
              ⬇️ تحميل
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default Templates;
