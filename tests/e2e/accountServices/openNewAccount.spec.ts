import { test, expect } from "playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login } from "../../utils/helpers";
import { AccountData } from "../../types/global";
import { getAccountById } from "../../utils/API/accounts";

interface CreateAccountData {
  id: number;
  customerId: number;
  type: "CHECKING" | "SAVINGS";
  balance: number;
}

test.describe("open new account tests", () => {
  const createAccountRoute = `/parabank/services_proxy/bank/createAccount`;

  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test("should open checking account", async ({ page }) => {
    const header = {
      title: "Account Opened!",
      caption: "Congratulations, your account is now open.",
    };

    await login(page, mockUser.username, mockUser.password);
    const createAccountPromise = page.waitForResponse((response) => {
      return response.url().includes(createAccountRoute);
    });

    await page.goto("/parabank/openaccount.htm");
    await page.waitForLoadState("networkidle");
    await page.getByRole("button", { name: "Open New Account" }).click();
    const createAccountResponse = await createAccountPromise;
    const createAccountData: AccountData = await createAccountResponse.json();
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
    await expect(newAccountDetails).toHaveText(
      `Your new account number: ${createAccountData.id}`
    );

    //Check database has successfully stored new account
    const accountData: AccountData = await getAccountById(
      page,
      createAccountData.id
    );
    expect(accountData.id).toBe(createAccountData.id);
    expect(accountData.type).toBe(createAccountData.type);
  });

  test("should open savings account", async ({ page }) => {
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/openaccount.htm");
    await page.waitForLoadState("networkidle");
    await page.locator("#type").selectOption("SAVINGS");
    const createAccountPromise = page.waitForResponse((response) => {
      return response.url().includes(createAccountRoute);
    });
    await page.getByRole("button", { name: "Open New Account" }).click();
    const createAccountResponse = await createAccountPromise;
    const createAccountData: CreateAccountData =
      await createAccountResponse.json();

    //Check database has successfully stored new account
    const accountData: AccountData = await getAccountById(
      page,
      createAccountData.id
    );
    expect(accountData.id).toBe(createAccountData.id);
    expect(accountData.type).toBe(createAccountData.type);
  });
});
