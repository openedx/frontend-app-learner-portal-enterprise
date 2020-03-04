import React, { useContext } from 'react';

import CourseContext from './CourseContext';

import { useCoursePartners } from './data/hooks';

export default function CreatedBy() {
  const { course, activeCourseRun } = useContext(CourseContext);
  const [partners] = useCoursePartners(course);

  if (!partners.length && !activeCourseRun.staff.length) {
    return null;
  }

  const formatStaffFullName = staff => `${staff.givenName} ${staff.familyName}`;

  return (
    <div className="mb-5">
      <h3>Meet your instructors</h3>
      {partners.length > 0 && (
        <div className="row no-gutters mt-3">
          {partners.map(partner => (
            <div className="col-lg-6 mb-3" key={partner.fullUrl}>
              <div className="mb-2">
                <a href={partner.fullUrl} aria-hidden="true" tabIndex="-1">
                  <img src={partner.logoImageUrl} alt={`${partner.name} logo`} />
                </a>
              </div>
              <a href={partner.fullUrl} className="text-underline">{partner.name}</a>
            </div>
          ))}
        </div>
      )}
      {activeCourseRun.staff && activeCourseRun.staff.length > 0 && (
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
                <a href={`${process.env.MARKETING_SITE_URL}/bio/${staff.slug}`} className="font-weight-bold">
                  {formatStaffFullName(staff)}
                </a>
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
