import { expect, Page, test } from "../../fixtures/fixtures";
import { createUser } from "../../fixtures/mockData";
import { AccountData } from "../../types/global";
import { getAccountById } from "../../utils/API/accounts";
import { login } from "../../utils/helpers";

test.describe("open new account tests", () => {
  const confimationCheck = async (
    page: Page,
    title: string,
    caption: string,
    newAccountId: number
  ) => {
    const openAccountTitle = page.locator("#openAccountResult .title");
    await expect(openAccountTitle).toHaveText(title);
    const openAccountCaption = page
      .locator("#openAccountResult")
      .locator("p")
      .first();
    await expect(openAccountCaption).toHaveText(caption);
    const newAccountDetails = page
      .locator("#openAccountResult")
      .locator("p")
      .nth(1);
    await expect(newAccountDetails).toHaveText(
      `Your new account number: ${newAccountId}`
    );
  };

  const createAccount = async (
    page: Page,
    accountType: "CHECKING" | "SAVINGS"
  ) => {
    await page.waitForLoadState("networkidle");
    await page.locator("#type").selectOption(accountType);
    await page.getByRole("button", { name: "Open New Account" }).click();
  };

  const databaseCheck = async (
    page: Page,
    newAccountId: number,
    newAccountType: string
  ) => {
    const accountData: AccountData = await getAccountById(page, newAccountId);
    expect(accountData.id).toBe(newAccountId);
    expect(accountData.type).toBe(newAccountType);
  };

  const createAccountRoute =
    "/parabank/services_proxy/bank/createAccount?customerId=*&newAccountType=*&fromAccountId=*";

  let createAccountData: AccountData;

  test.beforeEach(async ({ page }) => {
    const createAccountPromise = page.waitForResponse(createAccountRoute);
    await page.goto("/parabank/openaccount.htm");

    //Wait for select options to load, create account
    await createAccount(page, "CHECKING");
    const createAccountResponse = await createAccountPromise;
    expect(createAccountResponse.ok()).toBe(true);
    createAccountData = await createAccountResponse.json();
  });

  test("should open checking account", async ({ page }) => {
    const header = {
      title: "Account Opened!",
      caption: "Congratulations, your account is now open.",
    };

    //Check UI for account creation confirmation
    await confimationCheck(
      page,
      header.title,
      header.caption,
      createAccountData.id
    );

    //Check database has successfully stored new account
    await databaseCheck(page, createAccountData.id, createAccountData.type);
  });

  test("should open savings account", async ({ page }) => {
    const header = {
      title: "Account Opened!",
      caption: "Congratulations, your account is now open.",
    };

    //Check UI for account creation confirmation
    await confimationCheck(
      page,
      header.title,
      header.caption,
      createAccountData.id
    );

    //Check database has successfully stored new account
    await databaseCheck(page, createAccountData.id, createAccountData.type);
  });
});
