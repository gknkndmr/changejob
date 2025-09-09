// src/pages/Detay.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

/* ------------------------------------------------------------------ */
/* Tipler                                                              */
/* ------------------------------------------------------------------ */
type Offer = {
  maas: number;  // TL/ay
  yol: number;   // TL/ay
  yemek: number; // TL/ay
  izin: number;  // gün/yıl
};

type Weights = {
  maas: number;
  yol: number;
  yemek: number;
  izin: number;
};

/* ------------------------------------------------------------------ */
/* Varsayılan Veriler                                                  */
/* ------------------------------------------------------------------ */
const BEN: Offer = { maas: 35000, yol: 1500, yemek: 2500, izin: 14 };
const KARSI: Offer = { maas: 38000, yol: 2000, yemek: 2500, izin: 18 };
const DEFAULT_W: Weights = { maas: 40, yol: 20, yemek: 15, izin: 25 };

const TL = new Intl.NumberFormat("tr-TR", {
  style: "currency",
  currency: "TRY",
  maximumFractionDigits: 0,
});

/* ------------------------------------------------------------------ */
/* Yardımcılar                                                         */
/* ------------------------------------------------------------------ */
const clamp = (v: number, min = 0, max = 100) => Math.max(min, Math.min(max, v));
const sumW = (w: Weights) => w.maas + w.yol + w.yemek + w.izin;
const round1 = (n: number) => Math.round(n * 10) / 10;

function normalize(a: number, b: number) {
  const m = Math.max(a, b, 0.0001);
  return { a: (a / m) * 100, b: (b / m) * 100 };
}

/* ------------------------------------------------------------------ */
/* Sayfa                                                               */
/* ------------------------------------------------------------------ */
export default function Detay() {
  // Ağırlıklar (kalıcı)
  const LS_KEY = "cj_weights_v1";
  const [weights, setWeights] = useState<Weights>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed: Weights = { ...DEFAULT_W, ...JSON.parse(raw) };
        return sumW(parsed) === 100 ? parsed : DEFAULT_W;
      }
    } catch {}
    return DEFAULT_W;
  });

  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(weights));
  }, [weights]);

  // Grafik
  const chartData = useMemo(() => {
    const m = normalize(BEN.maas, KARSI.maas);
    const y = normalize(BEN.yol, KARSI.yol);
    const ye = normalize(BEN.yemek, KARSI.yemek);
    const iz = normalize(BEN.izin, KARSI.izin);
    return [
      { kalem: "Maaş", Ben: round1(m.a), Karşı: round1(m.b) },
      { kalem: "Yol", Ben: round1(y.a), Karşı: round1(y.b) },
      { kalem: "Yemek", Ben: round1(ye.a), Karşı: round1(ye.b) },
      { kalem: "İzin (gün)", Ben: round1(iz.a), Karşı: round1(iz.b) },
    ];
  }, []);

  // Uyum skoru
  const matchScore = useMemo(() => {
    const close = (a: number, b: number) => 100 - Math.abs(a - b);
    return Math.round(
      (close(chartData[0].Ben, chartData[0].Karşı) * weights.maas +
        close(chartData[1].Ben, chartData[1].Karşı) * weights.yol +
        close(chartData[2].Ben, chartData[2].Karşı) * weights.yemek +
        close(chartData[3].Ben, chartData[3].Karşı) * weights.izin) / 100
    );
  }, [chartData, weights]);

  // PDF indir
  const pdfRef = useRef<HTMLDivElement>(null);
  const handlePDF = async () => {
    const [{ default: html2canvas }, jspdfMod] = await Promise.all([
      import("html2canvas"),
      import("jspdf"),
    ]);
    const jsPDF = jspdfMod.jsPDF;
    if (!pdfRef.current) return;

    const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
    const img = canvas.toDataURL("image/png");
    const pdf = new jsPDF({ unit: "pt", format: "a4" });

    const pageW = pdf.internal.pageSize.getWidth();
    const imgW = pageW - 48;
    const imgH = (canvas.height / canvas.width) * imgW;

    pdf.addImage(img, "PNG", 24, 24, imgW, imgH, "", "FAST");
    pdf.save("teklif-karsilastirma.pdf");
  };

  // Presetler
  const presets: Record<string, Weights> = {
    Denge: { maas: 25, yol: 25, yemek: 25, izin: 25 },
    "Maaş odaklı": { maas: 50, yol: 20, yemek: 15, izin: 15 },
    "Yol odaklı": { maas: 25, yol: 45, yemek: 15, izin: 15 },
    "Yemek odaklı": { maas: 25, yol: 20, yemek: 40, izin: 15 },
    "İzin odaklı": { maas: 25, yol: 20, yemek: 15, izin: 40 },
  };

  const equalize = () => {
    const s = sumW(weights);
    if (s === 100) return;
    if (s <= 0) return setWeights(DEFAULT_W);

    const k = 100 / s;
    const w2: Weights = {
      maas: Math.round(weights.maas * k),
      yol: Math.round(weights.yol * k),
      yemek: Math.round(weights.yemek * k),
      izin: Math.round(weights.izin * k),
    };
    const diff = 100 - sumW(w2);
    if (diff !== 0) {
      // en büyük hangisiyse ona farkı ekle/çıkar
      const entries = [
        ["maas", w2.maas],
        ["yol", w2.yol],
        ["yemek", w2.yemek],
        ["izin", w2.izin],
      ] as const;
      const maxKey = entries.sort((a, b) => b[1] - a[1])[0][0];
      (w2 as any)[maxKey] = clamp((w2 as any)[maxKey] + diff, 0, 100);
    }
    setWeights(w2);
  };

  const totalOk = sumW(weights) === 100;

  return (
    <div style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 24px" }}>
      {/* Üst çubuk */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link to="/" style={{ color: "#64748b", textDecoration: "none" }}>
            ← Ana sayfa
          </Link>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: "#111827" }}>
            Teklif Karşılaştırma
          </h1>
          <span
            style={{
              fontSize: 13,
              padding: "4px 10px",
              borderRadius: 999,
              background: "#ecfdf5",
              color: "#047857",
              border: "1px solid #a7f3d0",
            }}
          >
            Uyum skoru: %{matchScore}
          </span>
        </div>

        <button
          onClick={handlePDF}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            color: "#0f172a",
            cursor: "pointer",
          }}
        >
          PDF indir
        </button>
      </div>

      <div ref={pdfRef}>
        {/* Üst: tablo + grafik */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 16,
            marginTop: 16,
            marginBottom: 12,
          }}
        >
          {/* Tablo kartı */}
          <Card title="Ham Değerler (Yan Yana)">
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ color: "#64748b" }}>
                    <Th>Kalem</Th>
                    <Th>Ben</Th>
                    <Th>Karşı</Th>
                  </tr>
                </thead>
                <tbody>
                  <Tr>
                    <Td> Maaş (TL/ay) </Td>
                    <TdStrong>{TL.format(BEN.maas)}</TdStrong>
                    <TdStrong>{TL.format(KARSI.maas)}</TdStrong>
                  </Tr>
                  <Tr>
                    <Td> Yol (TL/ay) </Td>
                    <TdStrong>{TL.format(BEN.yol)}</TdStrong>
                    <TdStrong>{TL.format(KARSI.yol)}</TdStrong>
                  </Tr>
                  <Tr>
                    <Td> Yemek (TL/ay) </Td>
                    <TdStrong>{TL.format(BEN.yemek)}</TdStrong>
                    <TdStrong>{TL.format(KARSI.yemek)}</TdStrong>
                  </Tr>
                  <Tr>
                    <Td> İzin (gün/yıl) </Td>
                    <TdStrong>{BEN.izin} gün</TdStrong>
                    <TdStrong>{KARSI.izin} gün</TdStrong>
                  </Tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Grafik kartı */}
          <Card title="Karşılaştırma Grafiği (Normalize %)">
            <div style={{ height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kalem" />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => `${(v as number).toFixed(1)}%`} />
                  <Legend />
                  <Bar dataKey="Ben" fill="#3b82f6" />
                  <Bar dataKey="Karşı" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
              <p style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
                Not: Her kalem kendi içinde normalize edilir. Böylece maaş gibi büyük kalemler, izin
                gibi küçük kalemleri ezmez.
              </p>
            </div>
          </Card>
        </div>

        {/* Ağırlıklar */}
        <Card title="Ağırlıklar">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
            {Object.entries(presets).map(([name, w]) => (
              <button
                key={name}
                onClick={() => setWeights(w)}
                style={{
                  padding: "6px 10px",
                  borderRadius: 8,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                {name}
              </button>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              justifyContent: "flex-end",
              marginBottom: 10,
            }}
          >
            <div style={{ fontSize: 14, color: totalOk ? "#16a34a" : "#dc2626" }}>
              <strong>Toplam: %{sumW(weights)}</strong>
            </div>
            <button
              onClick={equalize}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                border: "1px solid #e2e8f0",
                background: "#fff",
                cursor: "pointer",
              }}
            >
              100’e eşitle
            </button>
          </div>

          <WeightSlider
            label="Maaş"
            value={weights.maas}
            onChange={(v) => setWeights({ ...weights, maas: clamp(v) })}
          />
          <WeightSlider
            label="Yol"
            value={weights.yol}
            onChange={(v) => setWeights({ ...weights, yol: clamp(v) })}
          />
          <WeightSlider
            label="Yemek"
            value={weights.yemek}
            onChange={(v) => setWeights({ ...weights, yemek: clamp(v) })}
          />
          <WeightSlider
            label="İzin"
            value={weights.izin}
            onChange={(v) => setWeights({ ...weights, izin: clamp(v) })}
          />
        </Card>
      </div>

      <footer style={{ fontSize: 12, color: "#94a3b8", marginTop: 16 }}>
        © 2025 ChangeJob — karar vermeyi kolaylaştırır.
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Küçük UI parçaları                                                  */
/* ------------------------------------------------------------------ */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        background: "#fff",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: 12,
          borderBottom: "1px solid #e2e8f0",
          fontWeight: 600,
          color: "#111827",
        }}
      >
        {title}
      </div>
      <div style={{ padding: 12 }}>{children}</div>
    </div>
  );
}

function WeightSlider({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "120px 1fr 56px",
        alignItems: "center",
        gap: 10,
        margin: "10px 0",
      }}
    >
      <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 600 }}>{label}</div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
      <div style={{ fontSize: 14, color: "#0f172a", fontWeight: 600 }}>%{value}</div>
    </div>
  );
}

/* Tablo hücreleri */
function Th({ children }: { children: React.ReactNode }) {
  return (
    <th style={{ textAlign: "left", padding: "8px 10px", borderBottom: "1px solid #e2e8f0" }}>
      {children}
    </th>
  );
}
function Td({ children }: { children: React.ReactNode }) {
  return <td style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9" }}>{children}</td>;
}
function TdStrong({ children }: { children: React.ReactNode }) {
  return (
    <td style={{ padding: "8px 10px", borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>
      {children}
    </td>
  );
}
function Tr({ children }: { children: React.ReactNode }) {
  return <tr style={{ color: "#0f172a" }}>{children}</tr>;
}
