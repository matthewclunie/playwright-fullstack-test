import { expect, test } from "../../fixtures/fixtures";
import { mockUser, mockUserUpdated } from "../../fixtures/mockData";
import { UserData } from "../../types/global";
import { getUserData } from "../../utils/API/misc";

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

  test("should update profile", async ({ page, username, password }) => {
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

    const updateUserPromise = page.waitForResponse(
      "/parabank/services_proxy/bank/customers/update/**"
    );
    const headerText = {
      title: "Profile Updated",
      caption:
        "Your updated address and phone number have been added to the system.",
    };
    await page.goto("/parabank/updateprofile.htm");
    await page.waitForLoadState("networkidle");

    //Checks placeholders for original user data
    for (const { selector, info } of formRows) {
      await expect(page.locator(selector)).toHaveValue(info);
    }

    //Fill out and submit profile update form
    for (const { selector, info } of formRowsUpdated) {
      await page.fill(selector, info);
    }

    //Submit form
    await page.getByRole("button", { name: "Update Profile" }).click();
    const updateUserResponse = await updateUserPromise;
    expect(updateUserResponse.ok()).toBe(true);
    const updateUserData = await updateUserResponse.text();

    //Check UI Confirmation
    await expect(page.locator("#updateProfileResult h1")).toHaveText(
      headerText.title
    );
    await expect(page.locator("#updateProfileResult p")).toHaveText(
      headerText.caption
    );

    //Checks placeholders for updated user data
    await page.reload();
    await page.waitForLoadState("networkidle");

    for (const { selector, info } of formRowsUpdated) {
      await expect(page.locator(selector)).toHaveValue(info);
    }

    //Check API Response
    expect(updateUserData).toBe("Successfully updated customer profile");

    //Check database was successfully updated
    const userData: UserData = await getUserData(page, username, password);

    expect(userData.lastName).toBe(mockUserUpdated.lastName);
  });

  test("should have update form validation errors", async ({ page }) => {
    const formErrors = [
      {
        locator: page.locator("#firstName-error"),
        errorMsg: "First name is required.",
      },
      {
        locator: page.locator("#lastName-error"),
        errorMsg: "Last name is required.",
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
