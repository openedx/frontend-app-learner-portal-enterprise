const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
// eslint-disable-next-line import/no-extraneous-dependencies
const yaml = require('js-yaml');
// eslint-disable-next-line import/no-extraneous-dependencies
const axios = require('axios');

const SCHEMA_DIR = path.resolve(__dirname, '../openapi-schemas');
const OUTPUT_DIR = path.resolve(__dirname, '../');

// Define Open API schema URLs
const OPENAPI_SCHEMA_URLS = {
  'enterprise-access': 'http://enterprise-access.edx.org/api/schema/',
  'enterprise-subsidy': 'http://enterprise-subsidy.edx.org/api/schema/',
};

/**
 * Downloads OpenAPI schemas from configured services.
 */
async function downloadOpenApiSchemas() {
  const downloadTasks = Object.entries(OPENAPI_SCHEMA_URLS).map(async ([serviceName, url]) => {
    try {
      console.log(`Downloading schema for ${serviceName} from ${url}`);
      const response = await axios.get(url);
      const filePath = path.join(SCHEMA_DIR, `${serviceName}.yaml`);
      const newContent = yaml.dump(response.data);
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Schema updated: ${filePath}`);
    } catch (err) {
      console.error(`Failed to download schema for ${serviceName}: ${err.message}`);
    }
  });

  await Promise.all(downloadTasks);
}

function generateTypesFromSchema(serviceName) {
  const schemaFilePath = path.join(SCHEMA_DIR, `${serviceName}.yaml`);
  const outputFilePath = path.join(OUTPUT_DIR, `${serviceName}.openapi.d.ts`);

  if (!fs.existsSync(schemaFilePath)) {
    console.warn(`⚠️ Schema file not found for ${serviceName}, skipping type generation.`);
    return;
  }

  execSync(`npx openapi-typescript ${schemaFilePath} --output ${outputFilePath}`, { stdio: 'inherit' });
}

function processOpenApiSchemas() {
  Object.keys(OPENAPI_SCHEMA_URLS).forEach(generateTypesFromSchema);
}

(async () => {
  await downloadOpenApiSchemas();
  processOpenApiSchemas();
})();
