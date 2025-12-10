import '../styles/globals.css';
import type { AppProps } from 'next/app';
import React, { FC, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import Head from 'next/head';
import { createStore } from '../state';
import { EnhancedStore } from '@reduxjs/toolkit';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '../styles/theme';

const App: FC<AppProps> = ({ Component, pageProps }) => {
  const [store, setStore] = useState<EnhancedStore | null>(null);
  const [client, setClient] = useState<ApolloClient<any> | null>(null);
  React.useEffect(() => {
    const client = new ApolloClient({
      cache: new InMemoryCache(),
      uri: '/graphql',
    });

    const store = createStore({ epicDependencies: { client } });
    setStore(store);
    setClient(client);
  }, []);
  if (!store || !client) return <>{'Loading...'}</>;
  return (
    <>
      <Head>
        <title>{'Coolmovies Frontend'}</title>
        <meta charSet='UTF-8' />
        <meta httpEquiv='X-UA-Compatible' content='IE=edge' />
        <meta name='viewport' content='width=device-width, initial-scale=1.0' />
      </Head>
      <ReduxProvider store={store}>
        <ApolloProvider client={client}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Component {...pageProps} />
          </ThemeProvider>
        </ApolloProvider>
      </ReduxProvider>
    </>
  );
};

export default App;
