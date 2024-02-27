import React from "react";

function GetStaticPropsPage() {
  return <div>This page is for testing getStaticProps</div>;
}

export async function getStaticProps() {
  // Fetch data from an API or file system
  const response = await fetch("https://jsonplaceholder.typicode.com/posts");
  const jsonData = await response.json();

  // Log the fetched data
  console.log("Fetched data:", jsonData);

  // Return an empty object as props
  return {
    props: {},
  };
}

export default GetStaticPropsPage;
