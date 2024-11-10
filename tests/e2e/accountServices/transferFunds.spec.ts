import { test, expect, Page } from "playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login } from "../../utils/helpers";
import { AccountData, UserData } from "../../types/global";
import { createAccount, getCustomerAccounts } from "../../utils/API/accounts";
import { getUserData } from "../../utils/API/misc";

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

  // test.skip("page on attempt", async ({ page }) => {
  //   const route = `https://parabank.parasoft.com/parabank/services_proxy/bank/customers/${userData.id}/accounts`;

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
  //         "https://parabank.parasoft.com/parabank/services_proxy/bank/customers"
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
    const url = `https://parabank.parasoft.com/parabank/services_proxy/bank/customers/${userData.id}/accounts`;
    const accountsPromise = page.waitForResponse(
      (response) =>
        response.url() === url &&
        page.url() === "https://parabank.parasoft.com/parabank/transfer.htm"
    );

    //set up accounts to transfer money between
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
    await page.locator("#toAccountId").selectOption(`${toAccount.id}`);
    const transferPromise = page.waitForResponse(
      `https://parabank.parasoft.com/parabank/services_proxy/bank/transfer?fromAccountId=${fromAccount.id}&toAccountId=${toAccount.id}&amount=${transferAmount}`
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
      `$${transferAmount.toFixed(2)}`
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

    //Check API has successfully updated balances.
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
});
