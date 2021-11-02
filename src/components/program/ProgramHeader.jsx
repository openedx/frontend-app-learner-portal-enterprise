import React, { useContext } from 'react';
import { Parallax } from 'react-parallax';
import { breakpoints } from '@edx/paragon';
import { ProgramContext } from './ProgramContextProvider';

const ProgramHeader = () => {
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
    const urlPrefix = 'https://www.edx.org/images/experiments/ProgramDetails';
    return `${urlPrefix}/${subjectFolder}/hook-background-${imageSize}.jpg`;
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
