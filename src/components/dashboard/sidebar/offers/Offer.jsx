import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { getConfig } from '@edx/frontend-platform/config';

class Offer extends React.Component {
  renderTitle(usageType, benefitValue) {
    if (usageType === 'Percentage') {
      if (benefitValue === 100) {
        return 'Enroll for free';
      }
      return `Get ${benefitValue}% off`;
    }
    return `Get $${benefitValue} off`;
  }

  renderFinePrint(redemptionsRemaining, couponEndDate) {
    let message = `Expires ${moment(couponEndDate).format('MMMM D, YYYY')}.`;
    if (redemptionsRemaining > 1) {
      message = `You can use this ${redemptionsRemaining} more times. ${message}`;
    }
    return message;
  }

  render() {
    const {
      usageType,
      benefitValue,
      redemptionsRemaining,
      code,
      couponEndDate,
    } = this.props;
    const config = getConfig();
    const offerUrl = `${config.ECOMMERCE_BASE_URL}/coupons/offer/?code=${code}`;

    return (
      <a href={offerUrl} className="offer card mb-3 d-block">
        <div className="card-body">
          <h5 className="card-title font-weight-bold h6">
            {this.renderTitle(usageType, benefitValue)}
          </h5>
          <p className="card-text">
            {this.renderFinePrint(redemptionsRemaining, couponEndDate)}
          </p>
        </div>
      </a>
    );
  }
}

Offer.propTypes = {
  usageType: PropTypes.string.isRequired,
  benefitValue: PropTypes.number.isRequired,
  redemptionsRemaining: PropTypes.number.isRequired,
  code: PropTypes.string.isRequired,
  couponEndDate: PropTypes.string.isRequired,
};

export default Offer;
