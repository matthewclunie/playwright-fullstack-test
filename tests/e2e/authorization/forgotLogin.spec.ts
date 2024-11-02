import { test, expect } from "playwright/test";
import { formErrorData } from "./signup.spec";
import { login } from "../../utils/helpers";
import { mockUser } from "../../fixtures/mockData";

test.describe("Forgot Login Tests", () => {
  test("Should find login info", async ({ page }) => {
    await login(page);
    await page.goto("/parabank/lookup.htm");
    await page.click('button[type="submit"]');
    await page.fill("#firstName", mockUser.firstName);
    await page.fill("#lastName", mockUser.lastName);
    await page.fill("#address.state", mockUser.state);
    await page.fill("#phoneNumber", mockUser.phoneNumber);
    await page.fill("#ssn", mockUser.ssn);
    await page.click('button[type="submit"]');
    await expect(page.locator("p").nth(1)).toHaveText(
      `Username: ${mockUser.username} Password: ${mockUser.password}`
    );
  });

  test("should return form validation errors", async ({ page }) => {
    await login(page);
    await page.goto("/parabank/lookup.htm");
    await page.click('button[type="submit"]');
    await expect(page.locator("#firstName.errors")).toHaveText(
      formErrorData.firstNameError
    );
    await expect(page.locator("#lastName.errors")).toHaveText(
      formErrorData.lastNameError
    );
    await expect(page.locator("#address.street.errors")).toHaveText(
      formErrorData.streetError
    );
    await expect(page.locator("#address.city.errors")).toHaveText(
      formErrorData.cityError
    );
    await expect(page.locator("#address.state.errors")).toHaveText(
      formErrorData.stateError
    );
    await expect(page.locator("#address.zipCode.errors")).toHaveText(
      formErrorData.zipError
    );
    await expect(page.locator("#ssn.errors")).toHaveText(
      formErrorData.ssnError
    );
  });
});
