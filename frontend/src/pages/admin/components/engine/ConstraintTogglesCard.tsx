import { useState } from "react";
import { Card } from "../ui/index";
import { colors, fonts, radius } from "../../../../styles/tokens";
import { ChevronDown } from "lucide-react";

const HARD_ROWS = [
  {
    key: "hc1_enabled",
    label: "HC1 — One class per faculty at a time",
  },
  {
    key: "hc2_enabled",
    label: "HC2 — Department-first classroom assignment",
  },
  {
    key: "hc3_enabled",
    label: "HC3 — No compulsory-course clash per batch",
  },
];

const SOFT_ROWS = [
  {
    key: "sc1_enabled",
    label: "SC1 — Avoid unavailable/blocked slots",
  },
  {
    key: "sc2_enabled",
    label: "SC2 — Respect preferred days-off",
  },
];

function Switch({ checked, onChange, id }) {
  return (
    <label
      htmlFor={id}
      style={{
        position: "relative",
        display: "inline-flex",
        width: 42,
        height: 24,
        cursor: "pointer",
      }}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        style={{
          position: "absolute",
          opacity: 0,
          width: 0,
          height: 0,
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background: checked ? colors.primary.main : colors.border.strong,
          borderRadius: 999,
          transition: "all 0.2s ease",
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 22 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: colors.bg.base,
          transition: "all 0.2s ease",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </label>
  );
}

function ConstraintGroup({ title, rows, values, onChange }) {
  return (
    <div>
      <h4
        style={{
          margin: "0 0 10px 0",
          color: colors.text.primary,
          fontFamily: fonts.heading,
          fontSize: fonts.size.sm,
          fontWeight: fonts.weight.semibold,
        }}
      >
        {title}
      </h4>

      <div style={{ display: "grid", gap: "10px" }}>
        {rows.map((row) => {
          const checked = Boolean(values?.[row.key]);
          return (
            <div
              key={row.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "12px",
                padding: "12px",
                border: `1px solid ${colors.border.medium}`,
                borderRadius: radius.md,
                background: colors.bg.raised,
              }}
            >
              <div
                style={{
                  color: colors.text.primary,
                  fontSize: fonts.size.sm,
                  lineHeight: 1.35,
                }}
              >
                {row.label}
              </div>

              <Switch
                id={row.key}
                checked={checked}
                onChange={(next) => onChange(row.key, next)}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ConstraintTogglesCard({ values, onChange }) {
  const [open, setOpen] = useState(false);

  const activeCount = Object.values(values).filter(Boolean).length;
  const totalCount = HARD_ROWS.length + SOFT_ROWS.length;

  return (
    <Card style={{ marginBottom: "16px", overflow: "hidden" }}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "none",
          border: "none",
          cursor: "pointer",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontFamily: fonts.heading, fontSize: fonts.size.sm, fontWeight: fonts.weight.semibold, color: colors.text.primary }}>
            Constraint Toggles
          </span>
          <span style={{
            fontSize: fonts.size.xs,
            color: colors.text.muted,
            background: colors.bg.raised,
            border: `1px solid ${colors.border.subtle}`,
            borderRadius: 999,
            padding: "2px 8px",
          }}>
            {activeCount}/{totalCount} active
          </span>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: colors.text.muted,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div style={{ padding: "0 16px 16px" }}>
          <p style={{ margin: "0 0 14px 0", color: colors.text.muted, fontSize: fonts.size.xs }}>
            Select hard/soft constraints before running the solver.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", alignItems: "start" }}>
            <ConstraintGroup title="Hard Constraints" rows={HARD_ROWS} values={values} onChange={onChange} />
            <ConstraintGroup title="Soft Constraints" rows={SOFT_ROWS} values={values} onChange={onChange} />
          </div>
        </div>
      )}
    </Card>
  );
}
