-- CreateTable
CREATE TABLE "University" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    CONSTRAINT "Campus_universityId_fkey" FOREIGN KEY ("universityId") REFERENCES "University" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Subject" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT
);

-- CreateTable
CREATE TABLE "Degree" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'grado',
    "modality" TEXT,
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

-- CreateTable
CREATE TABLE "DegreeSubjectWeight" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "degreeId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "weight" REAL NOT NULL,
    "source" TEXT,
    CONSTRAINT "DegreeSubjectWeight_degreeId_fkey" FOREIGN KEY ("degreeId") REFERENCES "Degree" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DegreeSubjectWeight_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "Subject" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT,
    "studiedSubjects" TEXT NOT NULL,
    "strongSubjects" TEXT NOT NULL,
    "estimatedAdmission" REAL,
    "interests" TEXT NOT NULL,
    "dislikes" TEXT NOT NULL,
    "preferredCity" TEXT,
    "mathTolerance" INTEGER NOT NULL DEFAULT 3,
    "scienceTolerance" INTEGER NOT NULL DEFAULT 3,
    "peoplePreference" INTEGER NOT NULL DEFAULT 3,
    "creativityPreference" INTEGER NOT NULL DEFAULT 3,
    "employabilityImportance" INTEGER NOT NULL DEFAULT 3,
    "distanceImportance" INTEGER NOT NULL DEFAULT 3,
    "perceivedDifficultyTolerance" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "RecommendationResult" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "degreeId" TEXT NOT NULL,
    "score" REAL NOT NULL,
    "breakdown" TEXT NOT NULL,
    "reasons" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecommendationResult_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "UserProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "University_code_key" ON "University"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_universityId_name_city_key" ON "Campus"("universityId", "name", "city");

-- CreateIndex
CREATE UNIQUE INDEX "Subject_code_key" ON "Subject"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Degree_code_key" ON "Degree"("code");

-- CreateIndex
CREATE INDEX "DegreeSubjectWeight_subjectId_idx" ON "DegreeSubjectWeight"("subjectId");

-- CreateIndex
CREATE UNIQUE INDEX "DegreeSubjectWeight_degreeId_subjectId_key" ON "DegreeSubjectWeight"("degreeId", "subjectId");

-- CreateIndex
CREATE INDEX "RecommendationResult_profileId_idx" ON "RecommendationResult"("profileId");

-- CreateIndex
CREATE INDEX "RecommendationResult_degreeId_idx" ON "RecommendationResult"("degreeId");

