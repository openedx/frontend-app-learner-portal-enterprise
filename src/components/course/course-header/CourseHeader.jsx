import { useMemo } from 'react';
import classNames from 'classnames';
import {
  Badge, Breadcrumb, Col, Container, Hyperlink, Row,
} from '@openedx/paragon';
import { Link, useLocation, useParams } from 'react-router-dom';
import { FormattedMessage } from '@edx/frontend-platform/i18n';

import CourseSkills from '../CourseSkills';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../CourseEnrollmentFailedAlert';
import CourseRunCards from './CourseRunCards';

import { formatProgramType, getDefaultProgram } from '../data/utils';
import { useCoursePartners, useIsCourseAssigned } from '../data';
import LicenseRequestedAlert from '../LicenseRequestedAlert';
import SubsidyRequestButton from '../SubsidyRequestButton';
import CourseReview from '../CourseReview';

import CoursePreview from './CoursePreview';
import { features } from '../../../config';
import CourseMaterialsButton from '../CourseMaterialsButton';
import {
  isArchived,
  useCourseMetadata,
  useCourseRedemptionEligibility,
  useEnterpriseCustomer,
  useEnterpriseCustomerContainsContent,
  useIsAssignmentsOnlyLearner,
} from '../../app/data';
import CourseImportantDates from './CourseImportantDates';

const CourseHeader = () => {
  const location = useLocation();
  const { courseKey } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const { data: courseMetadata } = useCourseMetadata();
  const { data: { isPolicyRedemptionEnabled } } = useCourseRedemptionEligibility();
  const { data: { containsContentItems } } = useEnterpriseCustomerContainsContent([courseKey]);
  const isAssignmentsOnlyLearner = useIsAssignmentsOnlyLearner();
  const { isCourseAssigned } = useIsCourseAssigned();
  const isCourseArchived = courseMetadata.courseRuns.every((courseRun) => isArchived(courseRun));
  const [partners] = useCoursePartners(courseMetadata);
  const defaultProgram = useMemo(
    () => getDefaultProgram(courseMetadata.programs),
    [courseMetadata],
  );
  const routeLinks = [
    {
      label: 'Find a Course',
      to: `/${enterpriseCustomer.slug}/search`,
    },
  ];
  if (location.state?.parentRoute) {
    routeLinks.push(location.state.parentRoute);
  }

  return (
    <div className="course-header">
      <LicenseRequestedAlert />
      <CourseEnrollmentFailedAlert enrollmentSource={ENROLLMENT_SOURCE.COURSE_PAGE} />
      <Container size="lg">
        <Row className="py-4">
          <Col xs={12} lg={7}>
            {(!enterpriseCustomer.disableSearch && !isAssignmentsOnlyLearner) && (
              <div className="small mb-4">
                <Breadcrumb
                  links={routeLinks}
                  activeLabel={courseMetadata.title}
                  linkAs={Link}
                />
              </div>
            )}
            {partners.length > 0 && (
              <div className="mb-2 course-header__partner-logos">
                {partners.map(partner => (
                  <Hyperlink
                    destination={partner.marketingUrl}
                    key={partner.uuid}
                    target="_blank"
                    showLaunchIcon={false}
                  >
                    <img
                      src={partner.logoImageUrl}
                      alt={`${partner.name} logo`}
                      style={{ maxWidth: 160, maxHeight: 144 }}
                    />
                  </Hyperlink>
                ))}
              </div>
            )}
            <div
              className={classNames(
                'd-flex align-items-center',
                {
                  'mb-4': !courseMetadata.shortDescription,
                  'mb-2': courseMetadata.shortDescription,
                },
              )}
            >
              <h2 className="mb-0">{courseMetadata.title}</h2>
              {(features.FEATURE_ENABLE_TOP_DOWN_ASSIGNMENT && isCourseAssigned) && (
                <Badge variant="info" className="ml-4">
                  <FormattedMessage
                    id="enterprise.course.about.page.assigned.badge.label"
                    defaultMessage="Assigned"
                    description="Assigned badge label for course header on course about page"
                  />
                </Badge>
              )}
            </div>
            {courseMetadata.shortDescription && (
              <div
                className="lead font-weight-normal mb-4"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: courseMetadata.shortDescription }}
              />
            )}
            <CourseSkills />
            {isPolicyRedemptionEnabled && <CourseRunCards />}
            {containsContentItems && (
              <>
                {!isPolicyRedemptionEnabled && <CourseRunCards />}
                <SubsidyRequestButton />
              </>
            )}
          </Col>
          <Col xs={12} lg={{ span: 4, offset: 1 }} className="mt-3 mt-lg-0">
            <CoursePreview
              previewImage={courseMetadata.image?.src || courseMetadata.video?.image}
              previewVideoURL={courseMetadata.video?.src}
            />
            <CourseImportantDates />
          </Col>
          <Col xs={12}>
            {containsContentItems && (
              <>
                <CourseReview />
                {defaultProgram && (
                  <p className="font-weight-bold mt-3 mb-0">
                    <FormattedMessage
                      id="enterprise.course.about.page.course.part.of.program"
                      defaultMessage="This course is part of a {programType}."
                      description="Message for when a course is part of a program"
                      values={{
                        programType: formatProgramType(defaultProgram.type),
                      }}
                    />
                  </p>
                )}
              </>
            )}
            {isCourseArchived && (
              <>
                <p className="d-block font-weight-bold mt-3 mb-0">
                  <FormattedMessage
                    id="enterprise.course.about.page.course.not.in.catalog.and.archived"
                    defaultMessage="This course is archived."
                    description="Message for when a course is archived and not part of the company's curated course catalog"
                  />
                </p>
                <CourseMaterialsButton className="mt-3" />
              </>
            )}
            {!containsContentItems && !isCourseArchived && (
              <p className="font-weight-bold mt-3 mb-0">
                <FormattedMessage
                  id="enterprise.course.about.page.course.not.in.catalog"
                  defaultMessage="This course is not part of your organization's curated course catalog."
                  description="Message for when a course is not part of the organization's curated course catalog"
                />
              </p>
            )}
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default CourseHeader;
