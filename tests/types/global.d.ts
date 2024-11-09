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
