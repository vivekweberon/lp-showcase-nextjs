/* eslint-disable prettier/prettier */
// CustomAnchor.jsx

import React from "react";
import PropTypes from "prop-types";

const CustomAnchor = ({ href, children, onLinkClick }) => {
    const handleAnchorClick = (event) => {
        event.preventDefault();
        console.log('CustomAnchor clicked:', href);  // Debugging line

        // Check if the href is a javascript:openModal link
        if (href.startsWith("javascript:openModal(")) {
            // Extract the URL from the javascript:openModal link
            const url = href.match(/javascript:openModal\('(.+)'\)/)?.[1];
            if (url) {
                onLinkClick(url);
            }
        } else {
            // Handle regular links (if needed)
            onLinkClick(href);
        }
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

