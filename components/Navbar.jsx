import React from "react";
import PropTypes from "prop-types";
import { Nav, Navbar } from "react-bootstrap";

function MyNavbar({ navbar }) {
  // console.log(navbar)
  return (
    <Navbar bg="dark" variant="dark" expand="md" fixed="top" data-testid="navbar">
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

// MyNavbar.propTypes = {
//   navbar: PropTypes.arrayOf(
//     PropTypes.shape({
//       menu: PropTypes.string.isRequired,
//     })
//   ).isRequired,
// };

export default MyNavbar;
