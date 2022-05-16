# 0006. Eliminate unnecessary work by moving ``AuthenticatedUserSubsidyPage`` further up the component tree

## Context

### Component Architecture

Today, each page in the core enterprise learner experience within `frontend-app-learner-portal-enterprise` renders the `AuthenticatedUserSubsidyPage` component. For example, the "Dashboard" page is rendered via the `DashboardPage` component and similarly for `SearchPage`:

```jsx
// DashboardPage
<AuthenticatedUserSubsidyPage>
  <Dashboard />
</AuthenticatedUserSubsidyPage>
```

```jsx
// CoursePage
<AuthenticatedUserSubsidyPage>
  <Course />
</AuthenticatedUserSubsidyPage>
```

The other core pages like the "Search", "Program", etc. also each independently render their own `AuthenticatedUserSubsidyPage` component as part of their route's logic. This means that, as a learner, when navigating from "Dashboard" to "Search", we are rendering `AuthenticatedUserSubsidyPage` (and performing all its logic) once and then again when the "Search" page loads, unnecessarily duplicating logic between page views.

The logic encapsulated by `AuthenticatedUserSubsidyPage` entails:
* Redirecting to logistration, via the enterprise `/proxy-login/` view in the LMS.
* Refresh the authenticated user's JWT, if necessary.
* Fetching an enterprise customer configuration.
* Fetching a `CustomerAgreement`, subscription licenses, enterprise coupon codes (and soon enterprise offers).
* Recompute custom brand styles ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/master/src/components/layout/Layout.jsx#L19)).
* And more...

Clearly, rendering `AuthenticatedUserSubsidyPage` separately for each page route duplicates a lot of work. Some of these tasks are blocking items, in that a spinner or other loading state must be shown to the user before we can proceed to render anything on the page since all this logic deals with determining what experience the learner may have throughout the app.

As a result, we previously introduced client side API caching to eliminate the need to re-fetch data from the API that we don't expect to change frequently (e.g., an enterprise customer configuration), thus reducing the impact of blocking loading states between route changes.

Even then, there is a brief, but noticeable flicker between page changes due to this component architecure that could be eliminated by moving some components around in the component tree such that the aforementioned logic is no longer executed unnecessarily again between route changes.

### Web Vitals

Common metrics for frontend performance are from [Web Vitals](https://web.dev/vitals/), an initiative started "to provide unified guidance for quality signals that are essential to delivering a great user experience on the web". We are tracking these metrics via New Relic for the https://enterprise.edx.org deployment of this project, and have noticed our Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS) metrics are worse than recommended. Notably, over the last 7 days (at the time of this writing), our LCP metric was 8.25 seconds and the CLS metric was 0.266. Both of these metrics are indiciators that we have room for improvement in terms of our frontend performance and user experience. We hypothesize that we may be able to improve both of these metrics through the work proposed in this ADR and associated code refactoring as we will reduce the amount of duplicate work throughout the holistic application experience (e.g., reducing the frequency of loading states by eliminating unnecessary API calls.

## Decision

We will move the enterprise app routes further down the component tree to avoid unnecessary duplication of work. Rather than each page owning the responsibility of rendering the `AuthenticatedUserSubsidyPage` component, which encapsulates much of the global logic for the application, we will instead:

* Define a new route with path `/:enterpriseSlug` that will render an `EnterpriseAppRoutes` component.
* `EnterpriseAppRoutes` will be responsible for rendering the `AuthenticatedUserSubsidyPage` once, and define multiple `PageRoute` components as its children.

As such, all routes will instead be wrapped by a single `AuthenticatedUserSubsidyPage` instance, rather than each route defining its own duplicate `AuthenticatedUserSubsidyPage`.

If our hypothesis is correct, we should see a reduction in the LCP and CLS metric in the New Relic synthetics.

## Consequences

* By performing duplicate work (see above examples) on each page refresh, we keep the data fresh. Moving the duplicate business logic higher up in the component tree means it will only be executed once for the session (or until the page is refreshed); if we depend on keeping the data fresh, we will need to create a mechanism to refresh it as needed. However, this is not a requirement for the application given what the `AuthenticatedUserSubsidyPage` component is responsible for at the time of the writing.
