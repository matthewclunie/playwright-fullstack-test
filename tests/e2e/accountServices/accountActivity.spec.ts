import { expect, test } from "@playwright/test";
import { createUser, generateLoginInfo } from "../../fixtures/mockData";
import { AccountData, TransactionData, UserData } from "../../types/global";
import { getInitialAccount } from "../../utils/API/accounts";
import { getUserData } from "../../utils/API/misc";
import {
  checkHeader,
  login,
  toDollar,
  toFormattedDate,
} from "../../utils/helpers";

const loginInfo = generateLoginInfo();

test.describe("account activity tests", () => {
  let userData: UserData;

  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await createUser(page, loginInfo.username, loginInfo.password);
    userData = await getUserData(page, loginInfo.username, loginInfo.password);
  });

  // test("should display account activity details", async ({ page }) => {
  //   const accountsUrl = `/parabank/services_proxy/bank/customers/*/accounts`;
  //   const accountsPromise = page.waitForResponse((response) => {
  //     return response.ok() && response.url().includes(accountsUrl);
  //   });
  //   await login(page, loginInfo.username, loginInfo.password);
  //   await page.waitForURL("");

  //   const accountsResponse = await accountsPromise;
  //   expect(accountsResponse.ok()).toBe(true);
  //   const accountsData: AccountData[] = await accountsResponse.json();
  //   const initialAccount = accountsData[0];
  //   await page.goto(`/parabank/activity.htm?id=${initialAccount.id}`);
  //   await expect(page.locator("#accountId")).toHaveText(
  //     initialAccount.id.toString()
  //   );
  //   await expect(page.locator("#accountType")).toHaveText(
  //     initialAccount.type.toString()
  //   );
  //   await expect(page.locator("#balance")).toHaveText(
  //     toDollar(initialAccount.balance)
  //   );
  //   await expect(page.locator("#availableBalance")).toHaveText(
  //     toDollar(initialAccount.balance)
  //   );
  // });

  test("should sort by activity period", async ({ page }) => {
    const initialAccount: AccountData = await getInitialAccount(
      page,
      userData.id
    );
    const activityPageRoute = `/parabank/services_proxy/bank/accounts/${initialAccount.id}/transactions/month/All/type/All`;

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
        amount: 200,
        description: "Funds Transfer Sent",
      },
      {
        id: 99999,
        accountId: initialAccount.id,
        type: "Credit",
        date: Date.parse("27 September 2022 12:00:00 GMT"),
        amount: 300,
        description: "Funds Transfer Sent",
      },
    ];

    const checkTransactionsTable = async (transactions: TransactionData[]) => {
      if (!transactions.length) {
        await expect(page.locator("#noTransactions")).toBeVisible();
      } else {
        for (let i = 0; i < transactions.length; i++) {
          const { date, description, type, amount } = transactions[i];
          const formattedDate = toFormattedDate(date);

          const transactionRow = page
            .locator("#transactionTable tbody tr")
            .nth(i);
          const transactionCells = transactionRow.locator("td");
          const dateCell = transactionCells.first();
          const descriptionCell = transactionCells.nth(1);
          const debitCell = transactionCells.nth(2);
          const creditCell = transactionCells.last();

          await expect(dateCell).toHaveText(formattedDate);
          await expect(descriptionCell).toHaveText(description);
          await expect(type === "Debit" ? debitCell : creditCell).toHaveText(
            toDollar(amount)
          );
          await expect(type === "Debit" ? creditCell : debitCell).toBeEmpty();
        }
      }
    };

    const sortRoute = async (route: string, body: TransactionData[]) => {
      await page.route(route, async (route, request) => {
        const headers = { ...request.headers(), accept: "application/json" };

        await route.fulfill({ headers, json: body });
      });
    };

    await sortRoute(activityPageRoute, mockBody);

    await login(page, loginInfo.username, loginInfo.password);
    await page.goto(`/parabank/activity.htm?id=${initialAccount.id}`);

    await checkTransactionsTable(mockBody);

    //Check sort
    const mockDebit = mockBody.filter((transaction) => {
      return transaction.type === "Debit";
    });

    const mockCredit = mockBody.filter((transaction) => {
      return transaction.type === "Credit";
    });

    const mockDecFilter = mockBody.filter((transaction) => {
      const date = new Date(transaction.date).toDateString();
      return date.includes("Dec");
    });

    const debitSortRoute = `/parabank/services_proxy/bank/accounts/${initialAccount.id}/transactions/month/All/type/Debit`;
    const creditSortRoute = `/parabank/services_proxy/bank/accounts/${initialAccount.id}/transactions/month/All/type/Credit`;
    const decemberRoute = `/parabank/services_proxy/bank/accounts/${initialAccount.id}/transactions/month/December/type/All`;

    await sortRoute(debitSortRoute, mockDebit);
    await sortRoute(creditSortRoute, mockCredit);
    await sortRoute(decemberRoute, mockDecFilter);

    await page.locator("#transactionType").selectOption("Debit");
    await page.getByRole("button", { name: "Go" }).click();

    await checkTransactionsTable(mockDebit);

    await page.locator("#transactionType").selectOption("Credit");
    await page.getByRole("button", { name: "Go" }).click();

    await checkTransactionsTable(mockCredit);

    await page.locator("#transactionType").selectOption("All");
    await page.locator("#month").selectOption("December");
    await page.getByRole("button", { name: "Go" }).click();

    await checkTransactionsTable(mockDecFilter);

    await page.locator("#month").selectOption("May");
    await page.getByRole("button", { name: "Go" }).click();
    await checkTransactionsTable([]);
  });

  test("should return error on drilldown to nonexistent acocunt id", async ({
    page,
  }) => {
    const badId = 9999988;
    const headerText = {
      title: "Error!",
      caption: "Could not find account # 9999988",
    };
    await login(page, loginInfo.username, loginInfo.password);
    await page.goto(`/parabank/activity.htm?id=${badId}`);
    await checkHeader(page, headerText.title, headerText.caption);
  });

  // test("should drill down into transaction details", async ({ page }) => {
  //   const initialAccount: AccountData = await getInitialAccount(
  //     page,
  //     userData.id
  //   );
  //   await createAccount(page, userData.id, 0, initialAccount.id);
  //   const transactions: TransactionData[] = await getAccountTransactions(
  //     page,
  //     initialAccount.id
  //   );
  //   const initialTransaction = transactions[0];
  //   await login(page, loginInfo.username, loginInfo.password);
  //   await page.goto(`/parabank/transaction.htm?id=${initialTransaction.id}`);
  //   const tableRows = page.locator("tbody tr");
  //   const tableRowsCount = await tableRows.count();

  //   const data = [
  //     initialTransaction["id"].toString(),
  //     toFormattedDate(Date.now()), // should be initialTransaction["date"], temp fix
  //     initialTransaction["description"],
  //     initialTransaction["type"],
  //     toDollar(initialTransaction["amount"]),
  //   ];

  //   for (let i = 0; i < tableRowsCount; i++) {
  //     const tableRow = tableRows.nth(i);
  //     const dataCell = tableRow.locator("td").nth(1);
  //     await expect(dataCell).toHaveText(data[i]);
  //   }
  // });
});
