# TuitionPlanner – Scholarship Matching API (Take-Home OA)

This project implements a scholarship matching API that:
1) Stores students and scholarships in a SQLite database (via Prisma)
2) Matches students to scholarships by eligibility rules
3) Returns structured “match reasons”
4) Uses Groq (Option B) to generate a personalized explanation for the top match

The OA focuses on correctness, clarity, and testability. The core logic lives in a pure matching function that can be validated independently of the API layer.

## Tech Stack

- Node.js + TypeScript
- Express (API)
- Prisma ORM + SQLite (local DB)
- Groq API (Option B) for personalized explanation


## Project Structure (Where to look)

- `src/index.ts`
  - Express server + required endpoints:
    - `POST /api/students`
    - `GET /api/scholarships`
    - `GET /api/students/:id/matches`

- `src/matching.ts`
  - Core matching logic:
    - `matchScholarship(student, scholarship)` returns:
      - `ok` (boolean)
      - `reasons` (string array)

- `src/groq.ts`
  - Groq API integration:
    - Generates a short personalized explanation for the top match only

- `prisma/schema.prisma`
  - Student & Scholarship models + eligibility fields

- `prisma/seed.ts`
  - Seeds the DB using:
    - `students-sample.json`
    - `scholarships.json`

- `scripts/run-student-tests.ts`
  - Test runner that prints:
    - which scholarships each sample student matches
    - match reasons
    - a Groq explanation for the top match (if enabled)


## Matching Rules (How matches are decided)

A student matches a scholarship if they meet **all required criteria**.

Implemented checks include:
- GPA: `student.gpa >= scholarship.gpaMinimum`
- Enrollment status: student must be in scholarship’s allowed enrollment list (if specified)
- Citizenship: student must be in allowed citizenship list (if specified)
- Major/field of study: if scholarship has fields_of_study, student.major must be included; otherwise open
- Optional requirements enforced only when present:
  - first_generation, financial_need, gender, ethnicity, residency
  - community_service_hours minimum
  - military_affiliation list

The API returns `match_reasons` to show why the match occurred.

---

## Groq Explanation (Option B)

For the **top matching scholarship only**, the API calls Groq to generate a short personalized explanation based on:
- scholarship name, provider, amount
- student profile (gpa, major, etc.)
- computed match reasons

If Groq is unavailable (missing key / network error), the system falls back to a safe message.

---

# Setup

## 1) Install dependencies

```bash
npm install


2) Create the .env

--Should look something like this:

DATABASE_URL="file:./dev.db"
PORT=3000
NODE_ENV=development

# Option B: Groq
AI_PROVIDER=groq
GROQ_API_KEY=YOUR_GROQ_KEY_HERE

3) Create database tables (Prisma migrate)

npx prisma migrate dev --name init

4) Seed the database (load sample students + scholarships)
    
    npx prisma db seed
    
    --This is optional but if you want to view the data in a spreadsheet:
        npx prisma studio


5) Run the API

Start the dev server:
--npm run dev

Health check:

--curl http://localhost:3000/health

for each specific student:
--curl http://localhost:3000/api/students/stu_001/matches
# SpendMatch-Inc-Project
