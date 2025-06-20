'use client';
import React, {useState, useEffect} from "react";
import { basePath } from "@/next.config.js";
// import { logResourceLoadError } from "@/utils/clientUtils";

const Realtor = ({ realtor }) => {
  
  // function logResourceLoadError(event) {
  //   console.log("logResourceLoadError called with event - server", event);
  //   let src = event?.currentTarget?.src || event?.target?.src || event?.srcElement?.src || "unknown";
  //   let err = "Error loading: '" + src + "'";
  //   if (window.Rollbar) {
  //     Rollbar.error(err);
  //   } else {
  //     console.log(err);
  //   }
  //   return false;
  // }

  // const [showImages, setShowImages] = useState(false);

  // useEffect(() => {
  //   setShowImages(true);
  // }, []);

  // function logResourceLoadError(ref) {
  //   console.log("logResourceLoadError called with ref - client", ref);
  //   let err = "Error loading: '"+ (ref.src || ref.href) +"'";
  //   if(window.Rollbar){
  //     Rollbar.error(err);
  //   }else{
  //     console.log(err);
  //   }
  //   return false;
  // }

  // function logResourceLoadError(input) {
  //   let src = "unknown";

  //   // If called with an event object (e.g., from onError handler)
  //   if (input?.target || input?.currentTarget || input?.srcElement) {
  //     console.log("logResourceLoadError called with event - server", input);
  //     src = input.currentTarget?.src || input.target?.src || input.srcElement?.src || "unknown";
  //   } 
  //   // If called with a direct ref (like an img or link element)
  //   else if (input?.src || input?.href) {
  //     console.log("logResourceLoadError called with ref - client", input);
  //     src = input.src || input.href || "unknown";
  //   } 
  //   // Fallback
  //   else {
  //     console.log("logResourceLoadError called with unknown input", input);
  //   }

  //   const err = `Error loading: '${src}'`;
  //   if (typeof Rollbar !== "undefined" && Rollbar.error) {
  //     Rollbar.error(err);
  //   }
  //   console.log(err);
  //   return false;
  // } 

  function logResourceLoadError(ref) {
    console.log("logResourceLoadError called with ref - client", ref);
    let err = "Error loading: '"+ (ref.target.src || ref.target.href) +"'";
    Rollbar.error(err);
    console.log(err);
    return false;
  }

  const { photo, name, company, id, phone, logo, sectionTitle, footerText, footerLink, footerLinkText, menu } = realtor;

  const path = `${basePath}${photo}?width=`;
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
            srcSet={`
              ${path}360 360w, 
              ${path}576 576w, 
              ${path}768 768w, 
              ${path}992 992w, 
              ${path}1200 1200w, 
              ${path}1400 1400w, 
              ${path}1600 1600w, 
              ${path}1920 1920w`
            }
            sizes="(max-width: 360px) 360px, (max-width: 575px) 540px, 30vw"
            src={`${path}1920`}
            style={{ width: "100%" }}
            alt={name}
            onError={e => logResourceLoadError(e)}
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
            src={basePath + logo}
            alt="Logo"
            style={{ width: "50%" }}
            onError={e => logResourceLoadError(e)}
          />
        </div>
      </div>
      <div
        id="rFooter"
        className="row no-gutters justify-content-center"
        style={{ marginTop: "20px" }}
      >
			  <div className="col-12" style={{textAlign: "center"}}> 
			    {footerText}
          <h3 id="rFooterText"><a id="rFooterLink" href={footerLink} style={{color: "darkblue", textDecoration: "underline"}}>{footerLinkText}</a></h3>
		    </div>
			</div>
    </div>
  );
};

export default Realtor;
