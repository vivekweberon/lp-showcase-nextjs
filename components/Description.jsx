import React from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";
import CustomAnchor from "./CustomAnchor";

const Description = ({ content, onLinkClick }) => {
  const renderAnchor = ({ children, href }) => (
    <CustomAnchor href={href} onLinkClick={onLinkClick}>
      {children}
    </CustomAnchor>
  );

  return (
    <div id="description" className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-10" style={{ textAlign: "center" }}></div>
      </div>
      <div className="row justify-content-center">
        <div className="col-10">
          <ReactMarkdown id="dContent" components={{ a: renderAnchor }}>
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
