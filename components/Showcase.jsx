import React from "react";
import { basePath } from "@/next.config.js";

const Showcase = ({ showcase }) => {
  const { properties, sectionTitle, menu } = showcase;
  
  return (
    <div
      id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'showcase'}
      className="container-fluid"
      style={{
        paddingTop: "50px",
        paddingBottom: "50px",
      }}
    >
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <h1 id="showcaseST">{sectionTitle}</h1>
        </div>
      </div>
      <div id="scGrid" className="row no-gutters justify-content-center">
      {properties.map((property, index) => {
        const path = `${basePath}/data/${property.listingPageURL}/images/${property.url}?width=`;
        return (
          <div
            className="col-sm-6 col-md-4 col-lg-3"
            style={{ padding: "2.5px" }}
            key={index}
          >
            <div className="card">
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
                sizes="(max-width: 575px) 100vw, (max-width: 767px) 50vw, (max-width: 991px) 33.33vw, 25vw"
                src={`${path}1920`}
                alt="Property"
                className="card-img-top"
                style={{ objectFit: "contain", width: "100%" }}
              />
              <div className="card-body">
                <div className="card-text">
                  <div>{property.addressLine1}</div>
                  <div>{property.addressLine2}</div>
                  <div style={{ fontWeight: "lighter" }}>
                    {property.bedsAndBaths}
                  </div>
                  <div style={{ fontWeight: "lighter" }}>
                    {property.price}
                  </div>
                  <a 
                    href={property.listingPageURL} 
                    style={{ textDecoration: "underline" }}
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      </div>
    </div>
  );
};

export default Showcase;
