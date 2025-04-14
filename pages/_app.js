import React from "react";
import { basePath } from "@/next.config";

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
