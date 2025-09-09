import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/* ------------------------------------------------
   Types
-------------------------------------------------*/
type Edu = {
  school: string;
  degree: string;
  field: string;
  start: string; // YYYY
  end: string;   // YYYY veya "Devam"
};

type Exp = {
  company: string;
  title: string;
  start: string; // YYYY-MM
  end: string;   // YYYY-MM veya "Devam"
  summary: string;
};

export type ProfileData = {
  fullName: string;
  headline: string;
  location: string;
  email: string;
  phone: string;
  avatar?: string; // base64 data url

  education: Edu[];
  experience: Exp[];
  skills: string[];
  languages: string[];
};

const LS_KEY = "cj_profile_v1";

/* ------------------------------------------------
   Helpers: localStorage
-------------------------------------------------*/
function loadProfile(): ProfileData {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) throw new Error("empty");
    const parsed = JSON.parse(raw);
    // küçük guard
    return {
      fullName: parsed.fullName ?? "",
      headline: parsed.headline ?? "",
      location: parsed.location ?? "",
      email: parsed.email ?? "",
      phone: parsed.phone ?? "",
      avatar: parsed.avatar ?? "",
      education: Array.isArray(parsed.education) ? parsed.education : [],
      experience: Array.isArray(parsed.experience) ? parsed.experience : [],
      skills: Array.isArray(parsed.skills) ? parsed.skills : [],
      languages: Array.isArray(parsed.languages) ? parsed.languages : [],
    };
  } catch {
    return {
      fullName: "",
      headline: "",
      location: "",
      email: "",
      phone: "",
      avatar: "",
      education: [],
      experience: [],
      skills: [],
      languages: [],
    };
  }
}

function saveProfile(p: ProfileData) {
  localStorage.setItem(LS_KEY, JSON.stringify(p));
}

/* ------------------------------------------------
   Small UI atoms
-------------------------------------------------*/
const Section: React.FC<{ title: string; right?: React.ReactNode }> = ({
  title,
  right,
  children,
}) => (
  <section className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {right}
    </div>
    <div>{children}</div>
  </section>
);

const Row: React.FC<{ cols?: number; gap?: string }> = ({
  cols = 2,
  gap = "gap-4",
  children,
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-${cols} ${gap}`}>{children}</div>
);

// TypeScript'in template literal sınırlaması nedeniyle yardımcı:
const Grid2: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>
);

const Label: React.FC<{ htmlFor?: string; children: React.ReactNode }> = ({
  htmlFor,
  children,
}) => (
  <label
    htmlFor={htmlFor}
    className="text-sm font-medium text-slate-700 mb-1 block"
  >
    {children}
  </label>
);

const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
> = ({ label, id, className, ...props }) => (
  <div>
    {label && <Label htmlFor={id}>{label}</Label>}
    <input
      id={id}
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className ?? ""
        }`}
      {...props}
    />
  </div>
);

const Textarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }
> = ({ label, id, className, ...props }) => (
  <div>
    {label && <Label htmlFor={id}>{label}</Label>}
    <textarea
      id={id}
      className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${className ?? ""
        }`}
      {...props}
    />
  </div>
);

const Button: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "ghost" | "danger" }
> = ({ variant = "primary", className, ...props }) => {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3.5 py-2 text-sm font-medium transition-colors";
  const map = {
    primary:
      "bg-indigo-600 text-white hover:bg-indigo-700 active:bg-indigo-800",
    ghost:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    danger:
      "bg-rose-600 text-white hover:bg-rose-700 active:bg-rose-800",
  } as const;
  return <button className={`${base} ${map[variant]} ${className ?? ""}`} {...props} />;
};

const Pill: React.FC<{ text: string; onRemove?: () => void }> = ({
  text,
  onRemove,
}) => (
  <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 rounded-full px-3 py-1 text-xs">
    {text}
    {onRemove && (
      <button
        type="button"
        onClick={onRemove}
        className="text-slate-500 hover:text-slate-700"
        aria-label="remove"
      >
        ×
      </button>
    )}
  </span>
);

/* ------------------------------------------------
   TagInput (skills & languages)
-------------------------------------------------*/
const TagInput: React.FC<{
  label: string;
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
  const [q, setQ] = useState("");
  const add = () => {
    const t = q.trim();
    if (!t) return;
    if (value.includes(t)) {
      setQ("");
      return;
    }
    onChange([...value, t]);
    setQ("");
  };
  return (
    <div>
      <Label>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder={placeholder ?? "etiket yazıp Enter’a bas"}
        />
        <Button type="button" onClick={add}>
          Ekle
        </Button>
      </div>
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {value.map((t) => (
            <Pill
              key={t}
              text={t}
              onRemove={() => onChange(value.filter((x) => x !== t))}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/* ------------------------------------------------
   Main: Profil
-------------------------------------------------*/
export default function Profil() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileData>(() => loadProfile());
  const [saving, setSaving] = useState<"idle" | "saving" | "saved">("idle");
  const [importing, setImporting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLInputElement>(null);

  // Autosave
  useEffect(() => {
    setSaving("saving");
    const id = setTimeout(() => {
      saveProfile(profile);
      setSaving("saved");
      setTimeout(() => setSaving("idle"), 1000);
    }, 400);
    return () => clearTimeout(id);
  }, [profile]);

  const isValid = useMemo(() => {
    if (!profile.fullName.trim()) return false;
    if (!profile.email.trim()) return false;
    return true;
  }, [profile]);

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(profile, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const dl = document.createElement("a");
    dl.href = url;
    dl.download = "profile.json";
    dl.click();
    URL.revokeObjectURL(url);
  };

  const importJSON = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      setProfile({
        fullName: parsed.fullName ?? "",
        headline: parsed.headline ?? "",
        location: parsed.location ?? "",
        email: parsed.email ?? "",
        phone: parsed.phone ?? "",
        avatar: parsed.avatar ?? "",
        education: Array.isArray(parsed.education) ? parsed.education : [],
        experience: Array.isArray(parsed.experience) ? parsed.experience : [],
        skills: Array.isArray(parsed.skills) ? parsed.skills : [],
        languages: Array.isArray(parsed.languages) ? parsed.languages : [],
      });
    } catch (e) {
      alert("Geçersiz JSON dosyası.");
    } finally {
      setImporting(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const resetAll = () => {
    if (!confirm("Tüm profil bilgilerini temizlemek istiyor musun?")) return;
    const next: ProfileData = {
      fullName: "",
      headline: "",
      location: "",
      email: "",
      phone: "",
      avatar: "",
      education: [],
      experience: [],
      skills: [],
      languages: [],
    };
    setProfile(next);
    saveProfile(next);
  };

  const onAvatarPick = async (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProfile((p) => ({ ...p, avatar: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const addEdu = () =>
    setProfile((p) => ({
      ...p,
      education: [
        ...p.education,
        { school: "", degree: "", field: "", start: "", end: "" },
      ],
    }));

  const addExp = () =>
    setProfile((p) => ({
      ...p,
      experience: [
        ...p.experience,
        { company: "", title: "", start: "", end: "", summary: "" },
      ],
    }));

  const goDetail = () => {
    // Hem localStorage hazır, hem de state ile götürelim:
    navigate("/detay", { state: { profile } });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 text-white grid place-items-center font-bold">
              CJ
            </div>
            <div>
              <div className="text-sm text-slate-900 font-semibold">Profil</div>
              <div className="text-xs text-slate-500">
                Otomatik kaydet:{" "}
                {saving === "saving" ? (
                  <span className="text-amber-600">kaydediliyor…</span>
                ) : saving === "saved" ? (
                  <span className="text-emerald-600">kaydedildi</span>
                ) : (
                  "açık"
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={exportJSON}>
              JSON indir
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              hidden
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setImporting(true);
                  void importJSON(f);
                }
              }}
            />
            <Button
              variant="ghost"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
            >
              JSON yükle
            </Button>
            <Button variant="danger" onClick={resetAll}>
              Sıfırla
            </Button>
            <Button onClick={goDetail} disabled={!isValid}>
              Detay’a devam et
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-6xl px-4 py-6 space-y-6">
        {/* Üst bilgi + avatar */}
        <Section title="Kişisel Bilgiler">
          <Grid2>
            <div className="space-y-4">
              <Input
                label="Ad Soyad"
                value={profile.fullName}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, fullName: e.target.value }))
                }
                placeholder="Örn: Yıldız K."
              />
              <Input
                label="Ünvan / Başlık"
                value={profile.headline}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, headline: e.target.value }))
                }
                placeholder="Örn: Kıdemli Frontend Geliştirici"
              />
              <Input
                label="Lokasyon"
                value={profile.location}
                onChange={(e) =>
                  setProfile((p) => ({ ...p, location: e.target.value }))
                }
                placeholder="Örn: İstanbul, TR"
              />
              <Grid2>
                <Input
                  label="E-posta"
                  value={profile.email}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, email: e.target.value }))
                  }
                  placeholder="ornek@ornek.com"
                />
                <Input
                  label="Telefon"
                  value={profile.phone}
                  onChange={(e) =>
                    setProfile((p) => ({ ...p, phone: e.target.value }))
                  }
                  placeholder="+90 5xx xxx xx xx"
                />
              </Grid2>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-32 h-32 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                {profile.avatar ? (
                  <img
                    src={profile.avatar}
                    alt="avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full grid place-items-center text-slate-400 text-sm">
                    Fotoğraf
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <input
                  ref={imgRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) void onAvatarPick(f);
                  }}
                />
                <Button variant="ghost" onClick={() => imgRef.current?.click()}>
                  Profil fotoğrafı yükle
                </Button>
                {profile.avatar && (
                  <Button
                    variant="danger"
                    onClick={() => setProfile((p) => ({ ...p, avatar: "" }))}
                  >
                    Kaldır
                  </Button>
                )}
                <p className="text-xs text-slate-500">
                  Kare ve küçük boyutlu bir görsel önerilir.
                </p>
              </div>
            </div>
          </Grid2>
        </Section>

        {/* Eğitim */}
        <Section
          title={`Eğitim (${profile.education.length})`}
          right={
            <Button variant="ghost" onClick={addEdu}>
              Ekle
            </Button>
          }
        >
          {profile.education.length === 0 && (
            <p className="text-sm text-slate-500">
              Henüz eğitim eklenmemiş. “Ekle” ile bir kayıt oluştur.
            </p>
          )}
          <div className="space-y-4">
            {profile.education.map((ed, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-4 bg-slate-50/50"
              >
                <Grid2>
                  <Input
                    label="Okul"
                    value={ed.school}
                    onChange={(e) =>
                      setProfile((p) => {
                        const list = [...p.education];
                        list[i] = { ...list[i], school: e.target.value };
                        return { ...p, education: list };
                      })
                    }
                  />
                  <Input
                    label="Derece"
                    value={ed.degree}
                    onChange={(e) =>
                      setProfile((p) => {
                        const list = [...p.education];
                        list[i] = { ...list[i], degree: e.target.value };
                        return { ...p, education: list };
                      })
                    }
                    placeholder="Lisans / Y. Lisans / Doktora…"
                  />
                  <Input
                    label="Bölüm"
                    value={ed.field}
                    onChange={(e) =>
                      setProfile((p) => {
                        const list = [...p.education];
                        list[i] = { ...list[i], field: e.target.value };
                        return { ...p, education: list };
                      })
                    }
                  />
                  <Grid2>
                    <Input
                      label="Başlangıç (YYYY)"
                      value={ed.start}
                      onChange={(e) =>
                        setProfile((p) => {
                          const list = [...p.education];
                          list[i] = { ...list[i], start: e.target.value };
                          return { ...p, education: list };
                        })
                      }
                    />
                    <Input
                      label="Bitiş (YYYY ya da “Devam”)"
                      value={ed.end}
                      onChange={(e) =>
                        setProfile((p) => {
                          const list = [...p.education];
                          list[i] = { ...list[i], end: e.target.value };
                          return { ...p, education: list };
                        })
                      }
                    />
                  </Grid2>
                </Grid2>
                <div className="mt-3">
                  <Button
                    variant="danger"
                    onClick={() =>
                      setProfile((p) => ({
                        ...p,
                        education: p.education.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    Kaldır
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Deneyim */}
        <Section
          title={`Deneyim (${profile.experience.length})`}
          right={
            <Button variant="ghost" onClick={addExp}>
              Ekle
            </Button>
          }
        >
          {profile.experience.length === 0 && (
            <p className="text-sm text-slate-500">
              Henüz deneyim eklenmemiş. “Ekle” ile bir kayıt oluştur.
            </p>
          )}
          <div className="space-y-4">
            {profile.experience.map((ex, i) => (
              <div
                key={i}
                className="rounded-xl border border-slate-200 p-4 bg-slate-50/50"
              >
                <Grid2>
                  <Input
                    label="Şirket"
                    value={ex.company}
                    onChange={(e) =>
                      setProfile((p) => {
                        const list = [...p.experience];
                        list[i] = { ...list[i], company: e.target.value };
                        return { ...p, experience: list };
                      })
                    }
                  />
                  <Input
                    label="Pozisyon"
                    value={ex.title}
                    onChange={(e) =>
                      setProfile((p) => {
                        const list = [...p.experience];
                        list[i] = { ...list[i], title: e.target.value };
                        return { ...p, experience: list };
                      })
                    }
                  />
                  <Grid2>
                    <Input
                      label="Başlangıç (YYYY-MM)"
                      value={ex.start}
                      onChange={(e) =>
                        setProfile((p) => {
                          const list = [...p.experience];
                          list[i] = { ...list[i], start: e.target.value };
                          return { ...p, experience: list };
                        })
                      }
                    />
                    <Input
                      label="Bitiş (YYYY-MM ya da “Devam”)"
                      value={ex.end}
                      onChange={(e) =>
                        setProfile((p) => {
                          const list = [...p.experience];
                          list[i] = { ...list[i], end: e.target.value };
                          return { ...p, experience: list };
                        })
                      }
                    />
                  </Grid2>
                </Grid2>
                <Textarea
                  label="Özet / Sorumluluklar"
                  rows={3}
                  value={ex.summary}
                  onChange={(e) =>
                    setProfile((p) => {
                      const list = [...p.experience];
                      list[i] = { ...list[i], summary: e.target.value };
                      return { ...p, experience: list };
                    })
                  }
                  placeholder="Kısa bir özet yaz…"
                />
                <div className="mt-3">
                  <Button
                    variant="danger"
                    onClick={() =>
                      setProfile((p) => ({
                        ...p,
                        experience: p.experience.filter((_, j) => j !== i),
                      }))
                    }
                  >
                    Kaldır
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Skills & Languages */}
        <Section title="Yetenekler ve Diller">
          <Grid2>
            <TagInput
              label="Yetenekler"
              value={profile.skills}
              onChange={(next) => setProfile((p) => ({ ...p, skills: next }))}
              placeholder="Örn: React, TypeScript, Recharts"
            />
            <TagInput
              label="Diller"
              value={profile.languages}
              onChange={(next) => setProfile((p) => ({ ...p, languages: next }))}
              placeholder="Örn: Türkçe (C2), İngilizce (B2)"
            />
          </Grid2>
        </Section>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={exportJSON}>
            JSON indir
          </Button>
          <Button onClick={goDetail} disabled={!isValid}>
            Detay’a devam et
          </Button>
        </div>
      </main>
    </div>
  );
}
