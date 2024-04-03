import Script from "next/script";
import React, { useEffect } from "react";
import PropTypes from "prop-types";

const Contact = ({ contact }) => {
  console.log("CONTACT", contact);
  useEffect(() => {
    // Configure Mautic form
    let mauticForm1 = contact.mauticForm;
    setMauticForms(mauticForm1.formSetName);
    setEmailFormHeader(mauticForm1.emailFormHeader);
    setPhoneFormHeader(mauticForm1.phoneFormHeader);
    enablePopupForm(popupForm.x, popupForm.y, popupForm.z);
    loadForm("lpContent");
    loadForm("aside");
  }, [contact]);

  return (
    <>
      <script src="/lp-showcase/js/areacodes.json"></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/rb-config.js"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/logger.js"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        src="/lp-showcase/js/jquery-3.5.1.min.js"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/jwt-decode.js"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="https://accounts.google.com/gsi/client"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/tracker-config.js"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/showcase.js"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/tracker-util.js"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/tracker.js"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/showdown-1.9.1.min.js"
      //onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/inline-script.js"
      //onError="logResourceLoadError(this)"
      ></script>
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
