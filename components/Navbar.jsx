import React from "react";
import { Nav, Navbar } from "react-bootstrap";

function MyNavbar({ menu }) {
  return (
    <Navbar
      bg="dark"
      variant="dark"
      expand="md"
      fixed="top"
      data-testid="navbar"
      id="nav"
      style={{ padding: "8px 12px" }} // Add padding here
    >
      <Navbar.Toggle aria-controls="navbar-nav" />
      <Navbar.Collapse id="navbar-nav" className="justify-content-center">
        <Nav>
          {menu.map((item, index) => (
            <Nav.Link key={index} href={`#${item.replace(/\s/g, '').toLowerCase()}`}>
              {item}
            </Nav.Link>
          ))}
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  );
}

export default MyNavbar;
