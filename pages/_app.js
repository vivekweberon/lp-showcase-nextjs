import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.css";

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const basePath = process.env.BASE_PATH || "";

  return (
    <>
      <Head>
        <link
          href={`${basePath}https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css`}
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <link
          href={`${basePath}https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css`}
          rel="stylesheet"
          integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC"
          crossOrigin="anonymous"
        />
      </Head>
      <Component {...pageProps} />
    </>
  );
}

export default MyApp;
