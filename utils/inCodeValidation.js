const fs = require("fs");
const yaml = require("js-yaml");

const LP_GLOBAL_DIR = "global";
const LP_HOME_DIR = "home";
const YAML_FILE_NAME = "data.yaml";
const PHOTOS_FOLDER_NAME = "images";
const GLOBAL_SCHEMA = "schema/global_schema.yaml";
const HOME_SCHEMA = "schema/home_schema.yaml";
const PROPERTY_SCHEMA = "schema/property_schema.yaml";
const ERROR_MESSAGES_FILE = "messages/errorMessage.json";

export function validateInputData(inputDir) {
  let msg = "";
  let count = 0;
  let globalKeys;
  let homeKeys;
  let propertyKeys;
  let schemaKeys;

  console.log("Starting validation process...");
  // console.log("Input data directory path: ", inputDir);

  if (!fs.existsSync(inputDir)) {
    msg += `${++count} Input data directory path provided does not exist \n`;
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
      console.log("Validating Global directory...");
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
      console.log("Validating Home directory...");
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
      // console.log(`Validating property directory '${propertyDir}'...`);
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
        // console.log(`Property directory '${propertyDir}' is valid.`);
        if (!fs.lstatSync(`${inputDir}/${propertyDir}`).isDirectory()) {
          msg += `${++count} '${inputDir}/${propertyDir}' is not a directory\n`;
        } else {
          if (!fs.existsSync(`${inputDir}/${propertyDir}/${YAML_FILE_NAME}`)) {
            msg += `${++count} '${inputDir}/${propertyDir}/${YAML_FILE_NAME}' does not exist\n`;
          } else {
            console.log(
              `YAML file '${YAML_FILE_NAME}' exists in '${propertyDir}' directory.`
            );
          }

          fs.readdirSync(`${inputDir}/${propertyDir}`).forEach((subFile) => {
            if (subFile === PHOTOS_FOLDER_NAME) {
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
            } else if (subFile === YAML_FILE_NAME) {
              if (propertyKeys === undefined) {
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
                    if (!schemaKeys.has(result.value[0])) {
                      msg += `${++count} '${result.value[0]}' is not a valid property name in the file '${inputDir}/${propertyDir}/${subFile}'\n\n`;
                    } else {
                      schemaType = schemaKeys.get(result.value[0]).type;
                      schemaType =
                        schemaType === undefined ? "object" : schemaType;
                      inputType = typeof result.value[1];
                      if (result.value[1] != null && inputType !== schemaType) {
                        msg += `${++count} Data type of the property '${result.value[0]}' is not correct in the file '${inputDir}/${propertyDir}/${subFile}'\n`;
                      }
                    }
                  }
                  result = entries.next();
                }
              } else {
                msg += `${++count} YAML data file '${inputDir}/${propertyDir}/${subFile}' is empty \n`;
              }
            } else {
              msg += `${++count} '${subFile}' is not allowed in the directory '${inputDir}/${propertyDir}' \n`;
            }
          });
        }
      }
    });
  }

  if (msg) {
    console.log("Validation errors detected. Writing to errorMessage.json...");
    
    // Convert the errors to a structured format with each error on a separate line
    const formattedErrors = msg.split("\n").filter(line => line.trim() !== "").map((error, index) => ({
      ErrorNumber: index + 1,
      ErrorMessage: error.trim()
    }));
    
    // Write the structured errors to the file with proper indentation
    fs.writeFileSync(ERROR_MESSAGES_FILE, JSON.stringify({ errors: formattedErrors }, null, 2));
  } else {
    console.log("Validation process completed successfully. No errors detected.");
  }
  
}

export function validateSpecialDirectory(
  dirPath,
  schemaPath,
  dirType,
  schemaKeys,
  setSchemaKeys,
  msg,
  count
) {
  if (schemaKeys === undefined) {
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
            if (!schemaKeys.has(result.value[0])) {
              msg += `${++count} '${result.value[0]}' is not a valid property name in the ${dirType} directory\n\n`;
            } else {
              schemaType = schemaKeys.get(result.value[0]).type;
              schemaType = schemaType === undefined ? "object" : schemaType;
              inputType = typeof result.value[1];
              if (result.value[1] != null && inputType !== schemaType) {
                msg += `${++count} Data type of the property '${result.value[0]}' is not correct in the ${dirType} directory \n`;
              }
            }
          }
          result = entries.next();
        }
      } else {
        msg += `${++count} YAML data file '${dirPath}/${file}' is empty \n`;
      }
    } else if (file !== PHOTOS_FOLDER_NAME) {
      msg += `${++count} '${file}' is not allowed in the ${dirType} directory \n`;
    }
  });
}

export function getKeyValueMapFromYAML(filePath) {
  // console.log("Reading YAML file: ", filePath);
  let ret = undefined;
  let uiSchema = fs.readFileSync(filePath, "utf8");
  // console.log("uiSchema", uiSchema);
  if (uiSchema) {
    let uiData = yaml.load(uiSchema);
    // console.log("uiData", uiData);
    if (uiData) {
      ret = getAllKeysAndValues(uiData);
    }
  }
  return ret;
}

export function getAllKeysAndValues(inputData, keys = new Map(), ref = "") {
  // console.log(`Processing inputData:`, inputData); // Log the current inputData
  // console.log(`Current ref: "${ref}"`); // Log the current ref

  // Ensure inputData is an object before processing
  if (!inputData || typeof inputData !== "object") {
    // console.warn(`Skipping invalid inputData:`, inputData); // Warn about invalid input
    return keys;
  }

  let allKeys = keys;
  let newKey;

  // Safely iterate over inputData keys
  Object.keys(inputData).forEach((key) => {
    if (ref !== "") {
      newKey = `${ref}.${key}`;
    } else {
      newKey = key;
    }

    // console.log(`Adding key-value pair: "${newKey}" =>`, inputData[key]); // Log key-value being added
    allKeys.set(newKey, inputData[key]);

    // Recursively process nested objects
    if (
      inputData[key] !== undefined &&
      typeof inputData[key] === "object" &&
      inputData[key] !== null
    ) {
      // console.log(`Recursing into nested object at key: "${newKey}"`); // Log recursion
      getAllKeysAndValues(inputData[key], allKeys, newKey);
    }
  });

  // console.log(`Returning keys so far:`, [...allKeys.entries()]); // Log all keys and values before returning
  return allKeys;
}
