import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import PropTypes from "prop-types";

function MyNavbar({ navbar, forwardedRef }) {
  // console.log("MyNavbar", navbar);
  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="md"
      fixed="top"
      data-testid="navbar"
      id="nav"
      ref={forwardedRef}
      style={{ padding: "8px 12px" }} // Add padding here
    >
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav" className="justify-content-center">
        <Nav>
          {navbar.map((item, index) => (
            <Nav.Link key={index} href={`#${item.replace(/\s/g, '').toLowerCase()}`}>
              {item}
            </Nav.Link>
          ))}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

MyNavbar.propTypes = {
  navbar: PropTypes.arrayOf(PropTypes.string).isRequired,
  forwardedRef: PropTypes.oneOfType([
    PropTypes.shape({ current: PropTypes.any }),
  ]),
};

export default MyNavbar;
