import Script from "next/script";
import React, { useEffect, useState } from "react";

const Contact = ({ contact }) => {
  const [data, setData] = useState(contact);
  console.log("Form data", data);

  useEffect(() => {
    // Configure Mautic form
    let mauticForm1 = data.mauticForm;
    setMauticForms(mauticForm1.formSetName);
    setEmailFormHeader(mauticForm1.emailFormHeader);
    setPhoneFormHeader(mauticForm1.phoneFormHeader);
    loadForm("aside");
  });

  return (
    <>
      <script
        src="/lp-showcase/js/jquery-3.5.1.min.js"
        onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/jwt-decode.js"
        onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="https://accounts.google.com/gsi/client"
        onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/tracker-config.js"
        onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/tracker-util.js"
        onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/showcase.js"
        onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/tracker.js"
        onError="logResourceLoadError(this)"
      ></script>
      <script
        type="text/javascript"
        src="/lp-showcase/js/showdown-1.9.1.min.js"
        onError="logResourceLoadError(this)"
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
      <Script>{`let page = "lp"`}</Script>
    </>
  );
};

export default Contact;
