import React from "react";
import { Nav, Navbar } from "react-bootstrap";

function MyNavbar({ menu }) {
  // console.log("Navbar props:", { homePageMenuName });
  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="md"
      fixed="top"
      id="nav"
    >
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav" className="justify-content-center">
        <Nav>
          {menu.map((item, index) => (
            <Nav.Link
              key={index}
              href={`#${item.replace(/\s/g, '').toLowerCase()}`}
            >
              {item}
          </Nav.Link>
          ))}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default MyNavbar;
