import { prisma } from "@/lib/prisma";
import type { DegreeForRecommendation } from "@/lib/recommendation-engine";

const asStringArray = (value: unknown): string[] => {
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return asStringArray(parsed);
    } catch {
      return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
  }
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
};

export async function getDegreesForRecommendation(): Promise<DegreeForRecommendation[]> {
  const degrees = await prisma.degree.findMany({
    include: {
      university: true,
      campus: true,
      weights: {
        include: { subject: true },
        orderBy: [{ weight: "desc" }]
      }
    },
    orderBy: [{ name: "asc" }]
  });

  return degrees.map((degree) => ({
    id: degree.id,
    code: degree.code,
    name: degree.name,
    branch: degree.branch,
    ownership: degree.ownership === "private" ? "private" : "public",
    centerType: degree.centerType,
    cutoff: degree.cutoff,
    tags: asStringArray(degree.tags),
    interestTags: asStringArray(degree.interestTags),
    avoidTags: asStringArray(degree.avoidTags),
    mathIntensity: degree.mathIntensity,
    scienceIntensity: degree.scienceIntensity,
    peopleInteraction: degree.peopleInteraction,
    creativity: degree.creativity,
    employability: degree.employability,
    university: { name: degree.university.name, code: degree.university.code },
    campus: degree.campus ? { name: degree.campus.name, city: degree.campus.city } : null,
    weights: degree.weights.map((item) => ({
      weight: item.weight,
      subject: { code: item.subject.code, name: item.subject.name }
    }))
  }));
}

export async function getDegreeByCode(code: string) {
  return prisma.degree.findUnique({
    where: { code },
    include: {
      university: true,
      campus: true,
      weights: {
        include: { subject: true },
        orderBy: [{ weight: "desc" }]
      }
    }
  });
}

export async function getSubjects() {
  return prisma.subject.findMany({ orderBy: [{ category: "asc" }, { name: "asc" }] });
}
