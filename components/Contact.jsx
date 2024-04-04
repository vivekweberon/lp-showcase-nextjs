import Script from "next/script";
import React, { useEffect } from "react";
import PropTypes from "prop-types";

const Contact = ({ contact }) => {
  console.log("CONTACT", contact);
  useEffect(() => {
    const { mauticForm } = contact;

    // Configure Mautic form
    if (mauticForm) {
      // Configure Mautic form
      setMauticForms(mauticForm.formSetName);
      setEmailFormHeader(mauticForm.emailFormHeader);
      setPhoneFormHeader(mauticForm.phoneFormHeader);

      // Load Mautic form
      let popupForm = mauticForm.popupForm;
      if (popupForm && popupForm.enable === true) {
        enablePopupForm(popupForm.x, popupForm.y, popupForm.z);
        loadForm("lpContent");
      } else {
        loadForm("aside");
      }
    }
  }, [contact]);

  return (
    <>
      <div
        id="contact"
        className="container-fluid"
        style={{
          paddingTop: "50px",
          paddingBottom: "50px",
          backgroundColor: "#fafafa",
        }}
      >
        <div className="row">
          <div className="col-12" style={{ textAlign: "center" }}>
            <h1 id="contactST" style={{ marginBottom: "20px" }}>
              Contact
            </h1>
          </div>
        </div>
        <div className="row">
          <div
            id="aside"
            className="col-12"
            style={{ textAlign: "center" }}
          ></div>
        </div>
      </div>
      {/* Added markup here */}
      <div id="lpModal" className="cmodal">
        <div id="lpContent" className="cmodal-content">
          <span id="lpClose" className="close">
            ×
          </span>
        </div>
      </div>
      {/* End of added markup */}
      <Script>{`let page = "lp"`}</Script>
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
