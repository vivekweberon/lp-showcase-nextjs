import Script from "next/script";
import React from "react";
import PropTypes from "prop-types";

const NextScript = ({ src }) => {
  if (!src) return null;
  return <Script strategy="beforeInteractive" src={src}></Script>;
};

NextScript.propTypes = {
  src: PropTypes.string.isRequired,
};

export default NextScript;
