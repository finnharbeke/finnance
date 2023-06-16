import {
  ColorScheme,
  ColorSchemeProvider,
  MantineProvider,
} from "@mantine/core";
import { useColorScheme } from "@mantine/hooks";
import { Notifications } from "@mantine/notifications";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { queryClient } from "../actions/query";
import { useCustomTheme } from "../actions/theme";
import FinnanceModalProvider from "../contexts/ModalProvider";
import { FinnanceSpotlight } from "../actions/Spotlight";
import React from "react";
import type { AppProps } from "next/app";
import Head from "next/head";
import { AuthLayout, PublicLayout } from "../components/Layout";

function App({ Component, pageProps }: AppProps) {
  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  useEffect(() => {
    setColorScheme(preferredColorScheme);
  }, [preferredColorScheme]);

  const theme = useCustomTheme();

  return (
    <ColorSchemeProvider
      colorScheme={colorScheme}
      toggleColorScheme={toggleColorScheme}
    >
      <MantineProvider
        theme={{ ...theme, colorScheme }}
        withGlobalStyles
        withNormalizeCSS
      >
        <Notifications />
        <QueryClientProvider client={queryClient}>
          <FinnanceModalProvider>
            <FinnanceSpotlight>
              <Head>
                <title>finnance</title>
                <meta
                  name="viewport"
                  content="width=device-width, initial-scale=1"
                />
              </Head>
              <AuthLayout>
                <Component {...pageProps} />
              </AuthLayout>
            </FinnanceSpotlight>
          </FinnanceModalProvider>
        </QueryClientProvider>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}

export default App;
