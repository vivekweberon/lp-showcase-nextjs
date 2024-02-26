import React from "react";
import PropTypes from "prop-types";
import Carousel from "react-bootstrap/Carousel";

const Photos = ({ photoUrls }) => {
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
              margin: "auto",
              backgroundColor: "black",
              width: "800px", // Set width to 800 pixels
              height: "450px", // Set height to 450 pixels
            }}
            interval={3000} // Set automatic sliding interval to 3 seconds
          >
            {photoUrls.map((url, index) => (
              <Carousel.Item key={index}>
                <img
                  src={url}
                  className="d-block w-100"
                  alt={`Photo ${index}`}
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
};

export default Photos;
