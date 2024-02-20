import { useRouter } from "next/router";
import React from "react";

const Property = () => {
  const route = useRouter();
  console.log(route);
  console.log(route.query.id);
  return (
    <div>
      <h1>Pages</h1>
    </div>
  );
};

export default Property;
