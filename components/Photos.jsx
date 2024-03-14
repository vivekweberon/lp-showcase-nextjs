import React from "react";
import Carousel from "react-bootstrap/Carousel";
// import { basePath } from "@/next.config";

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
              width: "800px",
              height: "450px",
            }}
            interval={3000}
          >
            {photoUrls.map((url, index) => (
              <Carousel.Item key={index}>
                <img
                  srcSet={`${url}?width=360 360w, ${url}?width=576 576w, ${url}?width=768 768w, ${url}?width=992 992w, ${url}?width=1200 1200w, ${url}?width=1400 1400w, ${url}?width=1600 1600w, ${url}?width=1920 1920w`}
                  sizes="(max-width: 600px) 576px, (max-width: 768px) 768px, (max-width: 992px) 992px, (max-width: 1200px) 1200px, (max-width: 1400px) 1400px, (max-width: 1600px) 1600px, (max-width: 1920px) 1920px, 2000px"
                  src={`${url}?width=1920`}
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

export default Photos;
