import React from 'react';
import { Link, useParams } from 'react-router-dom';
import edXLogo from '@edx/brand/logo.svg';
import { Stack } from '@openedx/paragon';

import { COURSE_TYPE_PARTNER_LOGOS } from '../course/data/constants';
import { useEnterpriseCustomer } from '../app/data';

const SiteHeaderLogos = () => {
  const { courseType } = useParams();
  const { data: enterpriseCustomer } = useEnterpriseCustomer();
  const courseTypePartnerLogo = courseType && COURSE_TYPE_PARTNER_LOGOS[courseType];

  let mainLogo = (
    <img
      className="logo"
      src={enterpriseCustomer.brandingConfiguration?.logo || edXLogo}
      alt={`${enterpriseCustomer.name} logo`}
      data-testid="header-logo-image-id"
    />
  );

  if (!enterpriseCustomer.disableSearch) {
    mainLogo = (
      <Link to={`/${enterpriseCustomer.slug}`} data-testid="header-logo-link-id">
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
