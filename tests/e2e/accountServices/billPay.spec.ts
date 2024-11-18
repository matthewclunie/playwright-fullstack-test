import { test, expect } from "@playwright/test";
import { mockPayee, mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, toDollar } from "../../utils/helpers";
import { getAccountTransactions } from "../../utils/API/transactions";

test.describe("account activity tests", () => {
  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  interface PaymentData {
    accountId: number;
    amount: number;
    payeeName: string;
  }

  test("should submit bill payment", async ({ page }) => {
    const paymentAmount = "50";
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/billpay.htm");
    await page.fill('[name="payee.name"]', mockPayee.name);
    await page.fill('[name="payee.address.street"]', mockPayee.street);
    await page.fill('[name="payee.address.city"]', mockPayee.city);
    await page.fill('[name="payee.address.state"]', mockPayee.state);
    await page.fill('[name="payee.address.zipCode"]', mockPayee.zipCode);
    await page.fill('[name="payee.phoneNumber"]', mockPayee.phoneNumber);
    await page.fill('[name="payee.accountNumber"]', mockPayee.accountNumber);
    await page.fill('[name="verifyAccount"]', mockPayee.accountNumber);
    await page.fill('[name="amount"]', paymentAmount);
    const fromAccountId = await page
      .locator('[name="fromAccountId"]')
      .innerText();
    const paymentPromise = page.waitForResponse((response) =>
      response.url().includes("parabank/services_proxy/bank/billpay")
    );
    await page.getByRole("button", { name: "Send Payment" }).click();
    const paymentResponse = await paymentPromise;
    const paymentData: PaymentData = await paymentResponse.json();
    expect(paymentResponse.ok()).toBe(true);
    expect(paymentData).toHaveProperty("accountId", Number(fromAccountId));
    expect(paymentData).toHaveProperty("amount", Number(paymentAmount));
    expect(paymentData).toHaveProperty("payeeName", mockPayee.name);
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
    const accountTransactions = await getAccountTransactions(
      page,
      Number(fromAccountId)
    );
    expect(accountTransactions[0]).toHaveProperty(
      "amount",
      Number(paymentAmount)
    );
    expect(accountTransactions[0]).toHaveProperty(
      "description",
      `Bill Payment to ${mockPayee.name}`
    );
  });

  test("should get form validation errors", async ({ page }) => {
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/billpay.htm");
    await page.getByRole("button", { name: "Send Payment" }).click();

    const validations = [
      { identifier: "#validationModel-name", text: "Payee name is required." },
      { identifier: "#validationModel-address", text: "Address is required." },
      { identifier: "#validationModel-city", text: "City is required." },
      { identifier: "#validationModel-state", text: "State is required." },
      { identifier: "#validationModel-zipCode", text: "Zip Code is required." },
      {
        identifier: "#validationModel-phoneNumber",
        text: "Phone number is required.",
      },
      {
        identifier: "#validationModel-account-empty",
        text: "Account number is required.",
      },
      {
        identifier: "#validationModel-verifyAccount-empty",
        text: "Account number is required.",
      },
      {
        identifier: "#validationModel-amount-empty",
        text: "The amount cannot be empty.",
      },
    ];

    for (const validation of validations) {
      await expect(page.locator(validation.identifier)).toHaveText(
        validation.text
      );
    }
  });
});
