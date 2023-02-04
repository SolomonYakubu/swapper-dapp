import "../styles/globals.css";
import type { AppProps } from "next/app";

import Head from "next/head";
function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>Swapper - Swap Dapp</title>
        <style>
          @import
          url(&quot;https://fonts.googleapis.com/css2?family=Questrial&family=Questrial&display=swap)
        </style>
        <meta property="og:title" content="Swapper - Swap Dapp" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="favicon-32x32.png"
        />

        <link rel="manifest" href="site.webmanifest" />
        <link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5" />
        <meta name="msapplication-TileColor" content="#da532c" />
        <meta name="theme-color" content="#0c0c0c"></meta>
        <link rel="icon" href="favicon.ico"></link>
        <link rel="shortcut icon" href="favicon.ico" />

        <meta property="og:description" content="" />
        <meta property="og:url" content="" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
