import { Page } from "playwright";

export const getCustomerDetails = async (page: Page, customerId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `https://parabank.parasoft.com/parabank/services/bank/customers/${customerId}`,
    { headers }
  );
  return await response.json();
};

export const updateCustomerInfo = async (
  page: Page,
  customerId: number,
  firstName: string,
  lastName: string,
  street: string,
  city: string,
  state: string,
  zip: string,
  phoneNumber: string,
  ssn: string,
  username: string,
  password: string
) => {
  const headers = {
    accept: "application/json",
  };
  await page.request.post(
    `https://parabank.parasoft.com/parabank/services/bank/customers/update/${customerId}?firstName=${firstName}&lastName=${lastName}&street=${street}&city=${city}&state=${state}&zipCode=${zip}&phoneNumber=${phoneNumber}&ssn=${ssn}&username=${username}&password=${password}`,
    { headers }
  );
};
