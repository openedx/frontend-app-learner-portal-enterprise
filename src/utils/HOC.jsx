import { connectStateResults } from 'react-instantsearch-dom';
import { useMemo } from 'react';
import { memoizedCamelCaseObject } from './common';

/**
 * A higher-order component (HOC) that connects a component to Algolia's InstantSearch state
 * using `connectStateResults`, and transforms `searchResults.hits` into camelCase using a memoized utility.
 *
 * This enhances performance by avoiding redundant transformation of large or repeated result sets,
 * and ensures consistency between backend snake_case and frontend camelCase expectations.
 *
 * @param {React.ComponentType<any>} WrappedComponent - The component to enhance with Algolia search props.
 *   This component will receive the following additional props:
 *     - `hits`: camelCased search result hits (array)
 *     - `isLoading`: a boolean indicating if the search is stalled or actively searching
 *     - `searchResults`: the raw Algolia search results object (if available)
 *
 * @returns {React.ComponentType<any>} A component wrapped with normalized search props.
 *
 * @example
 * const MyComponent = ({ hits, isLoading }) => (
 *   <div>
 *     {isLoading ? 'Loading...' : hits.map(hit => <div key={hit.id}>{hit.courseTitle}</div>)}
 *   </div>
 * );
 *
 * export default withCamelCasedStateResults(MyComponent);
 *
 * @note
 * - Memoizes transformed hits using `memoizedCamelCaseObject` to improve performance.
 * - Safe for use with large result sets or frequently re-rendering search UIs.
 */
export function withCamelCasedStateResults(WrappedComponent) {
  return connectStateResults(({
    searchResults,
    isSearchStalled,
    searching,
    ...props
  }) => {
    const camelCasedHits = useMemo(() => (
      memoizedCamelCaseObject(searchResults?.hits || [])
    ), [searchResults?.hits]);

    return (
      <WrappedComponent
        searchResults={searchResults}
        hits={camelCasedHits}
        isLoading={isSearchStalled || searching}
        {...props}
      />
    );
  });
}
