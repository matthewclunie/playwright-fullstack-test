import { Page } from "playwright";

export const cleanDB = async (page: Page) => {
  await page.request.post(
    "https://parabank.parasoft.com/parabank/services/bank/cleanDB"
  );
};

export const initializeDB = async (page: Page) => {
  await page.request.post(
    "https://parabank.parasoft.com/parabank/services/bank/initializeDB"
  );
};
