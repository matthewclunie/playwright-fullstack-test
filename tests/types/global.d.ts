export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
}
export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
  address: Address;
  phoneNumber: string;
  ssn: string;
}
export interface AccountData {
  balance: number;
  customerId: number;
  id: number;
  type: "CHECKING" | "SAVINGS";
}

export interface TransactionsData {
  id: number;
  accountId: number;
  type: string;
  date: number;
  amount: number;
  description: string;
}

export interface ErrorData {
  detail: string;
  instance: string;
  status: number;
  title: string;
  type: string;
}
