import React from "react";
import PropTypes from "prop-types";
import { Nav, Navbar } from "react-bootstrap";

function MyNavbar({ navbar }) {
  return (
    <Navbar bg="dark" variant="dark" expand="md" fixed="top">
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav" className="justify-content-center">
        <Nav>
          {navbar.map((item, index) => (
            <Nav.Link key={index} href={`#${item.menu.toLowerCase()}`}>
              {item.menu}
            </Nav.Link>
          ))}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

MyNavbar.propTypes = {
  navbar: PropTypes.arrayOf(
    PropTypes.shape({
      menu: PropTypes.string.isRequired,
      // Add additional PropTypes for other properties if needed
    })
  ).isRequired,
  isHomePage: PropTypes.bool.isRequired,
};

export default MyNavbar;
