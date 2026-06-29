import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function Cases() {
  const [cases, setCases] = useState([]);
  const [sessionForm, setSessionForm] = useState({});

  const [caseForm, setCaseForm] = useState({
    client_name: "",
    case_number: "",
    case_type: "",
    court: "",
    lawyer: "أنس",
    status: "نشطة",
    notes: "",
  });

  useEffect(() => {
    getCases();
  }, []);

  async function getCases() {
    const { data, error } = await supabase
      .from("cases")
      .select("*, sessions(*)")
      .order("id", { ascending: false });

    if (error) {
      alert("خطأ في جلب القضايا: " + error.message);
      console.log(error);
      return;
    }

    setCases(data || []);
  }

  async function addCase(e) {
    e.preventDefault();

    if (!caseForm.client_name || !caseForm.case_number) {
      alert("اكتب اسم الموكل ورقم القضية");
      return;
    }

    const { error } = await supabase.from("cases").insert([
      {
        client_name: caseForm.client_name,
        case_number: caseForm.case_number,
        case_type: caseForm.case_type,
        court: caseForm.court,
        lawyer: caseForm.lawyer,
        status: caseForm.status,
        notes: caseForm.notes,
      },
    ]);

    if (error) {
      alert("خطأ أثناء حفظ القضية: " + error.message);
      console.log(error);
      return;
    }

    alert("تم حفظ القضية بنجاح");

    setCaseForm({
      client_name: "",
      case_number: "",
      case_type: "",
      court: "",
      lawyer: "أنس",
      status: "نشطة",
      notes: "",
    });

    getCases();
  }

  async function addSession(caseId) {
    const session = sessionForm[caseId];

    if (!session?.session_date) {
      alert("اختر تاريخ الجلسة");
      return;
    }

    const { error } = await supabase.from("sessions").insert([
      {
        case_id: caseId,
        session_date: session.session_date,
        session_time: session.session_time || "",
        location: session.location || "",
        notes: session.notes || "",
      },
    ]);

    if (error) {
      alert("خطأ أثناء حفظ الجلسة: " + error.message);
      console.log(error);
      return;
    }

    setSessionForm({ ...sessionForm, [caseId]: {} });
    getCases();
  }

  function printCase() {
    window.print();
  }

  return (
    <div>
      <h1>📁 القضايا</h1>

      <section className="panel">
        <h2>إضافة قضية جديدة</h2>

        <form className="form" onSubmit={addCase}>
          <input
            placeholder="اسم الموكل"
            value={caseForm.client_name}
            onChange={(e) =>
              setCaseForm({ ...caseForm, client_name: e.target.value })
            }
          />

          <input
            placeholder="رقم القضية"
            value={caseForm.case_number}
            onChange={(e) =>
              setCaseForm({ ...caseForm, case_number: e.target.value })
            }
          />

          <input
            placeholder="نوع القضية"
            value={caseForm.case_type}
            onChange={(e) =>
              setCaseForm({ ...caseForm, case_type: e.target.value })
            }
          />

          <input
            placeholder="المحكمة"
            value={caseForm.court}
            onChange={(e) =>
              setCaseForm({ ...caseForm, court: e.target.value })
            }
          />

          <select
            value={caseForm.lawyer}
            onChange={(e) =>
              setCaseForm({ ...caseForm, lawyer: e.target.value })
            }
          >
            <option>أنس</option>
            <option>علي</option>
          </select>

          <select
            value={caseForm.status}
            onChange={(e) =>
              setCaseForm({ ...caseForm, status: e.target.value })
            }
          >
            <option>نشطة</option>
            <option>انتظار</option>
            <option>منتهية</option>
          </select>

          <textarea
            placeholder="ملاحظات"
            value={caseForm.notes}
            onChange={(e) =>
              setCaseForm({ ...caseForm, notes: e.target.value })
            }
          />

          <button type="submit">حفظ القضية</button>
        </form>
      </section>

      <section className="panel">
        <h2>القضايا والجلسات</h2>

        {cases.length === 0 && <p className="empty">لا توجد قضايا حالياً</p>}

        {cases.map((item) => (
          <div className="case-card modern-case" key={item.id}>
            <div className="case-head">
              <h3>{item.client_name}</h3>
              <span>{item.status}</span>
            </div>

            <div className="case-info">
              <p><b>رقم القضية:</b> {item.case_number}</p>
              <p><b>نوع القضية:</b> {item.case_type}</p>
              <p><b>المحكمة:</b> {item.court}</p>
              <p><b>المسؤول:</b> {item.lawyer}</p>
              <p><b>ملاحظات:</b> {item.notes || "لا توجد"}</p>
            </div>

            <h4>📅 الجلسات</h4>

            {item.sessions?.length ? (
              item.sessions.map((s) => (
                <div className="session" key={s.id}>
                  <p><b>التاريخ:</b> {s.session_date}</p>
                  <p><b>الوقت:</b> {s.session_time || "غير محدد"}</p>
                  <p><b>المكان:</b> {s.location || "غير محدد"}</p>
                  <p><b>ملاحظات:</b> {s.notes || "لا توجد"}</p>
                </div>
              ))
            ) : (
              <p className="empty">لا توجد جلسات</p>
            )}

            <div className="session-form">
              <input
                type="date"
                value={sessionForm[item.id]?.session_date || ""}
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    [item.id]: {
                      ...sessionForm[item.id],
                      session_date: e.target.value,
                    },
                  })
                }
              />

              <input
                placeholder="وقت الجلسة"
                value={sessionForm[item.id]?.session_time || ""}
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    [item.id]: {
                      ...sessionForm[item.id],
                      session_time: e.target.value,
                    },
                  })
                }
              />

              <input
                placeholder="مكان الجلسة"
                value={sessionForm[item.id]?.location || ""}
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    [item.id]: {
                      ...sessionForm[item.id],
                      location: e.target.value,
                    },
                  })
                }
              />

              <textarea
                placeholder="ملاحظات الجلسة"
                value={sessionForm[item.id]?.notes || ""}
                onChange={(e) =>
                  setSessionForm({
                    ...sessionForm,
                    [item.id]: {
                      ...sessionForm[item.id],
                      notes: e.target.value,
                    },
                  })
                }
              />

              <button type="button" onClick={() => addSession(item.id)}>
                حفظ الجلسة
              </button>

              <button type="button" onClick={printCase}>
                طباعة القضية
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

export default Cases;