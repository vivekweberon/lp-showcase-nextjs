import React from "react";
import PropTypes from "prop-types";

const Video = ({ youtubeVideoID }) => {
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
            width="800px"
            height="450px"
            src={`https://www.youtube.com/embed/${youtubeVideoID}`}
            frameBorder="0"
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
};

export default Video;
