import React, { useEffect, useMemo, useRef, useState } from "react";

type ScenarioState = any;

type Scenario = {
  id: string;
  name: string;
  state: ScenarioState;
};

type Props = {
  /** Ekrandaki mevcut “ben / karşı / weights” durumunu tek bir obje olarak döndür. */
  getState: () => ScenarioState;
  /** Bir senaryoyu uygula: state’i sayfaya bas. */
  applyState: (s: ScenarioState) => void;
  /** localStorage anahtarı (proje/ sayfa bazlı benzersiz olsun) */
  storageKey?: string;
};

const uid = () =>
  (typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`);

export default function ScenarioPanel({
  getState,
  applyState,
  storageKey = "cj_detay_scenarios",
}: Props) {
  const [items, setItems] = useState<Scenario[]>([]);
  const [currentId, setCurrentId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ---- storage helpers ---- */
  const load = () => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return [];
      const arr: Scenario[] = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const save = (next: Scenario[]) => {
    setItems(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  /* ---- init ---- */
  useEffect(() => {
    const initial = load();
    setItems(initial);
    if (initial.length) setCurrentId(initial[0].id);
  }, []);

  const current = useMemo(
    () => items.find((x) => x.id === currentId) || null,
    [items, currentId]
  );

  /* ---- actions ---- */
  const createNew = () => {
    const now = new Date();
    const name = `Senaryo ${now.toLocaleString()}`;
    const s: Scenario = { id: uid(), name, state: getState() };
    const next = [s, ...items];
    save(next);
    setCurrentId(s.id);
  };

  const saveCurrent = () => {
    if (!currentId) return createNew();
    const next = items.map((x) =>
      x.id === currentId ? { ...x, state: getState() } : x
    );
    save(next);
  };

  const renameCurrent = (name: string) => {
    if (!currentId) return;
    const next = items.map((x) => (x.id === currentId ? { ...x, name } : x));
    save(next);
  };

  const deleteCurrent = () => {
    if (!currentId) return;
    const next = items.filter((x) => x.id !== currentId);
    save(next);
    setCurrentId(next[0]?.id ?? null);
  };

  const applyCurrent = () => {
    if (!current) return;
    applyState(current.state);
  };

  /* ---- export / import ---- */
  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(items, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "scenarios.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const text = await f.text();
      const arr = JSON.parse(text);
      if (!Array.isArray(arr)) throw new Error("JSON formatı beklenmedik");
      // id olmayanları id'le
      const fixed: Scenario[] = arr.map((x: any) => ({
        id: x.id || uid(),
        name: x.name || "Adsız",
        state: x.state ?? {},
      }));
      save(fixed);
      setCurrentId(fixed[0]?.id ?? null);
    } catch (err) {
      alert("Geçersiz JSON");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Senaryolar:</span>
          <select
            className="rounded-md border px-2 py-1 text-sm"
            value={currentId ?? ""}
            onChange={(e) => setCurrentId(e.target.value || null)}
          >
            {items.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
            {!items.length && <option value="">(kayıt yok)</option>}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={createNew}
            className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Yeni Kaydet
          </button>
          <button
            onClick={saveCurrent}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Üstüne Yaz
          </button>
          <button
            onClick={applyCurrent}
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
          >
            Uygula
          </button>
          <button
            onClick={deleteCurrent}
            className="rounded-md border px-3 py-1.5 text-sm text-rose-600 hover:bg-rose-50"
          >
            Sil
          </button>
        </div>
      </div>

      {current && (
        <div className="mb-3">
          <input
            className="w-full rounded-md border px-3 py-2 text-sm"
            value={current.name}
            onChange={(e) => renameCurrent(e.target.value)}
          />
          <p className="mt-1 text-xs text-slate-400">
            Adını düzenleyebilirsin.
          </p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={exportJSON}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          Dışa Aktar (JSON)
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
        >
          İçeri Al (JSON)
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onFilePicked}
        />
      </div>
    </div>
  );
}
