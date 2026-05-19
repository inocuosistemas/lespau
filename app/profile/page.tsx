import { ProfileForm } from "@/components/profile-form";
import { getSubjects } from "@/lib/data";

export default async function ProfilePage() {
  const subjects = await getSubjects();

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">Explica-ho a la teva manera</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Tria què t'agrada, què se't dona bé i què prefereixes evitar.</h1>
        <p className="mt-3 text-sm leading-6 text-ink/65">
          No cal tenir-ho tot claríssim. Marca el que s'acosti a tu ara i canvia les respostes quan vulguis.
        </p>
      </div>
      <ProfileForm subjects={subjects.map((subject) => ({ code: subject.code, name: subject.name }))} />
    </section>
  );
}
