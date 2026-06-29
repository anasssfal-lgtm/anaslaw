import { useEffect, useState } from 'react'
import './App.css'
import { supabase } from './supabase'

function App() {
  const [cases, setCases] = useState([])
  const [sessionForm, setSessionForm] = useState({})
  const [caseForm, setCaseForm] = useState({
    client_name: '',
    case_number: '',
    case_type: '',
    court: '',
    session_date: '',
    lawyer: 'أنس',
    status: 'نشطة',
    notes: '',
  })

  useEffect(() => {
    getCases()
  }, [])

  async function getCases() {
    const { data } = await supabase
      .from('cases')
      .select('*, sessions(*)')
      .order('id', { ascending: false })

    setCases(data || [])
  }

  async function addCase(e) {
    e.preventDefault()

    if (!caseForm.client_name || !caseForm.case_number) {
      alert('اكتب اسم الموكل ورقم القضية')
      return
    }

    await supabase.from('cases').insert([caseForm])

    setCaseForm({
      client_name: '',
      case_number: '',
      case_type: '',
      court: '',
      session_date: '',
      lawyer: 'أنس',
      status: 'نشطة',
      notes: '',
    })

    getCases()
  }

  async function addSession(caseId) {
    const session = sessionForm[caseId]

    if (!session?.session_date) {
      alert('اختر تاريخ الجلسة')
      return
    }

    await supabase.from('sessions').insert([
      {
        case_id: caseId,
        session_date: session.session_date,
        session_time: session.session_time || '',
        location: session.location || '',
        notes: session.notes || '',
      },
    ])

    setSessionForm({ ...sessionForm, [caseId]: {} })
    getCases()
  }

  function allSessions() {
    return cases.flatMap((c) =>
      (c.sessions || []).map((s) => ({
        ...s,
        client_name: c.client_name,
        case_number: c.case_number,
        court: c.court,
        lawyer: c.lawyer,
      }))
    )
  }

  const today = new Date().toISOString().split('T')[0]

  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrow = tomorrowDate.toISOString().split('T')[0]

  const weekDate = new Date()
  weekDate.setDate(weekDate.getDate() + 7)
  const nextWeek = weekDate.toISOString().split('T')[0]

  const sessions = allSessions()
  const todaySessions = sessions.filter((s) => s.session_date === today)
  const tomorrowSessions = sessions.filter((s) => s.session_date === tomorrow)
  const weekSessions = sessions.filter(
    (s) => s.session_date >= today && s.session_date <= nextWeek
  )

  function printCase(item) {
    const rows = item.sessions?.length
      ? item.sessions.map((s) => `
        <tr>
          <td>${s.session_date || ''}</td>
          <td>${s.session_time || ''}</td>
          <td>${s.location || ''}</td>
          <td>${s.notes || ''}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="4">لا توجد جلسات</td></tr>'

    const w = window.open('', '_blank')
    w.document.write(`
      <html dir="rtl">
        <head>
          <title>طباعة القضية</title>
          <style>
            body { font-family: Arial; direction: rtl; padding: 40px; }
            h1,h2 { color:#7f1d1d; }
            table { width:100%; border-collapse:collapse; }
            th,td { border:1px solid #999; padding:10px; }
            th { background:#7f1d1d; color:white; }
          </style>
        </head>
        <body>
          <h1>⚖️ أنس للمحاماة</h1>
          <h2>تقرير قضية</h2>
          <p><b>الموكل:</b> ${item.client_name}</p>
          <p><b>رقم القضية:</b> ${item.case_number}</p>
          <p><b>نوع القضية:</b> ${item.case_type}</p>
          <p><b>المحكمة:</b> ${item.court}</p>
          <p><b>المسؤول:</b> ${item.lawyer}</p>

          <h2>الجلسات</h2>
          <table>
            <thead>
              <tr>
                <th>التاريخ</th>
                <th>الوقت</th>
                <th>المكان</th>
                <th>الملاحظات</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <script>window.print()</script>
        </body>
      </html>
    `)
    w.document.close()
  }

  return (
    <div className="app" dir="rtl">
      <header className="topbar">
        <div>
          <h2>⚖️ أنس للمحاماة</h2>
          <p>Legal Management System</p>
        </div>

        <input className="search" placeholder="بحث سريع..." />

        <div className="user">Welcome أنس</div>
      </header>

      <main className="container">
        <section className="dashboard">
          <div className="stat blue">
            <h3>{cases.length}</h3>
            <p>عدد القضايا</p>
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
        </section>

        {todaySessions.length > 0 && (
          <div className="alert">
            🔔 لديك {todaySessions.length} جلسة اليوم
          </div>
        )}

        <section className="icons">
          <div>📁<span>القضايا</span></div>
          <div>📅<span>الجلسات</span></div>
          <div>📄<span>رول الأسبوع</span></div>
          <div>👥<span>الموكلون</span></div>
          <div>📎<span>المستندات</span></div>
          <div>📊<span>التقارير</span></div>
        </section>

        <section className="panel">
          <h2>إضافة قضية جديدة</h2>

          <form className="form" onSubmit={addCase}>
            <input placeholder="اسم الموكل" value={caseForm.client_name}
              onChange={(e) => setCaseForm({ ...caseForm, client_name: e.target.value })} />

            <input placeholder="رقم القضية" value={caseForm.case_number}
              onChange={(e) => setCaseForm({ ...caseForm, case_number: e.target.value })} />

            <input placeholder="نوع القضية" value={caseForm.case_type}
              onChange={(e) => setCaseForm({ ...caseForm, case_type: e.target.value })} />

            <input placeholder="المحكمة" value={caseForm.court}
              onChange={(e) => setCaseForm({ ...caseForm, court: e.target.value })} />

            <input type="date" value={caseForm.session_date}
              onChange={(e) => setCaseForm({ ...caseForm, session_date: e.target.value })} />

            <select value={caseForm.lawyer}
              onChange={(e) => setCaseForm({ ...caseForm, lawyer: e.target.value })}>
              <option>أنس</option>
              <option>علي</option>
            </select>

            <select value={caseForm.status}
              onChange={(e) => setCaseForm({ ...caseForm, status: e.target.value })}>
              <option>نشطة</option>
              <option>انتظار</option>
              <option>منتهية</option>
            </select>

            <textarea placeholder="ملاحظات" value={caseForm.notes}
              onChange={(e) => setCaseForm({ ...caseForm, notes: e.target.value })} />

            <button>حفظ القضية</button>
          </form>
        </section>

        <section className="panel">
          <h2>القضايا والجلسات</h2>

          {cases.map((item) => (
            <div className="case-card" key={item.id}>
              <div className="case-head">
                <h3>{item.client_name}</h3>
                <span>{item.status}</span>
              </div>

              <p>رقم القضية: {item.case_number}</p>
              <p>نوع القضية: {item.case_type}</p>
              <p>المحكمة: {item.court}</p>
              <p>المسؤول: {item.lawyer}</p>

              <h4>الجلسات</h4>

              {item.sessions?.length ? (
                item.sessions.map((s) => (
                  <div className="session" key={s.id}>
                    <p>📅 {s.session_date}</p>
                    <p>⏰ {s.session_time}</p>
                    <p>🏛 {s.location}</p>
                    <p>📝 {s.notes}</p>
                  </div>
                ))
              ) : (
                <p className="empty">لا توجد جلسات</p>
              )}

              <div className="session-form">
                <input type="date" value={sessionForm[item.id]?.session_date || ''}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      [item.id]: { ...sessionForm[item.id], session_date: e.target.value },
                    })
                  } />

                <input placeholder="وقت الجلسة" value={sessionForm[item.id]?.session_time || ''}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      [item.id]: { ...sessionForm[item.id], session_time: e.target.value },
                    })
                  } />

                <input placeholder="مكان الجلسة" value={sessionForm[item.id]?.location || ''}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      [item.id]: { ...sessionForm[item.id], location: e.target.value },
                    })
                  } />

                <textarea placeholder="ملاحظات الجلسة" value={sessionForm[item.id]?.notes || ''}
                  onChange={(e) =>
                    setSessionForm({
                      ...sessionForm,
                      [item.id]: { ...sessionForm[item.id], notes: e.target.value },
                    })
                  } />

                <button onClick={() => addSession(item.id)}>حفظ الجلسة</button>
                <button onClick={() => printCase(item)}>طباعة القضية</button>
              </div>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

export default App