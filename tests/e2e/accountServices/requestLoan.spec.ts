import { expect, Page, test } from "../../fixtures/fixtures";
import { generateLoginInfo, createUser } from "../../fixtures/mockData";
import { ErrorData } from "../../types/global";
import { getAccountById } from "../../utils/API/accounts";
import { login, toFormattedDate } from "../../utils/helpers";

interface LoanData {
  responseDate: number;
  loanProviderName: string;
  approved: boolean;
  accountId: number;
}

test.describe("request loan tests", () => {
  const loanUrl =
    "/parabank/services_proxy/bank/requestLoan?customerId=*&amount=*&downPayment=*&fromAccountId=*";
  const submitLoan = async (
    page: Page,
    amount?: number,
    downPayment?: number
  ) => {
    amount && (await page.fill("#amount", amount.toString()));
    downPayment && (await page.fill("#downPayment", downPayment.toString()));
    await page.getByRole("button", { name: "Apply Now" }).click();
  };

  const checkApprovedLoan = async (page: Page, loanData: LoanData) => {
    await expect(page.locator("#requestLoanResult h1")).toHaveText(
      "Loan Request Processed"
    );
    await expect(page.locator("#loanProviderName")).toHaveText(
      `${loanData.loanProviderName}`
    );
    await expect(page.locator("#responseDate")).toHaveText(
      toFormattedDate(loanData.responseDate)
    );
    await expect(page.locator("#loanStatus")).toHaveText(
      loanData.approved ? "Approved" : "Denied"
    );
    await expect(
      loanData.approved
        ? page.locator("#loanRequestApproved p").first()
        : page.locator("#loanRequestDenied .error")
    ).toHaveText(
      loanData.approved
        ? "Congratulations, your loan has been approved."
        : "You do not have sufficient funds for the given down payment."
    );
    if (loanData.approved) {
      await expect(page.locator("#newAccountId")).toHaveText(
        `${loanData.accountId}`
      );
    }
  };

  const checkApprovedLoanAPI = async (
    loanData: LoanData,
    expectApproved: boolean
  ) => {
    expect(loanData.responseDate).toBeGreaterThan(0);
    expect(loanData).toHaveProperty(
      "loanProviderName",
      "Wealth Securities Dynamic Loans (WSDL)"
    );
    expect(loanData).toHaveProperty("approved", expectApproved);
    if (expectApproved) {
      expect(loanData.accountId).toBeGreaterThan(0);
    } else {
      expect(loanData).toHaveProperty(
        "message",
        "error.insufficient.funds.for.down.payment"
      );
      expect(loanData.accountId).toBeNull();
    }
  };

  test.beforeEach(async ({ page }) => {
    await page.goto("/parabank/requestloan.htm");
  });

  test("should approve loan", async ({ page }) => {
    const loanPromise = page.waitForResponse(loanUrl);

    //Submit loan to be approved
    await submitLoan(page, 50, 10);
    const loanResponse = await loanPromise;
    expect(loanResponse.ok()).toBe(true);
    const loanData: LoanData = await loanResponse.json();

    //Check UI for approved loan
    await checkApprovedLoan(page, loanData);

    //Check API response
    await checkApprovedLoanAPI(loanData, true);

    //Check that loan is in the database
    const newLoan: LoanData = await getAccountById(page, loanData.accountId);
    expect(newLoan).toHaveProperty("id", loanData.accountId);
  });

  test("should deny loan", async ({ page }) => {
    const loanPromise = page.waitForResponse(loanUrl);

    //Submit loan to be denied
    await submitLoan(page, 5000, 1000);
    const loanResponse = await loanPromise;
    expect(loanResponse.ok()).toBe(true);
    const loanData: LoanData = await loanResponse.json();

    //Check UI for denial
    await checkApprovedLoan(page, loanData);

    //Check API response
    await checkApprovedLoanAPI(loanData, false);
  });

  test("should return error with incomplete loan form submission", async ({
    page,
  }) => {
    const loanPromise = page.waitForResponse(loanUrl);

    //Submit incomplete form
    await submitLoan(page);
    const loanResponse = await loanPromise;
    expect(loanResponse.ok()).toBe(false);
    const loanData: ErrorData = await loanResponse.json();

    //Check UI for error message
    await expect(page.locator("#requestLoanError h1")).toHaveText("Error!");
    await expect(page.locator("#requestLoanError p")).toHaveText(
      "An internal error has occurred and has been logged."
    );

    //Check API response
    expect(loanData).toHaveProperty("title", "Bad Request");
    expect(loanData).toHaveProperty(
      "detail",
      "Required parameter 'amount' is not present."
    );
  });
});
