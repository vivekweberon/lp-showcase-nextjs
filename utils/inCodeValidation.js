const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Constants for folder names and file names
const LP_GLOBAL_DIR = "global";
const LP_HOME_DIR = "home";
const YAML_FILE_NAME = "data.yaml";
const PHOTOS_FOLDER_NAME = "images";
const SCHEMA_DIR = "schema";
const GLOBAL_SCHEMA_FILE = "global_schema.yaml";
const HOME_SCHEMA_FILE = "home_schema.yaml";
const PROPERTY_SCHEMA_FILE = "property_schema.yaml";
const ERROR_MESSAGES_FILE = path.join("messages", "errorMessage.json");

function loadSchemas() {
  const globalSchema = loadYAMLSchema(path.join(SCHEMA_DIR, GLOBAL_SCHEMA_FILE));
  // console.log('Loaded global schema:', globalSchema);

  const homeSchema = loadYAMLSchema(path.join(SCHEMA_DIR, HOME_SCHEMA_FILE));
  // console.log('Loaded home schema:', homeSchema);

  const propertySchema = loadYAMLSchema(path.join(SCHEMA_DIR, PROPERTY_SCHEMA_FILE));
  // console.log('Loaded property schema:', propertySchema);

  return {
    globalSchema,
    homeSchema,
    propertySchema
  };
}


function loadYAMLSchema(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return fileContent ? yaml.load(fileContent) : {};  // Parse the file content as YAML if it exists; otherwise, return an empty object.
}

// Recursively extract keys from YAML data into a Map.
// This function flattens a nested object into a Map where each key is a dot-separated path.
function getAllKeysAndValues(inputData, keys = new Map(), ref = "") {
  // If the input data is undefined or null, return the current keys Map.
  if (inputData === undefined || inputData === null) return keys;

  // If the input data is an array, store it as-is under the current reference key.
  if (Array.isArray(inputData)) {
    keys.set(ref, inputData);
    return keys;
  }

  // If the input data is a primitive (not an object), store it with the current key and return.
  if (typeof inputData !== "object") {
    keys.set(ref, inputData);
    return keys;
  }

  // For each key in the input object:
  Object.keys(inputData).forEach((key) => {
    // Create a new key path by appending the current key.
    // If ref is empty, use the key directly; otherwise, join ref and key with a dot.
    const newKey = ref ? `${ref}.${key}` : key;
    
    // Set the new key and its corresponding value in the Map.
    keys.set(newKey, inputData[key]);
    
    // If the value is an object (and not an array) then recursively process it.
    // This allows us to flatten nested objects.
    if (inputData[key] && typeof inputData[key] === "object" && !Array.isArray(inputData[key])) {
      getAllKeysAndValues(inputData[key], keys, newKey);
    }
  });

  // Return the fully populated Map of keys and values.
  return keys;
}


function getKeyValueMapFromYAML(filePath) {
  // Read the file content at the provided file path as a UTF-8 encoded string.
  const fileContent = fs.readFileSync(filePath, "utf8");

  // If the file is empty or not found, return an empty Map.
  if (!fileContent) return new Map();

  // Parse the YAML content into a JavaScript object.
  const data = yaml.load(fileContent);

  // Use the helper function to recursively flatten the object into a Map of key paths to values.
  return getAllKeysAndValues(data);
}


function validateFileAgainstSchema(inputKeys, schemaMap, filePath, getCount) {
  let errors = "";

  // Validate siteSpecific structure first.
  const siteOverridesErrors = validateSiteOverrides(inputKeys, filePath, getCount);
  if (siteOverridesErrors) {
    // If siteSpecific are invalid, no need to proceed with property validation.
    errors += siteOverridesErrors;
    return errors; 
  }

  // Now proceed with normal schema validation for other properties.
    inputKeys.forEach((value, key) => {
    let validateKey = key;

    if (key.startsWith("siteSpecific.")) {
        const parts = key.split(".");
        if (parts.length >= 3) {
            validateKey = parts.slice(2).join(".");
        } else {
            return;
        }

        const nestedKey = parts.slice(2).join(".");

        if (nestedKey === "siteSpecific" || nestedKey === "siteName") {
            errors += `${getCount()} '${key}' is not allowed inside 'siteSpecific' in file '${filePath}'\n`;
            return;
        }
    }

    let schemaDef = schemaMap.get(validateKey) || getValueFromNestedSchema(Object.fromEntries(schemaMap), validateKey);

    if (!schemaDef) {
        errors += `${getCount()} '${key}' is not a valid property name in the file '${filePath}'\n\n`;
    } else {
        const inputType = Array.isArray(value) ? "array" : typeof value;
        const expectedType = schemaDef.type || "object";

        if (value != null && inputType !== expectedType) {
            errors += `${getCount()} Data type of the property '${key}' is not correct in the file '${filePath}' (expected ${expectedType} but got ${inputType})\n`;
        }
    }
});


  return errors;
}

function getValueFromNestedSchema(schema, keyPath) {
  // Split the keyPath into its individual parts (e.g., "priceAndFeatures.title1" -> ["priceAndFeatures", "title1"]).
  const parts = keyPath.split(".");

  // Start with the root of the schema.
  let current = schema;

  // Iterate over each part of the key path.
  for (let part of parts) {
    // Check if the current value exists, is an object, and has the property corresponding to the current part.
    if (current && typeof current === "object" && current[part]) {
      // Move deeper into the schema by setting current to the value of the current part.
      current = current[part];
    } else {
      // If any part is missing, return undefined to indicate the key path doesn't exist in the schema.
      return undefined;
    }
  }
  // After traversing all parts, return the resolved value from the schema.
  return current;
}

function validateSiteOverrides(inputKeys, filePath, getCount) {
  let errorMsg = "";

  const allowedSiteNames = inputKeys.get("siteName").map(s => s.trim());

  // Collect all actual site names found in siteSpecific
  let overrideSiteNames = [];

  inputKeys.forEach((_, key) => {
      if (key.startsWith("siteSpecific.")) {
          const parts = key.split(".");
          if (parts.length >= 2 && parts[1]) {
              const siteName = parts[1].trim();
              if (!overrideSiteNames.includes(siteName)) {
                  overrideSiteNames.push(siteName);
              }
          }
      }
  });

  if (overrideSiteNames.length === 0) {
      return "";
  }

  // Compare allowed vs actual override site names
  if (overrideSiteNames.length !== allowedSiteNames.length ||
      overrideSiteNames.some(site => !allowedSiteNames.includes(site))) {
      errorMsg += `${getCount()} 'siteSpecific' should only contain overrides for the site name '${allowedSiteNames.join(",")}', but found overrides for: ${overrideSiteNames.join(", ")} in file '${filePath}'\n`;
  }

  return errorMsg;
}

// Validate directory structure and file contents.
function validateDirectory(dataFolderPath) {
  // Initialize an empty string to accumulate error messages.
  let errors = "";
  // Counter to number error messages.
  let count = 0;
  // Helper function that increments and returns the count.
  const getCount = () => ++count;
  
  // Load all schema files (global, home, property) as JavaScript objects.
  const schemas = loadSchemas();
  
  // Flatten the global schema into a key-value Map for easier lookup.
  const globalSchemaMap = getAllKeysAndValues(schemas.globalSchema);
  console.log('Global schema map:', globalSchemaMap);
  
  // Flatten the home schema into a key-value Map.
  const homeSchemaMap = getAllKeysAndValues(schemas.homeSchema);
  console.log('Home schema map:', homeSchemaMap);
  
  // Flatten the property schema into a key-value Map.
  const propertySchemaMap = getAllKeysAndValues(schemas.propertySchema);
  console.log('Property schema map:', propertySchemaMap);

  // Check if the provided data folder path exists.
  if (!fs.existsSync(dataFolderPath)) {
    errors += `${getCount()} Input data directory path provided does not exist\n`;
  } else {
    // Validate that the required Home directory exists inside the data folder.
    if (!fs.existsSync(path.join(dataFolderPath, LP_HOME_DIR))) {
      errors += `${getCount()} Home directory does not exist\n`;
    }
    // Validate that the required Global directory exists inside the data folder.
    if (!fs.existsSync(path.join(dataFolderPath, LP_GLOBAL_DIR))) {
      errors += `${getCount()} Global directory does not exist\n`;
    }
    
    // If the Global directory exists, validate its contents using the global schema.
    if (fs.existsSync(path.join(dataFolderPath, LP_GLOBAL_DIR))) {
      errors += validateSpecialDirectory(path.join(dataFolderPath, LP_GLOBAL_DIR), globalSchemaMap, "Global", getCount);
    }
    // If the Home directory exists, validate its contents using the home schema.
    if (fs.existsSync(path.join(dataFolderPath, LP_HOME_DIR))) {
      errors += validateSpecialDirectory(path.join(dataFolderPath, LP_HOME_DIR), homeSchemaMap, "Home", getCount);
    }
    
    // Iterate over all entries in the data folder to validate property directories.
    fs.readdirSync(dataFolderPath).forEach((propertyDir) => {
      // Skip directories that are not property folders (e.g., Global, Home, or hidden folders).
      if ([LP_GLOBAL_DIR, LP_HOME_DIR].includes(propertyDir) || propertyDir.startsWith(".")) return;
      
      // Construct the full path for the property directory.
      const propertyPath = path.join(dataFolderPath, propertyDir);
      
      // Ensure the current entry is a directory.
      if (!fs.lstatSync(propertyPath).isDirectory()) {
        errors += `${getCount()} '${propertyPath}' is not a directory\n`;
        return;
      }
      
      // Validate naming convention for property directories (must match regex pattern).
      if (!/^[0-9][0-9-]*[0-9]$/.test(propertyDir)) {
        errors += `${getCount()} '${propertyPath}' Invalid property name\n`;
      }
      
      // Check that the main YAML file exists within the property directory.
      const yamlFilePath = path.join(propertyPath, YAML_FILE_NAME);
      if (!fs.existsSync(yamlFilePath)) {
        errors += `${getCount()} '${yamlFilePath}' does not exist\n`;
      } else {
        // If the YAML file exists, validate additional files within the property directory.
        fs.readdirSync(propertyPath).forEach((subFile) => {
          // Construct the full path for the sub-file.
          const subFilePath = path.join(propertyPath, subFile);
          
          // If the sub-file is the photos folder:
          if (subFile === PHOTOS_FOLDER_NAME) {
            // Check that it is indeed a directory.
            if (!fs.lstatSync(subFilePath).isDirectory()) {
              errors += `${getCount()} '${subFilePath}' is not a directory\n`;
            } else {
              // Validate each file within the photos directory to ensure they are valid image files.
              fs.readdirSync(subFilePath).forEach((image) => {
                if (!/[.](jpg|JPG|JPEG|jpeg|png|PNG)$/.test(image)) {
                  errors += `${getCount()} '${path.join(subFilePath, image)}' is an invalid image file\n`;
                }
              });
            }
          } else if (subFile === YAML_FILE_NAME) {
            // For the YAML file in the property directory, get a flattened key-value map of its contents.
            const inputKeys = getKeyValueMapFromYAML(yamlFilePath);
            // Validate the YAML file's keys and values against the property schema.
            errors += validateFileAgainstSchema(inputKeys, propertySchemaMap, yamlFilePath, getCount);
          } else {
            // If the sub-file is neither the photos folder nor the YAML file, it's not allowed.
            errors += `${getCount()} '${subFile}' is not allowed in the directory '${propertyPath}'\n`;
          }
        });
      }
    });
  }
  
  // Return the accumulated error messages.
  return errors;
}


function validateSpecialDirectory(dirPath, schemaMap, dirType, getCount) {
  // Initialize an empty string to accumulate error messages.
  let errors = "";

  // Read all files/directories inside the specified directory.
  fs.readdirSync(dirPath).forEach((file) => {
    // Construct the full path to the current file.
    const filePath = path.join(dirPath, file);

    // Check if the current file is the YAML file.
    if (file === YAML_FILE_NAME) {
      // Get a flattened key-value map of the YAML file's contents.
      const inputKeys = getKeyValueMapFromYAML(filePath);
      console.log('Input keys:', inputKeys);

      // Validate the YAML file against the provided schema map.
      errors += validateFileAgainstSchema(inputKeys, schemaMap, filePath, getCount);
    } 
    // If the file is not the photos folder (PHOTOS_FOLDER_NAME),
    // then it is not allowed in this special directory.
    else if (file !== PHOTOS_FOLDER_NAME) {
      errors += `${getCount()} '${file}' is not allowed in the ${dirType} directory\n`;
    }
    // If file is the photos folder, it's allowed, so no error is added.
  });

  // Return any accumulated error messages.
  return errors;
}


function runValidation() {
  // Build the full path to the "data" folder based on the current working directory.
  const dataFolderPath = path.join(process.cwd(), "data");

  // Run the directory validation and collect any error messages returned as a string.
  const errors = validateDirectory(dataFolderPath);

  // If there are any errors from validation:
  if (errors) {
    // Log that errors were detected and will be logged to a file.
    console.log("Validation errors detected. Logging errors to file...");

    // Process the error string:
    // 1. Split the error messages by newline.
    // 2. Remove any empty lines.
    // 3. Map each error to an object with an ErrorNumber and ErrorMessage.
    const formattedErrors = errors
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((error, index) => ({
        ErrorNumber: index + 1, // Sequential error numbering
        ErrorMessage: error.trim(), // Trimmed error message
      }));

    // Write the formatted error objects to the specified error messages JSON file.
    fs.writeFileSync(
      ERROR_MESSAGES_FILE,
      JSON.stringify({ errors: formattedErrors }, null, 2)
    );
  } else {
    // If no errors were found, log a success message.
    console.log("Validation completed successfully. No errors detected.");
  }
}

module.exports = {
  runValidation,
  loadSchemas,
  validateDirectory,
  getKeyValueMapFromYAML,
  getAllKeysAndValues,
};
