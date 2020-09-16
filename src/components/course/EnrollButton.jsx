import React, { useContext, useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import classNames from 'classnames';
import qs from 'query-string';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Button } from '@edx/paragon';

import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { CourseContext } from './CourseContextProvider';
import { fetchOffers } from '../dashboard/sidebar/offers';

import {
  ENROLLMENT_FAILED_QUERY_PARAM,
  COURSE_MODES_MAP,
} from './data/constants';
import {
  hasCourseStarted,
  isUserEnrolledInCourse,
} from './data/utils';

import EnrollButtonLabel from './EnrollButtonLabel';
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

const findOfferForCourse = (offers, catalogList) => {
  const offerIndex = offers.findIndex((offer) => catalogList.includes(offer.catalog));
  if (offerIndex !== -1) {
    return offers[offerIndex];
  }
  return null;
};

export const getEnrollmentUrl = ({
  catalogList,
  enterpriseConfig,
  key,
  location,
  offers,
  offersCount,
  offersLoading,
  sku,
  subscriptionLicense,
}) => {
  const enrollmentFailedParams = { ...qs.parse(location.search) };
  enrollmentFailedParams[ENROLLMENT_FAILED_QUERY_PARAM] = true;
  const coursePageUrl = `${process.env.BASE_URL}${location.pathname}`;
  const baseEnrollmentOptions = {
    next: `${process.env.LMS_BASE_URL}/courses/${key}/course`,
    // Redirect back to the same page with a failure query param
    failure_url: `${coursePageUrl}?${qs.stringify(enrollmentFailedParams)}`,
  };
  if (subscriptionLicense) {
    const enrollOptions = {
      ...baseEnrollmentOptions,
      license_uuid: subscriptionLicense.uuid,
      course_id: key,
      enterprise_customer_uuid: enterpriseConfig.uuid,
    };
    return `${process.env.LMS_BASE_URL}/enterprise/grant_data_sharing_permissions/?${qs.stringify(enrollOptions)}`;
  }
  if (!offersLoading && offersCount >= 0 && sku) {
    const enrollOptions = {
      ...baseEnrollmentOptions,
      sku,
    };
    // get the index of the first offer that applies to a catalog that the course is in
    const offerForCourse = findOfferForCourse(offers, catalogList);
    if (offersCount === 0 || !offerForCourse) {
      return `${process.env.ECOMMERCE_BASE_URL}/basket/add/?${qs.stringify(enrollOptions)}`;
    }
    enrollOptions.code = offerForCourse.code;
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
    catalog: { catalogList },
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

  const enrollmentUrl = useMemo(
    () => getEnrollmentUrl({
      catalogList,
      enterpriseConfig,
      key,
      location,
      offers,
      offersCount,
      offersLoading,
      sku,
      subscriptionLicense,
    }),
    [catalogList, enterpriseConfig, key, location, offers, offersCount, offersLoading, sku, subscriptionLicense],
  );

  const DefaultEnrollCta = useMemo(
    () => props => (
      <Button {...props}>
        <EnrollButtonLabel
          activeCourseRun={activeCourseRun}
          availability={availability}
          courseUuid={courseUuid}
          isCourseStarted={isCourseStarted}
          isEnrollable={isEnrollable}
          isUserEnrolled={isUserEnrolled}
          pacingType={pacingType}
          start={start}
          userEntitlements={userEntitlements}
        />
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
            <EnrollButtonLabel
              activeCourseRun={activeCourseRun}
              availability={availability}
              courseUuid={courseUuid}
              isCourseStarted={isCourseStarted}
              isEnrollable={isEnrollable}
              isUserEnrolled={isUserEnrolled}
              pacingType={pacingType}
              start={start}
              userEntitlements={userEntitlements}
            />
          </a>
        );
      } if (enrollmentUrl) {
        return (
          <>
            <Button
              className={classNames('btn', enrollLinkClass)}
              onClick={() => setIsModalOpen(true)}
            >
              <EnrollButtonLabel
                activeCourseRun={activeCourseRun}
                availability={availability}
                courseUuid={courseUuid}
                isCourseStarted={isCourseStarted}
                isEnrollable={isEnrollable}
                isUserEnrolled={isUserEnrolled}
                pacingType={pacingType}
                start={start}
                userEntitlements={userEntitlements}
              />
            </Button>
            <EnrollModal
              isModalOpen={isModalOpen}
              setIsModalOpen={setIsModalOpen}
              offersCount={offersCount}
              courseHasOffer={!!findOfferForCourse(offers, catalogList)}
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
          <EnrollButtonLabel
            activeCourseRun={activeCourseRun}
            availability={availability}
            courseUuid={courseUuid}
            isCourseStarted={isCourseStarted}
            isEnrollable={isEnrollable}
            isUserEnrolled={isUserEnrolled}
            pacingType={pacingType}
            start={start}
            userEntitlements={userEntitlements}
          />
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
            <EnrollButtonLabel
              activeCourseRun={activeCourseRun}
              availability={availability}
              courseUuid={courseUuid}
              isCourseStarted={isCourseStarted}
              isEnrollable={isEnrollable}
              isUserEnrolled={isUserEnrolled}
              pacingType={pacingType}
              start={start}
              userEntitlements={userEntitlements}
            />
          </a>
        );
      }

      return (
        <Link
          className={classNames('btn', enrollLinkClass)}
          to={`/${enterpriseConfig.slug}`}
        >
          <EnrollButtonLabel
            activeCourseRun={activeCourseRun}
            availability={availability}
            courseUuid={courseUuid}
            isCourseStarted={isCourseStarted}
            isEnrollable={isEnrollable}
            isUserEnrolled={isUserEnrolled}
            pacingType={pacingType}
            start={start}
            userEntitlements={userEntitlements}
          />
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
