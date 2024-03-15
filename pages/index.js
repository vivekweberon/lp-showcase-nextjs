import React from "react";
import Navbar from "../components/Navbar";
import Showcase from "../components/Showcase";
import Contact from "../components/Contact";
import Realtor from "../components/Realtor";
import Footer from "../components/Footer";
import yaml from "js-yaml";
import fs from "fs";

function Index({
  contact,
  showcase,
  footertext,
  realtor,
  homePageSectionsOrder,
}) {
  const menuValues = [];

  const orderedComponents = homePageSectionsOrder.map((section) => {
    console.log("OrderedComponents:", section);
    switch (section) {
      case "Showcase":
        menuValues.push("Showcase");
        return <Showcase properties={showcase} />;
      // case "Contact":
      //   menuValues.push("Contact");
      //   return <Contact contact={contact} />;
      case "Realtor":
        menuValues.push("Realtor");
        return <Realtor realtorData={realtor} />;
      default:
        return null;
    }
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

export async function getStaticProps() {
  const yamlData = fs.readFileSync("./public/data.yaml", "utf8");
  const data = yaml.load(yamlData);

  return {
    props: {
      ...data,
    },
  };
}

export default Index;
