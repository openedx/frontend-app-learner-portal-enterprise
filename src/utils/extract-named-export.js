/**
 * Dynamically imports a module and extracts a named export from it.
 * @param {Promise} importPromise - A promise that resolves to the module.
 * @param {string} namedExport -- The name of the export to extract
 * @returns {Promise<any>} A promise that resolves to the named export.
 */
export default function extractNamedExport(importPromise, namedExport) {
  return importPromise.then((module) => ({ default: module[namedExport] }));
}
