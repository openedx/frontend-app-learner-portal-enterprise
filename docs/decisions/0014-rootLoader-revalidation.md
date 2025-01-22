# 0014. Triggering Revalidation on the `rootLoader` Route Loader on Sub-Route Navigation

## Status

Accepted (January 2025)

## Context

In this route-based application, the `rootLoader` is responsible for pre-fetching common queries needed across multiple routes. However, when navigating between sub-routes (e.g., from the Dashboard to the Search page), the `rootLoader` doesn’t re-execute. This becomes a problem when a component in the target route accesses query data with `useQuery` that hasn’t already been pre-fetched by a loader.

By default, this issue is masked due to the query client configuration where queries have `suspense: true`. In these cases, if a query hasn’t been pre-fetched in a route loader, the `useQuery` hook causes the component to suspend, triggering the `AppSuspenseFallback` component while the query resolves asynchronously. This fallback behavior hides the underlying problem, making it harder to identify when query data is being accessed without pre-fetching.

## Decision

To ensure data consistency and explicitly address the issue of missing pre-fetched queries, two key changes will be implemented:

### 1. Remove the Parent `Suspense` and `AppSuspenseFallback` Component

The parent `Suspense` boundary and its fallback (`AppSuspenseFallback`) will be removed from the `App` component. By default, the query client configuration uses `suspense: true`, which masks the issue of missing pre-fetched query data by suspending components and displaying the fallback while queries resolve asynchronously. Removing this fallback ensures that missing query data triggers explicit errors instead of silently deferring to the fallback. This change improves the navigation experience and makes it easier to debug and fix data-loading issues during development.

### 2. Implement `shouldRevalidate` on the `rootLoader`

React Router by default only revalidates loaders after specific actions, such as form submissions or mutations. It does not automatically revalidate loaders during navigation between sibling routes under the same parent. To address this, the `shouldRevalidate` function will be implemented on the `rootLoader` route, with logic explicitly tailored to handle sub-route navigation.

The `shouldRevalidate` function will determine whether the loader should re-execute by checking the following:

* If the pathname has not changed between the current and next URLs, no revalidation will occur.
* If the pathname indicates navigation to a sub-route within the parent route (e.g., an enterprise-specific route or its sub-routes), the `rootLoader` will revalidate to ensure all required query data is pre-fetched and available.

This logic ensures that revalidation is scoped specifically to relevant sub-route transitions, avoiding unnecessary data fetching while ensuring consistent query cache availability.

### Benefits of this Approach

* Queries required by UI components in the target route are always pre-fetched and cached before rendering.
* Developers can easily identify and address missing pre-fetches through explicit errors instead of relying on silent fallback behavior.
* Data consistency is maintained across sibling route transitions, particularly during the incremental migration to a Backend-for-Frontend (BFF) or API Gateway architecture.

## Consequences

### Positive Outcomes

* **Reliable Query Data Availability:** Ensures that all required query data is pre-fetched and cached during sub-route transitions, preventing issues where `useQuery` tries to access missing or stale data.
* **Explicit Error Handling:** Removing the `AppSuspenseFallback` ensures that missing pre-fetched data triggers explicit errors instead of being masked by the fallback. This simplifies debugging and leads to better long-term reliability.
* **Scoped and Efficient Revalidation:** The `shouldRevalidate` function selectively targets relevant sub-route transitions. Combined with `ensureQueryData`, it prevents redundant API requests for data that remains fresh, minimizing performance impact.
* **Improved Developer Workflow:** By exposing missing pre-fetches, the approach facilitates early identification and resolution of query-related issues, reducing risks of data inconsistencies.

### Negative Outcomes

* **Initial Debugging Effort:** Removing the fallback may reveal existing cases where query data was not pre-fetched. This change could introduce additional debugging during development as missing pre-fetches surface as explicit errors. However, addressing these issues early ensures long-term consistency in data-loading strategies by enforcing a robust pattern of pre-fetching query data in route loaders.
* **Small Overhead for Non-Fresh Data:** Revalidating the `rootLoader` during sub-route navigation may result in occasional additional backend calls if data is not fresh. However, these calls are scoped and optimized, ensuring minimal impact on performance.

## Alternatives Considered

* Keeping the parent `Suspense` and its fallback component (`AppSuspenseFallback`) in the `App` component would allow the application to handle missing pre-fetches silently, suspending components and showing a secondary loading state during navigation. While this approach mitigates user-facing errors, it obscures data-loading inconsistencies and makes debugging more difficult. Additionally, it risks subtle issues in route navigation where query data dependencies are unclear. By adopting the chosen approach, explicit error handling ensures better enforcement of consistent and predictable data-loading practices.
