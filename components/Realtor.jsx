import React from "react";
import { basePath } from "@/next.config.js";
import PropTypes from "prop-types";

const Realtor = ({ realtorData }) => {
  const { photo, name, company, id, phone, logo, sectionTitle } = realtorData;

  return (
    <div
      id="realtor"
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
            sizes="(max-width: 600px) 576px, (max-width: 768px) 768px, (max-width: 992px) 992px, (max-width: 1200px) 1200px, (max-width: 1400px) 1400px, (max-width: 1600px) 1600px, (max-width: 1920px) 1920px, 2000px"
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
            <a
              href={`tel:${phone}`} // Valid href for telephone link
              style={{ color: "darkblue", textDecoration: "underline" }}
            >
              {phone}
            </a>
          </h3>
          <img
            id="rLogo"
            src={basePath + "/" + logo}
            alt={name}
            style={{ width: "50%" }}
          />
        </div>
      </div>
      <div
        id="rFooter"
        className="row no-gutters justify-content-center"
        style={{ display: "none", marginTop: "20px" }}
      ></div>
    </div>
  );
};

Realtor.propTypes = {
  realtorData: PropTypes.shape({
    photo: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    company: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    logo: PropTypes.string.isRequired,
    sectionTitle: PropTypes.string.isRequired,
  }).isRequired,
};

export default Realtor;
