import { Page } from "playwright";

export const buyPosition = async (
  page: Page,
  customerId: number,
  accountId: number,
  name: string,
  symbol: string,
  shares: number,
  pricePerShare: number
) => {
  await page.request.post(
    `https://parabank.parasoft.com/parabank/services/bank/customers/${customerId}/buyPosition?accountId=${accountId}&name=${name}&symbol=${symbol}&shares=${shares}&pricePerShare=${pricePerShare}`
  );
};

export const getPositionById = async (
  page: Page,
  customerId: number,
  accountId: number,
  name: string,
  symbol: string,
  shares: number,
  pricePerShare: number
) => {
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/customers/${customerId}/buyPosition?accountId=${accountId}&name=${name}&symbol=${symbol}&shares=${shares}&pricePerShare=${pricePerShare}`
  );
  return await response.json();
};

export const getPositionHistory = async (
  page: Page,
  positionId: number,
  startDate: string,
  endDate: string
) => {
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/positions/${positionId}/${startDate}/${endDate}`
  );
  return await response.json();
};

export const getCustomerPositions = async (page: Page, customerId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/customers/${customerId}/positions`,
    { headers }
  );
  return await response.json();
};

export const sellPosition = async (
  page: Page,
  customerId: number,
  accountId: number,
  positionId: number,
  shares: number,
  pricePerShare: number
) => {
  await page.request.post(
    `https://parabank.parasoft.com/parabank/services/bank/customers/${customerId}/sellPosition?accountId=${accountId}&positionId=${positionId}&shares=${shares}&pricePerShare=${pricePerShare}`
  );
};
