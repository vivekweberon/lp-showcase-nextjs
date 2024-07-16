// Description.jsx

import React from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";
import CustomAnchor from "./CustomAnchor";

const Description = ({ content, onLinkClick }) => {
  console.log("CONTENT", content);
  const renderAnchor = ({ children, href }) => {
    console.log("renderAnchor href:", href);
    return (
      <CustomAnchor href={href} onLinkClick={onLinkClick}>
        {children}
      </CustomAnchor>
    );
  };

  return (
    <div id="description" className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-10">
          <ReactMarkdown components={{ a: renderAnchor }}>
            {content}
          </ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

Description.propTypes = {
  content: PropTypes.string.isRequired,
  onLinkClick: PropTypes.func.isRequired,
};

export default Description;
