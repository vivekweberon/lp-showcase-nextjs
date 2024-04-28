import React from "react";
import PropTypes from "prop-types";
import { basePath } from "@/next.config";

const Showcase = ({ properties, sectionTitle }) => {
  console.log("PropertiesXYXY", properties);
  return (
    <div
      id="showcase"
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
                src={basePath + property.url}
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
                    href={basePath + property.listingPageURL}
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
      // Assuming you have a pageUrl property
      // pageUrl: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Showcase;
