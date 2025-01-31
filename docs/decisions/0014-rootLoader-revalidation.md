# 0014. Triggering Revalidation on the `rootLoader` Route Loader on Sub-Route Navigation

## Status

Accepted/Revised (January 2025)

## Context

In this route-based application, the `rootLoader` is responsible for pre-fetching common queries needed across multiple routes. However, when navigating between sub-routes (e.g., from the Dashboard to the Search page), the `rootLoader` doesn’t re-execute on its own. This lack of revalidation becomes a problem when a component in the target route accesses query data with `useQuery` that hasn’t already been pre-fetched by a loader. This issue is particularly noticeable when navigating from a page route supported by the Backend-for-Frontend (BFF) / API Gateway to other page routes that continue to rely on the individual API queries instead of the BFF.

By default, this issue is largely masked due to the query client configuration where queries have `suspense: true`, by default. In these cases, if a query hasn’t been pre-fetched in a route loader, the `useQuery` hook causes the component to suspend, triggering the `AppSuspenseFallback` component while the query resolves asynchronously. This fallback behavior hides the underlying problem, making it harder to identify when query data is being accessed without pre-fetching in a route loader.

While the parent suspense fallback in these scenarios prevents an error from surfacing to users while asychronous queries are resolving, the fallback behavior makes it less evident at the time of development to prevent the underlying issue altogether without improved observability.

## Decision

To ensure data consistency and more directly address the issue of missing pre-fetched queries, two key changes will be implemented:

### 1. Implement `shouldRevalidate` on the `rootLoader`

React Router by default only revalidates loaders after specific actions, such as form submissions or mutations. It does not automatically revalidate loaders during navigation between sibling routes under the same parent. To address this, the `shouldRevalidate` function will be implemented on the `rootLoader` route, with logic explicitly tailored to handle sub-route navigation.

The `shouldRevalidate` function will determine whether the loader should re-execute by checking the following:

* If the pathname has not changed between the current and next URLs, no revalidation will occur.
* If the pathname indicates navigation to a sub-route within the parent route (e.g., an enterprise-specific route or its sub-routes), the `rootLoader` will revalidate to ensure all required query data is pre-fetched and available.

This logic ensures that revalidation is scoped specifically to relevant sub-route transitions, avoiding unnecessary data fetching while ensuring consistent query cache availability.

### 2. Refactor parent `Suspense` component as Error Boundary

By only having a parent `Suspense` component to handle cases of suspended API queries at render time, there is no observability for when the suspense fallback is rendered, leaving minimal clues at development time that an issue exists.

Instead, the parent `Suspense` will be refactored first and foremost as a React error boundary (i.e., `AppErrorBoundary`) to catch any raised errors from its children. If an error is caught, `AppErrorBoundary` will determine whether the error is related to a missing suspense fallback. If so, the error will be logged, but the children will be re-rendered, wrapped with `Suspense` and its fallback UI. Other errors beyond suspense related issues will render the formatted `ErrorPage`, displaying the raised error message along with the CTA to "Try again", which triggers a full page refresh of the current route. 

Letting the `Suspense`-related error raise and subsequently get caught by `AppErrorBoundary`, it affords the opportunity to log the issue via `logError` for improved observability without surfacing these errors in the UI to the user, beyond a brief secondary loading state.

To enable this approach, the `useNProgressLoader` hook that manages the state of the animated, horizontal loading progress bar, will be extended to accept `loaderOptions`, where callers of this hook can change its behavior as needed. In this case, the `AppErrorBoundary`'s conditional rendering of a `Suspense` fallback utilizing the `useNProgressLoader` hook, the conditions that determines when the loader completes may already be truthy. Given this, when the `Suspense` fallback is rendered within `AppErrorBoundary` with `loaderOptions.shouldCompleteBeforeUnmount: false`, the animated loader bar will only complete (i.e., `nprogress.done()`) once the `Suspense` fallback component unmounts.

### Benefits of this Approach

* Queries required by UI components in the target route are more likely to be pre-fetched and cached prior to rendering by ensuring the `rootLoader` is re-executed upon sub-route navigation, particularly during the incremental migration to a Backend-for-Frontend (BFF) / API Gateway architecture, while continuing to prevent `Suspense`-error states from displaying in the UI.
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
