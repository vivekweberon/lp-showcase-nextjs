import React from "react";
import { basePath } from "@/next.config";
import Head from "next/head";
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import Script from "next/script";

import Navbar from "@/components/Navbar";
import Home from "@/components/Home";
import Footer from "@/components/Footer";
import PriceAndFeatures from "@/components/PriceAndFeatures";
import Photos from "@/components/Photos";
import Video from "@/components/Video";
import VirtualTour from "@/components/VirtualTour";
import EmbeddedForm from "@/components/EmbeddedForm";
import Realtor from "@/components/Realtor";
import Description from "@/components/Description";
import PopupForm from "@/components/PopupForm";
import ChatBot from "@/components/ChatBot";

import { getPropertyOutputDirectoryName } from "@/utils/renameUtils.js";
import { loadYamlFile, getEffectiveData, addGlobalData, getEffectiveGlobalData } from "../utils/dataUtils";

const PropertyPage = ({ propertyData, images }) => {
  
  const {
    page,
    home,
    virtualTour,
    priceAndFeatures,
    description,
    photos,
    video,
    contact,
    realtor,
    footer,
    chatbot,
    propertyPageSectionsOrder,
    homePageLink
  } = propertyData;

  let menuItems = [];
  let sections;
  let homePageMenuName;
  
  if (propertyPageSectionsOrder) {
    sections = propertyPageSectionsOrder.map((section) => {
        switch (section) {
          case "home":
            return addHome(home);
          case "virtualTour":
            return addVirtualTour(virtualTour);
          case "priceAndFeatures":
            return addPriceAndFeatures(priceAndFeatures);
          case "photos":
            return addPhotos(photos);
          case "video":
            return addVideo(video);
          case "contact":
            return addContact(contact);
          case "realtor":
            return addRealtor(realtor);
          case "description":
            return addDescription(description);
          default:
            console.log(`Unknown section: ${section}`);
            return {notFound: true};
        }
      })
  }else{
    sections = [
        addHome(home),
        addVirtualTour(virtualTour),
        addPriceAndFeatures(priceAndFeatures),
        addDescription(description),
        addPhotos(photos),
        addVideo(video),
        addContact(contact),
        addRealtor(realtor)
      ];}

  if(homePageLink){
    homePageMenuName = homePageLink?.menu || "Home Page";
    addMenuItem(homePageMenuName);
  }

  function addMenuItem(menu) {
    if (menu) {
        menuItems.push(menu);
    }
  }

  function addHome(home) {
    if (!home) return null;
    addMenuItem(home.menu);
    return (
      <Home
        key='home'
        home={home}
      />
    );
  }

  function addVirtualTour(virtualTour) {
    if (!virtualTour) return null;
    addMenuItem(virtualTour.menu);
    return (
      <VirtualTour
        key='virtualTour'
        virtualTour={virtualTour}
      />
    );
  }

  function addPriceAndFeatures(priceAndFeatures) {
    if (!priceAndFeatures) return null;
    addMenuItem(priceAndFeatures.menu);
    return (
      <PriceAndFeatures
        key='priceAndFeatures'
        priceAndFeatures={priceAndFeatures}
      />
    );
  }

  function addDescription(description) {
    if (!description) return null;
    addMenuItem(description.menu);
    return (
      <Description
        key='description'
        description={description}
      />
    );
  }

  function addPhotos(photos) {
    if (!photos) return null;
    addMenuItem(photos.menu);
    return (
      <Photos
        key='photos'
        imageUrls={{ urls: images }}
        photos={photos}
      />
    );
  }

  function addVideo(video) {
    if (!video) return null;
    addMenuItem(video.menu);
    return (
      <Video
        key='video'
        video={video}
      />
    );
  }

  function addContact(contact) {
    if (!contact) return null;
    let form = contact.mauticForm;
    if (form){
      if (form.popupForm){
        if (form.popupForm.enable === false)
        {
          addMenuItem(contact.menu);
          return <EmbeddedForm key='contact' contact={contact} />
        }else{
          return <PopupForm key='contact' contact={contact} />;
        }
      }else{
        addMenuItem(contact.menu);
        return <EmbeddedForm key='contact' contact={contact} />
      }
    }else{
      return null;
    }
  }

  function addRealtor(realtor) {
    if (!realtor) return null;
    addMenuItem(realtor.menu);
    return <Realtor key='realtor' realtor={realtor} />;
  }

  return (
    <div>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {page?.title && <title>{page.title}</title>}
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href={`${basePath}/css/bootstrap.min.css`}
          onerror="logResourceLoadError(this)"
        />
        <link
          rel="stylesheet"
          href={`${basePath}/css/fa.min.css`}
          onerror="logResourceLoadError(this)"
        />
        <link
          rel="stylesheet"
          href={`${basePath}/css/lpStyle.css`}
          onerror="logResourceLoadError(this)"
        />
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
      {(home?.youtubeVideoID || video?.youtubeVideoID) && <Script src={`${basePath}/js/ytvideo.js`} strategy="beforeInteractive" />}
      <Script src={`${basePath}/js/mauticTracking.js`} strategy="beforeInteractive" />

      <Navbar menu={menuItems} homePageMenuName={homePageMenuName} />
      {sections}
      {footer && <Footer menu={menuItems} footer={footer} homePageMenuName={homePageMenuName} />}
      {chatbot && <ChatBot chatbotDFAgent={chatbot.chatbotDFAgent} />}
      {(home?.youtubeVideoID || video?.youtubeVideoID) && <Script src="https://www.youtube.com/iframe_api" />}
    </div>
  );
};

export async function getStaticPaths() {
  const dataFolderPath = path.join(process.cwd(), "..", "data-repo");
  const siteName = process.env.siteName;
  try {
    const files = await fs.readdir(dataFolderPath);
    const filteredFiles = files.filter(
      (file) => file !== "global" && file !== "home" && file !== ".git" && file !== "readme.txt"
    );
    let paths = [];
    for (const file of filteredFiles) {
      const filePath = path.join(dataFolderPath, file, "data.yaml");
      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const parsedData = yaml.load(fileContent);
        if (parsedData.siteName && parsedData.siteName.includes(siteName)) {
          paths.push({
            params: { id: getPropertyOutputDirectoryName(file) },
          });
        }
      } catch (error) {
        console.error(`Error reading data.yaml for ${file}:`, error);
        return {
          paths: [],
          fallback: false,
        };
      }
    }
    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    console.error("Error in getStaticPaths:", error);
    return {
      paths: [],
      fallback: false,
    };
  }
}

export async function getStaticProps(context) {
  const { id } = context.params;
  const siteName = process.env.siteName;
  const originalId = getPropertyOutputDirectoryName(id);

  const propertyDataPath = path.join(process.cwd(), "..", "data-repo", originalId, "data.yaml");
  const globalDataPath = path.join(process.cwd(), "..", "data-repo", "global", "data.yaml");

  try {
    const propertyData = await loadYamlFile(propertyDataPath);
    const globalData = await loadYamlFile(globalDataPath);

    if ((!propertyData.siteName || !propertyData.siteName.includes(siteName)) || (propertyData.createPage && propertyData.createPage === false)) {
      console.warn(`Skipping page for ${id}, siteName does not match ${siteName}`);
      return { notFound: true };
    }

    const effectivePropertyData = getEffectiveData(propertyData, siteName);
    if (effectivePropertyData?.realtor?.photo){
      effectivePropertyData.realtor.photo = `/data/global/images/${effectivePropertyData.realtor.photo}`;
    }
    if (effectivePropertyData?.realtor?.logo){
      effectivePropertyData.realtor.logo = `/data/global/images/${effectivePropertyData.realtor.logo}`;
    }

    if (propertyData.createPage && propertyData.createPage === false){
      console.warn(`Skipping page for ${id}, as createPage is set to false`);
      return { notFound: true };
    }

    let mergedData = {};
    if (!globalData.siteName.includes(String(siteName).trim())) {
      console.error(`Skipping global data, "${siteName}" not found in global/data.yaml`);
    }else{
      let effectiveGlobalData = getEffectiveGlobalData(globalData, siteName);
      mergedData = addGlobalData(effectiveGlobalData, effectivePropertyData, effectivePropertyData?.propertyPageSectionsOrder);
    }

    let imageUrls = [];
    if(mergedData?.photos){
      const imagesFolder = path.join(process.cwd(), "..", "data-repo", originalId, "images");
      const imageFiles = await fs.readdir(imagesFolder);
      imageUrls = imageFiles.map((fileName) => `/data/${id}/images/${fileName}`);
    }

    if(Object.keys(mergedData).length === 0){
      console.log("Skipping building Home Page as no sections are defined")
      return { notFound: true };
    }

    return {
      props: {
        propertyData: mergedData,
        images: imageUrls,
      },
    };
  } catch (error) {
    console.error("Error fetching property data:", error);
    return {
      props: {
        propertyData: null,
        images: [],
      },
    };
  }
}


export default PropertyPage;