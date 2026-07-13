import { useState } from "react";
import { supabase } from "../supabase";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) return alert("اكتب الإيميل وكلمة السر");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) alert("خطأ في تسجيل الدخول: " + error.message);
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #1a1a2e 0%, #7c1c1c 100%)",
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "40px",
        width: "320px",
        textAlign: "center",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        <img src="/logo.png" alt="logo" style={{ width: "80px", marginBottom: "15px" }} />
        <h2 style={{ color: "#7c1c1c", margin: "0 0 5px 0" }}>مكتب أنس الحيدر</h2>
        <p style={{ color: "#888", fontSize: "13px", margin: "0 0 25px 0" }}>للمحاماة والاستشارات القانونية</p>

        <input
          type="email"
          placeholder="الإيميل"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "12px", fontSize: "14px", boxSizing: "border-box", direction: "ltr" }}
        />
        <input
          type="password"
          placeholder="كلمة السر"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #ddd", marginBottom: "20px", fontSize: "14px", boxSizing: "border-box", direction: "ltr" }}
        />
        <button
          onClick={handleLogin}
          disabled={loading}
          style={{ width: "100%", padding: "12px", background: "#7c1c1c", color: "white", border: "none", borderRadius: "8px", fontSize: "15px", cursor: "pointer" }}
        >
          {loading ? "جاري الدخول..." : "تسجيل الدخول"}
        </button>
      </div>
    </div>
  );
}

export default Login;
