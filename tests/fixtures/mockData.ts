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
  const formRows = [
    {
      locator: "#customer\\.firstName",
      info: mockUser.firstName,
    },
    {
      locator: "#customer\\.lastName",
      info: mockUser.lastName,
    },
    {
      locator: "#customer\\.address\\.street",
      info: mockUser.street,
    },
    {
      locator: "#customer\\.address\\.city",
      info: mockUser.city,
    },
    {
      locator: "#customer\\.address\\.state",
      info: mockUser.state,
    },
    {
      locator: "#customer\\.address\\.zipCode",
      info: mockUser.zipCode,
    },
    {
      locator: "#customer\\.phoneNumber",
      info: mockUser.phoneNumber,
    },
    {
      locator: "#customer\\.ssn",
      info: ssn ? ssn : mockUser.ssn,
    },
    {
      locator: "#customer\\.username",
      info: username,
    },
    {
      locator: "#customer\\.password",
      info: password,
    },
    {
      locator: "#repeatedPassword",
      info: password,
    },
  ];

  await page.goto("/parabank/register.htm");

  for (const { locator, info } of formRows) {
    await page.fill(locator, info);
  }

  await page.locator('[value="Register"]').click();
};

export const generateLoginInfo = () => {
  const getRandomString = () => {
    const characters =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789";
    let randomString = "";

    for (let i = 0; i < 7; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      randomString += characters[randomIndex];
    }
    return randomString;
  };

  const username = getRandomString();
  const password = getRandomString();

  return { username, password };
};
