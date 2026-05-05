// ============================================================
// REUSABLE UI COMPONENTS — Design system primitives
// Uses token-based light theme matching project design system
// ============================================================
import {
  colors,
  fonts,
  radius,
  shadows,
  transitions,
} from "../../../../styles/tokens";

// ─── Glass Card ─────────────────────────────────────────────
export function Card({
  children,
  style,
  onClick,
  hover = true,
  className = "",
}: any) {
  return (
    <div
      className={`admin-card ${hover ? "admin-card-hover" : ""} ${className}`}
      onClick={onClick}
      style={{
        background: colors.bg.base,
        border: `1px solid ${colors.border.medium}`,
        borderRadius: radius.xl,
        padding: "20px",
        transition: transitions.smooth,
        cursor: onClick ? "pointer" : "default",
        boxShadow: shadows.sm,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Badge ──────────────────────────────────────────────────
const badgeColors = {
  success: {
    bg: colors.success.ghost,
    color: colors.success.main,
    border: colors.success.border,
  },
  warning: {
    bg: colors.warning.ghost,
    color: colors.warning.main,
    border: colors.warning.border,
  },
  danger: {
    bg: colors.error.ghost,
    color: colors.error.main,
    border: colors.error.border,
  },
  info: {
    bg: colors.info.ghost,
    color: colors.info.main,
    border: "rgba(37,99,235,0.15)",
  },
  neutral: {
    bg: colors.bg.raised,
    color: colors.text.secondary,
    border: colors.border.medium,
  },
  purple: {
    bg: "rgba(109,40,217,0.06)",
    color: "#6D28D9",
    border: "rgba(109,40,217,0.15)",
  },
};

export function Badge({ children, variant = "info", style }: any) {
  const c = badgeColors[variant] || badgeColors.info;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontSize: fonts.size.xs,
        fontWeight: fonts.weight.semibold,
        padding: "3px 10px",
        borderRadius: radius.full,
        background: c.bg,
        color: c.color,
        border: `1px solid ${c.border}`,
        whiteSpace: "nowrap",
        fontFamily: fonts.body,
        ...style,
      }}
    >
      {children}
    </span>
  );
}

// ─── Button ─────────────────────────────────────────────────
const buttonVariants = {
  primary: {
    background: colors.primary.main,
    color: "#FFFFFF",
    border: "none",
  },
  secondary: {
    background: colors.bg.raised,
    color: colors.text.primary,
    border: `1px solid ${colors.border.medium}`,
  },
  danger: {
    background: colors.error.ghost,
    color: colors.error.main,
    border: `1px solid ${colors.error.border}`,
  },
  success: {
    background: colors.success.ghost,
    color: colors.success.main,
    border: `1px solid ${colors.success.border}`,
  },
  ghost: {
    background: "transparent",
    color: colors.text.secondary,
    border: "1px solid transparent",
  },
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled,
  style,
  icon,
}: any) {
  const v = buttonVariants[variant] || buttonVariants.primary;
  const sizes = {
    sm: { padding: "6px 12px", fontSize: fonts.size.xs },
    md: { padding: "8px 16px", fontSize: fonts.size.base },
    lg: { padding: "10px 24px", fontSize: fonts.size.md },
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
        borderRadius: radius.md,
        fontWeight: fonts.weight.semibold,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        transition: transitions.smooth,
        fontFamily: fonts.body,
        ...style,
      }}
    >
      {icon && (
        <span style={{ display: "flex", alignItems: "center" }}>{icon}</span>
      )}
      {children}
    </button>
  );
}

// ─── Data Table ─────────────────────────────────────────────
export function DataTable({
  columns,
  data,
  onRowClick,
  emptyMessage = "No data found",
}: any) {
  if (!data || data.length === 0) {
    return (
      <div
        style={{
          textAlign: "center",
          padding: "40px 20px",
          color: colors.text.muted,
        }}
      >
        <div style={{ fontSize: fonts.size.base }}>{emptyMessage}</div>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: fonts.size.base,
          fontFamily: fonts.body,
        }}
      >
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                style={{
                  textAlign: col.align || "left",
                  padding: "10px 12px",
                  color: colors.text.muted,
                  fontWeight: fonts.weight.semibold,
                  fontSize: fonts.size.xs,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  borderBottom: `1px solid ${colors.border.medium}`,
                  whiteSpace: "nowrap",
                  width: col.width || "auto",
                }}
              >
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = colors.primary.ghost)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  style={{
                    padding: "12px",
                    borderBottom: `1px solid ${colors.border.subtle}`,
                    color: colors.text.secondary,
                    textAlign: col.align || "left",
                    verticalAlign: "middle",
                  }}
                >
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
export function SearchInput({
  value,
  onChange,
  placeholder = "Search...",
}: any) {
  return (
    <div
      style={{
        position: "relative",
        display: "flex",
        alignItems: "center",
      }}
    >
      <span
        style={{
          position: "absolute",
          left: "12px",
          color: colors.text.muted,
          fontSize: "14px",
          pointerEvents: "none",
          display: "flex",
          alignItems: "center",
        }}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%",
          padding: "8px 12px 8px 36px",
          background: colors.bg.raised,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.md,
          color: colors.text.primary,
          fontSize: fonts.size.base,
          fontFamily: fonts.body,
          transition: transitions.smooth,
          outline: "none",
        }}
        onFocus={(e) => {
          e.target.style.borderColor = colors.primary.border;
          e.target.style.background = colors.bg.base;
          e.target.style.boxShadow = `0 0 0 3px ${colors.primary.ghost}`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = colors.border.medium;
          e.target.style.background = colors.bg.raised;
          e.target.style.boxShadow = "none";
        }}
      />
    </div>
  );
}

// ─── Tab Bar ────────────────────────────────────────────────
export function TabBar({ tabs, activeTab, onChange }: any) {
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        padding: "4px",
        background: colors.bg.raised,
        borderRadius: radius.lg,
        border: `1px solid ${colors.border.subtle}`,
      }}
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          style={{
            padding: "6px 14px",
            borderRadius: radius.md,
            border: "none",
            fontSize: fonts.size.sm,
            fontWeight: fonts.weight.semibold,
            cursor: "pointer",
            transition: transitions.smooth,
            fontFamily: fonts.body,
            background: activeTab === tab.id ? colors.bg.base : "transparent",
            color:
              activeTab === tab.id ? colors.primary.main : colors.text.muted,
            boxShadow: activeTab === tab.id ? shadows.sm : "none",
          }}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              style={{
                marginLeft: "6px",
                fontSize: fonts.size.xs,
                padding: "1px 6px",
                borderRadius: radius.full,
                background:
                  activeTab === tab.id
                    ? colors.primary.ghost
                    : colors.bg.raised,
              }}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Stat Card ──────────────────────────────────────────────
export function StatCard({
  icon,
  title,
  value,
  trend,
  trendDirection,
  color,
  onClick,
}: any) {
  const trendColors = {
    up: colors.success.main,
    down: colors.error.main,
    neutral: colors.text.muted,
  };

  return (
    <Card onClick={onClick} style={{ padding: "10px 12px", borderRadius: radius.md }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "4px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: radius.lg,
            background: `${color}12`,
            border: `1px solid ${color}20`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
          }}
        >
          {icon}
        </div>
      </div>
      <div
        style={{
          fontSize: fonts.size.xl,
          fontWeight: fonts.weight.bold,
          color: colors.text.primary,
          marginBottom: "0px",
          fontFamily: fonts.heading,
        }}
      >
        {value}
      </div>
      <div
        style={{
          fontSize: fonts.size.xs,
          color: colors.text.muted,
          marginBottom: "0px",
        }}
      >
        {title}
      </div>
      {trend && (
        <div
          style={{
            fontSize: fonts.size.xs,
            fontWeight: fonts.weight.semibold,
            color: trendColors[trendDirection] || trendColors.neutral,
          }}
        >
          {trend}
        </div>
      )}
    </Card>
  );
}

// ─── Empty State ────────────────────────────────────────────
export function EmptyState({ title, description }: any) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        color: colors.text.muted,
      }}
    >
      <div
        style={{
          fontSize: "16px",
          fontWeight: fonts.weight.semibold,
          color: colors.text.secondary,
          marginBottom: "8px",
        }}
      >
        {title}
      </div>
      {description && (
        <div style={{ fontSize: fonts.size.base }}>{description}</div>
      )}
    </div>
  );
}

// ─── Loading Spinner ────────────────────────────────────────
export function Loader() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          border: `2px solid ${colors.border.medium}`,
          borderTop: `2px solid ${colors.primary.main}`,
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
    </div>
  );
}

// ─── Page Header (admin pages) ──────────────────────────────
/**
 * PageHeader — Renders the standard admin page title + muted subtitle.
 * WHY: This exact heading block was copy-pasted across 14 admin pages.
 *
 * Props:
 *   title    — main heading text
 *   subtitle — smaller muted description below the title
 *   action   — optional React node rendered on the right (e.g. a Button)
 */
export function PageHeader({ title, subtitle, action }: any) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
      }}
    >
      <div>
        <h1
          style={{
            fontSize: fonts.size["2xl"],
            fontWeight: fonts.weight.bold,
            color: colors.text.primary,
            margin: "0 0 4px",
            fontFamily: fonts.heading,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              fontSize: fonts.size.sm,
              color: colors.text.muted,
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

// ─── Sub-Page Header (student / faculty pages) ──────────────
/**
 * SubPageHeader — Card-style top bar with a coloured accent stripe.
 * WHY: This pattern (accent bar + bold title + caption + right-side actions)
 *      was duplicated in 5 student/faculty pages.
 *
 * Props:
 *   title       — heading text
 *   subtitle    — muted caption below the title
 *   accentColor — the 3px vertical bar colour (default: primary)
 *   actions     — optional React node for the right side (buttons, selects, etc.)
 */
export function SubPageHeader({
  title,
  subtitle,
  accentColor = colors.primary.main,
  actions,
}: any) {
  return (
    <div
      style={{
        background: colors.bg.base,
        border: `1px solid ${colors.border.medium}`,
        borderRadius: radius.lg,
        boxShadow: shadows.sm,
        marginBottom: "12px",
        padding: "10px 16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: 3,
              height: 20,
              borderRadius: "2px",
              background: accentColor,
            }}
          />
          <h2
            style={{
              fontFamily: fonts.heading,
              fontWeight: 700,
              color: colors.text.primary,
              fontSize: "15px",
              margin: 0,
            }}
          >
            {title}
          </h2>
        </div>
        {subtitle && (
          <p
            style={{
              fontSize: fonts.size.xs,
              color: colors.text.muted,
              margin: "4px 0 0 11px",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {actions && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {actions}
        </div>
      )}
    </div>
  );
}

// ─── Stats Grid ─────────────────────────────────────────────
/**
 * StatsGrid — A responsive row of stat cards (coloured number + label).
 * WHY: The same 4-column grid was copy-pasted in 6+ student/faculty/admin pages.
 *
 * Props:
 *   stats — Array of { num: string, label: string, color: string }
 */
export function StatsGrid({ stats }: any) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${stats.length}, 1fr)`,
        gap: "10px",
        marginBottom: "12px",
      }}
    >
      {stats.map((stat, i) => (
        <Card
          key={i}
          style={{ padding: "12px", textAlign: "center" }}
          hover={false}
        >
          <div
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: stat.color,
              marginBottom: "2px",
              fontVariantNumeric: "tabular-nums",
              fontFamily: fonts.heading,
            }}
          >
            {stat.num}
          </div>
          <div
            style={{ fontSize: fonts.size.sm, color: colors.text.secondary }}
          >
            {stat.label}
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── Modal ──────────────────────────────────────────────────
/**
 * Modal — Reusable backdrop + centred card wrapper.
 * WHY: The same fixed-overlay + stop-propagation pattern was repeated in 5+ pages.
 * Clicking the dark backdrop calls onClose. Content clicks don't propagate.
 *
 * Props:
 *   open     — boolean, whether the modal is visible
 *   onClose  — function called when backdrop is clicked
 *   maxWidth — optional max-width string (default "500px")
 *   children — the modal body content
 */
export function Modal({ open, onClose, maxWidth = "500px", children }: any) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: colors.bg.base,
          border: `1px solid ${colors.border.medium}`,
          borderRadius: radius.xl,
          padding: "24px",
          maxWidth,
          width: "90%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: shadows.xl,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
