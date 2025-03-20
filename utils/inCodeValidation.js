const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

// Constants & Global Variables
const LP_GLOBAL_DIR = "global";
const LP_HOME_DIR = "home";
const YAML_FILE_NAME = "data.yaml";
const PHOTOS_FOLDER_NAME = "images";
const SCHEMA_DIR = "schema";
const GLOBAL_SCHEMA_FILE = "global_schema.yaml";
const HOME_SCHEMA_FILE = "home_schema.yaml";
const PROPERTY_SCHEMA_FILE = "property_schema.yaml";
const ERROR_MESSAGES_FILE = path.join("messages", "errorMessage.json");

// Orchestrator Function
function runValidation() {
  const dataFolderPath = path.join(process.cwd(), "data");
  const errors = validateDirectory(dataFolderPath);
  if (errors) {
    console.log("Validation errors detected. Logging errors to file...");
    const formattedErrors = errors
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
    console.log("Validation completed successfully. No errors detected.");
  }
}

/**
 * Validates the entire directory structure and its YAML files.
 */
function validateDirectory(dataFolderPath) {
  let errors = "";
  let count = 0;
  const getCount = () => ++count;
  const schemas = loadSchemas();

  const globalSchemaMap = getAllKeysAndValues(schemas.globalSchema);
  const homeSchemaMap = getAllKeysAndValues(schemas.homeSchema);
  const propertySchemaMap = getAllKeysAndValues(schemas.propertySchema);

  // Load allowed global sections from the global data file.
  const globalSections = fs.existsSync(path.join(dataFolderPath, LP_GLOBAL_DIR))
    ? loadGlobalRootSections(dataFolderPath)
    : [];
  console.log("Global Sections:", globalSections);

  if (!fs.existsSync(dataFolderPath)) {
    errors += `${getCount()} Input data directory path provided does not exists \nSolution: Provide right input data directory path\n\n`;
  } else {
    // Validate required Home and Global directories
    if (!fs.existsSync(path.join(dataFolderPath, LP_HOME_DIR))) {
      errors += `${getCount()} Home directory does not exists \nSolution: Input data directory should contain 'home' directory\n\n`;
    }
    if (!fs.existsSync(path.join(dataFolderPath, LP_GLOBAL_DIR))) {
      errors += `${getCount()} Global directory does not exists \nSolution: Input data directory should contain 'global' directory\n\n`;
    }
    
    // Validate Global directory.
    if (fs.existsSync(path.join(dataFolderPath, LP_GLOBAL_DIR))) {
      errors += validateSpecialDirectory(path.join(dataFolderPath, LP_GLOBAL_DIR), globalSchemaMap, "Global", getCount);
    }
    // Validate Home directory, passing in global sections.
    if (fs.existsSync(path.join(dataFolderPath, LP_HOME_DIR))) {
      errors += validateSpecialDirectory(path.join(dataFolderPath, LP_HOME_DIR), homeSchemaMap, "Home", getCount, globalSections);
    }
    
    // Validate property directories (all directories that are not Global or Home)
    fs.readdirSync(dataFolderPath).forEach((propertyDir) => {
      if ([LP_GLOBAL_DIR, LP_HOME_DIR].includes(propertyDir) || propertyDir.startsWith(".")) return;
      const propertyPath = path.join(dataFolderPath, propertyDir);
      if (!fs.lstatSync(propertyPath).isDirectory()) {
        errors += `${getCount()} '${propertyPath}' is not a directory\n`;
        return;
      }
      
      // Check naming convention for property directories.
      if (!/^[0-9][0-9-]*[0-9]$/.test(propertyDir)) {
        errors += `${getCount()} '${propertyPath}' Invalid property name\n`;
      }
      
      // Validate the main YAML file exists.
      const yamlFilePath = path.join(propertyPath, YAML_FILE_NAME);
      if (!fs.existsSync(yamlFilePath)) {
        errors += `${getCount()} '${yamlFilePath}' does not exist\n`;
      } else {
        // Validate each file within the property directory.
        fs.readdirSync(propertyPath).forEach((subFile) => {
          const subFilePath = path.join(propertyPath, subFile);
          if (subFile === PHOTOS_FOLDER_NAME) {
            if (!fs.lstatSync(subFilePath).isDirectory()) {
              errors += `${getCount()} '${subFilePath}' is not a directory\n`;
            } else {
              // Validate image files in the photos directory.
              fs.readdirSync(subFilePath).forEach((image) => {
                if (!/[.](jpg|JPG|JPEG|jpeg|png|PNG)$/.test(image)) {
                  errors += `${getCount()} '${propertyPath}/${subFile}/${image}' is an invalid image file \nSolution: Allowed image formats are JPG and PNG\n\n`;
                }
              });
            }
          } else if (subFile === YAML_FILE_NAME) {
            const inputKeys = getKeyValueMapFromYAML(yamlFilePath);
            errors += validateFileAgainstSchema(inputKeys, propertySchemaMap, yamlFilePath, getCount);
            const fileContent = fs.readFileSync(yamlFilePath, "utf8");
            const yamlData = fileContent ? yaml.load(fileContent) : {};
            errors += validateSectionsOrder(yamlData, yamlFilePath, getCount, globalSections);
          } else {
            errors += `${getCount()} '${subFile}' is not allowed in the directory '${propertyPath}'\n`;
          }
        });
      }
    });
  }
  return errors;
}

/**
 * Validates YAML files in a special directory (e.g., Global or Home).
 */
function validateSpecialDirectory(dirPath, schemaMap, dirType, getCount, globalSections = []) {
  let errors = "";
  fs.readdirSync(dirPath).forEach((file) => {
    const filePath = path.join(dirPath, file);
    if (file === YAML_FILE_NAME) {
      const inputKeys = getKeyValueMapFromYAML(filePath);
      errors += validateFileAgainstSchema(inputKeys, schemaMap, filePath, getCount);
      const fileContent = fs.readFileSync(filePath, "utf8");
      const yamlData = fileContent ? yaml.load(fileContent) : {};
      // const allowedGlobal = dirPath.includes(LP_GLOBAL_DIR) ? [] : globalSections;
      errors += validateSectionsOrder(yamlData, filePath, getCount, globalSections);
    } else if (file !== PHOTOS_FOLDER_NAME) {
      errors += `${getCount()} '${file}' is not allowed in the ${dirType} directory\n`;
    }
  });
  return errors;
}

/**
 * Validates file keys and values against a provided schema.
 */
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

/**
 * Validates that the YAML data contains a valid order for sections.
 */
function validateSectionsOrder(yamlData, filePath, getCount, globalSections = []) {
  let errors = "";
  const sectionsOrderKeys = ["propertyPageSectionsOrder", "homePageSectionsOrder"];
  let allowedSections = new Set(Object.keys(yamlData));
  if (globalSections.length > 0) {
    globalSections.forEach(section => allowedSections.add(section));
  }
  console.log("Allowed Sections:", allowedSections);
  sectionsOrderKeys.forEach(orderKey => {
    if (yamlData[orderKey] !== undefined) {
      const orderValue = yamlData[orderKey];
      if (!Array.isArray(orderValue)) {
        errors += `${getCount()} '${orderKey}' in file '${filePath}' should be an array\n`;
      } else {
        orderValue.forEach(item => {
          if (!allowedSections.has(item)) {
            errors += `'${item}' in '${orderKey}' is not a valid section in file '${filePath}'\n`;
          }
        });
      }
    }
  });
  return errors;
}

/**
 * Validates the site-specific overrides in the YAML data.
 */
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

// Helper Functions
/**
 * Loads all schema files.
 */
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

/**
 * Loads a single YAML schema file.
 */
function loadYAMLSchema(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  return fileContent ? yaml.load(fileContent) : {};
}

/**
 * Loads allowed global sections from the global data file.
 */
function loadGlobalRootSections(dataFolderPath) {
  const globalDataPath = path.join(dataFolderPath, LP_GLOBAL_DIR, YAML_FILE_NAME);
  if (fs.existsSync(globalDataPath)) {
    const fileContent = fs.readFileSync(globalDataPath, "utf8");
    const globalData = fileContent ? yaml.load(fileContent) : {};
    return Object.keys(globalData);
  }
  return [];
}

/**
 * Recursively collects all keys and values from an input object.
 */
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

/**
 * Loads a YAML file and returns a flattened key-value map.
 */
function getKeyValueMapFromYAML(filePath) {
  const fileContent = fs.readFileSync(filePath, "utf8");
  if (!fileContent) return new Map();
  const data = yaml.load(fileContent);
  return getAllKeysAndValues(data);
}

/**
 * Retrieves a nested schema definition using a key path.
 */
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

module.exports = {
  runValidation,
  loadSchemas,
  validateDirectory,
  getKeyValueMapFromYAML,
  getAllKeysAndValues,
};
