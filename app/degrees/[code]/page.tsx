import Link from "next/link";
import { notFound } from "next/navigation";
import { getCareerOutcomeInfo } from "@/lib/career-outcomes";
import { getDegreeByCode } from "@/lib/data";

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
  "mucha ciencia": "massa ciència"
};

export default async function DegreeDetailPage({
  params,
  searchParams
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ from?: string | string[] }>;
}) {
  const { code } = await params;
  const resolvedSearchParams = await searchParams;
  const from = Array.isArray(resolvedSearchParams.from) ? resolvedSearchParams.from[0] : resolvedSearchParams.from;
  const backHref = from?.startsWith("/results?") ? from : "/results";
  const degree = await getDegreeByCode(code);
  if (!degree) notFound();

  const tags = JSON.parse(degree.tags) as string[];
  const careerOutcomeInfo = getCareerOutcomeInfo({ name: degree.name, branch: degree.branch, tags });

  return (
    <section className="mx-auto max-w-5xl px-5 py-10">
      <Link className="text-sm font-semibold text-coral hover:underline" href={backHref}>
        Tornar a les teves opcions
      </Link>
      <div className="mt-5 rounded-lg border border-ink/10 bg-white/85 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-moss">Codi oficial {degree.code}</p>
        <h1 className="mt-2 text-4xl font-bold text-ink">{degree.name}</h1>
        <p className="mt-3 text-ink/65">
          {degree.university.name}
          {degree.campus ? ` · ${degree.campus.name}, ${degree.campus.city}` : ""}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-md border border-ink/10 bg-paper px-3 py-1 text-sm text-ink/75">
              {tagLabels[tag] ?? tag}
            </span>
          ))}
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Àmbit" value={formatBranch(degree.branch)} />
          <Info label="Què és" value={formatDegreeType(degree.type)} />
          <Info label="Titularitat" value={degree.ownership === "private" ? "Privada" : "Pública"} />
          <Info label="Modalitat" value={formatTextValue(degree.modality)} />
          <Info label="Tipus de centre" value={formatCenterType(degree.centerType)} />
          <Info label="Places disponibles" value={degree.seats ? String(degree.seats) : "Sense dada"} />
          <Info label="Nota de tall" value={degree.cutoff?.toFixed(2) ?? "Sense dada"} />
          <Info label="Càrrega de mates" value={`${degree.mathIntensity}/5`} />
          <Info label="Càrrega científica" value={`${degree.scienceIntensity}/5`} />
          <Info label="Opcions de feina" value={`${degree.employability}/5`} />
        </dl>

        <section className="mt-9 rounded-lg border border-ink/10 bg-paper/80 p-5">
          <h2 className="text-xl font-semibold text-ink">Per on podries tirar després</h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {careerOutcomeInfo.outcomes.map((outcome) => (
              <span key={outcome} className="rounded-md border border-ink/10 bg-white px-3 py-1 text-sm text-ink/75">
                {outcome}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm leading-6 text-ink/65">{careerOutcomeInfo.sourceNote}</p>
          <div className="mt-3 flex flex-wrap gap-3 text-xs font-semibold">
            {careerOutcomeInfo.sources.map((source) => (
              <a key={source.url} className="text-coral hover:underline" href={source.url} target="_blank" rel="noreferrer">
                {source.label}
              </a>
            ))}
          </div>
        </section>

        <h2 className="mt-9 text-xl font-semibold text-ink">Assignatures que poden pujar la teva nota</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-ink/10">
          <table className="w-full border-collapse bg-white text-left text-sm">
            <thead className="bg-skyglass/70 text-ink">
              <tr>
                <th className="px-4 py-3">Assignatura</th>
                <th className="px-4 py-3">Quant suma</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {degree.weights.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.subject.name}</td>
                  <td className="px-4 py-3 font-semibold">{item.weight.toFixed(1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-paper/80 p-4">
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-ink">{value}</dd>
    </div>
  );
}

function formatTextValue(value: string | null) {
  if (!value) return "Sense dada";
  if (value.toLowerCase() === "presencial") return "Presencial";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function formatDegreeType(value: string | null) {
  if (!value) return "Sense dada";
  return value.toLowerCase() === "grado" ? "Grau universitari" : formatTextValue(value);
}

function formatCenterType(value: string | null) {
  if (!value) return "Sense dada";
  const normalized = value.replace(/\s+/g, "").toLowerCase();
  if (normalized.includes("públ.ca") || normalized.includes("publ.ca")) return "Centre adscrit a una universitat pública";
  if (normalized.includes("priv.ca")) return "Centre adscrit a una universitat privada";
  if (normalized.includes("públ") || normalized.includes("publ")) return "Universitat pública";
  if (normalized.includes("priv")) return "Universitat privada";
  return value;
}

function formatBranch(value: string) {
  const normalized = value.toLowerCase();
  if (normalized === "ciencias de la salud") return "Ciències de la salut";
  if (normalized === "ciencias") return "Ciències";
  if (normalized === "ciencias sociales y juridicas") return "Ciències socials i jurídiques";
  if (normalized === "artes y humanidades") return "Arts i humanitats";
  if (normalized === "ingenieria y arquitectura") return "Enginyeria i arquitectura";
  return value;
}
