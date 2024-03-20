import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const Video = ({ youtubeVideoID, navbarRef }) => {
  const [videoHeight, setVideoHeight] = useState();
  const [videoWidth, setVideoWidth] = useState();

  useEffect(() => {
    function getVideoDimensions() {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const navHeight = navbarRef.current.clientHeight;
      const availHeight = windowHeight - navHeight - 20;
      let height = availHeight;
      let width = height * 1.777;
      if (width > windowWidth) {
        width = windowWidth;
        height = width / 1.777;
      }
      return { width: width + "px", height: height + "px" };
    }

    function setVideoDimensions() {
      const { width, height } = getVideoDimensions();
      setVideoWidth(width);
      setVideoHeight(height);
    }

    setVideoDimensions();
    window.addEventListener("resize", setVideoDimensions);
    return () => {
      window.removeEventListener("resize", setVideoDimensions);
    };
  }, [navbarRef]);

  return (
    <div
      id="video"
      className="container-fluid"
      style={{
        paddingTop: "50px",
        paddingBottom: "50px",
        backgroundColor: "#fafafa",
      }}
    >
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <h1 id="videoST">Video</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <iframe
            id="homeVideo"
            style={{
              width: videoWidth,
              height: videoHeight,
              margin: "auto",
              maxWidth: "100%",
            }}
            src={`https://www.youtube.com/embed/${youtubeVideoID}`}
            allowFullScreen
            title="Property Video"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

Video.propTypes = {
  youtubeVideoID: PropTypes.string.isRequired,
  navbarRef: PropTypes.object.isRequired, // Ensure navbarRef is passed as prop
};

export default Video;
