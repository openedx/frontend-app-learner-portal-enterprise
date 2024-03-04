import React, { useContext } from 'react';
import { Parallax } from 'react-parallax';
import { breakpoints, Breadcrumb } from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { useParams } from 'react-router-dom';
import { ProgramContext } from './ProgramContextProvider';
import { fixedEncodeURIComponent } from '../../utils/common';

const ProgramHeader = () => {
  const config = getConfig();
  const { enterpriseSlug } = useParams();
  const {
    program: {
      title, authoringOrganizations, subjects, marketingHook,
    },
  } = useContext(ProgramContext);

  let isMobileWindow = true;
  // Use the first subject as the primary subject
  const primarySubject = subjects?.length > 0 ? subjects[0] : '';
  const subjectName = primarySubject?.name || '';
  const subjectSlug = primarySubject?.slug?.toLowerCase() || '';

  const handleResize = () => {
    const isMobileWindowRefresh = window.matchMedia(`(max-width: ${breakpoints.small.maxWidth}px)`).matches;
    if (isMobileWindow !== isMobileWindowRefresh) {
      isMobileWindow = !isMobileWindow;
    }
  };

  const getHeaderBackgroundImage = () => {
    let subjectFolder = 'data-science';
    if (subjectSlug === 'computer-science' || subjectSlug === 'business-management') {
      subjectFolder = subjectSlug;
    }
    handleResize();
    const imageSize = isMobileWindow ? 'sm' : 'lg';
    return `${config.MARKETING_SITE_BASE_URL}/images/experiments/ProgramDetails/${subjectFolder}/hook-background-${imageSize}.jpg`;
  };

  const backgroundImage = getHeaderBackgroundImage();

  const prependProgramOrganizationsToTitle = () => {
    const organizationCount = authoringOrganizations.length;

    if (organizationCount === 1) {
      return `${authoringOrganizations[0].key}'s ${title}`;
    }
    if (organizationCount === 2) {
      return `${authoringOrganizations[0].key} and ${authoringOrganizations[1].key}'s ${title}`;
    }

    const multipleOrganizationString = authoringOrganizations.reduce((organizationString, organization, index) => {
      if (index + 1 < organizationCount) {
        return `${organizationString}${organization.key}, `;
      }

      return `${organizationString}and ${organization.key}`;
    }, '');

    return `${multipleOrganizationString}'s ${title}`;
  };

  const links = [{ label: 'Catalog', url: `/${enterpriseSlug}/search` }];
  if (subjectName && subjectSlug) {
    links.push({ label: `${subjectName} Courses`, url: `/${enterpriseSlug}/search?subjects=${ fixedEncodeURIComponent(subjectName)}` });
  }

  if (!subjectSlug) {
    return null;
  }

  return (
    <Parallax
      blur={0}
      bgImage={backgroundImage}
      bgImageAlt=""
      strength={600}
    >
      <header className="program-header">
        <div className="container mw-lg program-header-container">
          <div className="header-breadcrumbs ml-2">
            <Breadcrumb
              links={links}
              activeLabel={prependProgramOrganizationsToTitle()}
            />
          </div>
          <h1 className="display-3">{marketingHook}</h1>
        </div>
      </header>
    </Parallax>
  );
};

export default ProgramHeader;
