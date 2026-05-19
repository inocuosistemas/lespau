import { prisma } from "@/lib/prisma";
import { ScoringWeightsForm } from "@/components/scoring-weights-form";

const sources = [
  "Assignatures que poden sumar a la PAU 2026",
  "Notes de tall de l'assignació de juny de 2025",
  "Carreres i places disponibles a Catalunya"
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
          <h2 className="text-lg font-semibold text-ink">Dades que fem servir</h2>
          <p className="mt-3 text-sm leading-6 text-ink/70">
            Les recomanacions combinen carreres disponibles, places, notes de tall i assignatures que poden pujar la
            nota. Serveixen per orientar-te; abans de decidir, convé contrastar-ho amb la informació oficial.
          </p>
          <div className="mt-4 grid gap-3">
            {sources.map((source) => (
              <div key={source} className="rounded-md bg-paper/80 p-3 text-sm font-medium text-ink">
                {source}
              </div>
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
