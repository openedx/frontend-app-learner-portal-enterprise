16. Error Handling in Queries
=============================

Status
******

Accepted (Apr 2025)

Context
*******

This application utilizes React Query for managing API calls and client-side caching. Queries are integrated within React Router's route loaders, as well as within components/hooks at render time. Each query utilizes a service function making a HTTP request via the authenticated ``axios`` HTTP client returned by ``@edx/frontend-platform``.

If a query throws an error within a route loader, the configured route ``errorElement`` acts as an error boundary, allowing the application to catch the error gracefully. However, when this ``errorElement`` renders, it is a full page error screen; as such, it is only suitable for critical errors that should prevent the user from interacting with the application (e.g., API request to retrieve enterprise customer metadata responded with a 500 status code).

To mitigate this issue, the query service functions wrap the HTTP request in a try-catch block, preventing the error from propagating to the route loader, and returns empty state fallback data instead. With this approach, while query errors within route loaders are not surfaced to the user, the try-catch block prevents React Query from knowing a query has failed (e.g., it does not automatically retry with exponential backoff).

While this approach mitigates query errors for route loaders, it causes issues when queries throw an error on a background re-fetch when the component/hook is already rendered and displayed to the user. For instance, after initial page load, blocking the request URL of a query (e.g., to simulate a 500 error) for a background re-fetch will cause the already-retrieved API data to be replaced with empty state fallback data, which is not the intended behavior. This can lead to confusion for users, as they may see empty data where they previously had valid information.

Decision
********

To address the issue of query errors in route loaders and background re-fetches, we will implement a consistent error handling strategy across all queries. This strategy will involve:

1. **Remove try-catch blocks in service functions**: Each query service function will no longer wrap the HTTP request in a try-catch block. If an error occurs with the HTTP request, the function will throw an error. This allows the caller of the service function (e.g., route loader, custom query hook) to have more granular control over how to handle the error.
2. **Selectively handle errors in route loaders**: In route loaders, critical queries for a given page route will now throw an error; however, non-critical queries (e.g., where the UI can still mostly be rendered, even without the errored query data) should be handled. That is, the ``queryClient.ensureQueryData`` call for the query must wrapped in a try-catch block. Additionally, the empty state fallback data should be optimistically added to the query cache so the query has valid placeholder data, albeit empty, for when components/hooks render. A helper function ``safeEnsureQueryData`` will be introduced to encapsulate this logic, allowing route loaders to safely ensure query data while handling non-critical query errors gracefully.


Consequences
************

* Queries in route loaders will throw errors for critical queries, allowing the application to catch them and render an error boundary if necessary.
* Non-critical queries in route loaders will use the ``safeEnsureQueryData`` helper function to handle errors gracefully, ensuring that the UI can still render with empty state fallback data.
* Background re-fetches will no longer replace valid data with empty state fallback data, as queries will throw errors when they fail, allowing React Query to handle retries and error states appropriately.

Alternatives Considered
***********************

1. **Continue using try-catch blocks in service functions**: This approach was considered but ultimately rejected, as it obscures the error handling logic and prevents React Query from properly managing query errors, leading to confusion for users.
2. **Don't catch errors in route loaders**: This would allow React Query to handle errors automatically, but it would result in full page error screens for non-critical queries, which is not the desired user experience. We only want to surface errors in the UI for critical queries that should prevent the user from interacting with the application.

