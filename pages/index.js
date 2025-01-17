import React from "react";
import PropTypes from "prop-types";
import path from "path";
import Head from "next/head";
import Script from "next/script";
import { basePath } from "@/next.config";
import fs from "fs";
import yaml from "js-yaml";
import Showcase from "@/components/Showcase";
import Realtor from "@/components/Realtor";
import Contact from "@/components/Contact";
import PopupForm from "@/components/PopupForm";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getPropertyOutputDirectoryName } from "../utils/renameUtils.mjs";

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
function Home({ parsedHomeData, parsedGlobalData }) {
  const title = parsedHomeData.showcase.sectionTitle;
  const menus = parsedHomeData.showcase.menu;
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
        if (parsedGlobalData.contact.mauticForm.popupForm.enable === false) {
          menuValues.push("Contact");
          return (
            <Contact
              key={`contact_${index}`}
              contact={parsedGlobalData.contact}
            />
          );
        } else {
          return (
            <PopupForm
              key={`popupForm_${index}`}
              contact={parsedGlobalData.contact}
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
        
        <script
          async
          src="https://accounts.google.com/gsi/client"
        />
        
        <link rel="stylesheet" href={`${basePath}/css/chatbot.css`} />
        
      </Head>
      <Script strategy="beforeInteractive" src={`${basePath}/js/areacode.json`} type="application/json"/>
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/rb-config.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/generateUI_v1.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/logger.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/jquery-3.5.1.min.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/jwt-decode.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/tracker-config.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/showcase.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/tracker-util.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/tracker.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/showdown-1.9.1.min.js`} />
        <Script strategy="beforeInteractive" type="text/javascript" src={`${basePath}/js/inline-script.js`} />
      <Navbar navbar={menuValues} />
      {orderedComponents}
      <Footer
        footerMenu={menuValues}
        footertext={parsedGlobalData.footertext}
      />
    </div>
  );
}

Home.propTypes = {
  parsedHomeData: PropTypes.shape({
    showcase: PropTypes.shape({
      sectionTitle: PropTypes.string.isRequired,
      menu: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string),
      ]).isRequired,
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

export default Home;

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
