/* eslint-disable prettier/prettier */
import React, { useEffect, useRef } from "react";
import PropTypes from "prop-types"; // Import PropTypes

const Modal = ({ clickedUrl, onCloseModal }) => {
    const bodyRef = useRef(document.body);

    useEffect(() => {
        const body = bodyRef.current;
        const originalOverflow = body.style.overflow;

        body.style.overflow = "hidden";

        return () => {
            body.style.overflow = originalOverflow;
        };
    }, []);

    console.log('Modal clickedUrl:', clickedUrl);  // Debugging line

    return (
        <>
            <div
                className="modal fade show"
                id="extLinkModal"
                tabIndex="-1"
                aria-labelledby="modalLabel"
                aria-hidden="true"
                style={{ display: "block", paddingRight: "0px" }}
            >
                <div
                    className="modal-dialog modal-dialog-centered"
                    style={{
                        maxWidth: "fit-content",
                        marginLeft: "auto",
                        marginRight: "auto",
                    }}
                >
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="modalLabel" style={{ visibility: "hidden" }}>Modal</h5>
                            <button
                                type="button"
                                className="close"
                                data-dismiss="modal"
                                aria-label="Close"
                                onClick={onCloseModal}
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <iframe
                                id="modalIframe"
                                style={{ height: "80vh", width: "80vw" }}
                                title="Modal"
                                src={clickedUrl}
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
            <div className="modal-backdrop fade show"></div>
        </>
    );
};

export default Modal;