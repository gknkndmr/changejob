// src/pages/Home.tsx
import { Link } from "react-router-dom";

export default function Home() {
  const quick = [
    { label: "Maaş", me: 35000, other: 38000, max: 38000 },
    { label: "Yol", me: 1500, other: 2000, max: 2000 },
    { label: "Yemek", me: 2500, other: 2500, max: 2500 },
    { label: "İzin (gün)", me: 14, other: 18, max: 18 },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <header className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pt-14 pb-10">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-indigo-600">ChangeJOB</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              İş tekliflerini <span className="text-indigo-600">adil</span> ve{" "}
              <span className="text-indigo-600">şeffaf</span> kıyasla.
            </h1>
            <p className="mt-4 text-gray-600">
              Maaş tek başına her şey değil. Yol, yemek, yıllık izin ve
              yakınılık gibi kalemleri birlikte, tek bakışta değerlendir.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                to="/profil"
                className="inline-flex items-center rounded-lg bg-indigo-600 px-5 py-3 text-white hover:bg-indigo-700"
              >
                Hemen Başla
              </Link>
              <Link
                to="/giris"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 hover:bg-gray-50"
              >
                Giriş Yap
              </Link>
              <Link
                to="/kurumsal"
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-5 py-3 text-gray-700 hover:bg-gray-50"
              >
                Kurumsal
              </Link>
            </div>

            <div className="mt-3 text-xs text-gray-500">
              Ücretsiz & hızlı · Verilerin sende kalır
            </div>
          </div>

          {/* Hızlı Önizleme kartı */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">
                Hızlı Önizleme
              </h3>
              <Link
                to="/detay"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
              >
                Detaya Bak →
              </Link>
            </div>
            <div className="space-y-4">
              {quick.map((q) => {
                const mePct = Math.round((q.me / q.max) * 100);
                const otherPct = Math.round((q.other / q.max) * 100);
                return (
                  <div key={q.label}>
                    <div className="mb-1 flex items-center justify-between text-xs text-gray-600">
                      <span>{q.label}</span>
                      <span className="tabular-nums">
                        Ben: {formatNumber(q.me)} · Karşı: {formatNumber(q.other)}
                      </span>
                    </div>
                    <div className="relative h-3 w-full rounded-full bg-gray-100">
                      <div
                        className="absolute left-0 top-0 h-3 rounded-full bg-indigo-500"
                        style={{ width: `${mePct}%` }}
                        title={`Ben: ${mePct}%`}
                      />
                      <div
                        className="absolute left-0 top-0 h-3 rounded-full bg-emerald-500/70"
                        style={{ width: `${otherPct}%` }}
                        title={`Karşı: ${otherPct}%`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-[10px] leading-4 text-gray-500">
              * Her kalem kendi içinde normalize edilir. Böylece maaş gibi büyük
              kalemler, izin gibi küçük kalemleri ezmez.
            </p>
          </div>
        </div>
      </header>

      {/* Özellikler */}
      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <FeatureCard
            title="Akıllı Karşılaştırma"
            desc="Maaş, yol, yemek, izin ve yakınılık gibi tüm kalemleri ağırlıkla puanla."
          />
          <FeatureCard
            title="Şeffaf Skor"
            desc="Her teklif için normalleştirilmiş yüzde grafiği ile net görünüm."
          />
          <FeatureCard
            title="Not ve Koşullar"
            desc="Özel şartları ve notları ekle, değerlendirmeye dahil etmeyi unutma."
          />
          <FeatureCard
            title="Kurumsal Panel"
            desc="Toplu rapor ve hızlı kıyas için şirketler için kurumsal ekran."
          />
        </div>
      </section>

      {/* Alt bilgi */}
      <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} ChangeJob — karar vermeyi kolaylaştırır.
      </footer>
    </div>
  );
}

function FeatureCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h4 className="text-sm font-semibold text-gray-800">{title}</h4>
      <p className="mt-2 text-sm text-gray-600">{desc}</p>
    </div>
  );
}

function formatNumber(n: number) {
  // Küçük yardımcı: sayıları 1.500 ya da 35.000 gibi yazdır; gün/ay hariç
  if (n < 1000) return String(n);
  return new Intl.NumberFormat("tr-TR").format(n);
}
