"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "./AuthContext";

const palette = {
  backgroundStart: "#f1f5f4",
  backgroundEnd: "#dfe5dd",
  primary: "#0f3b3e",
  primaryDark: "#0b2b2d",
  accent: "#0f766e"
};

const outerStyle = {
  minHeight: "100vh",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "32px",
  background: `linear-gradient(135deg, ${palette.backgroundStart}, ${palette.backgroundEnd})`
};

const contentStyle = {
  width: "min(100%, 1080px)",
  margin: "0 auto",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "34px"
};

const logoWrapperStyle = {
  width: "130px",
  height: "130px",
  borderRadius: "50%",
  background: palette.primary,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  boxShadow: "0 18px 40px rgba(15, 59, 62, 0.25)"
};

const titleStyle = {
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const mainTitleStyle = {
  fontSize: "clamp(2.8rem, 5vw, 3.8rem)",
  fontWeight: 700,
  color: palette.primary,
  margin: 0,
  lineHeight: 1.1
};

const subtitleStyle = {
  fontSize: "1.1rem",
  color: palette.primaryDark,
  margin: 0
};

const sloganStyle = {
  fontSize: "0.9rem",
  color: "#4b5563",
  margin: 0
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  borderRadius: "18px",
  background: "#ffffff",
  border: "1px solid rgba(148, 163, 184, 0.25)",
  boxShadow: "0 25px 60px rgba(15, 23, 42, 0.18)",
  padding: "32px 30px",
  display: "flex",
  flexDirection: "column",
  gap: "22px"
};

const inputGroupStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  textAlign: "left"
};

const labelStyle = {
  fontSize: "0.85rem",
  fontWeight: 600,
  color: "#1f2937"
};

const inputStyle = {
  width: "100%",
  borderRadius: "12px",
  border: "1px solid #cbd5e1",
  padding: "12px 14px",
  fontSize: "0.95rem",
  outline: "none",
  transition: "border-color 0.2s, box-shadow 0.2s"
};

const buttonStyle = (loading) => ({
  width: "100%",
  borderRadius: "999px",
  border: "none",
  padding: "12px",
  fontSize: "0.95rem",
  fontWeight: 600,
  color: "#ffffff",
  background: palette.primary,
  cursor: loading ? "not-allowed" : "pointer",
  boxShadow: "0 15px 35px rgba(15, 59, 62, 0.25)",
  transition: "transform 0.2s, box-shadow 0.2s",
  transform: loading ? "scale(1)" : "scale(1)"
});

const linkButtonStyle = {
  marginTop: "6px",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(15, 59, 62, 0.25)",
  background: "transparent",
  color: palette.primary,
  fontSize: "0.85rem",
  fontWeight: 600,
  cursor: "pointer"
};

const footerStyle = {
  position: "fixed",
  right: "26px",
  bottom: "22px",
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-end",
  fontSize: "0.75rem",
  color: palette.primary
};

export default function LoginScreen() {
  const router = useRouter();
  const { loginUser } = useAuth();

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => setMounted(true), []);

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();

      if (data.ok && data.user) {
        localStorage.setItem("kalon_user", JSON.stringify(data.user));
        localStorage.setItem("user", JSON.stringify(data.user));
        loginUser(data.user);
        setTimeout(() => router.push("/home"), 120);
      } else {
        setError(data.error || "Acesso não autorizado.");
      }
    } catch (err) {
      console.error("Erro de login:", err);
      setError("Não foi possível validar as credenciais. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleFocus = (event) => {
    event.target.style.borderColor = palette.primary;
    event.target.style.boxShadow = `0 0 0 3px ${palette.primary}22`;
  };

  const handleBlur = (event) => {
    event.target.style.borderColor = "#cbd5e1";
    event.target.style.boxShadow = "none";
  };

  if (!mounted) {
    return null;
  }

  return (
    <div style={outerStyle}>
      <div style={contentStyle}>
        <div style={logoWrapperStyle}>
          <img src="/logo.png" alt="KalonConnect" style={{ width: "88px", height: "88px", objectFit: "contain", filter: "brightness(0) invert(1)" }} />
        </div>

        <div style={titleStyle}>
          <h1 style={mainTitleStyle}>Bem-vindo(a) ao<br />KalonConnect</h1>
          <p style={subtitleStyle}>Tecnologia com Alma</p>
          <p style={sloganStyle}>Quando a Alma fala, o Corpo escuta e o Espírito conduz.</p>
        </div>

        <div style={cardStyle}>
          <div>
            <h2 style={{ fontSize: "1rem", fontWeight: 600, color: palette.primaryDark, marginBottom: "12px" }}>
              Acesse sua conta
            </h2>
            <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Email</label>
                <input
                  style={inputStyle}
                  type="email"
                  placeholder="seuemail@kalonconnect.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Senha</label>
                <input
                  style={inputStyle}
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onFocus={handleFocus}
                  onBlur={handleBlur}
                  required
                />
              </div>

              {error && (
                <div
                  style={{
                    borderRadius: "12px",
                    padding: "12px",
                    background: "#fee2e2",
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    fontSize: "0.85rem"
                  }}
                >
                  {error}
                </div>
              )}

              <button type="submit" disabled={loading} style={buttonStyle(loading)}>
                {loading ? "Validando dados..." : "Entrar"}
              </button>
            </form>
          </div>

          <button
            type="button"
            style={linkButtonStyle}
            onClick={() => router.push("/register")}
          >
            Primeira vez? Crie conta
          </button>
        </div>
      </div>

      <div style={footerStyle}>
        <span style={{ fontWeight: 600, marginBottom: "4px" }}>Desenvolvido por</span>
        <img src="/logo2.png" alt="Designer" style={{ maxWidth: "120px", marginBottom: "6px" }} />
        <a
          href="https://www.robertogama.com"
          target="_blank"
          rel="noreferrer"
          style={{ color: palette.primary, fontWeight: 600, textDecoration: "none" }}
        >
          www.robertogama.com
        </a>
      </div>
    </div>
  );
}
