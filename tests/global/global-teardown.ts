import { chromium, type FullConfig } from "@playwright/test";

const globalTeardown = async (config: FullConfig) => {
  console.log("Global teardown: Launching browser");
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(`${baseURL}/parabank/admin.htm`);
  await page.getByRole("button", { name: "CLEAN" }).click();
  await browser.close();
};

export default globalTeardown;
