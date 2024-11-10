import { Page } from "playwright";

export const getTransaction = async (page: Page, transactionId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/transactions/${transactionId}`,
    { headers }
  );
  return await response.json();
};

export const getAccountTransactions = async (page: Page, accountId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/accounts/${accountId}/transactions`,
    { headers }
  );
  return await response.json();
};

export const createAccountTransactions = async (
  page: Page,
  accountId: number,
  amount: number
) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/accounts/${accountId}/transactions/amount/${amount}`,
    { headers }
  );
  return await response.json();
};

export const getTransactionsByMonth = async (
  page: Page,
  accountId: number,
  month: string,
  type: "CREDIT" | "DEBIT"
) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/accounts/${accountId}/transactions/month/${month}/type/${type}`,
    { headers }
  );
  return await response.json();
};

export const getTransactionsByDateRange = async (
  page: Page,
  accountId: number,
  fromDate: string,
  toDate: string
) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/accounts/${accountId}/transactions/${fromDate}/hgf/toDate/${toDate}`,
    { headers }
  );
  return await response.json();
};

export const getTransactionsByDate = async (
  page: Page,
  accountId: number,
  onDate: string
) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/accounts/${accountId}/transactions/onDate/${onDate}`,
    { headers }
  );
  return await response.json();
};
