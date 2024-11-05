//Utilize the /fixtures directory to manage mock data and configurations.
//This allows you to create reusable data setups, like user credentials or transaction amounts.

//Purpose: Fixtures are typically used to provide specific setup data or state needed for your tests.
//They often include mock data, test users, or any initial state required for running tests.

import { Browser, Page } from "playwright";
import { cleanDB } from "../utils/helpers";

export const mockUser = {
  firstName: "Guy",
  lastName: "Testing",
  street: "777 Example Drive",
  city: "New York",
  state: "NY",
  zipCode: "55555",
  phoneNumber: "8675309",
  ssn: "123456789",
  username: "ExampleUser",
  password: "ExamplePass",
};

export const createUser = async (page: Page) => {
  //should I loop through this
  await page.goto("/parabank/register.htm");
  await page.fill("#customer\\.firstName", mockUser.firstName);
  await page.fill("#customer\\.lastName", mockUser.lastName);
  await page.fill("#customer\\.address\\.street", mockUser.street);
  await page.fill("#customer\\.address\\.city", mockUser.city);
  await page.fill("#customer\\.address\\.state", mockUser.state);
  await page.fill("#customer\\.address\\.zipCode", mockUser.zipCode);
  await page.fill("#customer\\.phoneNumber", mockUser.phoneNumber);
  await page.fill("#customer\\.ssn", mockUser.ssn);
  await page.fill("#customer\\.username", mockUser.username);
  await page.fill("#customer\\.password", mockUser.password);
  await page.fill("#repeatedPassword", mockUser.password);
  await page.locator('[value="Register"]').click();
};

export const setupNewUser = async (page: Page) => {
  await cleanDB(page);
  await createUser(page);
};

// export const createTestAccount = async (page: Page) => {};
