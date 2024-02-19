import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { FormattedMessage } from '@edx/frontend-platform/i18n';
import {
  Button, breakpoints, MediaQuery,
} from '@openedx/paragon';
import PropTypes from 'prop-types';

import { CourseEnrollments } from './course-enrollments';

import SupportInformation from '../sidebar/SupportInformation';
import SubsidiesSummary from '../sidebar/SubsidiesSummary';
import CourseRecommendations from './CourseRecommendations';

const DashboardMainContent = ({ canOnlyViewHighlightSets }) => {
  const {
    enterpriseConfig: {
      name,
      slug,
      disableSearch,
    },
  } = useContext(AppContext);
  return (
    <>
      <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
        {matches => (matches ? (
          <SubsidiesSummary />
        ) : null)}
      </MediaQuery>
      <CourseEnrollments>
        {/* The children below will only be rendered if there are no course enrollments. */}
        {disableSearch ? (
          <p>
            <FormattedMessage
              id="enterprise.dashboard.tab.courses.no.enrollments"
              defaultMessage="You are not enrolled in any courses sponsored by {enterpriseName}. Reach out to your administrator for instructions on how to start learning with edX!"
              description="Message shown to a learner on enterprise dashboard when there are no enrollments."
              values={{
                enterpriseName: name,
              }}
            />
          </p>
        ) : (
          <>
            <p>
              <FormattedMessage
                id="enterprise.dashboard.tab.courses.default.message"
                defaultMessage="Getting started with edX is easy. Simply find a course from your catalog, request enrollment, and get started on your learning journey."
                description="Default message shown to a learner on enterprise dashboard."
              />
            </p>
            <Button
              as={Link}
              to={`/${slug}/search`}
              className="btn-brand-primary d-block d-md-inline-block"
            >
              <FormattedMessage
                id="enterprise.dashboard.tab.courses.find.course"
                defaultMessage="Find a course"
                description="Label for Find a course button on enterprise dashboard's courses tab."
              />

            </Button>

            <br />
            {canOnlyViewHighlightSets === false && <CourseRecommendations />}
          </>
        )}
      </CourseEnrollments>

      <MediaQuery maxWidth={breakpoints.medium.maxWidth}>
        {matches => (matches ? <SupportInformation className="mt-5" /> : null)}
      </MediaQuery>
    </>
  );
};

DashboardMainContent.propTypes = {
  canOnlyViewHighlightSets: PropTypes.bool,
};

DashboardMainContent.defaultProps = {
  canOnlyViewHighlightSets: false,
};

export default DashboardMainContent;
