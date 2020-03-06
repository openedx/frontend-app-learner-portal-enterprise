import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';

export default function EnterpriseBanner() {
  const {
    enterpriseConfig: {
      name: enterpriseName,
      branding: {
        banner: {
          backgroundColor,
          borderColor,
        },
      },
    },
  } = useContext(AppContext);

  return (
    <div style={{ backgroundColor }}>
      <div className="container-fluid">
        <h1 className="mb-0 py-3 pl-3" style={{ borderLeft: `15px solid ${borderColor}` }}>
          {enterpriseName}
        </h1>
      </div>
    </div>
  );
}
