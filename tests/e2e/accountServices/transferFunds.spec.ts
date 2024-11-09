import { test, expect, Page } from "playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, setDataAccessMode } from "../../utils/helpers";
import { AccountData, UserData } from "../../types/global";
import {
  createAccount,
  getCustomerAccounts,
  getSingleAccountData,
  getUserData,
} from "../../utils/api";
import { stringify } from "querystring";

test.describe("transfer funds tests", () => {
  let userData: UserData;

  const getInitialAccount = async (page: Page, customerId: number) => {
    const headers = {
      accept: "application/json",
    };
    const response = await page.request.get(
      `https://parabank.parasoft.com/parabank/services/bank/customers/${customerId}/accounts`,
      { headers }
    );
    const accountsData: AccountData[] = await response.json();
    return accountsData[0];
  };

  test.beforeAll("Setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
    userData = await getUserData(page, mockUser.username, mockUser.password);
  });

  test.skip("page on attempt", async ({ page }) => {
    const route = `https://parabank.parasoft.com/parabank/services_proxy/bank/customers/${userData.id}/accounts`;

    await login(page, mockUser.username, mockUser.password);
    // await setDataAccessMode(page, "JSON");

    page.route(route, async (route) => {
      const headers = {
        accept: "application/json",
      };
      await route.continue({ headers });
    });
    page.on("request", async (request) => {
      const url = request.url();
      if (
        url.includes(
          "https://parabank.parasoft.com/parabank/services_proxy/bank/customers"
        )
      ) {
        const response = await request.response();
        const data = await response?.json();
        console.log(data);
      }
    });
    await page.goto("/parabank/transfer.htm");
  });

  test("should transfer funds", async ({ page }) => {
    const url = `https://parabank.parasoft.com/parabank/services_proxy/bank/customers/${userData.id}/accounts`;
    const accountsPromise = page.waitForResponse(
      (response) =>
        response.url() === url &&
        page.url() === "https://parabank.parasoft.com/parabank/transfer.htm"
    );

    const initialAccount: AccountData = await getInitialAccount(
      page,
      userData.id
    );
    await createAccount(page, initialAccount.customerId, 0, initialAccount.id);
    await createAccount(page, initialAccount.customerId, 0, initialAccount.id);
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/transfer.htm");
    const accountsResponse = await accountsPromise;
    const accountsData = await accountsResponse.json();
    for (let i = 0; i < accountsData.length; i++) {
      const accountOption = page.locator("#fromAccountId option").nth(i);
      const accountId = accountsData[i].id;
      await expect(accountOption).toHaveText(accountId.toString());
    }
  });
});
