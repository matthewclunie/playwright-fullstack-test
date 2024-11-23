import { expect, Page, test } from "@playwright/test";
import {
  createUser,
  generateLoginInfo,
  mockUser,
  setupNewUser,
} from "../../fixtures/mockData";
import { UserData } from "../../types/global";
import { getUserData } from "../../utils/API/misc";
import { checkHeader } from "../../utils/helpers";

const loginInfo = generateLoginInfo();

test.describe("requires setup user", () => {
  let page: Page;

  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
    await setupNewUser(page, loginInfo.username, loginInfo.password);
  });

  test("should successfully register user", async () => {
    //UI check for new user
    const successfulAccountText =
      "Your account was created successfully. You are now logged in.";
    await checkHeader(
      page,
      `Welcome ${loginInfo.username}`,
      successfulAccountText
    );

    //API check for new user
    const userData: UserData = await getUserData(
      page,
      loginInfo.username,
      loginInfo.password
    );
    const firstNameData = userData.firstName;
    const lastNameData = userData.lastName;
    expect(firstNameData).toEqual(`${mockUser.firstName}`);
    expect(lastNameData).toEqual(`${mockUser.lastName}`);
  });

  test("should return username exists error", async () => {
    await createUser(page, loginInfo.username, loginInfo.password);
    await expect(page.locator("#customer\\.username\\.errors")).toHaveText(
      "This username already exists."
    );
  });
});

test.describe("without setup user", () => {
  test("registration header and details should be present", async ({
    page,
  }) => {
    const headerText = {
      title: "Signing up is easy!",
      caption:
        "If you have an account with us you can sign-up for free instant online access. You will have to provide some personal information.",
    };

    await page.goto("/parabank/register.htm");
    await checkHeader(page, headerText.title, headerText.caption);
  });

  test("should return registration form validation errors", async ({
    page,
  }) => {
    const formErrors = [
      {
        locator: page.locator("#customer\\.firstName\\.errors"),
        error: "First name is required.",
      },
      {
        locator: page.locator("#customer\\.lastName\\.errors"),
        error: "Last name is required.",
      },
      {
        locator: page.locator("#customer\\.address\\.street\\.errors"),
        error: "Address is required.",
      },
      {
        locator: page.locator("#customer\\.address\\.city\\.errors"),
        error: "City is required.",
      },
      {
        locator: page.locator("#customer\\.address\\.\\state\\.errors"),
        error: "State is required.",
      },
      {
        locator: page.locator("#customer\\.address\\.zipCode\\.errors"),
        error: "Zip Code is required.",
      },
      {
        locator: page.locator("#customer\\.ssn\\.errors"),
        error: "Social Security Number is required.",
      },
      {
        locator: page.locator("#customer\\.username\\.errors"),
        error: "Username is required.",
      },
      {
        locator: page.locator("#customer\\.password\\.errors"),
        error: "Password is required.",
      },
      {
        locator: page.locator("#repeatedPassword\\.errors"),
        error: "Password confirmation is required.",
      },
    ];

    await page.goto("/parabank/register.htm");
    await page.click('[value="Register"]');

    for (const { locator, error } of formErrors) {
      await expect(locator).toHaveText(error);
    }
  });
});
