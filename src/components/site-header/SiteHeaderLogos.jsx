import React, { useContext } from 'react';
import { Link, useRouteMatch } from 'react-router-dom';
import edXLogo from '@edx/brand/logo.svg';
import { AppContext } from '@edx/frontend-platform/react';
import { COURSE_TYPE_PARTNER_LOGOS } from '../course/data/constants';

const SiteHeaderLogos = () => {
  const courseTypeMatch = useRouteMatch('/:enterpriseSlug/:courseType');
  const courseType = courseTypeMatch?.params?.courseType;
  const { enterpriseConfig } = useContext(AppContext);
  const courseTypePartnerLogo = courseType && COURSE_TYPE_PARTNER_LOGOS[courseType];

  let mainLogo = (
    <div className="d-flex">
      <img
        className="d-block logo"
        src={enterpriseConfig.branding.logo || edXLogo}
        alt={`${enterpriseConfig.name} logo`}
        data-testid="header-logo-image-id"
      />
    </div>
  );

  if (!enterpriseConfig.disableSearch) {
    mainLogo = (
      <Link to={`/${enterpriseConfig.slug}`} data-testid="header-logo-link-id">
        {mainLogo}
      </Link>
    );
  }

  return (
    <>
      {mainLogo}
      {courseTypePartnerLogo && (
        <img
          className="d-block pl-2 partner-header-logo logo-right"
          src={courseTypePartnerLogo}
          alt="partner-header-logo"
          data-testid="partner-header-logo-image-id"
        />
      )}
    </>
  );
};

export default SiteHeaderLogos;
