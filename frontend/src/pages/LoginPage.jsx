import { useState } from "react"
import { useNavigate } from "react-router-dom"

const roles = [
  {
    id: "student",
    label: "Student",
    icon: "◎",
    desc: "View your schedule & classes",
    color: "#60efff",
  },
  {
    id: "faculty",
    label: "Faculty",
    icon: "◈",
    desc: "Manage lectures & availability",
    color: "#a78bfa",
  },
  {
    id: "admin",
    label: "Admin",
    icon: "◆",
    desc: "Full system control",
    color: "#fb923c",
  },
]

export default function Login() {
  const [role, setRole] = useState("student")
  const [hoveredRole, setHoveredRole] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const selected = roles.find((r) => r.id === role)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      navigate("/dashboard")
      setLoading(false)
    }, 1200)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a12",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "'Courier New', monospace",
      overflow: "hidden",
      position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Space+Mono:wght@400;700&display=swap');

        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -40px) scale(1.05); }
          66% { transform: translate(-20px, 20px) scale(0.97); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-35px, 30px) scale(1.08); }
        }
        @keyframes float3 {
          0%, 100% { transform: translate(0, 0); }
          40% { transform: translate(20px, -25px); }
          80% { transform: translate(-15px, 15px); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(96, 239, 255, 0.3); }
          70% { box-shadow: 0 0 0 10px rgba(96, 239, 255, 0); }
          100% { box-shadow: 0 0 0 0 rgba(96, 239, 255, 0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .role-card {
          transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          cursor: pointer;
        }
        .role-card:hover {
          transform: translateY(-3px) scale(1.02);
        }
        .login-btn {
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 40px rgba(96, 239, 255, 0.3);
        }
        .login-btn:active:not(:disabled) {
          transform: translateY(0px) scale(0.98);
        }
        .login-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }
        .login-btn:hover::after {
          transform: translateX(100%);
        }
      `}</style>

      {/* Floating orbs */}
      <div style={{
        position: "absolute", width: "500px", height: "500px",
        borderRadius: "50%", top: "-150px", left: "-150px",
        background: "radial-gradient(circle, rgba(96,239,255,0.12) 0%, transparent 70%)",
        animation: "float1 9s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "400px", height: "400px",
        borderRadius: "50%", bottom: "-100px", right: "-80px",
        background: "radial-gradient(circle, rgba(167,139,250,0.14) 0%, transparent 70%)",
        animation: "float2 12s ease-in-out infinite",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", width: "250px", height: "250px",
        borderRadius: "50%", bottom: "20%", left: "10%",
        background: "radial-gradient(circle, rgba(251,146,60,0.1) 0%, transparent 70%)",
        animation: "float3 7s ease-in-out infinite",
        pointerEvents: "none",
      }} />

      {/* Grid overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
        `,
        backgroundSize: "48px 48px",
        pointerEvents: "none",
      }} />

      {/* Card */}
      <div style={{
        width: "420px",
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(24px)",
        border: "1px solid rgba(255,255,255,0.09)",
        borderRadius: "24px",
        padding: "44px 40px 40px",
        boxShadow: "0 32px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
        animation: "fadeUp 0.6s ease both",
        position: "relative",
        zIndex: 10,
      }}>

        {/* Rotating deco ring */}
        <div style={{
          position: "absolute", top: "-20px", right: "-20px",
          width: "80px", height: "80px",
          border: "1px dashed rgba(96,239,255,0.25)",
          borderRadius: "50%",
          animation: "spin-slow 20s linear infinite",
        }} />

        {/* Header */}
        <div style={{ marginBottom: "32px", animation: "fadeUp 0.6s 0.1s ease both", opacity: 0 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            background: "rgba(96,239,255,0.08)", border: "1px solid rgba(96,239,255,0.2)",
            borderRadius: "100px", padding: "4px 12px", marginBottom: "16px",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#60efff", animation: "pulse-ring 2s infinite" }} />
            <span style={{ color: "#60efff", fontSize: "11px", letterSpacing: "0.12em", fontFamily: "'Space Mono', monospace", textTransform: "uppercase" }}>
              Live System
            </span>
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "32px", fontWeight: "700",
            color: "#fff", margin: "0 0 6px",
            lineHeight: 1.15,
          }}>
            Timetable<br />
            <span style={{
              background: "linear-gradient(90deg, #60efff, #a78bfa, #60efff)",
              backgroundSize: "200% auto",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "shimmer 4s linear infinite",
            }}>
              Portal
            </span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", margin: 0, fontFamily: "'Space Mono', monospace" }}>
            Select your access level to continue
          </p>
        </div>

        {/* Role selector */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "28px" }}>
          {roles.map((r, i) => {
            const isSelected = role === r.id
            const isHovered = hoveredRole === r.id
            return (
              <div
                key={r.id}
                className="role-card"
                onClick={() => setRole(r.id)}
                onMouseEnter={() => setHoveredRole(r.id)}
                onMouseLeave={() => setHoveredRole(null)}
                style={{
                  display: "flex", alignItems: "center", gap: "16px",
                  padding: "14px 16px", borderRadius: "14px",
                  border: isSelected
                    ? `1px solid ${r.color}55`
                    : "1px solid rgba(255,255,255,0.06)",
                  background: isSelected
                    ? `linear-gradient(135deg, ${r.color}12, ${r.color}06)`
                    : isHovered
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.02)",
                  animation: `fadeUp 0.5s ${0.15 + i * 0.08}s ease both`,
                  opacity: 0,
                }}
              >
                <div style={{
                  width: "40px", height: "40px",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  borderRadius: "10px",
                  background: isSelected ? `${r.color}20` : "rgba(255,255,255,0.05)",
                  fontSize: "18px", color: isSelected ? r.color : "rgba(255,255,255,0.3)",
                  transition: "all 0.25s ease",
                  flexShrink: 0,
                }}>
                  {r.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{
                    color: isSelected ? "#fff" : "rgba(255,255,255,0.6)",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "13px", fontWeight: "700",
                    letterSpacing: "0.05em", transition: "color 0.2s",
                  }}>
                    {r.label}
                  </div>
                  <div style={{
                    color: isSelected ? "rgba(255,255,255,0.45)" : "rgba(255,255,255,0.2)",
                    fontSize: "11px", marginTop: "2px",
                    transition: "color 0.2s",
                  }}>
                    {r.desc}
                  </div>
                </div>
                {isSelected && (
                  <div style={{
                    width: "8px", height: "8px",
                    borderRadius: "50%", background: r.color,
                    boxShadow: `0 0 10px ${r.color}`,
                    flexShrink: 0,
                  }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Login button */}
        <button
          className="login-btn"
          onClick={handleLogin}
          disabled={loading}
          style={{
            width: "100%", padding: "15px",
            borderRadius: "14px", border: "none",
            background: loading
              ? "rgba(96,239,255,0.1)"
              : `linear-gradient(135deg, ${selected.color}, ${selected.color}bb)`,
            color: loading ? "rgba(255,255,255,0.4)" : "#0a0a12",
            fontFamily: "'Space Mono', monospace",
            fontSize: "13px", fontWeight: "700",
            letterSpacing: "0.1em", textTransform: "uppercase",
            cursor: loading ? "not-allowed" : "pointer",
            animation: "fadeUp 0.5s 0.4s ease both",
            opacity: 0,
            boxShadow: loading ? "none" : `0 8px 24px ${selected.color}30`,
            transition: "background 0.3s, box-shadow 0.3s, color 0.3s",
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <span style={{
                display: "inline-block", width: "14px", height: "14px",
                border: "2px solid rgba(255,255,255,0.2)",
                borderTopColor: "rgba(255,255,255,0.7)",
                borderRadius: "50%",
                animation: "spin-slow 0.7s linear infinite",
              }} />
              Authenticating...
            </span>
          ) : (
            `Enter as ${selected.label} →`
          )}
        </button>

        {/* Footer */}
        <p style={{
          textAlign: "center", marginTop: "20px", marginBottom: 0,
          color: "rgba(255,255,255,0.15)", fontSize: "11px",
          fontFamily: "'Space Mono', monospace",
          animation: "fadeUp 0.5s 0.5s ease both", opacity: 0,
        }}>
          Academic Management System · v0.1
        </p>
      </div>
    </div>
  )
}