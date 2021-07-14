import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';

import { useTrackSearchConversionClickHandler } from '../../data/hooks';
import { EnrollButtonCta } from '../common';

import { enrollLinkClass } from '../constants';

const ViewOnDashboard = ({ enrollLabel }) => {
  const { enterpriseConfig } = useContext(AppContext);
  const handleClick = useTrackSearchConversionClickHandler({
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_dashboard.clicked',
  });

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      as={Link}
      className={classNames('btn btn-primary btn-brand-primary', enrollLinkClass)}
      to={`/${enterpriseConfig.slug}`}
      onClick={handleClick}
    />
  );
};

ViewOnDashboard.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
};

export default ViewOnDashboard;
