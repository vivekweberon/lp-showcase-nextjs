import React from "react";
import PropTypes from "prop-types";
import { basePath } from "@/next.config";

const Showcase = ({ properties, sectionTitle, navbarMenu }) => {
  return (
    <div
      id={`${navbarMenu.toLowerCase()}`}
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
        {properties.map((property, index) => (
          <div
            className="col-sm-6 col-md-4 col-lg-3"
            style={{ padding: "2.5px" }}
            key={index}
          >
            <div className="card">
              <img
                srcSet={`
    ${basePath + "/" + property.listingPageURL + "/" + property.url}?width=360 360w,
    ${basePath + "/" + property.listingPageURL + "/" + property.url}?width=576 576w,
    ${basePath + "/" + property.listingPageURL + "/" + property.url}?width=768 768w,
    ${basePath + "/" + property.listingPageURL + "/" + property.url}?width=992 992w,
    ${basePath + "/" + property.listingPageURL + "/" + property.url}?width=1200 1200w,
    ${basePath + "/" + property.listingPageURL + "/" + property.url}?width=1400 1400w,
    ${basePath + "/" + property.listingPageURL + "/" + property.url}?width=1600 1600w,
    ${basePath + "/" + property.listingPageURL + "/" + property.url}?width=1920 1920w
  `}
                sizes="(max-width: 600px) 576px, (max-width: 768px) 768px, (max-width: 992px) 992px, (max-width: 1200px) 1200px, (max-width: 1400px) 1400px, (max-width: 1600px) 1600px, (max-width: 1920px) 1920px, 2000px"
                src={`${basePath + "/" + property.listingPageURL + "/" + property.url}?width=1920`}
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
                  <div style={{ fontWeight: "lighter" }}>{property.price}</div>
                  <a
                    href={basePath + "/" + property.listingPageURL}
                    style={{ textDecoration: "underline" }}
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

Showcase.propTypes = {
  properties: PropTypes.arrayOf(
    PropTypes.shape({
      url: PropTypes.string.isRequired,
      addressLine1: PropTypes.string.isRequired,
      addressLine2: PropTypes.string.isRequired,
      bedsAndBaths: PropTypes.string.isRequired,
      price: PropTypes.string.isRequired,
      listingPageURL: PropTypes.string.isRequired,
    })
  ).isRequired,
  sectionTitle: PropTypes.string.isRequired,
  navbarMenu: PropTypes.string.isRequired,
};

export default Showcase;
