"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SubjectOption = {
  code: string;
  name: string;
};

const interests = [
  "salud",
  "tecnologia",
  "empresa",
  "educacion",
  "arte",
  "ciencias sociales",
  "deporte",
  "comunicacion",
  "creatividad",
  "trato humano",
  "ciencias"
];

const dislikes = ["mucha matematica", "mucha ciencia", "sin ordenadores", "sin trato humano", "sin numeros"];

const cities = ["Barcelona", "Cerdanyola del Valles", "Girona", "Vic", "L'Hospitalet de Llobregat"];
const coreSubjects = [
  { value: "lengua", label: "Lengua" },
  { value: "literatura", label: "Literatura" },
  { value: "historia", label: "Historia" },
  { value: "filosofia", label: "Filosofia" },
  { value: "matematicas", label: "Matematicas" },
  { value: "ingles", label: "Ingles" },
  { value: "educacion_fisica", label: "Educacion fisica" },
  { value: "dibujo", label: "Dibujo" }
];
const storageKey = "pau-match-profile-v1";
const scoringStorageKey = "pau-match-scoring-weights-v1";

type StoredProfile = {
  studiedSubjects: string[];
  strongSubjects: string[];
  favoriteCoreSubjects: string[];
  includePrivateUniversities: boolean;
  selectedInterests: string[];
  selectedDislikes: string[];
  estimatedAdmission: string;
  preferredCity: string;
  mathTolerance: number;
  scienceTolerance: number;
  peoplePreference: number;
  creativityPreference: number;
  employabilityImportance: number;
};

export function ProfileForm({ subjects }: { subjects: SubjectOption[] }) {
  const router = useRouter();
  const [studiedSubjects, setStudiedSubjects] = useState<string[]>(["BIO", "MATHSS"]);
  const [strongSubjects, setStrongSubjects] = useState<string[]>(["BIO"]);
  const [favoriteCoreSubjects, setFavoriteCoreSubjects] = useState<string[]>(["historia"]);
  const [includePrivateUniversities, setIncludePrivateUniversities] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["salud", "trato humano"]);
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>(["mucha matematica"]);
  const [estimatedAdmission, setEstimatedAdmission] = useState("10.8");
  const [preferredCity, setPreferredCity] = useState("Barcelona");
  const [mathTolerance, setMathTolerance] = useState(3);
  const [scienceTolerance, setScienceTolerance] = useState(4);
  const [peoplePreference, setPeoplePreference] = useState(5);
  const [creativityPreference, setCreativityPreference] = useState(3);
  const [employabilityImportance, setEmployabilityImportance] = useState(4);
  const [hasLoadedSavedProfile, setHasLoadedSavedProfile] = useState(false);

  const subjectByCode = useMemo(() => new Map(subjects.map((subject) => [subject.code, subject.name])), [subjects]);
  const profile: StoredProfile = {
    studiedSubjects,
    strongSubjects,
    favoriteCoreSubjects,
    includePrivateUniversities,
    selectedInterests,
    selectedDislikes,
    estimatedAdmission,
    preferredCity,
    mathTolerance,
    scienceTolerance,
    peoplePreference,
    creativityPreference,
    employabilityImportance
  };

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      setHasLoadedSavedProfile(true);
      return;
    }
    try {
      const parsed = JSON.parse(saved) as Partial<StoredProfile>;
      if (Array.isArray(parsed.studiedSubjects)) setStudiedSubjects(parsed.studiedSubjects);
      if (Array.isArray(parsed.strongSubjects)) setStrongSubjects(parsed.strongSubjects);
      if (Array.isArray(parsed.favoriteCoreSubjects)) setFavoriteCoreSubjects(parsed.favoriteCoreSubjects);
      if (typeof parsed.includePrivateUniversities === "boolean") setIncludePrivateUniversities(parsed.includePrivateUniversities);
      if (Array.isArray(parsed.selectedInterests)) setSelectedInterests(parsed.selectedInterests);
      if (Array.isArray(parsed.selectedDislikes)) setSelectedDislikes(parsed.selectedDislikes);
      if (typeof parsed.estimatedAdmission === "string") setEstimatedAdmission(parsed.estimatedAdmission);
      if (typeof parsed.preferredCity === "string") setPreferredCity(parsed.preferredCity);
      if (typeof parsed.mathTolerance === "number") setMathTolerance(parsed.mathTolerance);
      if (typeof parsed.scienceTolerance === "number") setScienceTolerance(parsed.scienceTolerance);
      if (typeof parsed.peoplePreference === "number") setPeoplePreference(parsed.peoplePreference);
      if (typeof parsed.creativityPreference === "number") setCreativityPreference(parsed.creativityPreference);
      if (typeof parsed.employabilityImportance === "number") setEmployabilityImportance(parsed.employabilityImportance);
    } catch {
      window.localStorage.removeItem(storageKey);
    } finally {
      setHasLoadedSavedProfile(true);
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedSavedProfile) return;
    window.localStorage.setItem(storageKey, JSON.stringify(profile));
  }, [hasLoadedSavedProfile, profile]);

  useEffect(() => {
    setStrongSubjects((current) => current.filter((code) => studiedSubjects.includes(code)));
  }, [studiedSubjects]);

  function toggle(value: string, list: string[], setter: (next: string[]) => void) {
    setter(list.includes(value) ? list.filter((item) => item !== value) : [...list, value]);
  }

  function submit() {
    const params = new URLSearchParams({
      studiedSubjects: studiedSubjects.join(","),
      strongSubjects: strongSubjects.join(","),
      favoriteCoreSubjects: favoriteCoreSubjects.join(","),
      includePrivateUniversities: String(includePrivateUniversities),
      interests: selectedInterests.join(","),
      dislikes: selectedDislikes.join(","),
      estimatedAdmission,
      preferredCity,
      mathTolerance: String(mathTolerance),
      scienceTolerance: String(scienceTolerance),
      peoplePreference: String(peoplePreference),
      creativityPreference: String(creativityPreference),
      employabilityImportance: String(employabilityImportance),
      distanceImportance: "3",
      perceivedDifficultyTolerance: "3"
    });
    const savedWeights = window.localStorage.getItem(scoringStorageKey);
    if (savedWeights) {
      try {
        const parsed = JSON.parse(savedWeights) as Record<string, number>;
        for (const [key, value] of Object.entries(parsed)) {
          if (Number.isFinite(value)) {
            params.set(`weight_${key}`, String(value));
          }
        }
      } catch {
        window.localStorage.removeItem(scoringStorageKey);
      }
    }
    window.localStorage.setItem(storageKey, JSON.stringify(profile));
    router.push(`/results?${params.toString()}`);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <section className="rounded-lg border border-ink/10 bg-white/80 p-5">
        <h2 className="text-lg font-semibold text-ink">Asignaturas PAU</h2>
        <div className="mt-4 grid gap-2">
          {subjects.map((subject) => (
            <label key={subject.code} className="flex items-center gap-3 rounded-md border border-ink/10 bg-white px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={studiedSubjects.includes(subject.code)}
                onChange={() => toggle(subject.code, studiedSubjects, setStudiedSubjects)}
              />
              <span>{subject.name}</span>
            </label>
          ))}
        </div>
        <h3 className="mt-5 text-sm font-semibold text-ink">Se le dan especialmente bien</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {studiedSubjects.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => toggle(code, strongSubjects, setStrongSubjects)}
              className={`rounded-md border px-3 py-2 text-sm ${
                strongSubjects.includes(code) ? "border-moss bg-moss text-white" : "border-ink/10 bg-white text-ink"
              }`}
            >
              {subjectByCode.get(code) ?? code}
            </button>
          ))}
        </div>
        <h3 className="mt-6 text-sm font-semibold text-ink">Troncales de BAT que le gustaban</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {coreSubjects.map((subject) => (
            <button
              key={subject.value}
              type="button"
              onClick={() => toggle(subject.value, favoriteCoreSubjects, setFavoriteCoreSubjects)}
              className={`rounded-md border px-3 py-2 text-sm ${
                favoriteCoreSubjects.includes(subject.value) ? "border-coral bg-coral text-white" : "border-ink/10 bg-white text-ink"
              }`}
            >
              {subject.label}
            </button>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-ink/10 bg-white/80 p-5">
        <h2 className="text-lg font-semibold text-ink">Preferencias</h2>
        <label className="mt-4 block text-sm font-medium text-ink">
          Nota de acceso estimada
          <input
            className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
            value={estimatedAdmission}
            onChange={(event) => setEstimatedAdmission(event.target.value)}
            inputMode="decimal"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink">
          Ciudad preferida
          <select
            className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
            value={preferredCity}
            onChange={(event) => setPreferredCity(event.target.value)}
          >
            <option value="">Sin preferencia</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </label>
        <label className="mt-4 flex items-center gap-3 rounded-md border border-ink/10 bg-white px-3 py-3 text-sm font-medium text-ink">
          <input
            type="checkbox"
            checked={includePrivateUniversities}
            onChange={(event) => setIncludePrivateUniversities(event.target.checked)}
          />
          <span>Mostrar universidades privadas y centros privados</span>
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Range label="Tolerancia a matematicas" value={mathTolerance} onChange={setMathTolerance} />
          <Range label="Tolerancia a fisica/quimica" value={scienceTolerance} onChange={setScienceTolerance} />
          <Range label="Trato con personas" value={peoplePreference} onChange={setPeoplePreference} />
          <Range label="Creatividad" value={creativityPreference} onChange={setCreativityPreference} />
          <Range label="Salidas laborales" value={employabilityImportance} onChange={setEmployabilityImportance} />
        </div>

        <Chooser title="Intereses" values={interests} selected={selectedInterests} onToggle={(value) => toggle(value, selectedInterests, setSelectedInterests)} />
        <Chooser title="Cosas que no quiere" values={dislikes} selected={selectedDislikes} onToggle={(value) => toggle(value, selectedDislikes, setSelectedDislikes)} />

        <button type="button" onClick={submit} className="mt-6 w-full rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink/90">
          Ver recomendaciones
        </button>
      </section>
    </div>
  );
}

function Range({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return (
    <label className="block text-sm font-medium text-ink">
      <span className="flex justify-between gap-2">
        {label}
        <strong>{value}/5</strong>
      </span>
      <input className="mt-2 w-full accent-moss" type="range" min="1" max="5" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Chooser({
  title,
  values,
  selected,
  onToggle
}: {
  title: string;
  values: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onToggle(value)}
            className={`rounded-md border px-3 py-2 text-sm ${
              selected.includes(value) ? "border-coral bg-coral text-white" : "border-ink/10 bg-white text-ink"
            }`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
