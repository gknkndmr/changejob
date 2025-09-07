// src/utils/scoring.ts

export type OfferValues = {
  salary: number;   // TL/ay (yüksek iyi)
  commute: number;  // TL/ay (düşük iyi)
  meal: number;     // TL/ay (yüksek iyi)
  leave: number;    // gün/yıl (yüksek iyi)
};

export type Weights = {
  salary: number;   // 0-100
  commute: number;  // 0-100
  meal: number;     // 0-100
  leave: number;    // 0-100
};

// 0-100 normalize: her kalemi kendi içinde kıyaslar.
// salary, meal, leave: yüksek iyi  => value / max * 100
// commute (yol):      düşük  iyi  => min / value * 100  (value=0 ise 100 veriyoruz)
export function normalizePair(ben: OfferValues, karsi: OfferValues) {
  const max = (a: number, b: number) => Math.max(a, b);
  const min = (a: number, b: number) => Math.min(a, b);

  const pos = (v: number, m: number) => (m <= 0 ? 100 : clamp((v / m) * 100));
  const neg = (v: number, m: number) => {
    if (v <= 0 && m > 0) return 100;
    if (m <= 0) return 100;
    return clamp((m / v) * 100);
  };

  const salaryMax = max(ben.salary, karsi.salary);
  const mealMax = max(ben.meal, karsi.meal);
  const leaveMax = max(ben.leave, karsi.leave);
  const commuteMin = min(ben.commute, karsi.commute);

  const benN = {
    salary: pos(ben.salary, salaryMax),
    meal: pos(ben.meal, mealMax),
    leave: pos(ben.leave, leaveMax),
    commute: neg(ben.commute, commuteMin),
  };

  const karsiN = {
    salary: pos(karsi.salary, salaryMax),
    meal: pos(karsi.meal, mealMax),
    leave: pos(karsi.leave, leaveMax),
    commute: neg(karsi.commute, commuteMin),
  };

  return { ben: benN, karsi: karsiN };
}

export function weightedScore(
  n: { salary: number; commute: number; meal: number; leave: number },
  w: Weights
) {
  const total = w.salary + w.commute + w.meal + w.leave || 1;
  const ws =
    (n.salary * w.salary +
      n.commute * w.commute +
      n.meal * w.meal +
      n.leave * w.leave) /
    total;
  return clamp(ws);
}

export function clamp(n: number, lo = 0, hi = 100) {
  return Math.max(lo, Math.min(hi, n));
}

export function sumWeights(w: Weights) {
  return w.salary + w.commute + w.meal + w.leave;
}
