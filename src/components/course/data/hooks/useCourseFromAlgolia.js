import { useEffect, useState } from 'react';
import { camelCaseObject } from '@edx/frontend-platform/utils';
import { useAlgoliaSearch, useEnterpriseCustomer } from '../../../app/data';
import { getSupportedLocale } from '../../../app/data/utils';

/**
 * Custom hook to fetch course data from Algolia with language filtering.
 * This allows us to get language-specific content (e.g., Spanish descriptions)
 * based on the user's preferred language setting.
 *
 * @param {string} courseKey - The course key to search for in Algolia
 * @returns {Object} - Object containing algoliaCourse data and loading state
 */
export const useCourseFromAlgolia = (courseKey) => {
  const [algoliaCourse, setAlgoliaCourse] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { searchIndex, shouldUseSecuredAlgoliaApiKey } = useAlgoliaSearch();
  const currentLocale = getSupportedLocale();

  useEffect(() => {
    async function fetchCourseFromAlgolia() {
      // Only fetch from Algolia if language is not English (we want translated content)
      if (!searchIndex || !courseKey || currentLocale === 'en') {
        setIsLoading(false);
        return;
      }

      try {
        const facetFilters = [
          ['content_type:course'],
          `metadata_language:${currentLocale}`,
        ];
        if (!shouldUseSecuredAlgoliaApiKey) {
          facetFilters.push(`enterprise_customer_uuids:${enterpriseCustomer.uuid}`);
        }

        const { hits } = await searchIndex.search(courseKey, {
          facetFilters,
          hitsPerPage: 10,
        });

        const exactMatch = hits.find(hit => hit.key === courseKey);
        if (exactMatch) {
          setAlgoliaCourse(camelCaseObject(exactMatch));
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error fetching course from Algolia:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourseFromAlgolia();
  }, [courseKey, currentLocale, searchIndex, enterpriseCustomer, shouldUseSecuredAlgoliaApiKey]);

  return { algoliaCourse, isLoading };
};

export default useCourseFromAlgolia;
