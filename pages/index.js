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

/**
 * Deep merge two objects recursively.
 * Properties from source will override those in target.
 */
function deepMerge(target, source) {
  if (typeof target !== "object" || target === null) return source;
  for (const key of Object.keys(source)) {
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      if (!target[key]) target[key] = {};
      target[key] = deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

/**
 * Returns the effective data for a YAML file.
 * If the YAML has a "default" key then that is used as a base,
 * otherwise the entire file (minus siteOverrides/siteName) is used.
 * Then, if there is a matching site override, that is merged on top.
 */
function getEffectiveData(parsedYaml, currentSiteName) {
  let effective = {};
  if (parsedYaml.default) {
    effective = parsedYaml.default;
  } else {
    // Clone the parsedYaml and remove keys that are not part of the actual content.
    effective = { ...parsedYaml };
    delete effective.siteOverrides;
    delete effective.siteName;
  }
  if (
    parsedYaml.siteOverrides &&
    parsedYaml.siteOverrides[currentSiteName]
  ) {
    effective = deepMerge(
      JSON.parse(JSON.stringify(effective)),
      parsedYaml.siteOverrides[currentSiteName]
    );
  }
  return effective;
}

// Helper: Read property files (only those matching the current site)
const readPropertyFiles = async (dataFolderPath) => {
  const currentSiteName = process.env.siteToBuild;
  console.log("Current Environment Site Name:", currentSiteName);

  // Read all folders inside the data directory
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
      const fileData = await fs.promises.readFile(dataYamlPath, "utf-8");
      const parsedData = yaml.load(fileData);

      // Ensure the property file's siteName includes the current site.
      if (parsedData.siteName) {
        if (Array.isArray(parsedData.siteName)) {
          if (
            !parsedData.siteName
              .map(String)
              .map(s => s.trim())
              .includes(String(currentSiteName).trim())
          ) {
            console.log(`Skipping: ${folder} (siteName does not match)`);
            continue;
          }
        } else if (
          String(parsedData.siteName).trim() !== String(currentSiteName).trim()
        ) {
          console.log(`Skipping: ${folder} (siteName does not match)`);
          continue;
        }
      } else {
        console.log(`Skipping: ${folder} (Missing siteName)`);
        continue;
      }

      // Use getEffectiveData to extract the actual property data from nested keys.
      const effectivePropertyData = getEffectiveData(parsedData, currentSiteName);

      console.log(
        `Checking Property: ${folder}, siteName: ${parsedData.siteName}`
      );

      // Ensure property has valid homePageData after merging overrides.
      if (!effectivePropertyData?.homePageData) {
        console.log(`Skipping: ${folder} (Missing homePageData)`);
        continue;
      }

      // Generate listing page URL and add property to the list.
      const listingPageURL = getPropertyOutputDirectoryName(folder);
      effectivePropertyData.homePageData.listingPageURL = listingPageURL;
      propertiesData.push(effectivePropertyData.homePageData);

      console.log(
        `✔ Added Property: ${folder} (Matches siteName: ${parsedData.siteName})`
      );
    } catch (error) {
      console.error(`Error processing file: ${dataYamlPath}`, error);
    }
  }

  console.log("Final Filtered Properties:", propertiesData);
  return propertiesData;
};

function HomePage({ parsedHomeData, parsedGlobalData }) {
  console.log("Effective Home Data", parsedHomeData.showcase.properties);
  console.log("Effective Global Data", parsedGlobalData);

  // Use the showcase from the home data for title and menu.
  const title =
    parsedHomeData?.showcase?.sectionTitle || "Default Title";
  const menus = parsedHomeData?.showcase?.menu || [];

  // Determine the home page sections order.
  // Use home YAML order first; if not provided, fallback to the global YAML order (if available)
  const homePageSectionsOrder =
    parsedHomeData.homePageSectionsOrder ||
    (parsedGlobalData && parsedGlobalData.homePageSectionsOrder) ||
    ["showcase", "contact", "realtor"];

  // Combine data for Realtor and Contact using home YAML first and falling back to global data if available.
  const realtorData =
    parsedHomeData.realtor || (parsedGlobalData && parsedGlobalData.realtor);
  const contactData =
    parsedHomeData.contact || (parsedGlobalData && parsedGlobalData.contact);

  const menuValues = [];
  const orderedComponents = homePageSectionsOrder.map((section, index) => {
    // Render Showcase if data exists.
    if (section === "showcase" || section === title) {
      if (!parsedHomeData.showcase) return null;
      menuValues.push(menus);
      return (
        <Showcase
          key={`showcase_${index}`}
          properties={parsedHomeData.showcase.properties || []}
          sectionTitle={
            parsedHomeData.showcase.sectionTitle || title
          }
          navbarMenu={menus}
        />
      );
    }
    // Render Realtor only if data is provided.
    if (section === "realtor") {
      if (!realtorData) return null;
      menuValues.push("Realtor");
      return (
        <Realtor key={`realtor_${index}`} realtorData={realtorData} />
      );
    }
    // Render Contact (or PopupForm) only if data is provided.
    if (section === "contact") {
      if (!contactData) return null;
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
    // For any other section, add additional components as needed.
    return null;
  });

  return (
    <div>
      <Head>
        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />
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
        <link
          rel="stylesheet"
          href={`${basePath}/css/chatbot.css`}
        />
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

HomePage.propTypes = {
  parsedHomeData: PropTypes.shape({
    showcase: PropTypes.shape({
      sectionTitle: PropTypes.string,
      menu: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.arrayOf(PropTypes.string)
      ]),
      properties: PropTypes.arrayOf(
        PropTypes.shape({
          url: PropTypes.string,
          addressLine1: PropTypes.string,
          addressLine2: PropTypes.string,
          bedsAndBaths: PropTypes.string,
          price: PropTypes.string,
          listingPageURL: PropTypes.string
        })
      )
    }),
    homePageSectionsOrder: PropTypes.arrayOf(PropTypes.string),
    contact: PropTypes.object,
    realtor: PropTypes.object,
    footertext: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  }).isRequired,
  parsedGlobalData: PropTypes.shape({
    siteName: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ]),
    homePageSectionsOrder: PropTypes.arrayOf(PropTypes.string),
    realtor: PropTypes.object,
    contact: PropTypes.object,
    footertext: PropTypes.oneOfType([PropTypes.string, PropTypes.object])
  })
};

export async function getStaticProps() {
  console.log("Home getStaticProps");
  try {
    const homeDataFilePath = path.join(
      process.cwd(),
      "data",
      "home",
      "data.yaml"
    );
    const globalDataFilePath = path.join(
      process.cwd(),
      "data",
      "global",
      "data.yaml"
    );
    const dataFolderPath = path.join(process.cwd(), "data");

    // Load home and global YAML files concurrently.
    const [rawHomeData, rawGlobalData] = await Promise.all([
      loadYamlFile(homeDataFilePath),
      loadYamlFile(globalDataFilePath)
    ]);

    // Get the current site name from environment.
    const currentSiteName = process.env.siteToBuild;
    // Check that the home data includes the current site.
    const homeSiteNames = rawHomeData?.siteName || [];
    if (
      !Array.isArray(homeSiteNames) ||
      !homeSiteNames
        .map(String)
        .map(s => s.trim())
        .includes(String(currentSiteName).trim())
    ) {
      console.warn(
        `⚠ Skipping Home Page Generation: siteName "${currentSiteName}" not listed in home/data.yaml`
      );
      return { notFound: true };
    }

    // Get effective home data by merging any site-specific overrides.
    const effectiveHomeData = getEffectiveData(rawHomeData, currentSiteName);

    // Only use global data if its siteName array includes the current site.
    const effectiveGlobalData =
      Array.isArray(rawGlobalData?.siteName) &&
      rawGlobalData.siteName
        .map(String)
        .map(s => s.trim())
        .includes(String(currentSiteName).trim())
        ? getEffectiveData(rawGlobalData, currentSiteName)
        : null;

    // Read and filter property files (only those matching the current site)
    const propertiesData = await readPropertyFiles(dataFolderPath);
    // Attach the property list to the showcase data.
    effectiveHomeData.showcase = effectiveHomeData.showcase || {};
    effectiveHomeData.showcase.properties = propertiesData;

    console.log("✔ Home Page Generated for Site:", currentSiteName);
    return {
      props: {
        parsedHomeData: effectiveHomeData || {
          showcase: { sectionTitle: "", menu: [], properties: [] }
        },
        parsedGlobalData: effectiveGlobalData
      }
    };
  } catch (error) {
    console.error("❌ Error fetching home data:", error);
    return {
      props: {
        parsedHomeData: { showcase: { sectionTitle: "", menu: [], properties: [] } },
        parsedGlobalData: null
      }
    };
  }
}

export default HomePage;
