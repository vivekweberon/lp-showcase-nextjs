import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { getPropertyOutputDirectoryName } from "../utils/renameUtils.mjs";

export function deepMerge(target, source) {
  // If target is not an object (or is null), just return the source directly.
  // This acts as a base case for invalid or unexpected inputs.
  if (typeof target !== "object" || target === null) return source;

  // Loop over all the keys in the source object
  for (const key of Object.keys(source)) {

    // Check if the current value in source is an object (but not an array)
    if (
      source[key] &&
      typeof source[key] === "object" &&
      !Array.isArray(source[key])
    ) {
      // If the corresponding key in target doesn't exist, initialize it as an empty object.
      if (!target[key]) target[key] = {};

      // Recursively merge nested objects, meaning this is a "deep" merge.
      target[key] = deepMerge(target[key], source[key]);

    } else {
      //directly overwrite target[key] with source[key]
      target[key] = source[key];
    }
  }
  
  // After processing all keys in source, return the fully merged target object.
  return target;
}

export const loadYamlFile = async (filePath) => {
  const fileData = await fs.promises.readFile(filePath, "utf-8");
  return yaml.load(fileData);
};

export function getEffectiveData(parsedYaml, currentSiteName) {
  let effective = parsedYaml.default || { ...parsedYaml };

  delete effective.siteOverrides;
  delete effective.siteName;

  if (
    parsedYaml.siteOverrides &&
    parsedYaml.siteOverrides[currentSiteName]
  ) {
    effective = deepMerge(
      JSON.parse(JSON.stringify(effective)),
      parsedYaml.siteOverrides[currentSiteName]
    );
  }
  return effective;
}

export const readPropertyFiles = async (dataFolderPath) => {
  const currentSiteName = process.env.siteToBuild;
  console.log("Current Environment Site Name:", currentSiteName);

  const propertyFolders = await fs.promises.readdir(dataFolderPath);
  const propertiesData = [];

  for (const folder of propertyFolders) {
    const folderPath = path.join(dataFolderPath, folder);
    const dataYamlPath = path.join(folderPath, "data.yaml");

    if (!fs.existsSync(folderPath) || !fs.existsSync(dataYamlPath)) {
      console.log(`Skipping: ${folder} (Missing folder or data.yaml)`);
      continue;
    }

    try {
      const parsedData = await loadYamlFile(dataYamlPath);

      if (parsedData.siteName) {
        const siteNames = Array.isArray(parsedData.siteName)
          ? parsedData.siteName.map(s => s.trim())
          : [String(parsedData.siteName).trim()];

        if (!siteNames.includes(String(currentSiteName).trim())) {
          console.log(`Skipping: ${folder} (siteName does not match)`);
          continue;
        }
      } else {
        console.log(`Skipping: ${folder} (Missing siteName)`);
        continue;
      }

      const effectivePropertyData = getEffectiveData(parsedData, currentSiteName);

      if (!effectivePropertyData?.homePageData) {
        console.log(`Skipping: ${folder} (Missing homePageData)`);
        continue;
      }

      const listingPageURL = getPropertyOutputDirectoryName(folder);
      effectivePropertyData.homePageData.listingPageURL = listingPageURL;

      propertiesData.push(effectivePropertyData.homePageData);

      console.log(`✔ Added Property: ${folder} (Matches siteName)`);
    } catch (error) {
      console.error(`❌ Error processing ${dataYamlPath}`, error);
    }
  }

  console.log("Final Filtered Properties:", propertiesData);
  return propertiesData;
};
