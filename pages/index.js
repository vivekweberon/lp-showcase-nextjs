// ============================
// ✅ Imports
// ============================
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
import { loadYamlFile, getEffectiveData, readPropertyFiles } from "../utils/dataUtils";

// ============================
// ✅ Constants
// ============================
const alwaysLoadScripts = scriptSources.alwaysLoad || [];
const currentSiteName = process.env.siteToBuild;

// ============================
// ✅ getStaticProps - Fetch Data
// ============================
export async function getStaticProps() {
  try {
    const homeDataFilePath = path.join(process.cwd(), "data", "home", "data.yaml");
    const globalDataFilePath = path.join(process.cwd(), "data", "global", "data.yaml");
    const dataFolderPath = path.join(process.cwd(), "data");

    const [rawHomeData, rawGlobalData] = await Promise.all([
      loadYamlFile(homeDataFilePath),
      loadYamlFile(globalDataFilePath),
    ]);

    const homeSiteNames = [].concat(rawHomeData.siteName || []);
    if (!homeSiteNames.map(String).map(s => s.trim()).includes(String(currentSiteName).trim())) {
      console.warn(`⚠ Skipping Home Page Generation: Site "${currentSiteName}" not found in home/data.yaml`);
      return { notFound: true };
    }

    const effectiveHomeData = getEffectiveData(rawHomeData, currentSiteName);
    const effectiveGlobalData = (rawGlobalData?.siteName || [])
      .map(String)
      .map(s => s.trim())
      .includes(String(currentSiteName).trim())
      ? getEffectiveData(rawGlobalData, currentSiteName)
      : null;

    const propertiesData = await readPropertyFiles(dataFolderPath);
    effectiveHomeData.showcase = effectiveHomeData.showcase || {};
    effectiveHomeData.showcase.properties = propertiesData;

    return {
      props: {
        parsedHomeData: effectiveHomeData,
        parsedGlobalData: effectiveGlobalData,
      },
    };
  } catch (error) {
    console.error("❌ Error loading data:", error);
    return {
      props: { parsedHomeData: { showcase: { properties: [] } }, parsedGlobalData: null },
    };
  }
}

// ============================
// ✅ Component - HomePage
// ============================
function HomePage({ parsedHomeData, parsedGlobalData }) {
  const { showcase = {}, homePageSectionsOrder = [] } = parsedHomeData;
  const { properties = [], sectionTitle = "Default Title", menu = [] } = showcase;

  const sectionsOrder = homePageSectionsOrder.length
    ? homePageSectionsOrder
    : parsedGlobalData?.homePageSectionsOrder || ["showcase", "contact", "realtor"];

  const realtorData = parsedHomeData.realtor || parsedGlobalData?.realtor;
  const contactData = parsedHomeData.contact || parsedGlobalData?.contact;

  const menuValues = [];
  const components = sectionsOrder.map((section, index) => {
    if (section === "showcase") {
      menuValues.push(menu);
      return <Showcase key={index} properties={properties} sectionTitle={sectionTitle} navbarMenu={menu} />;
    } else if (section === "realtor" && realtorData) {
      menuValues.push("Realtor");
      return <Realtor key={index} realtorData={realtorData} />;
    } else if (section === "contact" && contactData) {
      menuValues.push("Contact");
      return contactData.mauticForm?.popupForm?.enable === false
        ? <Contact key={index} contact={contactData} />
        : <PopupForm key={index} contact={contactData} />;
    }
    return null;
  });

  return (
    <div>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" />
        <link rel="stylesheet" href={`${basePath}/css/chatbot.css`} />
      </Head>
      {alwaysLoadScripts.map((src, index) => <NextScript key={index} src={basePath + src} />)}
      <Navbar navbar={menuValues} />
      {components}
      <Footer footerMenu={menuValues} footertext={parsedHomeData.footertext || parsedGlobalData?.footertext || ""} />
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

// export async function getStaticProps() {
//   console.log("Home getStaticProps");
//   try {
//     const homeDataFilePath = path.join(
//       process.cwd(),
//       "data",
//       "home",
//       "data.yaml"
//     );
//     const globalDataFilePath = path.join(
//       process.cwd(),
//       "data",
//       "global",
//       "data.yaml"
//     );
//     const dataFolderPath = path.join(process.cwd(), "data");

//     // Load home and global YAML files concurrently.
//     const [rawHomeData, rawGlobalData] = await Promise.all([
//       loadYamlFile(homeDataFilePath),
//       loadYamlFile(globalDataFilePath)
//     ]);

//     // Get the current site name from environment.
//     const currentSiteName = process.env.siteToBuild;
//     // Check that the home data includes the current site.
//     const homeSiteNames = rawHomeData?.siteName || [];
//     if (
//       !Array.isArray(homeSiteNames) ||
//       !homeSiteNames
//         .map(String)
//         .map(s => s.trim())
//         .includes(String(currentSiteName).trim())
//     ) {
//       console.warn(
//         `⚠ Skipping Home Page Generation: siteName "${currentSiteName}" not listed in home/data.yaml`
//       );
//       return { notFound: true };
//     }

//     // Get effective home data by merging any site-specific overrides.
//     const effectiveHomeData = getEffectiveData(rawHomeData, currentSiteName);

//     // Only use global data if its siteName array includes the current site.
//     const effectiveGlobalData =
//       Array.isArray(rawGlobalData?.siteName) &&
//       rawGlobalData.siteName
//         .map(String)
//         .map(s => s.trim())
//         .includes(String(currentSiteName).trim())
//         ? getEffectiveData(rawGlobalData, currentSiteName)
//         : null;

//     // Read and filter property files (only those matching the current site)
//     const propertiesData = await readPropertyFiles(dataFolderPath);
//     // Attach the property list to the showcase data.
//     effectiveHomeData.showcase = effectiveHomeData.showcase || {};
//     effectiveHomeData.showcase.properties = propertiesData;

//     console.log("✔ Home Page Generated for Site:", currentSiteName);
//     return {
//       props: {
//         parsedHomeData: effectiveHomeData || {
//           showcase: { sectionTitle: "", menu: [], properties: [] }
//         },
//         parsedGlobalData: effectiveGlobalData
//       }
//     };
//   } catch (error) {
//     console.error("❌ Error fetching home data:", error);
//     return {
//       props: {
//         parsedHomeData: { showcase: { sectionTitle: "", menu: [], properties: [] } },
//         parsedGlobalData: null
//       }
//     };
//   }
// }

export default HomePage;
