import test, { expect } from "playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, toDollar } from "../../utils/helpers";
import { AccountData, UserData } from "../../types/global";
import { createAccount, getInitialAccount } from "../../utils/API/accounts";
import { getUserData } from "../../utils/API/misc";

test.describe("account overview tests", () => {
  const accountOverviewRoute = `/parabank/services_proxy/bank/customers/*/accounts`;

  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test("request should return account overview data", async ({ page }) => {
    const overviewPromise = page.waitForResponse(accountOverviewRoute);
    await login(page, mockUser.username, mockUser.password);
    const overviewResponse = await overviewPromise;
    const overviewData: AccountData[] = await overviewResponse.json();

    for (let i = 0; i < overviewData.length; i++) {
      const { balance, customerId, id, type } = overviewData[i];

      //Checks for properties
      expect(overviewData[i]).toHaveProperty("balance");
      expect(overviewData[i]).toHaveProperty("customerId");
      expect(overviewData[i]).toHaveProperty("id");
      expect(overviewData[i]).toHaveProperty("type");

      //Checks for types
      expect(typeof balance).toBe("number");
      expect(typeof customerId).toBe("number");
      expect(typeof id).toBe("number");
      expect(typeof type).toBe("string");

      //Checks values are present
      expect(balance).toBeTruthy();
      expect(customerId).toBeTruthy();
      expect(id).toBeTruthy();
      expect(type).toBeTruthy();
    }
  });

  test("should show overview data", async ({ page }) => {
    const overviewPromise = page.waitForResponse(accountOverviewRoute);
    const userData: UserData = await getUserData(
      page,
      mockUser.username,
      mockUser.password
    );

    //Set up multiple accounts to display in overview
    const initialAccount = await getInitialAccount(page, userData.id);
    await createAccount(page, userData.id, 0, initialAccount.id);
    await createAccount(page, userData.id, 0, initialAccount.id);
    await login(page, mockUser.username, mockUser.password);
    const overviewResponse = await overviewPromise;
    const overviewData: AccountData[] = await overviewResponse.json();

    //Check each account overview row for correct data
    for (let i = 0; i < overviewData.length; i++) {
      const { id, balance } = overviewData[i];
      const accountLink = page.locator("#accountTable a").nth(i);
      const balanceRow = page.locator("tbody tr").nth(i);
      const balanceCell = balanceRow.locator("td").nth(1);
      const availAmountCell = balanceRow.locator("td").nth(2);
      await expect(accountLink).toHaveText(id.toString());
      await expect(balanceCell).toHaveText(toDollar(balance));
      await expect(availAmountCell).toHaveText(toDollar(balance));
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
