//Utilize the /fixtures directory to manage mock data and configurations.
//This allows you to create reusable data setups, like user credentials or transaction amounts.

//Purpose: Fixtures are typically used to provide specific setup data or state needed for your tests.
//They often include mock data, test users, or any initial state required for running tests.

import { Page } from "playwright";

export const mockUser = {
  firstName: "Guy",
  lastName: "Testing",
  street: "777 Example Drive",
  city: "New York",
  state: "NY",
  zipCode: "55555",
  phoneNumber: "8675309",
  ssn: "123456789",
  // username: "ExampleUser",
  // password: "ExamplePass",
};

export const mockUserUpdated = {
  firstName: "Man",
  lastName: "Updating",
  street: "888 Example Drive",
  city: "Oakland",
  state: "CA",
  zipCode: "55555",
  phoneNumber: "9035768",
};

export const mockPayee = {
  name: "Guy Billing",
  street: "888 Example Drive",
  city: "New York",
  state: "NY",
  zipCode: "55555",
  phoneNumber: "7777777",
  accountNumber: "12345",
};

export const createUser = async (
  page: Page,
  username: string,
  password: string,
  ssn?: string
) => {
  //should I loop through this
  await page.goto("/parabank/register.htm");
  await page.fill("#customer\\.firstName", mockUser.firstName);
  await page.fill("#customer\\.lastName", mockUser.lastName);
  await page.fill("#customer\\.address\\.street", mockUser.street);
  await page.fill("#customer\\.address\\.city", mockUser.city);
  await page.fill("#customer\\.address\\.state", mockUser.state);
  await page.fill("#customer\\.address\\.zipCode", mockUser.zipCode);
  await page.fill("#customer\\.phoneNumber", mockUser.phoneNumber);
  await page.fill("#customer\\.ssn", ssn ? ssn : mockUser.ssn);
  await page.fill("#customer\\.username", username);
  await page.fill("#customer\\.password", password);
  await page.fill("#repeatedPassword", password);
  await page.locator('[value="Register"]').click();
};

export const generateLoginInfo = () => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789"; // Both lowercase and uppercase
  let username = "";
  let password = "";
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length); // Random index
    username += characters[randomIndex]; // Add the character to the result
  }
  for (let i = 0; i < 7; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length); // Random index
    password += characters[randomIndex]; // Add the character to the result
  }
  return { username, password };
};

export const setupNewUser = async (
  page: Page,
  username: string,
  password: string,
  ssn?: string
) => {
  await createUser(page, username, password, ssn ? ssn : mockUser.ssn);
};
