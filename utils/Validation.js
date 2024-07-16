// utils/Validation.js

import fs from "fs";
import yaml from "js-yaml";
import yargs from "yargs/yargs";
import { hideBin } from "yargs/helpers";

// Command-line arguments configuration
const argv = yargs(hideBin(process.argv)).option("inputDir", {
  alias: "i",
  description: "Input data directory path",
  type: "string",
  demandOption: true, // Require input directory path
}).argv;

// Extract input directory path from command-line arguments
const inputDir = argv.inputDir;

const LP_GLOBAL_DIR = "global";
const LP_HOME_DIR = "home";
const YAML_FILE_NAME = "data.yaml";
const PHOTOS_FOLDER_NAME = "images";
const GLOBAL_SCHEMA = "schema/global_schema.yaml";
const HOME_SCHEMA = "schema/home_schema.yaml";
const PROPERTY_SCHEMA = "schema/property_schema.yaml";

function validateInputData(inputDir) {
  let msg = "";
  let count = 0;
  let globalKeys;
  let homeKeys;
  let propertyKeys;
  let schemaKeys;

  console.log("Starting validation process...");

  if (!fs.existsSync(inputDir)) {
    msg += `${++count} Input data directory path provided does not exist \nSolution: Provide the correct input data directory path\n\n`;
  } else {
    console.log("Input data directory exists.");

    if (!fs.existsSync(`${inputDir}/${LP_HOME_DIR}`)) {
      msg += `${++count} Home directory does not exist\n`;
    } else {
      console.log("Home directory exists.");
    }

    if (!fs.existsSync(`${inputDir}/${LP_GLOBAL_DIR}`)) {
      msg += `${++count} Global directory does not exist\n`;
    } else {
      console.log("Global directory exists.");
    }

    // Validate global directory
    if (fs.existsSync(`${inputDir}/${LP_GLOBAL_DIR}`)) {
      validateSpecialDirectory(
        `${inputDir}/${LP_GLOBAL_DIR}`,
        GLOBAL_SCHEMA,
        "Global",
        globalKeys,
        (keys) => (globalKeys = keys),
        msg,
        count
      );
    }

    // Validate home directory
    if (fs.existsSync(`${inputDir}/${LP_HOME_DIR}`)) {
      validateSpecialDirectory(
        `${inputDir}/${LP_HOME_DIR}`,
        HOME_SCHEMA,
        "Home",
        homeKeys,
        (keys) => (homeKeys = keys),
        msg,
        count
      );
    }

    // Validate property directories
    fs.readdirSync(inputDir).forEach((propertyDir) => {
      // Skip hidden directories and special directories like global and home
      if (
        propertyDir.startsWith(".") ||
        propertyDir === LP_GLOBAL_DIR ||
        propertyDir === LP_HOME_DIR
      ) {
        return;
      }
      if (!/^[0-9][0-9-]*[0-9]$/.test(propertyDir)) {
        msg += `${++count} '${inputDir}/${propertyDir}' Invalid property name\n`;
      } else {
        console.log(`Property directory '${propertyDir}' is valid.`);
        // Check if it is a directory
        if (!fs.lstatSync(`${inputDir}/${propertyDir}`).isDirectory()) {
          msg += `${++count} '${inputDir}/${propertyDir}' is not a directory\n`;
        } else {
          // Check if yaml file exists
          if (!fs.existsSync(`${inputDir}/${propertyDir}/${YAML_FILE_NAME}`)) {
            msg += `${++count} '${inputDir}/${propertyDir}/${YAML_FILE_NAME}' does not exist\n`;
          } else {
            console.log(
              `YAML file '${YAML_FILE_NAME}' exists in '${propertyDir}' directory.`
            );
          }

          // Check if the file and directory names are correct
          fs.readdirSync(`${inputDir}/${propertyDir}`).forEach((subFile) => {
            if (subFile == PHOTOS_FOLDER_NAME) {
              if (
                !fs
                  .lstatSync(`${inputDir}/${propertyDir}/${subFile}`)
                  .isDirectory()
              ) {
                msg += `${++count} '${inputDir}/${propertyDir}/${subFile}' is not a directory\n`;
              } else {
                fs.readdirSync(`${inputDir}/${propertyDir}/${subFile}`).forEach(
                  (image) => {
                    if (!/[.jpg|.JPG|.JPEG|.jpeg|.png|.PNG]$/.test(image)) {
                      msg += `${++count} '${inputDir}/${propertyDir}/${subFile}/${image}' is an invalid image file\n`;
                    }
                  }
                );
              }
            } else if (subFile == YAML_FILE_NAME) {
              // Validate YAML
              if (propertyKeys == undefined) {
                propertyKeys = getKeyValueMapFromYAML(PROPERTY_SCHEMA);
              }
              schemaKeys = propertyKeys;

              let inputKeys = getKeyValueMapFromYAML(
                `${inputDir}/${propertyDir}/${subFile}`
              );
              if (inputKeys) {
                let schemaType;
                let inputType;
                let entries = inputKeys.entries();
                let result = entries.next();
                while (!result.done) {
                  if (
                    !result.value[0].includes("propertyPageSectionsOrder.") &&
                    !result.value[0].includes("homePageSectionsOrder.")
                  ) {
                    // Validate property name
                    if (!schemaKeys.has(result.value[0])) {
                      msg += `${++count} '${result.value[0]}' is not a valid property name in the file '${inputDir}/${propertyDir}/${subFile}'\n\n`;
                    } else {
                      // Validate property type
                      schemaType = schemaKeys.get(result.value[0]).type;
                      schemaType =
                        schemaType == undefined ? "object" : schemaType;
                      inputType = typeof result.value[1];
                      if (result.value[1] != null && inputType != schemaType) {
                        msg += `${++count} Data type of the property '${result.value[0]}' is not correct in the file '${inputDir}/${propertyDir}/${subFile}'\nSolution: Expected data type is '${schemaType}' \n\n`;
                      }
                    }
                  }
                  result = entries.next();
                }
              } else {
                msg += `${++count} YAML data file '${inputDir}/${propertyDir}/${subFile}' is empty\nSolution: Provide a valid ${subFile}\n\n`;
              }
            } else {
              msg += `${++count} '${subFile}' is not allowed in the directory '${inputDir}/${propertyDir}'\nSolution: Allowed file and directory in '${inputDir}/${propertyDir}' are 'data.yaml' and 'images' respectively\n\n`;
            }
          });
        }
      }
    });
  }

  if (msg) {
    console.error(msg); // Log error message
    process.exit(1); // Exit with non-zero status
  } else {
    console.log("Validation process completed.");
  }
}

function validateSpecialDirectory(
  dirPath,
  schemaPath,
  dirType,
  schemaKeys,
  setSchemaKeys,
  msg,
  count
) {
  if (schemaKeys == undefined) {
    schemaKeys = getKeyValueMapFromYAML(schemaPath);
    setSchemaKeys(schemaKeys);
  }

  fs.readdirSync(dirPath).forEach((file) => {
    if (file === YAML_FILE_NAME) {
      let inputKeys = getKeyValueMapFromYAML(`${dirPath}/${file}`);
      if (inputKeys) {
        let schemaType;
        let inputType;
        let entries = inputKeys.entries();
        let result = entries.next();
        while (!result.done) {
          if (
            !result.value[0].includes("propertyPageSectionsOrder.") &&
            !result.value[0].includes("homePageSectionsOrder.")
          ) {
            // Validate property name
            if (!schemaKeys.has(result.value[0])) {
              msg += `${++count} '${result.value[0]}' is not a valid property name in the ${dirType} directory\n\n`;
            } else {
              // Validate property type
              schemaType = schemaKeys.get(result.value[0]).type;
              schemaType = schemaType == undefined ? "object" : schemaType;
              inputType = typeof result.value[1];
              if (result.value[1] != null && inputType != schemaType) {
                msg += `${++count} Data type of the property '${result.value[0]}' is not correct in the ${dirType} directory\nSolution: Expected data type is '${schemaType}' \n\n`;
              }
            }
          }
          result = entries.next();
        }
      } else {
        msg += `${++count} YAML data file '${dirPath}/${file}' is empty\nSolution: Provide a valid ${file}\n\n`;
      }
    } else if (file !== PHOTOS_FOLDER_NAME) {
      msg += `${++count} '${file}' is not allowed in the ${dirType} directory\nSolution: Allowed files in the ${dirType} directory are '${YAML_FILE_NAME}' and '${PHOTOS_FOLDER_NAME}'\n\n`;
    }
  });
}

function getKeyValueMapFromYAML(filePath) {
  let ret = undefined;
  let uiSchema = fs.readFileSync(filePath, "utf8");
  if (uiSchema) {
    let uiData = yaml.load(uiSchema);
    if (uiData) {
      ret = getAllKeysAndValues(uiData);
    }
  }
  return ret;
}
function getAllKeysAndValues(inputData, keys = new Map(), ref = "") {
  let allKeys = keys;
  let newKey;
  Object.keys(inputData).forEach((key) => {
    if (ref != "") {
      newKey = `${ref}.${key}`;
    } else {
      newKey = key;
    }
    allKeys.set(newKey, inputData[key]);
    if (inputData[key] != undefined && typeof inputData[key] === "object") {
      getAllKeysAndValues(inputData[key], allKeys, newKey);
    }
  });
  return allKeys;
}

validateInputData(inputDir);
