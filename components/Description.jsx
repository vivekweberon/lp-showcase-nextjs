import Modal from "@/components/Modal";
import MarkdownIt from "markdown-it";
import MarkdownItAnchor from "markdown-it-anchor";
import React from "react";

const Description = ({ description }) => {
  const { content, menu, sectionTitle } = description;

  const md = new MarkdownIt({
    html: true,
    breaks: true,
  }).use(MarkdownItAnchor);

  const renderedContent = md.render(content);

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
          <h1 id="descriptionST"> {sectionTitle} </h1>
        </div>
      </div>
      <div className="row justify-content-center">
        <div className="col-10">
          <p id="dContent">
              {renderedContent}
          </p>
        </div>
      </div>
      <Modal />
    </div>
    
  );
};

export default Description;
