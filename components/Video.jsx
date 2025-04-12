import React, { useEffect } from "react";

const Video = ({ video }) => {

  const { sectionTitle, youtubeVideoID, menu } = video;
  
  useEffect(() => {
    addVideo(youtubeVideoID);
    setVideoDimensions();

    window.addEventListener("resize", setVideoDimensions);
    return () => {
      window.removeEventListener("resize", setVideoDimensions);
    };
  }, []);

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
          <h1 id="videoST">{sectionTitle}</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <iframe
            id="video2"
            style={{
              width: "80%",
              height: "40vw",
            }}
            src=""
            allow="fullscreen"
            title="Property Video"
          ></iframe>
        </div>
      </div>
    </div>
  );
};

export default Video;
