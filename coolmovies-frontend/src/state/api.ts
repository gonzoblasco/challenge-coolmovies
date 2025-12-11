import { createApi } from '@reduxjs/toolkit/query/react';
import { GraphQLClient, ClientError } from 'graphql-request';

const isServer = typeof window === 'undefined';
let url = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3000/graphql';
if (isServer && url.startsWith('/')) {
  url = `http://localhost:3000${url}`;
} else if (!isServer && url.startsWith('/')) {
   url = `${window.location.origin}${url}`;
}
const endpoint = url;

export const client = new GraphQLClient(endpoint);

const graphqlBaseQuery =
  ({ client }: { client: GraphQLClient }) =>
  async ({ document, variables }: { document: any; variables?: any }) => {
    try {
      const result = await client.request(document, variables);
      return { data: result };
    } catch (error) {
      if (error instanceof ClientError) {
        return { error: { status: error.response.status, data: error } };
      }
      return { error: { status: 500, data: error } };
    }
  };

export const api = createApi({
  baseQuery: graphqlBaseQuery({ client }),
  tagTypes: ['Movie', 'Review'],
  endpoints: () => ({}),
});
