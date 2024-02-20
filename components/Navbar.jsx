import React from "react";
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

export default MyNavbar;
