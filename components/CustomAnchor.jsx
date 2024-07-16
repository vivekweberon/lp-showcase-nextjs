/* eslint-disable prettier/prettier */
// CustomAnchor.jsx

import React from "react";
import PropTypes from "prop-types";

const CustomAnchor = ({ href, children, onLinkClick }) => {
    const handleAnchorClick = (event) => {
        event.preventDefault();
        console.log('CustomAnchor clicked:', href);  // Debugging line
        onLinkClick(href);
    };

    return (
        <a
            href={href}
            onClick={handleAnchorClick}
            className="markdown-link"
        >
            {children}
        </a>
    );
};

CustomAnchor.propTypes = {
    href: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
    onLinkClick: PropTypes.func.isRequired,
};

export default CustomAnchor;

