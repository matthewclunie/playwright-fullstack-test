import { Page } from "playwright";
import { getURL } from "../helpers";

export const requestLoan = async (
  page: Page,
  customerId: number,
  amount: number,
  downPayment: number,
  fromAccountId: number
) => {
  const url = getURL("/parabank/services/bank/requestLoan", {
    customerId,
    amount,
    downPayment,
    fromAccountId,
  });
  await page.request.post(url);
};
