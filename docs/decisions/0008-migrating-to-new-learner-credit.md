# 0008. Migrating to new learner credit system from ecommerce

## Status

Accepted (04-07-2023)

## Context

The Enterprise Learner Portal currently supports learner credit (aka enterprise offers) via the ecommerce IDA. However, the ecommerce IDA is deprecated and will be replaced by a new system for managing learner credit and other enterprise subsidies. As such, this micro-frontend (MFE) will need to support the migration from the ecommerce-backed learner credit to the new learner credit system in an incremental fashion, given there are production enterprise customers relying on the current implementation of the ecommerce-backed learner credit.

### Understanding support for existing learner credit
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
* Determining the enrollment type (which dictates the messaging and behavior of the "Enroll" button) via [`determineEnrollmentType`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/course/enrollment/utils.js#L16).
* Generating the enrollment URL for the course (e.g., enrolling with a subscription license goes through Data Sharing Consent while enrolling via learner credit goes through ecommerce's basket page) via [`useCourseEnrollmentUrl`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/course/data/hooks.jsx#L342).

## Decision

In order to support all page routes with the new learner credit system, we will need to understand the state of subsidy spend available to the authenticated user. We will also need to migrate away from much of the business logic housed within `CoursePage` in favor of the `can_redeem` and `redeem` API abstractions within the new learner credit system (via enterprise-access and enterprise-subsidy).

### Implications for `UserSubsidy`

Given that all aforementioned page routes rely on the learner credit metadata exposed by the `UserSubsidyContext`, we will need a way to support data either pulled from the new learner credit system or the legacy ecommerce system. We intend to rely on the interface already exposed by `UserSubsidyContext` to minimize the impacts and changes needed for downstream components.

The metadata pertinent to learner credit that gets exposed by `UserSubsidyContext` is fetched via the [`useEnterpriseOffers`](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/5034f5ab170589a923c223cfe238112eff48f5c4/src/components/enterprise-user-subsidy/enterprise-offers/data/hooks.js#L11) React hook.

It currently relies on the system-wide feature flag `FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS` and the enterprise customer configuration flag `enableLearnerPortalOffers` to both be truthy. To support the new learner credit system, we will not be relying `enableLearnerPortalOffers`. This boolean flag on the customer configuration is currently used to detemrine whether we should attempt to make API calls to retrieve any learner credit data (such that we can avoid making API calls if a customer doesn't rely on learner credit). The recommendation for the new learner credit system is to no longer rely on `enableLearnerPortalOffers` and always make the API calls even if the customer doesn't utilize learner credit. The performance impacts should largely be mitigated by the fact that we make API calls to fetch all subsidies in parallel rather than waterfall.

Within `useEnterpriseOffers`, we will make API calls to fetch learner credit data from both the legacy ecommerce system as well as the new learner credit system in parallel (e.g., 2 custom React hooks called simulateously or perhaps via `Promise.all`). If there is learner credit returned by the new system, we will use that as the source data for the returned interface by `UserSubsidyContext`. If there is no learner credit data returned by the new system, we will fallback to using any learner credit returned by ecommerce instead.

These changes will require a `GET` API endpoint in enterprise-access to return the policies (and subsequent subsidies) associated with learner credit that are applicable to the authenticated user (e.g., has total spend balance remaining, has user-specific spend balance remaining). Given how these data are used through the UX of this MFE, the API can not be specific to a particular content item; rather, the API response should largely be answering the question of what subsidies are generally available to the learner irrespective of content and/or catalog.

### Implications for course page route

The course page in the Learner Portal currently supports:
* Enterprise offers
* Coupon codes
* Subscription license

As previously described, the course page route currently includes a fair amount of business logic to determine which subsidies available to the learner, if any, are applicable to the course in question.

A significant change with the new EMET system is that much of this business logic will now be abstracted into the API layer instead of within the MFE itself. This paradigm shift will (eventually) allow us to simplify the existing implementation by removing much of this business logic in the current implementation. However, much of the existing business logic needs to remain while the course page continues to support coupon codes and subscription licenses, which do not rely on the EMET system. We do intend to make the EMET system compatible with subscriptions in the future such that calling `can_redeem` would return a policy that is aware of subscription licenses.

Through the first release of EMET, we are converting enterprise offers into EMET learner credit. We plan to migrate eligible enterprise offers customers over to use the EMET learner credit instead. However, this means the course page still needs to support coupon codes and subscription licenses. As such, the majority of the existing API calls and business logic already in place within the course page must remain until codes are phased out and subscription subsidies are supported by the EMET system.

#### `CourseHeader` component

The `CourseHeader` component is responsible for the display of the course title, image, related skills, and renders an "Enroll" CTA for each available course run. A course run is deemed "available" if course-discovery denotes the course run is `is_marketable: true`, `is_enrollable: true`, and is not archived.

The existing `CourseRunCards` component is responsible for iterating through the available course runs and rendering a `CourseRunCard` component with the appropriate messaging and "Enroll" CTA (or "View course" CTA is learner is already enrolled) for each course run.

The existing `CourseRunCard` (rendered by `CourseRunCards`) is responsible for figuring out the display text of the "Enroll" / "View course" CTA and renders the `EnrollAction` component. `EnrollAction` is what determines the *functionality* of the CTA depending on the type of subsidy being used to enroll (i.e., link to Data Sharing Consent, link to ecommerce basket page, disabled "Enroll" button, etc.).

Having the "Enroll" CTA logic essentially split between 2 components (i.e., `CourseRunCard` and `EnrollAction`), it's increasingly difficult to reason about. 

To mitigate this concern, we will deprecate the existing `CourseRunCards` component in favor of creating a more streamlined, lightweight `CourseRunCards` component instead. That is, we will have `CourseRunCards` that is integrated with the EMET APIs and fallback to `CourseRunCards.Deprecated` to remain backwards compatible.

#### Triggering an EMET redemption for course run
When a learner clicks on the "Enroll" CTA for a course run that is redeemable by the EMET system (i.e., has learner credit enabled with balance remaining), the general logic is as follows:
* Make a `POST` request to the `redeem` endpoint for the redeemable access policy returned by `can_redeem`. This returns the transaction payload from `enterprise-subsidy`.
* Poll against `enterprise-subsidy`'s API for `transactions` until the transaction is in a non-pending state (e.g., "committed").

We will ensure error handling is considered as well, displaying appropriate messaging and an option to retry in the course page UI as needed.

#### Backwards compatibility with non-EMET subsidy types

The proposed logic (subject to change at implementation) for the course page to attempt to redeem with the EMET APIs but remain backwards compatible with subscription licenses, legacy enterprise offers, and coupon codes is as follows:

1. Learner lands on course page.
1. If `FEATURE_ENABLE_EMET_REDEMPTION` is enabled:
    * Fetch `can_redeem` API from `enterprise-access`. This tells us whether the learner can attempt to redeem the course based on the state of subsidies available to the enterprise/learner in `enterprise-subsidy` / `enterprise-access`.
    * If `can_redeem` returns a redeemable access policy, we will use the new/simpler `CourseRunCards` component (and a EMET-integrated `StatefulEnroll` component via the new `CourseRunCard`).
    * If `can_redeem` does not return a redeemable access policy for the learner/course, stick to using `CourseRunCards.Deprecated` to fallback to current state (which supports subscriptions, coupon codes, etc.).
1. If `FEATURE_ENABLE_EMET_REDEMPTION` is NOT enabled:
    * Render `CourseRunCards.Deprecated` to stick to current state.

By implementing this "smart" fallback logic, we will ensure that the course page remains backwards compatible with non-EMET subsidy types (e.g., subscription licenses).

In order to support existing enrollments that were redeemed outside of the EMET system (e.g., subscription license), the new `CourseRunCard` component (via `CourseRunCards`) will continue to rely on parsing the learner's existing `EnterpriseCourseEnrollments`, data available and used by the course page today, to understand whether the learner has an existing enterprise enrollment that was subsidized outside of the EMET system.

## Consequences

* Given the introduction of an extra API call to fetch learner credit from the new system, the MFE will have an extra network request to resolve before we can render the page route and have it be usable by learners.
* Related, part of the recommendation in this ADR is to eliminate the need for the `enableLearnerPortalOffers` configuration flag on the enterprise customer, even for learner credit backed by the deprecated ecommerce IDA. Similar to the above consequence, the implications for these changes would mean that even enterprise customers that don't have any learner credit configured (in ecommerce or the new learner credit system) would be making the API requests to fetch the current state of learner credit.

## Alternatives Considered

* We considered refactoring the existing components related to the display of the "Enroll" CTA per course run. However, the existing components are tighly coupled to data that's not needed in a world with EMET. As such, trying to rework the existing "Enroll" CTA integrated with the EMET APIs would be messy. Instead, we are opting for the approach of keeping the existing components as is, but deprecate them to be eventually removed in the future; this would be in favor of a net-new components that are similar but simpler and easier to reason about. 