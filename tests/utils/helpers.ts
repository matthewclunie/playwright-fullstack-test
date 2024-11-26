import { Page } from "playwright";
import { expect } from "playwright/test";
import { baseURL } from "../../playwright.config";

interface Params {
  [args: string]: string | number;
}

export const login = async (page: Page, userName: string, password: string) => {
  await page.goto("/parabank/index.htm");
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

export const toDollar = (amount: number) => {
  return "$" + amount.toFixed(2);
};

export const toFormattedDate = (timestamp: number) => {
  const date = new Date(timestamp);
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();

  return `${month}-${day}-${year}`;
};

export const getURL = (route: string, paramArgs: Params) => {
  const url = new URL(route, baseURL);
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(paramArgs)) {
    console.log(key, value);
    params.append(key, value.toString());
  }
  return url.toString();
};
