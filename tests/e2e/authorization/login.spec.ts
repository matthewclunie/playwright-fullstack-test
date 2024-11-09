//Spec Files: Each spec file should focus on a particular aspect of the feature
//(e.g., login.spec.ts tests various scenarios for user login).

import { test, expect } from "@playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { checkHeader, login } from "../../utils/helpers";

test.describe("login tests", () => {
  test.beforeAll("Setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test("should successfully log in", async ({ page }) => {
    //Log in
    await login(page, mockUser.username, mockUser.password);

    // Verify log in with UI
    await expect(page).toHaveURL("/parabank/overview.htm");
    await expect(
      page.getByRole("heading", { name: "Account Services" })
    ).toBeVisible();
    await expect(page.locator(".smallText")).toHaveText(
      `Welcome ${mockUser.firstName} ${mockUser.lastName}`
    );
  });

  test("should get error with empty login", async ({ page }) => {
    const headerText = {
      title: "Error!",
      caption: "Please enter a username and password.",
    };
    await page.goto("/parabank/index.htm");
    await page.getByRole("button", { name: "Log In" }).click();
    await checkHeader(page, headerText.title, headerText.caption);
  });

  test("should get error with incorrect login", async ({ page }) => {
    const headerText = {
      title: "Error!",
      caption: "An internal error has occurred and has been logged.",
    };
    await login(page, "missingUser", "wrongPassword");
    await checkHeader(page, headerText.title, headerText.caption);
  });
});
