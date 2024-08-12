import { defineMessages } from '@edx/frontend-platform/i18n';
import { getSearchFacetFilters as getBaseSearchFacetFilters } from '@edx/frontend-enterprise-catalog-search';
import { features } from '../../config';
import { LICENSE_STATUS } from '../enterprise-user-subsidy/data/constants';

export function isShortCourse(course) {
  return course.course_length === 'short';
}

const messages = defineMessages({
  programsTitle: {
    id: 'search.facetFilters.programs.title',
    defaultMessage: 'Program',
    description: 'Title for the programs facet filter',
  },
  programsTypeaheadPlaceholder: {
    id: 'search.facetFilters.programs.typeahead.placeholder',
    defaultMessage: 'Find a program...',
    description: 'Placeholder for the programs typeahead input',
  },
  programsTypeaheadAriaLabel: {
    id: 'search.facetFilters.programs.typeahead.aria.label',
    defaultMessage: 'Type to find a program',
    description: 'Aria label for the programs typeahead input',
  },
});

export function getSearchFacetFilters(intl) {
  const searchFilters = getBaseSearchFacetFilters(intl);

  const OVERRIDE_FACET_FILTERS = [];
  if (features.PROGRAM_TYPE_FACET) {
    const PROGRAM_TYPE_FACET_OVERRIDE = {
      overrideSearchKey: 'title',
      overrideSearchValue: intl.formatMessage(messages.programsTitle),
      updatedFacetFilterValue: {
        attribute: 'program_type',
        title: intl.formatMessage(messages.programsTitle),
        isSortedAlphabetical: true,
        typeaheadOptions: {
          placeholder: intl.formatMessage(messages.programsTypeaheadPlaceholder),
          ariaLabel: intl.formatMessage(messages.programsTypeaheadAriaLabel),
          minLength: 3,
        },
      },
    };
    OVERRIDE_FACET_FILTERS.push(PROGRAM_TYPE_FACET_OVERRIDE);
  }

  OVERRIDE_FACET_FILTERS.forEach(({ overrideSearchKey, overrideSearchValue, updatedFacetFilterValue }) => {
    searchFilters.find((facetFilter, index) => {
      if (facetFilter[overrideSearchKey] === overrideSearchValue) {
        searchFilters[index] = updatedFacetFilterValue;
        return true;
      }
      return false;
    });
  });

  return searchFilters;
}

export const hasActivatedAndCurrentSubscription = (subscriptionLicense) => (
  subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED
  && subscriptionLicense?.subscriptionPlan?.isCurrent
);
