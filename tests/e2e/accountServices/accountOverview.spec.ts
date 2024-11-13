import test, { expect } from "playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, toDollar } from "../../utils/helpers";
import { AccountData, UserData } from "../../types/global";
import { getUserData } from "../../utils/API/misc";

test.describe("bank account tests", () => {
  let userData: UserData;
  let accountOverviewRoute: string;

  test.beforeAll("Setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
    userData = await getUserData(page, mockUser.username, mockUser.password);
    accountOverviewRoute = `https://parabank.parasoft.com/parabank/services_proxy/bank/customers/${userData.id}/accounts`;
  });

  test("request should return account overview data", async ({ page }) => {
    page.route(accountOverviewRoute, async (route) => {
      const headers = {
        ...route.request().headers(),
        Accept: "application/json",
      };
      await route.continue({ headers });
    });
    const overviewPromise = page.waitForResponse(accountOverviewRoute);
    await login(page, mockUser.username, mockUser.password);
    const overviewResponse = await overviewPromise;
    const overviewData: AccountData[] = await overviewResponse.json();

    for (let i = 0; i < overviewData.length; i++) {
      //Checks for properties
      expect(overviewData[i]).toHaveProperty("balance");
      expect(overviewData[i]).toHaveProperty("customerId", userData.id);
      expect(overviewData[i]).toHaveProperty("id");
      expect(overviewData[i]).toHaveProperty("type");

      //Checks for types
      expect(typeof overviewData[i].balance).toBe("number");
      expect(typeof overviewData[i].customerId).toBe("number");
      expect(typeof overviewData[i].id).toBe("number");
      expect(typeof overviewData[i].type).toBe("string");

      //Checks values are present
      expect(overviewData[i].balance).toBeTruthy();
      expect(overviewData[i].customerId).toBeTruthy();
      expect(overviewData[i].id).toBeTruthy();
      expect(overviewData[i].type).toBeTruthy();
    }
  });

  test("should show overview data", async ({ page }) => {
    page.route(accountOverviewRoute, async (route) => {
      const headers = {
        ...route.request().headers(),
        Accept: "application/json",
      };
      await route.continue({ headers });
    });
    const overviewPromise = page.waitForResponse(accountOverviewRoute);
    await login(page, mockUser.username, mockUser.password);
    const overviewResponse = await overviewPromise;
    const overviewData: AccountData[] = await overviewResponse.json();

    //Possibly use API call to have more than one account to test this.

    //Check each account overview row for correct data
    for (let i = 0; i < overviewData.length; i++) {
      const accountLink = page.locator("#accountTable a").nth(i);
      const balanceRow = page.locator("tbody tr").nth(i);
      const balanceCell = balanceRow.locator("td").nth(1);
      const availAmountCell = balanceRow.locator("td").nth(2);
      await expect(accountLink).toHaveText(overviewData[i].id.toString());
      await expect(balanceCell).toHaveText(toDollar(overviewData[i].balance));
      await expect(availAmountCell).toHaveText(
        toDollar(overviewData[i].balance)
      );
    }

    //Check total amount
    const totalRow = page.locator("tbody tr").last();
    const totalCell = totalRow.locator("td").nth(1);

    const getAccountTotal = () => {
      let total = 0;
      for (let i = 0; i < overviewData.length; i++) {
        total = total + overviewData[i].balance;
      }
      return toDollar(total);
    };

    const accountTotal = getAccountTotal();
    await expect(totalCell).toHaveText(accountTotal);
  });
});
