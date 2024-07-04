import React from "react";
import PropTypes from "prop-types";
import Head from "next/head";
import "../styles/globals.css";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        {/* <script src="/lp-showcase/js/areacodes.json"></script> */}
      </Head>
      <Component {...pageProps} />
    </>
  );
}

// Define prop types for MyApp component
MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
};

export default MyApp;
