import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const Video = ({ video, navbarRef }) => {
  const { youtubeVideoID, menu } = video;
  const [videoHeight, setVideoHeight] = useState();
  const [videoWidth, setVideoWidth] = useState();
  console.log("NavbarRef", navbarRef.current);
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
      id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'video'}
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
            id="video2"
            style={{
              width: videoWidth,
              height: videoHeight,
              margin: "auto",
              maxWidth: "100%",
            }}
            src={`https://www.youtube.com/embed/${youtubeVideoID}?rel=0&controls=1&autoplay=0&cc_load_policy=1&modestbranding=1&showinfo=0&playsinline=1&enablejsapi=1&origin=https://ns-blue-weberealty.thrivebrokers.com/lp-showcase/`}
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
  navbarRef: PropTypes.object.isRequired,
};

export default Video;
