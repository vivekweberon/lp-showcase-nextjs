// Updated Description component
import React from "react";
import ReactMarkdown from "react-markdown";
import PropTypes from "prop-types";

const Description = ({ sectionTitle, content, onLinkClick }) => {
  // Function to handle link click
  const handleClick = (event) => {
    event.preventDefault();
    const url = event.target.href;
    onLinkClick(url);
  };

  return (
    <div id="description" className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-10" style={{ textAlign: "center" }}>
          <h1 id="descriptionST">{sectionTitle}</h1>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-10">
          <ReactMarkdown
            id="dContent"
            components={{
              // Customizing the anchor tag to call handleClick function
              a: ({ node, ...props }) => <a {...props} onClick={handleClick} />,
            }}
          >
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
