import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-learner-portal-base/src/components/app-context';

const Hero = () => {
  const {
    pageContext: {
      enterpriseName,
      pageBranding: {
        banner_background_color: backgroundColor,
        banner_border_color: borderColor,
      },
    },
  } = useContext(AppContext);

  return (
    <div style={{ backgroundColor }}>
      <div className="container">
        <h1 className="mb-0 py-3 pl-3" style={{ borderLeft: `15px solid ${borderColor}` }}>
          {enterpriseName}
        </h1>
      </div>
    </div>
  );
};

export default Hero;
