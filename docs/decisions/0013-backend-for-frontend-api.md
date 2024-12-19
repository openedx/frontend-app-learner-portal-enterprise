# 0013. Introduction of the Backend-for-Frontend / API Gateway into Learner Portal

## Status

Accepted (December 2024)

## Context

As part of supporting the feature of auto enrollment of default enrollment intentions 
([see ADR](https://github.com/openedx/edx-enterprise/blob/master/docs/decisions/0015-default-enrollments.rst))
and auto-apply of subscription plan licenses, it was determined the sequencing of API calls to resolve in the existing 
frontend root loader would result in a new set of waterfall API calls on top of existing reconciliation of the current 
status of the user's subsidies when landing on the enterprise learner portal. The waterfall of API request in the 
`rootLoader` would mutate an API response asynchronously being called within the `dashboardLoader` resulting in a 
potential race condition. This would have to be resolved by either introducing additional latency by re-fetching the 
modified API or additional complexity in optimistically updating the related caches for the modified response.

There is also the long term goal of improving the frontend performance. The feature would potentially add a re-fetch on 
mutated data or require awaiting the mutated API response within the dashboard route contributing to additional latency 
on page load. Furthermore, in support of including this feature, it required additional business logic to be parsed 
about the current state of the requester's association to the enterprise, the current state of their subsidies 
(and auto-apply of subscription licenses), and the eventual realization of a default enrollment intention.

## Decision

The recognition of the additional maintenance of business logic with the default enrollment flow along with the 
additional overhead of resolving the complexity making API calls within the loaders required to complete the 
requirements of the feature resulted in the creation of a Backend-for-Frontend (BFF) / API Gateway layer within the 
enterprise-access service. A BFF API Gateway layer is an accepted architectural pattern when designing for microservices 
when the consideration of consolidating business logic dependent on multiple services and an intentional reduction of 
latency between N number of services required to determine the resultant business logic outcome versus a single API 
call with the logic already resolved to be used.

Here are links to some relevant external documentation about the architectural pattern of a BFF API Gateway layer:

- [The API gateway pattern versus the Direct client-to-microservice communication](https://learn.microsoft.com/en-us/dotnet/architecture/microservices/architect-microservice-container-applications/direct-client-to-microservice-communication-versus-the-api-gateway-pattern)
- [Gateway Aggregation pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/gateway-aggregation)
- [Backends for Frontends pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)

For the enterprise learner portal implementation, currently, the dashboard route, `/:enterpriseSlug`, is the only route 
currently implementing the BFF layer on _specific_ API calls for the sole intention of supporting, auto-apply licenses, 
and realizing default enrollment intentions. The long term goal is to gradually migrate API calls currently made in the 
frontend to the BFF layer in enterprise access and include additional routes to depend on the BFF endpoint. This 
migration would gradually improve performance for the learner portal as a whole as we reduce the number of service call 
requests in the learner portal. 

### Making the BFF API call via `useBFF`

At a high level, the implications to the frontend is the inclusion of the following hooks, services, query keys, and constraints: 

- `fetchEnterpriseLearnerDashboard` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/services/bffs.ts))
  - This is the function that makes the service call to the Dashboard BFF API. It only requires an `entepriseSlug` to 
    resolve successfully.
- `queryEnterpriseLearnerDashboardBFF` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/queries/queries.ts#L270))
  - This helper function is used to pass into a `useQuery` function to make the API call to the BFF. 
  - Creation of the query key ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/queries/queryKeyFactory.js#L267))
- `useBFF` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/hooks/useBFF.js#L16))
  - Since the introduction of React Query and custom hooks, the migration process involved abstracting a generalized 
    `useBFF` hook to aid in the incremental migration to the BFF APIs away from the current service requests:
    - Within `resolveBFFQuery` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/queries/utils.js#L11))
      - To determine the _"eligibility"_ of making the BFF call. It is determined by both **feature enablement** for 
        the enterprise learner and their **current route**:
        - An enterprise learner **with the feature enabled** to use the BFF API call is either associated to an 
          enterprise customer being explicitly enabled via the configuration API as a defined `enterpriseUuid` or an 
          individual enterprise learner has been selected to resolve the dashboard page with the BFF loader with a 
          gradual rollout process via a Waffle flag exposed via `enterpriseFeatures`
          - The enterprise customer based eligibility and Waffle flag are temporary flags until gradual rollout via 
            the waffle flag is complete.
        - An enterprise learner **with the feature enabled** to use the BFF API call is on a **matched route** that has 
          BFF query available
          - A BFF API call is made to the specific query matching a given route. Currently only the dashboard route 
            (`:enterpriseSlug/`) has been constructed but as iterations are made to the BFF API Gateway layer, 
            additional routes and services will be migrated
        - Once an **applicable route** and the enterprise learner has **the feature enabled**, they are considered 
          _"eligible"_ to make the BFF API call
          - We execute `useQuery` with the `matchedQuery` and any fields passed within the `bffQueryOptions` object.
      - When an enterprise learner **does not meet** the criteria above, they are deemed _"ineligible"_ to make the 
        BFF call
        - For a **matched route** where a BFF call can be made, but the enterprise learner **is not feature enabled** 
          to make the call, we fallback to the default existing query provided by the option `fallbackQueryConfig` 
          within `useQuery`
        - For an **unmatched** route where a BFF call cannot be made but the enterprise learner **is feature enabled** 
          to make the call, we fallback to the default existing query provided by the option `fallbackQueryConfig` 
          within `useQuery`
- Custom Query Hooks modified
  - `useSubscriptions` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/hooks/useSubscriptions.js#L11))
    - This is the simplest implementation of migrating existing React query custom hooks to utilize the BFF. It passes 
      an object representing fields typically passed within `useQuery` for the BFF query call within `bffQueryOptions`. 
      This includes the transform to match the data structure of the existing `useSubscriptions` non-BFF call to 
      `useBFF` within an object when making a call to the BFF query. It also passes the original arguments for making a 
      query call within `useSubscriptions` passed within `useQuery` as a `fallbackQueryConfig` object within `useBFF`.
    - This structure allows the developer to continue using the original hooks as implemented.
  - `useEnterpriseCourseEnrollments` ([source](https://github.com/openedx/frontend-app-learner-portal-enterprise/blob/337a7b44d94d8be5d9233e80e2fa0e2de72d165c/src/components/app/data/hooks/useEnterpriseCourseEnrollments.js#L36))
    - The modifications required to make this current hook utilize the original `useEnterpriseCourseEnrollments` hook and
      the `useBFF` layer required specific options to be passed in depending on the modified hooks downstream related 
      to `enterpriseCourseEnrollments`.

### Incremental migration of existing services to the BFF

In the long run, additional services currently being called in the frontend will eventually be migrated to the BFF
layer. There is no definitive timeline of the migration process, but the intention is to provide a seamless experience
for feature development by developers with minimal impact to UI development using existing conventions and an enjoyable 
customer experience with continual performance improvement.

## Alternatives Considered

The alternative considered was to include the business logic and additional API resolution to return to the user an 
auto enrolled course and an auto-applied license. This would have resulted in additional latency before loading the 
learner dashboard page adding to an already challenging largest contentful paint time based on the additional waterfall 
request. This would have also added additional complexity between the asynchronous loading of the `dashboardLoader` and 
`rootLoader` where the `rootLoader` would mutate data that the `dashboardLoader` would be fetching. In the effort for 
continual frontend performance improvements along with building a scalable infrastructure to allow additional features 
and services while still providing a enjoyable experience for the customer, and maintainability of code we opted 
against this implementation method.
