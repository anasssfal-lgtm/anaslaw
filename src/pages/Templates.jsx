import { Link } from "react-router-dom";

const templates = [
  {
    name: "توكيل خاص بالقضايا",
    description: "خطاب لوزارة العدل (فيه تواقيع المحامين، يفتح بـ Word)",
    file: "/templates/tawkeel-khas-bil-qadaya.docx",
  },
  {
    name: "طلب استصدار أمر أداء",
    description: "نموذج تعبّى داخل الموقع وتطبعه مباشرة",
    route: "/templates/amr-adaa",
  },
  {
    name: "صحيفة دعوى",
    description: "نموذج تعبّى داخل الموقع وتطبعه مباشرة",
    route: "/templates/saheefat-dawa",
  },
  {
    name: "صحيفة تظلم من أمر منع سفر",
    description: "نموذج تعبّى داخل الموقع وتطبعه مباشرة",
    route: "/templates/tazallum",
  },
  {
    name: "صحيفة استئناف",
    description: "نموذج تعبّى داخل الموقع وتطبعه مباشرة",
    route: "/templates/istinaf",
  },
];

const cardStyle = {
  display: "block",
  background: "#f9f9f9",
  border: "1px solid #eee",
  borderRight: "3px solid #7c1c1c",
  borderRadius: "10px",
  padding: "16px",
  textDecoration: "none",
  color: "#222",
};

function Templates() {
  return (
    <section className="panel">
      <h1>📄 النماذج</h1>

      <p style={{ color: "#888", marginBottom: "20px" }}>
        النماذج اللي فيها "فتح النموذج" تعبيها وتطبعها مباشرة من الموقع.
        الباقي يفتح ملف Word الأصلي لتعبئته يدوياً.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "15px",
        }}
      >
        {templates.map((tpl) => {
          const content = (
            <>
              <div style={{ fontWeight: "bold", marginBottom: "6px" }}>
                📄 {tpl.name}
              </div>
              <div style={{ fontSize: "13px", color: "#888" }}>
                {tpl.description}
              </div>
              <div
                style={{
                  marginTop: "10px",
                  color: "#7c1c1c",
                  fontSize: "13px",
                  fontWeight: "bold",
                }}
              >
                {tpl.route ? "📝 فتح النموذج" : "📂 فتح"}
              </div>
            </>
          );

          if (tpl.route) {
            return (
              <Link key={tpl.route} to={tpl.route} style={cardStyle}>
                {content}
              </Link>
            );
          }

          return (
            <a key={tpl.file} href={tpl.file} style={cardStyle}>
              {content}
            </a>
          );
        })}
      </div>
    </section>
  );
}

export default Templates;
