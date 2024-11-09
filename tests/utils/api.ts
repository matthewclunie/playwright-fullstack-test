import { Page } from "playwright";

export const getUserData = async (
  page: Page,
  username: string,
  password: string
) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/login/${username}/${password}`,
    { headers }
  );
  return await response.json();
};

export const getSingleAccountData = async (page: Page, accountId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services_proxy/bank/accounts/${accountId}`,
    { headers }
  );

  return await response.json();
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
