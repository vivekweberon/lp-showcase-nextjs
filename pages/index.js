import React from "react";
import Navbar from "../components/Navbar";
import Showcase from "../components/Showcase";
import Contact from "../components/Contact";
import Realtor from "../components/Realtor";
import Footer from "../components/Footer";
// import { useRouter } from "next/router";
import data from "../public/data.json";

/**
 * The Index page component.
 *
 * This component renders the main page of the website,
 * including the navigation bar, showcase section, contact section,
 * realtor section, and footer.
 *
 * @param {Object} props - The props object.
 * @param {Array} props.contact - The contact data.
 * @param {Array} props.showcase - The showcase data.
 * @param {Array} props.footertext - The footer text data.
 * @param {Array} props.realtor - The realtor data.
 * @param {Array} props.homePageSectionsOrder - The order of sections on the home page.
 * @returns {JSX.Element} The JSX element.
 */
function Index({
  contact,
  showcase,
  footertext,
  realtor,
  homePageSectionsOrder,
}) {
  // Function to store menu values for navigation
  let menuValues = [];

  // Map through the order of sections on the home page
  const orderedComponents = homePageSectionsOrder.map((section) => {
    console.log("OrderedComponents:", section);
    // Switch case to render appropriate component based on section name
    switch (section) {
      case "Showcase":
        menuValues.push("Showcase");
        // Render Showcase component with showcase data
        return <Showcase properties={showcase} />;
      case "Contact":
        menuValues.push("Contact");
        // Render Contact component with contact data
        return <Contact contact={contact} />;
      case "Realtor":
        menuValues.push("Realtor");
        // Render Realtor component with realtor data
        return <Realtor realtorData={realtor} />;
      default:
        return null;
    }
  });

  // Log menu values for debugging
  console.log("MenuValues", menuValues);

  // Render the Index page layout
  return (
    <div>
      <Navbar navbar={menuValues} />
      {orderedComponents}
      <Footer footerMenu={menuValues} footertext={footertext} />
    </div>
  );
}

/**
 * Fetches static props for the index page.
 *
 * This function fetches the necessary data required by the
 * Index component to render the page.
 *
 * @returns {Promise<Object>} A promise resolving to props object.
 */
export async function getStaticProps() {
  // Fetch data from JSON file
  const { contact, showcase, footertext, realtor, homePageSectionsOrder } =
    data;

  // Return props object containing fetched data
  return {
    props: {
      showcase,
      contact,
      realtor,
      footertext,
      homePageSectionsOrder,
    },
  };
}

// Export the Index component as the default export
export default Index;
