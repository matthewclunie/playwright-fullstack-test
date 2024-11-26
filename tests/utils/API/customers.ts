import { Page } from "playwright";
import { getURL } from "../helpers";

export const getCustomerDetails = async (page: Page, customerId: number) => {
  const headers = {
    accept: "application/json",
  };
  const response = await page.request.get(
    `/parabank/services/bank/customers/${customerId}`,
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
  const url = getURL(`/parabank/services/bank/customers/update/${customerId}`, {
    firstName,
    lastName,
    street,
    city,
    state,
    zip,
    phoneNumber,
    ssn,
    username,
    password,
  });
  await page.request.post(url, { headers });
};
