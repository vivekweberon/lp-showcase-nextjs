"use client";
import React, { useState, useRef, useEffect } from "react";
import { basePath } from "@/next.config";
import Head from "next/head";
import fs from "fs/promises";
import path from "path";
import yaml from "js-yaml";
import PropTypes from "prop-types";
import { getPropertyOutputDirectoryName } from "../utils/renameUtils.mjs";
import Navbar from "../components/Navbar";
import Home from "../components/Home";
import Footer from "../components/Footer";
import PriceAndFeatures from "../components/PriceAndFeatures";
import Photos from "../components/Photos";
import Video from "../components/Video";
import VirtualTour from "../components/VirtualTour";
import Contact from "../components/Contact";
import Realtor from "../components/Realtor";
import Description from "../components/Description";
import PopupForm from "../components/PopupForm";
import Modal from "../components/Modal";
import ChatBot from "../components/ChatBot";
import Script from "next/script";
import scriptSources from "@/modules/scriptConfig";
// import { validateInputData } from "@/utils/inCodeValidation";

const PropertyPage = ({ propertyData, images }) => {
  const [modalUrl, setModalUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navbarRef = useRef(null);

  // Flag for loading the YouTube API
let ytAPIRequired = false;

useEffect(() => {
  if (
    propertyData?.home?.youtubeVideoID ||
    propertyData?.video?.youtubeVideoID
  ) {
    ytAPIRequired = true;
    // console.log("YouTube API required:", ytAPIRequired);
  }

  if (ytAPIRequired) {
    loadYoutubeIframeAPI();
    // console.log("YouTube API loaded");
  }

}, [propertyData]);

  const handleLinkClick = (url) => {
    setModalUrl(url);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (!propertyData) {
    return <div>Loading...</div>;
  }

  const {
    priceAndFeatures,
    photos,
    video,
    virtualTour,
    realtor,
    footertext,
    contact,
    description,
  } = propertyData;

  const hasYouTubeVideo = propertyData.home?.youtubeVideoID;
  const isChatbotEnabled = propertyData.chatbot?.enable;

  let menuValues = [];
  const propertyPageSectionsOrder = propertyData.propertyPageSectionsOrder;

  const orderedComponents = propertyPageSectionsOrder
    ? propertyPageSectionsOrder.map((section, index) => {
        switch (section) {
          case "home":
            return renderHome(propertyData.home, index);
          case "virtualTour":
            return renderVirtualTour(virtualTour, index);
          case "priceAndFeatures":
            return renderPriceAndFeatures(priceAndFeatures, index);
          case "photos":
            return renderPhotos(photos, index);
          case "video":
            return renderVideo(video, index);
          case "contact":
            return renderContact(contact, index);
          case "realtor":
            return renderRealtor(realtor, index);
          case "description":
            return renderDescription(description, index);
          case "chatbot":
            return renderChatBot(propertyData.chatbot, index);
          default:
            return null;
        }
      })
    : [
        renderHome(propertyData.home, 0),
        renderVirtualTour(virtualTour, 1),
        renderPriceAndFeatures(priceAndFeatures, 2),
        renderPhotos(photos, 3),
        renderVideo(video, 4),
        renderContact(contact, 5),
        renderRealtor(realtor, 6),
        renderDescription(description, 7),
        renderChatBot(propertyData.chatbot, 8),
      ];

  function renderVirtualTour(virtualTour, index) {
    if (!virtualTour) return null;
    menuValues.push("Virtual Tour");
    return (
      <VirtualTour
        key={`virtualTour_${index}`}
        virtualTour={virtualTour}
        navbarRef={navbarRef}
      />
    );
  }

  function renderChatBot(chatbot, index) {
    return <ChatBot key={`chatbot_${index}`} />;
  }

  function renderHome(homeData, index) {
    if (!homeData || !homeData.youtubeVideoID) return null;
    menuValues.push(homeData.menu);
    return (
      <Home
        key={`home_${index}`}
        youtubeVideoID={homeData.youtubeVideoID}
        videoStart={homeData.videoStart}
        videoEnd={homeData.videoEnd}
        menu={homeData.menu}
        sectionTitle={homeData.sectionTitle}
        navbarRef={navbarRef}
      />
    );
  }

  function renderPriceAndFeatures(priceAndFeatures, index) {
    if (!priceAndFeatures) return null;
    menuValues.push("Price & Features");
    return (
      <PriceAndFeatures
        key={`priceAndFeatures_${index}`}
        priceAndFeatures={priceAndFeatures}
      />
    );
  }

  function renderPhotos(photos, index) {
    if (!photos) return null;
    menuValues.push("Photos");
    return (
      <Photos
        key={`photos_${index}`}
        imageUrls={{ urls: images }}
        navbarRef={navbarRef}
      />
    );
  }

  function renderVideo(video, index) {
    if (!video?.youtubeVideoID) return null;
    menuValues.push("Video");
    return (
      <Video
        key={`video_${index}`}
        youtubeVideoID={video.youtubeVideoID}
        navbarRef={navbarRef}
      />
    );
  }

  function renderContact(contact, index) {
    if (!contact) return null;
    if (contact.mauticForm.popupForm.enable === false) {
      menuValues.push("Contact");
      return <Contact contact={contact} key={`contact_${index}`} />;
    } else {
      return <PopupForm contact={contact} key={`popupForm_${index}`} />;
    }
  }

  function renderRealtor(realtor, index) {
    if (!realtor) return null;
    menuValues.push("Realtor");
    return <Realtor key={`realtor_${index}`} realtorData={realtor} />;
  }

  function renderDescription(description, index) {
    if (!description || !description.content) return null;
    menuValues.push("Description");
    return (
      <Description
        key={`description_${index}`}
        content={description.content}
        onLinkClick={handleLinkClick}
      />
    );
  }

  return (
    <div>
      <Head>
        <title>{propertyData.title}</title>
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
        <style jsx>{`
    .bg-dark {
      background-color: black !important;
    }
    @media (orientation: landscape) {
      #video1 {
        width: 133vh;
        height: 75vh;
      }
    }
    @media (orientation: portrait) {
      #video1 {
        width: 100vw;
        height: 57vw;
      }
    }
  `}</style>
      </Head>

      <script
          async
          src="https://accounts.google.com/gsi/client"
        />

        {/* Dynamically load alwaysLoad scripts from scriptSources */}
      {scriptSources.alwaysLoad.map((src, index) => (
        <Script
          key={`script_${index}`}
          strategy="beforeInteractive"
          type="text/javascript"
          src={basePath + src}
        />
      ))}

      {hasYouTubeVideo && (
        <Script
          strategy="beforeInteractive"
          type="text/javascript"
          src={basePath + scriptSources.ytVideo}
        />
      )}

      {isChatbotEnabled && scriptSources.chatbot.map((src, index) => (
        <>
          <Script
          key={`script_${index}`}
            strategy="beforeInteractive"
            type="text/javascript"
            src={basePath + src}
          />
          
        </>
      ))}
      <Script strategy="beforeInteractive" src="https://kit.fontawesome.com/c3c47df7d6.js"/>

      <Navbar navbar={menuValues} forwardedRef={navbarRef} />
      {orderedComponents}
      {showModal && (
        <Modal clickedUrl={modalUrl} onCloseModal={handleCloseModal} />
      )}
      <Footer footerMenu={menuValues} footertext={footertext} />
    </div>
  );
};

PropertyPage.propTypes = {
  propertyData: PropTypes.object.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export async function getStaticPaths() {
  console.log("Property page getStaticPaths called");
  const dataFolderPath = path.join(process.cwd(), "data");
  const siteToBuild = process.env.siteToBuild;

  try {
    const files = await fs.readdir(dataFolderPath);
    const filteredFiles = files.filter((file) => file !== "global" && file !== "home");

    let paths = [];

    for (const file of filteredFiles) {
      const filePath = path.join(dataFolderPath, file, "data.yaml");

      try {
        const fileContent = await fs.readFile(filePath, "utf-8");
        const parsedData = yaml.load(fileContent);

        if (parsedData.siteName && parsedData.siteName.includes(siteToBuild)) {
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
  console.log("Property page getStaticProps called");
  const { id } = context.params;
  const siteToBuild = process.env.siteToBuild;
  const originalId = getPropertyOutputDirectoryName(id);
  const filePath = path.join(process.cwd(), "data", originalId, "data.yaml");

  try {
    const propertyData = await fs.readFile(filePath, "utf-8");
    const parsedData = yaml.load(propertyData);

    // Check if siteName matches siteToBuild
    if (!parsedData.siteName || !parsedData.siteName.includes(siteToBuild)) {
      console.warn(`Skipping page for ${id}, siteName does not match ${siteToBuild}`);
      return { notFound: true };
    }

    const globalFilePath = path.join(process.cwd(), "data", "global", "data.yaml");
    const globalData = await fs.readFile(globalFilePath, "utf-8");
    const parsedGlobalData = yaml.load(globalData);
    const mergedData = { ...parsedGlobalData, ...parsedData };

    const imagesFolderPath = path.join(process.cwd(), "data", originalId, "images");
    const imageFiles = await fs.readdir(imagesFolderPath);
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