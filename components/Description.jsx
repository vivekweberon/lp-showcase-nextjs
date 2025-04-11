import React, { useEffect } from "react";
import Modal from "@/components/Modal";
import MarkdownIt from "markdown-it";
import MarkdownItAnchor from "markdown-it-anchor";

const Description = ({ description }) => {
  const { content, menu } = description;

  const [modalUrl, setModalUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const handleLinkClick = (url) => {
    setModalUrl(url);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

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
      handleLinkClick(url);
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
  }, [content, handleLinkClick]);

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
          <p id="dContent">
          </p>
        </div>
      </div>
      {showModal && (
        <Modal clickedUrl={modalUrl} onCloseModal={handleCloseModal} />
      )}
    </div>
    
  );
};

export default Description;
