import { GraphQLClient } from 'graphql-request';

const API_URL = "/api/graphql";

export const graphqlClient = new GraphQLClient(API_URL, { credentials: "include" });
export default graphqlClient
