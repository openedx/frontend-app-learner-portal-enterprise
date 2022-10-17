import { useContext, useEffect, useMemo } from 'react';
import {
  getCatalogString,
  SearchContext,
  setRefinementAction,
  SHOW_ALL_NAME,
} from '@edx/frontend-enterprise-catalog-search';
import { features } from '../../../config';
import { LICENSE_STATUS } from '../../enterprise-user-subsidy/data/constants';

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

// TODO: This hook will be fetching course recommendations data from backend.
export const useRecommendedCourses = () => [
  {
    courseKey: 'HarvardX+CS50x',
    title: 'CS50\'s Introduction to Computer Science',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/da1b2400-322b-459b-97b0-0c557f05d017-3b9fb73b5d5d.small.jpg',
    marketingUrl: 'course/HarvardX+CS50x',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
    partners: [
      {
        name: 'Harvard University',
      },
    ],
  },
  {
    courseKey: 'HarvardX+CS50W',
    title: 'CS50\'s Web Programming with Python and JavaScript',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/8f8e5124-1dab-47e6-8fa6-3fbdc0738f0a-762af069070e.small.jpg',
    marketingUrl: 'course/HarvardX+CS50W',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
    partners: [
      {
        name: 'Harvard University',
      },
    ],
  },
  {
    courseKey: 'UQx+IELTSx',
    title: 'IELTS Academic Test Preparation',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/d61d7a1f-3333-4169-a786-92e2bf690c6f-fa8a6909baec.small.jpg',
    marketingUrl: 'course/UQx+IELTSx',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/8554749f-b920-4d7f-8986-af6bb95290aa-f336c6a2ca11.png',
    partners: [
      {
        name: 'The University of Queensland',
      },
    ],
  },
  {
    courseKey: 'ETSx+TOEFLx',
    title: 'TOEFL® Test Preparation: The Insider’s Guide',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/ee4f4f12-e6ec-45ac-94df-b90b4b022903-aaf6257f767b.small.jpeg',
    marketingUrl: 'course/ETSx+TOEFLx',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/9d9e1a30-c34d-4ad1-8c5a-d2410db8c123-8beea336c2a4.png',
    partners: [
      {
        name: 'Educational Testing Service',
      },
    ],
  },
  {
    courseKey: 'HarvardX+PH125.1x',
    title: 'Data Science: R Basics',
    cardImageUrl: 'https://prod-discovery.edx-cdn.org/media/course/image/91f52ef3-fa3f-4934-9d19-8d5a32635cd4-d99e27f09d19.small.jpg',
    marketingUrl: 'course/HarvardX+PH125.1x',
    partnerImageUrl: 'https://prod-discovery.edx-cdn.org/organization/logos/44022f13-20df-4666-9111-cede3e5dc5b6-2cc39992c67a.png',
    partners: [
      {
        name: 'Harvard University',
      },
    ],
  },
];
