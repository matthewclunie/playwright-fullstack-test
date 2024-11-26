import { Page } from "playwright";
import { getURL } from "../helpers";

export const buyPosition = async (
  page: Page,
  customerId: number,
  accountId: number,
  name: string,
  symbol: string,
  shares: number,
  pricePerShare: number
) => {
  const url = getURL(
    `/parabank/services/bank/customers/${customerId}/buyPosition`,
    {
      accountId,
      name,
      symbol,
      shares,
      pricePerShare,
    }
  );
  await page.request.post(url);
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
  const headers = {
    accept: "application/json",
  };
  const url = getURL(
    `/parabank/services/bank/customers/${customerId}/buyPosition`,
    {
      accountId,
      name,
      symbol,
      shares,
      pricePerShare,
    }
  );
  const response = await page.request.get(url, { headers });
  return await response.json();
};

export const getPositionHistory = async (
  page: Page,
  positionId: number,
  startDate: string,
  endDate: string
) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `/parabank/services/bank/positions/${positionId}/${startDate}/${endDate}`,
    { headers }
  );
  return await response.json();
};

export const getCustomerPositions = async (page: Page, customerId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `/parabank/services/bank/customers/${customerId}/positions`,
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
  const url = getURL(
    `/parabank/services/bank/customers/${customerId}/sellPosition`,
    {
      accountId,
      positionId,
      shares,
      pricePerShare,
    }
  );
  await page.request.post(url);
};
