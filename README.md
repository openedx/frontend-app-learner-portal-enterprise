# frontend-app-learner-portal-enterprise

## Overview
The edX learning platform's frontend for enterprise learners.

## Getting started

- Clone this repository locally with `git clone <repo URL>`

##### How to set up the dev environment
To run the project, first install dependencies

`$ npm i`

then, start the dev server:

`$ npm start`

### Where is it running?
The project itself will run on  `http://localhost:8734`

you can test your graphql queries with the playground, found here:  `http://localhost:8734/___graphql`

### How to run/serve a production build locally

```
npm run build   # Builds to dist folder
rm -rf public   # If you already have a public folder there
mv dist public  # Rename dist folder
npm run serve   # Run server. This command will automatically look at public/ directory
```

### Testing

Testing is supported with Jest and Enzyme. To run tests, use:

`npm test`

to use mock branding data, add `USE_MOCK_DATA` to the `.env.development` file

```
...
DESIGNER_BASE_URL='http://localhost:18808'
HOSTNAME='example.com'
UNBRANDED_LANDING_PAGE=''
USE_MOCK_DATA='true'

```

`.env` forces all variables to be strings, so in order to turn the mock data off again, set `USE_MOCK_DATA` to either an empty string, or delete the variable.

## Other useful commands

`$ npm clean`

This will remove the current gatsby cache and public folder. Can be useful if you run into plugin/dependency issues, or a graphql error that doesn't make sense.

`$ npm shell`

This can be used to get into the gatsby instance and see important information, such as the babel config, your static queries, the graphql schema, etc.
