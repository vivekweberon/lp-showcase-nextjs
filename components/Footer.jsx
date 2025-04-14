import React from "react";

const Footer = ({ menu, text }) => {
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
        {menu?.map((menuItem) => {
          return menuItem ? (
            <div
              key={menuItem}
              className="col-6 col-sm-4 col-md-3 "
              style={{ textAlign: "center", textDecoration: "underline" }}
            >
              <a
                className="nav-item nav-link"
                href={`#${menuItem.replace(/\s/g, '').toLowerCase()}`}
                style={{ color: "#212529" }}
              >
                {menuItem}
              </a>
            </div>
          ) : null;
        })}
      </div>
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <div id="ftLine1">{text.line1}</div>
          <div id="ftLine2">{text.line2}</div>
          <div id="ftLine3">{text.line3}</div>
        </div>
      </div>
    </div>
  );
};

export default Footer;
