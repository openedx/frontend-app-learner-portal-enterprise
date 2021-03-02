import React from 'react';
import PropTypes from 'prop-types';

import ToVoucherRedeemPage from './ToVoucherRedeemPage';

/**
 * ToEcom page component implemention for Enroll Button.
 * Currently the same as the ToVoucherRedeemPage but keeping separate for cleanliness.
 *
 * @param {Component} args.enrollLabel An EnrollLabel component
 * @returns {Component} Rendered enroll button with a enrollment modal behavior included.
 */
const ToEcomBasketPage = ({ enrollLabel, enrollmentUrl }) => (
  <ToVoucherRedeemPage enrollmentUrl={enrollmentUrl} enrollLabel={enrollLabel} />
);

ToEcomBasketPage.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

export default ToEcomBasketPage;
