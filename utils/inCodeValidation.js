const fs = require("fs");
const yaml = require("js-yaml");

// Define constants for various folder and file names
const LP_GLOBAL_DIR = "global";
const LP_HOME_DIR = "home";
const YAML_FILE_NAME = "data.yaml";
const PHOTOS_FOLDER_NAME = "images";
const GLOBAL_SCHEMA = "schema/global_schema.yaml";
const HOME_SCHEMA = "schema/home_schema.yaml";
const PROPERTY_SCHEMA = "schema/property_schema.yaml";
const ERROR_MESSAGES_FILE = "messages/errorMessage.json";

export function validateInputData(inputDir) {
  let msg = "";    // Stores error messages
  let count = 0;   // Error counter for numbering messages
  let globalKeys;  // To hold keys from the global schema
  let homeKeys;    // To hold keys from the home schema
  let propertyKeys;// To hold keys from the property schema
  let schemaKeys;  // Temporary variable to hold schema keys for property files

  console.log("Starting validation process...");

  // Check if the provided input directory exists
  if (!fs.existsSync(inputDir)) {
    msg += `${++count} Input data directory path provided does not exist \n`;
  } else {
    console.log("Input data directory exists.");

    // Check existence of the Home directory within the input directory
    if (!fs.existsSync(`${inputDir}/${LP_HOME_DIR}`)) {
      msg += `${++count} Home directory does not exist\n`;
    } else {
      console.log("Home directory exists.");
    }

    // Check existence of the Global directory within the input directory
    if (!fs.existsSync(`${inputDir}/${LP_GLOBAL_DIR}`)) {
      msg += `${++count} Global directory does not exist\n`;
    } else {
      console.log("Global directory exists.");
    }

    // Validate files inside the Global directory using the global schema
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

    // Validate files inside the Home directory using the home schema
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

    // Loop through directories at the root of inputDir to find property directories.
    fs.readdirSync(inputDir).forEach((propertyDir) => {
      // Skip hidden files/folders and the global/home directories
      if (
        propertyDir.startsWith(".") ||
        propertyDir === LP_GLOBAL_DIR ||
        propertyDir === LP_HOME_DIR
      ) {
        return;
      }

      // Validate the naming pattern of property directories
      if (!/^[0-9][0-9-]*[0-9]$/.test(propertyDir)) {
        msg += `${++count} '${inputDir}/${propertyDir}' Invalid property name\n`;
      } else {
        // Check if the property directory is indeed a directory
        if (!fs.lstatSync(`${inputDir}/${propertyDir}`).isDirectory()) {
          msg += `${++count} '${inputDir}/${propertyDir}' is not a directory\n`;
        } else {
          // Check if the YAML file exists in the property directory
          if (!fs.existsSync(`${inputDir}/${propertyDir}/${YAML_FILE_NAME}`)) {
            msg += `${++count} '${inputDir}/${propertyDir}/${YAML_FILE_NAME}' does not exist\n`;
          } else {
            console.log(
              `YAML file '${YAML_FILE_NAME}' exists in '${propertyDir}' directory.`
            );
          }

          // Validate files within the property directory
          fs.readdirSync(`${inputDir}/${propertyDir}`).forEach((subFile) => {
            // If the subFile is the photos folder, validate its contents
            if (subFile === PHOTOS_FOLDER_NAME) {
              if (
                !fs.lstatSync(`${inputDir}/${propertyDir}/${subFile}`).isDirectory()
              ) {
                msg += `${++count} '${inputDir}/${propertyDir}/${subFile}' is not a directory\n`;
              } else {
                // Check each file in the photos folder to ensure valid image file extensions
                fs.readdirSync(`${inputDir}/${propertyDir}/${subFile}`).forEach(
                  (image) => {
                    if (!/[.](jpg|JPG|JPEG|jpeg|png|PNG)$/.test(image)) {
                      msg += `${++count} '${inputDir}/${propertyDir}/${subFile}/${image}' is an invalid image file\n`;
                    }
                  }
                );
              }
            } else if (subFile === YAML_FILE_NAME) {
              // If propertyKeys is not already set, load the property schema keys from the PROPERTY_SCHEMA file
              if (propertyKeys === undefined) {
                propertyKeys = getKeyValueMapFromYAML(PROPERTY_SCHEMA);
              }
              schemaKeys = propertyKeys;

              // Get keys and values from the YAML file in the property directory
              let inputKeys = getKeyValueMapFromYAML(`${inputDir}/${propertyDir}/${subFile}`);
              if (inputKeys) {
                // Loop through each key in the YAML data for validation
                for (let [key, value] of inputKeys.entries()) {
                  // Skip keys that are not meant for schema validation
                  if (
                    key.includes("propertyPageSectionsOrder.") ||
                    key.includes("homePageSectionsOrder.")
                  ) {
                    continue;
                  }

                  let validateKey = key;
                  // For keys starting with siteOverrides, strip out the siteOverrides prefix and the site identifier.
                  if (key.startsWith("siteOverrides.")) {
                    const parts = key.split(".");
                    // If it’s just a container (siteOverrides.<siteId>), skip validation.
                    if (parts.length === 2) {
                      continue;
                    } else if (parts.length >= 3) {
                      // Remove both the 'siteOverrides' and the site identifier.
                      validateKey = parts.slice(2).join(".");
                    }
                  }

                  // Get the corresponding schema definition for the key
                  let schemaDef = schemaKeys.get(validateKey);
                  if (!schemaDef) {
                    msg += `${++count} '${key}' is not a valid property name in the file '${inputDir}/${propertyDir}/${subFile}'\n\n`;
                  } else {
                    // Check that the data type of the input value matches the expected type in the schema
                    let inputType = Array.isArray(value) ? "array" : typeof value;
                    let expectedType = schemaDef.type || "object";
                    if (value != null && inputType !== expectedType) {
                      msg += `${++count} Data type of the property '${key}' is not correct in the file '${inputDir}/${propertyDir}/${subFile}' (expected ${expectedType} but got ${inputType})\n`;
                    }
                  }
                }
                // Validate that siteOverrides keys match the siteName value(s)
                validateSiteOverrides(
                  inputKeys,
                  `${inputDir}/${propertyDir}/${subFile}`,
                  (errorMsg) => { msg += errorMsg; },
                  () => ++count
                );
              } else {
                msg += `${++count} YAML data file '${inputDir}/${propertyDir}/${subFile}' is empty \n`;
              }
            } else {
              // Any other files in the property directory are not allowed
              msg += `${++count} '${subFile}' is not allowed in the directory '${inputDir}/${propertyDir}' \n`;
            }
          });
        }
      }
    });
  }

  // If errors were found, write them to the error message JSON file
  if (msg) {
    console.log("Validation errors detected. Writing to errorMessage.json...");
    const formattedErrors = msg
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((error, index) => ({
        ErrorNumber: index + 1,
        ErrorMessage: error.trim(),
      }));
    fs.writeFileSync(
      ERROR_MESSAGES_FILE,
      JSON.stringify({ errors: formattedErrors }, null, 2)
    );
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
  // Load schema keys if not already provided
  if (schemaKeys === undefined) {
    schemaKeys = getKeyValueMapFromYAML(schemaPath);
    setSchemaKeys(schemaKeys);
  }

  // Loop through files in the directory
  fs.readdirSync(dirPath).forEach((file) => {
    if (file === YAML_FILE_NAME) {
      // Load the keys from the YAML file
      let inputKeys = getKeyValueMapFromYAML(`${dirPath}/${file}`);
      if (inputKeys) {
        // Loop through each key in the YAML file
        for (let [key, value] of inputKeys.entries()) {
          // Skip keys not subject to schema validation
          if (
            key.includes("propertyPageSectionsOrder.") ||
            key.includes("homePageSectionsOrder.")
          ) {
            continue;
          }

          let validateKey = key;
          // Process keys starting with "siteOverrides."
          if (key.startsWith("siteOverrides.")) {
            const parts = key.split(".");
            // Skip if it is just the container key
            if (parts.length === 2) {
              continue;
            } else if (parts.length >= 3) {
              // Remove the 'siteOverrides' and the site identifier.
              validateKey = parts.slice(2).join(".");
            }
          }

          // Retrieve schema definition for the key
          let schemaDef = schemaKeys.get(validateKey);
          if (!schemaDef) {
            appendMsg(`${getCount()} '${key}' is not a valid property name in the ${dirType} directory\n\n`);
          } else {
            // Compare data types between input and expected schema type
            let inputType = Array.isArray(value) ? "array" : typeof value;
            let expectedType = schemaDef.type || "object";
            if (value != null && inputType !== expectedType) {
              appendMsg(`${getCount()} Data type of the property '${key}' is not correct in the ${dirType} directory (expected ${expectedType} but got ${inputType})\n`);
            }
          }
        }
        // Validate consistency of siteName and siteOverrides entries
        validateSiteOverrides(
          inputKeys,
          `${dirPath}/${file}`,
          appendMsg,
          getCount
        );
      } else {
        appendMsg(`${getCount()} YAML data file '${dirPath}/${file}' is empty \n`);
      }
    } else if (file !== PHOTOS_FOLDER_NAME) {
      // Any files other than the YAML file or photos folder are not permitted
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
      // Recursively extract keys and values from the YAML data
      ret = getAllKeysAndValues(uiData);
    }
  }
  return ret;
}

export function getAllKeysAndValues(inputData, keys = new Map(), ref = "") {
  if (inputData === undefined || inputData === null) {
    return keys;
  }

  // If input is an array, store it as a whole.
  if (Array.isArray(inputData)) {
    keys.set(ref, inputData);
    return keys;
  }

  // If input is a primitive value, store it directly.
  if (typeof inputData !== "object") {
    keys.set(ref, inputData);
    return keys;
  }

  // Loop through object keys and recursively extract nested keys.
  Object.keys(inputData).forEach((key) => {
    const newKey = ref ? `${ref}.${key}` : key;
    keys.set(newKey, inputData[key]);
    // Only recurse for plain objects (skip arrays)
    if (inputData[key] && typeof inputData[key] === "object" && !Array.isArray(inputData[key])) {
      getAllKeysAndValues(inputData[key], keys, newKey);
    }
  });

  return keys;
}

export function validateSiteOverrides(inputKeys, filePath, appendMsg, getCount) {
  // Get the 'siteName' value from the YAML data
  const siteNameRaw = inputKeys.get("siteName");
  if (siteNameRaw) {
    // Determine allowed site names based on whether siteName is a string or array
    let allowedSiteNames;
    if (typeof siteNameRaw === "string") {
      allowedSiteNames = new Set(
        siteNameRaw.split(",").map(s => s.trim()).filter(Boolean)
      );
    } else if (Array.isArray(siteNameRaw)) {
      allowedSiteNames = new Set(
        siteNameRaw.map(s => String(s).trim()).filter(Boolean)
      );
    } else {
      allowedSiteNames = new Set([String(siteNameRaw).trim()]);
    }
    
    // Collect site names found in keys that start with 'siteOverrides.'
    let overrideSiteNames = new Set();
    for (let key of inputKeys.keys()) {
      if (key.startsWith("siteOverrides.")) {
        const parts = key.split(".");
        if (parts.length >= 2 && parts[1]) {
          overrideSiteNames.add(parts[1].trim());
        }
      }
    }
    // Only validate if any overrides are present
    if (overrideSiteNames.size > 0) {
      // Validate that the overrides exactly match the allowed site names
      if (
        overrideSiteNames.size !== allowedSiteNames.size ||
        [...overrideSiteNames].some(x => !allowedSiteNames.has(x))
      ) {
        appendMsg(
          `${getCount()} 'siteOverrides' should only contain overrides for the site name '${[...allowedSiteNames].join(",")}', but found overrides for: ${[...overrideSiteNames].join(", ")} in file '${filePath}'\n`
        );
      }
    }
  }
}
