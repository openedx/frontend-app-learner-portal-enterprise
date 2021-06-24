# frontend-app-learner-portal-enterprise

![Build Status](https://github.com/edx/frontend-app-learner-portal-enterprise/actions/workflows/ci.yml/badge.svg)
![Coveralls](https://img.shields.io/coveralls/edx/frontend-app-learner-portal-enterprise.svg?branch=master)

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

At this point, it will ask you to login. Use the user indicated in devstack (edx@example.com, edx). When logged in, expect to see a 404 since we are not setup.

Our goal is to setup a enterprise customer, obtains its slug, then visit it such as http://localhostL8734/{enterprise_slug}

Now quickly check the .env.development file for which services are used by the application. e.g. `LMS_BASE_URL='http://localhost:18000'` . We will get back to this.


## Setup test users and data

An enterprise portal will need a couple of roles: The Enterprise customer, and at least one learner account.

Next we will setup a `test-enterprise` customer who will have learners associated with it (Details at [The Enterprise management commands](https://github.com/edx/edx-enterprise/blob/master/enterprise/management/commands/seed_enterprise_devstack_data.py#L47)):

 - Ensure the Enterprise Integration flag is enabled in devstack [see this link](https://github.com/edx/edx-platform/blob/0e2b612c1fb4f3e385f3004801aa5b5ed0221eda/lms/envs/devstack.py#L331). Set the flag `ENABLE_ENTERPRISE_INTEGRATION` to True if it isn't already
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


## Get familiar with learner and customer accounts

In this section you will:
 * Locate the enterprise customer test-enterprise in the Django admin page for enterprise
 * Learn how to navigate to the admin portal for that customer and view learner accounts setup during previous steps

* Visit http://localhost:18000/admin/enterprise/ : the Django admin portal for enterprise
* Login as edx/edx
* Visit the `Enterprise Customers` link, it should be http://localhost:18000/admin/enterprise/enterprisecustomer/
    * Locate the `slug` for the customer named 'Test enterprise'
    * This is probably `test-enterprise`
    * The `slug` is used as a url path to visit the enterprise portal for this customer, more on that later
* Now click on the `Test Enterprise` user link
* Click on `Manage learners` to view learner accounts
* This page should list at least one learner account like test-enterprise_learner_1@example.com (username), password is the same as `edx` user



## Use learner portal with the edx-enterprise stack

* Log out of any users if you logged in previously, or use a new incognito window, and browse to http://localhost:8734/test-enterprise
* The `test-enterprise`, you will note, is the slug for this enterprise customer
* Login as a learner, using `test-enterprise_learner_1@example.com` account, you may need to re-browse to page http://localhost:8734/test-enterprise/
* You can now go to 'Find a Course' and enroll in courses

You are now in the Learner portal for the enterpriser customer `Test Enterprise`, as a learner!

## Next up: enroll one or more learners into your own course!

It is very useful to create multiple courses and enroll the learners into them for testing

For this, an easy way is to use the Studio! Usually at http://localhost:18010

* Once there, create a course using the Create Course button
* Once course is created, click 'View Live' to see the course
* Grab the course id from the url which will be similar to: http://localhost:18010/course/course-v1:testinguniversity+cs111111+summer2020
  * In this case the course id is `course-v1:testinguniversity+cs111111+summer2020`
* Now use the `Manage learners` page described in an earlier section, to enroll one or more learners into this course! See [get-familiar-with-learner-and-customer-accounts](#get-familiar-with-learner-and-customer-accounts) for how to do this.

## Setup enterprise stack for local changes

You need this, if you need to make changes to the API endpoints or anything else in edx-enterprise project

We have edx-enterprise Django module running inside of the LMS (which is started by devstack). Refer to [Devstack Doc](https://github.com/edx/devstack) for details. This is what serves endpoints used by the application. To make changes, you will replace that available install of edx-enterprise with your local version

* Setup devstack if not already and at least have the `lms` service running. Typically cd'ing to the devstack folder, and running `make dev.up` or `make dev.nfs.up` will do it
* Ensure you can browse to LMS at least, http://localhost:18000

* Sync edx-enterprise into the src/ folder of your work folder (e.g. ~/work/src/edx-enterprise)
* Ensure this env var is set in your env for the docker mount to be located correctly, e.g.,: `DEVSTACK_WORKSPACE=/Users/$USER/work` , in your shell config file
* Either start new shell or run `exec "$SHELL"` for changes to take effect in the shell
* Start backend services needed (refer to .env.development file). Refer to [Devstack Doc](https://github.com/edx/devstack) for details

If all worked you should be able to navigate to http://localhost:18000/admin/enterprise/
But wait, it won't work yet. As long as you get some reasonable response here, you are good (probably a login page).


#### Making changes to edx-enterprise stack locally

Make any changes in edx-enterprise stack then

* In your devstack folder run
  ```
  $ make lms-shell
  $ pip install -e /edx/src/edx-enterprise
  $ exit # back to regular shell
  ```
  This will uninstall the published edx-enterprise package and instead install your local copy from src.

* Now any changes you make to edx-enterprise should reflect your changes
* If you do not see your changes, restart lms and wait some time:
  ```
  $ make lms-restart
  ```

### Presubmission

Always run `npm run lint` before submission. We may want a precommit hook at some point. To fix lint issues, run `npm run lint -- --fix`

### Testing

Testing is supported with Jest and Enzyme. To run tests, use:

`npm test`

### Debugging

#### With built-in VSCode embedded debugger

This is nice if you want to use VScode built in debugger and also make changes and reload and try again.

In VSCode, click on the Debug button to the left toolbar

Go to add configuratoin and select type 'chrome'

VScode will generate a file in .vscode/launch.json that looks like this, edit it as shown to your desired url

```
{
    // Use IntelliSense to learn about possible attributes.
    // Hover to view descriptions of existing attributes.
    // For more information, visit: https://go.microsoft.com/fwlink/?linkid=830387
    "version": "0.2.0",
    "configurations": [
        {
            "type": "pwa-chrome",
            "request": "launch",
            "name": "Launch Chrome against localhost",
            "url": "http://localhost:8734/test-enterprise",
            "webRoot": "${workspaceFolder}"
        }
    ]
}
```

Save this file. It is already gitignore so no worries about accidental checkin.


Now you can just hit the run button that says 'Launch Chrome ...' and you can now put breakpoints in your code and get embedded VSCode debugging! 

You can create more configs later if you want more than one url (such as different enterprise slug) to test with.


#### With chrome

Just fire up chrome devtools as usual and put breakpoints! You can also edit directly from chrome devtools by enabling local folder support.

in brief:

npm run debug-test 

Then chrome://inspect in chrome along with debugger in the code to trigger a breakpoint?

### Routes

This micro-frontend application consists of the following URL routes:

| Route                                                                  | Description                                                                                                                                                                                                                                                                                             |
|------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| http://localhost:8734/                                                 | The main entry point for the Enterprise Learner Portal. Detects which enterprise(s) you're linked to and redirects you to the appropriate dashboard page for a specific enterprise.                                                                                                                     |
| http://localhost:8734/:enterpriseSlug                                  | The dashboard page for a specific enterprise customer. Displays all course enrollments for a learner associated with that enterprise.                                                                                                                                                                   |
| http://localhost:8734/:enterpriseSlug/search                           | The search page for a specific enterprise customer. Shows all enrollable courses associated with that enterprise's content catalogs. Utilizes Algolia as a hosted search provider.                                                                                                                      |
| http://localhost:8734/:enterpriseSlug/course/:courseKey                | The course page with information about the course and provides a way for learners to enroll using their enterprise's subsidy (e.g., subscription license, codes).                                                                                                                                       |
| http://localhost:8734/:enterpriseSlug/licenses/:activationKey/activate | The license activation page allows new learners who have an assigned license to activate their license.                                                                                                                                                                                                 |
| http://localhost:8734/r/:redirectPath                                  | This route allows deep linking to a specific page within the Enterprise Learner Portal (i.e., the redirect path) without yet knowing an enterprise slug. This route is helpful to send generic links to pages within the Enterprise Learner Portal in marketing, support, account management scenarios. |

### Code layout / components

TODO/WIP

### Required reading

* edX
  * [Onboarding for devs](https://openedx.atlassian.net/wiki/spaces/ENG/pages/12550298/Developer+Onboarding)
  * [Devstack Doc](https://github.com/edx/devstack)
  * [Enterprise docs](https://openedx.atlassian.net/wiki/spaces/SOL/pages/997654609/Hitchhiker+s+Engineer+s+Guide+to+the+Enterprise+Ecosystem)
  *
* External
  * [ReactJS](https://reactjs.org/)
