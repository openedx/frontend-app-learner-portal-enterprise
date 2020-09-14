import React, { useContext, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import moment from 'moment';
import qs from 'query-string';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Button } from '@edx/paragon';

import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { CourseContext } from './CourseContextProvider';
import { fetchOffers } from '../dashboard/sidebar/offers';

import {
  COURSE_AVAILABILITY_MAP,
  ENROLL_BUTTON_LABEL_COMING_SOON,
  ENROLL_BUTTON_LABEL_NOT_AVAILABLE,
  ENROLLMENT_FAILED_QUERY_PARAM,
  COURSE_MODES_MAP,
} from './data/constants';
import {
  hasCourseStarted,
  isUserEnrolledInCourse,
  isUserEntitledForCourse,
  isCourseSelfPaced,
  hasTimeToComplete,
  isArchived,
} from './data/utils';

import EnrollModal from './EnrollModal';

const getBestCourseMode = (courseModes) => {
  const {
    VERIFIED, PROFESSIONAL, NO_ID_PROFESSIONAL, AUDIT,
  } = COURSE_MODES_MAP;
  /** Returns the 'highest' course mode available.
    *  Modes are ranked ['verified', 'professional', 'no-id-professional', 'audit'] */
  if (courseModes.includes(VERIFIED)) {
    return VERIFIED;
  } if (courseModes.includes(PROFESSIONAL)) {
    return PROFESSIONAL;
  } if (courseModes.includes(NO_ID_PROFESSIONAL)) {
    return NO_ID_PROFESSIONAL;
  }
  return AUDIT;
};

const findHighestLevelSeatSku = (seats) => {
  /** Returns the first seat found from the preferred course mode */
  if (!seats || seats.length <= 0) {
    return null;
  }
  const courseModes = seats.map(seat => seat.type);
  const courseMode = getBestCourseMode(courseModes);
  return seats.find((seat) => seat.type === courseMode).sku;
};

export const getEnrollmentUrl = ({
  enterpriseConfig,
  key,
  location,
  offers,
  offersCount,
  offersLoading,
  sku,
  subscriptionLicense,
}) => {
  const baseEnrollmentOptions = {
    next: `${process.env.LMS_BASE_URL}/courses/${key}/course`,
    // Redirect back to the same page with a failure query param
    failure_url: `${global.location}/?${ENROLLMENT_FAILED_QUERY_PARAM}=true`,
  };
  if (subscriptionLicense) {
    const enrollmentFailedParams = { ...qs.parse(location.search) };
    enrollmentFailedParams[ENROLLMENT_FAILED_QUERY_PARAM] = true;
    const coursePageUrl = `${process.env.BASE_URL}${location.pathname}`;

    const enrollOptions = {
      ...baseEnrollmentOptions,
      license_uuid: subscriptionLicense.uuid,
      course_id: key,
      enterprise_customer_uuid: enterpriseConfig.uuid,
      next: `${process.env.LMS_BASE_URL}/courses/${key}/course`,
      // Redirect back to the same page with a failure query param
      failure_url: `${coursePageUrl}?${qs.stringify(enrollmentFailedParams)}`,
    };
    return `${process.env.LMS_BASE_URL}/enterprise/grant_data_sharing_permissions/?${qs.stringify(enrollOptions)}`;
  }
  if (!offersLoading && offersCount >= 0 && sku) {
    const enrollOptions = {
      ...baseEnrollmentOptions,
      sku,
    };
    if (offersCount === 0) {
      return `${process.env.ECOMMERCE_BASE_URL}/basket/add/?${qs.stringify(enrollOptions)}`;
    }
    enrollOptions.code = offers[0].code;
    return `${process.env.ECOMMERCE_BASE_URL}/coupons/redeem/?${qs.stringify(enrollOptions)}`;
  }
  // If offers are loading or the SKU is not present, the course cannot be enrolled in
  return null;
};

export default function EnrollButton() {
  const { state: courseData } = useContext(CourseContext);
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense } = useContext(UserSubsidyContext);
  const location = useLocation();
  const dispatch = useDispatch();

  // TODO: Set a timestamp for when offers have been last loaded, to avoid extra calls
  const { offers, offersCount, loading: offersLoading } = useSelector(store => store.offers);
  useMemo(() => {
    if (!offersLoading) {
      dispatch(fetchOffers('full_discount_only=True'));
    }
  }, []);

  const {
    activeCourseRun,
    userEnrollments,
    userEntitlements,
  } = courseData;
  const {
    availability,
    key,
    start,
    isEnrollable,
    pacingType,
    courseUuid,
    seats,
  } = activeCourseRun;

  const enrollLinkClass = 'btn-success btn-block rounded-0 py-2';
  const sku = useMemo(
    () => findHighestLevelSeatSku(seats),
    [seats],
  );
  const isCourseStarted = useMemo(
    () => hasCourseStarted(start),
    [start],
  );

  const isUserEnrolled = useMemo(
    () => isUserEnrolledInCourse({ userEnrollments, key }),
    [userEnrollments, key],
  );

  // TODO: ensure that the code being given is relevant to the catalog of the course.
  const enrollmentUrl = useMemo(
    () => getEnrollmentUrl({
      enterpriseConfig,
      key,
      location,
      offers,
      offersCount,
      offersLoading,
      sku,
      subscriptionLicense,
    }),
    [enterpriseConfig, key, location, offers, offersCount, offersLoading, sku, subscriptionLicense],
  );

  // See https://openedx.atlassian.net/wiki/spaces/WS/pages/1045200922/Enroll+button+and+Course+Run+Selector+Logic
  // for more detailed documentation on the enroll button labeling based off course run states.
  const renderButtonLabel = () => {
    if (!isEnrollable) {
      const availabilityStates = [
        COURSE_AVAILABILITY_MAP.UPCOMING,
        COURSE_AVAILABILITY_MAP.STARTING_SOON,
      ];
      return availability in availabilityStates
        ? ENROLL_BUTTON_LABEL_COMING_SOON
        : ENROLL_BUTTON_LABEL_NOT_AVAILABLE;
    }
    if (!isUserEnrolled) {
      if (isUserEntitledForCourse({ userEntitlements, courseUuid })) {
        return <span className="enroll-btn-label">View on Dashboard</span>;
      }
      if (isCourseSelfPaced(pacingType)) {
        if (isCourseStarted && hasTimeToComplete(activeCourseRun) && !isArchived(activeCourseRun)) {
          return (
            <>
              <span className="enroll-btn-label">Enroll</span>
              <div><small>Starts {moment().format('MMM D, YYYY')}</small></div>
            </>
          );
        }
        return <span className="enroll-btn-label">Enroll</span>;
      }
      return (
        <>
          <span className="enroll-btn-label">Enroll</span>
          <div>
            <small>
              {isCourseStarted ? 'Started' : 'Starts'}
              {' '}
              {moment(start).format('MMM D, YYYY')}
            </small>
          </div>
        </>
      );
    }
    if (isUserEnrolled && !isCourseStarted) {
      return <span className="enroll-btn-label">You are Enrolled</span>;
    }
    return <span className="enroll-btn-label">View Course</span>;
  };

  const DefaultEnrollCta = useMemo(
    () => props => (
      <Button {...props}>
        {renderButtonLabel()}
      </Button>
    ),
    [],
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  const renderEnrollCta = () => {
    if (!isUserEnrolled && isEnrollable) {
      if (enrollmentUrl && subscriptionLicense) {
        return (
          <a
            className={classNames('btn', enrollLinkClass)}
            href={enrollmentUrl}
          >
            {renderButtonLabel()}
          </a>
        );
      } if (enrollmentUrl) {
        return (
          <>
            <Button
              className={classNames('btn', enrollLinkClass)}
              onClick={() => setIsModalOpen(true)}
            >
              {renderButtonLabel()}
            </Button>
            <EnrollModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              offersCount={offersCount}
              enrollmentUrl={enrollmentUrl}
            />
          </>
        );
      }
      return <DefaultEnrollCta className={classNames(enrollLinkClass, 'disabled')} />;
    }

    if (!isUserEnrolled && !isEnrollable) {
      return (
        <div className="alert alert-secondary text-center rounded-0">
          {renderButtonLabel()}
        </div>
      );
    }

    if (isUserEnrolled) {
      if (isCourseStarted) {
        return (
          <a
            className={classNames('btn', enrollLinkClass)}
            href={`${process.env.LMS_BASE_URL}/courses/${key}/info`}
          >
            {renderButtonLabel()}
          </a>
        );
      }

      return (
        <Link
          className={classNames('btn', enrollLinkClass)}
          to={`/${enterpriseConfig.slug}`}
        >
          {renderButtonLabel()}
        </Link>
      );
    }

    return <DefaultEnrollCta className={enrollLinkClass} />;
  };

  return (
    <div className="enroll-wrapper mb-3" style={{ width: 270 }}>
      {renderEnrollCta()}
    </div>
  );
}
