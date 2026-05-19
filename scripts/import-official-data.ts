import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type OfficialSubject = {
  code: string;
  name: string;
};

type OfficialDegree = {
  code: string;
  name: string;
  universityCode: string;
  branchCode: string;
  branch: string;
  city: string;
  seats: number | null;
  cutoff: number | null;
  type: string;
  modality: string;
  ownership: string;
  centerType: string;
  weights: Array<{ subjectCode: string; subjectName: string; weight: number }>;
};

type OfficialPayload = {
  subjects: OfficialSubject[];
  degrees: OfficialDegree[];
};

const universityNames: Record<string, string> = {
  UB: "Universitat de Barcelona",
  UAB: "Universitat Autonoma de Barcelona",
  UPC: "Universitat Politecnica de Catalunya",
  UPF: "Universitat Pompeu Fabra",
  UdL: "Universitat de Lleida",
  UdG: "Universitat de Girona",
  URV: "Universitat Rovira i Virgili",
  "UVic-UCC": "Universitat de Vic - Universitat Central de Catalunya",
  UOC: "Universitat Oberta de Catalunya",
  URL: "Universitat Ramon Llull",
  UIC: "Universitat Internacional de Catalunya",
  UAO: "Universitat Abat Oliba CEU"
};

function tagsForDegree(degree: OfficialDegree) {
  const text = `${degree.name} ${degree.branch}`.toLowerCase();
  const tags = new Set<string>();
  const interests = new Set<string>();
  const avoid = new Set<string>();

  const add = (tag: string) => {
    tags.add(tag);
    interests.add(tag);
  };

  if (text.match(/medicina|infermer|farm|fisioter|odont|psicolog|nutric|biomed|veterin|salut|activitat física|esport/)) add("salud");
  if (text.match(/enginy|inform[aà]tica|dades|tecnolog|telecom|industrial|intel·ligència|videojocs/)) add("tecnologia");
  if (text.match(/empresa|direcci[oó]|m[aà]rqueting|economia|finances|comptabilitat|turisme/)) add("empresa");
  if (text.match(/educaci[oó]|mestre|pedagog/)) add("educacion");
  if (text.match(/art|disseny|belles arts|m[uú]sica|audiovisual|cinema/)) add("arte");
  if (text.match(/comunicaci[oó]|periodisme|publicitat|traducci[oó]|lleng/)) add("comunicacion");
  if (text.match(/dret|sociolog|pol[ií]tiques|relacions|treball social|socials/)) add("ciencias sociales");
  if (text.match(/qu[ií]mica|biologia|f[ií]sica|matem[aà]tiques|ci[eè]ncies/)) add("ciencias");
  if (text.match(/arquitectura|urbanisme/)) add("creatividad");
  if (text.match(/simultane|doble|\/|agrupaci[oó]/)) tags.add("doble grado");
  if (degree.cutoff && degree.cutoff >= 11) tags.add("alta demanda");
  if (degree.modality !== "presencial") tags.add(degree.modality);

  const mathy = text.match(/matem[aà]tiques|enginy|inform[aà]tica|f[ií]sica|dades|economia|empresa|arquitectura/);
  const science = text.match(/medicina|biologia|qu[ií]mica|f[ií]sica|infermer|farm|biomed|veterin|ci[eè]ncies/);
  if (mathy) {
    tags.add("mucha matematica");
    avoid.add("mucha matematica");
  }
  if (science) {
    tags.add("mucha ciencia");
    avoid.add("mucha ciencia");
  }
  if (text.match(/medicina|infermer|educaci[oó]|psicolog|treball social|fisioter|comunicaci[oó]/)) {
    tags.add("trato humano");
    interests.add("trato humano");
  } else {
    avoid.add("sin trato humano");
  }

  return {
    tags: Array.from(tags).slice(0, 8),
    interestTags: Array.from(interests).slice(0, 8),
    avoidTags: Array.from(avoid).slice(0, 5)
  };
}

function intensityFor(degree: OfficialDegree) {
  const text = `${degree.name} ${degree.branch}`.toLowerCase();
  const has = (pattern: RegExp) => pattern.test(text);
  return {
    mathIntensity: has(/matem[aà]tiques|enginy|inform[aà]tica|dades|f[ií]sica|arquitectura/) ? 5 : has(/empresa|economia|finances/) ? 4 : 2,
    scienceIntensity: has(/medicina|biologia|qu[ií]mica|f[ií]sica|biomed|veterin|farm/) ? 5 : has(/salut|infermer|fisioter/) ? 4 : 1,
    peopleInteraction: has(/medicina|infermer|educaci[oó]|psicolog|treball social|comunicaci[oó]|turisme/) ? 5 : 3,
    creativity: has(/art|disseny|arquitectura|audiovisual|m[uú]sica|comunicaci[oó]|videojocs/) ? 5 : 2,
    employability: has(/medicina|infermer|enginy|inform[aà]tica|empresa|dades|educaci[oó]/) ? 5 : 3
  };
}

async function main() {
  const file = resolve(process.argv[2] ?? "data/official/official-degrees.json");
  const payload = JSON.parse(readFileSync(file, "utf-8")) as OfficialPayload;

  await prisma.recommendationResult.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.degreeSubjectWeight.deleteMany();
  await prisma.degree.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.university.deleteMany();

  for (const subject of payload.subjects) {
    await prisma.subject.create({
      data: {
        code: subject.code,
        name: subject.name,
        category: "PAU 2026"
      }
    });
  }

  for (const degree of payload.degrees.filter((item) => item.name && item.universityCode)) {
    const university = await prisma.university.upsert({
      where: { code: degree.universityCode },
      update: { name: universityNames[degree.universityCode] ?? degree.universityCode },
      create: {
        code: degree.universityCode,
        name: universityNames[degree.universityCode] ?? degree.universityCode
      }
    });

    const campus = degree.city
      ? await prisma.campus.upsert({
          where: {
            universityId_name_city: {
              universityId: university.id,
              name: degree.city,
              city: degree.city
            }
          },
          update: {},
          create: {
            name: degree.city,
            city: degree.city,
            universityId: university.id
          }
        })
      : null;

    const tags = tagsForDegree(degree);
    const intensity = intensityFor(degree);
    const created = await prisma.degree.create({
      data: {
        code: degree.code,
        name: degree.name,
        branch: degree.branch || "Sin rama",
        type: degree.type,
        modality: degree.modality,
        ownership: degree.ownership === "private" ? "private" : "public",
        centerType: degree.centerType || null,
        seats: degree.seats,
        cutoff: degree.cutoff,
        officialUrl: `https://universitats.gencat.cat/ca/estudis-universitaris/cercador-estudis-universitaris/`,
        universityId: university.id,
        campusId: campus?.id,
        tags: JSON.stringify(tags.tags),
        interestTags: JSON.stringify(tags.interestTags),
        avoidTags: JSON.stringify(tags.avoidTags),
        ...intensity
      }
    });

    for (const weight of degree.weights) {
      const subject = await prisma.subject.findUnique({ where: { code: weight.subjectCode } });
      if (!subject) continue;
      await prisma.degreeSubjectWeight.create({
        data: {
          degreeId: created.id,
          subjectId: subject.id,
          weight: weight.weight,
          source: "Ponderacions PAU 2026 v6"
        }
      });
    }
  }

  const degreeCount = await prisma.degree.count();
  const weightCount = await prisma.degreeSubjectWeight.count();
  console.log(`Imported ${degreeCount} degrees and ${weightCount} PAU weights from ${file}`);
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
