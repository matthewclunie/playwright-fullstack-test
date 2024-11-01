//Create utility functions in the /utils directory for common actions (e.g., logging in, filling forms).
//This keeps your tests DRY (Don't Repeat Yourself).

//Helpers are usually focused on performing actions, such as filling out forms,
//clicking buttons, or navigating through the UI.

import { Page } from "playwright";
import { mockUser } from "../fixtures/mockData";

export const login = async (page: Page) => {
  await page.fill('[name="username"]', mockUser.username);
  await page.fill('[name="password"]', mockUser.password);
};

export const logout = async (page: Page) => {
  await page.locator('[href="logout.htm"]').click();
};
