import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { getPropertyOutputDirectoryName } from "../utils/renameUtils.mjs";

export const loadYamlFile = async (filePath) => {
  const fileData = await fs.promises.readFile(filePath, "utf-8");
  return yaml.load(fileData);
};

export function addGlobalData(global, home) {
  if (typeof global !== "object" || global === null) return home;
  for (const key of Object.keys(global)) {
    if (home[key] == null) {
      home[key] = global[key] 
    } 
  }
  return home;
}

export function getEffectiveData(parsedYaml, currentSiteName) {
  const effective = { ...parsedYaml };
  delete effective.siteSpecific;
  delete effective.siteName;
  if (parsedYaml.siteSpecific && parsedYaml.siteSpecific[currentSiteName]) {
    addGlobalData(effective, parsedYaml.siteSpecific[currentSiteName]);
  }
  return effective;
}

export const getpropertiesHomePageData = async (dataFolderPath, currentSiteName) => {
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
        if (!parsedData.siteName.map(s => s.trim()).includes(currentSiteName.trim())) {
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

  // console.log("Final Filtered Properties:", propertiesData);
  return propertiesData;
};