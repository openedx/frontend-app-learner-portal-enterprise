import { useMemo } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { connectStateResults } from 'react-instantsearch-dom';
import { DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE } from '../skills-quiz/constants';

export function withCamelCasedStateResults(WrappedComponent) {
  return connectStateResults(({
    searchResults, isSearchStalled, searching, ...props
  }) => {
    const camelCasedHits = useMemo(() => camelCaseObject(searchResults?.hits || []), [searchResults]);
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

export function checkValidGoalAndJobSelected(goal, jobs, checkGoalIsImprove) {
  const goalIsValid = checkGoalIsImprove === (goal === DROPDOWN_OPTION_IMPROVE_CURRENT_ROLE);

  return goalIsValid && jobs?.length > 0;
}

/**
 * Validates that all and only the specified filter values exist in their corresponding
 * disjunctive facet `data` entries.
 *
 * This function performs a strict validation for each facet referenced in the `filters` array:
 * 1. Confirms that a corresponding facet exists in `disjunctiveFacets`.
 * 2. Verifies that every `value` in `filters` is present in the corresponding facet's `.data`.
 * 3. Ensures there are no extra values in that facet's `.data` beyond those defined in `filters`.
 *
 * Extra facets in `disjunctiveFacets` (i.e., not referenced in `filters`) are ignored.
 *
 * @param {Array<{ key: string, value: string }>} filters - An array of filter objects,
 *   where `key` corresponds to the facet name (e.g., "name", "industry_names") and
 *   `value` corresponds to the desired filter value (e.g., "Software Engineer").
 *   Example:
 *     [
 *       { key: 'name', value: 'Software Engineer' },
 *       { key: 'name', value: 'ASP.NET Engineer' },
 *     ]
 *
 * @param {Array<{ name: string, data: Record<string, any> }>} disjunctiveFacets - An array
 *   of facet objects returned from search metadata. Each object contains a `name`
 *   (e.g., "name") and a `data` object where keys represent available facet values.
 *   Example:
 *     [
 *       {
 *         name: 'name',
 *         data: {
 *           'Software Engineer': 1,
 *           'ASP.NET Engineer': 1
 *         }
 *       }
 *     ]
 *
 * @returns {boolean} - Returns `true` if all specified filters match exactly with
 *   their corresponding facet’s `data` (no missing or extra entries); otherwise, `false`.
 */
export function validateDisjunctiveFacets(filters, disjunctiveFacets) {
  const uniqueKeys = [...new Set(filters.map(f => f.key))];

  for (const key of uniqueKeys) {
    const facet = disjunctiveFacets.find(f => f.name === key);
    if (!facet) { return false; }

    const expectedValues = filters
      .filter(f => f.key === key)
      .map(f => f.value);

    for (const val of expectedValues) {
      if (!(val in facet.data)) { return false; }
    }

    const facetKeys = Object.keys(facet.data);

    if (facetKeys.length !== expectedValues.length) { return false; }

    for (const facetKey of facetKeys) {
      if (!expectedValues.includes(facetKey)) { return false; }
    }
  }

  return true;
}
