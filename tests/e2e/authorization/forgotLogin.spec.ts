import { test, expect, Page } from "playwright/test";
import { formErrorData } from "./expectedMessages";
import { checkColor, checkHeader } from "../../utils/helpers";
import { mockUser, setupNewUser } from "../../fixtures/mockData";
import { cleanDB } from "../../utils/API/database";

const fillFindUserForm = async (page: Page) => {
  await page.fill("#firstName", mockUser.firstName);
  await page.fill("#lastName", mockUser.lastName);
  await page.fill("#address\\.street", mockUser.street);
  await page.fill("#address\\.city", mockUser.city);
  await page.fill("#address\\.state", mockUser.state);
  await page.fill("#address\\.zipCode", mockUser.zipCode);
  await page.fill("#ssn", mockUser.ssn);
  await page.locator('[value="Find My Login Info"]').click();
};

test.describe("forgot login tests", () => {
  test.beforeAll("Setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test("header and details should be present", async ({ page }) => {
    const headerText = {
      title: "Customer Lookup",
      caption:
        "Please fill out the following information in order to validate your account.",
    };

    await page.goto("/parabank/lookup.htm");
    await checkHeader(page, headerText.title, headerText.caption);
  });

  test("Should find login info", async ({ page }) => {
    const headerText = {
      title: "Customer Lookup",
      caption:
        "Your login information was located successfully. You are now logged in.",
    };

    await page.goto("/parabank/lookup.htm");

    //Fill out and submit find user page
    await fillFindUserForm(page);

    //Expect info recovery confirmation message
    await checkHeader(page, headerText.title, headerText.caption);
    await expect(page.locator("#rightPanel").locator("p").last()).toHaveText(
      `Username: ${mockUser.username} Password: ${mockUser.password}`
    );
  });

  test("should return form validation errors", async ({ page }) => {
    await page.goto("/parabank/lookup.htm");
    await page.locator('[value="Find My Login Info"]').click();
    await expect(page.locator("#firstName\\.errors")).toHaveText(
      formErrorData.firstNameError
    );
    await expect(page.locator("#lastName\\.errors")).toHaveText(
      formErrorData.lastNameError
    );
    await expect(page.locator("#address\\.street\\.errors")).toHaveText(
      formErrorData.streetError
    );
    await expect(page.locator("#address\\.city\\.errors")).toHaveText(
      formErrorData.cityError
    );
    await expect(page.locator("#address\\.state\\.errors")).toHaveText(
      formErrorData.stateError
    );
    await expect(page.locator("#address\\.zipCode\\.errors")).toHaveText(
      formErrorData.zipError
    );
    await expect(page.locator("#ssn\\.errors")).toHaveText(
      formErrorData.ssnError
    );
  });

  test("should return customer not found", async ({ page }) => {
    const headerText = {
      title: "Error!",
      caption: "The customer information provided could not be found.",
    };
    await cleanDB(page);
    await page.goto("/parabank/lookup.htm");

    //Fill out and submit find user page
    await fillFindUserForm(page);

    await checkHeader(page, headerText.title, headerText.caption);
    // Check if error message is red
    await checkColor(page, ".error", "rgb(255, 0, 0)");
  });
});
