import React from 'react';
import PropTypes from 'prop-types';
import {
  Card, Row, Col,
} from '@openedx/paragon';
import { numberWithPrecision } from '../../course/data/utils';
import { CURRENCY_USD } from '../../course/data/constants';

const RegistrationSummaryCard = ({ priceDetails }) => (
  <Card
    className="mb-4 registration-summary"
    orientation="horizontal"
  >
    <Card.Body>
      <Card.Section>
        <Row>
          <Col xs={12} lg={{ span: 5, offset: 0 }}>
            <h3>Registration summary:</h3>
            <br />
            <p className="small font-weight-light text-gray-500 font-italic">
              This course is covered by the Learner Credit provided by your organization.
            </p>
          </Col>
          <Col xs={12} lg={{ span: 5, offset: 2 }}>
            <div className="registration-details rounded-lg border p-3">
              <Row>
                <Col xs={12} lg={{ span: 6, offset: 0 }} className="small font-weight-light text-gray-500 justify-content-start">Registration total:</Col>
                <Col xs={12} lg={{ span: 6, offset: 0 }} className="justify-content-end">
                  <div className="d-flex justify-content-end mr-2.5">
                    <del>
                      {priceDetails?.price ? `$${numberWithPrecision(priceDetails.price)} ${priceDetails.currency}` : '-'}
                    </del>
                  </div>
                  <div className="d-flex justify-content-end mr-2.5">
                    ${priceDetails?.price ? `${String(0).padStart(priceDetails.price.toString().length, '0') }.00` : '0.00'} {priceDetails?.currency ? priceDetails.currency : CURRENCY_USD}
                  </div>
                  <div className="d-flex justify-content-end small font-weight-light text-gray-500 mr-2.5">
                    Tax included
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
      </Card.Section>
    </Card.Body>
  </Card>
);

RegistrationSummaryCard.propTypes = {
  priceDetails: PropTypes.shape({
    price: PropTypes.number.isRequired,
    currency: PropTypes.string.isRequired,
  }).isRequired,
};

export default RegistrationSummaryCard;
