import { getProgramIcon } from './data/utils';
import { useProgramProgressDetails } from '../app/data';

const ProgramProgressHeader = () => {
  const { data: { programData } } = useProgramProgressDetails();
  const programIcon = getProgramIcon(programData.type);

  return (
    <div className="program-details-header">
      <div className="meta-info grid-container">
        { programIcon && (
          <img
            src={programIcon}
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
  );
};

export default ProgramProgressHeader;
