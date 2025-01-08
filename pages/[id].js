// PropertyPage.jsx

import React, { useState, useRef } from "react";
import fs from "fs/promises";
import path from "path";
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
import yaml from "js-yaml";
import PropTypes from "prop-types";
import { getPropertyOutputDirectoryName } from "../utils/renameUtils.mjs";

const PropertyPage = ({ propertyData, images }) => {
  const [modalUrl, setModalUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navbarRef = useRef(null);

  const handleLinkClick = (url) => {
    console.log("Link clicked:", url); // Debugging line
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
        imageUrls={{ urls: images }} // Pass images as an object with 'urls' property
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
        onLinkClick={handleLinkClick} // Ensure this function is passed correctly
      />
    );
  }

  return (
    <div>
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
  try {
    const dataFolderPath = path.join(process.cwd(), "data");
    const files = await fs.readdir(dataFolderPath);

    const paths = files.map((file) => ({
      params: { id: getPropertyOutputDirectoryName(file) }, // Convert the ID using getPropertyOutputDirectoryName
    }));
    return {
      paths,
      fallback: false,
    };
  } catch (error) {
    console.error("Error fetching static paths:", error);
    return {
      paths: [],
      fallback: false,
    };
  }
}

export async function getStaticProps(context) {
  const { id } = context.params;

  // Convert back to the original input directory ID
  const originalId = getPropertyOutputDirectoryName(id); // Reverse the conversion

  const filePath = path.join(process.cwd(), "data", originalId, "data.yaml");

  try {
    const propertyData = await fs.readFile(filePath, "utf-8");
    const parsedData = yaml.load(propertyData);

    // Merge property-specific data with global data
    const globalFilePath = path.join(process.cwd(), "global", "data.yaml");
    const globalData = await fs.readFile(globalFilePath, "utf-8");
    const parsedGlobalData = yaml.load(globalData);
    const mergedData = { ...parsedGlobalData, ...parsedData };

    // Read images from the images folder
    const imagesFolderPath = path.join(
      process.cwd(),
      "data",
      originalId,
      "images"
    );
    const imageFiles = await fs.readdir(imagesFolderPath);
    const imageUrls = imageFiles.map(
      (fileName) => `/data/${id}/images/${fileName}`
    );
    
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
