import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

/**
 * Güvenli giriş sayfası:
 * - UI LinkedIn benzeri
 * - Firebase'i ancak butona basınca yüklüyor (dinamik import)
 * - Böylece env/config yoksa bile sayfa render olur (beyaz ekran yok)
 */

export default function Giris() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const next = sp.get("next") || "";

  const [isRegister, setIsRegister] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  // Firebase'i dinamik yükle
  async function loadFirebase() {
    try {
      const mod = await import("../firebase");
      // mod.auth, mod.db, mod.googleProvider mevcut olmalı
      return mod;
    } catch (e: any) {
      throw new Error(
        "Firebase yüklenemedi. firebase.ts dosyanı ve .env değerlerini kontrol et."
      );
    }
  }

  async function afterAuth() {
    try {
      const { auth, db } = await loadFirebase();
      const { getDoc, doc } = await import("firebase/firestore");
      const u = auth.currentUser;
      if (!u) return;

      if (next) {
        navigate(next, { replace: true });
        return;
      }

      const snap = await getDoc(doc(db, "profiles", u.uid));
      navigate(snap.exists() ? "/detay" : "/profil", { replace: true });
    } catch (e: any) {
      setErr(e.message || "Yönlendirme hatası");
    }
  }

  async function google() {
    setErr("");
    setLoading(true);
    try {
      const { auth, googleProvider } = await loadFirebase();
      const { signInWithPopup } = await import("firebase/auth");
      await signInWithPopup(auth, googleProvider);
      await afterAuth();
    } catch (e: any) {
      setErr(e.message || "Google ile giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  async function microsoft() {
    setErr("");
    setLoading(true);
    try {
      const { auth } = await loadFirebase();
      const { signInWithPopup, OAuthProvider } = await import("firebase/auth");
      const ms = new OAuthProvider("microsoft.com");
      await signInWithPopup(auth, ms);
      await afterAuth();
    } catch (e: any) {
      setErr(e.message || "Microsoft ile giriş başarısız.");
    } finally {
      setLoading(false);
    }
  }

  async function submitEmail() {
    setErr("");
    setLoading(true);
    try {
      const { auth } = await loadFirebase();
      const {
        signInWithEmailAndPassword,
        createUserWithEmailAndPassword,
      } = await import("firebase/auth");

      if (isRegister) {
        await createUserWithEmailAndPassword(auth, email, pass);
      } else {
        await signInWithEmailAndPassword(auth, email, pass);
      }
      await afterAuth();
    } catch (e: any) {
      setErr(e.message || "İşlem başarısız.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Üst bar */}
      <header className="max-w-screen-xl mx-auto flex items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2">
          <span className="inline-block rounded-md bg-indigo-600 text-white px-2.5 py-1 text-sm font-semibold">CJ</span>
          <span className="text-xl font-semibold tracking-tight">ChangeJob</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link to="/giris" className="px-4 py-2 text-indigo-700 font-medium rounded-md hover:bg-indigo-50">
            Oturum aç
          </Link>
          <button
            onClick={() => { setIsRegister(true); setShowEmailForm(true); }}
            className="px-4 py-2 rounded-md bg-indigo-700 text-white font-semibold hover:bg-indigo-800"
          >
            Hemen katılın
          </button>
        </div>
      </header>

      {/* İçerik */}
      <main className="max-w-screen-xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 px-6 pt-4 pb-12">
        <section className="max-w-lg">
          <h1 className="text-4xl sm:text-5xl font-semibold leading-tight text-slate-800">
            Profesyonel topluluğunuza <br /> hoş geldiniz!
          </h1>

          <div className="mt-8 space-y-3">
            <button
              onClick={google}
              disabled={loading}
              className="w-full h-12 rounded-full bg-white ring-1 ring-slate-300 hover:bg-slate-50 flex items-center justify-center gap-3 font-medium"
            >
              <GoogleIcon /> Google ile devam et
            </button>

            <button
              onClick={microsoft}
              disabled={loading}
              className="w-full h-12 rounded-full bg-white ring-1 ring-slate-300 hover:bg-slate-50 flex items-center justify-center gap-3 font-medium"
            >
              <MicrosoftIcon /> Microsoft ile devam et
            </button>

            <button
              onClick={() => setShowEmailForm(s => !s)}
              className="w-full h-12 rounded-full bg-white ring-1 ring-slate-300 hover:bg-slate-50 flex items-center justify-center gap-3 font-medium"
            >
              <MailIcon /> E-posta ile oturum açın
            </button>
          </div>

          {showEmailForm && (
            <div className="mt-4 rounded-2xl border border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <p className="font-medium">{isRegister ? "Üye Ol" : "Giriş Yap"}</p>
                <button className="text-sm underline" onClick={() => setIsRegister(s => !s)}>
                  {isRegister ? "Girişe dön" : "Hesabın yok mu? Üye ol"}
                </button>
              </div>

              <div className="mt-3 space-y-3">
                <input
                  type="email"
                  placeholder="E-posta"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                />
                <input
                  type="password"
                  placeholder="Şifre"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full rounded-md border px-3 py-2"
                />
                {!!err && <p className="text-sm text-red-600">{err}</p>}

                <button
                  onClick={submitEmail}
                  disabled={loading}
                  className="w-full h-11 rounded-md bg-indigo-700 text-white font-semibold hover:bg-indigo-800 disabled:opacity-60"
                >
                  {loading ? "Lütfen bekleyin…" : isRegister ? "Üye Ol" : "Giriş Yap"}
                </button>
              </div>
            </div>
          )}

          <p className="mt-4 text-xs text-slate-500 leading-relaxed">
            Devam Et seçeneğini tıklayarak veya oturum açarak ChangeJob’un
            <span className="underline decoration-dotted"> Kullanıcı Anlaşması</span>,
            <span className="underline decoration-dotted"> Gizlilik Politikası</span> ve
            <span className="underline decoration-dotted"> Çerez Politikası</span>’nı kabul etmiş olursunuz.
          </p>

          <p className="mt-8 text-sm">
            ChangeJob’da yeni misiniz?{" "}
            <button
              className="text-indigo-700 font-semibold underline"
              onClick={() => { setIsRegister(true); setShowEmailForm(true); }}
            >
              Hemen katılın
            </button>
          </p>
        </section>

        <aside className="hidden lg:flex items-center justify-center">
          <HeroIllustration />
        </aside>
      </main>
    </div>
  );
}

/* ------- küçük ikonlar ------- */
function GoogleIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.3 36 24 36 16.8 36 11 30.2 11 23S16.8 10 24 10c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 4 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.9C14.7 16 19 12.9 24 12.9c3.1 0 5.9 1.1 8.1 2.9l5.7-5.7C34.6 4 29.6 2 24 2 16.2 2 9.5 6.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 46c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 37 26.7 38 24 38c-5.3 0-9.9-3.4-11.5-8l-6.6 5C9.5 41.7 16.2 46 24 46z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.3 3.8-5 6.5-9.3 6.5-5.3 0-9.9-3.4-11.5-8l-6.6 5C9.5 41.7 16.2 46 24 46c11 0 20-9 20-20 0-1.2-.1-2.3-.4-3.5z"/>
    </svg>
  );
}
function MicrosoftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 23 23" aria-hidden="true">
      <rect width="10" height="10" x="1" y="1" fill="#F25022"/>
      <rect width="10" height="10" x="12" y="1" fill="#7FBA00"/>
      <rect width="10" height="10" x="1" y="12" fill="#00A4EF"/>
      <rect width="10" height="10" x="12" y="12" fill="#FFB900"/>
    </svg>
  );
}
function MailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5L4 8V6l8 5l8-5Z"/>
    </svg>
  );
}
function HeroIllustration() {
  return (
    <svg width="520" height="380" viewBox="0 0 520 380" className="drop-shadow-sm" aria-hidden="true">
      <rect width="520" height="380" rx="28" fill="#F8FAFC"/>
      <circle cx="380" cy="120" r="60" fill="#E0E7FF"/>
      <rect x="80" y="220" width="360" height="18" rx="9" fill="#CBD5E1"/>
      <rect x="120" y="250" width="280" height="18" rx="9" fill="#E2E8F0"/>
      <rect x="160" y="280" width="200" height="18" rx="9" fill="#E2E8F0"/>
      <g transform="translate(150,90)">
        <rect x="0" y="0" width="140" height="90" rx="10" fill="#EEF2FF"/>
        <rect x="12" y="12" width="116" height="12" rx="6" fill="#C7D2FE"/>
        <rect x="12" y="34" width="84" height="12" rx="6" fill="#C7D2FE"/>
        <rect x="12" y="56" width="104" height="12" rx="6" fill="#C7D2FE"/>
      </g>
    </svg>
  );
}
