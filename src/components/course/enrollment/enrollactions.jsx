/* eslint-disable import/prefer-default-export */
import React, { useContext } from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { AppContext } from '@edx/frontend-platform/react';
import { EnrollButtonCta } from './common';
import { enrollLinkClass } from '../data/constants';
import ToVoucherRedeemPage from './ToVoucherRedeemPage';
import ToCoursewarePage from './ToCoursewarePage';
import ToEcomBasketPage from './ToEcomBasketPage';

/**
 * Exports a number of UI components that represent the correct enroll button behavior for each
 * scenario supported. Use the correct one based on the scenario.
 */

// Exported components

// Disabled enroll
const EnrollBtnDisabled = ({ enrollLabel }) => (
  <EnrollButtonCta
    enrollLabel={enrollLabel}
    as="div"
    className="btn btn-light btn-block disabled"
  />
);

EnrollBtnDisabled.propTypes = {
  enrollLabel: PropTypes.shape.isRequired,
};

// Data sharing consent
const ToDataSharingConsentPage = ({ enrollLabel, enrollmentUrl }) => (
  <EnrollButtonCta
    enrollLabel={enrollLabel}
    as="a"
    className={classNames('btn btn-primary btn-brand-primary', enrollLinkClass)}
    href={enrollmentUrl}
  />
);

ToDataSharingConsentPage.propTypes = {
  enrollLabel: PropTypes.shape.isRequired,
  enrollmentUrl: PropTypes.string.isRequired,
};

// view on dashboard
const ViewOnDashboard = ({ enrollLabel }) => {
  const { enterpriseConfig } = useContext(AppContext);
  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      as={Link}
      className={classNames('btn btn-primary btn-brand-primary', enrollLinkClass)}
      to={`/${enterpriseConfig.slug}`}
    />
  );
};

ViewOnDashboard.propTypes = {
  enrollLabel: PropTypes.shape.isRequired,
};

export {
  EnrollBtnDisabled,
  ToDataSharingConsentPage,
  ToCoursewarePage, // exported here for convenience
  ViewOnDashboard,
  ToVoucherRedeemPage, // exported here just for convenience
  ToEcomBasketPage, // exported here just for convenience
};
