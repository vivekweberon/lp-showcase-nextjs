import React, { useEffect } from "react";

const VirtualTour = ({ virtualTour }) => {
  const { title, sectionTitle, matterportID, menu } = virtualTour;

  useEffect(() => {
    console.log("VirtualTour useEffect");
    var virtualTourID = menu ? menu.replace(/\s/g, '').toLowerCase() : 'virtualtour'; 
    setVirtualTourHeight();
    window.addEventListener("resize", setVirtualTourHeight);

    return () => window.removeEventListener("resize", setVirtualTourHeight);
  }, []);

  return (
    <div
      id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'virtualtour'}     
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
