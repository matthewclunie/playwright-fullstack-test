import { test, expect, Page } from "@playwright/test";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { login, toFormattedDate } from "../../utils/helpers";
import { getAccountById } from "../../utils/API/accounts";

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

  test("should apply for loan", async ({ page }) => {
    const loanPromise = page.waitForResponse((response) => {
      return response.url().includes("/services_proxy/bank/requestLoan");
    });
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/requestloan.htm");
    await page.locator("#amount").fill("50");
    await page.locator("#downPayment").fill("10");
    await page.getByRole("button", { name: "Apply Now" }).click();
    const loanResponse = await loanPromise;
    const loanData: LoanData = await loanResponse.json();

    await expect(page.locator("#requestLoanResult h1")).toHaveText(
      "Loan Request Processed"
    );
    await expect(page.locator("#loanProviderName")).toHaveText(
      `${loanData.loanProviderName}`
    );
    await expect(page.locator("#responseDate")).toHaveText(
      `${toFormattedDate(Date.now())}`
    );
    await expect(page.locator("#loanStatus")).toHaveText("Approved");
    await expect(page.locator("#loanRequestApproved p").first()).toHaveText(
      "Congratulations, your loan has been approved."
    );
    await expect(page.locator("#newAccountId")).toHaveText(
      `${loanData.accountId}`
    );

    const newLoan: LoanData = await getAccountById(page, loanData.accountId);
    expect(newLoan).toHaveProperty("id", loanData.accountId);
  });

  //   test("should deny loan", async ({ page }) => {
  //     await login(page, mockUser.username, mockUser.password);
  //     await page.goto("/parabank/requestloan.htm");
  //     await page.locator("#amount").fill("5000");
  //     await page.locator("#downPayment").fill("100");
  //     await page.getByRole("button", { name: "Apply Now" }).click();
  //   });

  //   test("should get loan form validation errors", async ({ page }) => {
  //     await page.goto("/parabank/requestloan.htm");
  //   });
});
