// src/pages/Giris.tsx
import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function Giris() {
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // Eğer kullanıcı maildeki sihirli linke tıklayıp bu sayfaya geldiyse:
  useEffect(() => {
    (async () => {
      try {
        if (isSignInWithEmailLink(auth, window.location.href)) {
          setBusy(true);
          const savedEmail = window.localStorage.getItem("cj_email") || "";
          const mail = savedEmail || window.prompt("E-postanı doğrulamak için tekrar yaz") || "";
          await signInWithEmailLink(auth, mail, window.location.href);
          window.localStorage.removeItem("cj_email");
          setMsg("E-posta ile giriş tamamlandı.");
          nav("/detay");
        }
      } catch (e: any) {
        setErr(e?.message || "Bağlantı doğrulanamadı.");
      } finally {
        setBusy(false);
      }
    })();
  }, [nav]);

  const handleGoogle = async () => {
    setErr(null); setMsg(null);
    try {
      setBusy(true);
      await signInWithPopup(auth, new GoogleAuthProvider());
      nav("/detay");
    } catch (e: any) {
      setErr(e?.message || "Google ile giriş başarısız.");
    } finally {
      setBusy(false);
    }
  };

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null); setMsg(null);
    try {
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        setErr("Lütfen geçerli bir e-posta yaz.");
        return;
      }
      setBusy(true);
      const actionCodeSettings = {
        url: `${window.location.origin}/giris`,
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("cj_email", email);
      setMsg("Giriş linkini e-postana gönderdik. Lütfen mailini kontrol et.");
    } catch (e: any) {
      setErr(e?.message || "E-posta linki gönderilemedi.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900">Giriş</h1>
      <p className="mt-2 text-slate-600">
        Google ile giriş yapabilir veya e-posta adresine sihirli giriş linki gönderebilirsin.
      </p>

      {/* Google */}
      <div className="mt-6">
        <button
          onClick={handleGoogle}
          disabled={busy}
          className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {busy ? "İşleniyor..." : "Google ile devam et"}
        </button>
      </div>

      {/* E-posta sihirli link */}
      <form onSubmit={handleSendLink} className="mt-6 space-y-3">
        <label className="block text-sm font-medium text-slate-700">E-posta adresi</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 outline-none focus:border-blue-500"
          placeholder="ornek@domain.com"
        />
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-indigo-600 px-4 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {busy ? "Gönderiliyor..." : "E-posta Link Gönder"}
        </button>
      </form>

      {/* Mesajlar */}
      {msg && <div className="mt-4 rounded-lg bg-green-50 p-3 text-green-700">{msg}</div>}
      {err && <div className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{err}</div>}
    </div>
  );
}
