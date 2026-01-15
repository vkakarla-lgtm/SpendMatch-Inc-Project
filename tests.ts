const BASE_URL = "http://localhost:3000";

// Simple helper for readable output
function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`No ${message}`);
    process.exitCode = 1;
  } else {
    console.log(`Yes ${message}`);
  }
}

async function run() {
  console.log("\nRunning smoke tests...\n");

  // 1) Verify server is running
  // Reason: Confirms Express booted successfully
  const health = await fetch(`${BASE_URL}/health`).then(r => r.json());
  assert(health.ok === true, "API health endpoint responds");

  // 2) Verify scholarships load from DB
  // Reason: Confirms Prisma + SQLite are wired correctly
  const scholarshipsRes = await fetch(`${BASE_URL}/api/scholarships`).then(r => r.json());
  assert(
    Array.isArray(scholarshipsRes.scholarships),
    "Scholarships endpoint returns a list"
  );
  assert(
    scholarshipsRes.scholarships.length > 0,
    "Scholarships are seeded in the database"
  );

  // 3) Verify matching logic works for a known student
  // Reason: Core OA requirement — eligibility matching
  const matchesRes = await fetch(`${BASE_URL}/api/students/stu_001/matches`).then(r => r.json());
  assert(
    matchesRes.total_matches > 0,
    "Student has at least one matching scholarship"
  );

  // 4) Verify AI explanation exists on top match
  // Reason: Confirms Option B (Groq AI integration) works
  const topMatch = matchesRes.matches?.[0];
  assert(
    typeof topMatch?.explanation === "string" && topMatch.explanation.length > 0,
    "Top scholarship includes AI-generated explanation"
  );

  console.log("\nTests completed.\n");
}

run().catch(err => {
  console.error("No Tests failed with error:", err);
  process.exit(1);
});
