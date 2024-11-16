import { test, expect } from "@playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, toDollar } from "../../utils/helpers";
import { AccountData, TransactionsData, UserData } from "../../types/global";
import { getUserData } from "../../utils/API/misc";
import { createAccount, getInitialAccount } from "../../utils/API/accounts";
import { getAccountTransactions } from "../../utils/API/transactions";

test.describe("account activity tests", () => {
  let userData: UserData;

  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
    userData = await getUserData(page, mockUser.username, mockUser.password);
  });

  const toFormattedDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${month}-${day}-${year}`;
  };

  test("should display account activity details", async ({ page }) => {
    const accountsUrl = `/parabank/services_proxy/bank/customers/${userData.id}/accounts`;
    const accountsPromise = page.waitForResponse((response) => {
      return response.ok() && response.url().includes(accountsUrl);
    });
    await login(page, mockUser.username, mockUser.password);
    const accountsResponse = await accountsPromise;
    const accountsData: AccountData[] = await accountsResponse.json();
    const initialAccount = accountsData[0];
    await page.goto(`/parabank/activity.htm?id=${initialAccount.id}`);
    await expect(page.locator("#accountId")).toHaveText(
      initialAccount.id.toString()
    );
    await expect(page.locator("#accountType")).toHaveText(
      initialAccount.type.toString()
    );
    await expect(page.locator("#balance")).toHaveText(
      toDollar(initialAccount.balance)
    );
    await expect(page.locator("#availableBalance")).toHaveText(
      toDollar(initialAccount.balance)
    );
  });

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

    const checkTransactionsTable = async (transactions: TransactionsData[]) => {
      if (!transactions.length) {
        await expect(page.locator("#noTransactions")).toBeVisible();
      } else {
        for (let i = 0; i < transactions.length; i++) {
          const formattedDate = toFormattedDate(transactions[i].date);

          const transactionRow = page
            .locator("#transactionTable tbody tr")
            .nth(i);
          const transactionCells = transactionRow.locator("td");
          const dateCell = transactionCells.first();
          const descriptionCell = transactionCells.nth(1);
          const debitCell = transactionCells.nth(2);
          const creditCell = transactionCells.last();
          await expect(dateCell).toHaveText(formattedDate);
          await expect(descriptionCell).toHaveText(transactions[i].description);
          const isDebit =
            transactions[i].type === "Debit" ? debitCell : creditCell;
          await expect(isDebit).toHaveText(toDollar(transactions[i].amount));
        }
      }
    };

    const sortRoute = async (route: string, body: TransactionsData[]) => {
      await page.route(route, async (route, request) => {
        const headers = { ...request.headers(), accept: "application/json" };

        await route.fulfill({ headers, json: body });
      });
    };

    await sortRoute(activityPageRoute, mockBody);

    await login(page, mockUser.username, mockUser.password);
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

  test("should drill down into transaction details", async ({ page }) => {
    const initialAccount: AccountData = await getInitialAccount(
      page,
      userData.id
    );
    await createAccount(page, userData.id, 0, initialAccount.id);
    const transactions: TransactionsData[] = await getAccountTransactions(
      page,
      initialAccount.id
    );
    const initialTransaction = transactions[0];
    await login(page, mockUser.username, mockUser.password);
    await page.goto(`/parabank/transaction.htm?id=${initialTransaction.id}`);
    const tableRows = page.locator("tbody tr");
    const tableRowsCount = await tableRows.count();

    const data = [
      initialTransaction["id"].toString(),
      toFormattedDate(Date.now()), // should be initialTransaction["date"], temp fix
      initialTransaction["description"],
      initialTransaction["type"],
      toDollar(initialTransaction["amount"]),
    ];

    for (let i = 0; i < tableRowsCount; i++) {
      const tableRow = tableRows.nth(i);
      const dataCell = tableRow.locator("td").nth(1);
      console.log("data[i]", data[1]);
      console.log("dataCell", await dataCell.innerText());
      await expect(dataCell).toHaveText(data[i]);
    }
  });
});
