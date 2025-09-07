// src/pages/Home.tsx
import { Link } from "react-router-dom";

export default function Home() {
  // Örnek önizleme verisi (statü çubuğu ve rakamlar için)
  const preview = {
    maas: { me: 35000, other: 38000, unit: "TL" },
    yol: { me: 1500, other: 2000, unit: "TL" },
    yemek: { me: 2500, other: 2500, unit: "TL" },
    izin: { me: 14, other: 18, unit: "gün" },
  };

  return (
    <div style={{ background: "linear-gradient(180deg,#f8fafc,#ffffff)" }}>
      {/* HERO */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "56px 24px 8px",
        }}
      >
        {/* Baslık */}
        <h1
          style={{
            fontSize: 42,
            fontWeight: 900,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          İş tekliflerini <span style={{ color: "#2563eb" }}>adil</span> ve{" "}
          <span style={{ color: "#7c3aed" }}>şeffaf</span> kıyasla.
        </h1>

        {/* Açıklama */}
        <p
          style={{
            maxWidth: 740,
            fontSize: 18,
            color: "#475569",
            marginBottom: 20,
          }}
        >
          Maaş tek başına her şey değil. Yol, yemek, yıllık izin ve işe yakınlık
          dahil tüm kalemleri puanlayıp tek bakışta karar ver.
        </p>

        {/* CTA + Önizleme */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <Link
              to="/detay"
              style={{
                background: "#2563eb",
                color: "#fff",
                padding: "12px 18px",
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Hemen Başla
            </Link>
            <Link
              to="/giris"
              style={{
                background: "#eef2ff",
                color: "#3730a3",
                padding: "12px 18px",
                borderRadius: 10,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Giriş Yap
            </Link>

            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#16a34a",
                fontSize: 14,
                marginLeft: 6,
              }}
            >
              ● Ücretsiz & hızlı
            </span>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                color: "#64748b",
                fontSize: 14,
              }}
            >
              ● Verilerin sende kalır
            </span>
          </div>

          {/* Hero içi – sol açıklama + sağ önizleme */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 16,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0,1fr) 350px",
                gap: 18,
              }}
            >
              {/* Placeholder – boşluk bırakıyoruz; görsel karmaşıklığı artırmamak için */}
              <div />

              {/* Sağdaki hızlı önizleme kutusu */}
              <PreviewCard data={preview} />
            </div>
          </div>
        </div>
      </section>

      {/* Öne Çıkanlar */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "8px 24px 32px",
        }}
      >
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
            gap: 16,
          }}
        >
          <Card
            title="Akıllı Karşılaştırma"
            desc="Maaş, yol, yemek, izin ve yakınlık gibi tüm kalemleri tek ekranda ağırlıklı puanla kıyasla."
            icon="📊"
          />
          <Card
            title="Şeffaf Skor"
            desc="Hangi teklifin nerede kazandığını gör. Yüzdesel düşük/yüksek göstergelerle sade görünüm."
            icon="🔍"
          />
          <Card
            title="Not ve Koşullar"
            desc="Kendi notlarını ekle, evine yakınsa daha düşük maaşı neden seçtiğini unutma."
            icon="📝"
          />
          <Card
            title="Kurumsal Panel"
            desc="Şirketler için toplu rapor, teklif yönetimi ve hızlı karşılaştırma."
            icon="🏢"
          />
        </div>
      </section>

      {/* Mini Alıntı */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "0 24px 8px",
        }}
      >
        <Quote>
          “Karar vermek; veriyi görünür ve anlaşılır yapınca kolaylaşır.”
        </Quote>
      </section>

      {/* SSS */}
      <section
        style={{
          maxWidth: 1080,
          margin: "0 auto",
          padding: "8px 24px 32px",
          borderTop: "1px solid #e2e8f0",
        }}
      >
        <h2
          style={{
            fontSize: 20,
            fontWeight: 800,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          Sık sorulanlar
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
            gap: 14,
          }}
        >
          <FAQ q="Verilerim nerede tutuluyor?">
            Verilerin tarayıcında saklanır; sunucuya gönderilmez. İstersen
            hesabına giriş yaparak yedekleyebilirsin.
          </FAQ>
          <FAQ q="Karşı taraf görür mü?">
            Sadece senin paylaştığın link ya da gönderdiğin swap talebiyle
            karşı taraf görebilir. Aksi halde kimse göremez.
          </FAQ>
          <FAQ q="Yüzdeler nasıl hesaplanıyor?">
            Her kalem kendi içinde normalleştirilir. Yani maaş gibi büyük
            kalemler, izin gibi küçük kalemleri ezmez.
          </FAQ>
        </div>
      </section>

      {/* FOOTER */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: "18px 24px",
          color: "#64748b",
          fontSize: 14,
          textAlign: "center",
        }}
      >
        © {new Date().getFullYear()} ChangeJob — karar vermeyi kolaylaştırır.
      </footer>
    </div>
  );
}

/* ---------------------------- Yardımcı Parçalar ---------------------------- */

function Card({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: string;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 14,
        padding: 18,
        background: "#ffffff",
      }}
    >
      <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
      <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ color: "#475569" }}>{desc}</div>
    </div>
  );
}

function Quote({ children }: { children: React.ReactNode }) {
  return (
    <blockquote
      style={{
        borderLeft: "4px solid #93c5fd",
        paddingLeft: 12,
        color: "#334155",
        fontStyle: "italic",
      }}
    >
      {children}
    </blockquote>
  );
}

function FAQ({ q, children }: { q: string; children: React.ReactNode }) {
  return (
    <details
      style={{
        border: "1px solid #e2e8f0",
        background: "#fff",
        borderRadius: 12,
        padding: "12px 14px",
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
          fontWeight: 800,
          color: "#0f172a",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
        onMouseOver={(e) => ((e.currentTarget.style.color = "#1d4ed8"))}
        onMouseOut={(e) => ((e.currentTarget.style.color = "#0f172a"))}
      >
        <span
          aria-hidden
          style={{
            width: 18,
            height: 18,
            borderRadius: 999,
            background: "#eff6ff",
            color: "#1d4ed8",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          ?
        </span>
        {q}
      </summary>
      <div style={{ color: "#475569", marginTop: 10 }}>{children}</div>
    </details>
  );
}

function PreviewCard({
  data,
}: {
  data: {
    maas: { me: number; other: number; unit: string };
    yol: { me: number; other: number; unit: string };
    yemek: { me: number; other: number; unit: string };
    izin: { me: number; other: number; unit: string };
  };
}) {
  return (
    <aside
      aria-label="Hızlı önizleme"
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 14,
        background: "#fff",
        padding: 16,
        minWidth: 300,
      }}
    >
      <div
        style={{
          fontWeight: 800,
          color: "#0f172a",
          fontSize: 16,
          marginBottom: 10,
        }}
      >
        Hızlı Önizleme
      </div>

      <div style={{ display: "grid", gap: 10 }}>
        <StatRow label="Maaş" me={data.maas} />
        <StatRow label="Yol" me={data.yol} />
        <StatRow label="Yemek" me={data.yemek} />
        <StatRow label="İzin" me={data.izin} />
      </div>

      <Link
        to="/detay"
        style={{
          display: "inline-block",
          marginTop: 12,
          background: "#f1f5f9",
          color: "#0f172a",
          padding: "8px 12px",
          borderRadius: 10,
          textDecoration: "none",
          fontWeight: 700,
        }}
      >
        Detaya Bak
      </Link>
    </aside>
  );
}

function StatRow({
  label,
  me,
}: {
  label: string;
  me: { me: number; other: number; unit: string };
}) {
  const total = Math.max(me.me, me.other) || 1;
  const pctMe = Math.round((me.me / total) * 100);
  const pctOther = Math.round((me.other / total) * 100);

  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: "#64748b",
          marginBottom: 6,
          display: "flex",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <span>{label}</span>
        <span style={{ color: "#0f172a", fontWeight: 700 }}>
          Ben: {formatVal(me.me, me.unit)} · Karşı: {formatVal(me.other, me.unit)}
        </span>
      </div>

      {/* Çift bar: Ben (sol) & Karşı (sağ) */}
      <div
        style={{
          position: "relative",
          height: 8,
          background: "#f1f5f9",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          title={`Ben ${pctMe}%`}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: `${pctMe}%`,
            background: "#2563eb",
          }}
        />
        <div
          title={`Karşı ${pctOther}%`}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: `${pctOther}%`,
            background: "#16a34a",
            opacity: 0.9,
          }}
        />
      </div>
    </div>
  );
}

function formatVal(v: number, unit: string) {
  if (unit === "TL") {
    return v.toLocaleString("tr-TR", { style: "currency", currency: "TRY", maximumFractionDigits: 0 });
  }
  return `${v} ${unit}`;
}
