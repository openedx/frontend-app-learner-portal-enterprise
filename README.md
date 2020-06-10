# frontend-app-learner-portal-enterprise

## Overview
The edX learning platform's frontend for enterprise learners.

## Setup for development

Ensure you have gone through [Onboarding for devs](https://openedx.atlassian.net/wiki/spaces/ENG/pages/12550298/Developer+Onboarding)

Clone this repo: `git clone <repo_url>`

Install nodejs (using nvm maybe a good idea to be able to switch node versions and because there is an .nvmrc file that will be usable by nvm)

To run the project, first install dependencies

`$ nvm use` # will install/setup node needed for this project. Install the specified version (nvm Will help you do that)
`$ npm i`   # will install deps

then, start the dev server:

`$ npm start`

Visit http://localhost:8734

At this point, it will ask you to login. Use the user indicated in devstack (edx@example.com, edx). When logged in, expect to see a 404 since we are not setup

Our goal is to setup a enterprise customer, obtains its slug, then visit it such as http://localhostL8734/{enterprise_slug}

Now quickly check the .env.development file for which services are used by the application. e.g. `LMS_BASE_URL='http://localhost:18000'` . We will get back to this.


## Setup test users and data

An enterprise portal will need a couple of roles: The Enterprise customer, and at least one learner account.

Next we will setup a `test-enterprise` customer who will have learners associated with it (Details at [The Enterprise management commands](https://github.com/edx/edx-enterprise/blob/master/enterprise/management/commands/seed_enterprise_devstack_data.py#L47)):

 - Ensure the Enterprise Integration flag is enabled in devstack [see this link](https://github.com/edx/edx-platform/blob/master/lms/envs/devstack.py#L326). Set the flag `ENABLE_ENTERPRISE_INTEGRATION` to True
 - From the devstack directory, restart lms using `make lms-restart` for applying changes
 - Seed test data:
   - Go into the lms shell:
   ```$ cd <devstack_dir>
      $ make lms-shell
      $ ./manage.py lms seed_enterprise_devstack_data
   ```
 - Go to http://localhost:18000/admin/enterprise/ and login as edx/edx
 - If you can see an `Enterprise` section in the admin page you are all set so far, otherwise stop and ask someone!
 - Next, ensure the Learner portal is enable for this Enterprise user:
    - Visit http://localhost:18000/admin/enterprise/enterprisecustomer/ 
    - Click on 'Test-enterprise' customer
    - Check the box `Enable Learner Portal` and hit `Save` 



## Use learner portal with the edx-enterprise stack

[ WIP TODO ]
* logging in as enterprise admin:
* logging in as learner:

## Setup enterprise stack for local changes

We have edx-enterprise Django module running inside of the LMS (which is started by devstack). Refer to [Devstack Doc](https://github.com/edx/devstack) for details. This is what serves endpoints used by the application. To make changes, you will replace that available install of edx-enterprise with your local version

* Setup devstack if not already and at least have the `lms` service running. Typically cd'ing to the devstack folder, and running `make dev.up` or `make dev.nfs.up` will do it
* Ensure you can browse to LMS at least, http://localhost:18000

* Sync edx-enterprise into the src/ folder of your work folder (e.g. ~/work/src/edx-enterprise).
* Ensure this env var is set in your env for the docker mount to be located correctly, e.g.,: `DEVSTACK_WORKSPACE=/Users/$USER/work` , in your shell config file
* Either start new shell or run `exec "$SHELL"` for changes to take effect in the shell
* Start backend services needed (refer to .env.development file). Refer to [Devstack Doc](https://github.com/edx/devstack) for details

If all worked you should be able to navigate to http://localhost:18000/admin/enterprise/
But wait, it wont' work yet. As long as you get some reasonable response here, you are good (probably a login page)


#### Making changes to edx-enterprise stack locally

Make any changes in edx-enterprise stack then

* In your devstack folder run
  ```
  $ make lms-shell
  $ pip install -e /edx/src/edx-enterprise to uninstall the published edx-enterprise package and instead install your local copy from src.
  $ exit # back to regular shell
  ```

* Now any changes you make to edx-enterprise should show up when you invoke the endpoints such as http://localhost:18000/enterprise_learner_portal/api/v1/enterprise_course_enrollments/ should reflect your changes
* If you do not see your changes, restart lms and wait some time:
  ```
  $ make lms-restart
  ```

### Presubmission

Always run `npm run lint` before submission. We may want a precommit hook at some point. To fix lint issues, run `npm run lint -- --fix`

### Testing

Testing is supported with Jest and Enzyme. To run tests, use:

`npm test`

TODO: More content

### Required reading

* edX
  * [Onboarding for devs](https://openedx.atlassian.net/wiki/spaces/ENG/pages/12550298/Developer+Onboarding)
  * [Devstack Doc](https://github.com/edx/devstack)
  * [Enterprise docs](https://openedx.atlassian.net/wiki/spaces/SOL/pages/997654609/Hitchhiker+s+Engineer+s+Guide+to+the+Enterprise+Ecosystem)
  * 
* External
  * [ReactJS](https://reactjs.org/)
