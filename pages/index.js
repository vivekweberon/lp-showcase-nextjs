import React from "react";
import Navbar from "../components/Navbar";
import Showcase from "../components/Showcase";
import Contact from "../components/Contact";
import Realtor from "../components/Realtor";
import Footer from "../components/Footer";
import { useRouter } from "next/router";
import data from "../public/data.json";

function Index({
  contact,
  showcase,
  footertext,
  realtor,
  homePageSectionsOrder,
}) {
  let router = useRouter();
  // console.log("RouterObject", router);
  // console.log("BasePath:", router.basePath);

  const orderedComponents = homePageSectionsOrder.map((section) => {
    // console.log("OrderedComponents:", section);
    switch (section) {
      case "Showcase":
        return <Showcase properties={showcase} />;
      case "Contact":
        return <Contact contact={contact} />;
      case "Realtor":
        return <Realtor realtorData={realtor} />;
      default:
        return null;
    }
  });

  const menuValues = Object.values(data)
    .filter((obj) => obj.menu !== undefined)
    .map((obj) => obj.menu);
  // console.log("Extracting menu:", menuValues);

  return (
    <div>
      <Navbar navbar={menuValues} />
      {orderedComponents}
      <Footer footerMenu={menuValues} footertext={footertext} />
    </div>
  );
}

export async function getStaticProps() {
  // console.log(data);
  const { contact, showcase, footertext, realtor, homePageSectionsOrder } =
    data;
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

export default Index;
