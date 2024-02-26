import React from "react";
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
          <img id="rImage" src={photo} style={{ width: "100%" }} alt={name} />
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
              id="rPhone"
              href={`tel:${phone}`}
              style={{ color: "darkblue", textDecoration: "underline" }}
            >
              {phone}
            </a>
          </h3>
          <img id="rLogo" src={logo} alt={name} style={{ width: "50%" }} />
        </div>
      </div>
      <div
        id="rFooter"
        className="row no-gutters justify-content-center"
        style={{ display: "none", marginTop: "20px" }}
      >
        <div className="col-12" style={{ textAlign: "center" }}>
          <h3 id="rFooterText">
            <a
              id="rFooterLink"
              href=""
              style={{ color: "darkblue", textDecoration: "underline" }}
            >
              {sectionTitle}
            </a>
          </h3>
        </div>
      </div>
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
