import test, { expect } from "playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { getUserData, login } from "../../utils/helpers";
import { UserData } from "../../types/global";

test.describe("Bank Account Recovery Tests", () => {
  let userData: UserData;

  test.beforeAll("Setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
    userData = await getUserData(page, mockUser.username, mockUser.password);
  });

  test("should open checking account", async ({ page }) => {
    const header = {
      title: "Account Opened!",
      caption: "Congratulations, your account is now open.",
    };
    const route = `https://parabank.parasoft.com/parabank/services_proxy/bank/createAccount?customerId=${userData.id}`;
    page.route(route, async (route) => {
      const headers = {
        ...route.request().headers(),
        Accept: "application/json",
      };
      await route.continue({ headers });
    });

    const createAccountPromise = page.waitForResponse((response) => {
      return response.url().includes(route);
    });

    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/openaccount.htm");
    await page.getByRole("button", { name: "Open New Account" }).click();
    const createAccountResponse = await createAccountPromise;
    console.log(createAccountResponse);
    const openAccountTitle = page.locator("#openAccountResult .title");
    await expect(openAccountTitle).toHaveText(header.title);
    const openAccountCaption = page
      .locator("#openAccountResult")
      .locator("p")
      .first();
    await expect(openAccountCaption).toHaveText(header.caption);
    const newAccountDetails = page
      .locator("#openAccountResult")
      .locator("p")
      .nth(1);
    await expect(newAccountDetails).toHaveText(`Your new account number:`);
  });

  test("should open savings account", async ({ page }) => {
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/openaccount.htm");
  });
});
