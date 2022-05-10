import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Index, Configure } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/';
import { useDefaultSearchFilters } from '../data/hooks';
import PopularResults from './PopularResults';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { NUM_RESULTS_TO_DISPLAY } from './data/constants';
import { getContentTypeFromTitle } from '../../utils/search';
import { SubsidyRequestsContext } from '../../enterprise-subsidy-requests';

const PopularResultsIndex = ({ title }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionPlan, subscriptionLicense, offers: { offers } } = useContext(UserSubsidyContext);
  const offerCatalogs = offers.map((offer) => offer.catalog);

  const { subsidyRequestConfiguration, catalogsForSubsidyRequests } = useContext(SubsidyRequestsContext);
  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    subscriptionPlan,
    subscriptionLicense,
    offerCatalogs,
    subsidyRequestConfiguration,
    catalogsForSubsidyRequests: [...catalogsForSubsidyRequests],
  });

  const config = getConfig();
  const contentType = getContentTypeFromTitle(title);
  const defaultFilter = `content_type:${contentType} AND ${filters}`;
  const searchConfig = {
    query: '',
    hitsPerPage: NUM_RESULTS_TO_DISPLAY,
    filters: defaultFilter,
  };
  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId={`popular-${title}`}>
      <Configure {...searchConfig} />
      <PopularResults title={title} />
    </Index>
  );
};

PopularResultsIndex.propTypes = {
  title: PropTypes.string.isRequired,
};

export default PopularResultsIndex;
