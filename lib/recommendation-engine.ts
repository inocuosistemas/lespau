export type DegreeForRecommendation = {
  id: string;
  code: string;
  name: string;
  branch: string;
  ownership: "public" | "private";
  centerType: string | null;
  cutoff: number | null;
  tags: string[];
  interestTags: string[];
  avoidTags: string[];
  mathIntensity: number;
  scienceIntensity: number;
  peopleInteraction: number;
  creativity: number;
  employability: number;
  university: { name: string; code: string };
  campus: { name: string; city: string } | null;
  weights: Array<{
    weight: number;
    subject: { code: string; name: string };
  }>;
};

export type UserProfileInput = {
  studiedSubjects: string[];
  strongSubjects: string[];
  favoriteCoreSubjects: string[];
  includePrivateUniversities: boolean;
  estimatedAdmission: number | null;
  interests: string[];
  dislikes: string[];
  preferredCity: string | null;
  mathTolerance: number;
  scienceTolerance: number;
  peoplePreference: number;
  creativityPreference: number;
  employabilityImportance: number;
  distanceImportance: number;
  perceivedDifficultyTolerance: number;
};

export type RecommendationWeights = {
  interests: number;
  pauSubjects: number;
  admissionRealism: number;
  coreSubjectAffinity: number;
  employability: number;
  location: number;
  personalPreferences: number;
};

export type RecommendationBreakdown = Record<keyof RecommendationWeights, number>;

export type RecommendationResult = {
  degree: DegreeForRecommendation;
  matchPercentage: number;
  breakdown: RecommendationBreakdown;
  reasons: string[];
  warnings: string[];
  topWeightedSubjects: string[];
};

export const defaultRecommendationWeights: RecommendationWeights = {
  interests: 30,
  pauSubjects: 25,
  admissionRealism: 20,
  coreSubjectAffinity: 10,
  employability: 7,
  location: 4,
  personalPreferences: 4
};

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

function overlapScore(source: string[], target: string[]) {
  if (target.length === 0) return 0.5;
  const sourceSet = new Set(source.map((item) => item.toLowerCase()));
  const hits = target.filter((item) => sourceSet.has(item.toLowerCase())).length;
  return hits / Math.max(target.length, 1);
}

function fitToPreference(actual: number, preferred: number) {
  return clamp01(1 - Math.abs(actual - preferred) / 4);
}

function scoreAdmission(estimatedAdmission: number | null, cutoff: number | null) {
  if (!estimatedAdmission || !cutoff) return 0.55;
  const margin = estimatedAdmission - cutoff;
  if (margin >= 1) return 1;
  if (margin >= 0) return 0.82;
  if (margin >= -0.5) return 0.62;
  if (margin >= -1.25) return 0.35;
  return 0.12;
}

function scorePauSubjects(profile: UserProfileInput, degree: DegreeForRecommendation) {
  const studied = new Set(profile.studiedSubjects);
  const strong = new Set(profile.strongSubjects);
  const relevantWeights = degree.weights.filter((item) => studied.has(item.subject.code));
  if (degree.weights.length === 0) return 0.5;

  const raw = relevantWeights.reduce((sum, item) => {
    const strengthBonus = strong.has(item.subject.code) ? 0.35 : 0;
    return sum + item.weight + strengthBonus;
  }, 0);

  const maxPossible = Math.min(1.1, degree.weights.filter((item) => item.weight >= 0.2).length * 0.35 + 0.4);
  return clamp01(raw / Math.max(maxPossible, 0.6));
}

function scorePersonalPreferences(profile: UserProfileInput, degree: DegreeForRecommendation) {
  const mathFit = degree.mathIntensity <= profile.mathTolerance ? 1 : fitToPreference(degree.mathIntensity, profile.mathTolerance);
  const scienceFit =
    degree.scienceIntensity <= profile.scienceTolerance ? 1 : fitToPreference(degree.scienceIntensity, profile.scienceTolerance);
  const peopleFit = fitToPreference(degree.peopleInteraction, profile.peoplePreference);
  const creativityFit = fitToPreference(degree.creativity, profile.creativityPreference);

  return (mathFit + scienceFit + peopleFit + creativityFit) / 4;
}

const coreSubjectAffinities: Record<string, string[]> = {
  lengua: ["comunicacion", "educacion", "ciencias sociales", "arte", "trato humano"],
  literatura: ["comunicacion", "educacion", "arte", "creatividad"],
  historia: ["ciencias sociales", "educacion", "comunicacion", "arte"],
  filosofia: ["ciencias sociales", "educacion", "trato humano"],
  matematicas: ["tecnologia", "empresa", "ciencias"],
  ingles: ["comunicacion", "empresa", "educacion", "turismo"],
  educacion_fisica: ["deporte", "salud", "educacion", "trato humano"],
  dibujo: ["arte", "creatividad", "tecnologia"]
};

const coreSubjectLabels: Record<string, string> = {
  lengua: "Llengua",
  literatura: "Literatura",
  historia: "Història",
  filosofia: "Filosofia",
  matematicas: "Matemàtiques",
  ingles: "Anglès",
  educacion_fisica: "Educació física",
  dibujo: "Dibuix"
};

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

function matchingCoreSubjects(profile: UserProfileInput, degree: DegreeForRecommendation) {
  return profile.favoriteCoreSubjects.filter((subject) => {
    const affinities = coreSubjectAffinities[subject] ?? [];
    return affinities.some((tag) => degree.interestTags.includes(tag) || degree.tags.includes(tag));
  });
}

function scoreCoreSubjectAffinity(profile: UserProfileInput, degree: DegreeForRecommendation) {
  if (profile.favoriteCoreSubjects.length === 0) return 0.5;
  return matchingCoreSubjects(profile, degree).length / profile.favoriteCoreSubjects.length;
}

function buildReasons(profile: UserProfileInput, degree: DegreeForRecommendation, breakdown: RecommendationBreakdown) {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const sharedInterests = degree.interestTags.filter((tag) => profile.interests.includes(tag));
  const strongWeighted = degree.weights.filter((item) => profile.strongSubjects.includes(item.subject.code) && item.weight >= 0.2);
  const coreMatches = matchingCoreSubjects(profile, degree);

  if (sharedInterests.length > 0) {
    reasons.push(`Té a veure amb coses que t'interessen: ${sharedInterests.slice(0, 3).map(labelForTag).join(", ")}.`);
  }
  if (strongWeighted.length > 0) {
    reasons.push(
      `Et pot ajudar portar bé: ${strongWeighted
        .slice(0, 3)
        .map((item) => item.subject.name)
        .join(", ")}.`
    );
  }
  if (coreMatches.length > 0) {
    reasons.push(`També connecta amb assignatures que t'agradaven: ${coreMatches.map((item) => coreSubjectLabels[item] ?? item).slice(0, 3).join(", ")}.`);
  }
  if (profile.estimatedAdmission && degree.cutoff) {
    const margin = profile.estimatedAdmission - degree.cutoff;
    reasons.push(
      margin >= 0
        ? `La teva nota estimada supera la nota de tall aproximada per ${margin.toFixed(2)} punts.`
        : `La teva nota estimada queda a ${Math.abs(margin).toFixed(2)} punts de la nota de tall aproximada.`
    );
  }
  if (profile.preferredCity && degree.campus?.city.toLowerCase() === profile.preferredCity.toLowerCase()) {
    reasons.push(`És en una ciutat que has marcat: ${degree.campus.city}.`);
  }
  if (breakdown.employability >= defaultRecommendationWeights.employability * 0.75) {
    reasons.push("Sol tenir bones sortides.");
  }

  const dislikes = degree.avoidTags.filter((tag) => profile.dislikes.includes(tag));
  if (dislikes.length > 0) {
    warnings.push(`Revisa això perquè ho volies evitar: ${dislikes.slice(0, 2).map(labelForTag).join(", ")}.`);
  }
  if (degree.mathIntensity > profile.mathTolerance) {
    warnings.push("Pot tenir més mates de les que et venen de gust.");
  }
  if (degree.scienceIntensity > profile.scienceTolerance) {
    warnings.push("Pot tenir més ciència de la que et ve de gust.");
  }

  return { reasons, warnings };
}

export function recommendDegrees(
  profile: UserProfileInput,
  degrees: DegreeForRecommendation[],
  config: RecommendationWeights = defaultRecommendationWeights
): RecommendationResult[] {
  const eligibleDegrees = profile.includePrivateUniversities ? degrees : degrees.filter((degree) => degree.ownership !== "private");

  return eligibleDegrees
    .map((degree) => {
      const interestBase = overlapScore(profile.interests, degree.interestTags);
      const dislikePenalty = overlapScore(profile.dislikes, degree.avoidTags) * 0.35;
      const interestScore = clamp01(interestBase - dislikePenalty);
      const pauScore = scorePauSubjects(profile, degree);
      const admissionScore = scoreAdmission(profile.estimatedAdmission, degree.cutoff);
      const coreSubjectScore = scoreCoreSubjectAffinity(profile, degree);
      const employabilityScore = clamp01(degree.employability / 5);
      const locationScore =
        !profile.preferredCity || !degree.campus ? 0.65 : degree.campus.city.toLowerCase() === profile.preferredCity.toLowerCase() ? 1 : 0.35;
      const preferenceScore = scorePersonalPreferences(profile, degree);

      const breakdown: RecommendationBreakdown = {
        interests: interestScore * config.interests,
        pauSubjects: pauScore * config.pauSubjects,
        admissionRealism: admissionScore * config.admissionRealism,
        coreSubjectAffinity: coreSubjectScore * config.coreSubjectAffinity,
        employability: employabilityScore * config.employability,
        location: locationScore * config.location,
        personalPreferences: preferenceScore * config.personalPreferences
      };

      const total = Object.values(breakdown).reduce((sum, value) => sum + value, 0);
      const maxTotal = Object.values(config).reduce((sum, value) => sum + value, 0);
      const { reasons, warnings } = buildReasons(profile, degree, breakdown);
      const topWeightedSubjects = degree.weights
        .filter((item) => item.weight >= 0.2)
        .map((item) => item.subject.name)
        .slice(0, 5);

      return {
        degree,
        matchPercentage: Math.round((total / maxTotal) * 100),
        breakdown,
        reasons,
        warnings,
        topWeightedSubjects
      };
    })
    .sort((a, b) => b.matchPercentage - a.matchPercentage);
}
