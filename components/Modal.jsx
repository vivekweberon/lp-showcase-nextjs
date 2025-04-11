import React from "react";

const Modal = () => {

    return (
            <div
                className="modal fade"
                id="extLinkModal"
                tabIndex="-1"
                aria-labelledby="modalLabel"
                aria-hidden="true"
                style={{ paddingRight: "0px" }}
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
                            <h5 className="modal-title" id="modalLabel" ></h5>
                            <button
                                type="button"
                                className="close"
                                data-dismiss="modal"
                                aria-label="Close"
                            >
                                <span aria-hidden="true">×</span>
                            </button>
                        </div>
                        <div className="modal-body">
                            <iframe
                                id="modalIframe"
                                style={{ height: "80vh", width: "80vw" }}
                                src=""
                            ></iframe>
                        </div>
                    </div>
                </div>
            </div>
    );
};

export default Modal;