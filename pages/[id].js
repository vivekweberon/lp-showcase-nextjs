import React from "react";
import fs from "fs/promises"; // Use fs promises for asynchronous file operations
import path from "path";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PriceAndFeatures from "../components/PriceAndFeatures";
import Photos from "../components/Photos";
import Video from "../components/Video";
import VirtualTour from "../components/VirtualTour";
import Contact from "../components/Contact";
import Realtor from "../components/Realtor";

const PropertyPage = ({ propertyData }) => {
  if (!propertyData) {
    return <div>Loading...</div>; // Handle the case where data is not yet available
  }

  const {
    priceAndFeatures,
    photos,
    video,
    virtualTour,
    realtor,
    footertext,
    contact,
  } = propertyData;

  console.log("Price", priceAndFeatures);

  const menuValues = Object.values(propertyData)
    .filter((obj) => obj.menu !== undefined)
    .map((obj) => obj.menu);
  console.log("Extracting menu:", menuValues);

  return (
    <div>
      <Navbar navbar={menuValues} />
      <VirtualTour virtualTour={virtualTour} />
      <PriceAndFeatures priceAndFeatures={priceAndFeatures} />
      <Photos photoUrls={photos.urls} />
      <Video youtubeVideoID={video.youtubeVideoID} />
      <Contact contact={contact} />
      <Realtor realtorData={realtor} />
      <Footer footerMenu={menuValues} footertext={footertext} />
    </div>
  );
};

export async function getStaticPaths() {
  console.log("Executing getStaticPaths");

  // Fetch the list of available properties dynamically
  const files = await fs.readdir("data");

  const paths = files.map((file) => ({
    params: { id: file.replace(".json", "") },
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

  try {
    const filePath = path.join("data", `${id}.json`);
    const propertyData = await fs.readFile(filePath, "utf-8");

    return {
      props: { propertyData: JSON.parse(propertyData) },
    };
  } catch (error) {
    console.error("Error reading property data:", error);
    return {
      props: { propertyData: null },
    };
  }
}

export default PropertyPage;
