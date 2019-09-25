/* eslint-disable no-console */
/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/node-apis/
 */
const { createPagesWithData } = require('@edx/gatsby-source-portal-designer/createPagesWithData');

const { templates } = require('./templates');

// **Note:** The graphql function call returns a Promise
// see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise for more info
exports.createPages = async ({ graphql, actions }) => graphql(`
  {
    allPage {
      nodes {
        id
        slug
        title
        type
        uuid
        hostname
        contact_email
        program_documents {
          header
          display
          documents {
            display_text
            document
            url
          }
        }
        external_program_website {
          header
          display
          description
          link {
            display_text
            url
          }
        }
        branding {
          cover_image
          banner_border_color
          texture_image
          organization_logo {
            url
            alt
          }
        }
      }
    }
  }  
  `)
  .then((result) => {
    if (result && result.data) {
      createPagesWithData(result, actions, templates);
    } else {
      console.error('GraphQL query for fetching page nodes returned no data.');
    }
  })
  .catch((error) => {
    console.error('An error occurred while fetching page nodes from GraphQL', error);
  });

exports.onCreateWebpackConfig = ({ actions, loaders, getConfig }) => {
  const config = getConfig();
  config.module.rules = [
    // Omit the default rule where test === '\.jsx?$'
    ...config.module.rules.filter(rule => String(rule.test) !== String(/\.jsx?$/)),
    // Recreate it with custom exclude filter
    {
      // Called without any arguments, `loaders.js` will return an
      // object like:
      // {
      //   options: undefined,
      //   loader: '/path/to/node_modules/gatsby/dist/utils/babel-loader.js',
      // }
      // Unless you're replacing Babel with a different transpiler, you probably
      // want this so that Gatsby will apply its required Babel
      // presets/plugins.  This will also merge in your configuration from
      // `babel.config.js`.
      ...loaders.js(),
      test: /\.jsx?$/,
      // Exclude all node_modules from transpilation, except for 'swiper' and 'dom7'
      exclude: modulePath =>
        /node_modules/.test(modulePath) &&
        !/node_modules\/(@edx\/frontend-learner-portal-base)/.test(modulePath),
    },
  ];
  // This will completely replace the webpack config with the modified object.
  actions.replaceWebpackConfig(config);
};
