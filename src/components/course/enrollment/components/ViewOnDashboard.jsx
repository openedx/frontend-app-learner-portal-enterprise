import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { useTrackSearchConversionClickHandler } from '../../data/hooks';
import { EnrollButtonCta } from '../common';
import { useEnterpriseCustomer } from '../../../app/data';

const ViewOnDashboard = ({ enrollLabel }) => {
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const handleClick = useTrackSearchConversionClickHandler({
    eventName: 'edx.ui.enterprise.learner_portal.course.enroll_button.to_dashboard.clicked',
  });

  return (
    <EnrollButtonCta
      enrollLabel={enrollLabel}
      as={Link}
      className="btn btn-primary btn-block btn-brand-primary"
      to={`/${enterpriseCustomer.slug}`}
      onClick={handleClick}
    />
  );
};

ViewOnDashboard.propTypes = {
  enrollLabel: PropTypes.node.isRequired,
};

export default ViewOnDashboard;
