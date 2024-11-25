import { expect, test } from "@playwright/test";
import { generateLoginInfo, createUser } from "../../fixtures/mockData";
import { login, logout } from "../../utils/helpers";

const loginInfo = generateLoginInfo();

test.describe("logout tests", () => {
  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await createUser(page, loginInfo.username, loginInfo.password);
  });

  test("should successfully log out", async ({ page }) => {
    await login(page, loginInfo.username, loginInfo.password);
    await logout(page);

    // Verify log out with UI
    expect(page.url()).toContain("/parabank/index.htm");
    await expect(
      page.getByRole("heading", { name: "Customer Login" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
  });
});
