// src/components/weights/WeightsPanel.tsx
import React from "react";
import type { Weights } from "../../utils/scoring";
import { sumWeights } from "../../utils/scoring";

type Props = {
  weights: Weights;
  onChange: (w: Weights) => void;
};

export default function WeightsPanel({ weights, onChange }: Props) {
  const total = sumWeights(weights);
  const item = (label: string, key: keyof Weights) => (
    <div style={row}>
      <div style={{ width: 120, color: "#0f172a", fontWeight: 600 }}>{label}</div>
      <input
        type="range"
        min={0}
        max={100}
        value={weights[key]}
        onChange={(e) => onChange({ ...weights, [key]: Number(e.target.value) })}
        style={{ flex: 1 }}
      />
      <div style={{ width: 50, textAlign: "right", color: "#0f172a" }}>
        {weights[key]}%
      </div>
    </div>
  );

  return (
    <div style={panel}>
      <div style={title}>Ağırlıklar</div>
      {item("Maaş", "salary")}
      {item("Yol", "commute")}
      {item("Yemek", "meal")}
      {item("İzin", "leave")}
      <div style={{ textAlign: "right", color: total === 100 ? "#059669" : "#b91c1c" }}>
        Toplam: <strong>{total}%</strong> {total !== 100 ? " (100 olmalı)" : ""}
      </div>
      <button
        style={btn}
        onClick={() => {
          const avg = Math.round(100 / 4);
          onChange({ salary: avg, commute: avg, meal: avg, leave: 100 - 3 * avg });
        }}
      >
        Dengele (eşit dağıt)
      </button>
    </div>
  );
}

// styles
const panel: React.CSSProperties = {
  border: "1px solid #e2e8f0",
  borderRadius: 12,
  padding: 16,
  background: "#fff",
};

const title: React.CSSProperties = {
  fontWeight: 800,
  marginBottom: 8,
  color: "#0f172a",
};

const row: React.CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  margin: "8px 0",
};

const btn: React.CSSProperties = {
  marginTop: 12,
  background: "#2563eb",
  color: "#fff",
  padding: "10px 12px",
  borderRadius: 10,
  border: "none",
  cursor: "pointer",
  fontWeight: 600,
};
