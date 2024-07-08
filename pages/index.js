import React from "react";
import path from "path";
import fs from "fs";
import yaml from "js-yaml";
import Showcase from "@/components/Showcase";
import Realtor from "@/components/Realtor";
import Contact from "@/components/Contact";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPropertyOutputDirectoryName } from "../utils/renameUtils";

// Utility function to load YAML files
const loadYamlFile = async (filePath) => {
  const fileData = await fs.promises.readFile(filePath, "utf-8");
  return yaml.load(fileData);
};

// Utility function to read property files
const readPropertyFiles = async (dataFolderPath) => {
  const propertyFolders = await fs.promises.readdir(dataFolderPath);
  const propertiesData = [];

  for (const folder of propertyFolders) {
    const folderPath = path.join(dataFolderPath, folder);
    const dataYamlPath = path.join(folderPath, "data.yaml");

    if (fs.existsSync(dataYamlPath)) {
      const propertyData = await fs.promises.readFile(dataYamlPath, "utf-8");
      const parsedData = yaml.load(propertyData);
      const listingPageURL = getPropertyOutputDirectoryName(folder);
      parsedData.homePageData.listingPageURL = listingPageURL;
      propertiesData.push(parsedData.homePageData);
    }
  }
  return propertiesData;
};

// Home component
export default function Home({ parsedHomeData, parsedGlobalData }) {
  console.log("parsedHomeData", parsedHomeData);
  console.log("parsedGlobalData", parsedGlobalData);

  const title = parsedHomeData.showcase.sectionTitle;
  const menus = parsedHomeData.showcase.menu;
  const homePageSectionsOrder = parsedHomeData.homePageSectionsOrder ||
    parsedGlobalData.homePageSectionsOrder || [
      "description",
      title,
      "contact",
      "realtor",
    ];

  console.log("homePageSectionsOrder", homePageSectionsOrder);

  const menuValues = [];
  const orderedComponents = homePageSectionsOrder.map((section, index) => {
    switch (section) {
      case "showcase":
      case title:
        menuValues.push(menus);
        return (
          <Showcase
            key={`showcase_${index}`}
            properties={parsedHomeData.showcase.properties}
            sectionTitle={parsedHomeData.showcase.sectionTitle}
            navbarMenu={menus}
          />
        );
      case "realtor":
        menuValues.push("Realtor");
        return (
          <Realtor
            key={`realtor_${index}`}
            realtorData={parsedGlobalData.realtor}
          />
        );
      case "contact":
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

  console.log("ORDEREDCOMPONENTS", orderedComponents);

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

// getStaticProps function
export async function getStaticProps() {
  try {
    const homeDataFilePath = path.join(process.cwd(), "home", "data.yaml");
    const globalDataFilePath = path.join(process.cwd(), "global", "data.yaml");
    const dataFolderPath = path.join(process.cwd(), "data");

    const [parsedHomeData, parsedGlobalData] = await Promise.all([
      loadYamlFile(homeDataFilePath),
      loadYamlFile(globalDataFilePath),
    ]);

    const propertiesData = await readPropertyFiles(dataFolderPath);
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
