import Link from "next/link";
import { notFound } from "next/navigation";
import { getCareerOutcomeInfo } from "@/lib/career-outcomes";
import { getDegreeByCode } from "@/lib/data";

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
        Volver al ranking
      </Link>
      <div className="mt-5 rounded-lg border border-ink/10 bg-white/85 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-moss">{degree.code}</p>
        <h1 className="mt-2 text-4xl font-bold text-ink">{degree.name}</h1>
        <p className="mt-3 text-ink/65">
          {degree.university.name}
          {degree.campus ? ` · ${degree.campus.name}, ${degree.campus.city}` : ""}
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span key={tag} className="rounded-md border border-ink/10 bg-paper px-3 py-1 text-sm text-ink/75">
              {tag}
            </span>
          ))}
        </div>

        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Info label="Rama" value={degree.branch} />
          <Info label="Tipo" value={degree.type} />
          <Info label="Titularidad" value={degree.ownership === "private" ? "Privada" : "Publica"} />
          <Info label="Modalidad" value={degree.modality ?? "Sin dato"} />
          <Info label="Tipo de centro" value={degree.centerType ?? "Sin dato"} />
          <Info label="Plazas" value={degree.seats ? String(degree.seats) : "Sin dato"} />
          <Info label="Nota de corte" value={degree.cutoff?.toFixed(2) ?? "Sin dato"} />
          <Info label="Matematicas" value={`${degree.mathIntensity}/5`} />
          <Info label="Ciencia" value={`${degree.scienceIntensity}/5`} />
          <Info label="Empleabilidad" value={`${degree.employability}/5`} />
        </dl>

        <section className="mt-9 rounded-lg border border-ink/10 bg-paper/80 p-5">
          <h2 className="text-xl font-semibold text-ink">Salidas profesionales orientativas</h2>
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

        <h2 className="mt-9 text-xl font-semibold text-ink">Ponderaciones PAU</h2>
        <div className="mt-4 overflow-hidden rounded-lg border border-ink/10">
          <table className="w-full border-collapse bg-white text-left text-sm">
            <thead className="bg-skyglass/70 text-ink">
              <tr>
                <th className="px-4 py-3">Asignatura</th>
                <th className="px-4 py-3">Ponderacion</th>
                <th className="px-4 py-3">Fuente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink/10">
              {degree.weights.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">{item.subject.name}</td>
                  <td className="px-4 py-3 font-semibold">{item.weight.toFixed(1)}</td>
                  <td className="px-4 py-3 text-ink/60">{item.source ?? "Sin dato"}</td>
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
