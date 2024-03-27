import React from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";

const Description = ({ sectionTitle, content, onLinkClick }) => {
  // Function to handle link click
  const handleClick = (event) => {
    const { tagName, href } = event.target;
    // Ensure the clicked element is an anchor tag
    if (tagName === "A") {
      event.preventDefault();
      onLinkClick(href);
    }
  };

  // Function to handle keyboard events
  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      handleClick(event);
    }
  };

  return (
    <div
      id="description"
      className="container-fluid"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button" // Adding role="button" to indicate it's clickable
      tabIndex="0" // Making it focusable
    >
      <div className="row justify-content-center">
        <div className="col-10" style={{ textAlign: "center" }}>
          <h1 id="descriptionST">{sectionTitle}</h1>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-10">
          <ReactMarkdown id="dContent">{content}</ReactMarkdown>
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
