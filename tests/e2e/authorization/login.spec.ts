//Spec Files: Each spec file should focus on a particular aspect of the feature
//(e.g., login.spec.ts tests various scenarios for user login).

import { expect, test } from "@playwright/test";
import {
  generateLoginInfo,
  mockUser,
  setupNewUser,
} from "../../fixtures/mockData";
import { checkHeader, login, logout } from "../../utils/helpers";

const loginInfo = generateLoginInfo();

test.describe("login tests", () => {
  test("should successfully log in", async ({ page }) => {
    await setupNewUser(page, loginInfo.username, loginInfo.password);
    await logout(page);
    await login(page, loginInfo.username, loginInfo.password);

    // Verify login with UI
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
      caption: "The username and password could not be verified.",
    };
    await login(page, "missingUser", "wrongPassword");
    await checkHeader(page, headerText.title, headerText.caption);
  });
});
