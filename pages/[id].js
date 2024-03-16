import React from "react";
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

const PropertyPage = ({ propertyData }) => {
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

  console.log("Price", propertyData);

  let menuValues = [];

  const orderedComponents = propertyPageSectionsOrder.map((section) => {
    console.log("OrderedComponents:", section);
    switch (section) {
      case "Virtual Tour":
        if (virtualTour) {
          menuValues.push("Virtual Tour");
          return <VirtualTour virtualTour={virtualTour} />;
        }
        break;
      case "Price & Features":
        if (priceAndFeatures) {
          menuValues.push("Price & Features");
          return <PriceAndFeatures priceAndFeatures={priceAndFeatures} />;
        }
        break;
      case "Photos":
        if (photos && photos.urls) {
          menuValues.push("Photos");
          return <Photos photoUrls={photos.urls} />;
        }
        break;
      case "Video":
        if (video && video.youtubeVideoID) {
          menuValues.push("Video");
          return <Video youtubeVideoID={video.youtubeVideoID} />;
        }
        break;
      case "Contact":
        if (contact) {
          menuValues.push("Contact");
          return <Contact contact={contact} />;
        }
        break;
      case "Realtor":
        if (realtor) {
          menuValues.push("Realtor");
          return <Realtor realtorData={realtor} />;
        }
        break;
      case "Description":
        if (description && description.sectionTitle && description.content) {
          menuValues.push("Description");
          return (
            <Description
              sectionTitle={description.sectionTitle}
              content={description.content}
            />
          );
        }
        break;
      default:
        return null;
    }
    return null;
  });

  return (
    <div>
      <Navbar navbar={menuValues} />
      {orderedComponents}
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

export default PropertyPage;
