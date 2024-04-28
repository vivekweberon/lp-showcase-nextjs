const fs = require("fs");
const yaml = require("js-yaml");
const yargs = require("yargs");
const path = require("path");

const LP_GLOBAL_DIR = "global";
const LP_HOME_DIR = "home";
const YAML_FILE_NAME = "data.yaml";
const PHOTOS_FOLDER_NAME = "images";
const GLOBAL_SCHEMA = "schema/global_schema.yaml";
const HOME_SCHEMA = "schema/home_schema.yaml";
const PROPERTY_SCHEMA = "schema/property_schema.yaml";
const PUBLIC_DIR = "../../public"; // Adjust the path as needed

const argv = yargs
  .option("inputDir", {
    alias: "i",
    describe: "Input directory path",
    demandOption: true,
    type: "string",
  })
  .help()
  .alias("help", "h").argv;

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
    if (!fs.existsSync(`${inputDir}/${LP_HOME_DIR}`)) {
      msg += `${++count} Home directory does not exist \nSolution: Input data directory should contain 'home' directory\n\n`;
    } else {
      if (!fs.existsSync(`${inputDir}/${LP_GLOBAL_DIR}`)) {
        msg += `${++count} Global directory does not exist \nSolution: Input data directory should contain 'global' directory\n\n`;
      } else {
        fs.readdirSync(inputDir).forEach((propertyDir) => {
          if (
            propertyDir != LP_HOME_DIR &&
            propertyDir != LP_GLOBAL_DIR &&
            !/^[0-9][0-9-]+[0-9]$/.test(propertyDir)
          ) {
            msg += `${++count} '${inputDir}/${propertyDir}' is an invalid File/Directory name.\nSolution: Directory name should be 'global', 'home', or APN of the property\n\n`;
          } else {
            if (!fs.lstatSync(`${inputDir}/${propertyDir}`).isDirectory()) {
              msg += `${++count} '${inputDir}/${propertyDir}' is not a directory \nSolution: Input data directory can only contain 'global', 'home', and property directories\n\n`;
            } else {
              if (
                !fs.existsSync(`${inputDir}/${propertyDir}/${YAML_FILE_NAME}`)
              ) {
                msg += `${++count} '${inputDir}/${propertyDir}/${YAML_FILE_NAME}' does not exist \nSolution: '${inputDir}/${propertyDir}/' should contain '${YAML_FILE_NAME}' file\n\n`;
              }

              fs.readdirSync(`${inputDir}/${propertyDir}`).forEach(
                (subFile) => {
                  if (subFile == PHOTOS_FOLDER_NAME) {
                    if (
                      !fs
                        .lstatSync(`${inputDir}/${propertyDir}/${subFile}`)
                        .isDirectory()
                    ) {
                      msg += `${++count} '${inputDir}/${propertyDir}/${subFile}' is not a directory \nSolution: 'images' should be a directory\n\n`;
                    } else {
                      fs.readdirSync(
                        `${inputDir}/${propertyDir}/${subFile}`
                      ).forEach((image) => {
                        if (!/[.jpg|.JPG|.JPEG|.jpeg|.png|.PNG]$/.test(image)) {
                          msg += `${++count} '${inputDir}/${propertyDir}/${subFile}/${image}' is an invalid image file \nSolution: Allowed image formats are JPG and PNG\n\n`;
                        }
                      });
                      const source = `${inputDir}/${propertyDir}/${subFile}`;
                      const destination = `${PUBLIC_DIR}/${propertyDir}/${subFile}`;
                      moveFolder(source, destination);
                    }
                  } else if (subFile == YAML_FILE_NAME) {
                    if (`${propertyDir}` == LP_GLOBAL_DIR) {
                      if (globalKeys == undefined) {
                        globalKeys = getKeyValueMapFromYAML(GLOBAL_SCHEMA);
                      }
                      schemaKeys = globalKeys;
                    } else if (`${propertyDir}` == LP_HOME_DIR) {
                      if (homeKeys == undefined) {
                        homeKeys = getKeyValueMapFromYAML(HOME_SCHEMA);
                      }
                      schemaKeys = homeKeys;
                    } else {
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
                          if (!schemaKeys.has(result.value[0])) {
                            msg += `${++count} '${result.value[0]}' is not a valid property name in the file '${inputDir}/${propertyDir}/${subFile}'\n\n`;
                          } else {
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
                    msg += `${++count} '${subFile}' is not allowed in the directory '${inputDir}/${propertyDir}' \nSolution: Allowed file and directory in '${inputDir}/${propertyDir}' are 'data.yaml' and 'images' respectively\n\n`;
                  }
                }
              );
            }
          }
        });
      }
    }
  }
  console.log("Validation process completed.");
  return msg;
}

function getKeyValueMapFromYAML(filePath) {
  console.log(`Reading YAML file from: '${filePath}'`);
  let ret = undefined;
  let uiSchema = fs.readFileSync(filePath, "utf8");
  if (uiSchema) {
    console.log(`Parsing YAML data from file: '${filePath}'`);
    let uiData = yaml.load(uiSchema);
    if (uiData) {
      console.log(`Extracting key-value map from YAML data`);
      ret = getAllKeysAndValues(uiData);
    }
  }
  return ret;
}

function getAllKeysAndValues(inputData, keys = new Map(), ref = "") {
  console.log(`Extracting keys and values from input data`);
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

function moveFolder(source, destination) {
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.renameSync(source, destination);
  console.log(`Moved '${source}' to '${destination}'`);
}

const inputDir = argv.inputDir;

const msg = validateInputData(inputDir);
console.log(msg);
