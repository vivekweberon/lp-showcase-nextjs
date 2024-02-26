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
          {/* Ensure footerMenu is properly initialized before rendering */}
          {footerMenu &&
            footerMenu.map((menuItem, index) => {
              // Check if menuItem is a string and not undefined
              if (typeof menuItem === "string" && menuItem.trim() !== "") {
                // Conditionally render menu items based on whether it's the home page or property page
                return (
                  <a
                    key={index}
                    href={`#${menuItem.toLowerCase()}`}
                    className="mx-3"
                  >
                    {menuItem}
                  </a>
                );
              }
              return null; // Render nothing if menuItem is not a string or empty
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

Footer.propTypes = {
  footerMenu: PropTypes.arrayOf(PropTypes.string.isRequired),
  footertext: PropTypes.shape({
    line1: PropTypes.string.isRequired,
    line2: PropTypes.string.isRequired,
    line3: PropTypes.string.isRequired,
  }).isRequired,
};

export default Footer;
