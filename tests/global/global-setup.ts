import { chromium } from "playwright";
import { baseURL } from "../../playwright.config";

const globalSetup = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
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
};

export default globalSetup;
