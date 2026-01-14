import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

function readJson(relPath: string) {
  const p = path.join(process.cwd(), relPath);
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

async function main() {
  const studentsData = readJson("students-sample.json").students;
  const scholarshipsData = readJson("scholarships.json").scholarships;

  // Clear existing
  await prisma.student.deleteMany();
  await prisma.scholarship.deleteMany();

  // Insert students
  for (const s of studentsData) {
    await prisma.student.create({
      data: {
        id: s.id,
        email: s.email,
        name: s.name,
        gpa: s.gpa,
        enrollmentStatus: s.enrollment_status,
        major: s.major,
        graduationYear: s.graduation_year,
        gender: s.gender ?? null,
        ethnicity: s.ethnicity ?? null,
        citizenshipStatus: s.citizenship_status ?? null,
        householdIncome: s.household_income ?? null,
        financialNeed: Boolean(s.financial_need),
        firstGeneration: Boolean(s.first_generation),
        militaryAffiliation: s.military_affiliation ?? null,
        residency: s.residency ?? null,
        communityServiceHours: s.community_service_hours ?? null,
        state: s.state ?? null
      }
    });
  }

  // Insert scholarships
  for (const sch of scholarshipsData) {
    await prisma.scholarship.create({
      data: {
        id: sch.id,
        name: sch.name,
        provider: sch.provider,
        amount: sch.amount,
        amountType: sch.amount_type,
        deadline: new Date(sch.deadline),
        description: sch.description ?? null,
        applicationRequirements: sch.application_requirements ?? null,
        renewable: Boolean(sch.renewable),
        renewableConditions: sch.renewable_conditions ?? null,
        url: sch.url ?? null,
        tags: sch.tags ?? null,
        fieldsOfStudy: sch.fields_of_study ?? null,

        gpaMinimum: sch.eligibility.gpa_minimum,
        citizenship: sch.eligibility.citizenship ?? null,
        enrollmentStatus: sch.eligibility.enrollment_status ?? null,

        requiresFirstGeneration: sch.eligibility.first_generation ?? null,
        requiresFinancialNeed: sch.eligibility.financial_need ?? null,
        requiredGender: sch.eligibility.gender ?? null,
        requiredEthnicity: sch.eligibility.ethnicity ?? null,
        minCommunityServiceHours: sch.eligibility.community_service_hours ?? null,
        allowedMilitaryAffiliation: sch.eligibility.military_affiliation ?? null,
        requiredResidency: sch.eligibility.residency ?? null
      }
    });
  }

  console.log("✅ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
