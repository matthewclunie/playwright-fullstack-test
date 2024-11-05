import { test, expect } from "@playwright/test";
import { createUser, mockUser } from "../../fixtures/mockData";
import { checkHeader, cleanDB, getUserData } from "../../utils/helpers";
import { formErrorData } from "./expectedMessages";
import { UserData } from "../../types/global";

const headerText = {
  title: "Signing up is easy!",
  caption:
    "If you have an account with us you can sign-up for free instant online access. You will have to provide some personal information.",
};

test.describe("User Registration Tests", () => {
  test("registration header and details should be present", async ({
    page,
  }) => {
    await page.goto("/parabank/register.htm");
    await checkHeader(page, headerText.title, headerText.caption);
  });

  test("should successfully register user", async ({ page }) => {
    await cleanDB(page);
    await createUser(page);

    //UI check for new user
    const successfulAccountText =
      "Your account was created successfully. You are now logged in.";
    await checkHeader(
      page,
      `Welcome ${mockUser.username}`,
      successfulAccountText
    );

    //API check for new user
    const userData: UserData = await getUserData(
      page,
      mockUser.username,
      mockUser.password
    );
    const firstNameData = userData.firstName;
    const lastNameData = userData.lastName;
    expect(firstNameData).toEqual(`${mockUser.firstName}`);
    expect(lastNameData).toEqual(`${mockUser.lastName}`);
  });

  test("should return registration form validation errors", async ({
    page,
  }) => {
    await page.goto("/parabank/register.htm");
    await page.click('[value="Register"]');

    await expect(page.locator("#customer\\.firstName\\.errors")).toHaveText(
      formErrorData.firstNameError
    );
    await expect(page.locator("#customer\\.lastName\\.errors")).toHaveText(
      formErrorData.lastNameError
    );
    await expect(
      page.locator("#customer\\.address\\.street\\.errors")
    ).toHaveText(formErrorData.streetError);
    await expect(
      page.locator("#customer\\.address\\.city\\.errors")
    ).toHaveText(formErrorData.cityError);
    await expect(
      page.locator("#customer\\.address\\.\\state\\.errors")
    ).toHaveText(formErrorData.stateError);
    await expect(
      page.locator("#customer\\.address\\.zipCode\\.errors")
    ).toHaveText(formErrorData.zipError);
    await expect(page.locator("#customer\\.ssn\\.errors")).toHaveText(
      formErrorData.ssnError
    );
    await expect(page.locator("#customer\\.username\\.errors")).toHaveText(
      formErrorData.usernameError
    );
    await expect(page.locator("#customer\\.password\\.errors")).toHaveText(
      formErrorData.passwordError
    );
    await expect(page.locator("#repeatedPassword\\.errors")).toHaveText(
      formErrorData.passwordConfirmError
    );
  });

  test("should return username exists error", async ({ page }) => {
    await cleanDB(page);
    await createUser(page);
    //Register Again
    await createUser(page);
    await expect(page.locator("#customer\\.username\\.errors")).toHaveText(
      formErrorData.userExists
    );
  });
});
