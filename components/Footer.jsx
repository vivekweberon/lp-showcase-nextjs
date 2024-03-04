import React from "react";
import PropTypes from "prop-types";

const Footer = ({ footerMenu, footertext }) => {
  return (
    <div
      id="footer"
      className="container-fluid"
      style={{
        paddingTop: "50px",
        paddingBottom: "50px",
        backgroundColor: "#fafafa",
      }}
    >
      <div
        id="footerMenu"
        className="row justify-content-center"
        style={{ marginBottom: "40px" }}
      >
        <div className="col-12 text-center">
          {/* Ensure footerMenu is properly initialized and menuItem is not undefined/null before rendering */}
          {footerMenu &&
            footerMenu.map((menuItem, index) => {
              if (menuItem) {
                return (
                  <a
                    key={index}
                    href={`#${menuItem.toLowerCase()}`}
                    className="mx-3"
                  >
                    {menuItem}
                  </a>
                );
              } else {
                return null;
              }
            })}
        </div>
      </div>
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <div id="ftLine1">{footertext.line1}</div>
          <div id="ftLine2">{footertext.line2}</div>
          <div id="ftLine3">{footertext.line3}</div>
        </div>
      </div>
    </div>
  );
};


export default Footer;
