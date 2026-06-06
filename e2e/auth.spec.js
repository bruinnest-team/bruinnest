// [GenAI Use] Prompt: "Role: senior expert Playwright E2E test developer. Context: I want to design test cases about register, login, authentication, as well as browse profile, favorites, questionnaire, housing and messages pages. Remember to include initialization of frontend and backend to fully automate. Task: Implement 10 test cases using Playwright."
// [GenAI Use] LLM Response Start
import { test, expect } from '@playwright/test';

async function loginAlice(page) {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'alice@ucla.edu');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await page.waitForURL(/browse/);
}

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
});

// 1. Auth — register
test('register flow shows verification screen', async ({ page }) => {
  await page.goto('/register');
  await page.fill('input[type="email"]', 'test@ucla.edu');
  await page.fill('input[type="password"]', 'SecurePass123!');
  await page.click('button[type="submit"]');
  await expect(page.getByText(/A verification code has been sent/i)).toBeVisible();
});

// 2. Auth — login success
test('login with valid credentials redirects to browse', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'alice@ucla.edu');
  await page.fill('input[type="password"]', 'Password123!');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/browse|profile\/setup/);
});

// 3. Auth — login failure
test('login with wrong password shows error message', async ({ page }) => {
  await page.goto('/login');
  await page.fill('input[type="email"]', 'alice@ucla.edu');
  await page.fill('input[type="password"]', 'wrongpassword');
  await page.click('button[type="submit"]');
  await expect(page.locator('.form-error')).toBeVisible();
});

// 4. Routing — protected route guard
test('unauthenticated user visiting /browse is redirected to login', async ({ page }) => {
  await page.goto('/browse');
  await expect(page).toHaveURL(/login/);
});

// 5. Browse — page loads with profiles
test('browse page shows profile listings', async ({ page }) => {
  await loginAlice(page);
  await expect(page.getByRole('heading', { name: 'Browse Profiles' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3 }).first()).toBeVisible();
});

// 6. Browse — search filter works
test('browse search by name shows matching profile', async ({ page }) => {
  await loginAlice(page);
  await page.getByPlaceholder('Name or bio...').fill('Bob');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByText('Bob Chen')).toBeVisible();
});

// 7. Favorites — page loads
test('favorites page loads for logged-in user', async ({ page }) => {
  await loginAlice(page);
  await page.goto('/favorites');
  await expect(page.getByRole('heading', { name: 'My Favorites' })).toBeVisible();
});

// 8. Questionnaire — page loads with form
test('questionnaire page loads with dropdown questions', async ({ page }) => {
  await loginAlice(page);
  await page.goto('/questionnaire');
  await expect(page.getByRole('heading', { name: 'Roommate Questionnaire' })).toBeVisible();
  await expect(page.locator('select.form-input').first()).toBeVisible();
});

// 9. Housing — page loads with search
test('housing page loads with search form', async ({ page }) => {
  await loginAlice(page);
  await page.goto('/housing');
  await expect(page.getByRole('heading', { name: 'Link Housing' })).toBeVisible();
});

// 10. Messages — page loads conversation layout
test('messages page loads conversation layout', async ({ page }) => {
  await loginAlice(page);
  await page.goto('/messages');
  await expect(page.locator('.messages-layout')).toBeVisible();
});
// [GenAI Use] LLM Response End
// [GenAI Use] Reflection: I manually went over all the test cases with two more small edits compared with the initial version Claude provided me. I deleted duplicate test cases and keep test cases that tests on the main function of the program (and edge cases that we did not thought about during manual testing--like unauthenticated user case)