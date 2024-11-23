import { chromium } from "playwright";
import { baseURL } from "../../playwright.config";

const globalTeardown = async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${baseURL}/parabank/admin.htm`);
  await page.getByRole("button", { name: "CLEAN" }).click();
};

export default globalTeardown;
