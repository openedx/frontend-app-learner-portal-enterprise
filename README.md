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
The project itself will run on http://localhost:8734

### Setup prerequisites for full development

To setup test data, and other backend, please follow these steps, you will setup a `test-enterprise` customer who will have learners associated with it:

 - Start backend services needed (refer to .env.development file). Refer to [Devstack Doc](https://github.com/edx/devstack) for details
 - Seed test data. Refer to [The Enterprise management commands](https://github.com/edx/edx-enterprise/blob/master/enterprise/management/commands/seed_enterprise_devstack_data.py#L47). Usually this means running something like `./manage.py lms seed_enterprise_devstack_data`, but refer to the link for latest info
 - Ensure the Enterprise Integration flag is enabled in devstack [see this link](https://github.com/edx/edx-platform/blob/master/lms/envs/devstack.py#L326)
 - Restart any services such as `make lms-restart` for applying changes
 - Pick a user such as enterprise_learner_1 to use as learner account (password is the same as the test edx account documented on devstack)
 - Go to http://localhost:18000/account/settings and login as this user, use a separate or incognitor window if you are already signed as another user on the site. 
 - Set Full Name field. Apparently this setting is required, since the seed_enterprise_devstack_data does not setup full name right now.
 - Go to http://localhost:8734/test-enterprise/ to browse the applicatoin for the `test-enterprise` customer

### Testing

Testing is supported with Jest and Enzyme. To run tests, use:

`npm test`
