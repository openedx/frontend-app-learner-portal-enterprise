# 0008. Move routes for externally hosted course enrollments under `CoursePage`

## Status

Accepted (May 2023)

## Context

There exists 2 routes defined at:
* `/:enterpriseSlug/:courseType`
* `/:enterpriseSlug/:courseType/enrollment-completed`

The entry point to these routes was solely from a redirect from the ecommerce service when learners would click the `enrollment_url` for externally hosted courses. The first route receives a `course_uuid` query parameter that is used to make an API request to the course-discovery service to retrieve the metadata for the course (e.g., for displaying the course title).

However, these routes are now linked to from the `/:enterpriseSlug/course/:courseKey` route when the learner has a redeemable subsidy for the externally hosted course. This change to the user flow, where the entry point to the page is now from the course about page in this micro-frontend (MFE), means that we are now making an API call to fetch course metadata on the `/:enterpriseSlug/course/:courseKey` route as well as the `/:enterpriseSlug/:courseType` route unnecessarily.

We also need to migrate the enrollment form used for externally hosted courses to utilize the new Enterprise subsidy access policy APIs for redemption, which includes the API call to the `can-redeem` API in enterprise-access. This API call is currently used on the `CoursePage` to understand whether the learner has a user subsidy applicable to the course (e.g., covers the cost of the course).

## Decision

Given the above reasons, we will create new page routes defined at:
* `/:enterpriseSlug/:courseType/course/:courseKey/enroll`
* `/:enterpriseSlug/:courseType/course/:courseKey/enroll/complete`

These new routes will look and feel identical to the previous routes, except nested under the `CoursePage` such that when learners navigate between `/:enterpriseSlug/:courseType/course/:courseKey` and `/:enterpriseSlug/:courseType/course/:courseKey/enroll`, all the data already retrieved to load the `CoursePage` is already loaded and accessible via the `CourseContext`.

We will deprecate the original routes, with a plan to remove them once there are no more learners in production user journeys navigating through those routes.

## Consequences

* We will need to duplicate some UI and logic between both the previous and new routes, without it being DRY.
* Some components created for the new routes will be imported from the previous routes for the time being until the previous routes are officially removed. At that time, we will move the shared components to a more reasonable place.

## Alternatives Considered

* Keep the existing page routes as is. It would require making similar, duplicate API calls (or otherwise rely on `@tanstack/react-query`'s support for client-side caching). This would either require us to duplicate code or to create an abstraction to share logic across both the externally hosted course enrollment routes and the existing `CoursePage`.
