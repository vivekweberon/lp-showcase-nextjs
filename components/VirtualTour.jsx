import React, { useEffect } from "react";

const VirtualTour = ({ virtualTour }) => {
  const { title, sectionTitle, matterportID, menu } = virtualTour;

  const virtualTourID = menu ? menu.replace(/\s/g, '').toLowerCase() : 'virtualtour';

  useEffect(() => {
    setVirtualTourHeight(virtualTourID);
    function setVTHeight (){
      setVirtualTourHeight(virtualTourID);
    }
    window.addEventListener("resize", setVTHeight);

    return () => window.removeEventListener("resize", setVTHeight);
  }, []);

  return (
    <div
      id={virtualTourID}     
      className="container-fluid"
      style={{ paddingTop: "50px", paddingBottom: "50px" }}
    >
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <h1 id="virtualTourST">{sectionTitle}</h1>
          <h4 id="vtTitle">{title}</h4>
        </div>
      </div>
      <div className="row">
        <div className="col-12">
          <object
            id="vtVideo"
            style={{ width: "100%", height:"100vh" }}
            data={`https://my.matterport.com/show/?m=${matterportID}`}
          ></object>
        </div>
      </div>
    </div>
  );
};

export default VirtualTour;
