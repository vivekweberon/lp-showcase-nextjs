import React from "react";
import PropTypes from "prop-types";
import path from "path";
import Head from "next/head";

import { basePath } from "@/next.config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Showcase from "@/components/Showcase";
import Realtor from "@/components/Realtor";
import Contact from "@/components/Contact";
import PopupForm from "@/components/PopupForm";

import { loadYamlFile, getEffectiveData, getpropertiesHomePageData } from "../utils/dataUtils";
import { exit } from "process";
import { notFound } from "next/navigation";

const siteToBeBuilt = process.env.siteName;

export async function getStaticProps() {
  try {
    const homeDataFilePath = path.join(process.cwd(), "data", "home", "data.yaml");
    const globalDataFilePath = path.join(process.cwd(), "data", "global", "data.yaml");
    const dataFolderPath = path.join(process.cwd(), "data");

    const [homeData, globalData] = await Promise.all([
      loadYamlFile(homeDataFilePath),
      loadYamlFile(globalDataFilePath),
    ]);

    // const homeSiteNames = [].concat(homeData.siteName || []);
    if (!homeData.siteName.includes(String(siteToBeBuilt).trim())) {
      console.error(`Skipping Home Page Generation: Site "${siteToBeBuilt}" not found in home/data.yaml`);
      exit
    }

    const effectiveHomeData = getEffectiveData(homeData, siteToBeBuilt);

    if (!globalData.siteName.includes(String(siteToBeBuilt).trim())) {
      console.error(`Skipping global data "${siteToBeBuilt}" not found in global/data.yaml`);
      return ({notFound: true});
    }

    const effectiveGlobalData = getEffectiveData(globalData, siteToBeBuilt);

    const propertiesHomePageData = await getpropertiesHomePageData(dataFolderPath);
    effectiveHomeData.showcase = effectiveHomeData.showcase || {};
    effectiveHomeData.showcase.properties = propertiesHomePageData;

    return {
      props: {
        homeData: effectiveHomeData,
        globalData: effectiveGlobalData,
      },
    };
  } catch (error) {
    console.error("Error loading data:", error);
  }
}

function HomePage({ homeData, globalData }) {
  const { showcase = {}, homePageSectionsOrder = [] } = homeData;
  const { properties = [], sectionTitle = "Default Title", menu = [] } = showcase;

  const sectionsOrder = homePageSectionsOrder.length
    ? homePageSectionsOrder
    : globalData?.homePageSectionsOrder || ["showcase", "contact", "realtor"];

  const realtorData = homeData.realtor || globalData?.realtor;
  const contactData = homeData.contact || globalData?.contact;

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
        <link rel="script" href={`${basePath}/js/areacodes.json`} />
        <link rel="script" href={`${basePath}/js/rb-config.js`} />
        <link rel="script" href={`${basePath}/js/logger.js`} />
        <link rel="script" href={`${basePath}/js/jquery-3.5.1.min.js`} />
        <link rel="script" href={`${basePath}/js/jwt-decode.js`} />
        <link rel="script" href="https://accounts.google.com/gsi/client" />
        <link rel="script" href={`${basePath}/js/tracker-config.js`} />
        <link rel="script" href={`${basePath}/js/tracker-util.js`} />
        <link rel="script" href={`${basePath}/js/showcase.js`} />
        <link rel="script" href={`${basePath}/js/tracker.js`} />
        <link rel="script" href={`${basePath}/js/showdown-1.9.1.min.js`} />
        <link rel="script" href={`${basePath}/js/bootstrap.min.js`} />
        <link rel="script" href={`${basePath}/js/ytvideo_v1.js`} />
        {chatbot.enable && <link rel="script" href={`${basePath}/js/chatbot.js`} />}
        {chatbot.enable && <link rel="script" href={`${basePath}/js/index.js`} />}
        {chatbot.enable && <link rel="script" href="https://kit.fontawesome.com/c3c47df7d6.js" />}
        {chatbot.enable && <link rel="stylesheet" href={`${basePath}/css/chatbot.css`} />}
      </Head>
      <Navbar navbar={menuValues} />
      {components}
      <Footer footerMenu={menuValues} footertext={homeData.footertext || globalData?.footertext || ""} />
      <link rel="script" href={`${basePath}/js/mauticTracking.js`} />
    </div>
  );
}
HomePage.propTypes = {
  homeData: PropTypes.shape({
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
  globalData: PropTypes.shape({
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


export default HomePage;
