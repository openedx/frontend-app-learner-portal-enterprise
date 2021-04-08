import React, { useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { Hyperlink } from '@edx/paragon';

import { CourseContext } from './CourseContextProvider';
import { useCoursePartners } from './data/hooks';

export default function CreatedBy() {
  const { config } = useContext(AppContext);
  const { state } = useContext(CourseContext);
  const { course, activeCourseRun } = state;
  const [partners] = useCoursePartners(course);

  if (!partners.length && !activeCourseRun?.staff.length) {
    return null;
  }

  const formatStaffFullName = staff => `${staff.givenName} ${staff.familyName}`;

  return (
    <div className="mb-5">
      <h3>Meet your instructors</h3>
      {partners.length > 0 && (
        <div className="row no-gutters mt-3">
          {partners.map(partner => (
            <div className="col-lg-6 mb-3" key={partner.name}>
              <div className="mb-2">
                <a
                  href={partner.marketingUrl}
                  aria-hidden="true"
                  tabIndex="-1"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img src={partner.logoImageUrl} alt={`${partner.name} logo`} />
                </a>
              </div>
              <Hyperlink destination={partner.marketingUrl} target="_blank">
                {partner.name}
              </Hyperlink>
            </div>
          ))}
        </div>
      )}
      {activeCourseRun?.staff.length > 0 && (
        <div className="row no-gutters mt-3">
          {activeCourseRun.staff.map(staff => (
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
}
