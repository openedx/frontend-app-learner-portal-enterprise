# 0007. Add page route for gathering consent for terms/policies and user profile data for Executive Education (2U) courses

## Status

Accepted (08-01-2022)

## Context

As part of our Product Line Integration work (PLI) to make 2U content (i.e., Executive Education courses) accessible to customers with an external Learning Management System (LMS), we will need to collect required information from the user in order for fulfillment of Executive Education (2U) courses.

The fulfillment of Executive Education (2U) courses is handled by the GetSmarter Enterprise API Gateway (GEAG), in which edX for Business is considered an external service provider to GetSmarter. 

The GEAG `/allocations` API endpoint denotes the following required information from the user:

* Reading and agreeing to the Terms and Policies provided by GEAG
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

We may be able to programmatically get some of this user profile information from the Open edX LMS (e.g., full name, country code, email), but we will still need to build a UI to collect the information we do not have (e.g., address, date of birth, etc.) within Open edX and a way for the user to view and agree to the terms and policies.

The information this new page will need to display for viewing and agreeing to the terms and policies will include pulling its copy from a GEAG `/terms` API, which returns raw HTML content. It will also include a form to collect any required information for the user's profile.

## Decision

Users will access a new page route through the Executive Education (2U) allocation and fulfillment flow in order to view collect agreements to the terms and policies in addition to user profile data, if applicable. 

The enterprise-catalog service will modify its `enrollment_url` for Executive Education (2U) courses to point to a URL in the ecommerce service. This ecommerce URL will determine if the user needs to be redirected to this terms/policies and user profile data collection page (i.e., if they are not yet enrolled), and if so, ecommerce will redirect the user to this new route in the Learner Portal. Users will view and agree to the terms/policies and provide the required information in a form, and ultimately send these data as its payload back to an ecommerce POST URL, which would then handle the GEAG fulfillment via the `/allocations` API endpoint and redirect to the ecommerce order history page. This user flow is depicted in the below screenshot.

![External LMS Executive Education (2U) enrollment flow](../images/external_lms_customer_execed_enrollment_learner_credit.png "External LMS Executive Education (2U) enrollment flow")

The content of the terms themselves will be retrieved from the `/terms` API endpoint in GEAG via a backend-for-frontend (BFF) endpoint defined in the ecommerce service. Similarly, should we need to display metadata about the Executive Education (2U) course itself (e.g., title, description, etc.), we will source these data from the `/courses` API endpoint in course-discovery to return product metadata in the UI based on a unique identifier for the course.

If the user does not accept the terms and policies, they should see appropriate messaging and provide a link to redirect back to their external LMS (i.e., where they came from). This URL will be provided by the ecommerce view that redirects the user to this new page route, including a redirect URL via a query parameter. This flow is depicted in the below screenshot.

If the user opts to decline terms and policies, we will inform the user that they must accept the terms and policies in order to continue with their enrollment, and provide a link to bring the user back to their external LMS.

![External LMS Executive Education (2U) decline terms flow](../images/external_lms_customer_execed_decline_terms_learner_credit.png "External LMS Executive Education (2U) decline terms flow")

If the enterprise customer associated with the user does not have enough remaining balance on their offer, the user will be redirected to a route in the Learner Portal and see messaging that their organization no longer has enough remaining balance and to contact their organization's edX administrator. A link will be provided to bring the user back to their external LMS.

The ecommerce view will provide the redirect URL and any failure reasons as query parameters to this new page route in the Learner Portal.

![External LMS Executive Education (2U) no remaining balance flow](../images/externa_lms_customer_execed_no_balance_learner_credit.png "External LMS Executive Education (2U) no balance flow")

When the user is already enrolled in the Executive Education (2U) course when clicking the `enrollment_url` provided by the enterprise-catalog service, they will bypass this new page route in favor of simply getting redirected to the GetSmarter content, if applicable, or otherwise the ecommerce basket page with their order receipt. This user flow is shown in the below screenshot.

![External LMS Executive Education (2U) user already enrolled flow](../images/external_lms_customer_execed_already_enrolled.png "External LMS Executive Education (2U) user already enrolled flow")

In the event that the associated enterprise customer has the Executive Education (2U) configuration flag turned off, the new page route implemented via this ADR will return a 404 page instead. By doing so, we eliminate the need for a separate feature flag for the new page route.

While on this page route, we will ensure the header does not include navigation links to the "Dashboard" or "Find a Course" page, as this user flow does not intend for these pages to be reachable, nor would they have the necessary data to provide a good user experience (i.e., Executive Education (2U) course enrollments won't appear on the "Dashboard" or appear in the search results).

The new page route will require the following pieces of data provided by the ecommerce service, passed via query parameters:
* **Unique course identifier** (`course_uuid`). Used to retrieve information from the course-discovery service about the course for display in the UI.
* **External LMS redirect URL** (`redirect_url`). Used as a hyperlink to bring user back to their external LMS.
* **Failure reason** (`failure_reason`). Used to determine which error message(s), if any, should be displayed based on any API failures.

## Consequences

* User will need to provide their user profile data and agree to terms and policies for each new Exec Ed enrollemnt/allocation. We are opting to defer on storing/persisting these data until we see a more explicit use case for it (e.g., perhaps we look for average number of Exec Ed enrollments per learner greater >3 as validation for persisting these data).

## Alternatives Considered

* Building the necessary UI to agree to the terms and policies, and provide user profile data in ecommerce via Django Templates. This approach was rejected in favor of implementing the UI in an MFE with modern React/Paragon.
* Creating a standalone MFE for this UI. By implementing this page in the Learner Portal, we can take advantage of the enterprise branding and existing available data in order to more quickly create this new page.
