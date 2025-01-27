# 0014. Triggering Revalidation on the `rootLoader` Route Loader on Sub-Route Navigation

## Status

Accepted/Revised (January 2025)

## Context

In this route-based application, the `rootLoader` is responsible for pre-fetching common queries needed across multiple routes. However, when navigating between sub-routes (e.g., from the Dashboard to the Search page), the `rootLoader` doesn’t re-execute on its own. This lack of revalidation becomes a problem when a component in the target route accesses query data with `useQuery` that hasn’t already been pre-fetched by a loader. This issue is particularly noticeable when navigating from a page route supported by the Backend-for-Frontend (BFF) / API Gateway to other page routes that continue to rely on the individual API queries instead of the BFF.

By default, this issue is largely masked due to the query client configuration where queries have `suspense: true`, by default. In these cases, if a query hasn’t been pre-fetched in a route loader, the `useQuery` hook causes the component to suspend, triggering the `AppSuspenseFallback` component while the query resolves asynchronously. This fallback behavior hides the underlying problem, making it harder to identify when query data is being accessed without pre-fetching in a route loader.

While the parent suspense fallback in these scenarios prevents an error from surfacing to users while asychronous queries are resolving, the fallback behavior makes it less evident at the time of development to prevent the underlying issue altogether.

## Decision

To ensure data consistency and explicitly address the issue of missing pre-fetched queries, two key changes will be implemented:

### 1. Implement `shouldRevalidate` on the `rootLoader`

React Router by default only revalidates loaders after specific actions, such as form submissions or mutations. It does not automatically revalidate loaders during navigation between sibling routes under the same parent. To address this, the `shouldRevalidate` function will be implemented on the `rootLoader` route, with logic explicitly tailored to handle sub-route navigation.

The `shouldRevalidate` function will determine whether the loader should re-execute by checking the following:

* If the pathname has not changed between the current and next URLs, no revalidation will occur.
* If the pathname indicates navigation to a sub-route within the parent route (e.g., an enterprise-specific route or its sub-routes), the `rootLoader` will revalidate to ensure all required query data is pre-fetched and available.

This logic ensures that revalidation is scoped specifically to relevant sub-route transitions, avoiding unnecessary data fetching while ensuring consistent query cache availability.

### 2. Move parent `Suspense` component and its fallback UI into `Root`

The existing `Suspense` wrapping the `RouterProvider` will be moved to be nested under the router, implemented within the `Root` component instead. By moving this parent `Suspense` component into `Root`, its fallback component `AuthenticatedRootFallback` (previously `AppSuspenseFallback`) can simply implement the `useNProgressLoader` hook, instead of the previously used hook (`useNProgressLoaderWithoutRouter`) to manage the animated loading bar in the suspended fallback component.

Keeping this `Suspense` boundary and its fallback will remain to prevent suspense errors from raising. However, the fallback component `AuthenticatedRootFallback` will include additional logging to improve observability for when components/hooks are suspended during render. The `logError` function will be called upon render.

By default, the `@tanstack/react-query` query client configuration utilizes `suspense: true`, which largely masks the issue of missing pre-fetched query data during render by suspending components, displaying the fallback while queries resolve asynchronously. Modifying the fallback to include additional logging via `logError` ensures that missing query data at render time triggers explicit errors instead of silently deferring to the fallback. This change affords more discoverability for the when the error occurs, both during development and in production, while not affecting the user experience.

### Benefits of this Approach

* Queries required by UI components in the target route are always pre-fetched and cached before rendering by ensuring the `rootLoader` is re-executed upon sub-route navigation, particularly during the incremental migration to a Backend-for-Frontend (BFF) or API Gateway architecture.
* Developers can more easily identify and address missing pre-fetches through explicitly logged errors instead of only relying on silent fallback behavior.

## Consequences

### Positive Outcomes

* **Reliable Query Data Availability:** Ensures that all required query data is pre-fetched and cached during sub-route transitions, preventing issues where `useQuery` tries to access missing or stale data.
* **Explicit Error Handling:** Introducing error logging within the `AppSuspenseFallback` ensures that missing pre-fetched data triggers explicit errors instead of solely being masked by the fallback. This simplifies debugging, leading to better long-term reliability, while preventing related errors from surfacing to users.
* **Scoped and Efficient Revalidation:** The `shouldRevalidate` function selectively targets relevant sub-route transitions. Combined with `ensureQueryData`, it prevents redundant API requests for data that remains fresh, minimizing performance impact.
* **Improved Developer Workflow:** By exposing missing pre-fetches, the approach strives to facilitate earlier identification and resolution of query-related issues, reducing risks of data inconsistencies.

### Negative Outcomes

* **Initial Debugging Effort:** Keeping the suspense fallback may continue to obscure existing cases where query data was not pre-fetched in a route loader, for example, if issues with the loading UX and/or additional logs are not noticed during development. That said, the additional logs within `AppSuspenseFallback` should help surface such cases for resolution, while keeping the app functional for users.
* **Small Overhead for Non-Fresh Data:** Revalidating the `rootLoader` during sub-route navigation may result in occasional additional backend calls if data is not fresh. However, these calls are scoped and optimized, ensuring minimal impact on performance.

## Alternatives Considered

* Removing the parent `Suspense` and its fallback component (`AppSuspenseFallback`) in the `App` component altogether would prevent the application to handle missing query pre-fetches silently, where suspended components would no longer have a fallback UI, raising an error in the UI. While surfacing the error in the UI to users helps developers more quickly identify affected routes and code paths, we would rather prevent the error from appearing in the UI, prioritizing a functional UX, while having better observability regarding when the `AppSuspenseFallback` component is rendered.
