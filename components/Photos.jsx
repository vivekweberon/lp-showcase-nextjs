import React, { useState, useEffect } from "react";
import Carousel from "react-bootstrap/Carousel";
import { basePath } from "@/next.config";
import PropTypes from "prop-types";

const Photos = ({ photoUrls, navbarRef }) => {
  const [carouselHeight, setCarouselHeight] = useState();
  const [imageWidth, setImageWidth] = useState();

  useEffect(() => {
    function getImageWidth() {
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;
      const navHeight = navbarRef.current.clientHeight;
      const availHeight = windowHeight - navHeight - 20;
      let width = availHeight * 1.777;
      if (width + 30 > windowWidth) {
        width = windowWidth - 30;
      }
      return width + "px";
    }
    function setCarouselDimensions() {
      const width = getImageWidth();
      const height = parseFloat(width) / 1.777 + "px";
      // console.log("Image Height", height);
      setCarouselHeight(height);
      setImageWidth(width);
    }
    setCarouselDimensions();
    window.addEventListener("resize", setCarouselDimensions);
    return () => {
      window.removeEventListener("resize", setCarouselDimensions);
    };
  }, [navbarRef]);

  // console.log("PhotoURLS", photoUrls);
  return (
    <div
      id="photos"
      className="container-fluid"
      style={{ paddingTop: "50px", paddingBottom: "50px" }}
    >
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <h1 id="photosST">Photos</h1>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <Carousel
            id="photosCarousel"
            className="carousel slide"
            style={{
              backgroundColor: "black",
              maxWidth: "100%",
              width: imageWidth,
              height: carouselHeight,
              margin: "auto",
            }}
            interval={3000}
          >
            {photoUrls.map((url) => (
              <Carousel.Item key={url.id}>
                <img
                  srcSet={`${basePath + url}?width=360 360w, ${basePath + url}?width=576 576w, ${basePath + url}?width=768 768w, ${basePath + url}?width=992 992w, ${basePath + url}?width=1200 1200w, ${basePath + url}?width=1400 1400w, ${basePath + url}?width=1600 1600w, ${basePath + url}?width=1920 1920w`}
                  sizes="(max-width: 600px) 576px, (max-width: 768px) 768px, (max-width: 992px) 992px, (max-width: 1200px) 1200px, (max-width: 1400px) 1400px, (max-width: 1600px) 1600px, (max-width: 1920px) 1920px, 2000px"
                  src={`${basePath + url}?width=1920`}
                  className="d-block"
                  alt={"Property"}
                  style={{ width: imageWidth, height: carouselHeight }}
                />
              </Carousel.Item>
            ))}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

Photos.propTypes = {
  photoUrls: PropTypes.arrayOf(PropTypes.string).isRequired,
  navbarRef: PropTypes.object.isRequired,
};

export default Photos;
