/* eslint-disable prettier/prettier */
import React from "react";
import PropTypes from "prop-types";

const CustomAnchor = ({ href, children, onLinkClick }) => {
    const handleAnchorClick = (event) => {
        event.preventDefault();
        onLinkClick(href);
    };

    const handleAnchorKeyDown = (event) => {
        if (event.key === "Enter" || event.key === " ") {
            handleAnchorClick(event);
        }
    };

    return (
        <a
            href={href}
            onClick={handleAnchorClick}
            onKeyDown={handleAnchorKeyDown}
            tabIndex={0}
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
