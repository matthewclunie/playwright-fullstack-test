import { Page } from "playwright";

export const shutdownJMS = async (page: Page) => {
  await page.request.post("/parabank/services/bank/shutdownJmsListener");
};

export const startupJMS = async (page: Page) => {
  await page.request.post("/parabank/services/bank/startupJmsListener");
};
