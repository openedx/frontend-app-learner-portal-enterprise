# 0008. Cross-cutting component architecture and data flow throughout the application

## Status

Accepted - October 3, 2022

## Context

The `frontend-app-learner-portal-enterprise` application (i.e., Enterprise Learner Portal) contains the user journeys/flows for several enterprise learner experiences. The application currently intends to be the entry point of the enterprise learner experience. In general, this application primarily covers user flows including initial enterprise account registration and content discovery in addition to enrolling in and accessing content. As such, this application has many code paths that are independent of each other to support the varied use cases; however, there is considerable "plumbing" that each user journey or feature relies on behind-the-scenes.

The current ADR intends to describe the "plumbing" throughout the application, or cross-cutting component architecture and data flow, as it exists today. The goal of this ADR is to document the shared logic and data common to most user journeys and code paths for our enterprise learners. By doing so, engineers working in this code repository will have a better idea of what "plumbing" exists and what common data are available throughout the application, further enabling existing and future user flows and features.

## Decision

The below sections describe the shared, cross-cutting component architecture and data flow throughout the Enterprise Learner Portal.

### Application entry point
The Enterprise Learner Portal, like most micro-frontend applications across Open edX, utilizes `@edx/frontend-platform` for its application bootstrapping and initialization. This application initialization takes place in `src/index.jsx`.

### Authentication for enterprise learners

There are a couple different ways to ensure that a user flow is only available to authenticated enterprise learners. In the application's entry point (described above), we configure the application to explicitly _not_ require an authenticated user (via `requireAuthenticatedUser`) so we have custom control over how we handle authentication for enterprise learners. The following table describes our current approaches to authentication.

| Approach | Description |
|---|---|
| AuthenticatedPageRoute | From `@edx/frontend-platform`, requires an authenticated user prior to rendering a specified component. If no authenticated user exists, redirects to the given `redirectUrl` or to the B2C logistration flow. |
| PageRoute | From `@edx/frontend-platform`, does not require an authenticated user prior to rendering a specified component; allows anonymous users. |
| Route | A standard `react-router-dom` route that does not include any direct logic related to authentication with Open edX. |
| LoginRedirect | From `@edx/frontend-enterprise-logistration`, redirects anonymous users to an appropriate enterprise-specific logistration url (proxy login) prior to rendering its `children`. By doing so, the logistration flow contains Enterprise Customer branding (e.g., custom logo). |
| AuthenticatedPage | A custom component that ensures its `children` will only be rendered for authenticated enterprise learners (makes use of `LoginRedirect`), ensures users' JWT tokens are refreshed via the `LoginRefresh` component, and renders the core application layout. |
| AuthenticatedUserSubsidyPage | A compound component that renders `AuthenticatedPage` and `UserSubsidy` to ensure its `children` have access to all common data about available user subsidies (e.g., subscription license). |

Most components in the authenticated Enterprise Learner Portal experience utilize the `AuthenticatedUserSubsidyPage` component to ensure all relevant features are gated by enterprise authentication and have common data available to descendant components (e.g., available subsidies for the user) as depicted by the following:

```jsx
<Route path="/:enterpriseSlug" component={EnterpriseAppPageRoutes} />
```

The above route definition indicates that all nested page routes under `/:enterpriseSlug` will utilize `EnterpriseAppPageRoutes` and as such makes use of `AuthenticatedUserSubsidyPage`. The following image depicts this user flow graphically:

![Enterprise Learner Logistration Flow](./images/Enterprise%20Learner%20Logistration%20Flow.jpeg)

Page routes that don't rely on user subsidies (e.g., subscription licenses, coupon codes, etc.) should rely on `AuthenticatedPage` versus `AuthenticatedUserSubsidyPage`.

Page routes that do not contain the `enterpriseSlug` route parameter currently do not take advantage of the enterprise logistration flow since no enterprise customer is specified and, therefore, we can't determine which enterprise customer' logistration flow to use. As such, authenticated user journeys without a known `enterpriseSlug` should rely instead on `AuthenticatedPageRoute` from `@edx/frontend-platform` to redirect users to the standard B2C logistration flow.

Refer to `getAuthenticatedUser` from `@edx/frontend-platform` to determine whether there is an authenticated user present.

### Everything about the enterprise customer
As an enterprise learner, you user account must be linked to an enterprise customer. Each enterprise customer has a unique URL-friendly slug. For most page routes within the Enterprise Learner Portal, we grab the `enterpriseSlug` from the URL route parameter, passing it to an API call to fetch the full metadata about that enterprise customer.

The logic for retrieving the enterprise customer metadata is housed within `EnterprisePage` component, which is rendered by the aforementioned `AuthenticatedPage` component, via the `useEnterpriseCustomerConfig` React hook.

At the time of this writing, we extract and parse the following enterprise customer metadata:

```jsx
{
  name,
  uuid,
  slug,
  adminUsers,
  contactEmail,
  hideCourseOriginalPrice,
  hideLaborMarketData,
  identityProvider,
  disableSearch,
  showIntegrationWarning,
  branding: {
    logo,
    colors: {
      primary,
      secondary,
      tertiary,
    },
  },
  enableLearnerPortalOffers,
  enableExecutiveEducation2UFulfillment,
}
```

These metadata are available to any component throughout the application as it gets added to the `AppContext.Provider` component provided by `@edx/frontend-platform`. As such, any component may consume the data stored in the `AppContext`, e.g.:

```jsx
import { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';

function ExampleComponent() {
  const { enterpriseConfig } = useContext(AppContext);
  consosle.log(enterpriseConfig); // outputs above metadata
}
```

### Grokking and accessing enterprise subsidies data

As previously discussed, most user journeys within the Enterprise Learner Portal are nested under the `AuthenticatedUserSubsidyPage`, implying any component within these authenticated enterprise user journeys will or may require data about the enterprise subsidies available to the user.

The Enterprise Learner Portal currently supports the following 3 subsidy types:
* Subscription licenses
* Coupon codes
* Learner credit (formerly known as enterprise offers)

In order to avoid data duplication or unnecessary API requests, we try to retrieve shared data such as the state of a user's available enterprise subsidies as high in the component tree as possible so its accessible for other descendant components. Most of the subsidy logic is housed in the `UserSubsidy` component and described below.

Within the `UserSubsidy` component, we use the following React hooks subsidy data with API calls:

| Hook Name | Description | API Endpoint |
|---|---|---|
| useCustomerAgreementData | Fetches the CustomerAgreement record for the specified enterprise customer. The CustomerAgreement record indicates whether the customer has any subscription plans. | https://license-manager.edx.org/api/v1/customer-agreement/ |
| useSubscriptionLicense | Fetches any assigned/activated subscription licenses for the authenticated user. | https://license-manager.edx.org/api/v1/learner-licenses/ |
| useCouponCodes | Retrieves any assigned coupon codes for the authenticated user. At the time of this writing, only 100% off coupons are supported. | https://ecommerce.edx.org/api/v2/enterprise/offer_assignment_summary/ |
| useEnterpriseOffers | Retrieves whether the enterprise customer has any learner credit (i.e., enterprise offers) configured. | https://ecommerce.edx.org/api/v2/enterprise/{enterpriseUUID}/enterprise-learner-offers/ |

Once all these data are retreived from the various APIs and parsed, we pass the resulting data into the `UserSubsidyContext.Provider` such that any descendant components of `UserSubsidy` can access the state of any enterprise subsidy, e.g.:

```jsx
import { useContext } from 'react';

function ExampleComponent() {
  const {
    subscriptionLicense,
    subscriptionPlan,
    couponCodes,
    enterpriseOffers,
    canEnrollWithEnterpriseOffers,
    hasLowEnterpriseOffersBalance,
    hasNoEnterpriseOffersBalance,
    showExpirationNotifications,
    customerAgreementConfig,
    activateUserLicense,
  } = useContext(UserSubsidyContext);
}
```

Using the above example, we can see that `ExampleComponent` already has access to the authenticated user's subscription license, the enterprise customer's subscription plan, assigned coupon codes, and available learner credit (i.e., enterprise offers) amongst some other data and functions (e.g., `activateUserLicense` is a helper function exposed that allows any component to progamtically activate a user's assigned subscription license).

By collecting/storing all these data in the `UserSubsidyContext`, nested components shouldn't need to re-fetch any data around user subsidies since such data already exists in the component tree.

#### Subsidy requests
The Enterprise Learner Portal also supports the use case where learners must request enrollment from their Enterprise Administrator(s) before being granted an assigned enterprise subsidy. For example, a learner may discover a course they wish to take, and click "Request enrollment" from the course detail page.

This subsidy requests logic is also handled as far up the component tree as possible to ensure its subsequent data is available to all descendant components.

Once all data regarding enterprise subsidies is retrieved, we determine whether there are any outstanding enrollment requests by that learner in the `SubsidyRequestsContextProvider` component. Here, we do the following:

| Hook | Description | API Endpoint |
|---|---|---|
| useSubsidyRequestConfiguration | Retrieves the subsidy request configuration for the enterprise customer, which determines which subsidy type may be used for enrollment requests. | https://enterprise-access.edx.org/api/v1/customer-configurations/ |
| useSubsidyRequests | Retrieves any outstanding license or coupon code enrollment requests made by the authenticated user. | * https://enterprise-access.edx.org/api/v1/license-requests/ * https://enterprise-access.edx.org/api/v1/coupon-code-requests/ |
| useCatalogsForSubsidyRequests | Determines the applicable enterprise catalogs that may be used for subsidy requests, depending on how they are configured. For example, if the subsidy request configuration denotes coupon codes as the subsidy request type, this hook will fetch which coupons are configured for the customer to determine which catalogs may be used for subsidy requests. | https://ecommerce.edx.org/api/v2/enterprise/coupons/{enterpriseUUID}/overview/ |

The data exposed by the `SubsidyRequestsContextProvider` to all descendant components is as follows:

```jsx
import { useContext } from 'react';

function ExampleComponent() {
  const {
    subsidyRequestConfiguration,
    requestsBySubsidyType, // contains a list of all subsidy requests by subsidy type
    refreshSubsidyRequests, // helper function to refresh the data about subsidy requests
    catalogsForSubsidyRequests,
  } = useContext(SubsidyRequestsContext);
}
```
