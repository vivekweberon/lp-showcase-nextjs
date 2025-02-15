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

    // Validate global directory (using a getCount function that increments count)
    if (fs.existsSync(`${inputDir}/${LP_GLOBAL_DIR}`)) {
      console.log("Validating Global directory...");
      validateSpecialDirectory(
        `${inputDir}/${LP_GLOBAL_DIR}`,
        GLOBAL_SCHEMA,
        "Global",
        globalKeys,
        (keys) => (globalKeys = keys),
        (errorMsg) => { msg += errorMsg; },
        () => ++count
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
        (errorMsg) => { msg += errorMsg; },
        () => ++count
      );
    }

    // Validate property directories
    fs.readdirSync(inputDir).forEach((propertyDir) => {
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
                !fs.lstatSync(`${inputDir}/${propertyDir}/${subFile}`).isDirectory()
              ) {
                msg += `${++count} '${inputDir}/${propertyDir}/${subFile}' is not a directory\n`;
              } else {
                fs.readdirSync(`${inputDir}/${propertyDir}/${subFile}`).forEach(
                  (image) => {
                    if (!/[.](jpg|JPG|JPEG|jpeg|png|PNG)$/.test(image)) {
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

              let inputKeys = getKeyValueMapFromYAML(`${inputDir}/${propertyDir}/${subFile}`);
              if (inputKeys) {
                for (let [key, value] of inputKeys.entries()) {
                  // Skip keys that are known to be non-schema (if any)
                  if (
                    key.includes("propertyPageSectionsOrder.") ||
                    key.includes("homePageSectionsOrder.")
                  ) {
                    continue;
                  }

                  let validateKey = key;
                  if (key.startsWith("siteOverrides.")) {
                    const parts = key.split(".");
                    // If this is just a container (siteOverrides.<siteId>), skip validation.
                    if (parts.length === 2) {
                      continue;
                    } else if (parts.length >= 3) {
                      validateKey = "default." + parts.slice(2).join(".");
                    }
                  }

                  let schemaDef = schemaKeys.get(validateKey);
                  if (!schemaDef) {
                    msg += `${++count} '${key}' is not a valid property name in the file '${inputDir}/${propertyDir}/${subFile}'\n\n`;
                  } else {
                    let inputType = Array.isArray(value) ? "array" : typeof value;
                    let expectedType = schemaDef.type || "object";
                    if (value != null && inputType !== expectedType) {
                      msg += `${++count} Data type of the property '${key}' is not correct in the file '${inputDir}/${propertyDir}/${subFile}' (expected ${expectedType} but got ${inputType})\n`;
                    }
                  }
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
    const formattedErrors = msg
      .split("\n")
      .filter(line => line.trim() !== "")
      .map((error, index) => ({
        ErrorNumber: index + 1,
        ErrorMessage: error.trim()
      }));
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
  appendMsg,
  getCount
) {
  if (schemaKeys === undefined) {
    schemaKeys = getKeyValueMapFromYAML(schemaPath);
    setSchemaKeys(schemaKeys);
  }

  fs.readdirSync(dirPath).forEach((file) => {
    if (file === YAML_FILE_NAME) {
      let inputKeys = getKeyValueMapFromYAML(`${dirPath}/${file}`);
      if (inputKeys) {
        for (let [key, value] of inputKeys.entries()) {
          // Skip keys that are known to be non-schema (if any)
          if (
            key.includes("propertyPageSectionsOrder.") ||
            key.includes("homePageSectionsOrder.")
          ) {
            continue;
          }

          let validateKey = key;
          if (key.startsWith("siteOverrides.")) {
            const parts = key.split(".");
            // Skip the container key (siteOverrides.<siteId>)
            if (parts.length === 2) {
              continue;
            } else if (parts.length >= 3) {
              validateKey = "default." + parts.slice(2).join(".");
            }
          }

          let schemaDef = schemaKeys.get(validateKey);
          if (!schemaDef) {
            appendMsg(`${getCount()} '${key}' is not a valid property name in the ${dirType} directory\n\n`);
          } else {
            let inputType = Array.isArray(value) ? "array" : typeof value;
            let expectedType = schemaDef.type || "object";
            if (value != null && inputType !== expectedType) {
              appendMsg(`${getCount()} Data type of the property '${key}' is not correct in the ${dirType} directory (expected ${expectedType} but got ${inputType})\n`);
            }
          }
        }
      } else {
        appendMsg(`${getCount()} YAML data file '${dirPath}/${file}' is empty \n`);
      }
    } else if (file !== PHOTOS_FOLDER_NAME) {
      appendMsg(`${getCount()} '${file}' is not allowed in the ${dirType} directory \n`);
    }
  });
}

export function getKeyValueMapFromYAML(filePath) {
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

export function getAllKeysAndValues(inputData, keys = new Map(), ref = "") {
  if (inputData === undefined || inputData === null) {
    return keys;
  }

  // If the input data is an array, treat it as a whole.
  if (Array.isArray(inputData)) {
    keys.set(ref, inputData);
    return keys;
  }

  // If the input is not an object, set the value and return.
  if (typeof inputData !== "object") {
    keys.set(ref, inputData);
    return keys;
  }

  Object.keys(inputData).forEach((key) => {
    const newKey = ref ? `${ref}.${key}` : key;
    keys.set(newKey, inputData[key]);
    // Only recurse if the value is a plain object (not an array)
    if (inputData[key] && typeof inputData[key] === "object" && !Array.isArray(inputData[key])) {
      getAllKeysAndValues(inputData[key], keys, newKey);
    }
  });

  return keys;
}
