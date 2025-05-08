import fs from "fs";
import path from "path";
import yaml from "js-yaml";
import { getPropertyOutputDirectoryName } from "./renameUtils.js";

export const loadYamlFile = async (filePath) => {
  const fileData = await fs.promises.readFile(filePath, "utf-8");
  return yaml.load(fileData);
};

export function addGlobalData(global, page, enabledSections) {
  console.log("addGlobalData called with:", global, page, enabledSections);
  if (typeof global !== "object" || global === null) return page;

  for (const key of Object.keys(global)) {
    if (!(page[key]) && ((Array.isArray(enabledSections) && enabledSections.includes(key)) || (enabledSections == null))) {
      if (key == 'realtor'){
        if (global.realtor.photo){
          global.realtor.photo = `/data/global/images/${global.realtor.photo}`;
        }
        if (global.realtor.logo){
          global.realtor.logo = `/data/global/images/${global.realtor.logo}`;
        }
      }
      page[key] = global[key] 
    }
    if (page[key] && page[key].disable === true) {
      delete page[key]; 
    } 
  }
  console.log("Global Data Added:", page);
  return page;
}

export function getEffectiveData(parsedYaml, currentSiteName) {
  console.log("getEffectiveData called with:", parsedYaml, currentSiteName);
  let effective = { ...parsedYaml };

  if (parsedYaml.siteSpecific && parsedYaml.siteSpecific[currentSiteName]) {
    const siteOverrides = parsedYaml.siteSpecific[currentSiteName];

    for (const key in siteOverrides) {
      effective[key] = siteOverrides[key];
    }
  }

  delete effective.siteSpecific;
  delete effective.siteName;

  console.log("Effective Data:", effective);
  return effective;
}

export function getEffectiveGlobalData(parsedYaml, currentSiteName) {
  console.log("getEffectiveGlobalData called with:", parsedYaml, currentSiteName);
  let effective = { ...parsedYaml };

  if (parsedYaml.siteSpecific && parsedYaml.siteSpecific[currentSiteName]) {
    const siteOverrides = parsedYaml.siteSpecific[currentSiteName];

    for (const key in siteOverrides) {
      const value = siteOverrides[key];

      if (value && value.disable === true) {
        delete effective[key]; 
      } else {
        effective[key] = value;
      }
    }
  }

  delete effective.siteSpecific;
  delete effective.siteName;

  console.log("Effective Global Data:", effective);
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