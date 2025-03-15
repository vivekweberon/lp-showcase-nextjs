import React from "react";
import PropTypes from "prop-types";
import path from "path";
import Head from "next/head";
import Script from "next/script";

import { basePath } from "@/next.config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Showcase from "@/components/Showcase";
import Realtor from "@/components/Realtor";
import Contact from "@/components/Contact";
import PopupForm from "@/components/PopupForm";
import ChatBot from "@/components/ChatBot";

import { loadYamlFile, getEffectiveData, getpropertiesHomePageData, deepMerge } from "../utils/dataUtils";

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

    if (!homeData.siteName.includes(String(siteToBeBuilt).trim())) {
      console.error(`Skipping Home Page Generation: Site "${siteToBeBuilt}" not found in home/data.yaml`);
      return { notFound: true };
    }

    const effectiveHomeData = getEffectiveData(homeData, siteToBeBuilt);

    if (!globalData.siteName.includes(String(siteToBeBuilt).trim())) {
      console.error(`Skipping global data "${siteToBeBuilt}" not found in global/data.yaml`);
      return { notFound: true };
    }

    const effectiveGlobalData = getEffectiveData(globalData, siteToBeBuilt);

    const propertiesHomePageData = await getpropertiesHomePageData(dataFolderPath);
    effectiveHomeData.showcase = effectiveHomeData.showcase || {};
    effectiveHomeData.showcase.properties = propertiesHomePageData;

    const mergedData = deepMerge(effectiveGlobalData, effectiveHomeData);

    return {
      props: {
        homeData: mergedData,
      },
    };
  } catch (error) {
    console.error("Error loading data:", error);
    return { props: { homeData: {} } };
  }
}

function HomePage({ homeData }) {
  const { showcase, homePageSectionsOrder } = homeData;
  const { properties, sectionTitle, menu } = showcase;

  const { realtor: realtorData, contact: contactData, chatbot: chatbotData } = homeData;
  console.log("ContactData", contactData)
  let menuValues = [];

  const orderedComponents = homePageSectionsOrder
    ? homePageSectionsOrder.map((section, index) => {
        switch (section) {
          case "showcase":
            return renderShowcase(properties, sectionTitle, menu, index);
          case "realtor":
            return renderRealtor(realtorData, index);
          case "contact":
            return renderContact(contactData, index);
          case "chatbot":
            return renderChatBot(chatbotData, index);
          default:
            return null;
        }
      })
    : [
        renderShowcase(properties, sectionTitle, menu, 0),
        renderRealtor(realtorData, 1),
        renderContact(contactData, 2),
        renderChatBot(chatbotData, 3),
      ];

function renderShowcase(properties, sectionTitle, menu, index) {
  if (!properties) return null;
  menuValues.push(menu);
  return (
    <Showcase
      key={`showcase_${index}`}
      properties={properties}
      sectionTitle={sectionTitle}
      navbarMenu={menu}
    />
  );
}

function renderRealtor(realtorData, index) {
  if (!realtorData) return null;
  menuValues.push("Realtor");
  return <Realtor key={`realtor_${index}`} realtorData={realtorData} />;
}

function renderContact(contactData, index) {
  if (!contactData) return null;
  menuValues.push("Contact");
  return contactData.mauticForm?.popupForm?.enable === false
    ? <Contact key={`contact_${index}`} contact={contactData} />
    : <PopupForm key={`popupForm_${index}`} contact={contactData} />;
}

function renderChatBot(chatbotData, index) {
  if (!chatbotData?.enable) return null;
  return <ChatBot key={`chatbot_${index}`} />;
}

  return (
    <div>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="stylesheet" href={`${basePath}/css/chatbot.css`} />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css"
        />
      </Head>
      <Script src={`${basePath}/js/areacodes.json`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/rb-config.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/logger.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/jquery-3.5.1.min.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/jwt-decode.js`} strategy="beforeInteractive" />
      <Script src="https://accounts.google.com/gsi/client" />
      <Script src={`${basePath}/js/tracker-config.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/showcase.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/tracker-util.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/tracker.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/showdown-1.9.1.min.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/bootstrap.min.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/ytvideo_v1.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/chatbot.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/index.js`} strategy="beforeInteractive" />
      <Script src="https://kit.fontawesome.com/c3c47df7d6.js" strategy="beforeInteractive" />
      <Navbar navbar={menuValues} />
      {orderedComponents}
      <Footer footerMenu={menuValues} footertext={homeData.footertext || ""} />
      <Script src={`${basePath}/js/mauticTracking.js`} />
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
  }).isRequired
};

export default HomePage;
