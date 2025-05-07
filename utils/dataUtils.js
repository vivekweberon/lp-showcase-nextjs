import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { getPropertyOutputDirectoryName } from "./renameUtils.js";

export const loadYamlFile = async (filePath) => {
  const fileData = await fs.promises.readFile(filePath, "utf-8");
  return yaml.load(fileData);
};

export function addGlobalData(global, home, enabledSections) {
  if (typeof global !== "object" || global === null) return home;

  if (global?.realtor?.photo){
    global.realtor.photo = `/data/global/images/${global.realtor.photo}`;
  }
  if (global?.realtor?.logo){
    global.realtor.logo = `/data/global/images/${global.realtor.logo}`;
  }

  for (const key of Object.keys(global)) {
    if ((Array.isArray(enabledSections) && enabledSections.includes(key) && home[key] == null) || ((enabledSections == null) && home[key] == null)) {
      home[key] = global[key] 
    } 
  }
  return home;
}

export function getEffectiveData(parsedYaml, currentSiteName) {
  let effective = { ...parsedYaml };

  if (parsedYaml.siteSpecific && parsedYaml.siteSpecific[currentSiteName]) {
    const siteOverrides = parsedYaml.siteSpecific[currentSiteName];

    for (const key in siteOverrides) {
      const value = siteOverrides[key];

      if (value && value.disable === true) {
        delete effective[key]; 
      } else {
        effective[key] = {
          ...effective[key],
          ...value,
        };
      }
    }
  }

  delete effective.siteSpecific;
  delete effective.siteName;

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

      const propertyDirectoryName = getPropertyOutputDirectoryName(folder);
      effectivePropertyData.homePageData.propertyDirectoryName = propertyDirectoryName;

      if(!effectivePropertyData.homePageData.listingPageURL){
        effectivePropertyData.homePageData.listingPageURL = propertyDirectoryName;
      }
      
      propertiesData.push(effectivePropertyData.homePageData);

      console.log(`✔ Added Property: ${folder} (Matches siteName)`);
    } catch (error) {
      console.error(`❌ Error processing ${dataYamlPath}`, error);
    }
  }
  return propertiesData;
};