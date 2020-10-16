import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Alert } from '@edx/paragon';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { fetchOffers } from '../dashboard/sidebar/offers';

export const getOffersText = (number) => `You have ${number} course redemption voucher${number > 1 ? 's' : ''} left to use.`;

export class BaseOffersAlert extends React.Component {
  componentDidMount() {
    const { isOffersLoading, fetchOffersAction } = this.props;

    if (!isOffersLoading) {
      fetchOffersAction('full_discount_only=True');
    }
  }

  render() {
    const { offersCount } = this.props;
    if (offersCount) {
      return (
        <Alert
          className="pl-5"
          variant="info"
        >
          <div className="container">
            <FontAwesomeIcon className="mr-1" icon={faInfoCircle} />
            {getOffersText(offersCount)}
          </div>
        </Alert>
      );
    }
    return null;
  }
}

BaseOffersAlert.defaultProps = {
  fetchOffersAction: null,
  isOffersLoading: false,
  offersCount: 0,
};

BaseOffersAlert.propTypes = {
  fetchOffersAction: PropTypes.func,
  isOffersLoading: PropTypes.bool,
  offersCount: PropTypes.number,
};

const mapStateToProps = state => ({
  isOffersLoading: state.offers.loading,
  offersCount: state.offers.offersCount,
  timeFetched: state.offers.timeFetched,
});

const mapDispatchToProps = dispatch => ({
  fetchOffersAction: (query) => (query ? dispatch(fetchOffers(query)) : dispatch(fetchOffers())),
});

export default connect(mapStateToProps, mapDispatchToProps)(BaseOffersAlert);
