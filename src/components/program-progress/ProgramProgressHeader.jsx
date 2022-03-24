import React, { useContext } from 'react';
import { ProgramProgressContext } from './ProgramProgressContextProvider';
import { getProgramIcon } from './data/utils';

const ProgramProgressHeader = () => {
  const { programData } = useContext(ProgramProgressContext);
  return (
    <>
      <div className="program-details-header">
        <div className="meta-info grid-container">
          { programData.type && (
            <img
              src={getProgramIcon(programData.type)}
              alt="Program Type Logo"
              className={`program-details-icon ${programData.type.toLowerCase()}`}
            />
          )}
          <h2 className="hd-1 program-title"> {programData.title} </h2>
        </div>
        <div className="authoring-organizations">
          <h2 className="heading">Institutions</h2>
          {programData.authoringOrganizations.length > 0 && (
            <div className="orgs">
              {programData.authoringOrganizations.map(org => (
                <img
                  id="org-image"
                  key={org.name}
                  src={org.certificateLogoImageUrl || org.logoImageUrl}
                  className="org-logo"
                  alt={`${org.name}'s logo`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ProgramProgressHeader;
