# 0006. Eliminate unnecessary API calls and reduce bundle size

## Context

### Component Architecture

Today, each page in the core enterprise learner experience within `frontend-app-learner-portal-enterprise` renders the `EnterprisePage` component. For example, the "Dashboard" page is rendered via the `DashboardPage` component:

```jsx
<AuthenticatedUserSubsidyPage>
  <Dashboard />
</AuthenticatedUserSubsidyPage>
```

The other core pages like the "Search", "Course", "Program", etc. each independently render their own `AuthenticatedUserSubsidyPage` component as part of their route's logic. This means that, as a learner, when I navigate from "Dashboard" to "Search, we are rendering `AuthenticatedUserSubsidyPage` (and performing all its logic) once and then again once the "Search" page loads, unnecessarily duplicating logic between page views.

The logic encapsulated by `AuthenticatedUserSubsidyPage` entails:

* Redirecting to logistration, via the enterprise `/proxy-login/` view in the LMS.
* Refresh the authenticated user's JWT, if necessary.
* Fetching an enterprise customer configuration
* Fetching a `CustomerAgreement`, subscription licenses, enterprise coupon codes (and soon enterprise offers).
* Recompute custom brand styles ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/master/src/components/layout/Layout.jsx#L19))

By rendering `AuthenticatedUserSubsidyPage` separately for each page route duplicates a lot of work. Some of these tasks are blocking items, in that a spinner or other loading state must be shown to the user before we can proceed to render anything on the page since all this logic deals with determining what experience the learner may have throughout the app. As a result, we've introduced client side API caching to eliminate the need to re-fetch data from the API that we expect to change infrequently (e.g., an enterprise customer configuration), thus reducing the issue of blocking loading states between route changes.

Even then, there is a brief, but noticeable flicker between page changes due to this component architecute that could be eliminated by moving some components around in the component tree such that the aforementioned logic is no longer called unnecessarily again between route changes.

### Bundle Size

As this application has grown in size, it now supports 12 pages or routes:

| Route                                                                  | Description                                                                                                                                                                                                                                                                                             |
|------------------------------------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| /                                                 | The main entry point for the Enterprise Learner Portal. Detects which enterprise(s) you're linked to and redirects you to the appropriate Dashboard page for a specific enterprise.                                                                                                                     |
| /invite/:enterpriseCustomerInviteKey | A universal link that allows learners to get linked to an enterprise customer via a generated URL provided by their enterprise administrator. |
| /:enterpriseSlug                                  | The dashboard page for a specific enterprise customer. Displays all course enrollments associated with that enterprise.                                                                                                                                                                                 |
| /:enterpriseSlug/search                           | The search page for a specific enterprise customer. Shows all enrollable courses associated with that enterprise's content catalogs. Utilizes Algolia as a hosted search provider.                                                                                                                      |
| /:enterpriseSlug/course/:courseKey                | The course page with information about the course and provides a way for learners to enroll using their enterprise's subsidy (e.g., subscription license).                                                                                                                                              |
| /:enterpriseSlug/program/:programUuid                | The program page with information about a program and provides a way for see which courses are in a program.                                                                                                                                              |
| /:enterpriseSlug/program-progress/:programUUID | The program progress page with information about a learner's progress towards completing a program.        |
| /:enterpriseSlug/programs | The programs page that displays an overview of a learner's enrolled programs with their linked enterprise customer. |
| /:enterpriseSlug/licenses/:activationKey/activate | The license activation page allows new learners who have an assigned license to activate their license.                                                                                                                                                                                                 |
| /:enterpriseSlug/skills-quiz | The skills quiz page allows learner to answer a few questions to get targeted course suggestions based on selected skills and careers. |
| /r/:redirectPath                                  | This route allows deep linking to a specific page within the Enterprise Learner Portal (i.e., the redirect path) without yet knowing an enterprise slug. This route is helpful to send generic links to pages within the Enterprise Learner Portal in marketing, support, account management scenarios. |
| * | This represents a catch-all route, displaying a "Not Found" page if the path doesn't match any of these other routes. |

The bundle size of the application has also begun to creep up due to the additional of new pages and features, which bring more installed NPM packages, etc. to the application, increasing the bundle size. At the time of this writing, the application's bundle size is 1.9 MB (parsed) or 477.67 KB (gzipped) according the `webpack-bundle-analyzer` report. This means that when a learner visits this application, they may be downloading nearly 2 MB before being able to effectively use the application.

We hypothesize we may be able to improve the Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) synthetic metrics in New Relic through this work.

## Decision

This decision comes in two parts:
1. We will move the enterprise app routes further down the component tree to avoid unnecessary duplication of work.
2. We will begin lazy loading components by route to reduce upfront bundle size that must be downloaded by the learner.


