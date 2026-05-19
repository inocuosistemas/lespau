-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Degree" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'grado',
    "modality" TEXT,
    "ownership" TEXT NOT NULL DEFAULT 'public',
    "centerType" TEXT,
    "seats" INTEGER,
    "cutoff" REAL,
    "officialUrl" TEXT,
    "universityId" TEXT NOT NULL,
    "campusId" TEXT,
    "tags" TEXT NOT NULL,
    "interestTags" TEXT NOT NULL,
    "avoidTags" TEXT NOT NULL,
    "mathIntensity" INTEGER NOT NULL DEFAULT 2,
    "scienceIntensity" INTEGER NOT NULL DEFAULT 2,
    "peopleInteraction" INTEGER NOT NULL DEFAULT 2,
    "creativity" INTEGER NOT NULL DEFAULT 2,
    "employability" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Degree_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Degree_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Degree" ("avoidTags", "branch", "campusId", "code", "createdAt", "creativity", "cutoff", "employability", "id", "interestTags", "mathIntensity", "modality", "name", "officialUrl", "peopleInteraction", "scienceIntensity", "seats", "tags", "type", "universityId", "updatedAt") SELECT "avoidTags", "branch", "campusId", "code", "createdAt", "creativity", "cutoff", "employability", "id", "interestTags", "mathIntensity", "modality", "name", "officialUrl", "peopleInteraction", "scienceIntensity", "seats", "tags", "type", "universityId", "updatedAt" FROM "Degree";
DROP TABLE "Degree";
ALTER TABLE "new_Degree" RENAME TO "Degree";
CREATE UNIQUE INDEX "Degree_code_key" ON "Degree"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
