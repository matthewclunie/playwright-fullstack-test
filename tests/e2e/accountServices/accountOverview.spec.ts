import test, { expect } from "playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { getOverviewData, getUserData, login } from "../../utils/helpers";
import { UserData } from "../../types/global";

export interface AccountData {
  balance: number;
  customerId: number;
  id: number;
  type: string;
}

test.describe("Bank account tests", () => {
  let userData: UserData;

  test.beforeAll("Setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
    userData = await getUserData(page, mockUser.username, mockUser.password);
  });

  test("request returns account overview data @API", async ({ page }) => {
    await page.goto("https://parabank.parasoft.com/parabank/index.htm");
    await login(page, mockUser.username, mockUser.password);
    const overviewData: AccountData[] = await getOverviewData(
      page,
      userData.id
    );

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
    await page.goto("https://parabank.parasoft.com/parabank/index.htm");
    await login(page, mockUser.username, mockUser.password);
    const overviewData: AccountData[] = await getOverviewData(
      page,
      userData.id
    );

    for (let i = 0; i < overviewData.length; i++) {
      const accountLink = page.locator("#accountTable a").nth(i);
      const balanceRow = page.locator("tbody tr").nth(i);
      const balanceCell = balanceRow.locator("td").nth(1);
      await expect(accountLink).toHaveText(overviewData[i].id.toString());
      await expect(balanceCell).toHaveText(
        `$${overviewData[i].balance.toFixed(2)}`
      );
    }
  });
});
