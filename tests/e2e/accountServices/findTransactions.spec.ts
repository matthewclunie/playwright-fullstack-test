import { test, expect } from "@playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login } from "../../utils/helpers";
import { AccountData, TransactionsData, UserData } from "../../types/global";
import { getUserData } from "../../utils/API/misc";
import { createAccount, getInitialAccount } from "../../utils/API/accounts";
import { getAccountTransactions } from "../../utils/API/transactions";

test.describe("find transaction tests", () => {
  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test("should find transaction by id", async ({ page }) => {
    const userData: UserData = await getUserData(
      page,
      mockUser.username,
      mockUser.password
    );
    const initialAccount: AccountData = await getInitialAccount(
      page,
      userData.id
    );

    await createAccount(page, userData.id, 0, initialAccount.id);

    const transactions: TransactionsData[] = await getAccountTransactions(
      page,
      initialAccount.id
    );

    const transaction = transactions[0];

    page.route(
      "/parabank/services_proxy/bank/accounts/**/transactions/**",
      async (route) => {
        await route.abort();
        // const headers = {
        //   accept: "application/json",
        // };
        // const newApiUrl = `http://localhost:8080/parabank/services/bank/transactions/${transaction.id}`;
        // const transactionData = {
        //   id: userData.id,
        //   accountId: 99999,
        //   type: "Debit",
        //   date: 1732060800000,
        //   amount: 100,
        //   description: "Funds Transfer Sent",
        // };
        // const response = await page.evaluate(async (url) => {
        //   const res = await fetch(url, {
        //     headers: {
        //       accept: "application/json",
        //     },
        //   });
        //   return await res.json();
        // }, newApiUrl);

        // await route.continue({
        //   headers,
        //   url: `http://localhost:8080/parabank/services/bank/transactions/${transaction.id}`,
        // });
        // console.log(response);
        // await route.fulfill({ headers, json: response });
      }
    );
    // const transactionPromise = page.waitForResponse(
    //   `http://localhost:8080/parabank/services/bank/transactions/${transaction.id}`
    // );
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/findtrans.htm");
    await page.locator("#transactionId").fill(transaction.id.toString());
    await page.request.get(
      `http://localhost:8080/parabank/services/bank/transactions/${transaction.id}`
    );
    await page.locator("#findById").click();
    // const transResponse = await transactionPromise;
    // const transData: TransactionsData = await transResponse.json();

    await page.pause();
    await page.pause();
  });

  //   test("should find transaction by date", async ({ page }) => {});

  //   test("should find transaction by date range", async ({ page }) => {});

  //   test("should find transaction by amount", async ({ page }) => {});

  //   test("should have form validation errors", async ({ page }) => {});
});
