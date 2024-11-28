import { expect, test, Locator } from "../../fixtures/fixtures";
import { generateLoginInfo, createUser } from "../../fixtures/mockData";
import { login, logout } from "../../utils/helpers";

test.describe("logout tests", () => {
  test("should successfully log out", async ({ page }) => {
    await page.goto("/parabank/overview.htm");
    await logout(page);

    // Verify log out with UI
    expect(page.url()).toContain("/parabank/index.htm");
    await expect(
      page.getByRole("heading", { name: "Customer Login" })
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Log In" })).toBeVisible();
  });
});
