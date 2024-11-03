//Create utility functions in the /utils directory for common actions (e.g., logging in, filling forms).
//This keeps your tests DRY (Don't Repeat Yourself).

//Helpers are usually focused on performing actions, such as filling out forms,
//clicking buttons, or navigating through the UI.

import { Page } from "playwright";
import { mockUser } from "../fixtures/mockData";
import { expect } from "playwright/test";

export const login = async (page: Page) => {
  await page.fill('[name="username"]', mockUser.username);
  await page.fill('[name="password"]', mockUser.password);
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

export const clearUsers = async (page: Page) => {
  await page.goto("/parabank/admin.htm");
  await page.locator('[value="CLEAN"]').click();
  await page.goto("/parabank/index.htm");
};

export const checkColor = async (
  page: Page,
  selector: string,
  expectedColor: string
) => {
  const color = await page.evaluate(async (selector) => {
    const element = document.querySelector(selector);
    if (element) {
      return window.getComputedStyle(element).color;
    }
  }, selector);
  expect(color).toBe(expectedColor);
};
