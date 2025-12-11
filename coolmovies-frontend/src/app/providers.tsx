"use client";

import React, { FC, useState, PropsWithChildren } from "react";
import { Provider as ReduxProvider } from "react-redux";
import { createStore } from "../state";
import { EnhancedStore } from "@reduxjs/toolkit";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";

export const Providers: FC<PropsWithChildren> = ({ children }) => {
  const [store, setStore] = useState<EnhancedStore | null>(null);
  const [client, setClient] = useState<ApolloClient<any> | null>(null);

  React.useEffect(() => {
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || "/graphql",
    });

    const store = createStore({ epicDependencies: { client } });
    setStore(store);
    setClient(client);
  }, []);

  if (!store || !client)
    return (
      <div className="flex h-screen items-center justify-center">
        Loading Application...
      </div>
    );

  return (
    <ReduxProvider store={store}>
      <ApolloProvider client={client}>{children}</ApolloProvider>
    </ReduxProvider>
  );
};
