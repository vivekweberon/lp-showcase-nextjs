import React from "react";
import { basePath } from "@/next.config";
import Head from "next/head";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          rel="stylesheet"
          href={`${basePath}/css/lpStyle.css`}
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
