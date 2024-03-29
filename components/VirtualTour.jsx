import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const VirtualTour = ({ virtualTour, navbarRef }) => {
  const { title, matterportID } = virtualTour;
  const [virtualTourHeight, setVirtualTourHeight] = useState();

  useEffect(() => {
    function setHeight() {
      const navHeight = navbarRef.current.clientHeight;
      const windowHeight = window.innerHeight;
      const newHeight = windowHeight - navHeight - 100;
      setVirtualTourHeight(newHeight + "px");
    }

    setHeight();
    window.addEventListener("resize", setHeight);

    return () => window.removeEventListener("resize", setHeight);
  }, [navbarRef]);

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
            style={{ width: "100%", height: virtualTourHeight }}
            data={`https://my.matterport.com/show/?m=${matterportID}`}
            aria-label="Virtual tour of the property"
          ></object>
        </div>
      </div>
    </div>
  );
};

VirtualTour.propTypes = {
  virtualTour: PropTypes.shape({
    title: PropTypes.string.isRequired,
    matterportID: PropTypes.string.isRequired,
  }).isRequired,
  navbarRef: PropTypes.object.isRequired, // Make sure to pass navbarRef as a prop
};

export default VirtualTour;
