import Script from "next/script";
import React, { useEffect } from "react";

const Contact = ({ contact }) => {
    const { mauticForm } = contact;

    useEffect(() => {
        if (mauticForm) {            
            setMauticForms(mauticForm.formName, mauticForm.formID);
            setEmailFormHeader(mauticForm.emailFormHeader);
            setPhoneFormHeader(mauticForm.phoneFormHeader);
            enablePopupForm(mauticForm.popupForm.x, mauticForm.popupForm.y, mauticForm.popupForm.z);
            loadForm("lpContent");
        }
    }, 
    []);

    return (
        <>
            <div id="lpModal" className="cmodal">
                <div id="lpContent" className="cmodal-content">
                    <span id="lpClose" className="close">
                        ×
                    </span>
                </div>
            </div>
            <Script strategy="beforeInteractive">{`var page = "${mauticForm.pageType}"`}</Script>
        </>
    );
};

export default Contact;
