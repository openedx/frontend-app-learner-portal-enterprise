import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { Index, Configure } from 'react-instantsearch-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/';
import { useDefaultSearchFilters } from '../data/hooks';
import PopularCourses from './PopularCourses';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { CONTENT_TYPE_COURSE, CONTENT_TYPE_PROGRAM, COURSE_TITLE } from '../constants';
import { NUM_RESULTS_TO_DISPLAY } from './data/constants';

const PopularCoursesIndex = ({ title }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionPlan, subscriptionLicense, offers: { offers } } = useContext(UserSubsidyContext);
  const offerCatalogs = offers.map((offer) => offer.catalog);
  const { filters } = useDefaultSearchFilters({
    enterpriseConfig,
    subscriptionPlan,
    subscriptionLicense,
    offerCatalogs,
  });
  const config = getConfig();
  const contentType = title === COURSE_TITLE ? CONTENT_TYPE_COURSE : CONTENT_TYPE_PROGRAM;
  const defaultFilter = `content_type:${contentType} AND ${filters}`;
  const searchConfig = {
    query: '',
    hitsPerPage: NUM_RESULTS_TO_DISPLAY,
    filters: defaultFilter,
  };
  return (
    <Index indexName={config.ALGOLIA_INDEX_NAME} indexId={`popular-${title}`}>
      <Configure {...searchConfig} />
      <PopularCourses title={title} />
    </Index>
  );
};

PopularCoursesIndex.propTypes = {
  title: PropTypes.string.isRequired,
};

export default PopularCoursesIndex;
