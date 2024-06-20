import { Suspense, useState } from 'react';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { Bubble, Collapsible, Skeleton } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';

import {
  InProgressCourseCard,
  UpcomingCourseCard,
  CompletedCourseCard,
  SavedForLaterCourseCard,
  RequestedCourseCard,
  AssignedCourseCard,
} from './course-cards';

import { COURSE_STATUSES, COURSE_MODES } from '../../../../constants';
import { COURSE_SECTION_TITLES } from '../../data/constants';
import { useEnterpriseCustomer } from '../../../app/data';
import DelayedFallbackContainer from '../../../DelayedFallback/DelayedFallbackContainer';

const CARD_COMPONENT_BY_COURSE_STATUS = {
  [COURSE_STATUSES.upcoming]: UpcomingCourseCard,
  [COURSE_STATUSES.inProgress]: InProgressCourseCard,
  [COURSE_STATUSES.completed]: CompletedCourseCard,
  [COURSE_STATUSES.savedForLater]: SavedForLaterCourseCard,
  [COURSE_STATUSES.requested]: RequestedCourseCard,
  [COURSE_STATUSES.assigned]: AssignedCourseCard,
};

const CourseSection = ({
  courseRuns,
  title,
  subtitle,
}) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const [isOpen, setIsOpen] = useState(true);

  const getCoursesCount = (coursesCount) => {
    if (isOpen) {
      return null;
    }
    if ([COURSE_SECTION_TITLES.assigned, COURSE_SECTION_TITLES.firstTimeUserAndAssigned].includes(title)) {
      return <Bubble variant="error" className="ml-2">{coursesCount}</Bubble>;
    }
    return `(${coursesCount})`;
  };

  const getFormattedSectionTitle = () => {
    const sectionTitle = isOpen ? title : `${title} `;
    const coursesCount = getCoursesCount(courseRuns.length);
    return (
      <h3 className="d-flex align-items-center">
        {sectionTitle}
        {coursesCount}
      </h3>
    );
  };

  const getFormattedOptionalSubtitle = () => {
    if (!subtitle) { return null; }
    return <p className="mt-3 mb-0">{subtitle}</p>;
  };

  const getCourseRunProps = ({
    linkToCertificate,
    notifications,
    courseRunStatus,
    isRevoked,
    mode,
    ...rest
  }) => {
    const courseRunProps = { courseRunStatus };
    switch (courseRunStatus) {
      case COURSE_STATUSES.inProgress:
        courseRunProps.linkToCertificate = linkToCertificate;
        courseRunProps.notifications = notifications;
        courseRunProps.canUpgradeToVerifiedEnrollment = [COURSE_MODES.AUDIT, COURSE_MODES.HONOR].includes(mode);
        break;
      case COURSE_STATUSES.savedForLater:
        courseRunProps.isRevoked = isRevoked;
        break;
      case COURSE_STATUSES.completed:
        courseRunProps.linkToCertificate = linkToCertificate;
        break;
      default:
        break;
    }
    return {
      ...courseRunProps,
      ...rest,
    };
  };

  const handleCollapsibleToggle = (newValue) => {
    setIsOpen(newValue);
    sendEnterpriseTrackEvent(
      enterpriseCustomer.uuid,
      'edx.ui.enterprise.learner_portal.section.toggled',
      {
        is_open: newValue,
        section_title: title,
      },
    );
  };

  const renderCourseCards = () => courseRuns.map(courseRun => {
    const Component = CARD_COMPONENT_BY_COURSE_STATUS[courseRun.courseRunStatus];
    return (
      <Component
        {...getCourseRunProps(courseRun)}
        key={courseRun.courseRunId}
      />
    );
  });

  if (!courseRuns || courseRuns.length === 0) {
    return null;
  }

  return (
    <div className="course-section mb-4">
      <Collapsible
        styling="card"
        title={getFormattedSectionTitle()}
        onOpen={() => handleCollapsibleToggle(true)}
        onClose={() => handleCollapsibleToggle(false)}
        defaultOpen
      >
        {getFormattedOptionalSubtitle()}
        <Suspense fallback={(
          <DelayedFallbackContainer>
            <>
              <div className="sr-only">Loading...</div>
              {courseRuns.map(() => <Skeleton key={uuidv4()} height={200} className="dashboard-course-card py-3 mb-2" />)}
            </>
          </DelayedFallbackContainer>
        )}
        >
          {renderCourseCards()}
        </Suspense>
      </Collapsible>
    </div>
  );
};

CourseSection.propTypes = {
  courseRuns: PropTypes.arrayOf(PropTypes.shape({
    courseRunId: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    linkToCourse: PropTypes.string.isRequired,
    notifications: PropTypes.arrayOf(PropTypes.shape({
      url: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
    })).isRequired,
    microMastersTitle: PropTypes.string,
    mode: PropTypes.oneOf(Object.values(COURSE_MODES)),
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    linkToCertificate: PropTypes.string,
    hasEmailsEnabled: PropTypes.bool,
  })).isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

CourseSection.defaultProps = {
  subtitle: null,
};

export default CourseSection;
