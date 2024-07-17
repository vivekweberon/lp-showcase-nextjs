/* eslint-disable prettier/prettier */
// CustomAnchor.jsx

import React from "react";
import PropTypes from "prop-types";

const CustomAnchor = ({ href, children, onLinkClick }) => {
    console.log("HREF!@#", href)
    console.log("children!@#", children)
    const handleAnchorClick = (event) => {
        event.preventDefault();  // Prevent the default link behavior
        console.log('CustomAnchor clicked:', href);  // Debugging line to show the href

        // Check if the href is a javascript:openModal link
        if (href.startsWith("javascript:openModal(")) {
            // Extract the URL from the javascript:openModal link
            const url = href.match(/javascript:openModal\('(.+?)'\)/)?.[1];
            if (url) {
                onLinkClick(url);  // Call onLinkClick with the extracted URL
            } else {
                console.error('Failed to extract URL from JavaScript command');
            }
        } else {
            // Handle regular links
            onLinkClick(href);  // Call onLinkClick with the regular href
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
