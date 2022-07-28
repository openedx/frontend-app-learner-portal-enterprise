# 0007. Add page route for gathering consent for ToS and basic user profile data for Executive Education (2U) courses

## Status

Accepted (07-28-2022)

## Context

As part of our Product Line Integration work (PLI) to make 2U content (i.e., Executive Education courses) accessible to customers with an external Learning Management System (LMS), we will need to collect required information from the user in order for fulfillment of Executive Education (2U) courses.

The fulfillment of Executive Education (2U) courses is handled by the GetSmarter Enterprise API Gateway (GEAG), in which edX for Business is considered an external service provider to GetSmarter. 

The GEAG `/allocations` API endpoint denotes the following required information from the user:

* Reading and agreeing to the Terms of Service (ToS)
* Collecting required user profile:
  * Address Line 1
  * Address Line 2
  * City
  * Postal code
  * Country
  * Country code
  * First name
  * Last name
  * Email
  * Date of birth

We may be able to programmatically get some of this user profile information from the Open edX LMS (e.g., full name, country code, email), but we will still need to build a UI to collect the information we do not have (e.g., address, date of birth, etc.) within Open edX and a way for the user to view and agree to the ToS.

The information this new page will need to display for viewing and agreeing to the ToS will include pulling its copy from a GEAG `/terms` API, which returns raw HTML content. It will also include a form to collect any required information for the user's profile.

## Decision

Users will access a new page route through the Executive Education (2U) allocation and fulfillment flow in order to view collect ToS and profile data from users, if applicable. 

The enterprise-catalog service will modify its `enrollment_url` for Executive Education (2U) courses to point to a URL in the ecommerce service. This ecommerce URL will determine if the user needs to be redirected to this ToS and user profile data collection page (i.e., if they are not yet enrolled), and if so, ecommerce will redirect the user to this new route in the Learner Portal. Users will view and agree to the ToS and provide the required information in a form, and ultimately send this data as its payload back to the ecommerce POST URL, which would then handle the GEAG fulfillment via the `/allocations` API endpoint and redirect to the order history page.

The content of the terms themselves will be retrieved from the `/terms` API endpoint in GEAG via a backend-for-frontend (BFF) endpoint.

If the user does not accept the ToS, they should see appropriate messaging and provide a link to redirect back to their external LMS (i.e., where they came from). This URL will be provided by the ecommerce view that redirects the user to this new page route, including a redirect URL via a query parameter.

If the user opts to decline ToS, we will inform the user that they must accept the ToS in order to continue with their enrollment, and provide a link to bring the user back to their external LMS.

If the enterprise customer associated with the user does not have enough remaining balance on their offer, the user will be redirected to a route in the Learner Portal and see messaging that their organization no longer has enough remaining balance and to contact their organization's edX administrator. A link will be provided to bring the user back to their external LMS.

The ecommerce view will provide the redirect URL and any failure reasons as query parameters to this new page route in the Learner Portal.

In the event that the associated enterprise customer has the Executive Education (2U) configuration flag turned off, the new page route implemented via this ADR will return a 404 page instead. By doing so, we eliminate the need for a separate feature flag for the new page route.

While on this page route, we will ensure the header does not include navigation links to the "Dashboard" or "Find a Course" page, as this user flow does not intend for these pages to be reachable, nor would they have the necessary data to provide a good user experience (i.e., Executive Education (2U course enrollments won't appear on the "Dashboard" or appear in the search results).

## Consequences

* User will need to provide their user profile data and agree to ToS for each new Exec Ed enrollemnt/allocation. We are opting to defer on storing/persisting these data until we see a more explicit use case for it (e.g., perhaps we look for average number of Exec Ed enrollments per learner greater >3 as validation for persisting these data).

## Alternatives Considered

* Building the necessary UI to view and agree to the ToS in ecommerce via Django Templates. This approach was rejected in favor of implementing the UI in an MFE with modern React/Paragon.
* Creating a standalone MFE for this UI. By implementing this page in the Learner Portal, we can take advantage of the enterprise branding and existing available data in order to more quickly create this new page.
