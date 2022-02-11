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

Parts of our micro front-ends (MFEs) have embraced the adoption of React hooks and context API as their main methods of state management. Our MFEs have built walls around individual features, where data is not usually shared. 

Redux is better suited for managing complicated data store shared across a large app.

********
Decision
********

We want encourage modular/independent features in our app, which don't manage complicated states.

Redux will no longer be used as our main method of state management.

************
Consequences
************

- Less code: Redux comes with a lot of boilerplate required to set up. In some of our apps Redux is excessive for our state management needs.

- Bundle size: Removing redux reduces bundle size by about 350KB, this only including package size and not any boilerplate files required to set up redux. 

- Performance: Depending on the apps/state setup, performance can be hindered due to a number of unnecessary component refreshes. This can happens with deep object trees, causing dirty checks in React. Use `useMemo`, `useCallback` and `React.memo` to optimize expensive component renders.

- Organization and Patterns: Redux discretely enforces the `flux` application data architecture. 

**********
References
**********

* https://reactjs.org/docs/hooks-reference.html
* https://blog.isquaredsoftware.com/2018/03/redux-not-dead-yet/
* https://openedx.atlassian.net/browse/ENT-5138
