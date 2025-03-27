"use client";
import React, { useState, useRef, useEffect } from "react";
import { basePath } from "@/next.config";
import Head from "next/head";
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import { getPropertyOutputDirectoryName } from "@/utils/renameUtils.mjs";
import Navbar from "@/components/Navbar";
import Home from "@/components/Home";
import Footer from "@/components/Footer";
import PriceAndFeatures from "@/components/PriceAndFeatures";
import Photos from "@/components/Photos";
import Video from "@/components/Video";
import VirtualTour from "@/components/VirtualTour";
import Contact from "@/components/Contact";
import Realtor from "@/components/Realtor";
import Description from "@/components/Description";
import PopupForm from "@/components/PopupForm";
import Modal from "@/components/Modal";
import ChatBot from "@/components/ChatBot";
// import { runValidation } from "@/utils/inCodeValidation";
import { loadYamlFile, getEffectiveData, addGlobalData } from "../utils/dataUtils";
import Script from "next/script";

const PropertyPage = ({ propertyData, images }) => {
  console.log("Property page data:", propertyData); 
  const [modalUrl, setModalUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navbarRef = useRef(null);

  // Flag for loading the YouTube API
  let ytAPIRequired = false;

  // useEffect(() => {
  //   if (
  //     propertyData?.home?.youtubeVideoID ||
  //     propertyData?.video?.youtubeVideoID
  //   ) {
  //     ytAPIRequired = true;
  //   }

  //   if (ytAPIRequired) {
  //     console.log("Loading YouTube API", window.onYouTubeIframeAPIReady);
  //     loadYoutubeIframeAPI();
  //   }
  // }, [propertyData]);

  useEffect(() => {
    if (propertyData?.home?.youtubeVideoID || propertyData?.video?.youtubeVideoID) {
      const interval = setInterval(() => {
        if (window.player && typeof window.player.getPlayerState === "function") {
          console.log("Player is available:", window.player);
          clearInterval(interval);
          // Now you can safely call any functions on the player
          // For example: player.isMuted() etc.
        }
      }, 500); // Check every 500ms
  
      // Cleanup the interval when component unmounts
      return () => clearInterval(interval);
    }
  }, [propertyData]);
  

  const handleLinkClick = (url) => {
    setModalUrl(url);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const {
    priceAndFeatures,
    photos,
    video,
    virtualTour,
    realtor,
    footertext,
    contact,
    description,
    home,
    chatbot,
    propertyPageSectionsOrder
  } = propertyData;

  let menuItems = [];

  let sections; 
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
        addPhotos(photos),
        addVideo(video),
        addContact(contact),
        addRealtor(realtor),
        addDescription(description),
      ];}

  function addMenuItem(menu) {
    if (menu) {
        menuItems.push(menu);
    }
  }

  function addVirtualTour(virtualTour) {
    if (!virtualTour) return null;
    console.log("Virtual Tour:", virtualTour.menu);
    addMenuItem(virtualTour.menu);
    return (
      <VirtualTour
        key='virtualTour'
        virtualTour={virtualTour}
        navbarRef={navbarRef}
      />
    );
  }

  function addHome(home) {
    if (!home) return null;
    addMenuItem(home.menu);
    return (
      <Home
        key='home'
        home={home}
        navbarRef={navbarRef}
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

  function addPhotos(photos) {
    if (!photos) return null;
    addMenuItem(photos.menu);
    return (
      <Photos
        key='photos'
        imageUrls={{ urls: images }}
        navbarRef={navbarRef}
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
        navbarRef={navbarRef}
      />
    );
  }

  function addContact(contact) {
    if (!contact) return null;
    addMenuItem(contact.menu);
    if (contact.mauticForm.popupForm.enable === false) {
      return <Contact contact={contact} key='contact' />;
    } else {
      return <PopupForm contact={contact} key='popupForm'  />;
    }
  }

  function addRealtor(realtor) {
    if (!realtor) return null;
    addMenuItem(realtor.menu);
    return <Realtor key='realtor' realtor={realtor} />;
  }

  function addDescription(description) {
    if (!description) return null;
    addMenuItem(description.menu);
    return (
      <Description
        key='description'
        description={description}
        onLinkClick={handleLinkClick}
      />
    );
  }

  return (
    <div>
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
      <Script src={`${basePath}/js/tracker-util.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/showcase.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/tracker.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/showdown-1.9.1.min.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/bootstrap.min.js`} strategy="beforeInteractive" />
      <Script src={`${basePath}/js/ytvideo_v1.js`} />

      <Navbar menu={menuItems} forwardedRef={navbarRef} />
      {sections}
      {showModal && (
        <Modal clickedUrl={modalUrl} onCloseModal={handleCloseModal} />
      )}
      <Footer menu={menuItems} text={footertext} />
      {chatbot.enable && <ChatBot />}
      <Script src={`${basePath}/js/mauticTracking.js`} />
    </div>
  );
};

export async function getStaticPaths() {
  console.log("Property page getStaticPaths called");
  const dataFolderPath = path.join(process.cwd(), "data");
  // const errorMessagePath = path.join(process.cwd(), "messages", "errorMessage.json");
  const siteToBeBuilt = process.env.siteName;
  console.log("siteToBeBuilt: Property page", siteToBeBuilt);
  try {
    const files = await fs.readdir(dataFolderPath);
    const filteredFiles = files.filter(
      (file) => file !== "global" && file !== "home"
    );
    let paths = [];
    for (const file of filteredFiles) {
      const filePath = path.join(dataFolderPath, file, "data.yaml");
      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const parsedData = yaml.load(fileContent);
        if (parsedData.siteName && parsedData.siteName.includes(siteToBeBuilt)) {
          paths.push({
            params: { id: getPropertyOutputDirectoryName(file) },
          });
        }
      } catch (error) {
        console.error(`Error reading data.yaml for ${file}:`, error);
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
  const siteToBeBuilt = process.env.siteName;
  const originalId = getPropertyOutputDirectoryName(id);

  const propertyDataPath = path.join(process.cwd(), "data", originalId, "data.yaml");
  const globalDataPath = path.join(process.cwd(), "data", "global", "data.yaml");

  try {
    const propertyData = await loadYamlFile(propertyDataPath);
    const globalData = await loadYamlFile(globalDataPath);

    if (!propertyData.siteName || !propertyData.siteName.includes(siteToBeBuilt)) {
      console.warn(`Skipping page for ${id}, siteName does not match ${siteToBeBuilt}`);
      return { notFound: true };
    }
    
    const effectiveGlobalData = getEffectiveData(globalData, siteToBeBuilt);
    
    const effectivePropertyData = getEffectiveData(propertyData, siteToBeBuilt);
    const mergedData = addGlobalData(effectiveGlobalData, effectivePropertyData);
    const imagesFolder = path.join(process.cwd(), "data", originalId, "images");
    const imageFiles = await fs.readdir(imagesFolder);
    const imageUrls = imageFiles.map((fileName) => `/data/${id}/images/${fileName}`);
    return {
      props: {
        propertyData: mergedData,
        images: imageUrls,
        listingPageURL: id,
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