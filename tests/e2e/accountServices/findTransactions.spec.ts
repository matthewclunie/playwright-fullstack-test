import { test, expect } from "@playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, toDollar, toFormattedDate } from "../../utils/helpers";
import { TransactionData } from "../../types/global";

test.describe("find transaction tests", () => {
  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  // test("should find transaction by id", async ({ page }) => {
  //   const userData: UserData = await getUserData(
  //     page,
  //     mockUser.username,
  //     mockUser.password
  //   );
  //   const initialAccount: AccountData = await getInitialAccount(
  //     page,
  //     userData.id
  //   );

  //   await createAccount(page, userData.id, 0, initialAccount.id);

  //   const transactions: TransactionData[] = await getAccountTransactions(
  //     page,
  //     initialAccount.id
  //   );

  //   const transaction = transactions[0];

  //   page.route(
  //     "/parabank/services_proxy/bank/accounts/**/transactions/**",
  //     async (route) => {
  //       await route.abort();
  //       // const headers = {
  //       //   accept: "application/json",
  //       // };
  //       // const newApiUrl = `http://localhost:8080/parabank/services/bank/transactions/${transaction.id}`;
  //       // const transactionData = {
  //       //   id: userData.id,
  //       //   accountId: 99999,
  //       //   type: "Debit",
  //       //   date: 1732060800000,
  //       //   amount: 100,
  //       //   description: "Funds Transfer Sent",
  //       // };
  //       // const response = await page.evaluate(async (url) => {
  //       //   const res = await fetch(url, {
  //       //     headers: {
  //       //       accept: "application/json",
  //       //     },
  //       //   });
  //       //   return await res.json();
  //       // }, newApiUrl);

  //       // await route.continue({
  //       //   headers,
  //       //   url: `http://localhost:8080/parabank/services/bank/transactions/${transaction.id}`,
  //       // });
  //       // console.log(response);
  //       // await route.fulfill({ headers, json: response });
  //     }
  //   );
  //   // const transactionPromise = page.waitForResponse(
  //   //   `http://localhost:8080/parabank/services/bank/transactions/${transaction.id}`
  //   // );
  //   await login(page, mockUser.username, mockUser.password);
  //   await page.goto("/parabank/findtrans.htm");
  //   await page.fill("#transactionId", transaction.id.toString());
  //   await page.evaluate(async (url) => {
  //     const res = await fetch(url, {
  //       headers: {
  //         accept: "application/json",
  //       },
  //     });
  //     return await res.json();
  //   }, `http://localhost:8080/parabank/services/bank/transactions/${transaction.id}`);
  //   await page.locator("#findById").click();
  //   // const transResponse = await transactionPromise;
  //   // const transactionData: TransactionData = await transResponse.json();

  //   await page.pause();
  //   await page.pause();
  // });

  test("should find transaction by date", async ({ page }) => {
    const transactionData: TransactionData[] = [
      {
        id: 88888,
        accountId: 12345,
        type: "Credit",
        amount: 500,
        date: Date.now(),
        description: "Funds Transfer Received",
      },
      {
        id: 99999,
        accountId: 12345,
        type: "Credit",
        amount: 500,
        date: Date.now(),
        description: "Funds Transfer Received",
      },
    ];
    await login(page, mockUser.username, mockUser.password);
    page.route(
      "/parabank/services_proxy/bank/accounts/**/transactions/onDate/**",
      async (route, request) => {
        const headers = {
          ...request.headers(),
          accept: "application/json",
        };
        await route.fulfill({ headers, json: transactionData });
      }
    );
    await page.goto("/parabank/findtrans.htm");
    await page.fill("#transactionDate", toFormattedDate(Date.now()));
    await page.locator("#findByDate").click();
    const transactionRows = page.locator("#transactionBody tr");
    const transactionRowCount = await transactionRows.count();

    for (let i = 0; i < transactionRowCount; i++) {
      const transactionRow = transactionRows.nth(i);
      const dateCell = transactionRow.locator("td").first();
      const descCell = transactionRow.locator("td").nth(1);
      const debitCell = transactionRow.locator("td").nth(2);
      const creditCell = transactionRow.locator("td").last();
      const { date, description, type, amount } = transactionData[i];

      await expect(dateCell).toHaveText(toFormattedDate(date));
      await expect(descCell).toHaveText(description);
      await expect(type === "Debit" ? debitCell : creditCell).toHaveText(
        toDollar(amount)
      );
      await expect(type === "Debit" ? creditCell : debitCell).toBeEmpty();
    }
  });

  test("should find transaction by date range", async ({ page }) => {
    const transactionData = [
      {
        id: 77777,
        accountId: 12345,
        type: "Credit",
        amount: 300,
        date: Date.parse("October 15, 2024"),
        description: "Funds Transfer Received",
      },
      {
        id: 88888,
        accountId: 12345,
        type: "Credit",
        amount: 400,
        date: Date.parse("October 16, 2024"),
        description: "Funds Transfer Received",
      },
    ];
    page.route(
      "/parabank/services_proxy/bank/accounts/**/transactions/fromDate/**/toDate/**",
      async (route, request) => {
        const headers = {
          ...request.headers(),
          accept: "application/json",
        };
        await route.fulfill({ headers, json: transactionData });
      }
    );
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/findtrans.htm");
    await page.fill("#fromDate", "10-01-2024");
    await page.fill("#toDate", "10-31-2024");
    await page.locator("#findByDateRange").click();
    const transactionRows = page.locator("#transactionBody tr");
    const transactionRowCount = await transactionRows.count();

    for (let i = 0; i < transactionRowCount; i++) {
      const transactionRow = transactionRows.nth(i);
      const dateCell = transactionRow.locator("td").first();
      const descCell = transactionRow.locator("td").nth(1);
      const debitCell = transactionRow.locator("td").nth(2);
      const creditCell = transactionRow.locator("td").last();
      const { date, description, type, amount } = transactionData[i];

      await expect(dateCell).toHaveText(toFormattedDate(date));
      await expect(descCell).toHaveText(description);
      await expect(type === "Debit" ? debitCell : creditCell).toHaveText(
        toDollar(amount)
      );
      await expect(type === "Debit" ? creditCell : debitCell).toBeEmpty();
    }
  });

  test("should find transaction by amount", async ({ page }) => {
    const transactionData = [
      {
        id: 77777,
        accountId: 12345,
        type: "Credit",
        amount: 400,
        date: Date.now(),
        description: "Funds Transfer Received",
      },
      {
        id: 88888,
        accountId: 12345,
        type: "Credit",
        amount: 400,
        date: Date.now(),
        description: "Funds Transfer Received",
      },
    ];
    page.route(
      "/parabank/services_proxy/bank/accounts/**/transactions/amount/**",
      async (route, request) => {
        const headers = {
          ...request.headers(),
          accept: "application/json",
        };
        await route.fulfill({ headers, json: transactionData });
      }
    );
    await login(page, mockUser.username, mockUser.password);
    await page.goto("https://parabank.parasoft.com/parabank/findtrans.htm");
    await page.fill("#amount", "400");
    await page.locator("#findByAmount").click();
    const transactionRows = page.locator("#transactionBody tr");
    const transactionRowCount = await transactionRows.count();

    for (let i = 0; i < transactionRowCount; i++) {
      const transactionRow = transactionRows.nth(i);
      const dateCell = transactionRow.locator("td").first();
      const descCell = transactionRow.locator("td").nth(1);
      const debitCell = transactionRow.locator("td").nth(2);
      const creditCell = transactionRow.locator("td").last();
      const { date, description, type, amount } = transactionData[i];

      await expect(dateCell).toHaveText(toFormattedDate(date));
      await expect(descCell).toHaveText(description);
      await expect(type === "Debit" ? debitCell : creditCell).toHaveText(
        toDollar(amount)
      );
      await expect(type === "Debit" ? creditCell : debitCell).toBeEmpty();
    }
  });

  test("should have form validation errors", async ({ page }) => {
    const transactionSearches = [
      {
        button: page.locator("#findById"),
        errorLocator: page.locator("#transactionIdError"),
        errorText: "Invalid transaction ID",
      },
      {
        button: page.locator("#findByDate"),
        errorLocator: page.locator("#transactionDateError"),
        errorText: "Invalid date format",
      },
      {
        button: page.locator("#findByDateRange"),
        errorLocator: page.locator("#dateRangeError"),
        errorText: "Invalid date format",
      },
      {
        button: page.locator("#findByAmount"),
        errorLocator: page.locator("#amountError"),
        errorText: "Invalid amount",
      },
    ];
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/findtrans.htm");

    for (const { button, errorLocator, errorText } of transactionSearches) {
      await button.click();
      await expect(errorLocator).toHaveText(errorText);
    }
  });
});
