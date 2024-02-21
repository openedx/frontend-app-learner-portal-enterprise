import React from 'react';
import { Link, useMatch } from 'react-router-dom';
import edXLogo from '@edx/brand/logo.svg';
import { Stack } from '@edx/paragon';

import { COURSE_TYPE_PARTNER_LOGOS } from '../course/data/constants';
import { useEnterpriseLearner } from '../app/App';

const SiteHeaderLogos = () => {
  const courseTypeMatch = useMatch('/:enterpriseSlug/:courseType?/course/*');
  const courseType = courseTypeMatch?.params?.courseType;
  const { data: { activeEnterpriseCustomer } } = useEnterpriseLearner();
  const courseTypePartnerLogo = courseType && COURSE_TYPE_PARTNER_LOGOS[courseType];

  let mainLogo = (
    <img
      className="logo"
      src={activeEnterpriseCustomer.brandingConfiguration?.logo || edXLogo}
      alt={`${activeEnterpriseCustomer.name} logo`}
      data-testid="header-logo-image-id"
    />
  );

  if (!activeEnterpriseCustomer.disableSearch) {
    mainLogo = (
      <Link to={`/${activeEnterpriseCustomer.slug}`} data-testid="header-logo-link-id">
        {mainLogo}
      </Link>
    );
  }

  return (
    <Stack direction="horizontal" gap={3} className="mr-md-3">
      {mainLogo}
      {courseTypePartnerLogo && (
        <>
          <div className="vertical-divider" />
          <img
            className="logo"
            src={courseTypePartnerLogo}
            alt="partner-header-logo"
            data-testid="partner-header-logo-image-id"
          />
        </>
      )}
    </Stack>
  );
};

export default SiteHeaderLogos;
