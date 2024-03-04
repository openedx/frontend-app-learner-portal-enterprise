/**
 * Adds an extra option to the default HtmlWebpackPlugin configuration to make
 * the list of preconnect domains available while generating the index.html file.
 * That is, the HTML document will iterate over each preconnect domain and inject
 * `<link rel="preconnect">` tags into the generated HTML to preconnect to the
 * services used by the application to reduce the latency the requests.
 *
 * @param {Object} htmlWebpackPlugin
 *
 * @returns Modified instance of HtmlWebpackPlugin with preconnect domains added to
 * the options such that the precconnect domains are available to the generated HTML.
 */
function addPreconnectDomainsToHtmlWebpackPlugin(htmlWebpackPlugin) {
  const preconnectDomains = [
    // Base services
    process.env.LMS_BASE_URL,
    process.env.ECOMMERCE_BASE_URL,
    process.env.DISCOVERY_API_BASE_URL,
    // Enterprise services
    process.env.ENTERPRISE_CATALOG_API_BASE_URL,
    process.env.ENTERPRISE_ACCESS_BASE_URL,
    process.env.ENTERPRISE_SUBSIDY_BASE_URL,
    process.env.LICENSE_MANAGER_URL,
    // Miscellaneous services
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
  ];

  // Add Segment origins, if enabled.
  if (process.env.SEGMENT_KEY) {
    preconnectDomains.push('https://cdn.segment.com');
    preconnectDomains.push('https://api.segment.io');
  }

  // Add New Relic origins, if enabled.
  if (process.env.ENABLE_NEW_RELIC !== 'false') {
    preconnectDomains.push('https://js-agent.newrelic.com');
    preconnectDomains.push('https://bam.nr-data.net');
  }

  // Add Optimizely origin, if enabled.
  if (process.env.OPTIMIZELY_PROJECT_ID) {
    // in production, optimizely script is loaded from marketing site
    // domain, and subsequent requests are made to logx.optimizely.com.
    preconnectDomains.push(process.env.MARKETING_SITE_BASE_URL);
    preconnectDomains.push('https://logx.optimizely.com');
  }

  // Add HotJar origins, if enabled.
  if (process.env.HOTJAR_APP_ID) {
    preconnectDomains.push('https://static.hotjar.com');
    preconnectDomains.push('https://script.hotjar.com');
  }

  // Add cookie law origin, if enabled.
  if (process.env.COOKIE_LAW_CDN_URL) {
    preconnectDomains.push(process.env.COOKIE_LAW_CDN_URL);
  }

  // Add Algolia origin, if ALGOLIA_APP_ID is present.
  if (process.env.ALGOLIA_APP_ID) {
    preconnectDomains.push(`https://${process.env.ALGOLIA_APP_ID}-dsn.algolia.net`);
  }

  // Add preconnect domains to the HtmlWebpackPlugin configuration.
  htmlWebpackPlugin.userOptions.preconnect = preconnectDomains; // eslint-disable-line no-param-reassign

  // Return modified HtmlWebpackPlugin configuration.
  return htmlWebpackPlugin;
}

module.exports = addPreconnectDomainsToHtmlWebpackPlugin;
