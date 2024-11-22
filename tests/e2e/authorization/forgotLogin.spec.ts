import { test, expect, Page } from "playwright/test";
import { checkColor, checkHeader } from "../../utils/helpers";
import { mockUser, setupNewUser } from "../../fixtures/mockData";

const fillFindUserForm = async (page: Page) => {
  const formRows = [
    { selector: "#firstName", info: mockUser.firstName },
    { selector: "#lastName", info: mockUser.lastName },
    { selector: "#address\\.street", info: mockUser.street },
    { selector: "#address\\.city", info: mockUser.city },
    { selector: "#address\\.state", info: mockUser.state },
    { selector: "#address\\.zipCode", info: mockUser.zipCode },
    { selector: "#ssn", info: mockUser.ssn },
  ];

  for (const { selector, info } of formRows) {
    await page.fill(selector, info);
  }

  await page.locator('[value="Find My Login Info"]').click();
};

test.describe("requires setup user", () => {
  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/parabank/lookup.htm");
  });

  test("header and details should be present", async ({ page }) => {
    const headerText = {
      title: "Customer Lookup",
      caption:
        "Please fill out the following information in order to validate your account.",
    };

    await checkHeader(page, headerText.title, headerText.caption);
  });

  test("should find login info", async ({ page }) => {
    const headerText = {
      title: "Customer Lookup",
      caption:
        "Your login information was located successfully. You are now logged in.",
    };

    //Fill out and submit find user page
    await fillFindUserForm(page);

    //Expect info recovery confirmation message
    await checkHeader(page, headerText.title, headerText.caption);
    await expect(page.locator("#rightPanel p").last()).toHaveText(
      `Username: ${mockUser.username} Password: ${mockUser.password}`
    );
  });

  test("should return lookup form validation errors", async ({ page }) => {
    await page.locator('[value="Find My Login Info"]').click();

    const formErrors = [
      {
        locator: page.locator("#firstName\\.errors"),
        error: "First name is required.",
      },
      {
        locator: page.locator("#lastName\\.errors"),
        error: "Last name is required.",
      },
      {
        locator: page.locator("#address\\.street\\.errors"),
        error: "Address is required.",
      },
      {
        locator: page.locator("#address\\.city\\.errors"),
        error: "City is required.",
      },
      {
        locator: page.locator("#address\\.state\\.errors"),
        error: "State is required.",
      },
      {
        locator: page.locator("#address\\.zipCode\\.errors"),
        error: "Zip Code is required.",
      },
      {
        locator: page.locator("#ssn\\.errors"),
        error: "Social Security Number is required.",
      },
    ];

    for (const { locator, error } of formErrors) {
      await expect(locator).toHaveText(error);
    }
  });
});

test.describe("without setup user", () => {
  test("should return customer not found", async ({ page }) => {
    await page.goto("/parabank/lookup.htm");
    const headerText = {
      title: "Error!",
      caption: "The customer information provided could not be found.",
    };

    //Fill out and submit find user page
    await fillFindUserForm(page);

    await checkHeader(page, headerText.title, headerText.caption);
    // Check if error message is red
    await checkColor(page, ".error", "rgb(255, 0, 0)");
  });
});
