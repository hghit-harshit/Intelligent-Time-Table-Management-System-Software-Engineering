import { useState } from "react";
import { Card } from "../ui/index";
import { colors, fonts, radius, shadows, transitions } from "../../../../styles/tokens";
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

type ConstraintKey =
  | "hc1_enabled"
  | "hc2_enabled"
  | "hc3_enabled"
  | "sc1_enabled"
  | "sc2_enabled";

type ConstraintValues = Partial<Record<ConstraintKey, boolean>>;

type SwitchProps = {
  checked: boolean;
  onChange: (value: boolean) => void;
  id: string;
};

function Switch({ checked, onChange, id }: SwitchProps) {
  return (
    <label
      htmlFor={id}
      style={{
        position: "relative",
        display: "inline-flex",
        width: 44,
        height: 24,
        cursor: "pointer",
        flexShrink: 0,
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
          background: checked ? colors.primary.main : colors.bg.raised,
          border: `1px solid ${checked ? colors.primary.border : colors.border.strong}`,
          borderRadius: 999,
          boxShadow: checked ? "0 2px 8px rgba(30, 58, 95, 0.25)" : "none",
          transition: transitions.smooth,
        }}
      />
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: 2,
          left: checked ? 22 : 2,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: colors.bg.base,
          transition: transitions.smooth,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
        }}
      />
    </label>
  );
}

type ConstraintRow = {
  key: ConstraintKey;
  label: string;
};

type ConstraintGroupProps = {
  title: string;
  rows: ConstraintRow[];
  values: ConstraintValues;
  onChange: (key: ConstraintKey, enabled: boolean) => void;
};

function ConstraintGroup({ title, rows, values, onChange }: ConstraintGroupProps) {
  return (
    <section
      style={{
        border: `1px solid ${colors.border.medium}`,
        borderRadius: radius.lg,
        padding: "11px",
        background:
          title === "Hard Constraints"
            ? "linear-gradient(180deg, rgba(30, 58, 95, 0.04) 0%, #FFFFFF 55%)"
            : "linear-gradient(180deg, rgba(100, 116, 139, 0.05) 0%, #FFFFFF 55%)",
      }}
    >
      <h4
        style={{
          margin: "0 0 10px 0",
          color: colors.text.primary,
          fontFamily: fonts.heading,
          fontSize: fonts.size.sm,
          fontWeight: fonts.weight.bold,
          textTransform: "uppercase",
          letterSpacing: fonts.letterSpacing.widest,
        }}
      >
        {title}
      </h4>

      <div style={{ display: "grid", gap: "12px" }}>
        {rows.map((row) => {
          const checked = Boolean(values?.[row.key]);
          const [codeRaw, descRaw] = row.label.split("—");
          const code = codeRaw?.trim() || "";
          const description = descRaw?.trim() || row.label;
          return (
            <div
              key={row.key}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "10px",
                padding: "9px 11px",
                border: `1px solid ${checked ? colors.primary.border : colors.border.strong}`,
                borderRadius: radius.md,
                background: checked
                  ? "linear-gradient(90deg, rgba(30, 58, 95, 0.08) 0%, rgba(30, 58, 95, 0.04) 100%)"
                  : colors.bg.base,
                boxShadow: checked ? shadows.sm : "none",
                transition: transitions.smooth,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
                <span
                  style={{
                    fontSize: fonts.size.xs,
                    color: checked ? colors.primary.main : colors.secondary.main,
                    border: `1px solid ${checked ? colors.primary.border : colors.border.medium}`,
                    background: checked ? colors.primary.ghost : colors.bg.raised,
                    borderRadius: 999,
                    padding: "3px 8px",
                    letterSpacing: fonts.letterSpacing.wider,
                    fontWeight: fonts.weight.semibold,
                    lineHeight: 1.2,
                  }}
                >
                  {code}
                </span>
                <div
                  style={{
                    color: colors.text.primary,
                    fontSize: fonts.size.sm,
                    fontWeight: fonts.weight.medium,
                    lineHeight: 1.4,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                  title={description}
                >
                  {description}
                </div>
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
    </section>
  );
}

type ConstraintTogglesCardProps = {
  values: ConstraintValues;
  onChange: (key: ConstraintKey, enabled: boolean) => void;
};

export default function ConstraintTogglesCard({ values, onChange }: ConstraintTogglesCardProps) {
  const [open, setOpen] = useState(true);

  const activeCount = Object.values(values).filter(Boolean).length;
  const totalCount = HARD_ROWS.length + SOFT_ROWS.length;

  return (
    <Card
      style={{
        marginBottom: "16px",
        overflow: "hidden",
        padding: 0,
        borderRadius: "16px",
      }}
    >
      <button
        onClick={() => setOpen((prev) => !prev)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 16px",
          background: "linear-gradient(180deg, rgba(30, 58, 95, 0.04) 0%, #FFFFFF 100%)",
          border: "none",
          borderBottom: `1px solid ${colors.border.medium}`,
          cursor: "pointer",
          gap: "12px",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          <span
            style={{
              fontFamily: fonts.heading,
              fontSize: fonts.size.lg,
              fontWeight: fonts.weight.bold,
              color: colors.text.primary,
              letterSpacing: fonts.letterSpacing.tight,
            }}
          >
            Constraint Toggles
          </span>
          <span
            style={{
              fontSize: fonts.size.sm,
              color: activeCount === totalCount ? colors.success.main : colors.text.secondary,
              background: activeCount === totalCount ? colors.success.ghost : colors.bg.raised,
              border: `1px solid ${
                activeCount === totalCount ? colors.success.border : colors.border.medium
              }`,
              borderRadius: 999,
              padding: "3px 9px",
              whiteSpace: "nowrap",
              fontWeight: fonts.weight.semibold,
            }}
          >
            {activeCount}/{totalCount} active
          </span>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: colors.text.muted,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: transitions.smooth,
            flexShrink: 0,
          }}
        />
      </button>

      {open && (
        <div style={{ padding: "12px 16px 16px" }}>
          <p
            style={{
              margin: "0 0 12px 0",
              color: colors.text.secondary,
              fontSize: fonts.size.sm,
              lineHeight: 1.45,
            }}
          >
            Select hard/soft constraints before running the solver.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "12px",
              alignItems: "start",
            }}
          >
            <ConstraintGroup
              title="Hard Constraints"
              rows={HARD_ROWS as ConstraintRow[]}
              values={values}
              onChange={onChange}
            />
            <ConstraintGroup
              title="Soft Constraints"
              rows={SOFT_ROWS as ConstraintRow[]}
              values={values}
              onChange={onChange}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
