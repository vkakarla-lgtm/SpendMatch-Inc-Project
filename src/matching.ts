import { Scholarship, Student } from "@prisma/client";

function asStringArray(v: any): string[] {
  return Array.isArray(v) ? v.map(String) : [];
}

function studentEthnicity(student: Student): string[] {
  return asStringArray(student.ethnicity);
}

export function matchScholarship(student: Student, sch: Scholarship) {
  const reasons: string[] = [];

  // GPA
  if (student.gpa < sch.gpaMinimum) return { ok: false, reasons: [] };
  reasons.push(`GPA requirement met (${student.gpa} >= ${sch.gpaMinimum})`);

  // Enrollment status (if specified)
  const allowedEnroll = asStringArray(sch.enrollmentStatus);
  if (allowedEnroll.length > 0 && !allowedEnroll.includes(student.enrollmentStatus)) {
    return { ok: false, reasons: [] };
  }
  if (allowedEnroll.length > 0) reasons.push(`Enrollment status eligible (${student.enrollmentStatus})`);

  // Citizenship (if specified)
  const allowedCit = asStringArray(sch.citizenship);
  if (allowedCit.length > 0) {
    const c = student.citizenshipStatus ?? "";
    if (!allowedCit.includes(c)) return { ok: false, reasons: [] };
    reasons.push(`Citizenship eligible (${c})`);
  }

  // Major/field of study
  const fields = asStringArray(sch.fieldsOfStudy);
  if (fields.length > 0 && !fields.includes(student.major)) return { ok: false, reasons: [] };
  if (fields.length > 0) reasons.push(`Major eligible (${student.major})`);

  // First-gen requirement (only if true)
  if (sch.requiresFirstGeneration === true) {
    if (student.firstGeneration !== true) return { ok: false, reasons: [] };
    reasons.push("First-generation requirement met");
  }

  // Financial need requirement (only if true)
  if (sch.requiresFinancialNeed === true) {
    if (student.financialNeed !== true) return { ok: false, reasons: [] };
    reasons.push("Financial need requirement met");
  }

  // Gender requirement
  if (sch.requiredGender) {
    if ((student.gender ?? "") !== sch.requiredGender) return { ok: false, reasons: [] };
    reasons.push(`Gender requirement met (${sch.requiredGender})`);
  }

  // Ethnicity requirement (any match)
  const reqEth = asStringArray(sch.requiredEthnicity);
  if (reqEth.length > 0) {
    const sEth = studentEthnicity(student);
    const ok = reqEth.some((e) => sEth.includes(e));
    if (!ok) return { ok: false, reasons: [] };
    reasons.push(`Ethnicity requirement met (${reqEth.join(", ")})`);
  }

  // Community service hours
  if (typeof sch.minCommunityServiceHours === "number" && sch.minCommunityServiceHours > 0) {
    const hours = student.communityServiceHours ?? 0;
    if (hours < sch.minCommunityServiceHours) return { ok: false, reasons: [] };
    reasons.push(`Community service requirement met (${hours} >= ${sch.minCommunityServiceHours})`);
  }

  // Military affiliation (any)
  const allowedMil = asStringArray(sch.allowedMilitaryAffiliation);
  if (allowedMil.length > 0) {
    const mil = student.militaryAffiliation ?? "";
    if (!allowedMil.includes(mil)) return { ok: false, reasons: [] };
    reasons.push(`Military affiliation eligible (${mil})`);
  }

  // Residency
  if (sch.requiredResidency) {
    if ((student.residency ?? "") !== sch.requiredResidency) return { ok: false, reasons: [] };
    reasons.push(`Residency requirement met (${sch.requiredResidency})`);
  }

  return { ok: true, reasons };
}
