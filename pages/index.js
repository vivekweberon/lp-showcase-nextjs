import React from "react";
import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import Showcase from "@/components/Showcase";
import Realtor from "@/components/Realtor";
import Contact from "@/components/Contact";
import Navbar from "@/components/Navbar";
import PopupForm from "../components/PopupForm";
import Footer from "@/components/Footer";

export default function Home({ propertiesData, globalData }) {
  console.log("PropertyData", propertiesData);
  console.log("globalData", globalData);
  const { realtor, contact, homePageSectionsOrder, footertext } = globalData;

  // Extract homePageData from each property file, ensuring to filter out undefined values
  const homePageDataList = Object.values(propertiesData)
    .map((propertyData) => propertyData.homePageData)
    .filter(Boolean);
  console.log("HomePageDataList", homePageDataList);

  let menuValues = [];

  const orderedComponents = homePageSectionsOrder.map((section) => {
    switch (section) {
      case "Showcase":
        menuValues.push("Showcase");
        return <Showcase properties={homePageDataList} />;
      case "Realtor":
        menuValues.push("Realtor");
        return <Realtor realtorData={realtor} />;
      case "Contact":
        if (contact && contact.mauticForm.popupForm.enable === false) {
          menuValues.push("Contact");
          return <Contact contact={contact} />;
        } else {
          return <PopupForm contact={contact} />;
        }
    }
  });

  return (
    <div>
      <Navbar navbar={menuValues} />
      {orderedComponents}
      <Footer footerMenu={menuValues} footertext={footertext} />
    </div>
  );
}

export async function getStaticProps() {
  try {
    // Read data from global file
    const globalFilePath = path.join("global", "data.yaml");
    const globalFileData = await fs.readFileSync(globalFilePath, "utf-8");
    const globalData = yaml.load(globalFileData);

    const files = await fs.readdirSync("data");

    const propertiesData = {};

    for (const file of files) {
      const filePath = path.join("data", file);
      const propertyData = await fs.readFileSync(filePath, "utf-8");

      const parsedData = yaml.load(propertyData);

      propertiesData[file] = parsedData;
    }

    return {
      props: {
        propertiesData: propertiesData,
        globalData: globalData,
      },
    };
  } catch (error) {
    console.error("Error fetching property data:", error);
    return {
      props: {
        propertiesData: {},
        globalData: {},
      },
    };
  }
}
