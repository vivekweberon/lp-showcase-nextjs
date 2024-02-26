import React from "react";
import PropTypes from "prop-types";
import { Nav, Navbar } from "react-bootstrap";

function MyNavbar({ navbar, isHomePage }) {
  return (
    <Navbar bg="dark" variant="dark" expand="md" fixed="top">
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav" className="justify-content-center">
        <Nav>
          {navbar.map(
            (item, index) =>
              // Add a conditional check for item.menu existence
              item.menu &&
              // Check if it's homepage and render homepage menus or if it's property page and render property page menus
              (isHomePage
                ? item.menu === "Home" && (
                    <Nav.Link key={index} href={`#${item.menu.toLowerCase()}`}>
                      {item.menu}
                    </Nav.Link>
                  )
                : item.menu !== "Home" && (
                    <Nav.Link key={index} href={`#${item.menu.toLowerCase()}`}>
                      {item.menu}
                    </Nav.Link>
                  ))
          )}
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
