import React from "react";
import PropTypes from "prop-types";
import { basePath } from "@/next.config";

const Showcase = ({ properties }) => {
  // console.log("BasePath:", basePath); 

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
          <h1 id="showcaseST">{properties.sectionTitle}</h1>
        </div>
      </div>
      <div id="scGrid" className="row no-gutters justify-content-center">
        {properties.properties.map((property) => (
          <div
            className="col-sm-6 col-md-4 col-lg-3"
            style={{ padding: "2.5px" }}
            key={property.url}
          >
            <div className="card">
              {/* Log Image URL */}
              {/* {console.log("Image URL:", basePath + property.url)} */}
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
                    href={basePath + property.pageUrl}
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

export default Showcase;
