import { Page } from "playwright";

export const billPay = async (
  page: Page,
  accountId: number,
  amount: number
) => {
  const headers = {
    accept: "application/json",
  };
  await page.request.post(
    `https://parabank.parasoft.com/parabank/services/bank/billpay?accountId=${accountId}&amount=${amount}`,
    { headers }
  );
};

export const createAccount = async (
  page: Page,
  customerId: number,
  accountType: 0 | 1 | 2,
  accountId: number
) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.post(
    `https://parabank.parasoft.com/parabank/services/bank/createAccount?customerId=${customerId}&newAccountType=${accountType}&fromAccountId=${accountId}`,
    { headers }
  );

  return await response.json();
};

export const depositFunds = async (
  page: Page,
  accountId: number,
  amount: number
) => {
  const headers = {
    accept: "application/json",
  };
  await page.request.post(
    `https://parabank.parasoft.com/parabank/services/bank/deposit?accountId=${accountId}&amount=${amount}`,
    { headers }
  );
};

export const getSingleAccount = async (page: Page, accountId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services_proxy/bank/accounts/${accountId}`,
    { headers }
  );
  return await response.json();
};

export const getCustomerAccounts = async (page: Page, customerId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/customers/${customerId}/accounts`,
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

export const transferFunds = async (
  page: Page,
  fromAccountId: number,
  toAccountId: number,
  amount: number
) => {
  const headers = {
    accept: "application/json",
  };
  await page.request.post(
    `https://parabank.parasoft.com/parabank/services/bank/transfer?fromAccountId=${fromAccountId}&toAccountId=${toAccountId}&amount=${amount}`,
    { headers }
  );
  //   return await response.json();
};

export const withdrawFunds = async (
  page: Page,
  accountId: number,
  amount: number
) => {
  const headers = {
    accept: "application/json",
  };
  await page.request.post(
    `https://parabank.parasoft.com/parabank/services/bank/withdraw?accountId=${accountId}&amount=${amount}`,
    { headers }
  );
  //   return await response.json();
};
