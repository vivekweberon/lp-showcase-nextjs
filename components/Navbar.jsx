import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import PropTypes from "prop-types";

function MyNavbar({ navbar, forwardedRef }) {
  console.log("Navbar", navbar);
  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="md"
      fixed="top"
      data-testid="navbar"
      id="nav"
      ref={forwardedRef}
    >
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav" className="justify-content-center">
        <Nav>
          {navbar.map((item, index) => (
            <Nav.Link key={index} href={`#${item.toLowerCase()}`}>
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
