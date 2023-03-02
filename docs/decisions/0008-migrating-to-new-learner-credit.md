# 0008. Migrating to new learner credit system from ecommerce

## Status

Accepted (03-02-2023)

## Context

The Enterprise Learner Portal currently supports learner credit (aka enterprise offers) via the ecommerce IDA. However, the ecommerce IDA is deprecated and will be replaced by a new system for managing learner credit and other enterprise subsidies. As such, this micro-frontend (MFE) will need to support the migration from the ecommerce-backed learner credit to the new learner credit system in an incremental fashion, given there are production enterprise customers relying on the current implementation of the ecommerce-backed learner credit.

### Understanding the existing learner credit support
There are 3 primary page routes that rely on learner credit throughout the MFE application:
* Dashboard
* Search
* Course

Given that the availability of learner credit is applicable to multiple page routes, the fetching of the learner credit data from the ecommerce API is done within the [`UserSubsidy`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/enterprise-user-subsidy/UserSubsidy.jsx) component, which acts as a context provider to expose subsidy-related data to its descendant components without requiring prop drilling. 

It is responsible for fetching the following subsidy-related data via API in parallel:
* Subscription licenses for the authenticated user (`useSubscriptionLicense`)
* Coupon codes assigned to the authenticated user (`useCouponCodes`)
* Learner credit (via ecommerce) available to the authenticated user (`useEnterpriseOffers`).

The `UserSubsidyContext` thus exposes the following data pertinent to learner credit to its descendant components:
* `enterpriseOffers`. List of objects containing metadata about available learner credit stored in the ecommerce IDA. Each object contains the following attributes:
  * `offerType` (determined by [`getOfferType`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/enterprise-user-subsidy/enterprise-offers/data/utils.js#L13)).
  * `maxDiscount`. Maximum total spend allowed.
  * `maxGlobalApplications`. Maximum total number of enrollments allowed.
  * `remainingBalance`. The total available balance remaining to be spent by all learners.
  * `remainingBalanceforUser`. The available balance remaining specifically for the authenticated user.
  * `isLowOnBalance`. Determined by [`isOfferLowOnBalance`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/enterprise-user-subsidy/enterprise-offers/data/utils.js#L32).
  * `isOutOfBalance`. Determined by [`isOfferOutOfBalance`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/enterprise-user-subsidy/enterprise-offers/data/utils.js#L51).
* `canEnrollWithEnterpriseOffers`. Boolean representing whether there is at least one enterprise learner credit available.
* `hasLowEnterpriseOffersBalance`. Boolean representing whether any of the `enterpriseOffers` are low on balance.
* `hasNoEnterpriseOffersBalance`. Boolean representing whether all `enterpriseOffers` have no balance remaining.

#### Dashboard

This page route relies on the learner credit data in order to display messaging to learners informing them of having learner credit available to spend. The UI component rendered in the dashboard page's sidebar is the [`EnterpriseOffersSummaryCard`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/dashboard/sidebar/EnterpriseOffersSummaryCard.jsx).

This component gets rendered within the [`SubsidiesSummary`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/dashboard/sidebar/SubsidiesSummary.jsx#L10) component, which renders similar UI components for other subsidies (e.g., subscription licenses).

The `SubsidiesSummary` component gets its data about available learner credit from the `UserSubsidyContext`.

`EnterpriseOffersSummaryCard` either displays a generic message for max global spend or a user-specific message for max user spend remaining. It does not currently support any enrollment limits (e.g., `maxGlobalApplications`). In the case of max user spend remaining, we sum all remaining user balance for all available learner credit. The expiration date shown is from the learner credit that expires first.

#### Search
This page route similarly relies on the data provided by the `UserSubsidyContext` in order to display an alert to inform learners of low/no balance remaining. The rationale for this alert in the UX is to help proactively make learners are aware they may not have enough funds available to cover the cost of all content returned in the search results.

The alert messaging here does not currently account for enrollment limits.

This alert is implemented via the [`EnterpriseOffersBalanceAlert`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/enterprise-user-subsidy/enterprise-offers/EnterpriseOffersBalanceAlert.jsx) component. It handles both cases of low vs. no balance remaining. The component is rendered within the [`Search`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/search/Search.jsx) component.

`EnterpriseOffersBalanceAlert` is conditionally rendered based on `canEnrollWithEnterpriseOffers` and whether the is low or no balance remaining on the available `enterpriseOffers` from `UserSubsidyContext`.

#### Course
One of the primary responsibilities of the course page route today is to make a determination of which subsidies available to the learner are applicable to the course (e.g., catalog inclusion) and to prioritize certain subsidies over others in the case a learner has multiple subsidies available for the course.

Much of the API data fetching required for the course page route is encapsulated within the [`useAllCourseData`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/course/data/hooks.jsx#L40) React hook used within the [`CoursePage`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/course/CoursePage.jsx) component.

We pass the data for each subsidy into `useAllCourseData` (including `enterpriseOffers` and `canEnrollWithEnterpriseOffers` from `UserSubsidyContext`) and the enterprise catalog UUIDs derived from the subsidies into `useAllCourseData`.

Within `useAllCourseData`, we make API requests to various services to fetch the necessary data for the page route. These requests include:

* Fetch course details metadata from course-discovery, including determining the active course run.
* Fetch the authenticated user's current enrollments for the active enterprise customer.
* Fetch entitlements that user may have available (e.g., in the case of a program purchase).
* Fetch whether the course key is included in the catalogs available to the enterprise customer. This API also returns a list of catalog UUIDs for the enterprise customer which include the course.

Once all these API requests are resolved, we proceed with business logic to do the following:

* Check if the course key is included in the enterprise customer's catalog(s).
* Validate which subsidies are applicable to the course.
  * If the user has a subscription license, make an API call to license-manager to check whether the user's subscription license may be applied to the course (based on the catalog associated with the subscription plan tied to the user's license).
  * Filters `couponCodes` applicable to the course.
  * Filters `enterpriseOffers` applicable to the course (only if `canEnrollWithEnterpriseOffers` is truthy).
* Make a choice of which subsidy to prefer via [`getSubsidyToApplyForCourse`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/course/data/utils.jsx#L255). Prioritizes subsidies in the following order:
  * Subscription license
  * Coupon code
  * Learner credit
* Return the course metadata including the chosen subsidy from `userSubsidyApplicableToCourse` and expose it via [`CourseContextProvider`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/course/CourseContextProvider.jsx) in `CoursePage` to make it available to descendant components without prop drilling.

The `userSubsidyApplicableToCourse` attribute is used for several purposes:
* Determining the course price via [`useCoursePriceForUserSubsidy`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/course/data/hooks.jsx#L265).
* Determining the enrollment type (which dictates the messaging and behavior of the "Enroll" button).
* Generating the enrollment URL for the course (e.g., enrolling with a subscription license goes through Data Sharing Consent while enrolling via learner credit goes through ecommerce's basket page).

## Decision


In order to support all page routes with the new learner credit system, we will need to understand the state of subsidy spend available to the authenticated user. We will also need to migrate away from much of the business logic housed within `CoursePage` in favor of the `can_redeem` and `redeem` API abstractions within the new learner credit system (via enterprise-access and enterprise-subsidy).

### Implications for `UserSubsidy`

Given that all aforementioned page routes rely on the learner credit metadata exposed by the `UserSubsidyContext`, we will need a way to support data either pulled from the new learner credit system or the legacy ecommerce system. We intend to rely on the interface already exposed by `UserSubsidyContext` to minimize the impacts and changes needed for downstream components.

The metadata pertinent to learner credit that gets exposed by `UserSubsidyContext` is fetched via the [`useEnterpriseOffers`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/enterprise-user-subsidy/enterprise-offers/data/hooks.js#L11) React hook.

It currently relies on the system-wide feature flag `FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS` and the enterprise customer configuration flag `enableLearnerPortalOffers` to both be truthy. To support the new learner credit system, we will not be relying `enableLearnerPortalOffers`. This boolean flag on the customer configuration is currently used to detemrine whether we should attempt to make API calls to retrieve any learner credit data (such that we can avoid making API calls if a customer doesn't rely on learner credit). The recommendation for the new learner credit system is to no longer rely on `enableLearnerPortalOffers` and always make the API calls even if the customer doesn't utilize learner credit. The performance impacts should largely be mitigated by the fact that we make API calls to fetch all subsidies in parallel rather than waterfall.

Within `useEnterpriseOffers`, we will make API calls to fetch learner credit data from both the legacy ecommerce system as well as the new learner credit system in parallel (e.g., 2 custom React hooks called simulateously or perhaps via `Promise.all`). If there is learner credit returned by the new system, we will use that as the source data for the returned interface by `UserSubsidyContext`. If there is no learner credit data returned by the new system, we will fallback to using any learner credit returned by ecommerce instead.

### Implications for course page route

As previously described, the course page route currently includes a fair amount of business logic to determine which subsidies available to the learner, if any, are applicable to the course in question.

## Consequences

TODO

## Alternatives Considered

TODO