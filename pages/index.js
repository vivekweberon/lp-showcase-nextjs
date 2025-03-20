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

import { loadYamlFile, getEffectiveData, getpropertiesHomePageData, addGlobalData } from "../utils/dataUtils";
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

    const propertiesHomePageData = await getpropertiesHomePageData(dataFolderPath, siteToBeBuilt);
    effectiveHomeData.showcase = effectiveHomeData.showcase || {};
    effectiveHomeData.showcase.properties = propertiesHomePageData;

    const homeDataFinal = addGlobalData(effectiveGlobalData, effectiveHomeData);
    return {
      props: {
        homeData: homeDataFinal,
      },
    };
  } catch (error) {
    console.error("Error loading data:", error);
    return { props: { homeData: {} } };
  }
}

function HomePage({ homeData }) {
  const { showcase, contact, realtor, footertext, chatbot, homePageSectionsOrder } = homeData;

  let menuItems = [];

  let sections;
  if(homePageSectionsOrder){
    sections = homePageSectionsOrder.map((section) => {
        switch (section) {
          case "showcase":
            return addShowcase(showcase);
          case "realtor":
            return addRealtor(realtor);
          case "contact":
            return addContact(contact);
          default:
            console.log(`Unknown section: ${section}`);
            return {notFound: true};
        }
      });
  } else {
    sections = [
        addShowcase(showcase),
        addRealtor(realtor),
        addContact(contact) 
      ];
  }

  function addMenuItem(menu) {
    if (menu) {
        menuItems.push(menu);
    }
  }


function addShowcase(showcase) {
  if (!showcase) return null;
  addMenuItem(showcase.menu);
  return (
    <Showcase
      key='showcase'
      showcase={showcase}
    />
  );
}

function addRealtor(realtor) {
  if (!realtor) return null;
  addMenuItem(realtor.menu);
  return (
    <Realtor 
      key='realtor'
      realtor={realtor}
    />
  );
}

function addContact(contact) {
  if (!contact) return null;
  addMenuItem(contact.menu);
  return contact.mauticForm?.popupForm?.enable === false
    ? <Contact key='contact' contact={contact} />
    : <PopupForm key='popupForm' contact={contact} />;
}

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href={`${basePath}/css/bootstrap.min.css`}
        />
        <link
          rel="stylesheet"
          href={`${basePath}/css/fa.min.css`}
        />
      </Head>
      <Script src={`${basePath}/js/areacodes.json`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/rb-config.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/logger.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/jquery-3.5.1.min.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/jwt-decode.js`} strategy="beforeInteractive" />
      <script type="text/javascript" src="https://accounts.google.com/gsi/client"></script>
      <Script src={`${basePath}/js/tracker-config.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/showcase.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/tracker-util.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/tracker.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/showdown-1.9.1.min.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/bootstrap.min.js`} strategy="beforeInteractive" />

      <Navbar menu={menuItems} />
      {sections}
      {chatbot.enable && <ChatBot />}
      <Footer menu={menuItems} text={footertext} />
      <Script src={`${basePath}/js/mauticTracking.js`} />
    </>
  );
}

export default HomePage;
