// [GenAI Use] Prompt: "Role: senior expert Playwright E2E test developer. Context: I want to design test cases about register, login, authentication, as well as browse profile, favorites, questionnaire, housing and messages pages. Remember to include initialization of frontend and backend to fully automate. Task: Implement 10 test cases using Playwright."
// [GenAI Use] LLM Response Start
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: I manually went over all the test cases with two more small edits compared with the initial version Claude provided me. I deleted duplicate test cases and keep test cases that tests on the main function of the program (and edge cases that we did not thought about during manual testing--like unauthenticated user case)