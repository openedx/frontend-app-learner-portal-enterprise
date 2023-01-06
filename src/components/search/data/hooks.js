import {
  useContext, useMemo, useEffect, useCallback,
} from 'react';
import {
  SearchContext, getCatalogString, SHOW_ALL_NAME, setRefinementAction,
} from '@edx/frontend-enterprise-catalog-search';
import { features } from '../../../config';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';
import { pushEvent, EVENTS } from '../../../utils/optimizely';

// How long to delay an event, so that we allow enough time for any async analytics event call to resolve
const CLICK_DELAY_MS = 300; // 300ms replicates Segment's ``trackLink`` function

export const useSearchCatalogs = ({
  subscriptionPlan,
  subscriptionLicense,
  couponCodes,
  enterpriseOffers,
  catalogsForSubsidyRequests,
}) => {
  const searchCatalogs = useMemo(() => {
    const catalogs = [];

    // Scope to catalogs from coupons, enterprise offers, or subscription plan associated with learner's license
    if (subscriptionPlan && subscriptionLicense?.status === LICENSE_STATUS.ACTIVATED) {
      catalogs.push(subscriptionPlan.enterpriseCatalogUuid);
    }
    if (features.ENROLL_WITH_CODES) {
      catalogs.push(...couponCodes.map((couponCode) => couponCode.catalog));
    }
    if (features.FEATURE_ENROLL_WITH_ENTERPRISE_OFFERS) {
      catalogs.push(...enterpriseOffers.map((offer) => offer.enterpriseCatalogUuid));
    }

    // Scope to catalogs associated with assignable subsidies if browse and request is turned on
    catalogs.push(...catalogsForSubsidyRequests);

    return catalogs;
  }, [
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    catalogsForSubsidyRequests,
  ]);

  return searchCatalogs;
};

export const useDefaultSearchFilters = ({
  enterpriseConfig,
  searchCatalogs,
}) => {
  const { refinements, dispatch } = useContext(SearchContext);
  const showAllRefinement = refinements[SHOW_ALL_NAME];

  useEffect(() => {
    // default to showing all catalogs if there are no confined search catalogs
    if (searchCatalogs.length === 0 && !showAllRefinement) {
      dispatch(setRefinementAction(SHOW_ALL_NAME, 1));
    }
  }, [dispatch, searchCatalogs, showAllRefinement]);

  const filters = useMemo(
    () => {
      // Show all enterprise catalogs
      if (showAllRefinement) {
        return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
      }

      if (searchCatalogs.length > 0) {
        return getCatalogString(searchCatalogs);
      }

      // If the learner is not confined to certain catalogs, scope to all of the enterprise's catalogs
      return `enterprise_customer_uuids:${enterpriseConfig.uuid}`;
    },
    [enterpriseConfig.uuid, searchCatalogs, showAllRefinement],
  );

  return { filters };
};

/**
 * Returns a function to be used as a click handler emitting an optimizely event on course about page visit click event.
 *
 * @returns Click handler function for course about page visit click events.
 */
export const useCourseAboutPageVisitClickHandler = ({ href, courseKey, enterpriseId }) => {
  const handleClick = useCallback(
    (e) => {
      // If tracking is on a link with an external href destination, we must intentionally delay the default click
      // behavior to allow enough time for the async analytics event call to resolve.
      if (href) {
        e.preventDefault();
        setTimeout(() => {
          global.location.href = href;
        }, CLICK_DELAY_MS);
      }
      // Send the Optimizely event to track the course about page visit
      pushEvent(EVENTS.COURSE_ABOUT_PAGE_CLICK, { courseKey, enterpriseId });
    },
    [href, courseKey, enterpriseId],
  );

  return handleClick;
};
