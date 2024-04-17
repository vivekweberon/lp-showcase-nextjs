import React from "react";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import Showcase from "@/components/Showcase";
import Realtor from "@/components/Realtor";
import Contact from "@/components/Contact";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home({ parsedHomeData, parsedGlobalData }) {
  // Determine which homePageSectionsOrder to use
  const homePageSectionsOrder =
    parsedHomeData.homePageSectionsOrder ||
    parsedGlobalData.homePageSectionsOrder;

  let menuValues = [];

  // Map through the ordered sections and render components accordingly
  const orderedComponents = homePageSectionsOrder.map((section, index) => {
    switch (section) {
      case "Showcase":
        menuValues.push("Showcase");
        return (
          <Showcase
            key={`showcase_${index}`}
            properties={parsedHomeData.showcase.properties}
            sectionTitle={parsedHomeData.showcase.sectionTitle}
          />
        );
      case "Realtor":
        menuValues.push("Realtor");
        return (
          <Realtor
            key={`realtor_${index}`}
            realtorData={parsedGlobalData.realtor}
          />
        );
      case "Contact":
        menuValues.push("Contact");
        return (
          <Contact
            key={`contact_${index}`}
            contact={parsedGlobalData.contact}
          />
        );
      default:
        return null;
    }
  });

  return (
    <div>
      <Navbar navbar={menuValues} />
      {orderedComponents}
      <Footer
        footerMenu={menuValues}
        footertext={parsedGlobalData.footertext}
      />
    </div>
  );
}

export async function getStaticProps() {
  try {
    // Reading the home data.yaml
    const homeDataFilePath = path.join(process.cwd(), "home", "data.yaml");
    const homeData = await fs.promises.readFile(homeDataFilePath, "utf-8");
    const parsedHomeData = yaml.load(homeData);

    // Reading the global data.yaml
    const globalDataFilePath = path.join(process.cwd(), "global", "data.yaml");
    const globalData = await fs.promises.readFile(globalDataFilePath, "utf-8");
    const parsedGlobalData = yaml.load(globalData);

    // Reading the property files
    const dataFolderPath = path.join(process.cwd(), "data");
    const propertyFolders = await fs.promises.readdir(dataFolderPath);

    const propertiesData = [];

    for (const folder of propertyFolders) {
      const folderPath = path.join(dataFolderPath, folder);
      const dataYamlPath = path.join(folderPath, "data.yaml");

      // Check if the directory contains data.yaml
      if (fs.existsSync(dataYamlPath)) {
        const propertyData = await fs.promises.readFile(dataYamlPath, "utf-8");
        const parsedData = yaml.load(propertyData);
        // Extract homePageData and store it in propertiesData
        propertiesData.push(parsedData.homePageData);
      }
    }

    // Update home data.yaml with properties data
    parsedHomeData.showcase.properties = propertiesData;

    return {
      props: { parsedHomeData, parsedGlobalData },
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      props: {
        parsedHomeData: {},
        parsedGlobalData: {},
      },
    };
  }
}
