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
        {/* Ensure footerMenu is properly initialized and menuItem is not undefined/null before rendering */}
        {footerMenu &&
          footerMenu.map((menuItem, index) => {
            if (menuItem) {
              return (
                <div
                  key={index}
                  className="col-6 col-sm-4 col-md-3 text-center"
                  style={{ textDecoration: "underline" }}
                >
                  <a
                    href={`#${menuItem.toLowerCase()}`}
                    style={{ color: "#212529" }}
                  >
                    {menuItem}
                  </a>
                </div>
              );
            } else {
              return null;
            }
          })}
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
  footerMenu: PropTypes.arrayOf(PropTypes.string), // Array of footer menu items
  footertext: PropTypes.shape({
    line1: PropTypes.string,
    line2: PropTypes.string,
    line3: PropTypes.string,
  }), // Footer text lines
};

export default Footer;
