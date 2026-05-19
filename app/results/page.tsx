import Link from "next/link";
import { getDegreesForRecommendation } from "@/lib/data";
import { getCareerOutcomeInfo } from "@/lib/career-outcomes";
import { defaultRecommendationWeights, recommendDegrees, type RecommendationWeights, type UserProfileInput } from "@/lib/recommendation-engine";

type SearchParams = Record<string, string | string[] | undefined>;

const listParam = (params: SearchParams, key: string) => {
  const value = params[key];
  const text = Array.isArray(value) ? value[0] : value;
  return text ? text.split(",").map((item) => item.trim()).filter(Boolean) : [];
};

const numberParam = (params: SearchParams, key: string, fallback: number) => {
  const value = params[key];
  const text = Array.isArray(value) ? value[0] : value;
  const parsed = Number(text);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const booleanParam = (params: SearchParams, key: string, fallback: boolean) => {
  const value = params[key];
  const text = Array.isArray(value) ? value[0] : value;
  if (text === "true") return true;
  if (text === "false") return false;
  return fallback;
};

const setQueryParam = (params: SearchParams, key: string, value: string) => {
  const query = new URLSearchParams();
  for (const [paramKey, paramValue] of Object.entries(params)) {
    if (paramKey === key) continue;
    if (Array.isArray(paramValue)) {
      paramValue.forEach((entry) => query.append(paramKey, entry));
    } else if (paramValue) {
      query.set(paramKey, paramValue);
    }
  }
  query.set(key, value);
  return `/results?${query.toString()}`;
};

const normalizeDegreeGroupKey = (name: string) => {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/"[^"]+"/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

const weightKeys = Object.keys(defaultRecommendationWeights) as Array<keyof RecommendationWeights>;

const scoringWeightsFromParams = (params: SearchParams): RecommendationWeights => {
  return weightKeys.reduce((config, key) => {
    config[key] = numberParam(params, `weight_${key}`, defaultRecommendationWeights[key]);
    return config;
  }, { ...defaultRecommendationWeights });
};

const optionText = (count: number) => `${count} ${count === 1 ? "opció" : "opcions"}`;

const tagLabels: Record<string, string> = {
  salud: "salut",
  tecnologia: "tecnologia",
  empresa: "empresa",
  educacion: "educació",
  arte: "art",
  "ciencias sociales": "ciències socials",
  deporte: "esport",
  comunicacion: "comunicació",
  creatividad: "creativitat",
  "trato humano": "tracte amb persones",
  ciencias: "ciències",
  "mucha matematica": "massa mates",
  "mucha ciencia": "massa ciència",
  "sin ordenadores": "poca tecnologia",
  "sin trato humano": "poc tracte amb persones",
  "sin numeros": "massa números"
};

const labelForTag = (tag: string) => tagLabels[tag] ?? tag;

export default async function ResultsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams;
  const profile: UserProfileInput = {
    studiedSubjects: listParam(params, "studiedSubjects"),
    strongSubjects: listParam(params, "strongSubjects"),
    favoriteCoreSubjects: listParam(params, "favoriteCoreSubjects"),
    includePrivateUniversities: booleanParam(params, "includePrivateUniversities", true),
    interests: listParam(params, "interests"),
    dislikes: listParam(params, "dislikes"),
    estimatedAdmission: numberParam(params, "estimatedAdmission", NaN) || null,
    preferredCity: typeof params.preferredCity === "string" ? params.preferredCity || null : null,
    mathTolerance: numberParam(params, "mathTolerance", 3),
    scienceTolerance: numberParam(params, "scienceTolerance", 3),
    peoplePreference: numberParam(params, "peoplePreference", 3),
    creativityPreference: numberParam(params, "creativityPreference", 3),
    employabilityImportance: numberParam(params, "employabilityImportance", 3),
    distanceImportance: numberParam(params, "distanceImportance", 3),
    perceivedDifficultyTolerance: numberParam(params, "perceivedDifficultyTolerance", 3)
  };

  const degrees = await getDegreesForRecommendation();
  const scoringWeights = scoringWeightsFromParams(params);
  const recommendations = recommendDegrees(profile, degrees, scoringWeights);
  const groupedRecommendations = Array.from(
    recommendations
      .reduce((groups, recommendation) => {
        const key = normalizeDegreeGroupKey(recommendation.degree.name);
        const existing = groups.get(key);
        if (existing) {
          existing.push(recommendation);
        } else {
          groups.set(key, [recommendation]);
        }
        return groups;
      }, new Map<string, typeof recommendations>())
      .values()
  )
    .map((group) => group.sort((a, b) => b.matchPercentage - a.matchPercentage))
    .sort((a, b) => b[0].matchPercentage - a[0].matchPercentage);
  const visibleCount = Math.min(numberParam(params, "limit", 12), groupedRecommendations.length);
  const visibleGroups = groupedRecommendations.slice(0, visibleCount);
  const eligibleCount = profile.includePrivateUniversities ? degrees.length : degrees.filter((degree) => degree.ownership !== "private").length;
  const privateCount = degrees.length - degrees.filter((degree) => degree.ownership !== "private").length;
  const activeFilters = [
    !profile.includePrivateUniversities ? "sense privades" : null,
    profile.preferredCity ? `ciutat: ${profile.preferredCity}` : null,
    profile.dislikes.length > 0 ? `evita: ${profile.dislikes.map(labelForTag).join(", ")}` : null,
    profile.mathTolerance <= 2 ? "mates: millor poca càrrega" : null,
    profile.scienceTolerance <= 2 ? "ciència: millor poca càrrega" : null
  ].filter((item): item is string => Boolean(item));
  const currentQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      value.forEach((entry) => currentQuery.append(key, entry));
    } else if (value) {
      currentQuery.set(key, value);
    }
  }
  const rankingUrl = `/results?${currentQuery.toString()}`;

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-coral">Les teves opcions</p>
          <h1 className="mt-2 text-3xl font-bold text-ink">Carreres que poden anar amb tu</h1>
        </div>
        <Link className="rounded-md border border-ink/15 bg-white/70 px-4 py-2 text-sm font-semibold text-ink hover:bg-white" href="/profile">
          Canviar respostes
        </Link>
      </div>

      <div className="mt-6 rounded-lg border border-ink/10 bg-white/85 p-5">
        <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-center">
          <div>
            <p className="text-sm font-semibold text-ink">
              {degrees.length} carreres revisades · {eligibleCount} opcions disponibles · {groupedRecommendations.length} grups semblants · veient{" "}
              {visibleGroups.length}
            </p>
            <p className="mt-1 text-sm text-ink/65">
              {profile.includePrivateUniversities
                ? `També apareixen universitats i centres privats (${privateCount}).`
                : `No es mostren universitats ni centres privats (${privateCount}).`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[6, 12, 24, 48].map((limit) => (
              <Link
                key={limit}
                className={`rounded-md border px-3 py-2 text-sm font-semibold ${
                  visibleCount === limit ? "border-ink bg-ink text-white" : "border-ink/15 bg-white text-ink hover:bg-paper"
                }`}
                href={setQueryParam(params, "limit", String(limit))}
              >
                Veure {limit}
              </Link>
            ))}
          </div>
        </div>
        {activeFilters.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <span key={filter} className="rounded-md bg-paper px-2.5 py-1 text-xs font-medium text-ink/70">
                {filter}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-8 grid gap-4">
        {visibleGroups.map((group) => {
          const item = group[0];
          const careerOutcomeInfo = getCareerOutcomeInfo(item.degree);
          const estimatedAdmission = profile.estimatedAdmission;
          const matchingCutoff =
            estimatedAdmission === null
              ? group
              : group.filter((candidate) => candidate.degree.cutoff !== null && candidate.degree.cutoff <= estimatedAdmission);
          const shownUniversities = (matchingCutoff.length > 0 ? matchingCutoff : group)
            .sort((a, b) => (a.degree.cutoff ?? 99) - (b.degree.cutoff ?? 99))
            .slice(0, 8);

          return (
          <article key={normalizeDegreeGroupKey(item.degree.name)} className="rounded-lg border border-ink/10 bg-white/85 p-5 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-moss px-3 py-1 text-sm font-bold text-white">{item.matchPercentage}% per a tu</span>
                  <span className="text-sm text-ink/55">Codi oficial {item.degree.code}</span>
                  {item.degree.ownership === "private" ? (
                    <span className="rounded-md border border-coral/30 bg-coral/10 px-2 py-1 text-xs font-semibold text-coral">privada</span>
                  ) : null}
                </div>
                <h2 className="mt-3 text-2xl font-bold text-ink">{item.degree.name}</h2>
                <p className="mt-1 text-sm text-ink/65">
                  {optionText(group.length)} on estudiar-la
                  {matchingCutoff.length > 0 && profile.estimatedAdmission !== null
                    ? ` · ${matchingCutoff.length} ${matchingCutoff.length === 1 ? "entra" : "entren"} amb la teva nota estimada`
                    : ""}
                </p>
              </div>
              <Link
                className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-ink/90"
                href={`/degrees/${item.degree.code}?from=${encodeURIComponent(rankingUrl)}`}
              >
                Veure més
              </Link>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {item.degree.tags.map((tag) => (
                <span key={tag} className="rounded-md border border-ink/10 bg-paper px-2.5 py-1 text-xs font-medium text-ink/75">
                  {labelForTag(tag)}
                </span>
              ))}
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h3 className="text-sm font-semibold text-ink">Per què pot encaixar</h3>
                <ul className="mt-2 space-y-2 text-sm leading-6 text-ink/70">
                  {item.reasons.slice(0, 3).map((reason) => (
                    <li key={reason}>{reason}</li>
                  ))}
                  {item.warnings.slice(0, 1).map((warning) => (
                    <li key={warning} className="text-coral">
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-md bg-skyglass/60 p-4 text-sm text-ink/75">
                <p>
                  <strong>Nota de tall més baixa:</strong>{" "}
                  {group
                    .map((candidate) => candidate.degree.cutoff)
                    .filter((cutoff): cutoff is number => cutoff !== null)
                    .sort((a, b) => a - b)[0]
                    ?.toFixed(2) ?? "Sense dada"}
                </p>
                <p className="mt-2">
                  <strong>Assignatures que sumen més:</strong> {item.topWeightedSubjects.join(", ") || "Sense dada"}
                </p>
              </div>
            </div>

            <div className="mt-5 rounded-md bg-paper/80 p-4">
              <h3 className="text-sm font-semibold text-ink">Per on podries tirar després</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                {careerOutcomeInfo.outcomes.map((outcome) => (
                  <span key={outcome} className="rounded-md border border-ink/10 bg-white px-2.5 py-1 text-xs font-medium text-ink/75">
                    {outcome}
                  </span>
                ))}
              </div>
              <p className="mt-3 text-xs leading-5 text-ink/55">{careerOutcomeInfo.sourceNote}</p>
            </div>

            <div className="mt-5 rounded-lg border border-ink/10 bg-white">
              <div className="border-b border-ink/10 px-4 py-3 text-sm font-semibold text-ink">
                {matchingCutoff.length > 0 || profile.estimatedAdmission === null
                  ? "Llocs on la nota et podria donar"
                  : "Llocs que queden més a prop per nota"}
              </div>
              <div className="divide-y divide-ink/10">
                {shownUniversities.map((candidate) => (
                  <div key={candidate.degree.id} className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_auto_auto] md:items-center">
                    <div>
                      <p className="font-semibold text-ink">{candidate.degree.university.name}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-ink/60">
                        <span>{candidate.degree.campus ? `${candidate.degree.campus.name}, ${candidate.degree.campus.city}` : "Campus sense dada"}</span>
                        {candidate.degree.ownership === "private" ? (
                          <span className="rounded-md border border-coral/30 bg-coral/10 px-2 py-0.5 text-xs font-semibold uppercase tracking-wide text-coral">
                            privada
                          </span>
                        ) : null}
                      </div>
                    </div>
                    <span className="text-ink/70">Tall {candidate.degree.cutoff?.toFixed(2) ?? "sense dada"}</span>
                    <Link
                      className="rounded-md border border-ink/15 px-3 py-2 text-center text-xs font-semibold text-ink hover:bg-paper"
                      href={`/degrees/${candidate.degree.code}?from=${encodeURIComponent(rankingUrl)}`}
                    >
                      Veure
                    </Link>
                  </div>
                ))}
              </div>
              {group.length > shownUniversities.length ? (
                <p className="px-4 py-3 text-xs text-ink/55">
                  Hi ha {optionText(group.length - shownUniversities.length)} més d'aquesta carrera fora d'aquesta llista curta.
                </p>
              ) : null}
            </div>
          </article>
          );
        })}
      </div>
    </section>
  );
}
