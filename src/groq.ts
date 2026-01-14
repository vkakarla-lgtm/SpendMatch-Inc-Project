import Groq from "groq-sdk";
import { Scholarship, Student } from "@prisma/client";

console.log("GROQ_API_KEY present?", Boolean(process.env.GROQ_API_KEY));

export function makeGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error("Missing GROQ_API_KEY in .env");
  return new Groq({ apiKey });
}

export async function generateExplanation(
  client: Groq,
  student: Student,
  sch: Scholarship,
  reasons: string[]
) {
  const prompt = `
Write a 2-3 sentence explanation of why this scholarship matches this student.
Be specific and encouraging. Mention scholarship name, amount, provider, and at least 2 concrete reasons.

Scholarship:
- Name: ${sch.name}
- Provider: ${sch.provider}
- Amount: $${sch.amount}

Student:
- Name: ${student.name}
- GPA: ${student.gpa}
- Major: ${student.major}
- Enrollment: ${student.enrollmentStatus}

Match reasons:
${reasons.map((r) => `- ${r}`).join("\n")}
`.trim();

  const resp = await client.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      { role: "system", content: "You are a helpful scholarship advisor." },
      { role: "user", content: prompt }
    ],
    temperature: 0.6,
    max_tokens: 180
  });

  return resp.choices?.[0]?.message?.content?.trim() ?? "";
}
