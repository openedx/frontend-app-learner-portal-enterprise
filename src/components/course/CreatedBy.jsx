import { getConfig } from '@edx/frontend-platform';
import { Hyperlink, Image } from '@openedx/paragon';

import { useCoursePartners } from './data/hooks';
import { useCourseMetadata } from '../app/data';

const CreatedBy = () => {
  const config = getConfig();
  const { data: courseMetadata } = useCourseMetadata();
  const [partners] = useCoursePartners(courseMetadata);

  if (!partners.length && !courseMetadata.activeCourseRun?.staff.length) {
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
                <Hyperlink
                  destination={partner.marketingUrl}
                  tabIndex="-1"
                  target="_blank"
                  showLaunchIcon={false}
                >
                  <Image src={partner.logoImageUrl} alt={`${partner.name} logo`} fluid />
                </Hyperlink>
              </div>
              <Hyperlink destination={partner.marketingUrl} target="_blank">
                {partner.name}
              </Hyperlink>
            </div>
          ))}
        </div>
      )}
      {courseMetadata.activeCourseRun?.staff.length > 0 && (
        <div className="row no-gutters mt-3">
          {courseMetadata.activeCourseRun.staff.map(staff => (
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

export default CreatedBy;
