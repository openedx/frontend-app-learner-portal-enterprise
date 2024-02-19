# 0011. Include resource hints in Webpack configuration for production to preconnect to critical services

## Status

Accepted (February 2024)

## Context

The ``frontend-app-enterprise-learner-portal-enterprise`` micro-frontend (MFE) relies on several platform-related services (e.g., LMS, ``enterprise-access``)as well as third-party resources (e.g., Google Fonts).

The initial request to each of these services/resources first begins with making a connection. As seen in the Chrome DevTools "Timing" data within the "Network" tab for any given request, the "Connection Start" section depicts the steps taken by the browser regarding making a connection to the host:

```
|- Stalled
  |- DNS Lookup
    |- Initial connection
    |- SSL
```

On subsequent requests to the same domains/origins, the "Connection Start" section only lists "Stalled" as an open connection exists.

Currently, the "Connection Start" process does not begin until an initial request has been made to that domain/origin. Due to this, connections to services such as ``enterprise-access`` are not made until:

1. HTML document is downloaded and parsed.
1. JavaScript chunks downloaded and parsed.
1. Resource / API requests further up the component are resolved.

Given this, connections are blocked by request waterfalls. There is an opportunity to preconnect to critical domains/origins generally used on initial load of all page routes.

## Decision

We will extend the default production Webpack configuration provided by ``@openedx/frontend-build`` to modify the options passed to ``HtmlWebpackPlugin``. By passing ``preconnect`` as an option, it becomes available for use within this micro-frontend's custom ``public/index.html`` file.

The ``public/index.html`` file will be modified to iterate over all domains/origins passed through the ``preconnect`` option, creating the following ``<link>`` elements:

```html
<!-- Include preconnect resource hint -->
<link rel="preconnect" href="<%= preconnectURL %>" />
<!-- Include preconnect resource hint with crossorigin, should the resource use CORS  -->
<link rel="preconnect" href="<%= preconnectURL %>" crossorigin />
<!-- Fallback to dns-prefetch resource hint if preconnect is not supported by browser -->
<link rel="dns-prefetch" href="<%= preconnectURL %>" />
```

By including the three permutations of ``<link>`` noted above, we can ensure requests that return resources relying on CORS work properly by including ``crossorigin`` and fallback to only performing a DNS lookup.

### Browser support

Per the ``@edx/browserslist-config`` NPM package, Open edX micro-frontends support the last 2 major versions of the primary browsers in the market (i.e., Chrome, Edge, Firefox, Safari) for desktop; for mobile, the last 3 major versions of ChromeAndroid, FirefoxAndroid, and iOS are supported.

Per [this report](https://caniuse.com/?search=preconnect), our primary supported browsers are compatible with preconnect resource hints.

### Expected outcome

By including the ``preconnect`` resource hints in the ``index.html`` entrypoint, we hope to shave off 

## Consequences

The domains/resources included in the ``preconnect`` list now passed to ``HtmlWebpackPlugin`` should only include domains/resources that are likely to be requested in the immediate future or necessary for initial page load.

Browsers will close any connection that isn't used within 10 seconds. Unnecessary preconnecting can delay other important resources, so the number of preconnected domains should be limited to primary/critical resources intended to be requested upon initial page load or shortly after.

## Alternatives Considered

* Only include a single ``<link rel="preconnect">`` without ``crossorigin``. While this would likely generally work the majority of use cases, it would not help with preconnecting for resources such as Google Fonts (loaded as a dependency of Paragon), as font resources are served with CORS and require ``crossorigin``. Based on the guidance and recommendations in [this article](https://crenshaw.dev/preconnect-resource-hint-crossorigin-attribute/), it appears to be safe to include multiple permuations of the ``<link rel="preconnect">`` along with ``<link rel="dns-prefetch">`` as a fallback if needed.
* Continue to rely on making connections to resources at the time of initial request. This was decided against as it's the current state and offers no performance benefits.
