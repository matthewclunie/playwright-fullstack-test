import { Page } from "playwright";

export const requestLoan = async (
  page: Page,
  customerId: number,
  amount: number,
  downPayment: number,
  fromAccountId: number
) => {
  await page.request.post(
    `https://parabank.parasoft.com/parabank/services/bank/requestLoan?customerId=${customerId}&amount=${amount}&downPayment=${downPayment}&fromAccountId=${fromAccountId}`
  );
};
