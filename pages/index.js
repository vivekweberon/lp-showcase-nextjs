import React from "react";
import PropTypes from "prop-types";
import Navbar from "../components/Navbar";
import Showcase from "../components/Showcase";
import Contact from "../components/Contact";
import Realtor from "../components/Realtor";
import Footer from "../components/Footer";
import yaml from "js-yaml";
import fs from "fs";

function Index(props) {
  const { contact, showcase, footertext, realtor, homePageSectionsOrder } =
    props;
  const menuValues = [];

  const orderedComponents = homePageSectionsOrder.map((section) => {
    console.log("OrderedComponents:", section);
    switch (section) {
      case "Showcase":
        if (showcase) {
          menuValues.push("Showcase");
          return <Showcase properties={showcase} />;
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
      default:
        return null;
    }
    return null;
  });

  console.log("MenuValues", menuValues);

  return (
    <div>
      <Navbar navbar={menuValues} />
      {orderedComponents}
      <Footer footerMenu={menuValues} footertext={footertext} />
    </div>
  );
}

// Define prop types for Index component
Index.propTypes = {
  contact: PropTypes.object,
  showcase: PropTypes.object,
  footertext: PropTypes.string,
  realtor: PropTypes.object,
  homePageSectionsOrder: PropTypes.array,
};

export async function getStaticProps() {
  const yamlData = fs.readFileSync("./public/data.yaml", "utf8");
  const data = yaml.load(yamlData);

  return {
    props: data,
  };
}

export default Index;
