import React from "react";
import ReactMarkdown from "react-markdown";

const Description = ({ sectionTitle, content }) => {
  return (
    <div
      id="description"
      className="container-fluid"
      style={{
        paddingTop: "50px",
        paddingBottom: "50px",
        backgroundColor: "#fafafa",
      }}
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

export default Description;
