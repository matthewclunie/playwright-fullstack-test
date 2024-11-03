//Spec Files: Each spec file should focus on a particular aspect of the feature
//(e.g., login.spec.ts tests various scenarios for user login).

import { test } from "@playwright/test";

test.describe("Login Tests", () => {
  //You can also use test.beforeEach and test.afterEach within a test.describe
  //block to set up and clean up the test environment for all tests in that group.

  test("should successfully log in", async () => {
    console.log("idk man");
  });

  test("should get error on incorrect sign in", async () => {
    console.log("idk man");
  });
});

test.describe("Password Reset Functionality", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/password-reset");
  });

  test("should reset password", async () => {
    console.log("idk man");
  });
});
