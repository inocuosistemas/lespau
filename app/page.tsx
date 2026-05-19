import Link from "next/link";

const principles = [
  "Pocas opciones buenas, no un catalogo infinito.",
  "Cada recomendacion explica intereses, PAU, nota y preferencias.",
  "Datos desacoplados: hoy seed/CSV, manana PDF oficial y buscadores."
];

export default function HomePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.05fr_0.95fr]">
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-coral">MVP orientador PAU 2026</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">
          Recomendador explicable de carreras universitarias en Catalunya.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
          Combina intereses, asignaturas PAU, ponderaciones, nota estimada, ubicacion y preferencias personales para
          proponer un ranking razonado de grados.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink/90" href="/profile">
            Crear perfil
          </Link>
          <Link className="rounded-md border border-ink/15 bg-white/70 px-5 py-3 text-sm font-semibold text-ink hover:bg-white" href="/admin/import">
            Ver importacion
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-ink/10 bg-white/80 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Arquitectura MVP</h2>
        <div className="mt-5 space-y-4">
          {principles.map((item) => (
            <div key={item} className="border-l-4 border-moss bg-paper/70 px-4 py-3 text-sm leading-6 text-ink/75">
              {item}
            </div>
          ))}
        </div>
        <dl className="mt-6 grid gap-3 text-sm text-ink/70 sm:grid-cols-2">
          <div>
            <dt className="font-semibold text-ink">Datos</dt>
            <dd>SQLite + Prisma + CSV</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Scoring</dt>
            <dd>Configurable en lib</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Vistas</dt>
            <dd>Perfil, ranking, detalle, admin</dd>
          </div>
          <div>
            <dt className="font-semibold text-ink">Futuro</dt>
            <dd>PDF oficial e IA conversacional</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
