import { test as baseTest, expect } from "@playwright/test";
import { createUser, generateLoginInfo } from "../fixtures/mockData";
import fs from "fs";
import path from "path";

export * from "@playwright/test";

const loginInfo = generateLoginInfo();

type Fixtures = {
  workerStorageState: string;
  username: string;
  password: string;
};

export const test = baseTest.extend<{}, Fixtures>({
  // Use the same storage state for all tests in this worker.
  storageState: ({ workerStorageState }, use) => use(workerStorageState),

  // Authenticate once per worker with a worker-scoped fixture.
  workerStorageState: [
    async ({ browser }, use) => {
      // Use parallelIndex as a unique identifier for each worker.
      const id = test.info().parallelIndex;
      const fileName = path.resolve(
        test.info().project.outputDir,
        `.auth/${id}.json`
      );

      if (fs.existsSync(fileName)) {
        // Reuse existing authentication state if any.
        await use(fileName);
        return;
      }

      // Important: make sure we authenticate in a clean environment by unsetting storage state.
      const page = await browser.newPage({ storageState: undefined });

      // Acquire a unique account, for example create a new one.
      // Alternatively, you can have a list of precreated accounts for testing.
      // Make sure that accounts are unique, so that multiple team members
      // can run tests at the same time without interference.

      // Perform authentication steps. Replace these actions with your own.
      await createUser(page, loginInfo.username, loginInfo.password);

      // Wait until the page receives the cookies.
      // You can wait until the page reaches a state where all cookies are set.
      // await page.locator('[href="logout.htm"]').waitFor();

      // End of authentication steps.
      await page.context().storageState({ path: fileName });
      // await page.close();
      await use(fileName);
    },
    { scope: "worker" },
  ],
  username: [loginInfo.username, { scope: "worker" }],
  password: [loginInfo.password, { scope: "worker" }],
});
