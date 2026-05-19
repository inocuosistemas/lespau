import { ProfileForm } from "@/components/profile-form";
import { getSubjects } from "@/lib/data";

export default async function ProfilePage() {
  const subjects = await getSubjects();

  return (
    <section className="mx-auto max-w-6xl px-5 py-10">
      <div className="mb-8 max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-coral">Formulario de perfil</p>
        <h1 className="mt-2 text-3xl font-bold text-ink">Cuanto mas concreto sea el perfil, mejor explica el ranking.</h1>
      </div>
      <ProfileForm subjects={subjects.map((subject) => ({ code: subject.code, name: subject.name }))} />
    </section>
  );
}
