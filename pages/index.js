import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Showcase from "../components/Showcase";
import Contact from "@/components/Contact";
import Realtor from "@/components/Realtor";

function Index() {
  const [navbar, setNavbar] = useState([]);
  const [showcaseData, setShowcaseData] = useState({ properties: [] });
  const [contact, setContact] = useState([]);
  const [realtor, setRealtor] = useState([]);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch("/data.json");
      const jsonData = await response.json();
      const navbarItems = Object.values(jsonData).filter((item) =>
        item.hasOwnProperty("menu")
      );
      setNavbar(navbarItems);
      setShowcaseData(jsonData.showcase);
      setContact(jsonData.contact);
      setRealtor(jsonData.realtor);
      console.log(jsonData.realtor);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <Navbar navbar={navbar} />
      <Showcase properties={showcaseData} />
      <Contact contact={contact} />
      <Realtor realtorData={realtor} />
    </div>
  );
}

export default Index;
