import { Page } from "playwright";

export const shutdownJMS = async (page: Page) => {
  await page.request.post(
    "https://parabank.parasoft.com/parabank/services/bank/shutdownJmsListener"
  );
};

export const startupJMS = async (page: Page) => {
  await page.request.post(
    "https://parabank.parasoft.com/parabank/services/bank/startupJmsListener"
  );
};
