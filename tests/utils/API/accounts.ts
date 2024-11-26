import { Page } from "playwright";
import { AccountData } from "../../types/global";
import { getURL } from "../helpers";

export const billPay = async (
  page: Page,
  accountId: number,
  amount: number
) => {
  const headers = {
    accept: "application/json",
  };

  const url = getURL("/parabank/services/bank/billpay", {
    accountId,
    amount,
  });

  await page.request.post(url, { headers });
};

export const createAccount = async (
  page: Page,
  customerId: number,
  newAccountType: 0 | 1 | 2,
  fromAccountId: number
) => {
  const headers = {
    accept: "application/json",
  };
  const url = getURL("/parabank/services/bank/createAccount", {
    customerId,
    newAccountType,
    fromAccountId,
  });
  const otherURL = `/parabank/services/bank/createAccount?customerId=${customerId}&newAccountType=${newAccountType}&fromAccountId=${fromAccountId}`;
  const response = await page.request.post(otherURL, { headers });
  console.log(await response.text());

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
  const url = getURL("/parabank/services/bank/deposit", {
    accountId,
    amount,
  });
  await page.request.post(url, { headers });
};

export const getAccountById = async (page: Page, accountId: number) => {
  const headers = {
    accept: "application/json",
  };

  const response = await page.request.get(
    `/parabank/services_proxy/bank/accounts/${accountId}`,
    { headers }
  );
  return await response.json();
};

export const getCustomerAccounts = async (page: Page, customerId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `/parabank/services/bank/customers/${customerId}/accounts`,
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
  const url = getURL("/parabank/services/bank/transfer", {
    fromAccountId,
    toAccountId,
    amount,
  });
  await page.request.post(url, { headers });
};

export const withdrawFunds = async (
  page: Page,
  accountId: number,
  amount: number
) => {
  const headers = {
    accept: "application/json",
  };
  const url = getURL("/parabank/services/bank/withdraw", {
    accountId,
    amount,
  });
  await page.request.post(url, { headers });
};

export const getInitialAccount = async (page: Page, customerId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `/parabank/services/bank/customers/${customerId}/accounts`,
    { headers }
  );
  const accountsData: AccountData[] = await response.json();
  return accountsData[0];
};
