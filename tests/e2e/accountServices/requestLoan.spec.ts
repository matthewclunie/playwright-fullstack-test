import { test, expect } from "@playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, toFormattedDate } from "../../utils/helpers";
import { getAccountById } from "../../utils/API/accounts";
import { ErrorData } from "../../types/global";

interface LoanData {
  responseDate: number;
  loanProviderName: string;
  approved: boolean;
  accountId: number;
}

test.describe("request loan tests", () => {
  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test("should approve loan", async ({ page }) => {
    const loanPromise = page.waitForResponse((response) => {
      return response.url().includes("/services_proxy/bank/requestLoan");
    });
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/requestloan.htm");

    //Submit loan to be approved
    await page.locator("#amount").fill("50");
    await page.locator("#downPayment").fill("10");
    await page.getByRole("button", { name: "Apply Now" }).click();
    const loanResponse = await loanPromise;
    const loanData: LoanData = await loanResponse.json();

    //Check UI for approved loan
    await expect(page.locator("#requestLoanResult h1")).toHaveText(
      "Loan Request Processed"
    );
    await expect(page.locator("#loanProviderName")).toHaveText(
      `${loanData.loanProviderName}`
    );
    await expect(page.locator("#responseDate")).toHaveText(
      toFormattedDate(loanData.responseDate)
    );
    await expect(page.locator("#loanStatus")).toHaveText("Approved");
    await expect(page.locator("#loanRequestApproved p").first()).toHaveText(
      "Congratulations, your loan has been approved."
    );
    await expect(page.locator("#newAccountId")).toHaveText(
      `${loanData.accountId}`
    );

    //Check API response
    expect(loanData.responseDate).toBeGreaterThan(0);
    expect(loanData).toHaveProperty(
      "loanProviderName",
      "Wealth Securities Dynamic Loans (WSDL)"
    );
    expect(loanData).toHaveProperty("approved", true);
    expect(loanData.accountId).toBeGreaterThan(0);

    //Check that loan is in the database
    const newLoan: LoanData = await getAccountById(page, loanData.accountId);
    expect(newLoan).toHaveProperty("id", loanData.accountId);
  });

  test("should deny loan", async ({ page }) => {
    const loanPromise = page.waitForResponse((response) => {
      return response.url().includes("services_proxy/bank/requestLoan");
    });
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/requestloan.htm");

    //Submit loan to be denied
    await page.locator("#amount").fill("5000");
    await page.locator("#downPayment").fill("100");
    await page.getByRole("button", { name: "Apply Now" }).click();
    const loanResponse = await loanPromise;
    const loanData: LoanData = await loanResponse.json();

    //Check UI for denial
    await expect(page.locator("#requestLoanResult .title")).toHaveText(
      "Loan Request Processed"
    );
    await expect(page.locator("#loanProviderName")).toHaveText(
      loanData.loanProviderName
    );
    await expect(page.locator("#responseDate")).toHaveText(
      toFormattedDate(loanData.responseDate)
    );
    await expect(page.locator("#loanStatus")).toHaveText("Denied");
    await expect(page.locator("#loanRequestDenied p")).toHaveText(
      "We cannot grant a loan in that amount with your available funds."
    );

    //Check API response
    expect(loanResponse.ok()).toBe(true);
    expect(loanData.responseDate).toBeGreaterThan(0);
    expect(loanData).toHaveProperty(
      "loanProviderName",
      "Wealth Securities Dynamic Loans (WSDL)"
    );
    expect(loanData).toHaveProperty("approved", false);
    expect(loanData).toHaveProperty("message", "error.insufficient.funds");
    expect(loanData.accountId).toBeNull();
  });

  test("should return error with incomplete form submission", async ({
    page,
  }) => {
    const loanPromise = page.waitForResponse((response) => {
      return response.url().includes("/services_proxy/bank/requestLoan");
    });
    await login(page, mockUser.username, mockUser.password);

    //Submit incomplete form
    await page.goto("/parabank/requestloan.htm");
    await page.getByRole("button", { name: "Apply Now" }).click();
    const loanResponse = await loanPromise;
    const loanData: ErrorData = await loanResponse.json();

    //Check UI for error message
    await expect(page.locator("#requestLoanError h1")).toHaveText("Error!");
    await expect(page.locator("#requestLoanError p")).toHaveText(
      "An internal error has occurred and has been logged."
    );

    //Check API response
    expect(loanResponse.ok()).toBe(false);
    expect(loanData).toHaveProperty("title", "Bad Request");
    expect(loanData).toHaveProperty(
      "detail",
      "Required parameter 'amount' is not present."
    );
  });
});
