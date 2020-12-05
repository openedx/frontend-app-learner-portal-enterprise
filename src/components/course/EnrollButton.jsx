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
  <div className="enroll-wrapper" style={{ width: 270 }}>
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
  const { enterpriseConfig, config } = useContext(AppContext);
  const { state: courseData } = useContext(CourseContext);
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

  const enrollLinkClass = 'btn-block';

  if (!userEnrollment && isEnrollable) {
    // enroll with a subscription license
    if (enrollmentUrl && subscriptionLicense) {
      return (
        <EnrollButtonCta
          as="a"
          className={classNames('btn', 'btn-brand', enrollLinkClass)}
          href={enrollmentUrl}
        />
      );
    }
    // enroll with an offer (code)
    if (enrollmentUrl) {
      return (
        <>
          <EnrollButtonCta
            className={enrollLinkClass}
            onClick={() => setIsModalOpen(true)}
            variant="brand"
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
        className={enrollLinkClass}
        variant="brand"
      />
    );
  }

  if (!userEnrollment && !isEnrollable) {
    return (
      <EnrollButtonCta
        as="div"
        className="btn btn-light btn-block disabled"
      />
    );
  }

  if (userEnrollment) {
    if (isCourseStarted) {
      const courseInfoUrl = `${config.LMS_BASE_URL}/courses/${key}/info`;
      const shouldUseEnrollmentUrl = shouldUpgradeUserEnrollment({
        userEnrollment,
        subscriptionLicense,
        enrollmentUrl,
      });
      return (
        <EnrollButtonCta
          className={enrollLinkClass}
          href={shouldUseEnrollmentUrl ? enrollmentUrl : courseInfoUrl}
          variant="brand"
        />
      );
    }
    return (
      <EnrollButtonCta
        as={Link}
        className={classNames('btn', 'btn-brand', enrollLinkClass)}
        to={`/${enterpriseConfig.slug}`}
      />
    );
  }

  return (
    <EnrollButtonCta
      className={enrollLinkClass}
      variant="brand"
    />
  );
}
