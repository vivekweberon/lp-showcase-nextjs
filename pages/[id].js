import React, { useState, useRef } from "react";
import fs from "fs/promises";
import path from "path";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PriceAndFeatures from "../components/PriceAndFeatures";
import Photos from "../components/Photos";
import Video from "../components/Video";
import VirtualTour from "../components/VirtualTour";
import Contact from "../components/Contact";
import Realtor from "../components/Realtor";
import Description from "../components/Description";
import yaml from "js-yaml";
import Modal from "../components/Modal";
import PropTypes from "prop-types";

const PropertyPage = ({ propertyData }) => {
  const [modalUrl, setModalUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navbarRef = useRef(null);

  // Function to handle link click in Description component
  const handleLinkClick = (url) => {
    setModalUrl(url);
    setShowModal(true);
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
    propertyPageSectionsOrder,
    description,
  } = propertyData;

  const orderedComponents = propertyPageSectionsOrder.map((section, index) => {
    switch (section) {
      case "Virtual Tour":
        return renderVirtualTour(virtualTour, index);
      case "Price & Features":
        return renderPriceAndFeatures(priceAndFeatures, index);
      case "Photos":
        return renderPhotos(photos, index);
      case "Video":
        return renderVideo(video, index);
      case "Contact":
        return renderContact(contact, index);
      case "Realtor":
        return renderRealtor(realtor, index);
      case "Description":
        return renderDescription(description, index);
      default:
        return null;
    }
  });

  function renderVirtualTour(virtualTour, index) {
    return (
      virtualTour && (
        <VirtualTour
          key={`virtualTour_${index}`}
          virtualTour={virtualTour}
          navbarRef={navbarRef}
        />
      )
    );
  }

  function renderPriceAndFeatures(priceAndFeatures, index) {
    return (
      priceAndFeatures && (
        <PriceAndFeatures
          key={`priceAndFeatures_${index}`}
          priceAndFeatures={priceAndFeatures}
        />
      )
    );
  }

  function renderPhotos(photos, index) {
    return (
      photos?.urls && (
        <Photos
          key={`photos_${index}`}
          photoUrls={photos.urls}
          navbarRef={navbarRef}
        />
      )
    );
  }

  function renderVideo(video, index) {
    return (
      video?.youtubeVideoID && (
        <Video
          key={`video_${index}`}
          youtubeVideoID={video.youtubeVideoID}
          navbarRef={navbarRef}
        />
      )
    );
  }

  function renderContact(contact, index) {
    return contact && <Contact key={`contact_${index}`} contact={contact} />;
  }

  function renderRealtor(realtor, index) {
    return (
      realtor && <Realtor key={`realtor_${index}`} realtorData={realtor} />
    );
  }

  function renderDescription(description, index) {
    return (
      description?.sectionTitle &&
      description.content && (
        <Description
          key={`description_${index}`}
          sectionTitle={description.sectionTitle}
          content={description.content}
          onLinkClick={handleLinkClick}
        />
      )
    );
  }

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div>
      <Navbar navbar={propertyPageSectionsOrder} forwardedRef={navbarRef} />
      {orderedComponents}
      {showModal && (
        <Modal clickedUrl={modalUrl} onCloseModal={handleCloseModal} />
      )}
      <Footer footerMenu={propertyPageSectionsOrder} footertext={footertext} />
    </div>
  );
};

export async function getStaticPaths() {
  console.log("Executing getStaticPaths");

  // Fetch the list of available properties dynamically
  const files = await fs.readdir("data");

  const paths = files.map((file) => ({
    params: { id: file.replace(".yaml", "") },
  }));
  console.log("Static paths", paths);
  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps(context) {
  console.log("Executing getStaticProps");
  const { id } = context.params;

  const filePath = path.join("data", `${id}.yaml`);
  console.log("FilePath", filePath);

  try {
    const propertyData = await fs.readFile(filePath, "utf-8");
    const parsedData = yaml.load(propertyData);

    return {
      props: {
        propertyData: parsedData,
      },
    };
  } catch (error) {
    console.error("Error fetching property data:", error);
    return {
      props: {
        propertyData: null,
      },
    };
  }
}

// Define prop types for PropertyPage component
PropertyPage.propTypes = {
  propertyData: PropTypes.shape({
    priceAndFeatures: PropTypes.object,
    photos: PropTypes.object,
    video: PropTypes.object,
    virtualTour: PropTypes.object,
    realtor: PropTypes.object,
    footertext: PropTypes.string,
    contact: PropTypes.object,
    propertyPageSectionsOrder: PropTypes.array,
    description: PropTypes.shape({
      sectionTitle: PropTypes.string,
      content: PropTypes.string,
    }),
  }),
};

export default PropertyPage;
