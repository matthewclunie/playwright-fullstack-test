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
    await expect(page.locator("#updateProfileResult h1")).toHaveText(
      headerText.title
    );
    await expect(page.locator("#updateProfileResult p")).toHaveText(
      headerText.caption
    );
    expect(updateUserData).toBe("Successfully updated customer profile");
    expect(updateUserResponse.ok()).toBe(true);

    const userData: UserData = await getUserData(
      page,
      mockUserUpdated.username,
      mockUserUpdated.password
    );
    expect(userData.lastName).toBe(mockUserUpdated.lastName);
  });

  test("should have placeholders", async ({ page }) => {});

  test("should have form validation errors", async ({ page }) => {});
});
