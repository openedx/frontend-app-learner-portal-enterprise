import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Card, Image, Row, Col, Hyperlink,
} from '@openedx/paragon';

import { FormattedMessage } from '@edx/frontend-platform/i18n';
import { numberWithPrecision } from '../../course/data/utils';
import { DATE_FORMAT, ZERO_PRICE } from '../../course/data/constants';
import { useMinimalCourseMetadata } from '../../course/data/hooks';

const CourseSummaryCard = ({ enrollmentCompleted }) => {
  const minimalCourseMetadata = useMinimalCourseMetadata();

  let coursePrice = null;
  const precisePrice = minimalCourseMetadata.priceDetails?.price ? `$${numberWithPrecision(
    minimalCourseMetadata.priceDetails.price,
  )} ${minimalCourseMetadata.priceDetails.currency}` : '-';
  if (enrollmentCompleted && minimalCourseMetadata.priceDetails?.price) {
    coursePrice = (
      <><del>{precisePrice}</del>
        ${numberWithPrecision(ZERO_PRICE)} {minimalCourseMetadata.priceDetails.currency}
      </>
    );
  } else {
    coursePrice = precisePrice;
  }

  return (
    <Card
      className="mb-4 course-summary"
      orientation="horizontal"
    >
      <Card.Body>
        <Card.Header
          title={(
            <Hyperlink destination={minimalCourseMetadata.organization.marketingUrl}>
              <Image src={minimalCourseMetadata.organization.logoImgUrl} />
            </Hyperlink>
          )}
        />
        <Card.Section>
          <Row>
            <Col xs={12} lg={{ span: 8, offset: 0 }} className="vertical">
              <Row>
                <Col xs={12} lg={{ span: 8, offset: 0 }}>
                  <p className="small font-weight-light text-gray-500">{minimalCourseMetadata.organization.name}</p>
                  <p>{minimalCourseMetadata.title}</p>
                </Col>
              </Row>
            </Col>
            <Col xs={12} lg={4}>
              <div className="course-details">
                <Row className="align-items-center">
                  <Col className="small font-weight-light text-gray-500 justify-content-start">
                    {
                      enrollmentCompleted
                        ? (
                          <FormattedMessage
                            id="executive.education.external.course.enrollment.page.course.start.date"
                            defaultMessage="Start date:"
                            description="Showing start date as a label to show date for course while enrolling executive education course"
                          />
                        ) : (
                          <FormattedMessage
                            id="executive.education.external.course.enrollment.page.course.start.date.placeholder"
                            defaultMessage="Available start date:"
                            description="Showing available start date as a label to show date for course while enrolling executive education course"
                          />
                        )
                    }
                  </Col>
                  <Col className="justify-content-end"><Row className="justify-content-end mr-2.5">{dayjs(minimalCourseMetadata.startDate).format(DATE_FORMAT)}</Row></Col>
                </Row>
                <Row className="align-items-center">
                  <Col className="small font-weight-light text-gray-500 justify-content-start">
                    <FormattedMessage
                      id="executive.education.external.course.enrollment.page.course.duration"
                      defaultMessage="Course duration:"
                      description="Showing duration of the course while enrolling executive education course"
                    />
                  </Col>
                  <Col className="justify-content-end"><Row className="justify-content-end mr-2.5">{minimalCourseMetadata.duration}</Row></Col>
                </Row>
                <Row className="align-items-center">
                  <Col className="small font-weight-light text-gray-500 justify-content-start">
                    <FormattedMessage
                      id="executive.education.external.course.enrollment.page.course.price"
                      defaultMessage="Course total:"
                      description="Showing total price of the course while enrolling executive education course"
                    />
                  </Col>
                  <Col className="justify-content-end">
                    <Row className="justify-content-end mr-2.5">
                      {coursePrice}
                    </Row>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Card.Section>
      </Card.Body>
    </Card>
  );
};

CourseSummaryCard.defaultProps = {
  enrollmentCompleted: false,
};

CourseSummaryCard.propTypes = {
  enrollmentCompleted: PropTypes.bool,
};

export default CourseSummaryCard;
