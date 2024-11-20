import { test, expect } from "@playwright/test";
import { login } from "../../utils/helpers";
import {
  mockUser,
  mockUserUpdated,
  setupNewUser,
} from "../../fixtures/mockData";
import { getUserData } from "../../utils/API/misc";
import { UserData } from "../../types/global";

test.describe("update profile tests", () => {
  test.beforeAll("setup", async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await setupNewUser(page);
  });

  test("should update profile", async ({ page }) => {
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
    await page.fill("#customer\\.firstName", mockUserUpdated.firstName);
    await page.fill("#customer\\.lastName", mockUserUpdated.lastName);
    await page.fill("#customer\\.address\\.street", mockUserUpdated.street);
    await page.fill("#customer\\.address\\.city", mockUserUpdated.city);
    await page.fill("#customer\\.address\\.state", mockUserUpdated.state);
    await page.fill("#customer\\.address\\.zipCode", mockUserUpdated.zipCode);
    await page.fill("#customer\\.phoneNumber", mockUserUpdated.phoneNumber);
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
    expect(updateUserData).toBe("Successfully updated customer profile");
    expect(updateUserResponse.ok()).toBe(true);

    //Check database was successfully updated
    const userData: UserData = await getUserData(
      page,
      mockUserUpdated.username,
      mockUserUpdated.password
    );
    expect(userData.lastName).toBe(mockUserUpdated.lastName);
  });

  test("should have placeholders", async ({ page }) => {
    const userPromise = page.waitForResponse((response) => {
      return (
        response.url().includes("/parabank/services_proxy/bank/customers") &&
        page.url().includes("/parabank/updateprofile.htm")
      );
    });
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/updateprofile.htm");
    const userResponse = await userPromise;
    const userData: UserData = await userResponse.json();

    //Check for placeholders
    await expect(page.locator("#customer\\.firstName")).toHaveValue(
      userData.firstName
    );
    await expect(page.locator("#customer\\.lastName")).toHaveValue(
      userData.lastName
    );
    await expect(page.locator("#customer\\.address\\.street")).toHaveValue(
      userData.address.street
    );
    await expect(page.locator("#customer\\.address\\.city")).toHaveValue(
      userData.address.city
    );
    await expect(page.locator("#customer\\.address\\.state")).toHaveValue(
      userData.address.state
    );
    await expect(page.locator("#customer\\.address\\.zipCode")).toHaveValue(
      userData.address.zipCode
    );
    await expect(page.locator("#customer\\.phoneNumber")).toHaveValue(
      userData.phoneNumber
    );
  });

  test("should have form validation errors", async ({ page }) => {
    await login(page, mockUser.username, mockUser.password);
    await page.goto("/parabank/updateprofile.htm");

    //Clear form of placeholders, submit empty form
    await page.locator("#customer\\.firstName").clear();
    await page.locator("#customer\\.lastName").clear();
    await page.locator("#customer\\.address\\.street").clear();
    await page.locator("#customer\\.address\\.city").clear();
    await page.locator("#customer\\.address\\.state").clear();
    await page.locator("#customer\\.address\\.zipCode").clear();
    await page.locator("#customer\\.phoneNumber").clear();
    await page.getByRole("button", { name: "Update Profile" }).click();

    //Check for validation errors
    await expect(page.locator("#firstName-error")).toHaveText(
      "First name is required."
    );
    await expect(page.locator("#lastName-error")).toHaveText(
      "Last name is required."
    );
    await expect(page.locator("#street-error")).toHaveText(
      "Address is required."
    );
    await expect(page.locator("#city-error")).toHaveText("City is required.");
    await expect(page.locator("#state-error")).toHaveText("State is required.");
    await expect(page.locator("#zipCode-error")).toHaveText(
      "Zip Code is required."
    );
  });
});
