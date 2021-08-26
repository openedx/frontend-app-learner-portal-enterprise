/* eslint-disable object-curly-newline */
/* eslint-disable react/prop-types */
import React from 'react';

const MockReactInstantSearch = jest.genMockFromModule(
  'react-instantsearch-dom',
);

MockReactInstantSearch.connectStateResults = Component => (props) => (
  <Component
    searchState={{
      page: 1,
    }}
    {...props}
  />
);

MockReactInstantSearch.InstantSearch = ({ children }) => <div>{children}</div>;

MockReactInstantSearch.connectRefinementList = Component => (props) => (
  <Component
    attribute="skills"
    currentRefinement={[]}
    items={[]}
    refinements={{}}
    title="Foo"
    searchForItems={() => {}}
    {...props}
  />
);

MockReactInstantSearch.InstantSearch = ({ children }) => <>{children}</>;
MockReactInstantSearch.Configure = () => <div>CONFIGURED</div>;

// It is necessary to export this way, or tests not using the mock will fail
module.exports = MockReactInstantSearch;
