import React, { useEffect } from "react";
import path from "path";
import Head from "next/head";
import Script from "next/script";
import { basePath } from "@/next.config";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Showcase from "@/components/Showcase";
import Realtor from "@/components/Realtor";
import EmbeddedForm from "@/components/EmbeddedForm";
import PopupForm from "@/components/PopupForm";
import ChatBot from "@/components/ChatBot";

import { ErrorBoundary } from '@rollbar/react';

import {
  loadYamlFile,
  getEffectiveData,
  getpropertiesHomePageData,
  addGlobalData,
  getEffectiveGlobalData,
} from "../utils/dataUtils";

const siteToBeBuilt = process.env.siteName;

export async function getStaticProps() {
  try {
    const homeDataFilePath = path.join(process.cwd(), "..", "data-repo", "home", "data.yaml");
    const globalDataFilePath = path.join(process.cwd(), "..", "data-repo", "global", "data.yaml");
    const dataFolderPath = path.join(process.cwd(), "..", "data-repo");

    const [homeData, globalData] = await Promise.all([
      loadYamlFile(homeDataFilePath),
      loadYamlFile(globalDataFilePath),
    ]);

    if (!homeData.siteName.includes(String(siteToBeBuilt).trim())) {
      console.error(`Skipping Home Page Generation: Site "${siteToBeBuilt}" not found in home/data.yaml`);
      return { notFound: true };
    }

    const effectiveHomeData = getEffectiveData(homeData, siteToBeBuilt);
    if (effectiveHomeData?.realtor?.photo) {
      effectiveHomeData.realtor.photo = `/data/global/images/${effectiveHomeData.realtor.photo}`;
    }
    if (effectiveHomeData?.realtor?.logo) {
      effectiveHomeData.realtor.logo = `/data/global/images/${effectiveHomeData.realtor.logo}`;
    }

    if (effectiveHomeData?.showcase) {
      const propertiesHomePageData = await getpropertiesHomePageData(dataFolderPath, siteToBeBuilt);
      effectiveHomeData.showcase.properties = propertiesHomePageData;
    }

    let homeDataFinal = {};
    if (!globalData.siteName.includes(String(siteToBeBuilt).trim())) {
      console.error(`Skipping global data, "${siteToBeBuilt}" not found in global/data.yaml`);
    } else {
      let effectiveGlobalData = getEffectiveGlobalData(globalData, siteToBeBuilt);
      homeDataFinal = addGlobalData(effectiveGlobalData, effectiveHomeData, effectiveHomeData?.homePageSectionsOrder);
    }

    if (Object.keys(homeDataFinal).length === 0) {
      console.log("Skipping building Home Page as no sections are defined");
      return { notFound: true };
    }

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
  useEffect(() => {
    rollbar.info('HomePage loaded');
    throw new Error('💥 Test Rollbar Error in useEffect');
  }, []);

  const { page, showcase, contact, realtor, footer, chatbot, homePageSectionsOrder } = homeData;

  let menuItems = [];
  let sections;

  if (homePageSectionsOrder) {
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
          return { notFound: true };
      }
    });
  } else {
    sections = [
      addShowcase(showcase),
      addContact(contact),
      addRealtor(realtor),
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
    return <Showcase key="showcase" showcase={showcase} />;
  }

  function addRealtor(realtor) {
    if (!realtor) return null;
    addMenuItem(realtor.menu);
    return <Realtor key="realtor" realtor={realtor} />;
  }

  function addContact(contact) {
    if (!contact) return null;
    let form = contact.mauticForm;
    if (form) {
      if (form.popupForm) {
        if (form.popupForm.enable === false) {
          addMenuItem(contact.menu);
          return <EmbeddedForm key="contact" contact={contact} />;
        } else {
          return <PopupForm key="contact" contact={contact} />;
        }
      } else {
        addMenuItem(contact.menu);
        return <EmbeddedForm key="contact" contact={contact} />;
      }
    } else {
      return null;
    }
  }

  return (
    <ErrorBoundary>
      <>
        <Head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          {page?.title && <title>{page.title}</title>}
          <link rel="icon" href="/favicon.ico" />
          <link rel="stylesheet" href={`${basePath}/css/bootstrap.min.css`} />
          <link rel="stylesheet" href={`${basePath}/css/fa.min.css`} />
          <link rel="stylesheet" href={`${basePath}/css/lpStyle.css`} />
        </Head>
        <Script src={`${basePath}/js/rb-config.js`} strategy="beforeInteractive" />
        <Script src={`${basePath}/js/logger.js`} strategy="beforeInteractive" />
        <Script src={`${basePath}/js/jquery-3.5.1.min.js`} strategy="beforeInteractive" />
        <Script src={`${basePath}/js/jwt-decode.js`} strategy="beforeInteractive" />
        <script type="text/javascript" src="https://accounts.google.com/gsi/client"></script>
        <Script src={`${basePath}/js/tracker-config.js`} strategy="beforeInteractive" />
        <Script src={`${basePath}/js/tracker-util.js`} strategy="beforeInteractive" />
        <Script src={`${basePath}/js/showcase.js`} strategy="beforeInteractive" />
        <Script src={`${basePath}/js/tracker.js`} strategy="beforeInteractive" />
        <Script src={`${basePath}/js/showdown-1.9.1.min.js`} strategy="beforeInteractive" />
        <Script src={`${basePath}/js/bootstrap.min.js`} strategy="beforeInteractive" />
        <Script src={`${basePath}/js/mauticTracking.js`} strategy="beforeInteractive" />

        <Navbar menu={menuItems} />
        {sections}
        {chatbot && <ChatBot chatbotDFAgent={chatbot.chatbotDFAgent} />}
        {footer && <Footer menu={menuItems} footer={footer} />}
      </>
    </ErrorBoundary>
  );
}

export default HomePage;
