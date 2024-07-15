const fs = require("fs");
const yaml = require("js-yaml");
const yargs = require("yargs");

// Command-line arguments configuration
const argv = yargs.option("inputDir", {
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

function validateInputData() {
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
      msg += `${++count} Home directory does not exist`;
    } else {
      console.log("Home directory exists.");
      if (!fs.existsSync(`${inputDir}/${LP_GLOBAL_DIR}`)) {
        msg += `${++count} Global directory does not exist`;
      } else {
        console.log("Global directory exists.");
        //checking if the directory names are correct
        fs.readdirSync(inputDir).forEach((propertyDir) => {
          // Skip hidden directories and special directories like global and home
          if (
            propertyDir.startsWith(".") ||
            propertyDir === LP_GLOBAL_DIR ||
            propertyDir === LP_HOME_DIR
          ) {
            return;
          }
          if (!/^[0-9][0-9-]+[0-9]$/.test(propertyDir)) {
            msg += `${++count} '${inputDir}/${propertyDir}' Invalid property name\n`;
          } else {
            console.log(`Property directory '${propertyDir}' is valid.`);
            //check if it is a directory
            if (!fs.lstatSync(`${inputDir}/${propertyDir}`).isDirectory()) {
              msg += `${++count} '${inputDir}/${propertyDir}' is not a directory\n`;
            } else {
              //check if yaml file exists
              if (
                !fs.existsSync(`${inputDir}/${propertyDir}/${YAML_FILE_NAME}`)
              ) {
                msg += `${++count} '${inputDir}/${propertyDir}/${YAML_FILE_NAME}' does not exist\n`;
              } else {
                console.log(
                  `YAML file '${YAML_FILE_NAME}' exists in '${propertyDir}' directory.`
                );
              }

              //check if the file and directory names are correct
              fs.readdirSync(`${inputDir}/${propertyDir}`).forEach(
                (subFile) => {
                  if (subFile == PHOTOS_FOLDER_NAME) {
                    if (
                      !fs
                        .lstatSync(`${inputDir}/${propertyDir}/${subFile}`)
                        .isDirectory()
                    ) {
                      msg += `${++count} '${inputDir}/${propertyDir}/${subFile}' is not a directory\n`;
                    } else {
                      fs.readdirSync(
                        `${inputDir}/${propertyDir}/${subFile}`
                      ).forEach((image) => {
                        if (!/[.jpg|.JPG|.JPEG|.jpeg|.png|.PNG]$/.test(image)) {
                          msg += `${++count} '${inputDir}/${propertyDir}/${subFile}/${image}' is an invalid image file\n`;
                        }
                      });
                    }
                  } else if (subFile == YAML_FILE_NAME) {
                    //Validate YAML
                    if (`${propertyDir}` == LP_GLOBAL_DIR) {
                      console.log("Schema for Global directory.");
                      if (globalKeys == undefined) {
                        globalKeys = getKeyValueMapFromYAML(GLOBAL_SCHEMA);
                      }
                      schemaKeys = globalKeys;
                    } else if (`${propertyDir}` == LP_HOME_DIR) {
                      console.log("Schema for Home directory.");
                      if (homeKeys == undefined) {
                        homeKeys = getKeyValueMapFromYAML(HOME_SCHEMA);
                      }
                      schemaKeys = homeKeys;
                    } else {
                      console.log("Schema for Property directory.");
                      if (propertyKeys == undefined) {
                        propertyKeys = getKeyValueMapFromYAML(PROPERTY_SCHEMA);
                      }
                      schemaKeys = propertyKeys;
                    }
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
                          !result.value[0].includes(
                            "propertyPageSectionsOrder."
                          ) &&
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
                            if (
                              result.value[1] != null &&
                              inputType != schemaType
                            ) {
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
                }
              );
            }
          }
        });
      }
    }
  }

  if (msg) {
    console.error(msg); // Log error message
    process.exit(1); // Exit with non-zero status
  } else {
    console.log("Validation process completed.");
  }
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
