const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

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
  const homeSchema = loadYAMLSchema(path.join(SCHEMA_DIR, HOME_SCHEMA_FILE));
  const propertySchema = loadYAMLSchema(path.join(SCHEMA_DIR, PROPERTY_SCHEMA_FILE));
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

function getAllKeysAndValues(inputData, keys = new Map(), ref = "") {
  if (inputData === undefined || inputData === null) return keys;
  if (Array.isArray(inputData)) {
    keys.set(ref, inputData);
    return keys;
  }
  if (typeof inputData !== "object") {
    keys.set(ref, inputData);
    return keys;
  }
  Object.keys(inputData).forEach((key) => {
    const newKey = ref ? `${ref}.${key}` : key;
    keys.set(newKey, inputData[key]);
    if (inputData[key] && typeof inputData[key] === "object" && !Array.isArray(inputData[key])) {
      getAllKeysAndValues(inputData[key], keys, newKey);
    }
  });
  return keys;
}

function getKeyValueMapFromYAML(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  if (!fileContent) return new Map();
  const data = yaml.load(fileContent);
  return getAllKeysAndValues(data);
}


function validateFileAgainstSchema(inputKeys, schemaMap, filePath, getCount) {
  let errors = "";
  const siteOverridesErrors = validateSiteOverrides(inputKeys, filePath, getCount);
  if (siteOverridesErrors) {
    errors += siteOverridesErrors;
  }
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
  const parts = keyPath.split(".");
  let current = schema;
  for (let part of parts) {
    if (current && typeof current === "object" && current[part]) {
      current = current[part];
    } else {
      return undefined;
    }
  }
  return current;
}

function validateSiteOverrides(inputKeys, filePath, getCount) {
  let errorMsg = "";
  const allowedSiteNames = inputKeys.get("siteName").map(s => s.trim());
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
  if (overrideSiteNames.length !== allowedSiteNames.length ||
      overrideSiteNames.some(site => !allowedSiteNames.includes(site))) {
      errorMsg += `${getCount()} 'siteSpecific' should only contain overrides for the site name '${allowedSiteNames.join(",")}', but found overrides for: ${overrideSiteNames.join(", ")} in file '${filePath}'\n`;
  }
  return errorMsg;
}

function validateDirectory(dataFolderPath) {

  let errors = "";
  let count = 0;
  const getCount = () => ++count;
  const schemas = loadSchemas();

  const globalSchemaMap = getAllKeysAndValues(schemas.globalSchema);
  console.log('Global schema map:', globalSchemaMap);
  const homeSchemaMap = getAllKeysAndValues(schemas.homeSchema);
  console.log('Home schema map:', homeSchemaMap);
  const propertySchemaMap = getAllKeysAndValues(schemas.propertySchema);
  console.log('Property schema map:', propertySchemaMap);
  
  if (!fs.existsSync(dataFolderPath)) {
    errors += `${getCount()} Input data directory path provided does not exists \nSolution: Provide right input data directory path\n\n`;
  } else {
    // Validate that the required Home directory exists inside the data folder.
    if (!fs.existsSync(path.join(dataFolderPath, LP_HOME_DIR))) {
      errors += `${getCount()} Home directory does not exists \nSolution: Input data directory should contain 'home' directory\n\n`;
    }
    // Validate that the required Global directory exists inside the data folder.
    if (!fs.existsSync(path.join(dataFolderPath, LP_GLOBAL_DIR))) {
      errors += `${getCount()} Global directory does not exists \nSolution: Input data directory should contain 'global' directory\n\n`;
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
                  errors += `${getCount()} '${inputDir}/${propertyDir}/${subFile}/${image}' is an invalid image file \nSolution: Allowed image formats are JPG and PNG\n\n`;
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
  let errors = "";
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (file === YAML_FILE_NAME) {
      const inputKeys = getKeyValueMapFromYAML(filePath);
      console.log('Input keys:', inputKeys);
      errors += validateFileAgainstSchema(inputKeys, schemaMap, filePath, getCount);
    } 
    else if (file !== PHOTOS_FOLDER_NAME) {
      errors += `${getCount()} '${file}' is not allowed in the ${dirType} directory\n`;
    }
  });
  return errors;
}


function runValidation() {
  const dataFolderPath = path.join(process.cwd(), "data");
  const errors = validateDirectory(dataFolderPath);
  if (errors) {
    console.log("Validation errors detected. Logging errors to file...");
    const formattedErrors = errors
      .split("\n")
      .filter((line) => line.trim() !== "")
      .map((error, index) => ({
        ErrorNumber: index + 1, // Sequential error numbering
        ErrorMessage: error.trim(), // Trimmed error message
      }));
    fs.writeFileSync(
      ERROR_MESSAGES_FILE,
      JSON.stringify({ errors: formattedErrors }, null, 2)
    );
  } else {
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
