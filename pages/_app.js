import React from "react";
import PropTypes from "prop-types"; // Import PropTypes
import Head from "next/head";
import "../styles/globals.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.css";

function MyApp({ Component, pageProps }) {
  const basePath = process.env.BASE_PATH || "";

  return (
    <>
      <Head></Head>
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
