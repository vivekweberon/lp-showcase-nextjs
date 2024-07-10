import React from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";

const Description = ({ sectionTitle, content, onLinkClick }) => {
  const renderAnchor = ({ children, href }) => (
    <a
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onLinkClick(href);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onLinkClick(href);
        }
      }}
      tabIndex={0}
      className="markdown-link"
    >
      {children}
    </a>
  );

  return (
    <div id="description" className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-10" style={{ textAlign: "center" }}>
          <h1 id="descriptionST">{sectionTitle}</h1>
        </div>
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
  sectionTitle: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
  onLinkClick: PropTypes.func.isRequired,
};

export default Description;
