import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Hyperlink } from '@edx/paragon';

import { ProgramContext } from './ProgramContextProvider';

const ProgramInstructors = () => {
  const { config } = useContext(AppContext);
  const { program } = useContext(ProgramContext);

  const formatStaffFullName = staff => `${staff.givenName} ${staff.familyName}`;

  return (
    <div className="mb-5">
      <h3>Meet your instructors</h3>
      {program.authoringOrganizations.length > 0 && (
        <div className="row no-gutters mt-3">
          {program.authoringOrganizations.map(authoringOrganization => (
            <div className="col-lg-6 mb-3" key={authoringOrganization.name}>
              <div className="mb-2">
                <a
                  href={authoringOrganization.marketingUrl}
                  aria-hidden="true"
                  tabIndex="-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={authoringOrganization.logoImageUrl} alt={`${authoringOrganization.name} logo`} />
                </a>
              </div>
              <Hyperlink destination={authoringOrganization.marketingUrl} target="_blank">
                {authoringOrganization.name}
              </Hyperlink>
            </div>
          ))}
        </div>
      )}
      {program.staff.length > 0 && (
        <div className="row no-gutters mt-3">
          {program.staff.map(staff => (
            <div className="d-flex col-lg-6 mb-3" key={formatStaffFullName(staff)}>
              <img
                src={staff.profileImageUrl}
                className="rounded-circle mr-3"
                alt={formatStaffFullName(staff)}
                style={{ width: 72, height: 72 }}
              />
              <div>
                <Hyperlink
                  destination={`${config.MARKETING_SITE_BASE_URL}/bio/${staff.slug}`}
                  className="font-weight-bold"
                  target="_blank"
                >
                  {formatStaffFullName(staff)}
                </Hyperlink>
                {staff.position && (
                  <>
                    <div className="font-italic">{staff.position.title}</div>
                    {staff.position.organizationName}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProgramInstructors;
