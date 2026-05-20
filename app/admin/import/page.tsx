import { prisma } from "@/lib/prisma";
import { ScoringWeightsForm } from "@/components/scoring-weights-form";

const sources = [
  {
    title: "Ponderacions PAU 2026",
    description: "Assignatures de modalitat que poden sumar 0,1 o 0,2 a cada grau.",
    url: "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/Ponderacions-2026_v6.pdf"
  },
  {
    title: "Notes de tall juny 2025",
    description: "Última nota de tall oficial completa disponible per orientar el realisme de la nota.",
    url: "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/notes-de-tall/Notes-tall-1a-assignacio_juny_2025_v3.pdf"
  },
  {
    title: "Preinscripció juny 2025",
    description: "Oferta de centres, població, tipus de centre, places orientatives i observacions.",
    url: "https://universitats.gencat.cat/web/.content/02_preinscripcio/enllac-documents/Preins-2025-Juny_v2.pdf"
  },
  {
    title: "Cercador oficial d'estudis universitaris",
    description: "Consulta oficial de graus i centres universitaris a Catalunya.",
    url: "https://universitats.gencat.cat/ca/estudis-universitaris/cercador-estudis-universitaris/"
  },
  {
    title: "QEDU",
    description: "Indicadors estatals d'inserció laboral i rendiment de titulacions universitàries.",
    url: "https://www.ciencia.gob.es/qedu"
  },
  {
    title: "EUC / AQU Catalunya",
    description: "Indicadors de qualitat i inserció laboral del sistema universitari català.",
    url: "https://estudis.aqu.cat/euc/ca/Comu/QueEsEuc"
  },
  {
    title: "Idescat / AQU",
    description: "Estadística d'inserció laboral de graduats universitaris.",
    url: "https://www.idescat.cat/estad/ilgu"
  }
];

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
      <p className="text-sm font-semibold uppercase tracking-wide text-coral">Sobre aquesta guia</p>
      <h1 className="mt-2 text-3xl font-bold text-ink">D'on surten les opcions</h1>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/65">
        Aquí pots veure quines dades es tenen en compte i ajustar què pesa més en ordenar les carreres, sense canviar
        les teves respostes personals.
      </p>

      <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <Metric label="Carreres" value={degrees} />
        <Metric label="Públiques" value={publicDegrees} />
        <Metric label="Privades" value={privateDegrees} />
        <Metric label="Assignatures que sumen" value={weights} />
        <Metric label="Assignatures" value={subjects} />
        <Metric label="Universitats" value={universities} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2">
        <article className="rounded-lg border border-ink/10 bg-white/85 p-5">
          <h2 className="text-lg font-semibold text-ink">Fonts oficials</h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            Les recomanacions combinen carreres disponibles, places, notes de tall i assignatures que poden pujar la
            nota. Serveixen per orientar-te; abans de decidir, convé contrastar-ho amb la informació oficial.
          </p>
          <div className="mt-4 grid gap-3">
            {sources.map((source) => (
              <a
                key={source.url}
                className="rounded-md bg-paper/80 p-3 text-sm transition-colors hover:bg-skyglass/70"
                href={source.url}
                target="_blank"
                rel="noreferrer"
              >
                <span className="font-semibold text-ink">{source.title}</span>
                <span className="mt-1 block leading-5 text-ink/65">{source.description}</span>
                <span className="mt-2 block text-xs font-semibold text-coral">Obrir font oficial</span>
              </a>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-ink/10 bg-white/85 p-5">
          <ScoringWeightsForm />
        </article>
      </div>

      <article className="mt-5 rounded-lg border border-ink/10 bg-white/85 p-5">
        <h2 className="text-lg font-semibold text-ink">Com llegir els teus resultats</h2>
        <p className="mt-3 text-sm leading-6 text-ink/70">
          El percentatge no decideix per tu: només ordena possibilitats. Mira també els motius, els avisos i els llocs
          on podries estudiar cada carrera.
        </p>
      </article>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-ink/10 bg-white/85 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-ink/50">{label}</p>
      <p className="mt-2 text-2xl font-bold text-ink">{value.toLocaleString("ca-ES")}</p>
    </div>
  );
}
