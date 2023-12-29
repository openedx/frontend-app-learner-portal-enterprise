import React, { useContext } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import edXLogo from '@edx/brand/logo.svg';
import { Stack } from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { COURSE_TYPE_PARTNER_LOGOS } from '../course/data/constants';

const SiteHeaderLogos = () => {
  const courseTypeMatch = useRouteMatch('/:enterpriseSlug/:courseType');
  const courseType = courseTypeMatch?.params?.courseType;
  const { enterpriseConfig } = useContext(AppContext);
  const courseTypePartnerLogo = courseType && COURSE_TYPE_PARTNER_LOGOS[courseType];

  let mainLogo = (
    <img
      className="logo"
      src={enterpriseConfig.branding.logo || edXLogo}
      alt={`${enterpriseConfig.name} logo`}
      data-testid="header-logo-image-id"
    />
  );

  if (!enterpriseConfig.disableSearch) {
    mainLogo = (
      <Link to={`/${enterpriseConfig.slug}`} data-testid="header-logo-link-id">
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
