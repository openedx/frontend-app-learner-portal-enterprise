import React from 'react';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import {
  Card, Image, Row, Col, Hyperlink,
} from '@openedx/paragon';

import { numberWithPrecision } from '../../course/data/utils';
import { DATE_FORMAT, ZERO_PRICE } from '../../course/data/constants';

const CourseSummaryCard = ({ courseMetadata, enrollmentCompleted }) => {
  let coursePrice = null;
  const precisePrice = courseMetadata?.priceDetails?.price ? `$${numberWithPrecision(
    courseMetadata.priceDetails.price,
  )} ${courseMetadata.priceDetails.currency}` : '-';
  if (enrollmentCompleted && courseMetadata?.priceDetails?.price) {
    coursePrice = (
      <><del>{precisePrice}</del>
        ${numberWithPrecision(ZERO_PRICE)} {courseMetadata.priceDetails.currency}
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
            <Hyperlink destination={courseMetadata.organization.marketingUrl}>
              <Image src={courseMetadata.organization.logoImgUrl} />
            </Hyperlink>
          )}
        />
        <Card.Section>
          <Row>
            <Col xs={12} lg={{ span: 8, offset: 0 }} className="vertical">
              <Row>
                <Col xs={12} lg={{ span: 8, offset: 0 }}>
                  <p className="small font-weight-light text-gray-500">{courseMetadata.organization.name}</p>
                  <p>{courseMetadata.title}</p>
                </Col>
              </Row>
            </Col>
            <Col xs={12} lg={4}>
              <div className="course-details">
                <Row className="align-items-center">
                  <Col className="small font-weight-light text-gray-500 justify-content-start">{enrollmentCompleted ? 'Start date:' : 'Available start date:'}</Col>
                  <Col className="justify-content-end"><Row className="justify-content-end mr-2.5">{dayjs(courseMetadata.startDate).format(DATE_FORMAT)}</Row></Col>
                </Row>
                <Row className="align-items-center">
                  <Col className="small font-weight-light text-gray-500 justify-content-start">Course duration:</Col>
                  <Col className="justify-content-end"><Row className="justify-content-end mr-2.5">{courseMetadata.duration}</Row></Col>
                </Row>
                <Row className="align-items-center">
                  <Col className="small font-weight-light text-gray-500 justify-content-start">Course total:</Col>
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
  courseMetadata: PropTypes.shape({
    organization: PropTypes.shape({
      name: PropTypes.string,
      marketingUrl: PropTypes.string,
      logoImgUrl: PropTypes.string,
    }).isRequired,
    title: PropTypes.string.isRequired,
    key: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    priceDetails: PropTypes.shape({
      price: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default CourseSummaryCard;
