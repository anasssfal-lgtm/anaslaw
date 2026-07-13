import { useEffect, useState } from "react";
import { supabase } from "../supabase";

function Clients() {
  const [clients, setClients] = useState([]);
  const [cases, setCases] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    civil_id: "",
    address: "",
    notes: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const today = new Date().toISOString().split("T")[0];

    const [
      { data: clientsData, error: clientsError },
      { data: casesData, error: casesError },
      { data: sessionsData, error: sessionsError },
    ] = await Promise.all([
      supabase
        .from("clients")
        .select("*")
        .order("id", { ascending: false }),

      supabase
        .from("cases")
        .select("*")
        .limit(3000),

      supabase
        .from("sessions")
        .select("*")
        .gte("session_date", today)
        .order("session_date", { ascending: true })
        .limit(3000),
    ]);

    if (clientsError) {
      alert("خطأ في جلب الموكلين: " + clientsError.message);
      return;
    }

    if (casesError) {
      alert("خطأ في جلب القضايا: " + casesError.message);
      return;
    }

    if (sessionsError) {
      alert("خطأ في جلب الجلسات: " + sessionsError.message);
      return;
    }

    setClients(clientsData || []);
    setCases(casesData || []);
    setSessions(sessionsData || []);
  }

  async function addClient(e) {
    e.preventDefault();

    const clientName = form.name.trim();

    if (!clientName) {
      alert("اكتب اسم الموكل");
      return;
    }

    const clientExists = clients.some(
      (client) =>
        String(client.name || "").trim().toLowerCase() ===
        clientName.toLowerCase()
    );

    if (clientExists) {
      alert("هذا الموكل موجود مسبقًا");
      return;
    }

    const { error } = await supabase.from("clients").insert([
      {
        ...form,
        name: clientName,
      },
    ]);

    if (error) {
      alert("خطأ أثناء حفظ الموكل: " + error.message);
      return;
    }

    alert("تم حفظ الموكل بنجاح");

    setForm({
      name: "",
      phone: "",
      email: "",
      civil_id: "",
      address: "",
      notes: "",
    });

    loadData();
  }

  function normalizeName(value) {
    return String(value || "").trim().toLowerCase();
  }

  function getClientCases(client) {
    const clientName = normalizeName(client.name);

    return cases.filter(
      (caseItem) => normalizeName(caseItem.client_name) === clientName
    );
  }

  function isActiveCase(caseItem) {
    const status = `${caseItem.file_status || ""} ${
      caseItem.status || ""
    }`;

    return (
      status.includes("متداولة") ||
      status.includes("نشطة") ||
      status.includes("قيد") ||
      status.includes("منظورة") ||
      status.includes("المكتب")
    );
  }

  function getClientUpcomingSessions(client) {
    const clientName = normalizeName(client.name);
    const clientCases = getClientCases(client);
    const caseIds = clientCases.map((caseItem) => Number(caseItem.id));

    return sessions.filter((session) => {
      const matchesName =
        normalizeName(session.client_name) === clientName;

      const matchesCase =
        session.case_id &&
        caseIds.includes(Number(session.case_id));

      return matchesName || matchesCase;
    });
  }

  const filteredClients = clients.filter((client) => {
    const text = `
      ${client.name || ""}
      ${client.phone || ""}
      ${client.email || ""}
      ${client.civil_id || ""}
      ${client.address || ""}
    `;

    return text.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div>
      <section className="panel">
        <h1 style={{ textAlign: "center" }}>👥 الموكلون</h1>

        <div className="dashboard">
          <div className="stat blue">
            <h3>{clients.length}</h3>
            <p>عدد الموكلين</p>
          </div>

          <div className="stat green">
            <h3>{cases.length}</h3>
            <p>عدد القضايا</p>
          </div>

          <div className="stat purple">
            <h3>{sessions.length}</h3>
            <p>الجلسات القادمة</p>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>إضافة موكل جديد</h2>

        <form className="form" onSubmit={addClient}>
          <input
            placeholder="اسم الموكل"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="رقم الهاتف"
            value={form.phone}
            onChange={(e) =>
              setForm({ ...form, phone: e.target.value })
            }
          />

          <input
            type="email"
            placeholder="البريد الإلكتروني"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            placeholder="رقم الهوية"
            value={form.civil_id}
            onChange={(e) =>
              setForm({ ...form, civil_id: e.target.value })
            }
          />

          <input
            placeholder="العنوان"
            value={form.address}
            onChange={(e) =>
              setForm({ ...form, address: e.target.value })
            }
          />

          <textarea
            placeholder="ملاحظات"
            value={form.notes}
            onChange={(e) =>
              setForm({ ...form, notes: e.target.value })
            }
          />

          <button type="submit">💾 حفظ الموكل</button>
        </form>
      </section>

      <section className="panel">
        <h2>قائمة الموكلين</h2>

        <input
          placeholder="🔍 ابحث بالاسم أو الهاتف أو البريد أو رقم الهوية..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            borderRadius: "8px",
            border: "1px solid #ddd",
          }}
        />

        <p style={{ marginTop: "15px" }}>
          عدد النتائج: {filteredClients.length}
        </p>

        {filteredClients.length === 0 ? (
          <p className="empty">لا يوجد موكلون.</p>
        ) : (
          <div className="clients-grid">
            {filteredClients.map((client) => {
              const clientCases = getClientCases(client);

              const activeCases = clientCases.filter(isActiveCase);

              const upcomingSessions =
                getClientUpcomingSessions(client);

              return (
                <div key={client.id} className="case-card">
                  <h3>{client.name}</h3>

                  <div className="case-info">
                    <p>
                      <b>📱 الهاتف:</b>{" "}
                      {client.phone || "لا يوجد"}
                    </p>

                    <p>
                      <b>📧 البريد:</b>{" "}
                      {client.email || "لا يوجد"}
                    </p>

                    <p>
                      <b>🆔 رقم الهوية:</b>{" "}
                      {client.civil_id || "لا يوجد"}
                    </p>

                    <p>
                      <b>📍 العنوان:</b>{" "}
                      {client.address || "لا يوجد"}
                    </p>

                    <p>
                      <b>📁 عدد القضايا:</b>{" "}
                      {clientCases.length}
                    </p>

                    <p>
                      <b>⚖️ القضايا المتداولة:</b>{" "}
                      {activeCases.length}
                    </p>

                    <p>
                      <b>📅 الجلسات القادمة:</b>{" "}
                      {upcomingSessions.length}
                    </p>

                    <p>
                      <b>📝 الملاحظات:</b>{" "}
                      {client.notes || "لا توجد ملاحظات"}
                    </p>
                  </div>

                  {upcomingSessions.length > 0 && (
                    <div
                      style={{
                        background: "#f0fff4",
                        padding: "10px",
                        borderRadius: "8px",
                        marginTop: "10px",
                      }}
                    >
                      <h4>📅 أقرب الجلسات</h4>

                      {upcomingSessions
                        .slice(0, 3)
                        .map((session) => (
                          <div
                            className="session"
                            key={session.id}
                          >
                            <p>
                              <b>التاريخ:</b>{" "}
                              {session.session_date}
                            </p>

                            <p>
                              <b>الوقت:</b>{" "}
                              {session.session_time ||
                                "غير محدد"}
                            </p>

                            <p>
                              <b>المكان:</b>{" "}
                              {session.location ||
                                "غير محدد"}
                            </p>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

export default Clients;