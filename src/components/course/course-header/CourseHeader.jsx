import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import {
  Breadcrumb,
  Container,
  Row,
  Col,
  Badge,
} from '@openedx/paragon';
import { Link, useLocation } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { CourseContext } from '../CourseContextProvider';
import CourseSkills from '../CourseSkills';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../CourseEnrollmentFailedAlert';
import CourseRunCards from './CourseRunCards';

import {
  getDefaultProgram,
  formatProgramType,
  isArchived,
} from '../data/utils';
import { useCoursePartners, useIsCourseAssigned } from '../data/hooks';
import LicenseRequestedAlert from '../LicenseRequestedAlert';
import SubsidyRequestButton from '../SubsidyRequestButton';
import CourseReview from '../CourseReview';

import CoursePreview from './CoursePreview';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';
import { features } from '../../../config';
import CourseMaterialsButton from '../CourseMaterialsButton';

const CourseHeader = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const {
    state: {
      course,
      catalog,
    },
    isPolicyRedemptionEnabled,
  } = useContext(CourseContext);
  const { redeemableLearnerCreditPolicies } = useContext(UserSubsidyContext);
  const isCourseAssigned = useIsCourseAssigned(redeemableLearnerCreditPolicies?.learnerContentAssignments, course?.key);
  const isCourseArchived = (course.courseRuns)?.every((courseRun) => isArchived(courseRun));
  const [partners] = useCoursePartners(course);

  const defaultProgram = useMemo(
    () => getDefaultProgram(course.programs),
    [course],
  );
  const location = useLocation();
  const routeLinks = [
    {
      label: 'Find a Course',
      to: `/${enterpriseConfig.slug}/search`,
    },
  ];
  if (location?.state?.parentRoute) {
    routeLinks.push(location.state.parentRoute);
  }

  return (
    <div className="course-header">
      <LicenseRequestedAlert catalogList={catalog.catalogList} />
      <CourseEnrollmentFailedAlert enrollmentSource={ENROLLMENT_SOURCE.COURSE_PAGE} />
      <Container size="lg">
        <Row className="py-4">
          <Col xs={12} lg={7}>
            {!enterpriseConfig.disableSearch && (
              <div className="small">
                <Breadcrumb
                  links={routeLinks}
                  activeLabel={course.title}
                  linkAs={Link}
                />
              </div>
            )}
            {partners.length > 0 && (
              <div className="mt-4 mb-2 course-header__partner-logos">
                {partners.map(partner => (
                  <a
                    href={partner.marketingUrl}
                    key={partner.uuid}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={partner.logoImageUrl}
                      alt={`${partner.name} logo`}
                      style={{ maxWidth: 160, maxHeight: 144 }}
                    />
                  </a>
                ))}
              </div>
            )}
            <div className={classNames({ 'mb-4': !course.shortDescription, 'd-flex': true, 'align-items-center': true })}>
              <h2>{course.title}</h2>
              {(features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && isCourseAssigned) && <Badge variant="info" className="ml-4">Assigned</Badge>}
            </div>
            {course.shortDescription && (
              <div
                className="lead font-weight-normal mb-4"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: course.shortDescription }}
              />
            )}
            {course.skills?.length > 0 && <CourseSkills />}
            {isPolicyRedemptionEnabled && <CourseRunCards />}
            {catalog.containsContentItems && (
              <>
                {!isPolicyRedemptionEnabled && <CourseRunCards />}
                <SubsidyRequestButton />
              </>
            )}
          </Col>
          <Col xs={12} lg={{ span: 4, offset: 1 }} className="mt-3 mt-lg-0">
            <CoursePreview
              previewImage={course?.image?.src || course?.video?.image}
              previewVideoURL={course?.video?.src}
            />
          </Col>
          <Col xs={12} lg={12}>
            {catalog.containsContentItems && (
              <>
                <CourseReview />
                {defaultProgram && (
                  <p className="font-weight-bold mt-3 mb-0">
                    This course is part of a {formatProgramType(defaultProgram.type)}.
                  </p>
                )}
              </>
            )}
            {!catalog.containsContentItems && isCourseArchived && (
              <p className="d-block font-weight-bold mt-3 mb-0">
                This course is archived.
                <CourseMaterialsButton course={course} />
              </p>
            )}
            {!catalog.containsContentItems && !isCourseArchived && (
              <p className="font-weight-bold mt-3 mb-0">
                This course is not part of your company&apos;s curated course catalog.
              </p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CourseHeader;
