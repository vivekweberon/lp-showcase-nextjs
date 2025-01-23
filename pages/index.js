import React from "react";
import PropTypes from "prop-types";
import path from "path";
import Head from "next/head";
import { basePath } from "@/next.config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import NextScript from "@/components/NextScript";
import Showcase from "@/components/Showcase";
import Realtor from "@/components/Realtor";
import Contact from "@/components/Contact";
import PopupForm from "@/components/PopupForm";
import scriptSources from "@/modules/scriptConfig";
import { getPropertyOutputDirectoryName } from "../utils/renameUtils.mjs";
import fs from "fs";
import yaml from "js-yaml";

// Filter for scripts that should always load
const alwaysLoadScripts = scriptSources.alwaysLoad || [];

// function to load YAML files
const loadYamlFile = async (filePath) => {
  const fileData = await fs.promises.readFile(filePath, "utf-8");
  return yaml.load(fileData);
};

// function to read property files
const readPropertyFiles = async (dataFolderPath) => {
  const propertyFolders = await fs.promises.readdir(dataFolderPath);
  const propertiesData = [];

  for (const folder of propertyFolders) {
    const folderPath = path.join(dataFolderPath, folder);
    const dataYamlPath = path.join(folderPath, "data.yaml");

    if (!fs.existsSync(folderPath) || !fs.existsSync(dataYamlPath)) continue;

    try {
      const propertyData = await fs.promises.readFile(dataYamlPath, "utf-8");
      const parsedData = yaml.load(propertyData);
      if (!parsedData?.homePageData) continue;

      const listingPageURL = getPropertyOutputDirectoryName(folder);
      parsedData.homePageData.listingPageURL = listingPageURL;
      propertiesData.push(parsedData.homePageData);
    } catch (error) {
      console.error(`Error processing file: ${dataYamlPath}`, error);
    }
  }

  return propertiesData;
};

function Home({ parsedHomeData, parsedGlobalData }) {
  console.log("Parsed Home Data", parsedHomeData);
  console.log("Parsed Global Data", parsedGlobalData);
  const title = parsedHomeData?.showcase?.sectionTitle || "Default Title";
  const menus = parsedHomeData?.showcase?.menu || [];
  const homePageSectionsOrder = parsedHomeData.homePageSectionsOrder ||
    parsedGlobalData.homePageSectionsOrder || [
      "description",
      title,
      "contact",
      "realtor",
    ];

  const menuValues = [];
  const orderedComponents = homePageSectionsOrder.map((section, index) => {
    switch (section) {
      case "showcase":
      case title:
        menuValues.push(menus);
        return (
          <Showcase
            key={`showcase_${index}`}
            properties={parsedHomeData.showcase?.properties || []}
            sectionTitle={parsedHomeData.showcase?.sectionTitle || title}
            navbarMenu={menus}
          />
        );
      case "realtor":
        menuValues.push("Realtor");
        return (
          <Realtor
            key={`realtor_${index}`}
            realtorData={parsedGlobalData.realtor || {}}
          />
        );
      case "contact":
        if (parsedGlobalData.contact?.mauticForm?.popupForm?.enable === false) {
          menuValues.push("Contact");
          return (
            <Contact
              key={`contact_${index}`}
              contact={parsedGlobalData.contact || {}}
            />
          );
        } else {
          return (
            <PopupForm
              key={`popupForm_${index}`}
              contact={parsedGlobalData.contact || {}}
            />
          );
        }
      default:
        return null;
    }
  });

  return (
    <div>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        />
        <link rel="stylesheet" href={`${basePath}/css/chatbot.css`} />
      </Head>
      {alwaysLoadScripts.map((src, index) => (
        <NextScript key={`script_${index}`} src={basePath + src} />
      ))}
      <Navbar navbar={menuValues} />
      {orderedComponents}
      <Footer
        footerMenu={menuValues}
        footertext={parsedGlobalData.footertext || ""}
      />
    </div>
  );
}

Home.propTypes = {
  parsedHomeData: PropTypes.shape({
    showcase: PropTypes.shape({
      sectionTitle: PropTypes.string.isRequired,
      menu: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]).isRequired,
      properties: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string.isRequired,
          addressLine1: PropTypes.string.isRequired,
          addressLine2: PropTypes.string.isRequired,
          bedsAndBaths: PropTypes.string.isRequired,
          price: PropTypes.string.isRequired,
          listingPageURL: PropTypes.string.isRequired,
        })
      ).isRequired,
    }).isRequired,
    homePageSectionsOrder: PropTypes.arrayOf(PropTypes.string),
  }).isRequired,
  parsedGlobalData: PropTypes.shape({
    homePageSectionsOrder: PropTypes.arrayOf(PropTypes.string),
    realtor: PropTypes.shape({
      name: PropTypes.string,
      photo: PropTypes.string,
      bio: PropTypes.string,
    }),
    contact: PropTypes.shape({
      phone: PropTypes.string,
      email: PropTypes.string,
      address: PropTypes.string,
      mauticForm: PropTypes.shape({
        popupForm: PropTypes.shape({
          enable: PropTypes.bool,
        }),
      }),
    }),
    footertext: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
};

export async function getStaticProps() {
  console.log("Home getStaticProps");
  try {
    const homeDataFilePath = path.join(process.cwd(), "data", "home", "data.yaml");
    const globalDataFilePath = path.join(process.cwd(), "data", "global", "data.yaml");
    const dataFolderPath = path.join(process.cwd(), "data");

    

    const [parsedHomeData, parsedGlobalData] = await Promise.all([
      loadYamlFile(homeDataFilePath),
      loadYamlFile(globalDataFilePath),
    ]);

    const propertiesData = await readPropertyFiles(dataFolderPath);
    parsedHomeData.showcase.properties = propertiesData;

    return {
      props: {
        parsedHomeData: parsedHomeData || { showcase: { sectionTitle: "", menu: [], properties: [] } },
        parsedGlobalData: parsedGlobalData || { homePageSectionsOrder: [], contact: {}, realtor: {}, footertext: "" },
      },
    };
  } catch (error) {
    console.error("Error fetching home data:", error);
    return {
      props: {
        parsedHomeData: { showcase: { sectionTitle: "", menu: [], properties: [] } },
        parsedGlobalData: { homePageSectionsOrder: [], contact: {}, realtor: {}, footertext: "" },
      },
    };
  }
}

export default Home;
