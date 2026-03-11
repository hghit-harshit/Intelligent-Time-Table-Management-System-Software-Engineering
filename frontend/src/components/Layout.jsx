import { useNavigate, useLocation } from "react-router-dom"

export default function Layout({ children }) {
  const navigate = useNavigate()
  const location = useLocation()

  const navigationItems = [
    { 
      section: "MAIN",
      items: [
        { icon: "📅", label: "My Timetable", path: "/StudentPage", badge: null },
        { icon: "📋", label: "Exam Schedule", path: "/exams", badge: "3" },
        { icon: "🔔", label: "Notifications", path: "/notifications", badge: "3" },
        { icon: "📚", label: "Courses", path: "/courses", badge: null },
        //{ icon: "📁", label: "Resources", path: "/resources", badge: null },
      ]
    },
    {
      section: "WORKSPACE", 
      items: [
        { icon: "📝", label: "My Notes", path: "/notes", badge: null },
        { icon: "✅", label: "Tasks", path: "/tasks", badge: null },
        { icon: "⏰", label: "Reminders", path: "/reminders", badge: null },
      ]
    },
    {
      section: "TOOLS",
      items: [
        { icon: "🤖", label: "AI Assistant", path: "/ai", badge: null },
        { icon: "🔗", label: "Integrations", path: "/integrations", badge: null },
      ]
    }
  ]

  const handleNavClick = (path) => {
    navigate(path)
  }

  const handleLogout = () => {
    navigate("/")
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a12",
      fontFamily: "'Space Mono', monospace",
      color: "#fff",
      display: "flex",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Space+Mono:wght@400;700&display=swap');
        
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.02); }
          66% { transform: translate(-15px, 15px) scale(0.98); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-25px, 20px) scale(1.05); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(96, 239, 255, 0.3); }
          50% { box-shadow: 0 0 0 8px rgba(96, 239, 255, 0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .glass-card {
          background: rgba(255,255,255,0.04);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          transition: all 0.25s ease;
        }
        .glass-card:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(96,239,255,0.2);
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 12px;
          border-radius: 10px;
          cursor: pointer;
          fontSize: 13px;
          marginBottom: 4px;
          color: rgba(255,255,255,0.6);
          transition: all 0.2s ease;
          border: 1px solid transparent;
        }
        .nav-item:hover {
          background: rgba(96,239,255,0.1);
          color: #60efff;
          transform: translateX(4px);
        }
        .nav-item.active {
          background: rgba(96,239,255,0.15);
          color: #60efff;
          border-color: rgba(96,239,255,0.2);
        }
      `}</style>

      {/* Floating Background Orbs */}
      <div style={{
        position: "absolute", width: "400px", height: "400px",
        borderRadius: "50%", top: "-100px", left: "-100px",
        background: "radial-gradient(circle, rgba(96,239,255,0.08) 0%, transparent 70%)",
        animation: "float1 12s ease-in-out infinite",
        pointerEvents: "none", zIndex: 1,
      }} />
      <div style={{
        position: "absolute", width: "350px", height: "350px",
        borderRadius: "50%", bottom: "-80px", right: "-60px",
        background: "radial-gradient(circle, rgba(167,139,250,0.1) 0%, transparent 70%)",
        animation: "float2 15s ease-in-out infinite",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Grid Overlay */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)
        `,
        backgroundSize: "40px 40px",
        pointerEvents: "none", zIndex: 1,
      }} />

      {/* Sidebar */}
      <div className="glass-card" style={{
        width: "280px",
        margin: "16px",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        zIndex: 10,
        animation: "fadeUp 0.6s ease",
      }}>
        {/* Logo */}
        <div style={{ marginBottom: "24px" }}>
          <h1 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: "24px", fontWeight: "700",
            margin: "0 0 4px",
            background: "linear-gradient(90deg, #60efff, #a78bfa)",
            backgroundSize: "200% auto",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 3s linear infinite",
          }}>
            SmartTimetable
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.4)",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            margin: 0,
          }}>
            ITMS • Student Portal
          </p>
        </div>

        {/* User Card */}
        <div className="glass-card" style={{
          padding: "16px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <div style={{
            width: "42px", height: "42px",
            background: "linear-gradient(135deg, #60efff, #a78bfa)",
            borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: "700", color: "#0a0a12", fontSize: "14px",
            animation: "pulse-glow 3s infinite",
          }}>
            RK
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "600", fontSize: "14px", color: "#fff" }}>
              Rishikesh K.
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
              ES23BTECH11033 • ECE
            </div>
          </div>
          <div style={{
            background: "#7c3aed",
            color: "#fff",
            fontSize: "10px",
            fontWeight: "700",
            padding: "4px 8px",
            borderRadius: "6px",
          }}>
            Y2S2
          </div>
        </div>

        {/* Navigation */}
        <div style={{ flex: 1 }}>
          {navigationItems.map((section, sectionIndex) => (
            <div key={section.section} style={{ marginBottom: "16px" }}>
              <p style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                marginBottom: "8px",
              }}>
                {section.section}
              </p>
              {section.items.map((item, i) => (
                <div 
                  key={item.path} 
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  onClick={() => handleNavClick(item.path)}
                  style={{
                    animation: `fadeUp 0.4s ${0.1 + (sectionIndex * 0.1) + i * 0.05}s ease both`,
                    opacity: 0,
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{item.icon}</span>
                  <span style={{ flex: 1 }}>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      background: "#ef4444",
                      color: "#fff",
                      fontSize: "10px",
                      fontWeight: "700",
                      padding: "2px 6px",
                      borderRadius: "10px",
                    }}>
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Settings and Logout */}
        <div style={{ 
          borderTop: "1px solid rgba(255,255,255,0.1)", 
          paddingTop: "16px",
          marginTop: "16px" 
        }}>
          <div className="nav-item" onClick={() => navigate('/settings')}>
            <span style={{ fontSize: "16px" }}>⚙️</span>
            <span>Settings</span>
          </div>
          <div className="nav-item" onClick={handleLogout} style={{ color: "rgba(239,68,68,0.8)" }}>
            <span style={{ fontSize: "16px" }}>↩️</span>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1, 
        position: "relative",
        zIndex: 10,
      }}>
        {children}
      </div>
    </div>
  )
}