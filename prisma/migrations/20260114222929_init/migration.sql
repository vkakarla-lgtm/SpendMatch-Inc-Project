-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gpa" REAL NOT NULL,
    "enrollmentStatus" TEXT NOT NULL,
    "major" TEXT NOT NULL,
    "graduationYear" INTEGER,
    "gender" TEXT,
    "ethnicity" JSONB,
    "citizenshipStatus" TEXT,
    "householdIncome" INTEGER,
    "financialNeed" BOOLEAN NOT NULL DEFAULT false,
    "firstGeneration" BOOLEAN NOT NULL DEFAULT false,
    "militaryAffiliation" TEXT,
    "residency" TEXT,
    "communityServiceHours" INTEGER,
    "state" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Scholarship" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "amountType" TEXT NOT NULL,
    "deadline" DATETIME NOT NULL,
    "description" TEXT,
    "applicationRequirements" JSONB,
    "renewable" BOOLEAN NOT NULL DEFAULT false,
    "renewableConditions" TEXT,
    "url" TEXT,
    "tags" JSONB,
    "fieldsOfStudy" JSONB,
    "gpaMinimum" REAL NOT NULL,
    "citizenship" JSONB,
    "enrollmentStatus" JSONB,
    "requiresFirstGeneration" BOOLEAN,
    "requiresFinancialNeed" BOOLEAN,
    "requiredGender" TEXT,
    "requiredEthnicity" JSONB,
    "minCommunityServiceHours" INTEGER,
    "allowedMilitaryAffiliation" JSONB,
    "requiredResidency" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");
