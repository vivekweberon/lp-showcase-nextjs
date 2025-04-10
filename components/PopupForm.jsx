/* eslint-disable prettier/prettier */
import Script from "next/script";
import React, { useEffect } from "react";

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

export default Contact;
