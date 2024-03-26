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

  let menuValues = [];

  const orderedComponents = propertyPageSectionsOrder.map((section, index) => {
    switch (section) {
      case "Virtual Tour":
        if (virtualTour) {
          menuValues.push("Virtual Tour");
          return (
            <VirtualTour
              key={index}
              virtualTour={virtualTour}
              navbarRef={navbarRef}
            />
          );
        }
        break;
      case "Price & Features":
        if (priceAndFeatures) {
          menuValues.push("Price & Features");
          return (
            <PriceAndFeatures key={index} priceAndFeatures={priceAndFeatures} />
          );
        }
        break;
      case "Photos":
        if (photos && photos.urls) {
          menuValues.push("Photos");
          return (
            <Photos key={index} photoUrls={photos.urls} navbarRef={navbarRef} />
          );
        }
        break;
      case "Video":
        if (video && video.youtubeVideoID) {
          menuValues.push("Video");
          return (
            <Video
              key={index}
              youtubeVideoID={video.youtubeVideoID}
              navbarRef={navbarRef}
            />
          );
        }
        break;
      case "Contact":
        if (contact) {
          menuValues.push("Contact");
          return <Contact key={index} contact={contact} />;
        }
        break;
      case "Realtor":
        if (realtor) {
          menuValues.push("Realtor");
          return <Realtor key={index} realtorData={realtor} />;
        }
        break;
      case "Description":
        if (description && description.sectionTitle && description.content) {
          menuValues.push("Description");
          return (
            <Description
              key={index}
              sectionTitle={description.sectionTitle}
              content={description.content}
              onLinkClick={handleLinkClick} // Passing the handler to Description
            />
          );
        }
        break;
      default:
        return null;
    }
    return null;
  });

  // Function to close the modal
  const handleCloseModal = () => {
    setShowModal(false);
  };

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
