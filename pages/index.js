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

// Scripts that should always load
const alwaysLoadScripts = scriptSources.alwaysLoad || [];

// Helper: Load YAML file
const loadYamlFile = async (filePath) => {
  const fileData = await fs.promises.readFile(filePath, "utf-8");
  return yaml.load(fileData);
};

// Helper: Read property files (only those matching the current site)
const readPropertyFiles = async (dataFolderPath) => {
  const currentSiteName = process.env.siteToBuild;
  console.log("Current Environment Site Name:", currentSiteName);

  // Read all property folders inside the data directory
  const propertyFolders = await fs.promises.readdir(dataFolderPath);
  const propertiesData = [];

  for (const folder of propertyFolders) {
    const folderPath = path.join(dataFolderPath, folder);
    const dataYamlPath = path.join(folderPath, "data.yaml");

    // Skip if the folder or data.yaml file does not exist
    if (!fs.existsSync(folderPath) || !fs.existsSync(dataYamlPath)) {
      console.log(`Skipping: ${folder} (Missing folder or data.yaml)`);
      continue;
    }

    try {
      // Read and parse the YAML file
      const propertyData = await fs.promises.readFile(dataYamlPath, "utf-8");
      const parsedData = yaml.load(propertyData);

      console.log(`Checking Property: ${folder}, siteName: ${parsedData?.siteName}`);

      // Ensure property has valid homePageData and that its siteName matches the current site.
      if (!parsedData?.homePageData) {
        console.log(`Skipping: ${folder} (Missing homePageData)`);
        continue;
      }

      if (String(parsedData?.siteName).trim() !== String(currentSiteName).trim()) {
        console.log(`Skipping: ${folder} (siteName does not match)`);
        continue;
      }

      // Generate listing page URL and add property to the list
      const listingPageURL = getPropertyOutputDirectoryName(folder);
      parsedData.homePageData.listingPageURL = listingPageURL;
      propertiesData.push(parsedData.homePageData);

      console.log(`✔ Added Property: ${folder} (Matches siteName: ${parsedData?.siteName})`);
    } catch (error) {
      console.error(`Error processing file: ${dataYamlPath}`, error);
    }
  }

  console.log("Final Filtered Properties:", propertiesData);
  return propertiesData;
};

function Home({ parsedHomeData, parsedGlobalData }) {
  console.log("Parsed Home Data", parsedHomeData);
  console.log("Parsed Global Data", parsedGlobalData);

  // Use the showcase from the home data for title and menu.
  const title = parsedHomeData?.showcase?.sectionTitle || "Default Title";
  const menus = parsedHomeData?.showcase?.menu || [];

  // Determine the home page sections order.
  // Use home YAML order first; if not provided, fallback to the global YAML order (if global data was accepted)
  const homePageSectionsOrder =
    parsedHomeData.homePageSectionsOrder ||
    (parsedGlobalData && parsedGlobalData.homePageSectionsOrder) ||
    ["showcase", "contact", "realtor"];

  // Combine data for Realtor and Contact using home YAML first and falling back to global data if available.
  const realtorData = parsedHomeData.realtor || (parsedGlobalData && parsedGlobalData.realtor);
  const contactData = parsedHomeData.contact || (parsedGlobalData && parsedGlobalData.contact);

  const menuValues = [];
  const orderedComponents = homePageSectionsOrder.map((section, index) => {
    // Render Showcase if data exists
    if (section === "showcase" || section === title) {
      if (!parsedHomeData.showcase) return null;
      menuValues.push(menus);
      return (
        <Showcase
          key={`showcase_${index}`}
          properties={parsedHomeData.showcase.properties || []}
          sectionTitle={parsedHomeData.showcase.sectionTitle || title}
          navbarMenu={menus}
        />
      );
    }
    // Render Realtor only if data is provided
    if (section === "realtor") {
      if (!realtorData) return null;
      menuValues.push("Realtor");
      return (
        <Realtor key={`realtor_${index}`} realtorData={realtorData} />
      );
    }
    // Render Contact (or PopupForm) only if data is provided
    if (section === "contact") {
      if (!contactData) return null;
      // Decide which component to render based on the popupForm flag.
      menuValues.push("Contact");
      if (contactData.mauticForm?.popupForm?.enable === false) {
        return (
          <Contact key={`contact_${index}`} contact={contactData} />
        );
      } else {
        return (
          <PopupForm key={`popupForm_${index}`} contact={contactData} />
        );
      }
    }
    // For any other section, you can add additional components or return null.
    return null;
  });

  return (
    <div>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* Favicon to prevent 404 errors */}
        <link rel="icon" href="/favicon.ico" />
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
        footertext={
          parsedHomeData.footertext ||
          (parsedGlobalData && parsedGlobalData.footertext) ||
          ""
        }
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
        PropTypes.arrayOf(PropTypes.string)
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
    // Optionally provided sections order and component-specific data
    homePageSectionsOrder: PropTypes.arrayOf(PropTypes.string),
    contact: PropTypes.object,
    realtor: PropTypes.object,
    footertext: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }).isRequired,
  parsedGlobalData: PropTypes.shape({
    siteName: PropTypes.string,
    homePageSectionsOrder: PropTypes.arrayOf(PropTypes.string),
    realtor: PropTypes.object,
    contact: PropTypes.object,
    footertext: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  }),
};

export async function getStaticProps() {
  console.log("Home getStaticProps");
  try {
    const homeDataFilePath = path.join(process.cwd(), "data", "home", "data.yaml");
    const globalDataFilePath = path.join(process.cwd(), "data", "global", "data.yaml");
    const dataFolderPath = path.join(process.cwd(), "data");

    // Load home and global YAML files concurrently.
    const [parsedHomeData, parsedGlobalDataRaw] = await Promise.all([
      loadYamlFile(homeDataFilePath),
      loadYamlFile(globalDataFilePath),
    ]);

    // Get the current site name from environment and verify that home/data.yaml includes it.
    const siteNames = parsedHomeData?.siteName || [];
    const currentSiteName = process.env.siteToBuild;
    if (!Array.isArray(siteNames) || !siteNames.includes(currentSiteName)) {
      console.warn(
        `⚠ Skipping Home Page Generation: siteName "${currentSiteName}" not listed in home/data.yaml`
      );
      return { notFound: true };
    }

    // Only use global data if its siteName matches the current site.
    const effectiveGlobalData =
      parsedGlobalDataRaw?.siteName &&
      String(parsedGlobalDataRaw.siteName).trim() === String(currentSiteName).trim()
        ? parsedGlobalDataRaw
        : null;

    // Read and filter property files (only those matching the current site)
    const propertiesData = await readPropertyFiles(dataFolderPath);
    parsedHomeData.showcase.properties = propertiesData;

    console.log("✔ Home Page Generated for Site:", currentSiteName);
    return {
      props: {
        parsedHomeData: parsedHomeData || {
          showcase: { sectionTitle: "", menu: [], properties: [] }
        },
        parsedGlobalData: effectiveGlobalData,
      },
    };
  } catch (error) {
    console.error("❌ Error fetching home data:", error);
    return {
      props: {
        parsedHomeData: { showcase: { sectionTitle: "", menu: [], properties: [] } },
        parsedGlobalData: null,
      },
    };
  }
}

export default Home;
