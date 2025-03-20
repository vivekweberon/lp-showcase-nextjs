import React, { useEffect } from "react";
import PropTypes from "prop-types";
import MarkdownIt from "markdown-it";
import MarkdownItAnchor from "markdown-it-anchor";

const Description = ({ onLinkClick, description }) => {
  const { content, menu } = description;
  useEffect(() => {
    const md = new MarkdownIt({
      html: true,
      breaks: true,
    }).use(MarkdownItAnchor);

    // Replace javascript: links with standard URLs
    const processedContent = content.replace(
      /\[([^\]]+)\]\(javascript:openModal\('([^']+)'\)\)/g,
      (match, text, url) => `[${text}](${url})`
    );

    const renderedContent = md.render(processedContent);

    const handleAnchorClick = (event) => {
      event.preventDefault();
      const url = event.target.href;
      onLinkClick(url);
    };

    const descriptionElement = document.getElementById("dContent");
    if (descriptionElement) {
      descriptionElement.innerHTML = renderedContent;

      const anchors = descriptionElement.getElementsByTagName("a");
      Array.from(anchors).forEach((anchor) => {
        anchor.addEventListener("click", handleAnchorClick);
      });
    }

    return () => {
      if (descriptionElement) {
        const anchors = descriptionElement.getElementsByTagName("a");
        Array.from(anchors).forEach((anchor) => {
          anchor.removeEventListener("click", handleAnchorClick);
        });
      }
    };
  }, [content, onLinkClick]);

  return (
    <div
      id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'description'}
      className="container-fluid"
      style={{
        paddingTop: "50px",
        paddingBottom: "50px",
        backgroundColor: "#fafafa",
      }}
    >
      <div className="row justify-content-center">
        <div className="col-10" style={{ textAlign: "center" }}>
          <h1 id="descriptionST"> Description </h1>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-10">
          <div id="dContent">
          </div>
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
