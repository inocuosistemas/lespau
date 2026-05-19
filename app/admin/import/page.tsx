import { statSync } from "node:fs";
import { defaultRecommendationWeights } from "@/lib/recommendation-engine";
import { prisma } from "@/lib/prisma";
import { ScoringWeightsForm } from "@/components/scoring-weights-form";

const csvHeaders = ["degree_code", "degree_name", "university_code", "subject_code", "subject_name", "weight"];
const officialFiles = [
  {
    label: "Ponderaciones PAU 2026 v6",
    path: "data/official/Ponderacions-2026_v6.pdf",
    url: "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/Ponderacions-2026_v6.pdf"
  },
  {
    label: "Notas de corte 1a asignacion junio 2025",
    path: "data/official/Notes-tall-1a-assignacio_juny_2025_v3.pdf",
    url: "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/notes-de-tall/Notes-tall-1a-assignacio_juny_2025_v3.pdf"
  },
  {
    label: "Preinscripcion universitaria junio 2025",
    path: "data/official/Preins-2025-Juny_v2.pdf",
    url: "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/Preins-2025-Juny_v2.pdf"
  },
  {
    label: "JSON normalizado generado",
    path: "data/official/official-degrees.json",
    url: null
  }
];

function fileInfo(path: string) {
  try {
    const stat = statSync(path);
    return `${(stat.size / 1024 / 1024).toFixed(1)} MB · ${stat.mtime.toLocaleString("es-ES")}`;
  } catch {
    return "No encontrado";
  }
}

export default async function ImportPage() {
  const [degrees, publicDegrees, privateDegrees, weights, subjects, universities] = await Promise.all([
    prisma.degree.count(),
    prisma.degree.count({ where: { ownership: "public" } }),
    prisma.degree.count({ where: { ownership: "private" } }),
    prisma.degreeSubjectWeight.count(),
    prisma.subject.count(),
    prisma.university.count()
  ]);

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-coral">Admin / importacion</p>
      <h1 className="mt-2 text-3xl font-bold text-ink">Datos oficiales y configuracion del recomendador</h1>

      <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Grados" value={degrees} />
        <Metric label="Publicos" value={publicDegrees} />
        <Metric label="Privados" value={privateDegrees} />
        <Metric label="Ponderaciones" value={weights} />
        <Metric label="Asignaturas" value={subjects} />
        <Metric label="Universidades" value={universities} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="rounded-lg border border-ink/10 bg-white/85 p-5">
          <h2 className="text-lg font-semibold text-ink">Recarga oficial</h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            El flujo actual extrae tablas de PDFs oficiales, genera JSON normalizado y actualiza SQLite con grados,
            ponderaciones, plazas, notas de corte y titularidad publica/privada.
          </p>
          <div className="mt-4 space-y-2 rounded-md bg-ink p-4 font-mono text-xs text-white">
            <p>npm run extract:official</p>
            <p>npm run import:official</p>
          </div>
          <div className="mt-4 grid gap-3">
            {officialFiles.map((file) => (
              <div key={file.path} className="rounded-md bg-paper/80 p-3 text-sm">
                <p className="font-semibold text-ink">{file.label}</p>
                <p className="mt-1 text-xs text-ink/60">{file.path}</p>
                <p className="mt-1 text-xs text-ink/60">{fileInfo(file.path)}</p>
                {file.url ? (
                  <a className="mt-2 inline-block text-xs font-semibold text-coral hover:underline" href={file.url}>
                    Fuente oficial
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-ink/10 bg-white/85 p-5">
          <ScoringWeightsForm />
        </article>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <article className="rounded-lg border border-ink/10 bg-white/85 p-5">
          <h2 className="text-lg font-semibold text-ink">CSV manual de ponderaciones</h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            Sigue disponible para parches o pruebas puntuales. Lee filas normalizadas y hace upsert de asignaturas y
            ponderaciones.
          </p>
          <div className="mt-4 rounded-md bg-ink p-4 font-mono text-xs text-white">npm run import:weights -- data/sample-ponderacions.csv</div>
          <div className="mt-4 flex flex-wrap gap-2">
            {csvHeaders.map((header) => (
              <span key={header} className="rounded-md bg-paper px-2.5 py-1 text-xs font-semibold text-ink/75">
                {header}
              </span>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-ink/10 bg-white/85 p-5">
          <h2 className="text-lg font-semibold text-ink">Pesos por defecto</h2>
          <dl className="mt-4 grid gap-3">
            {Object.entries(defaultRecommendationWeights).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between rounded-md bg-paper/80 px-3 py-2 text-sm">
                <dt className="font-medium text-ink">{key}</dt>
                <dd className="font-bold text-coral">{value}</dd>
              </div>
            ))}
          </dl>
        </article>
      </div>

      <article className="mt-5 rounded-lg border border-ink/10 bg-white/85 p-5">
        <h2 className="text-lg font-semibold text-ink">Notas de uso</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          Los pesos configurados se aplican cuando vuelves al formulario y generas recomendaciones. Si compartes una URL
          de resultados, los pesos viajan en la query para que el ranking sea reproducible.
        </p>
      </article>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/85 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value.toLocaleString("es-ES")}</p>
    </div>
  );
}
