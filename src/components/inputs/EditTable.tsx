// src/components/inputs/EditTable.tsx
import React from "react";
import type { OfferValues } from "../../utils/scoring";

type Props = {
  ben: OfferValues;
  karsi: OfferValues;
  onChangeBen: (v: OfferValues) => void;
  onChangeKarsi: (v: OfferValues) => void;
};

export default function EditTable({
  ben,
  karsi,
  onChangeBen,
  onChangeKarsi,
}: Props) {
  const row = (
    label: string,
    key: keyof OfferValues,
    suffix: string,
    step = 100
  ) => (
    <tr>
      <td style={tdLabel}>{label}</td>
      <td style={tdInput}>
        <Num
          value={ben[key]}
          onChange={(val) => onChangeBen({ ...ben, [key]: val })}
          step={step}
        />
        <span style={suffixStyle}>{suffix}</span>
      </td>
      <td style={tdInput}>
        <Num
          value={karsi[key]}
          onChange={(val) => onChangeKarsi({ ...karsi, [key]: val })}
          step={step}
        />
        <span style={suffixStyle}>{suffix}</span>
      </td>
    </tr>
  );

  return (
    <div>
      <table style={table}>
        <thead>
          <tr>
            <th style={th}>Kalem</th>
            <th style={th}>Ben</th>
            <th style={th}>Karşı</th>
          </tr>
        </thead>
        <tbody>
          {row("Maaş", "salary", "TL/ay")}
          {row("Yol", "commute", "TL/ay")}
          {row("Yemek", "meal", "TL/ay")}
          {row("İzin", "leave", "gün/yıl", 1)}
        </tbody>
      </table>
    </div>
  );
}

function Num({
  value,
  onChange,
  step = 100,
}: {
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <input
      type="number"
      step={step}
      value={Number.isFinite(value) ? value : 0}
      onChange={(e) => onChange(Number(e.target.value))}
      style={input}
    />
  );
}

// styles
const table: React.CSSProperties = {
  width: "100%",
  borderCollapse: "separate",
  borderSpacing: 0,
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  overflow: "hidden",
};

const th: React.CSSProperties = {
  textAlign: "left",
  background: "#f8fafc",
  color: "#0f172a",
  fontWeight: 700,
  padding: "12px 14px",
  borderBottom: "1px solid #e2e8f0",
};

const tdLabel: React.CSSProperties = {
  padding: "12px 14px",
  color: "#0f172a",
  width: 180,
  borderBottom: "1px solid #eef2f7",
};

const tdInput: React.CSSProperties = {
  padding: "12px 14px",
  borderBottom: "1px solid #eef2f7",
  position: "relative",
};

const input: React.CSSProperties = {
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  padding: "10px 12px",
  fontSize: 14,
  outline: "none",
};

const suffixStyle: React.CSSProperties = {
  position: "absolute",
  right: 16,
  top: 14,
  color: "#64748b",
  fontSize: 12,
};
