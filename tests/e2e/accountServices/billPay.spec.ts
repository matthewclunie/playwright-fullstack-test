import { expect, test } from "../../fixtures/fixtures";
import {
  createUser,
  generateLoginInfo,
  mockPayee,
} from "../../fixtures/mockData";
import { TransactionData } from "../../types/global";
import { getAccountTransactions } from "../../utils/API/transactions";
import { toDollar } from "../../utils/helpers";

test.describe("bill payment tests", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/parabank/billpay.htm");
  });

  interface PaymentData {
    accountId: number;
    amount: number;
    payeeName: string;
  }

  test("should submit bill payment", async ({ page }) => {
    const paymentAmount = "50";

    const formRows = [
      { selector: '[name="payee.name"]', info: mockPayee.name },
      { selector: '[name="payee.address.street"]', info: mockPayee.street },
      { selector: '[name="payee.address.city"]', info: mockPayee.city },
      { selector: '[name="payee.address.state"]', info: mockPayee.state },
      { selector: '[name="payee.address.zipCode"]', info: mockPayee.zipCode },
      { selector: '[name="payee.phoneNumber"]', info: mockPayee.phoneNumber },
      {
        selector: '[name="payee.accountNumber"]',
        info: mockPayee.accountNumber,
      },
      { selector: '[name="verifyAccount"]', info: mockPayee.accountNumber },
      { selector: '[name="amount"]', info: paymentAmount },
    ];

    //Fill out form, submit bill payment
    for (const { selector, info } of formRows) {
      await page.fill(selector, info);
    }

    const fromAccountId = await page
      .locator('[name="fromAccountId"]')
      .innerText();
    const paymentPromise = page.waitForResponse(
      `/parabank/services_proxy/bank/billpay?accountId=${fromAccountId}&amount=${paymentAmount}`
    );
    await page.getByRole("button", { name: "Send Payment" }).click();
    const paymentResponse = await paymentPromise;
    expect(paymentResponse.ok()).toBe(true);
    const paymentData: PaymentData = await paymentResponse.json();

    //Check for successful post
    expect(paymentData).toHaveProperty("accountId", Number(fromAccountId));
    expect(paymentData).toHaveProperty("amount", Number(paymentAmount));
    expect(paymentData).toHaveProperty("payeeName", mockPayee.name);

    //Check for successful UI message
    await expect(page.locator("#billpayResult h1")).toHaveText(
      "Bill Payment Complete"
    );
    await expect(page.locator("#billpayResult p").first()).toHaveText(
      `Bill Payment to ${paymentData.payeeName} in the amount of ${toDollar(
        paymentData.amount
      )} from account ${paymentData.accountId} was successful.`
    );
    await expect(page.locator("#billpayResult p").nth(1)).toHaveText(
      "See Account Activity for more details."
    );

    //Check that transaction successfully went through to backend
    const accountTransactions: TransactionData[] = await getAccountTransactions(
      page,
      Number(fromAccountId)
    );
    const initialTransaction: TransactionData = accountTransactions[0];

    expect(initialTransaction).toHaveProperty("amount", Number(paymentAmount));
    expect(initialTransaction).toHaveProperty(
      "description",
      `Bill Payment to ${mockPayee.name}`
    );
  });

  test("should get bill form validation errors", async ({ page }) => {
    //Submit empty form
    await page.getByRole("button", { name: "Send Payment" }).click();

    //Check for validation errora
    const validations = [
      { selector: "#validationModel-name", text: "Payee name is required." },
      { selector: "#validationModel-address", text: "Address is required." },
      { selector: "#validationModel-city", text: "City is required." },
      { selector: "#validationModel-state", text: "State is required." },
      { selector: "#validationModel-zipCode", text: "Zip Code is required." },
      {
        selector: "#validationModel-phoneNumber",
        text: "Phone number is required.",
      },
      {
        selector: "#validationModel-account-empty",
        text: "Account number is required.",
      },
      {
        selector: "#validationModel-verifyAccount-empty",
        text: "Account number is required.",
      },
      {
        selector: "#validationModel-amount-empty",
        text: "The amount cannot be empty.",
      },
    ];

    for (const validation of validations) {
      await expect(page.locator(validation.selector)).toHaveText(
        validation.text
      );
    }
  });
});
