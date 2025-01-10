/* eslint-disable prettier/prettier */
import Script from "next/script";
import React, { useEffect } from "react";
import PropTypes from "prop-types";

const Contact = ({ contact }) => {
    useEffect(() => {
        const { mauticForm } = contact;
        setMauticForms(mauticForm.formSetName);
        setEmailFormHeader(mauticForm.emailFormHeader);
        setPhoneFormHeader(mauticForm.phoneFormHeader);
        enablePopupForm(popupForm.x, popupForm.y, popupForm.z);
        loadForm("lpContent");
    }, [contact]);

    return (
        <>

            {/* Added markup here */}
            <div id="lpModal" className="cmodal">
                <div id="lpContent" className="cmodal-content">
                    <span id="lpClose" className="close">
                        ×
                    </span>
                </div>
            </div>
            {/* End of added markup */}
            {/* <Script>{`let page = "lp"`}</Script> */}
        </>
    );
};

Contact.propTypes = {
    contact: PropTypes.shape({
        menu: PropTypes.string.isRequired,
        mauticForm: PropTypes.shape({
            emailFormHeader: PropTypes.string.isRequired,
            formSetName: PropTypes.string.isRequired,
            pageType: PropTypes.string.isRequired,
            phoneFormHeader: PropTypes.string.isRequired,
            popupForm: PropTypes.shape({
                enable: PropTypes.bool.isRequired,
                x: PropTypes.number.isRequired,
                y: PropTypes.number.isRequired,
                z: PropTypes.number.isRequired,
            }),
        }),
    }),
};

export default Contact;
