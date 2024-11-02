import { test, expect } from "@playwright/test";
import { createTestUser, mockUser } from "../../fixtures/mockData";
import { login, logout } from "../../utils/helpers";

export const formErrorData = {
  userExists: "This username already exists.",
  firstNameError: "First name is required.",
  lastNameError: "Last name is required.",
  streetError: "Address is required.",
  cityError: "City is required.",
  stateError: "State is required.",
  zipError: "Zip Code is required.",
  ssnError: "Social Security Number is required.",
  usernameError: "Username is required.",
  passwordError: "Password is required.",
  passwordConfirmError: "Password confirmation is required.",
};

test.describe("User Registration Tests", () => {
  test("should successfully register user", async ({ page }) => {
    await createTestUser(page);

    //Registration Successful
    await expect(page.locator(".title")).toHaveText(
      `Welcome ${mockUser.username}`
    );
    const successfulAccountText = page.locator("p", {
      hasText: "Your account was created successfully. You are now logged in.",
    });
    await expect(successfulAccountText).toBeVisible();

    //Should be logged in - How to check if logged in? localStorage?
    //UI signs you are logged in.
  });

  test("should return form validation errors", async ({ page }) => {
    await login(page);
    await page.goto("/parabank/register");
    await page.click('button[type="submit"]');
    await expect(page.locator("#customer.firstName.errors")).toHaveText(
      formErrorData.firstNameError
    );
    await expect(page.locator("#customer.lastName.errors")).toHaveText(
      formErrorData.lastNameError
    );
    await expect(page.locator("#customer.address.street.errors")).toHaveText(
      formErrorData.streetError
    );
    await expect(page.locator("#customer.address.city.errors")).toHaveText(
      formErrorData.cityError
    );
    await expect(page.locator("#customer.address.state.errors")).toHaveText(
      formErrorData.stateError
    );
    await expect(page.locator("#customer.address.zipCode.errors")).toHaveText(
      formErrorData.zipError
    );
    await expect(page.locator("#customer.ssn.errors")).toHaveText(
      formErrorData.ssnError
    );
    await expect(page.locator("#customer.username.errors")).toHaveText(
      formErrorData.usernameError
    );
    await expect(page.locator("#customer.password.errors")).toHaveText(
      formErrorData.passwordError
    );
    await expect(page.locator("#repeatedPassword.errors")).toHaveText(
      formErrorData.passwordConfirmError
    );
  });

  test("should return username exists error", async ({ page }) => {
    await createTestUser(page);
    //Logout
    await logout(page);
    //Register Again
    await createTestUser(page);
    await expect(page.locator("#customer.username.errors")).toHaveText(
      formErrorData.userExists
    );
  });
});
