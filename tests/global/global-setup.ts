import { chromium, type FullConfig } from "@playwright/test";

const globalSetup = async (config: FullConfig) => {
  const { baseURL } = config.projects[0].use;
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  console.log("Global setup: Launching browser");
  await page.goto(`${baseURL}/parabank/admin.htm`);
  await page.locator("#accessMode3").click();
  await page.locator("#soapEndpoint").clear();
  await page.locator("#restEndpoint").clear();
  await page.locator("#endpoint").clear();
  await page.locator("#initialBalance").fill("515");
  await page.locator("#minimumBalance").fill("100");
  await page.locator("#loanProvider").selectOption({ value: "ws" });
  await page.locator("#loanProcessor").selectOption({ value: "funds" });
  await page.locator("#loanProcessorThreshold").fill("5");
  await page.getByRole("button", { name: "Submit" }).click();
  await page.getByRole("button", { name: "CLEAN" }).click();
  const isJMSDown = await page.locator('[value="Startup"]').isVisible();
  if (isJMSDown) {
    await page.locator('[value="Startup"]').click();
  }
};

export default globalSetup;
