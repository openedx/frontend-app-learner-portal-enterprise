import React from 'react';
import { Link, useMatch } from 'react-router-dom';
import edXLogo from '@edx/brand/logo.svg';
import { Stack } from '@edx/paragon';

import { COURSE_TYPE_PARTNER_LOGOS } from '../course/data/constants';
import { useEnterpriseLearner } from '../app/data';

const SiteHeaderLogos = () => {
  const courseTypeMatch = useMatch('/:enterpriseSlug/:courseType?/course/*');
  const courseType = courseTypeMatch?.params?.courseType;
  const { data: { enterpriseCustomer } } = useEnterpriseLearner();
  const courseTypePartnerLogo = courseType && COURSE_TYPE_PARTNER_LOGOS[courseType];

  let mainLogo = (
    <img
      className="logo"
      src={enterpriseCustomer.brandingConfiguration?.logo || edXLogo}
      alt={`${enterpriseCustomer.name} logo`}
      data-testid="header-logo-image-id"
    />
  );

  // TODO: handle `disableSearch` for enterprise customers in new routing paradigm.
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
