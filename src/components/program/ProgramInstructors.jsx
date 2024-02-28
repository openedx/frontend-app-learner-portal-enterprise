import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { AppContext } from '@edx/frontend-platform/react';
import { Collapsible, Hyperlink } from '@openedx/paragon';
import { AddCircle, RemoveCircle } from '@openedx/paragon/icons';
import { ProgramContext } from './ProgramContextProvider';

const ProgramStaff = ({ program }) => {
  const { config } = useContext(AppContext);
  const formatStaffFullName = staff => `${staff.givenName} ${staff.familyName}`;

  return (
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
  );
};

ProgramStaff.propTypes = {
  program: PropTypes.shape({
    staff: PropTypes.arrayOf(PropTypes.shape({
      givenName: PropTypes.string.isRequired,
      familyName: PropTypes.string.isRequired,
      profileImageUrl: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      position: PropTypes.shape({
        title: PropTypes.string.isRequired,
        organizationName: PropTypes.string.isRequired,
      }).isRequired,
    })).isRequired,
  }).isRequired,
};

const ProgramInstructors = () => {
  const { program } = useContext(ProgramContext);

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
      {program.staff.length <= 4 && <ProgramStaff program={program} />}
      {program.staff.length > 4 && (
        <Collapsible.Advanced className="collapsible program-staff">
          <Collapsible.Trigger className="collapsible-trigger d-flex">
            <h4 className="h4 mb-0 mr-2 title">See instructor bios</h4>
            <Collapsible.Visible whenClosed>
              <AddCircle className="mr-2" />
            </Collapsible.Visible>

            <Collapsible.Visible whenOpen>
              <RemoveCircle className="mr-2" />
            </Collapsible.Visible>
          </Collapsible.Trigger>

          <Collapsible.Body className="collapsible-body mt-3 ml-4.5">
            <ProgramStaff program={program} />
          </Collapsible.Body>
        </Collapsible.Advanced>
      )}
    </div>
  );
};

export default ProgramInstructors;
