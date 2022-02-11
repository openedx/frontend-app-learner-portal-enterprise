================================
5. Moving Away from Redux in Learner Portal
================================

******
Status
******

Accepted

*******
Context
*******

Parts of our micro front-ends (MFEs) have embraced the adoption of the React `Context API <https://reactjs.org/docs/context.html>`_ and `hooks <https://reactjs.org/docs/hooks-reference.html>`_ as their main methods of state management. Our MFEs have built walls around individual features, where data is not usually shared.

Per the `React docs <https://reactjs.org/docs/context.html#when-to-use-context>`_:

  Context is designed to share data that can be considered “global” for a tree of React components
  
The important distinction in this definiton if that it's global for a _tree of React components_. This definition does not imply there is a singular Context used as a global store throughout the application, but rather there may be several Contexts used throughout the application, logically separated by `bounded contexts <https://martinfowler.com/bliki/BoundedContext.html>`_.

Redux is better suited for managing a complicated global data store shared across larger, monolithic apps, or where vanilla React performance optimization mechanisms (e.g., `useMemo`, `useCallback`, `React.memo`) fall short. 

********
Decision
********

We want to encourage modular/independent features in our app (bounded contexts), so these features don't manage complicated states across boundaries. For example, a course detail page generally doesn't have a need to share data or state between a learner dashboard page outside of global application state like the authenticated user or a theme. In addition, this global application state can be implemented with in its own distinct Context(s) since it doesn't change often, despite being shared across an entire application.

With React hooks, many of the paradigms established by Redux can still be replicated relatively quickly using vanilla React instead of third-party libraries (e.g., `useReducer`).

Redux will no longer be used as our main method of state management, in favor of the React Context API and React hooks.

************
Consequences
************

- Less code: Redux comes with a lot of boilerplate required to set up and use, though `@reduxjs/toolkit` helps. In some of our apps, Redux is excessive for our state management needs.

- Bundle size: Removing Redux reduces bundle size by about 350KB. This only includes package size without any boilerplate files required to set up Redux. 

- Performance: Depending on the apps/state setup, performance can be hindered due to a number of unnecessary component refreshes. This can happens with deep object trees, causing dirty checks in React. Use `useMemo`, `useCallback`, and `React.memo` to optimize expensive component renders.

- Organization and Patterns: Redux discretely enforces the `flux` application data architecture. 

**********
References
**********

* https://reactjs.org/docs/context.html
* https://reactjs.org/docs/hooks-reference.html
* https://blog.isquaredsoftware.com/2018/03/redux-not-dead-yet/
* https://martinfowler.com/bliki/BoundedContext.html
* https://openedx.atlassian.net/browse/ENT-5138
