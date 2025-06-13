import React, { useEffect } from "react";
import Carousel from "react-bootstrap/Carousel";
import { basePath } from "@/next.config.js";

const Photos = ({ imageUrls, photos }) => {

  const { menu, sectionTitle } = photos;

  useEffect(() => {
    setCarouselHeight();
    window.addEventListener("resize", setCarouselHeight);
    return () => {
      window.removeEventListener("resize", setCarouselHeight);
    };
  }, []);

  return (
    <div
      id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'photos'}
      className="container-fluid"
      style={{ paddingTop: "50px", paddingBottom: "50px" }}
    >
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <h1 id="photosST">{sectionTitle}</h1>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <Carousel
            slide={false}
            interval={null}
            id="photosCarousel"
            className="carousel"
            style={{
              backgroundColor: "black",
              margin: "auto",
            }}
          >
            {imageUrls.urls.map((url, index) => {
              const path = `${basePath}${url}?width=`;
              return (
                <Carousel.Item key={index}>
                  <img
                    srcSet={`
                      ${path}360 360w,
                      ${path}576 576w,
                      ${path}768 768w,
                      ${path}992 992w,
                      ${path}1200 1200w,
                      ${path}1400 1400w,
                      ${path}1600 1600w,
                      ${path}1920 1920w
                    `}
                    sizes="100vw"
                    src={`${path}1920`}
                    className="d-block"
                    alt="Property"
                    style={{ margin: "auto", objectFit: "contain" }}
                    onError={console.log(`Error loading carousel image: ${url}`)}
                  />
                </Carousel.Item>
              );
            })}
          </Carousel>
        </div>
      </div>
    </div>
  );
};

export default Photos;
