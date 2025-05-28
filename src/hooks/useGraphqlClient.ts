import { GraphQLClient } from 'graphql-request';

const API_URL = "http://localhost:3000/api/graphql";

export const graphqlClient = new GraphQLClient(API_URL, { credentials: "include" });
export default graphqlClient
