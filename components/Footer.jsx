import React from "react";
import { basePath } from "@/next.config.js";

const Footer = ({ menu, footer, homePageMenuName }) => {
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
        {menu && menu.map((menuItem) => {
          return menuItem ? (
            <div
              key={menuItem}
              className="col-6 col-sm-4 col-md-3 "
              style={{ textAlign: "center", textDecoration: "underline" }}
            >
              <a
                className="nav-item nav-link"
                href={
                  homePageMenuName &&
                  menuItem === homePageMenuName
                    ? `${basePath}/`
                    : `#${menuItem.replace(/\s/g, '').toLowerCase()}`
                }
                style={{ color: "#212529" }}
              >
                {menuItem}
              </a>
            </div>
          ) : null;
        })}
      </div>
      <div className="row">
        {footer && <div className="col-12" style={{ textAlign: "center" }}>
          <div id="ftLine1">{footer.line1}</div>
          <div id="ftLine2">{footer.line2}</div>
          <div id="ftLine3">{footer.line3}</div>
        </div>}
      </div>
    </div>
  );
};

export default Footer;