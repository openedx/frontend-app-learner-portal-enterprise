const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
// eslint-disable-next-line import/no-extraneous-dependencies
const glob = require('glob');
// eslint-disable-next-line import/no-extraneous-dependencies
const yaml = require('js-yaml');

// Paths
const SCHEMA_DIR = path.resolve(__dirname, '../openapi-schemas');
const OUTPUT_DIR = path.resolve(__dirname, '../');

function getServiceNameFromSchema(schemaFilePath) {
  const schema = yaml.load(fs.readFileSync(schemaFilePath, 'utf8'));
  if (schema.info?.title) {
    return schema.info.title
      .replace(/\s*API$/, '') // Remove " API" suffix
      .toLowerCase()
      .replace(/\s+/g, '-');
  }
  throw new Error(`Service name not found in schema: ${schemaFilePath}`);
}

function generateTypesFromSchema(schemaFilePath) {
  const serviceName = getServiceNameFromSchema(schemaFilePath);
  const outputFilePath = path.join(OUTPUT_DIR, `${serviceName}.openapi.d.ts`);
  // Generate TypeScript types using openapi-typescript directly on YAML input
  execSync(`npx openapi-typescript ${schemaFilePath} --output ${outputFilePath}`, { stdio: 'inherit' });
}

// Function to process all OpenAPI schemas
function processAllSchemas() {
  // Get all .yaml files in the openapi-schemas directory
  const schemaFiles = glob.sync(`${SCHEMA_DIR}/*.yaml`);

  if (schemaFiles.length === 0) {
    console.log('No OpenAPI schemas found to process.');
    return;
  }

  // Process each schema file
  schemaFiles.forEach(generateTypesFromSchema);
}

// Run the process
processAllSchemas();
