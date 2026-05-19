"use client";

import { useEffect, useMemo, useState } from "react";
import { defaultRecommendationWeights, type RecommendationWeights } from "@/lib/recommendation-engine";

const storageKey = "pau-match-scoring-weights-v1";

const labels: Record<keyof RecommendationWeights, string> = {
  interests: "Intereses",
  pauSubjects: "Asignaturas PAU",
  admissionRealism: "Realismo de nota",
  coreSubjectAffinity: "Troncales BAT",
  employability: "Salidas laborales",
  location: "Ubicacion",
  personalPreferences: "Preferencias personales"
};

export function ScoringWeightsForm() {
  const [weights, setWeights] = useState<RecommendationWeights>(defaultRecommendationWeights);
  const total = useMemo(() => Object.values(weights).reduce((sum, value) => sum + value, 0), [weights]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) return;
    try {
      setWeights({ ...defaultRecommendationWeights, ...JSON.parse(saved) });
    } catch {
      window.localStorage.removeItem(storageKey);
    }
  }, []);

  function updateWeight(key: keyof RecommendationWeights, value: number) {
    const next = { ...weights, [key]: value };
    setWeights(next);
    window.localStorage.setItem(storageKey, JSON.stringify(next));
  }

  function reset() {
    setWeights(defaultRecommendationWeights);
    window.localStorage.setItem(storageKey, JSON.stringify(defaultRecommendationWeights));
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-ink">Pesos del scoring</h2>
          <p className="mt-1 text-sm text-ink/65">Se guardan en este navegador y se aplican al calcular resultados.</p>
        </div>
        <button type="button" onClick={reset} className="rounded-md border border-ink/15 px-3 py-2 text-sm font-semibold text-ink hover:bg-paper">
          Restaurar
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {(Object.keys(defaultRecommendationWeights) as Array<keyof RecommendationWeights>).map((key) => (
          <label key={key} className="grid gap-2 rounded-md bg-paper/80 p-3 text-sm">
            <span className="flex items-center justify-between gap-3 font-medium text-ink">
              {labels[key]}
              <strong className="text-coral">{weights[key]}</strong>
            </span>
            <input
              className="w-full accent-moss"
              type="range"
              min="0"
              max="40"
              value={weights[key]}
              onChange={(event) => updateWeight(key, Number(event.target.value))}
            />
          </label>
        ))}
      </div>

      <div className={`mt-4 rounded-md px-3 py-2 text-sm font-semibold ${total === 100 ? "bg-moss text-white" : "bg-coral/10 text-coral"}`}>
        Total: {total}. {total === 100 ? "Configuracion equilibrada." : "Conviene que sume 100 para leer porcentajes con claridad."}
      </div>
    </div>
  );
}
