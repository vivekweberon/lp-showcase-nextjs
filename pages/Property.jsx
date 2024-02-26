import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import PriceAndFeatures from "../components/PriceAndFeatures";
import Photos from "../components/Photos";
import Video from "../components/Video";
import VirtualTour from "../components/VirtualTour";
import Contact from "@/components/Contact";
import Realtor from "@/components/Realtor";

const Property = () => {
  const router = useRouter();
  const { id } = router.query;
  const [propertyData, setPropertyData] = useState({
    navbar: [],
    virtualTour: [],
    priceAndFeatures: [],
    photos: { urls: [] },
    video: { youtubeVideoID: "" },
    contact: [],
    realtor: [],
    footerMenu: [],
    footertext: [],
  });
  const [isValidId, setIsValidId] = useState(true);

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) return;

      const res = await fetch(`/propertydata.json?id=${id}`);
      if (res.ok) {
        const data = await res.json();
        if (
          data &&
          data.homePageData &&
          "listingPageURL" in data.homePageData
        ) {
          const fetchedId = data.homePageData.listingPageURL.split("id=")[1];
          console.log("Fetched ID:", fetchedId);
          console.log("ID in URL:", id);
          if (fetchedId === id) {
            setPropertyData({
              navbar: Object.values(data).filter((item) => "menu" in item),
              virtualTour: data.virtualTour,
              priceAndFeatures: data.priceAndFeatures,
              photos: data.photos,
              video: data.video,
              contact: data.contact,
              realtor: data.realtor,
              footerMenu: Object.values(data).map((item) => item.menu),
              footertext: data.footertext,
            });
          } else {
            setIsValidId(false);
          }
        } else {
          setIsValidId(false);
        }
      } else {
        setIsValidId(false);
      }
    };

    fetchPropertyData();
  }, [id]);

  const {
    navbar,
    virtualTour,
    priceAndFeatures,
    photos,
    video,
    contact,
    realtor,
    footerMenu,
    footertext,
  } = propertyData;

  return (
    <>
      {isValidId ? (
        <>
          <Navbar navbar={navbar} isHomePage={false} />
          <VirtualTour virtualTour={virtualTour} />
          <PriceAndFeatures priceAndFeatures={priceAndFeatures} />
          <Photos photoUrls={photos.urls} />
          <Video youtubeVideoID={video.youtubeVideoID} />
          <Contact contact={contact} />
          <Realtor realtorData={realtor} />
          <Footer
            footerMenu={footerMenu}
            footertext={footertext}
            isHomePage={false}
          />
        </>
      ) : (
        <div>Page not found</div>
      )}
    </>
  );
};

export default Property;
