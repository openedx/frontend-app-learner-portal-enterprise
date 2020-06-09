# frontend-app-learner-portal-enterprise

## Overview
The edX learning platform's frontend for enterprise learners.

## Setup for development

Install nodejs (using nvm maybe a good idea to be able to switch node versions and because there is an .nvmrc file that will be usable by nvm)

To run the project, first install dependencies

`$ nvm use` # will install/setup node needed for this project
`$ npm i`   # will install deps

then, start the dev server:

`$ npm start`

Visit http://localhost:8734

At this point, it will ask you to login. Use the user indicated in devstack (edx@example.com, edx). When logged in, expect to see a 404 since we are not setup

Now quickly check the .env.development file for which services are used by the application. e.g. `LMS_BASE_URL='http://localhost:18000'` . We will get back to this.


## Setup enterprise stack

An enterprise portal will need a couple of roles: The Enterprise customer, and at least one learner account.
We also need the edx-enterprise Django module to be running inside of the LMS (which is started by devstack). Refer to [Devstack Doc](https://github.com/edx/devstack) for details. This is what serves endpoints used by the application.

* Setup devstack if not already and at least have the `lms` service running. Typically `make dev.up` or `make dev.nfs.up` will do it
* Ensure you can browser to LMS at least, http://localhost:18000

* Sync edx-enterprise into the src/ folder of your work folder (e.g. ~/work/src/edx-enterprise).
* Ensure this env var is set in your env for the docker mount to be located correctly, e.g.,: `DEVSTACK_WORKSPACE=/Users/$USER/work` , in your shell config file
* Either start new shell or run `exec "$SHELL"` for changes to take effect in the shell
* Start backend services needed (refer to .env.development file). Refer to [Devstack Doc](https://github.com/edx/devstack) for details
* Now in your devstack folder run
  ```
  $ make lms-shell
  $ pip install -e /edx/src/edx-enterprise to uninstall the published edx-enterprise package and instead install your local copy from src.
  ```
If all worked you should be able to navigate to http://localhost:18000/admin/enterprise/

But wait, it wont' work yet. As long as you get some reasonable response here, you are good (probably a login page)


## Setup test users and data

Next setup a `test-enterprise` customer who will have learners associated with it (Details at [The Enterprise management commands](https://github.com/edx/edx-enterprise/blob/master/enterprise/management/commands/seed_enterprise_devstack_data.py#L47)):

 - Seed test data:
   - Go into the lms shell:
   ```$ cd <devstack_dir>
      $ make lms-shell
      $ ./manage.py lms seed_enterprise_devstack_data
   ```
 - Ensure the Enterprise Integration flag is enabled in devstack [see this link](https://github.com/edx/edx-platform/blob/master/lms/envs/devstack.py#L326). Set the flag `ENABLE_ENTERPRISE_INTEGRATION` to True
 - From the devstack directory, restart lms using `make lms-restart` for applying changes
 - Now go to http://localhost:18000/admin/enterprise/ and login as edx/edx
 - If you can see an `Enterprise` section in the admin page you are all set so far, otherwise stop and ask someone!


 [WIP not done yet!]
 - Pick a user such as enterprise_learner_1 to use as learner account (password is the same as the test edx account documented on devstack)
 - Go to http://localhost:8734/test-enterprise/ to browse the application for the `test-enterprise` customer


### Presubmission

Always run `npm run lint` before submission. We may want a precommit hook at some point. To fix lint issues, run `npm run lint -- --fix`

### Testing

Testing is supported with Jest and Enzyme. To run tests, use:

`npm test`

### Required reading

* React 
* [Devstack Doc](https://github.com/edx/devstack)
* [Enterprise docs](https://openedx.atlassian.net/wiki/spaces/SOL/pages/997654609/Hitchhiker+s+Engineer+s+Guide+to+the+Enterprise+Ecosystem)
