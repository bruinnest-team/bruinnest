#[GenAI Use] Prompt: "Role: senior expert Playwright E2E test developer. Context: I want to design test cases about register, login, unauthenticated user visiting, as well as browse profile, favorites, questionnaire, housing and messages pages. Remember to include initialization of frontend and backend to fully automate. Task: Implement 10 test cases using Playwright."
#[GenAI Use] LLM Response Start
#!/bin/bash
set -e
cd "$(dirname "$0")/.."

# Reset and seed the database
npm run db:reset --prefix server

# Start backend and frontend in background
(cd server && node src/server.js) &
BACKEND_PID=$!

(cd client && npm run dev -- --port 5173 --strictPort) &
FRONTEND_PID=$!

# Kill both servers on exit (pass or fail)
cleanup() {
  kill $(lsof -t -i:3000 -i:5173 2>/dev/null) 2>/dev/null || true
}
trap cleanup EXIT

# Wait for both to be ready
npx wait-on http-get://localhost:3000/api/health http-get://localhost:5173

# Run tests
npx playwright test
#[GenAI Use] LLM Response End
#[GenAI Use] Reflection: I manually went over all the test cases with two more small edits compared with the initial version Claude provided me. I deleted duplicate test cases and keep test cases that tests on the main function of the program (and edge cases that we did not thought about during manual testing--like unauthenticated user case)