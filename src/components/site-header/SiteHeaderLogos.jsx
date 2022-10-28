import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import edXLogo from '@edx/brand/logo.svg';
import { AppContext } from '@edx/frontend-platform/react';

import GetSmarterLogo from '../../assets/icons/getsmarter-logo.svg';

const SiteHeaderLogos = () => {
  const { enterpriseConfig } = useContext(AppContext);
  const { pathname } = useLocation();
  const isInExecutiveEducationPath = pathname.includes('executive-education-2u');

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
      {isInExecutiveEducationPath && (
        <img
          className="d-block getsmarter-logo"
          src={GetSmarterLogo}
          alt="getsmarter-logo"
          data-testid="getsmarter-logo-image-id"
        />
      )}
    </>
  );
};

export default SiteHeaderLogos;
