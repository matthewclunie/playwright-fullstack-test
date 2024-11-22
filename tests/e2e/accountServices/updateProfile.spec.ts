import { test, expect } from "@playwright/test";
import { login, logout } from "../../utils/helpers";
import {
  mockUser,
  mockUserUpdated,
  setupNewUser,
} from "../../fixtures/mockData";
import { getUserData } from "../../utils/API/misc";
import { UserData } from "../../types/global";

test.describe("update profile tests", () => {
  const formRows = [
    {
      selector: "#customer\\.firstName",
      info: mockUser.firstName,
    },
    {
      selector: "#customer\\.lastName",
      info: mockUser.lastName,
    },
    {
      selector: "#customer\\.address\\.street",
      info: mockUser.street,
    },
    {
      selector: "#customer\\.address\\.city",
      info: mockUser.city,
    },
    {
      selector: "#customer\\.address\\.state",
      info: mockUser.state,
    },
    {
      selector: "#customer\\.address\\.zipCode",
      info: mockUser.zipCode,
    },
    {
      selector: "#customer\\.phoneNumber",
      info: mockUser.phoneNumber,
    },
  ];

  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test("should update profile", async ({ page }) => {
    const formRowsUpdated = [
      {
        selector: "#customer\\.firstName",
        info: mockUserUpdated.firstName,
      },
      {
        selector: "#customer\\.lastName",
        info: mockUserUpdated.lastName,
      },
      {
        selector: "#customer\\.address\\.street",
        info: mockUserUpdated.street,
      },
      {
        selector: "#customer\\.address\\.city",
        info: mockUserUpdated.city,
      },
      {
        selector: "#customer\\.address\\.state",
        info: mockUserUpdated.state,
      },
      {
        selector: "#customer\\.address\\.zipCode",
        info: mockUserUpdated.zipCode,
      },
      {
        selector: "#customer\\.phoneNumber",
        info: mockUserUpdated.phoneNumber,
      },
    ];

    const updateUserPromise = page.waitForResponse((response) => {
      return response
        .url()
        .includes("/parabank/services_proxy/bank/customers/update/");
    });
    const headerText = {
      title: "Profile Updated",
      caption:
        "Your updated address and phone number have been added to the system.",
    };
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/updateprofile.htm");

    //Fill out and submit profile update form
    for (const { selector, info } of formRowsUpdated) {
      await page.fill(selector, info);
    }

    //Submit form
    await page.getByRole("button", { name: "Update Profile" }).click();
    const updateUserResponse = await updateUserPromise;
    const updateUserData = await updateUserResponse.text();

    //Check API response
    await expect(page.locator("#updateProfileResult h1")).toHaveText(
      headerText.title
    );
    await expect(page.locator("#updateProfileResult p")).toHaveText(
      headerText.caption
    );
    expect(updateUserResponse.ok()).toBe(true);
    expect(updateUserData).toBe("Successfully updated customer profile");

    //Check database was successfully updated
    await logout(page);
    await login(page, mockUserUpdated.username, mockUserUpdated.password);
    const userData: UserData = await getUserData(
      page,
      mockUserUpdated.username,
      mockUserUpdated.password
    );
    expect(userData.lastName).toBe(mockUserUpdated.lastName);
  });

  test("should have placeholders", async ({ page }) => {
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/updateprofile.htm");

    //Check for placeholders
    for (const { selector, info } of formRows) {
      await expect(page.locator(selector)).toHaveValue(info);
    }
  });

  test("should have form validation errors", async ({ page }) => {
    const formErrors = [
      {
        locator: page.locator("#firstName-error"),
        errorMsg: "First name is required.",
      },
      {
        locator: page.locator("#firstName-error"),
        errorMsg: "First name is required.",
      },
      {
        locator: page.locator("#street-error"),
        errorMsg: "Address is required.",
      },
      {
        locator: page.locator("#city-error"),
        errorMsg: "City is required.",
      },
      {
        locator: page.locator("#state-error"),
        errorMsg: "State is required.",
      },
      {
        locator: page.locator("#zipCode-error"),
        errorMsg: "Zip Code is required.",
      },
    ];

    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/updateprofile.htm");

    //Clear form of placeholders, submit empty form
    for (const { selector } of formRows) {
      await page.locator(selector).clear();
    }
    await page.getByRole("button", { name: "Update Profile" }).click();

    //Check for validation errors
    for (const { locator, errorMsg } of formErrors) {
      await expect(locator).toHaveText(errorMsg);
    }
  });
});
