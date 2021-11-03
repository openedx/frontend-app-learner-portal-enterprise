import React, { useContext } from 'react';
import { Parallax } from 'react-parallax';
import { breakpoints } from '@edx/paragon';
import { getConfig } from '@edx/frontend-platform/config';
import { ProgramContext } from './ProgramContextProvider';

const ProgramHeader = () => {
  const config = getConfig();
  const { program: { subjects, marketingHook } } = useContext(ProgramContext);

  let isMobileWindow = true;

  // Use the first subject as the primary subject
  const primarySubject = subjects?.length > 0 ? subjects[0] : '';
  const subjectSlug = primarySubject?.slug ? primarySubject?.slug.toLowerCase() : '';

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

  return (
    <>
      {subjectSlug
        ? (
          <Parallax
            blur={0}
            bgImage={backgroundImage}
            bgImageAlt=""
            strength={600}
          >
            <header className="program-header">
              <div className="container mw-lg program-header-container">
                {/* this div is added to add breadcrumbs at the top of banner. */}
                <div className="header-breadcrumbs ml-2" />
                <h1 className="display-3">{marketingHook}</h1>
              </div>
            </header>
          </Parallax>
        )
        : ''}
    </>
  );
};

export default ProgramHeader;
