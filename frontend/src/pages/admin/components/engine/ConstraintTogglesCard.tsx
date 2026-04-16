import { Card } from "../ui/index";
import { colors, fonts, radius } from "../../../../styles/tokens";

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
  return (
    <Card style={{ padding: "16px", marginBottom: "16px" }}>
      <h3
        style={{
          margin: "0 0 10px 0",
          color: colors.text.primary,
          fontFamily: fonts.heading,
          fontSize: fonts.size.md,
        }}
      >
        Constraint Toggles
      </h3>

      <p
        style={{
          margin: "0 0 14px 0",
          color: colors.text.muted,
          fontSize: fonts.size.xs,
        }}
      >
        Select hard/soft constraints before running the solver.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "14px",
          alignItems: "start",
        }}
      >
        <ConstraintGroup
          title="Hard Constraints"
          rows={HARD_ROWS}
          values={values}
          onChange={onChange}
        />
        <ConstraintGroup
          title="Soft Constraints"
          rows={SOFT_ROWS}
          values={values}
          onChange={onChange}
        />
      </div>
    </Card>
  );
}
