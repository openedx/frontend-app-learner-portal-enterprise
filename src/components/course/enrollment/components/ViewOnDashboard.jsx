import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';

import { AppContext } from '@edx/frontend-platform/react';
import { EnrollButtonCta } from '../common';

import { enrollLinkClass } from '../constants';

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

export default ViewOnDashboard;
