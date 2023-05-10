import React, { useContext, useMemo } from 'react';
import classNames from 'classnames';
import {
  Breadcrumb,
  Container,
  Row,
  Col,
} from '@edx/paragon';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { getConfig } from '@edx/frontend-platform/config';

import { CourseContext } from '../CourseContextProvider';
import CourseSkills from '../CourseSkills';
import CourseEnrollmentFailedAlert, { ENROLLMENT_SOURCE } from '../CourseEnrollmentFailedAlert';
import CourseRunCards from './CourseRunCards';

import {
  getDefaultProgram,
  formatProgramType,
} from '../data/utils';
import { useCoursePartners } from '../data/hooks';
import LicenseRequestedAlert from '../LicenseRequestedAlert';
import SubsidyRequestButton from '../SubsidyRequestButton';
import CourseReview from '../CourseReview';

import { isExperimentVariant } from '../../../utils/optimizely';
import CoursePreview from './CoursePreview';

const CourseHeader = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { state } = useContext(CourseContext);
  const {
    course,
    catalog,
    courseReviews,
    isPolicyRedemptionEnabled,
  } = state;
  const [partners] = useCoursePartners(course);

  const defaultProgram = useMemo(
    () => getDefaultProgram(course.programs),
    [course],
  );
  const config = getConfig();
  const isExperimentVariationA = isExperimentVariant(
    config.EXPERIMENT_5_ID,
    config.EXPERIMENT_5_VARIANT_1_ID,
  );
  const hasSufficientReviewCount = courseReviews?.reviewsCount >= 5;

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
                  links={[
                    {
                      label: 'Find a Course',
                      to: `/${enterpriseConfig.slug}/search`,
                    },
                  ]}
                  activeLabel={course.title}
                  linkAs={Link}
                />
              </div>
            )}
            {partners.length > 0 && (
              <div className="mt-4 mb-2">
                {partners.map(partner => (
                  <a
                    className="d-inline-block mr-4"
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
            <div className={classNames({ 'mb-4': !course.shortDescription })}>
              <h2>{course.title}</h2>
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
            {catalog.containsContentItems ? (
              <>
                {hasSufficientReviewCount && isExperimentVariationA && <CourseReview />}
                {defaultProgram && (
                  <p className="font-weight-bold mt-3 mb-0">
                    This course is part of a {formatProgramType(defaultProgram.type)}.
                  </p>
                )}
              </>
            ) : (
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
