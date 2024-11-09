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

export const setDataAccessMode = async (
  page: Page,
  type: "SOAP" | "XML" | "JSON" | "JDBC"
) => {
  await page.goto("/parabank/admin.htm");
  let identifier: string;

  switch (true) {
    case type === "SOAP":
      identifier = "#accessMode1";
      break;
    case type === "XML":
      identifier = "#accessMode2";
      break;
    case type === "JSON":
      identifier = "#accessMode3";
      break;
    case type === "JDBC":
      identifier = "#accessMode4";
      break;
    default:
      identifier = "#accessMode3";
  }

  await page.locator(identifier).click();
  await page.getByRole("button", { name: "Submit" }).click();
};
