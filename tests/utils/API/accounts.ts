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

export const getAccountById = async (page: Page, accountId: number) => {
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
};
