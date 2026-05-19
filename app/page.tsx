import Link from "next/link";

const highlights = [
  {
    title: "Comença pel que et mou",
    text: "Explica què t'agrada, quines assignatures portes millor i quin tipus de vida universitària et ve de gust."
  },
  {
    title: "Menys embolic, millors opcions",
    text: "Agrupa carreres semblants perquè nois i noies pugueu comparar sense perdre-us en llistes infinites."
  },
  {
    title: "Sense decidir a cegues",
    text: "Cada recomanació explica què pinta bé, què cal revisar i com entra en joc la teva nota."
  }
];

export default function HomePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr]">
      <div className="py-8">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-coral">Per triar després de la PAU</p>
        <h1 className="max-w-3xl text-4xl font-bold leading-tight text-ink md:text-6xl">
          Troba carreres que encaixen amb la teva manera de ser.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-ink/70">
          Respon unes preguntes ràpides i compara opcions reals a Catalunya segons els teus gustos, les teves assignatures
          i la teva nota estimada. La idea no és decidir per tu, sinó ajudar-te a veure-ho més clar.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="rounded-md bg-ink px-5 py-3 text-sm font-semibold text-white hover:bg-ink/90" href="/profile">
            Començar
          </Link>
          <Link className="rounded-md border border-ink/15 bg-white/70 px-5 py-3 text-sm font-semibold text-ink hover:bg-white" href="/profile">
            Veure les meves opcions
          </Link>
        </div>
      </div>
      <div className="rounded-lg border border-ink/10 bg-white/85 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Com funciona</h2>
        <div className="mt-5 space-y-4">
          {highlights.map((item) => (
            <div key={item.title} className="border-l-4 border-moss bg-paper/70 px-4 py-3">
              <h3 className="text-sm font-semibold text-ink">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-ink/70">{item.text}</p>
            </div>
          ))}
        </div>
        <dl className="mt-6 grid gap-3 text-sm text-ink/70 sm:grid-cols-3">
          <div>
            <dt className="text-2xl font-bold text-ink">+700</dt>
            <dd>opcions revisades</dd>
          </div>
          <div>
            <dt className="text-2xl font-bold text-ink">PAU</dt>
            <dd>nota i assignatures</dd>
          </div>
          <div>
            <dt className="text-2xl font-bold text-ink">Clar</dt>
            <dd>motius sense embolics</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
