import { test, expect } from "@playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, logout } from "../../utils/helpers";

test.describe("logout tests", () => {
  test.beforeAll("Setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test("should successfully log out", async ({ page }) => {
    //Login
    await login(page, mockUser.username, mockUser.password);
    //Log Out
    await logout(page);

    // Verify log out with UI
    expect(page.url()).toContain("/parabank/index.htm");
    await expect(
      page.getByRole("heading", { name: "Customer Login" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
  });
});
