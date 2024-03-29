import React from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";

// Custom Anchor component to render anchor tags
const CustomAnchor = ({ href, children, onLinkClick }) => {
  const handleAnchorClick = (event) => {
    event.preventDefault();
    onLinkClick(href);
  };

  const handleAnchorKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      handleAnchorClick(event);
    }
  };

  return (
    <a
      href={href}
      onClick={handleAnchorClick}
      onKeyDown={handleAnchorKeyDown}
      tabIndex={0}
      className="markdown-link"
    >
      {children}
    </a>
  );
};

CustomAnchor.propTypes = {
  href: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  onLinkClick: PropTypes.func.isRequired,
};

const Description = ({ sectionTitle, content, onLinkClick }) => {
  const renderAnchor = ({ children, href }) => (
    <CustomAnchor href={href} onLinkClick={onLinkClick}>
      {children}
    </CustomAnchor>
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
