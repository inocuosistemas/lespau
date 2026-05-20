"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type SubjectOption = {
  code: string;
  name: string;
};

type ChoiceOption = {
  value: string;
  label: string;
};

const interests = [
  { value: "salud", label: "salut" },
  { value: "tecnologia", label: "tecnologia" },
  { value: "empresa", label: "empresa" },
  { value: "educacion", label: "educació" },
  { value: "arte", label: "art" },
  { value: "ciencias sociales", label: "ciències socials" },
  { value: "deporte", label: "esport" },
  { value: "comunicacion", label: "comunicació" },
  { value: "creatividad", label: "creativitat" },
  { value: "trato humano", label: "tracte amb persones" },
  { value: "ciencias", label: "ciències" }
];

const dislikes = [
  { value: "mucha matematica", label: "massa mates" },
  { value: "mucha ciencia", label: "massa ciència" },
  { value: "sin ordenadores", label: "poca tecnologia" },
  { value: "sin trato humano", label: "poc tracte amb persones" },
  { value: "sin numeros", label: "massa números" }
];

const previousDislikeValues: Record<string, string> = {
  "demasiadas mates": "mucha matematica",
  "demasiada ciencia": "mucha ciencia",
  "poca tecnologia": "sin ordenadores",
  "poco trato con personas": "sin trato humano",
  "demasiados numeros": "sin numeros"
};

const normalizeDislikeValues = (values: string[]) => values.map((value) => previousDislikeValues[value] ?? value);

const cities = ["Barcelona", "Cerdanyola del Vallès", "Girona", "Vic", "L'Hospitalet de Llobregat"];
const coreSubjects = [
  { value: "lengua", label: "Llengua" },
  { value: "literatura", label: "Literatura" },
  { value: "historia", label: "Història" },
  { value: "filosofia", label: "Filosofia" },
  { value: "matematicas", label: "Matemàtiques" },
  { value: "ingles", label: "Anglès" },
  { value: "educacion_fisica", label: "Educació física" },
  { value: "dibujo", label: "Dibuix" }
];
const storageKey = "pau-match-profile-v2";
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
  const [studiedSubjects, setStudiedSubjects] = useState<string[]>([]);
  const [strongSubjects, setStrongSubjects] = useState<string[]>([]);
  const [favoriteCoreSubjects, setFavoriteCoreSubjects] = useState<string[]>([]);
  const [includePrivateUniversities, setIncludePrivateUniversities] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedDislikes, setSelectedDislikes] = useState<string[]>([]);
  const [estimatedAdmission, setEstimatedAdmission] = useState("");
  const [preferredCity, setPreferredCity] = useState("");
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
      if (Array.isArray(parsed.selectedDislikes)) setSelectedDislikes(normalizeDislikeValues(parsed.selectedDislikes));
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
        <h2 className="text-lg font-semibold text-ink">Assignatures que portes per a la PAU</h2>
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
        <h3 className="mt-5 text-sm font-semibold text-ink">Les que se't donen millor</h3>
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
        <h3 className="mt-6 text-sm font-semibold text-ink">Assignatures comunes que t'agradaven</h3>
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
        <h2 className="text-lg font-semibold text-ink">El que busques</h2>
        <label className="mt-4 block text-sm font-medium text-ink">
          Nota que creus que pots treure
          <input
            className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
            value={estimatedAdmission}
            onChange={(event) => setEstimatedAdmission(event.target.value)}
            inputMode="decimal"
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-ink">
          Ciutat que prefereixes
          <select
            className="mt-2 w-full rounded-md border border-ink/15 bg-white px-3 py-2"
            value={preferredCity}
            onChange={(event) => setPreferredCity(event.target.value)}
          >
            <option value="">Sense preferència</option>
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
          <span>Incloure universitats i centres privats</span>
        </label>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Range label="Com portes les mates" value={mathTolerance} onChange={setMathTolerance} />
          <Range label="Comoditat amb la ciència" value={scienceTolerance} onChange={setScienceTolerance} />
          <Range label="Ganes de treballar amb persones" value={peoplePreference} onChange={setPeoplePreference} />
          <Range label="Ganes de crear coses" value={creativityPreference} onChange={setCreativityPreference} />
          <Range label="Importància de trobar feina" value={employabilityImportance} onChange={setEmployabilityImportance} />
        </div>

        <Chooser title="Coses que t'interessen" values={interests} selected={selectedInterests} onToggle={(value) => toggle(value, selectedInterests, setSelectedInterests)} />
        <Chooser title="El que prefereixes evitar" values={dislikes} selected={selectedDislikes} onToggle={(value) => toggle(value, selectedDislikes, setSelectedDislikes)} />

        <button type="button" onClick={submit} className="mt-6 w-full rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink/90">
          Veure carreres recomanades
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
  values: ChoiceOption[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-semibold text-ink">{title}</h3>
      <div className="mt-3 flex flex-wrap gap-2">
        {values.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onToggle(option.value)}
            className={`rounded-md border px-3 py-2 text-sm ${
              selected.includes(option.value) ? "border-coral bg-coral text-white" : "border-ink/10 bg-white text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
