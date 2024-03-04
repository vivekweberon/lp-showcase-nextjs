import React from "react";
import Head from "next/head";
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <link
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
          rel="stylesheet"
          crossOrigin="anonymous"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
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
