import Script from "next/script";
import React, { useState, useEffect } from "react";

const EmbeddedForm = ({ contact}) => {
  const {menu, mauticForm, sectionTitle } = contact;

  useEffect(() => {
    if (mauticForm) {
      setMauticForms(mauticForm.formSetName);
      setEmailFormHeader(mauticForm.emailFormHeader);
      setPhoneFormHeader(mauticForm.phoneFormHeader);
      let popupForm = mauticForm.popupForm;
      if (popupForm && popupForm.enable === true) {
        enablePopupForm(popupForm.x, popupForm.y, popupForm.z);
        loadForm("lpContent");
      } else {
        loadForm("aside");
        let formLoadCheckInterval = setInterval(function(){
          if(isFormLoaded()){
            if(isEndOfForm()){
              console.log("End of form reached");
            }
            clearInterval(formLoadCheckInterval);
          }
        },200);
      }
    }
  }, []);

  return (
    <>
      <div
        id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'contact'}
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
              {sectionTitle}
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
      <Script strategy="beforeInteractive">{`var page = "${contact.mauticForm.pageType}"`}</Script>
    </>
  );
};

export default EmbeddedForm;
