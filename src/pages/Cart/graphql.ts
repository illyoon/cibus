import { Currency } from "../../API";

export const createOrder = /* GraphQL */ `
  mutation CreateOrder($input: CreateOrderInput!, $condition: ModelOrderConditionInput) {
    createOrder(input: $input, condition: $condition) {
      id
      propertyName
      orderItem {
        name
        price
        quantity
        allergyInfo
        customerComment
      }
      createdAt
      status
      priceTotal
      tableName
      updatedAt
    }
  }
`;

export const getPropertyForCart = /* GraphQL */ `
  query GetProperty($name: String!) {
    getProperty(name: $name) {
      name
      NonUniqueName
      open
      tables
      currency
    }
  }
`;

export type GetPropertyQueryForCart = {
  getProperty: {
    name: string;
    NonUniqueName: string;
    open: boolean;
    tables: Array<string | null>;
    currency: Currency;
  };
};
