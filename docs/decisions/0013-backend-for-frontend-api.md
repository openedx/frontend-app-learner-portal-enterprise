# 0013. Introduction of the backend-for-frontend orchaestration API

## Status

Accepted (December 2024)

## Context

As part of supporting the feature of auto enrollment of default enrollment intentions ([see ADR](https://github.com/openedx/edx-enterprise/blob/master/docs/decisions/0015-default-enrollments.rst))
and auto-apply of subscription plan licenses, it was determined the sequencing of API calls to resolve in the existing 
frontend root loader would result in a new set of waterfall API calls on top of existing reconciliation of the current status of
the user's subsidies when arriving on the enterprise learner portal. Furthermore, in support of including this feature,
it required additional business logic to be parsed about the current state of the requester's association to the enterprise,
the current state of their subsidies (and auto-apply of subscription licenses), and the eventual auto enrollment of a 
default enrollment intention.

## Decision

The recognition of the additional maintenance of business logic with the default enrollment flow along with the overhead
of resolving the series of API calls required to resolve the requirements of the feature resulted in the creation of a 
backend-for-frontend (BFF) layer within the enterprise-access service ([see ADR](https://github.com/openedx/enterprise-access/blob/main/docs/decisions/)).

A BFF layer is a accepted architectural consideration when designing for microservices when the consideration of consolidating
business logic dependent on multiple services and an intentional reduction of latency between N number of services required to 
determine the resultant business logic outcome versus a single API call with the logic already resolved to be used.

For the enterprise learner portal implementation, currently, the dashboard route, `/:enterpriseSlug`, is the only route currently
implementing the BFF layer on _specific_ API calls for the sole intention of supporting, auto apply licenses and auto enrollment via default intentions.

### Making the BFF API call via `useBFF`

At a high level, the implications to the frontend is the inclusion of the following hooks, services, and keys and constraints: 

- `fetchEnterpriseLearnerDashboard` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/services/bffs.ts))
  - This is the function that makes the service call to the BFF. It requires either a `entepriseSlug` or `enterpriseUuid` to resolve successfully. 
- Creation of the query key ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/queries/queryKeyFactory.js#L267))
  and helper function `queryEnterpriseLearnerDashboardBFF` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/queries/queries.ts#L270))
- `useBFF` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/hooks/useBFF.js#L16))
  - Since the introduction of React Query and custom hooks, the migration process involved abstracting a generalized `useBFF` hook
    that determines the following conditionals:
    - Within `resolveBFFQuery` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/queries/utils.js#L11))
      - Whether a customer is eligible to use the BFF API call by either being explicitly enabled via the configuration API as a defined `enterpriseUuid`,
        or an individual customer has been selected to resolve the dashboard page with the BFF loader with a gradual rollout process via a Waffle flag.
      - Whether the current route the user is on is eligible to make the BFF call, if so, return the query required to call the BFF.
    - For a matched route where a BFF call can be made, but the user is ineligible to make the call, we fall back to the default query provided by a
      an argument
      - `useSubscriptions` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/hooks/useSubscriptions.js#L11))
        - This is the simplest implementation of migrating existing React query custom hooks to utilize the BFF. It passes an object representing 
          fields typically passed within `useQuery` for the BFF query call within `bffQueryConfig`. This includes the transform to match the
          data structure of the existing `useSubscriptions` non-BFF call to `useBFF` within an object when making a call to the BFF query. It also passes
          the original arguments for making a query call within `useSubscriptions` passed within `useQuery` as a `fallbackQueryConfig` object within `useBFF`.
        - This structure allows the developer to continue using the original hooks as implemented.
      - `useEnterpriseCourseEnrollments` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/hooks/useEnterpriseCourseEnrollments.js#L36))
        - The modifications required to make this current hook utilize the original `useEnterpriseCourseEnrollments` hook and
          the `useBFF` layer required specific options to be passed in depending on the modified hooks downstream related to `enterpriseCourseEnrollments`.

### Incremental migration of existing services to the BFF

In the long run, as additional services currently being called in the frontend will eventually be migrated to the BFF
layer. There is no definitive timeline of the migration process, but the intention is to provide a seamless experience
for feature development by developers and an enjoyable customer experience with continual improvement. 

## Alternatives Considered

The alternative considered was to include the business logic and additional API resolution to return to the user an auto enrolled course
and an auto-applied license based on just the requester information. This would have resulted in additional latency before loading
the learner dashboard page adding to an already challenging first contentful paint time based on the additional waterfall request.
In the effort for continual frontend performance improvements along with building a scalable infrastructure to allow additional features
and services while still providing a enjoyable experience for the customer, we opted against this implementation method.
