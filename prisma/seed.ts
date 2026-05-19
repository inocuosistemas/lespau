import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const subjects = [
  ["MATHII", "Matematiques II", "cientifica"],
  ["MATHSS", "Matematiques aplicades a les Ciencies Socials", "social"],
  ["BIO", "Biologia", "cientifica"],
  ["QUI", "Quimica", "cientifica"],
  ["FIS", "Fisica", "cientifica"],
  ["TEC", "Tecnologia i Enginyeria", "tecnologia"],
  ["ECON", "Empresa i Disseny de Models de Negoci", "empresa"],
  ["HISTART", "Historia de l'Art", "humanistica"],
  ["DISS", "Disseny", "artistica"],
  ["LITCAT", "Literatura Catalana", "humanistica"]
] as const;

const universities = [
  { code: "UB", name: "Universitat de Barcelona", url: "https://www.ub.edu" },
  { code: "UAB", name: "Universitat Autonoma de Barcelona", url: "https://www.uab.cat" },
  { code: "UPC", name: "Universitat Politecnica de Catalunya", url: "https://www.upc.edu" },
  { code: "UPF", name: "Universitat Pompeu Fabra", url: "https://www.upf.edu" },
  { code: "UdG", name: "Universitat de Girona", url: "https://www.udg.edu" },
  { code: "UVic", name: "Universitat de Vic - Universitat Central de Catalunya", url: "https://www.uvic.cat" }
];

const campuses = [
  { university: "UB", name: "Campus Bellvitge", city: "L'Hospitalet de Llobregat" },
  { university: "UB", name: "Campus Diagonal", city: "Barcelona" },
  { university: "UAB", name: "Campus Bellaterra", city: "Cerdanyola del Valles" },
  { university: "UPC", name: "Campus Nord", city: "Barcelona" },
  { university: "UPF", name: "Campus Ciutadella", city: "Barcelona" },
  { university: "UPF", name: "Campus Poblenou", city: "Barcelona" },
  { university: "UdG", name: "Campus Montilivi", city: "Girona" },
  { university: "UVic", name: "Campus Vic", city: "Vic" }
];

const degrees = [
  {
    code: "UB-MED",
    name: "Medicina",
    university: "UB",
    campus: "Campus Bellvitge",
    branch: "Ciencias de la salud",
    seats: 259,
    cutoff: 12.82,
    tags: ["salud", "trato humano", "alta demanda", "mucha ciencia"],
    interestTags: ["salud", "ciencias", "trato humano"],
    avoidTags: ["poca ciencia", "sin trato humano"],
    mathIntensity: 3,
    scienceIntensity: 5,
    peopleInteraction: 5,
    creativity: 2,
    employability: 5,
    weights: { BIO: 0.2, QUI: 0.2, MATHII: 0.2, FIS: 0.1 }
  },
  {
    code: "UAB-PSI",
    name: "Psicologia",
    university: "UAB",
    campus: "Campus Bellaterra",
    branch: "Ciencias de la salud",
    seats: 360,
    cutoff: 9.92,
    tags: ["salud", "ciencias sociales", "trato humano"],
    interestTags: ["salud", "ciencias sociales", "trato humano", "educacion"],
    avoidTags: ["mucha matematica"],
    mathIntensity: 2,
    scienceIntensity: 2,
    peopleInteraction: 5,
    creativity: 3,
    employability: 3,
    weights: { BIO: 0.2, MATHSS: 0.2, MATHII: 0.1 }
  },
  {
    code: "UPC-INF",
    name: "Enginyeria Informatica",
    university: "UPC",
    campus: "Campus Nord",
    branch: "Ingenieria y arquitectura",
    seats: 400,
    cutoff: 10.61,
    tags: ["tecnologia", "mucha matematica", "alta demanda"],
    interestTags: ["tecnologia", "empresa", "ciencias"],
    avoidTags: ["sin ordenadores", "poca matematica"],
    mathIntensity: 5,
    scienceIntensity: 3,
    peopleInteraction: 2,
    creativity: 3,
    employability: 5,
    weights: { MATHII: 0.2, FIS: 0.2, TEC: 0.2 }
  },
  {
    code: "UPF-ADE",
    name: "Administracio i Direccio d'Empreses",
    university: "UPF",
    campus: "Campus Ciutadella",
    branch: "Ciencias sociales y juridicas",
    seats: 220,
    cutoff: 10.24,
    tags: ["empresa", "analitica", "alta demanda"],
    interestTags: ["empresa", "ciencias sociales", "comunicacion"],
    avoidTags: ["sin numeros"],
    mathIntensity: 4,
    scienceIntensity: 1,
    peopleInteraction: 3,
    creativity: 2,
    employability: 5,
    weights: { MATHSS: 0.2, ECON: 0.2, MATHII: 0.2 }
  },
  {
    code: "UB-BBAA",
    name: "Belles Arts",
    university: "UB",
    campus: "Campus Diagonal",
    branch: "Artes y humanidades",
    seats: 180,
    cutoff: 8.12,
    tags: ["arte", "creativa", "proyectos"],
    interestTags: ["arte", "creatividad", "comunicacion"],
    avoidTags: ["mucha matematica", "mucha ciencia"],
    mathIntensity: 1,
    scienceIntensity: 1,
    peopleInteraction: 3,
    creativity: 5,
    employability: 2,
    weights: { DISS: 0.2, HISTART: 0.2, LITCAT: 0.1 }
  },
  {
    code: "UVIC-EDU",
    name: "Educacio Primaria",
    university: "UVic",
    campus: "Campus Vic",
    branch: "Ciencias sociales y juridicas",
    seats: 140,
    cutoff: 7.38,
    tags: ["educacion", "trato humano", "creativa"],
    interestTags: ["educacion", "trato humano", "ciencias sociales", "creatividad"],
    avoidTags: ["sin trato humano"],
    mathIntensity: 2,
    scienceIntensity: 1,
    peopleInteraction: 5,
    creativity: 4,
    employability: 3,
    weights: { MATHSS: 0.2, LITCAT: 0.2, HISTART: 0.1 }
  },
  {
    code: "UdG-CAFE",
    name: "Ciencies de l'Activitat Fisica i de l'Esport",
    university: "UdG",
    campus: "Campus Montilivi",
    branch: "Ciencias de la salud",
    seats: 110,
    cutoff: 9.41,
    tags: ["deporte", "salud", "trato humano"],
    interestTags: ["deporte", "salud", "educacion", "trato humano"],
    avoidTags: ["poco movimiento"],
    mathIntensity: 2,
    scienceIntensity: 3,
    peopleInteraction: 4,
    creativity: 3,
    employability: 3,
    weights: { BIO: 0.2, MATHSS: 0.1, MATHII: 0.1 }
  },
  {
    code: "UPF-COM",
    name: "Comunicacio Audiovisual",
    university: "UPF",
    campus: "Campus Poblenou",
    branch: "Ciencias sociales y juridicas",
    seats: 80,
    cutoff: 11.02,
    tags: ["comunicacion", "creativa", "proyectos"],
    interestTags: ["comunicacion", "creatividad", "arte", "tecnologia"],
    avoidTags: ["sin proyectos"],
    mathIntensity: 1,
    scienceIntensity: 1,
    peopleInteraction: 4,
    creativity: 5,
    employability: 3,
    weights: { DISS: 0.2, HISTART: 0.2, LITCAT: 0.2 }
  }
];

async function main() {
  await prisma.recommendationResult.deleteMany();
  await prisma.userProfile.deleteMany();
  await prisma.degreeSubjectWeight.deleteMany();
  await prisma.degree.deleteMany();
  await prisma.campus.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.university.deleteMany();

  for (const [code, name, category] of subjects) {
    await prisma.subject.create({ data: { code, name, category } });
  }

  for (const university of universities) {
    await prisma.university.create({ data: university });
  }

  for (const campus of campuses) {
    const university = await prisma.university.findUniqueOrThrow({ where: { code: campus.university } });
    await prisma.campus.create({
      data: { name: campus.name, city: campus.city, universityId: university.id }
    });
  }

  for (const item of degrees) {
    const university = await prisma.university.findUniqueOrThrow({ where: { code: item.university } });
    const campus = await prisma.campus.findFirst({
      where: { universityId: university.id, name: item.campus }
    });
    const degree = await prisma.degree.create({
      data: {
        code: item.code,
        name: item.name,
        branch: item.branch,
        type: "grado",
        modality: "presencial",
        seats: item.seats,
        cutoff: item.cutoff,
        officialUrl: university.url ?? undefined,
        universityId: university.id,
        campusId: campus?.id,
        tags: JSON.stringify(item.tags),
        interestTags: JSON.stringify(item.interestTags),
        avoidTags: JSON.stringify(item.avoidTags),
        mathIntensity: item.mathIntensity,
        scienceIntensity: item.scienceIntensity,
        peopleInteraction: item.peopleInteraction,
        creativity: item.creativity,
        employability: item.employability
      }
    });

    for (const [subjectCode, weight] of Object.entries(item.weights)) {
      const subject = await prisma.subject.findUniqueOrThrow({ where: { code: subjectCode } });
      await prisma.degreeSubjectWeight.create({
        data: {
          degreeId: degree.id,
          subjectId: subject.id,
          weight,
          source: "seed"
        }
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
