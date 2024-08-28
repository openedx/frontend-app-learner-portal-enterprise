import { Suspense, useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { sendEnterpriseTrackEvent } from '@edx/frontend-enterprise-utils';
import { Bubble, Collapsible, Skeleton, ProgressBar } from '@openedx/paragon';
import { v4 as uuidv4 } from 'uuid';
import { getProgressTabData } from './course-cards/mark-complete-modal/data/service';

import {
  AssignedCourseCard,
  CompletedCourseCard,
  InProgressCourseCard,
  RequestedCourseCard,
  SavedForLaterCourseCard,
  UpcomingCourseCard,
} from './course-cards';

import { COURSE_STATUSES } from '../../../../constants';
import { COURSE_SECTION_TITLES } from '../../data/constants';
import { COURSE_MODES_MAP, isEnrollmentUpgradeable, useEnterpriseCustomer } from '../../../app/data';
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
    ...rest
  }) => {
    const courseRunProps = { courseRunStatus };
    switch (courseRunStatus) {
      case COURSE_STATUSES.inProgress:
        courseRunProps.linkToCertificate = linkToCertificate;
        courseRunProps.notifications = notifications;
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
  
  const [progress, setProgress] = useState({});
  const fetchData = useCallback(
    async (courseRun) => {
      try {
        const result = await getProgressTabData(courseRun);
        setProgress(result);
      } catch (error) {
        console.log(error);
      }
    },
    [],
  );

  const renderCourseCards = () => courseRuns.map(courseRun => {
    const Component = CARD_COMPONENT_BY_COURSE_STATUS[courseRun.courseRunStatus];
    const isAuditEnrollment = isEnrollmentUpgradeable(courseRun);
    useEffect(() => {
      fetchData(courseRun.courseRunId);
    }, [fetchData]);

    if (isAuditEnrollment && courseRun.courseRunStatus === COURSE_STATUSES.inProgress) {
      return (
        <Suspense
          key={courseRun.courseRunId}
          fallback={(
            <DelayedFallbackContainer className="dashboard-course-card border-bottom py-3 mb-2">
              <div className="sr-only">Loading...</div>
              <Skeleton key={uuidv4()} height={200} />
            </DelayedFallbackContainer>
          )}
        >
          <Component {...getCourseRunProps(courseRun)} />
        </Suspense>
      );
    }
  
    const numTotalUnits = progress?.completionSummary?.completeCount + progress?.completionSummary?.incompleteCount + progress?.completionSummary?.lockedCount;
    const completePercentage = progress?.completionSummary?.completeCount ? Number(((progress?.completionSummary?.completeCount / numTotalUnits) * 100).toFixed(0)) : 0;
    console.log(completePercentage)
    return (
      <div>
        <Component
          {...getCourseRunProps(courseRun)}
          key={courseRun.courseRunId}
        />
        <ProgressBar now={`${completePercentage}%`} label={`${completePercentage}%`} variant="primary" />
        <br />
      </div>

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
        <div className="my-n2">
          {getFormattedOptionalSubtitle()}
          {renderCourseCards()}
        </div>
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
    mode: PropTypes.oneOf(Object.values(COURSE_MODES_MAP)),
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
