import { test, expect } from "playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, toDollar } from "../../utils/helpers";
import { AccountData, ErrorData, UserData } from "../../types/global";
import {
  createAccount,
  getCustomerAccounts,
  getInitialAccount,
} from "../../utils/API/accounts";
import { getUserData } from "../../utils/API/misc";

test.describe("transfer funds tests", () => {
  let userData: UserData;

  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
    userData = await getUserData(page, mockUser.username, mockUser.password);
  });

  // test.skip("page on attempt", async ({ page }) => {
  //   const route = `/parabank/services_proxy/bank/customers/${userData.id}/accounts`;

  //   await login(page, mockUser.username, mockUser.password);
  //   // await setDataAccessMode(page, "JSON");

  //   page.route(route, async (route) => {
  //     const headers = {
  //       accept: "application/json",
  //     };
  //     await route.continue({ headers });
  //   });
  //   page.on("request", async (request) => {
  //     const url = request.url();
  //     if (
  //       url.includes(
  //         "/parabank/services_proxy/bank/customers"
  //       )
  //     ) {
  //       const response = await request.response();
  //       const data = await response?.json();
  //       console.log(data);
  //     }
  //   });
  //   await page.goto("/parabank/transfer.htm");
  // });

  test("should transfer funds", async ({ page }) => {
    const url = `/parabank/services_proxy/bank/customers/${userData.id}/accounts`;
    const accountsPromise = page.waitForResponse((response) => {
      return (
        response.url().includes(url) &&
        page.url().includes("/parabank/transfer.htm")
      );
    });

    //Set up accounts to transfer money between
    const initialAccount: AccountData = await getInitialAccount(
      page,
      userData.id
    );
    await createAccount(page, initialAccount.customerId, 0, initialAccount.id);
    await createAccount(page, initialAccount.customerId, 0, initialAccount.id);
    await login(page, mockUser.username, mockUser.password);

    //Check that all accounts are available for transfer
    await page.goto("/parabank/transfer.htm");
    const accountsResponse = await accountsPromise;
    const accountsData: AccountData[] = await accountsResponse.json();
    for (let i = 0; i < accountsData.length; i++) {
      const accountId = accountsData[i].id;
      const fromAccountOption = page.locator("#fromAccountId option").nth(i);
      const toAccountOption = page.locator("#toAccountId option").nth(i);
      await expect(fromAccountOption).toHaveText(accountId.toString());
      await expect(toAccountOption).toHaveText(accountId.toString());
    }

    //Transfer funds
    const transferAmount = 100;
    const fromAccount = accountsData[0];
    const toAccount = accountsData[1];
    await page.locator("#amount").fill(transferAmount.toString());
    await page.locator("#toAccountId").selectOption(toAccount.id.toString());
    const transferPromise = page.waitForResponse(
      `/parabank/services_proxy/bank/transfer?fromAccountId=${fromAccount.id}&toAccountId=${toAccount.id}&amount=${transferAmount}`
    );

    //Check for successful API POST
    await page.getByRole("button", { name: "Transfer" }).click();
    const transferResponse = await transferPromise;
    expect(transferResponse.ok()).toBe(true);

    //Check confirmation page
    await expect(page.locator("#showResult h1")).toHaveText(
      "Transfer Complete!"
    );
    await expect(page.locator("#amountResult")).toHaveText(
      toDollar(transferAmount)
    );
    await expect(page.locator("#fromAccountIdResult")).toHaveText(
      fromAccount.id.toString()
    );
    await expect(page.locator("#toAccountIdResult")).toHaveText(
      toAccount.id.toString()
    );
    await expect(page.locator("#showResult p").last()).toHaveText(
      "See Account Activity for more details."
    );

    //Check API has successfully updated balances
    const postTransferAccountData: AccountData[] = await getCustomerAccounts(
      page,
      userData.id
    );
    expect(postTransferAccountData[0].balance).toEqual(
      fromAccount.balance - transferAmount
    );
    expect(postTransferAccountData[1].balance).toEqual(
      toAccount.balance + transferAmount
    );
  });

  test("should return error with incomplete form submission", async ({
    page,
  }) => {
    const transferPromise = page.waitForResponse((response) => {
      return response.url().includes("/parabank/services_proxy/bank/transfer");
    });
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/transfer.htm");

    //Submit incomplete form
    await page.getByRole("button", { name: "Transfer" }).click();
    const transferResponse = await transferPromise;
    const transferData: ErrorData = await transferResponse.json();

    //Check for bad request
    expect(transferResponse.ok()).toBe(false);
    expect(transferResponse).toHaveProperty("title", "Bad Request");
    expect(transferData).toHaveProperty(
      "detail",
      "Required parameter 'amount' is not present."
    );
  });
});
