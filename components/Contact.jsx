import React, { useEffect, useState } from "react";

const Contact = ({ contact }) => {
  const [data, setData] = useState(contact);
  useEffect(() => {
    console.log(data);
  });
  return (
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
        <div id="aside" className="col-12" style={{ textAlign: "center" }}>
          { }
        </div>
      </div>
    </div>
  );
};

export default Contact;
