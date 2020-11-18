import React, { useContext, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { Button } from '@edx/paragon';

import { UserSubsidyContext } from '../enterprise-user-subsidy';
import { CourseContext } from './CourseContextProvider';
import EnrollButtonLabel from './EnrollButtonLabel';
import EnrollModal from './EnrollModal';

import { useCourseEnrollmentUrl } from './data/hooks';
import {
  hasCourseStarted,
  findUserEnrollmentForCourse,
  findHighestLevelSeatSku,
  findOfferForCourse,
  shouldUpgradeUserEnrollment,
} from './data/utils';

const EnrollButtonWrapper = ({
  as: Component,
  children,
  ...props
}) => (
  <div className="enroll-wrapper mb-3" style={{ width: 270 }}>
    <Component {...props}>
      {children}
    </Component>
  </div>
);

EnrollButtonWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  as: PropTypes.elementType,
};

EnrollButtonWrapper.defaultProps = {
  as: Button,
};

export default function EnrollButton() {
  const { state: courseData } = useContext(CourseContext);
  const { enterpriseConfig } = useContext(AppContext);
  const { subscriptionLicense, offers: { offers, offersCount } } = useContext(UserSubsidyContext);
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const {
    activeCourseRun,
    userEnrollments,
    userEntitlements,
    userSubsidy,
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

  const sku = useMemo(
    () => findHighestLevelSeatSku(seats),
    [seats],
  );
  const isCourseStarted = useMemo(
    () => hasCourseStarted(start),
    [start],
  );
  const userEnrollment = useMemo(
    () => findUserEnrollmentForCourse({ userEnrollments, key }),
    [userEnrollments, key],
  );
  const enrollmentUrl = useCourseEnrollmentUrl({
    catalogList,
    enterpriseConfig,
    key,
    location,
    offers,
    sku,
    subscriptionLicense,
    userSubsidy,
  });

  const EnrollLabel = props => (
    <EnrollButtonLabel
      activeCourseRun={activeCourseRun}
      availability={availability}
      courseUuid={courseUuid}
      isCourseStarted={isCourseStarted}
      isEnrollable={isEnrollable}
      isUserEnrolled={!!userEnrollment}
      pacingType={pacingType}
      start={start}
      userEntitlements={userEntitlements}
      {...props}
    />
  );

  const EnrollButtonCta = props => (
    <EnrollButtonWrapper {...props}>
      <EnrollLabel />
    </EnrollButtonWrapper>
  );

  const enrollLinkClass = 'btn-block rounded-0 py-2';

  if (!userEnrollment && isEnrollable) {
    // enroll with a subscription license
    if (enrollmentUrl && subscriptionLicense) {
      return (
        <EnrollButtonCta
          as="a"
          className={classNames('btn', 'btn-success', enrollLinkClass)}
          href={enrollmentUrl}
        />
      );
    }
    // enroll with an offer (code)
    if (enrollmentUrl) {
      return (
        <>
          <EnrollButtonCta
            className={classNames('btn', enrollLinkClass)}
            onClick={() => setIsModalOpen(true)}
            variant="success"
          />
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
    // cannot enroll without a valid enrollment url, so render a disabled button.
    return (
      <EnrollButtonCta
        className={classNames(enrollLinkClass, 'disabled')}
        variant="success"
      />
    );
  }

  if (!userEnrollment && !isEnrollable) {
    return (
      <EnrollButtonCta
        as="div"
        className="alert alert-secondary text-center rounded-0"
      />
    );
  }

  if (userEnrollment) {
    if (isCourseStarted) {
      const courseInfoUrl = `${process.env.LMS_BASE_URL}/courses/${key}/info`;
      const shouldUseEnrollmentUrl = shouldUpgradeUserEnrollment({
        userEnrollment,
        subscriptionLicense,
        enrollmentUrl,
      });
      return (
        <EnrollButtonCta
          className={classNames('btn', 'btn-success', enrollLinkClass)}
          href={shouldUseEnrollmentUrl ? enrollmentUrl : courseInfoUrl}
        />
      );
    }
    return (
      <EnrollButtonCta
        as={Link}
        className={classNames('btn', 'btn-success', enrollLinkClass)}
        to={`/${enterpriseConfig.slug}`}
      />
    );
  }

  return (
    <EnrollButtonCta
      className={enrollLinkClass}
      variant="success"
    />
  );
}
