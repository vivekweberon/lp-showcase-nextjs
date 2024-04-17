const fs = require("fs");
const yaml = require("js-yaml");

// Load the schema from the schema file
const SCHEMA_FILE = "schema/global_schema.yaml";
const schema = yaml.load(fs.readFileSync(SCHEMA_FILE, "utf8"));

// Load the input data from the global data file
const DATA_FILE = "global/data.yaml";
const inputData = yaml.load(fs.readFileSync(DATA_FILE, "utf8"));

// Validate the input data against the schema
const validationResult = validateAgainstSchema(inputData, schema);
if (validationResult.valid) {
  console.log("Input data is valid!");
} else {
  console.error("Input data validation failed:");
  console.error(validationResult.errors.join("\n"));
}

// Function to validate input data against the schema
function validateAgainstSchema(data, schema) {
  const errors = [];

  // Validate each property in the data against the schema
  for (const key in schema) {
    if (schema.hasOwnProperty(key)) {
      const schemaType = schema[key].type;
      const dataType = typeof data[key];

      // Check if the property exists in the data
      if (data[key] === undefined) {
        errors.push(`Property '${key}' is missing`);
      } else {
        // Check if the property type matches the schema type
        if (schemaType !== dataType) {
          errors.push(
            `Type mismatch for property '${key}': Expected '${schemaType}', found '${dataType}'`
          );
        }
      }
    }
  }

  // Check if any additional properties are present in the data
  for (const key in data) {
    if (data.hasOwnProperty(key) && !schema.hasOwnProperty(key)) {
      errors.push(`Unexpected property '${key}' found in data`);
    }
  }

  return {
    valid: errors.length === 0,
    errors: errors,
  };
}
