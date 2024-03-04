import React from "react";
import PropTypes from "prop-types";

const VirtualTour = ({ virtualTour }) => {
  const { title, matterportID } = virtualTour;

  return (
    <div
      id="virtual tour"
      className="container-fluid"
      style={{ paddingTop: "50px", paddingBottom: "50px" }}
    >
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <h1 id="virtualTourST">Virtual Tour</h1>
          <h4 id="vtTitle">{title}</h4>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <object
            id="vtVideo"
            style={{ width: "100%", height: "100vh" }}
            data={`https://my.matterport.com/show/?m=${matterportID}`}
          ></object>
        </div>
      </div>
    </div>
  );
};

export default VirtualTour;
