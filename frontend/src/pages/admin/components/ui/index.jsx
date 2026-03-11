// ============================================================
// REUSABLE UI COMPONENTS — Design system primitives
// Matches the existing ITMS glass-card dark theme
// ============================================================

// ─── Glass Card ─────────────────────────────────────────────
export function Card({ children, style, onClick, hover = true, className = "" }) {
  return (
    <div
      className={`admin-card ${hover ? "admin-card-hover" : ""} ${className}`}
      onClick={onClick}
      style={{
        background: "rgba(255,255,255,0.04)",
        backdropFilter: "blur(20px)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "20px",
        transition: "all 0.25s ease",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Badge ──────────────────────────────────────────────────
const badgeColors = {
  success: { bg: "rgba(34,197,94,0.15)", color: "#22c55e", border: "rgba(34,197,94,0.2)" },
  warning: { bg: "rgba(245,158,11,0.15)", color: "#f59e0b", border: "rgba(245,158,11,0.2)" },
  danger: { bg: "rgba(239,68,68,0.15)", color: "#ef4444", border: "rgba(239,68,68,0.2)" },
  info: { bg: "rgba(96,239,255,0.15)", color: "#60efff", border: "rgba(96,239,255,0.2)" },
  neutral: { bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", border: "rgba(255,255,255,0.1)" },
  purple: { bg: "rgba(167,139,250,0.15)", color: "#a78bfa", border: "rgba(167,139,250,0.2)" },
};

export function Badge({ children, variant = "info", style }) {
  const c = badgeColors[variant] || badgeColors.info;
  return (
    <span style={{
      display: "inline-flex",
      alignItems: "center",
      fontSize: "11px",
      fontWeight: "600",
      padding: "3px 10px",
      borderRadius: "20px",
      background: c.bg,
      color: c.color,
      border: `1px solid ${c.border}`,
      whiteSpace: "nowrap",
      ...style,
    }}>
      {children}
    </span>
  );
}

// ─── Button ─────────────────────────────────────────────────
const buttonVariants = {
  primary: {
    background: "linear-gradient(135deg, #60efff, #3b82f6)",
    color: "#0a0a12",
    border: "none",
  },
  secondary: {
    background: "rgba(255,255,255,0.06)",
    color: "rgba(255,255,255,0.8)",
    border: "1px solid rgba(255,255,255,0.12)",
  },
  danger: {
    background: "rgba(239,68,68,0.15)",
    color: "#ef4444",
    border: "1px solid rgba(239,68,68,0.25)",
  },
  success: {
    background: "rgba(34,197,94,0.15)",
    color: "#22c55e",
    border: "1px solid rgba(34,197,94,0.25)",
  },
  ghost: {
    background: "transparent",
    color: "rgba(255,255,255,0.6)",
    border: "1px solid transparent",
  },
};

export function Button({ children, variant = "primary", size = "md", onClick, disabled, style, icon }) {
  const v = buttonVariants[variant] || buttonVariants.primary;
  const sizes = {
    sm: { padding: "6px 12px", fontSize: "11px" },
    md: { padding: "8px 16px", fontSize: "13px" },
    lg: { padding: "10px 24px", fontSize: "14px" },
  };
  const s = sizes[size] || sizes.md;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="admin-btn"
      style={{
        ...v,
        ...s,
        borderRadius: "8px",
        fontWeight: "600",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: "all 0.2s ease",
        fontFamily: "'Space Mono', monospace",
        ...style,
      }}
    >
      {icon && <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>}
      {children}
    </button>
  );
}

// ─── Data Table ─────────────────────────────────────────────
export function DataTable({ columns, data, onRowClick, emptyMessage = "No data found" }) {
  if (!data || data.length === 0) {
    return (
      <div style={{
        textAlign: "center",
        padding: "40px 20px",
        color: "rgba(255,255,255,0.3)",
      }}>
        <div style={{ fontSize: "28px", marginBottom: "8px" }}>📭</div>
        <div style={{ fontSize: "13px" }}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        fontSize: "13px",
      }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{
                textAlign: col.align || "left",
                padding: "10px 12px",
                color: "rgba(255,255,255,0.4)",
                fontWeight: "600",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                borderBottom: "1px solid rgba(255,255,255,0.06)",
                whiteSpace: "nowrap",
                width: col.width || "auto",
              }}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={row.id || rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              style={{
                cursor: onRowClick ? "pointer" : "default",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.03)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              {columns.map((col) => (
                <td key={col.key} style={{
                  padding: "12px",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  color: "rgba(255,255,255,0.8)",
                  textAlign: col.align || "left",
                  verticalAlign: "middle",
                }}>
                  {col.render ? col.render(row[col.key], row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Search Input ───────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = "Search..." }) {
  return (
    <div style={{
      position: "relative",
      display: "flex",
      alignItems: "center",
    }}>
      <span style={{
        position: "absolute",
        left: "12px",
        color: "rgba(255,255,255,0.3)",
        fontSize: "14px",
        pointerEvents: "none",
      }}>🔍</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 12px 8px 36px",
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "13px",
          fontFamily: "'Space Mono', monospace",
          transition: "all 0.2s ease",
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = "rgba(96,239,255,0.3)";
          e.target.style.background = "rgba(255,255,255,0.08)";
        }}
        onBlur={(e) => {
          e.target.style.borderColor = "rgba(255,255,255,0.1)";
          e.target.style.background = "rgba(255,255,255,0.05)";
        }}
      />
    </div>
  );
}

// ─── Tab Bar ────────────────────────────────────────────────
export function TabBar({ tabs, activeTab, onChange }) {
  return (
    <div style={{
      display: "flex",
      gap: "4px",
      padding: "4px",
      background: "rgba(255,255,255,0.03)",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.06)",
    }}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "6px 14px",
            borderRadius: "8px",
            border: "none",
            fontSize: "12px",
            fontWeight: "600",
            cursor: "pointer",
            transition: "all 0.2s ease",
            fontFamily: "'Space Mono', monospace",
            background: activeTab === tab.id ? "rgba(96,239,255,0.15)" : "transparent",
            color: activeTab === tab.id ? "#60efff" : "rgba(255,255,255,0.5)",
          }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span style={{
              marginLeft: "6px",
              fontSize: "10px",
              padding: "1px 6px",
              borderRadius: "10px",
              background: activeTab === tab.id ? "rgba(96,239,255,0.2)" : "rgba(255,255,255,0.08)",
            }}>
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────
export function StatCard({ icon, title, value, trend, trendDirection, color, onClick }) {
  const trendColors = {
    up: "#22c55e",
    down: "#ef4444",
    neutral: "rgba(255,255,255,0.4)",
  };

  return (
    <Card onClick={onClick} style={{ padding: "18px" }}>
      <div style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        marginBottom: "12px",
      }}>
        <div style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          background: `${color}15`,
          border: `1px solid ${color}25`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "16px",
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        fontSize: "24px",
        fontWeight: "700",
        color: "#fff",
        marginBottom: "4px",
        fontFamily: "'Space Mono', monospace",
      }}>
        {value}
      </div>
      <div style={{
        fontSize: "11px",
        color: "rgba(255,255,255,0.5)",
        marginBottom: "4px",
      }}>
        {title}
      </div>
      {trend && (
        <div style={{
          fontSize: "11px",
          fontWeight: "600",
          color: trendColors[trendDirection] || trendColors.neutral,
        }}>
          {trend}
        </div>
      )}
    </Card>
  );
}

// ─── Empty State ────────────────────────────────────────────
export function EmptyState({ icon = "📭", title, description }) {
  return (
    <div style={{
      textAlign: "center",
      padding: "60px 20px",
      color: "rgba(255,255,255,0.3)",
    }}>
      <div style={{ fontSize: "40px", marginBottom: "16px" }}>{icon}</div>
      <div style={{ fontSize: "16px", fontWeight: "600", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>{title}</div>
      {description && <div style={{ fontSize: "13px" }}>{description}</div>}
    </div>
  );
}

// ─── Loading Spinner ────────────────────────────────────────
export function Loader() {
  return (
    <div style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "40px",
    }}>
      <div style={{
        width: "24px",
        height: "24px",
        border: "2px solid rgba(96,239,255,0.2)",
        borderTop: "2px solid #60efff",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
    </div>
  );
}
