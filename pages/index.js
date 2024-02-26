import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Showcase from "../components/Showcase";
import Contact from "../components/Contact";
import Realtor from "../components/Realtor";
import Footer from "@/components/Footer";

function Index() {
  const [data, setData] = useState({
    navbar: [],
    showcase: { properties: [] },
    contact: [],
    realtor: [],
    footerMenu: [],
    footertext: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const response = await fetch("/data.json");
      const jsonData = await response.json();
      const { showcase, contact, realtor, homePageSectionsOrder, footertext } =
        jsonData;
      setData({
        navbar: Object.values(jsonData).filter((item) =>
          Object.prototype.hasOwnProperty.call(item, "menu")
        ),
        showcase,
        contact,
        realtor,
        footerMenu: homePageSectionsOrder,
        footertext,
      });
    };

    fetchData();
  }, []);

  const { navbar, showcase, contact, realtor, footerMenu, footertext } = data;

  return (
    <div>
      <Navbar navbar={navbar} />
      <Showcase properties={showcase} />
      <Contact contact={contact} />
      <Realtor realtorData={realtor} />
      <Footer footerMenu={footerMenu} footertext={footertext} />
    </div>
  );
}

export default Index;
