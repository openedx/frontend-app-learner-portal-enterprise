# Testing

## Status
Draft (adapted from [`frontend-app-learning`](https://github.com/openedx/frontend-app-learning/blob/master/docs/decisions/0007-testing.md))

Let's live with this a bit longer before deciding it's a solid approach and marking this "Approved".

## Context
We'd like to all be on the same page about how to approach testing, what is
worth testing, and how to do it.

## React Testing Library
We'll use React Testing Library (RTL) and Jest as the main testing tools.

This has some implications about how to test. You can read the React Testing Library's
[Guiding Principles](https://testing-library.com/docs/guiding-principles), but the main
takeaway is that you should be interacting with React as closely as possible to the way
the user will interact with it.

For example, they discourage using class or element name selectors to find components
during a test. Instead, you should find them by user-oriented attributes like labels,
text, or roles. As a last resort, by a `data-testid` tag.

## Mocking data
We'll use [Rosie](https://github.com/rosiejs/rosie) as a tool for building JavaScript objects.
Our main use case for Rosie is to use factories in order to mock the data we'd like to fetch when rendering components.
[axios-mock-adapter](https://www.npmjs.com/package/axios-mock-adapter) allows us to mock the response of an HTTP request.

For example, we may use a factory to define an enterprise customer factory:

```js
const mockEnterpriseCustomer = Factory.build('enterpriseCustomer');
```

Then, we can use `mockEnterpriseCustomer` for mocking returned data from hooks:

```js
jest.mock('./path/to/hooks', () => ({
  ...jest.requireActual('./path/to/hooks'),
  useEnterpriseCustomer: jest.fn(),
}));

useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
```

Alternatively, the mocked data could be used with an axios mock call:

```js
axiosMock.onGet('example.com').reply(200, mockEnterpriseCustomer);`
```

This way, when a component sends a GET request to `example.com` within the test's lifecycle, the request will be intercepted
by the `axios-mock-adapter`, and the `mockEnterpriseCustomer` object will be returned.

These factories should live within the data directories they intend to mock:

```
| app
  | data
    | services
      | data
        | __factories__
          | enterpriseCustomerUser.factory.js /* used to define the Rosie factory */
```

## What to Test
We recommend primarily testing inputs and outputs. That is, components and tests should be
written such that tests ideally do not need to consider implementation details that are not
pertinent to the outcome of the UI and/or user. For example, we recommend avoiding mocking React
primitives such as `useState`, `useContext`, etc.

Similarly, when testing components that utilize `@tanstack/react-query`, either mock the custom
query hook (e.g., `useEnterpriseCustomer`) or mock the underlying service call with `axios-mock-adapter`
for more integration-style testing.

We generally recommend focusing on testing critical and common user flows (i.e., "happy-path"). This helps
prevent regressions of existing UI behavior and functionality as the application continues to evolve. Less
critical, but still important to consider, are tests specifically for handling loading and error states.

## Snapshots
In practice, we've found snapshots of component trees to be too brittle to be worth it,
as refactors occur or external libraries change.

They can still be useful for data or tiny isolated components.

But please avoid for any "interesting" component. Prefer inspecting the explicit behavior
under test, rather than just snapshotting the entire component tree.
