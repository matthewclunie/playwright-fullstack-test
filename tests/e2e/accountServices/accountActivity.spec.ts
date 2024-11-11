import { test, expect } from "@playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login } from "../../utils/helpers";
import { AccountData, TransactionsData, UserData } from "../../types/global";
import { getUserData } from "../../utils/API/misc";
import { getInitialAccount } from "../../utils/API/accounts";

test.describe("account activity tests", () => {
  let userData: UserData;

  test.beforeAll("Setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
    userData = await getUserData(page, mockUser.username, mockUser.password);
  });

  test("should display account activity details", async ({ page }) => {
    const accountsUrl = `https://parabank.parasoft.com/parabank/services_proxy/bank/customers/${userData.id}/accounts`;
    const accountsPromise = page.waitForResponse((response) => {
      return response.ok() && response.url() === accountsUrl;
    });
    await login(page, mockUser.username, mockUser.password);
    const accountsResponse = await accountsPromise;
    const accountsData: AccountData[] = await accountsResponse.json();
    const initialAccount = accountsData[0];
    await page.goto(
      `https://parabank.parasoft.com/parabank/activity.htm?id=${initialAccount.id}`
    );
    await expect(page.locator("#accountId")).toHaveText(
      initialAccount.id.toString()
    );
    await expect(page.locator("#accountType")).toHaveText(
      initialAccount.type.toString()
    );
    await expect(page.locator("#balance")).toHaveText(
      `$${initialAccount.balance.toFixed(2)}`
    );
    await expect(page.locator("#availableBalance")).toHaveText(
      `$${initialAccount.balance.toFixed(2)}`
    );
  });

  test("should sort by activity period", async ({ page }) => {
    // const accountsUrl = `https://parabank.parasoft.com/parabank/services_proxy/bank/customers/${userData.id}/accounts`;
    const initialAccount: AccountData = await getInitialAccount(
      page,
      userData.id
    );
    const activityPageRoute = `https://parabank.parasoft.com/parabank/services_proxy/bank/accounts/${initialAccount.id}/transactions/month/All/type/All`;
    await page.route(activityPageRoute, async (route, request) => {
      const headers = { ...request.headers(), accept: "application/json" };
      const mockBody = [
        {
          id: 77777,
          accountId: initialAccount.id,
          type: "Debit",
          date: Date.now(),
          amount: 100,
          description: "Funds Transfer Sent",
        },
        {
          id: 88888,
          accountId: initialAccount.id,
          type: "Debit",
          date: Date.parse("27 October 2020 12:00:00 GMT"),
          amount: 100,
          description: "Funds Transfer Sent",
        },
      ];
      await route.fulfill({ headers, json: mockBody });
    });
    const transactionsPromise = page.waitForResponse((response) => {
      return response.ok() && response.url() === activityPageRoute;
    });
    await login(page, mockUser.username, mockUser.password);
    await page.goto(
      `https://parabank.parasoft.com/parabank/activity.htm?id=${initialAccount.id}`
    );
    const transactionsResponse = await transactionsPromise;
    const transactionsData: TransactionsData[] =
      await transactionsResponse.json();
    await expect(page).toHaveURL(
      `https://parabank.parasoft.com/parabank/activity.htm?id=${initialAccount.id}`
    );
  });
});
