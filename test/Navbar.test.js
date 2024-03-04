import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom'; // Importing the jest-dom library

import MyNavbar from '../components/Navbar';

test('renders MyNavbar with empty navbar', () => {
  const { getByTestId } = render(<MyNavbar navbar={[]} />);
  const navbarElement = getByTestId('navbar');
  expect(navbarElement).toBeInTheDocument();
});

test('renders MyNavbar with populated navbar', () => {
  const navbarData = [
    { menu: 'Home' },
    { menu: 'About' },
    { menu: 'Contact' }
  ];
  const { getByText } = render(<MyNavbar navbar={navbarData} />);
  navbarData.forEach(item => {
    const linkElement = getByText(item.menu);
    expect(linkElement).toBeInTheDocument();
  });
});

test('Nav.Link elements have correct href attributes', () => {
  const navbarData = [
    { menu: 'Home' },
    { menu: 'About' },
    { menu: 'Contact' }
  ];
  const { getByText } = render(<MyNavbar navbar={navbarData} />);
  navbarData.forEach(item => {
    const linkElement = getByText(item.menu);
    expect(linkElement).toHaveAttribute('href', `#${item.menu.toLowerCase()}`);
  });
});
