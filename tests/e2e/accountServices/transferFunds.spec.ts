import { expect, test } from "../../fixtures/fixtures";
import { generateLoginInfo, createUser } from "../../fixtures/mockData";
import { AccountData, ErrorData, UserData } from "../../types/global";
import {
  createAccount,
  getCustomerAccounts,
  getInitialAccount,
} from "../../utils/API/accounts";
import { getUserData } from "../../utils/API/misc";
import { login, toDollar } from "../../utils/helpers";

const loginInfo = generateLoginInfo();

test.describe("transfer funds tests", () => {
  let userData: UserData;
  const transferUrl =
    "/parabank/services_proxy/bank/transfer?fromAccountId=*&toAccountId=*&amount=*";

  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await createUser(page, username, password);
    userData = await getUserData(page, username, password);
  });

  test("should transfer funds", async ({ page }) => {
    const accountsUrl = `/parabank/services_proxy/bank/customers/${userData.id}/accounts`;
    const accountsPromise = page.waitForResponse((response) => {
      return (
        response.url().includes(accountsUrl) &&
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
    await login(page, username, password);

    //Check that all accounts are available for transfer
    await page.goto("/parabank/transfer.htm");
    const accountsResponse = await accountsPromise;
    expect(accountsResponse.ok()).toBe(true);
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
    const transferPromise = page.waitForResponse(transferUrl);

    //Check for successful API POST
    await page.getByRole("button", { name: "Transfer" }).click();
    const transferResponse = await transferPromise;
    expect(transferResponse.ok()).toBe(true);

    //Check confirmation page
    await expect(page.locator("#showResult h1")).toHaveText(
      "Transfer Complete!"
    );
    const confirmationMsg = `${toDollar(
      transferAmount
    )} has been transferred from account #${fromAccount.id} to account #${
      toAccount.id
    }.`;

    await expect(page.locator("#showResult p").first()).toHaveText(
      confirmationMsg
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

  test("should return error with incomplete transfer form submission ", async ({
    page,
  }) => {
    const transferPromise = page.waitForResponse(transferUrl);
    await login(page, username, password);
    await page.goto("/parabank/transfer.htm");
    await page.waitForLoadState("networkidle");

    //Submit incomplete form
    await page.getByRole("button", { name: "Transfer" }).click();
    const transferResponse = await transferPromise;
    expect(transferResponse.ok()).toBe(false);
    const transferData: ErrorData = await transferResponse.json();

    //Check for bad request
    expect(transferData).toHaveProperty("title", "Bad Request");
    expect(transferData).toHaveProperty(
      "detail",
      "Required parameter 'amount' is not present."
    );
  });
});
