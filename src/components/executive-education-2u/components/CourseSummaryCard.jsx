import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, Image, Row, Col,
} from '@edx/paragon';
import { numberWithPrecision } from '../../course/data/utils';

const CourseSummaryCard = ({ courseMetadata, enrolmentCompleted }) => (
  <Card
    className="mb-4 course-summary"
    orientation="horizontal"
  >
    <Card.Body>
      <Card.Header
        title={(
          <Image
            src={courseMetadata.organizationImage}
          />
        )}
      />
      <Card.Section>
        <Row>
          <Col xs={12} lg={{ span: 8, offset: 0 }} className="vertical">
            <Row>
              <Col xs={12} lg={{ span: 8, offset: 0 }}>
                <p className="small font-weight-light text-gray-500">{ courseMetadata.organizationName }</p>
                <p>{ courseMetadata.title }</p>
              </Col>
            </Row>
          </Col>
          <Col xs={12} lg={{ span: 4, offset: 0 }}>
            <div className="course-details">
              <Row>
                <Col className="small font-weight-light text-gray-500 justify-content-start">{enrolmentCompleted ? 'Start date:' : 'Available start date:'}</Col>
                <Col className="justify-content-end"><Row className="justify-content-end margin-right-10">{courseMetadata.startDate}</Row></Col>
              </Row>
              <Row>
                <Col className="small font-weight-light text-gray-500 justify-content-start">Course duration:</Col>
                <Col className="justify-content-end"><Row className="justify-content-end margin-right-10">{courseMetadata.duration}</Row></Col>
              </Row>
              <Row>
                <Col className="small font-weight-light text-gray-500 justify-content-start">Course total:</Col>
                <Col className="justify-content-end">
                  <Row className="justify-content-end margin-right-10">
                    ${courseMetadata.priceDetails?.price ? `${numberWithPrecision(courseMetadata.priceDetails.price)} ${courseMetadata.priceDetails.currency}` : 'Unknown'}
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

CourseSummaryCard.defaultProps = {
  enrolmentCompleted: false,
};

CourseSummaryCard.propTypes = {
  enrolmentCompleted: PropTypes.bool,
  courseMetadata: PropTypes.shape({
    organizationImage: PropTypes.string.isRequired,
    organizationName: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    startDate: PropTypes.string.isRequired,
    duration: PropTypes.string.isRequired,
    priceDetails: PropTypes.shape({
      price: PropTypes.number.isRequired,
      currency: PropTypes.string.isRequired,
    }),
  }).isRequired,
};

export default CourseSummaryCard;
