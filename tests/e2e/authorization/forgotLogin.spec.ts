import { expect, Page, test } from "playwright/test";
import {
  generateLoginInfo,
  mockUser,
  createUser,
} from "../../fixtures/mockData";
import { checkHeader } from "../../utils/helpers";

const generateSSN = () => {
  const characters = "123456789"; // Both lowercase and uppercase
  let ssn = "";
  for (let i = 0; i < 9; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length); // Random index
    ssn += characters[randomIndex]; // Add the character to the result
  }
  return ssn;
};

const loginInfo = generateLoginInfo();
const ssn = generateSSN();

const fillFindUserForm = async (page: Page, ssn: string) => {
  const formRows = [
    { selector: "#firstName", info: mockUser.firstName },
    { selector: "#lastName", info: mockUser.lastName },
    { selector: "#address\\.street", info: mockUser.street },
    { selector: "#address\\.city", info: mockUser.city },
    { selector: "#address\\.state", info: mockUser.state },
    { selector: "#address\\.zipCode", info: mockUser.zipCode },
    { selector: "#ssn", info: ssn },
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
    await createUser(page, loginInfo.username, loginInfo.password, ssn);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto("/parabank/lookup.htm");
  });

  test("customer lookup header and details should be present", async ({
    page,
  }) => {
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
    await fillFindUserForm(page, ssn);

    //Expect info recovery confirmation message
    await checkHeader(page, headerText.title, headerText.caption);
    await expect(page.locator("#rightPanel p").last()).toHaveText(
      `Username: ${loginInfo.username} Password: ${loginInfo.password}`
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
    const badSSN = "999999999";
    await page.goto("/parabank/lookup.htm");
    const headerText = {
      title: "Error!",
      caption: "The customer information provided could not be found.",
    };

    //Fill out and submit find user page
    await fillFindUserForm(page, badSSN);
    await checkHeader(page, headerText.title, headerText.caption);
  });
});
