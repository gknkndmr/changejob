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

/* ------------------------------------------------
 *  Tipler
 * ------------------------------------------------ */
type Offer = {
  maas: number; // TL/ay
  yol: number;  // TL/ay
  yemek: number; // TL/ay
  izin: number; // gün/yıl
};

type Weights = {
  maas: number;
  yol: number;
  yemek: number;
  izin: number;
};

/* ------------------------------------------------
 *  Varsayılan veriler
 * ------------------------------------------------ */
const DEFAULT_BEN: Offer = { maas: 35000, yol: 1500, yemek: 2500, izin: 14 };
const DEFAULT_KARSI: Offer = { maas: 38000, yol: 2000, yemek: 2500, izin: 18 };

const DEFAULT_WEIGHTS: Weights = { maas: 40, yol: 20, yemek: 15, izin: 25 };

const WEIGHT_PRESETS: Record<string, Weights> = {
  "Denge":        { maas: 40, yol: 20, yemek: 15, izin: 25 },
  "Maaş odaklı":  { maas: 70, yol: 10, yemek: 10, izin: 10 },
  "Yol odaklı":   { maas: 30, yol: 50, yemek: 10, izin: 10 },
  "Yemek odaklı": { maas: 30, yol: 10, yemek: 50, izin: 10 },
  "İzin odaklı":  { maas: 25, yol: 15, yemek: 10, izin: 50 },
};

const LS_WEIGHTS = "cj.weights";

/* ------------------------------------------------
 *  Yardımcılar
 * ------------------------------------------------ */

// Her kalemi kendi içinde normalize et (Ben/Karşı toplam değil!)
function normalize(b: number, k: number) {
  const max = Math.max(b, k, 1);
  return {
    ben: Math.round((b / max) * 100),
    karsi: Math.round((k / max) * 100),
  };
}

// Uyum skoru: ağırlıklı benzerlik ortalaması (0-100)
function similarityScore(ben: Offer, karsi: Offer, weights: Weights) {
  const sumW = Object.values(weights).reduce((a, b) => a + b, 0) || 1;
  const W = {
    maas: weights.maas / sumW,
    yol: weights.yol / sumW,
    yemek: weights.yemek / sumW,
    izin: weights.izin / sumW,
  };

  const sim = (b: number, k: number) => 1 - Math.abs(b - k) / Math.max(b, k, 1);

  const s =
    sim(ben.maas, karsi.maas) * W.maas +
    sim(ben.yol, karsi.yol) * W.yol +
    sim(ben.yemek, karsi.yemek) * W.yemek +
    sim(ben.izin, karsi.izin) * W.izin;

  return Math.round(s * 100);
}

function clamp(v: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, v));
}

/* ------------------------------------------------
 *  Sayfa
 * ------------------------------------------------ */

export default function Detay() {
  // Raw veriler
  const [ben] = useState<Offer>(DEFAULT_BEN);
  const [karsi] = useState<Offer>(DEFAULT_KARSI);

  // Ağırlıklar (localStorage)
  const [weights, setWeights] = useState<Weights>(() => {
    try {
      const raw = localStorage.getItem(LS_WEIGHTS);
      if (raw) return JSON.parse(raw) as Weights;
    } catch {}
    return DEFAULT_WEIGHTS;
  });
  const [activePreset, setActivePreset] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(LS_WEIGHTS, JSON.stringify(weights));
  }, [weights]);

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
  const score = useMemo(() => similarityScore(ben, karsi, weights), [ben, karsi, weights]);

  // Grafik verisi
  const chartData = useMemo(() => {
    const nMaas = normalize(ben.maas, karsi.maas);
    const nYol = normalize(ben.yol, karsi.yol);
    const nYemek = normalize(ben.yemek, karsi.yemek);
    const nIzin = normalize(ben.izin, karsi.izin);
    return [
      { kalem: "Maaş", Ben: nMaas.ben, Karşı: nMaas.karsi },
      { kalem: "Yol", Ben: nYol.ben, Karşı: nYol.karsi },
      { kalem: "Yemek", Ben: nYemek.ben, Karşı: nYemek.karsi },
      { kalem: "İzin (gün)", Ben: nIzin.ben, Karşı: nIzin.karsi },
    ];
  }, [ben, karsi]);

  const setW = (key: keyof Weights, val: number) => {
    setActivePreset(null);
    setWeights((prev) => ({ ...prev, [key]: clamp(val) }));
  };

  const normalizeWeightsTo100 = () => {
    const sum = totalWeight || 1;
    setWeights({
      maas: Math.round((weights.maas / sum) * 100),
      yol: Math.round((weights.yol / sum) * 100),
      yemek: Math.round((weights.yemek / sum) * 100),
      izin: Math.round((weights.izin / sum) * 100),
    });
    setActivePreset(null);
  };

  const applyPreset = (name: string) => {
    setWeights(WEIGHT_PRESETS[name]);
    setActivePreset(name);
  };

  /* ---------- PDF Export ---------- */
  const exportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPDF = async () => {
    if (!exportRef.current || exporting) return;
    try {
      setExporting(true);

      const [{ default: html2canvas }, { jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // Hangi alanı alacağız? exportRef
      const element = exportRef.current;

      // Daha net çıktı için scale=2
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        // PDF'e girmesini istemediklerimizi ignore edebiliriz (butonlar zaten ref dışında)
        // ignoreElements: (el) => el.getAttribute("data-no-capture") === "true",
      });

      const imgData = canvas.toDataURL("image/png");

      // A4 boyutu (mm)
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();  // 210mm
      const pageHeight = pdf.internal.pageSize.getHeight(); // 297mm

      // Görseli sayfa genişliğine oranlayarak yüksekliği hesapla
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight, undefined, "FAST");
        heightLeft -= pageHeight;
      }

      pdf.save("changejob-detay.pdf");
    } catch (err) {
      console.error("PDF export error:", err);
      alert("PDF oluştururken bir sorun oluştu.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ padding: "16px 20px", maxWidth: 1180, margin: "0 auto" }}>
      {/* Bu üst satır PDF'e girmesin diye ref dışında */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 6,
        }}
      >
        <Link to="/" style={{ textDecoration: "none", color: "#475569" }}>
          ← Ana sayfa
        </Link>

        <div style={{ flex: 1 }} />

        <button
          onClick={handleExportPDF}
          disabled={exporting}
          title="Karşılaştırmayı PDF olarak indir"
          style={{
            border: "1px solid #e2e8f0",
            background: exporting ? "#e5e7eb" : "#ffffff",
            color: "#0f172a",
            borderRadius: 8,
            padding: "8px 12px",
            cursor: exporting ? "not-allowed" : "pointer",
            fontWeight: 700,
          }}
        >
          {exporting ? "Hazırlanıyor…" : "PDF indir"}
        </button>
      </div>

      {/* --- PDF'e girecek alan: exportRef --- */}
      <div ref={exportRef}>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: -0.3, marginTop: 4 }}>
          Teklif Karşılaştırma
        </h1>

        {/* Uyum Skoru */}
        <div
          style={{
            marginTop: 6,
            display: "inline-block",
            background: "#f1f5f9",
            color: "#0f172a",
            borderRadius: 8,
            padding: "6px 10px",
            fontWeight: 700,
          }}
        >
          Uyum skoru:{" "}
          <span
            style={{
              color: score >= 70 ? "#16a34a" : score >= 40 ? "#ca8a04" : "#dc2626",
            }}
          >
            %{score}
          </span>
        </div>

        <div
          style={{
            marginTop: 18,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 18,
          }}
        >
          {/* Sol: Tablo */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              overflow: "hidden",
              background: "#fff",
            }}
          >
            <div style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f0", fontWeight: 700 }}>
              Ham Değerler (Yan Yana)
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead style={{ background: "#f8fafc", color: "#0f172a" }}>
                <tr>
                  <th style={th}>Kalem</th>
                  <th style={th}>Ben</th>
                  <th style={th}>Karşı</th>
                </tr>
              </thead>
              <tbody>
                <Row label="Maaş (TL/ay)" ben={formatTL(ben.maas)} karsi={formatTL(karsi.maas)} />
                <Row label="Yol (TL/ay)" ben={formatTL(ben.yol)} karsi={formatTL(karsi.yol)} />
                <Row label="Yemek (TL/ay)" ben={formatTL(ben.yemek)} karsi={formatTL(karsi.yemek)} />
                <Row label="İzin (gün/yıl)" ben={`${ben.izin} gün`} karsi={`${karsi.izin} gün`} />
              </tbody>
            </table>
          </div>

          {/* Sağ: Grafik */}
          <div
            style={{
              border: "1px solid #e2e8f0",
              borderRadius: 12,
              background: "#fff",
              padding: 12,
            }}
          >
            <div style={{ fontWeight: 700, padding: "2px 4px 10px" }}>
              Karşılaştırma Grafiği (Normalize %)
            </div>
            <div style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="kalem" />
                  <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip formatter={(v: number) => `${v}%`} />
                  <Legend />
                  <Bar dataKey="Ben" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Karşı" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{ fontSize: 12, color: "#64748b", marginTop: 8 }}>
              Not: Her kalem kendi içinde normalize edilir; böylece maaş gibi büyük kalemler, izin gibi küçük kalemleri ezmez.
            </div>
          </div>
        </div>

        {/* Ağırlıklar */}
        <div
          style={{
            marginTop: 18,
            border: "1px solid #e2e8f0",
            borderRadius: 12,
            background: "#fff",
          }}
        >
          <div style={{ padding: "10px 12px", borderBottom: "1px solid #e2e8f0", fontWeight: 700 }}>
            Ağırlıklar
          </div>

          {/* Preset kısayolları */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", padding: "10px 12px" }}>
            {Object.keys(WEIGHT_PRESETS).map((name) => (
              <button
                key={name}
                onClick={() => applyPreset(name)}
                style={{
                  border: "1px solid #e2e8f0",
                  background: activePreset === name ? "#eef2ff" : "#ffffff",
                  color: activePreset === name ? "#3730a3" : "#0f172a",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
                title={`${name} presetini uygula`}
              >
                {name}
              </button>
            ))}
            <div style={{ flex: 1 }} />
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                color: totalWeight === 100 ? "#16a34a" : "#dc2626",
                fontWeight: 700,
              }}
            >
              Toplam: %{totalWeight}
              <button
                onClick={normalizeWeightsTo100}
                style={{
                  border: "1px solid #e2e8f0",
                  background: "#ffffff",
                  color: "#0f172a",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                  fontWeight: 600,
                }}
              >
                100’e eşitle
              </button>
            </div>
          </div>

          {/* Kaydırıcılar */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: 16,
              padding: 12,
            }}
          >
            <Slider
              label="Maaş"
              value={weights.maas}
              onChange={(v) => setW("maas", v)}
              color="#4f46e5"
            />
            <Slider
              label="Yol"
              value={weights.yol}
              onChange={(v) => setW("yol", v)}
              color="#10b981"
            />
            <Slider
              label="Yemek"
              value={weights.yemek}
              onChange={(v) => setW("yemek", v)}
              color="#f59e0b"
            />
            <Slider
              label="İzin"
              value={weights.izin}
              onChange={(v) => setW("izin", v)}
              color="#ef4444"
            />
          </div>
        </div>

        {/* Footer (PDF'e dahil) */}
        <div style={{ marginTop: 18, fontSize: 13, color: "#64748b" }}>
          © {new Date().getFullYear()} ChangeJob — karar vermeyi kolaylaştırır.
        </div>
      </div>
      {/* --- /exportRef --- */}
    </div>
  );
}

/* ------------------------------------------------
 *  Alt bileşenler
 * ------------------------------------------------ */

function Row({ label, ben, karsi }: { label: string; ben: string; karsi: string }) {
  return (
    <tr>
      <td style={td}>{label}</td>
      <td style={td}>{ben}</td>
      <td style={td}>{karsi}</td>
    </tr>
  );
}

function Slider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        padding: 12,
        background: "#fff",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
        <div style={{ fontWeight: 700, color: "#0f172a" }}>{label}</div>
        <div style={{ fontWeight: 700, color }}>{`%${value}`}</div>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>
  );
}

/* ------------------------------------------------
 *  Stiller & küçük yardımcılar
 * ------------------------------------------------ */

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "10px 12px",
  fontWeight: 700,
  borderBottom: "1px solid #e2e8f0",
};

const td: React.CSSProperties = {
  padding: "10px 12px",
  borderBottom: "1px solid #f1f5f9",
};

function formatTL(v: number) {
  try {
    return v.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
  } catch {
    return `${v} TL`;
  }
}
