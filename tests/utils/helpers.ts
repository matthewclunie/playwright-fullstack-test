//Create utility functions in the /utils directory for common actions (e.g., logging in, filling forms).
//This keeps your tests DRY (Don't Repeat Yourself).

//Helpers are usually focused on performing actions, such as filling out forms,
//clicking buttons, or navigating through the UI.

import { Page } from "playwright";
import { expect } from "playwright/test";

export const login = async (page: Page, userName: string, password: string) => {
  await page.goto("https://parabank.parasoft.com/parabank/index.htm");
  await page.fill('[name="username"]', userName);
  await page.fill('[name="password"]', password);
  await page.getByRole("button", { name: "Log In" }).click();
};

export const logout = async (page: Page) => {
  await page.locator('[href="logout.htm"]').click();
};

export const checkHeader = async (
  page: Page,
  title: string,
  caption: string
) => {
  await expect(page.locator(".title")).toHaveText(title);
  await expect(page.locator("#rightPanel").locator("p").first()).toHaveText(
    caption
  );
};

export const cleanDB = async (page: Page) => {
  await page.request.post(
    "https://parabank.parasoft.com/parabank/services/bank/cleanDB"
  );
};

// export const clearUsers = async (page: Page) => {
//   await page.goto("/parabank/admin.htm");
//   await page.locator('[value="CLEAN"]').click();
// };

export const checkColor = async (
  page: Page,
  selector: string,
  expectedColor: string
) => {
  const textLocator = page.locator(selector);

  const color = await textLocator.evaluate((element) => {
    return window.getComputedStyle(element).color;
  });
  expect(color).toBe(expectedColor);
};

export const getUserData = async (
  page: Page,
  username: string,
  password: string
) => {
  const headers = {
    Accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/login/${username}/${password}`,
    { headers }
  );
  return await response.json();
};

// export const getOverviewData = async (page: Page, userId: number) => {
//   const response = await page.request.get(
//     `https://parabank.parasoft.com/parabank/services_proxy/bank/customers/${userId}/accounts`
//   );
//   return await response.json();
// };
