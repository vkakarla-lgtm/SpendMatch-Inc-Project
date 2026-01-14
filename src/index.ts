import express from "express";
import dotenv from "dotenv";
import { prisma } from "./prisma";
import { matchScholarship } from "./matching";
import { makeGroqClient, generateExplanation } from "./groq";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

// 1) POST /api/students
app.post("/api/students", async (req, res) => {
  const body = req.body;
  const created = await prisma.student.create({
    data: {
      email: body.email,
      name: body.name,
      gpa: body.gpa,
      enrollmentStatus: body.enrollment_status,
      major: body.major,
      householdIncome: body.household_income ?? null,
      firstGeneration: Boolean(body.first_generation),
      financialNeed: Boolean(body.financial_need),
      state: body.state ?? null
    }
  });
  res.json({ id: created.id, name: created.name, email: created.email, created_at: created.createdAt });
});

// 2) GET /api/scholarships
app.get("/api/scholarships", async (_req, res) => {
  const scholarships = await prisma.scholarship.findMany();
  res.json({ scholarships, total: scholarships.length });
});

// 3) GET /api/students/:id/matches
app.get("/api/students/:id/matches", async (req, res) => {
  const student = await prisma.student.findUnique({ where: { id: req.params.id } });
  if (!student) return res.status(404).json({ error: "Student not found" });

  const scholarships = await prisma.scholarship.findMany();

  const matches = [];
  for (const sch of scholarships) {
    const result = matchScholarship(student, sch);
    if (result.ok) {
      matches.push({
        scholarship: {
          id: sch.id,
          name: sch.name,
          amount: sch.amount,
          provider: sch.provider,
          deadline: sch.deadline,
          url: sch.url
        },
        match_reasons: result.reasons
      });
    }
  }

  // Sort by amount desc (simple heuristic)
  matches.sort((a, b) => b.scholarship.amount - a.scholarship.amount);

  // Add Groq explanation to top match only (per OA)
  let explanation = "";
  if (matches.length > 0) {
    try {
      const client = makeGroqClient();
      explanation = await generateExplanation(client, student, scholarships.find(s => s.id === matches[0].scholarship.id)!, matches[0].match_reasons);
      (matches[0] as any).explanation = explanation;
    } catch (e: any) {
      console.error("Groq error:", e?.message || e);
      explanation = "Explanation temporarily unavailable (AI service error).";
    }    
  }

  const totalPotentialAid = matches.reduce((sum, m) => sum + m.scholarship.amount, 0);

  res.json({
    student_id: student.id,
    student_name: student.name,
    total_matches: matches.length,
    total_potential_aid: totalPotentialAid,
    matches
  });
});

const port = Number(process.env.PORT || 3000);
app.listen(port, () => console.log(`✅ API running on http://localhost:${port}`));
