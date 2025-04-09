import React from "react";
import { basePath } from "@/next.config.js";

const Realtor = ({ realtor }) => {
  const { photo, name, company, id, phone, logo, sectionTitle, rFooterLink, rFooterLinkText, menu } = realtor;

  return (
    <div
      id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'realtor'}      
      className="container-fluid"
      style={{
        paddingTop: "50px",
        paddingBottom: "50px",
      }}
    >
      <div className="row">
        <div className="col-12" style={{ textAlign: "center" }}>
          <h1 id="realtorST">{sectionTitle}</h1>
        </div>
      </div>
      <div className="row no-gutters justify-content-center">
        <div className="col-8 col-sm-4 col-lg-3" style={{ marginTop: "20px" }}>
          <img
            id="rImage"
            srcSet={`${basePath + "/" + photo}?width=360 360w, ${basePath + "/" + photo}?width=576 576w, ${basePath + "/" + photo}?width=768 768w, ${basePath + "/" + photo}?width=992 992w, ${basePath + "/" + photo}?width=1200 1200w, ${basePath + "/" + photo}?width=1400 1400w, ${basePath + "/" + photo}?width=1600 1600w, ${basePath + "/" + photo}?width=1920 1920w`}
            sizes="(max-width: 360px) 360px, (max-width: 575px) 540px, 30vw"
            src={`${basePath + "/" + photo}?width=1920`}
            style={{ width: "100%" }}
            alt={name}
          />
        </div>
        <div
          className="col-12 col-sm-6 col-xl-5"
          style={{ color: "darkblue", textAlign: "center", marginTop: "10px" }}
        >
          <h1 id="rName">{name}</h1>
          <h3 id="rCompany">{company}</h3>
          <h3 id="rId">{id}</h3>
          <h3>
            {phone && <a
              id="rPhone"
              href={`tel:${phone}`} // Valid href for telephone link
              style={{ color: "darkblue", textDecoration: "underline" }}
            >
              Ph: {phone}
            </a>}
          </h3>
          <img
            id="rLogo"
            src={basePath + "/" + logo}
            alt="Logo"
            style={{ width: "50%" }}
          />
        </div>
      </div>
      <div
        id="rFooter"
        className="row no-gutters justify-content-center"
        style={{ marginTop: "20px" }}
      >
			  <div className="col-12" style={{textAlign: center}}> 
			    <h3 id="rFooterText"><a id="rFooterLink" href={rFooterLink} style={{color: darkblue, textDecoration: underline}}>{rFooterLinkText}</a></h3>
		    </div>
			</div>
    </div>
  );
};

export default Realtor;
