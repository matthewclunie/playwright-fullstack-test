import { Page } from "playwright";

export const cleanDB = async (page: Page) => {
  await page.request.post("/parabank/services/bank/cleanDB");
};

export const initializeDB = async (page: Page) => {
  await page.request.post("/parabank/services/bank/initializeDB");
};
