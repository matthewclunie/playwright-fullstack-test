import { test, expect } from "@playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, logout } from "../../utils/helpers";

test.describe("Logout Tests", () => {
  test.beforeAll("Setup", async ({ browser }) => {
    await setupNewUser(browser);
  });

  test("should successfully log out", async ({ page }) => {
    await page.goto("/parabank/index.htm");
    //Login
    await login(page, mockUser.username, mockUser.password);
    //Log Out
    await logout(page);

    // Verify log out with UI
    expect(page.url()).toContain(
      "https://parabank.parasoft.com/parabank/index.htm"
    );
    await expect(
      page.getByRole("heading", { name: "Customer Login" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
  });
});
