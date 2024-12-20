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
    `/parabank/services/bank/login/${username}/${password}`,
    { headers }
  );
  return await response.json();
};

export const setParameters = async (
  page: Page,
  param: string,
  paramValue: string
) => {
  const headers = {
    accept: "application/json",
  };
  await page.request.post(
    `/parabank/services/bank/setParameter/${param}/${paramValue}`,
    { headers }
  );
};
