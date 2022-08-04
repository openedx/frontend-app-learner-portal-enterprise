import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Index, Configure } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/';
import { useDefaultSearchFilters, useSearchCatalogs } from '../data/hooks';
import PopularResults from './PopularResults';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { NUM_RESULTS_TO_DISPLAY } from './data/constants';
import { getContentTypeFromTitle } from '../../utils/search';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

function PopularResultsIndex({ title, numberResultsToDisplay }) {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    subscriptionPlan, subscriptionLicense, couponCodes: { couponCodes }, enterpriseOffers,
  } = useContext(UserSubsidyContext);

  const { catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);
  const searchCatalogs = useSearchCatalogs({
    subscriptionPlan,
    subscriptionLicense,
    couponCodes,
    enterpriseOffers,
    catalogsForSubsidyRequests,
  });

  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    searchCatalogs,
  });
  const config = getConfig();
  const contentType = getContentTypeFromTitle(title);
  const defaultFilter = `content_type:${contentType} AND ${filters}`;
  const searchConfig = {
    query: '',
    hitsPerPage: numberResultsToDisplay,
    filters: defaultFilter,
  };
  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId={`popular-${title}`}>
      <Configure {...searchConfig} />
      <PopularResults title={title} numberResultsToDisplay={numberResultsToDisplay} />
    </Index>
  );
}

PopularResultsIndex.propTypes = {
  title: PropTypes.string.isRequired,
  numberResultsToDisplay: PropTypes.number,
};

PopularResultsIndex.defaultProps = {
  numberResultsToDisplay: NUM_RESULTS_TO_DISPLAY,
};

export default PopularResultsIndex;
