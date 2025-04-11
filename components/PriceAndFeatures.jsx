import React from "react";

const PriceAndFeatures = ({ priceAndFeatures }) => {
  const { title1, title2, beds, baths, homeType, sqft, yearBuilt, price, menu } =
    priceAndFeatures;
  return (
    <div
      id={menu ? menu.replace(/\s/g, '').toLowerCase() : 'price&features'}
      className="container"
      style={{ paddingTop: "50px", paddingBottom: "50px" }}
    >
      <div className="row">
        <div className="col-sm-12" style={{ textAlign: "center" }}>
          <h1 id="pfTitle1">{title1}</h1>
          <h3 id="pfTitle2">{title2}</h3>
        </div>
      </div>
      <div className="row" style={{ margin: "auto", textAlign: "center" }}>

        {beds && <div
          id="pfBeds_c"
          className="col-6 col-sm-6 col-lg-4"
          style={{ marginTop: "50px" }}
        >
          <i className="fa fa-3x fa-bed"></i>
          <div id="pfBeds">{beds}</div>
        </div>}

        {baths && <div
          id="pfBaths_c"
          className="col-6 col-sm-6 col-lg-4"
          style={{ marginTop: "50px" }}
        >
          <i className="fa fa-3x fa-bath"> </i>
          <div id="pfBaths">{baths}</div>
        </div>}

        {homeType && <div
          id="pfHomeType_c"
          className="col-6 col-sm-6 col-lg-4"
          style={{ marginTop: "50px" }}
        >
          <i className="fa fa-3x fa-home"> </i>
          <div id="pfHomeType">{homeType}</div>
        </div>}

        {sqft && <div
          id="pfSqft_c"
          className="col-6 col-sm-6 col-lg-4"
          style={{ marginTop: "50px" }}
        >
          <i className="fa fa-3x fa-building"> </i>
          <div id="pfSqft">{sqft}</div>
        </div>}

        {yearBuilt && <div
          id="pfYearBuilt_c"
          className="col-6 col-sm-6 col-lg-4"
          style={{ marginTop: "50px" }}
        >
          <i className="fa fa-3x fa-calendar-week"> </i>
          <div id="pfYearBuilt">{yearBuilt}</div>
        </div>}

        {price && <div
          id="pfPrice_c"
          className="col-6 col-sm-6 col-lg-4"
          style={{ marginTop: "50px" }}
        >
          <i className="fa fa-3x fa-dollar-sign"> </i>
          <div id="pfPrice">{price}</div>
        </div>}

      </div>
    </div>
  );
};

export default PriceAndFeatures;
