import { getConfig } from '@edx/frontend-platform';
import { breakpoints, Hyperlink, MediaQuery } from '@openedx/paragon';

import { FormattedMessage, useIntl } from '@edx/frontend-platform/i18n';
import { PreviewExpand } from '../preview-expand';
import CourseSidebar from './CourseSidebar';
import CreatedBy from './CreatedBy';
import VerifiedCertPitch from './VerifiedCertPitch';
import { useCourseMetadata } from '../app/data';

function formatSponsorTextList(sponsors) {
  const names = sponsors.map(sponsor => sponsor.name);
  let sponsorTextList;

  if (names.length === 1) {
    [sponsorTextList] = names;
  }

  if (names.length === 2) {
    sponsorTextList = names.join(' and ');
  }

  if (names.length > 2) {
    const lastName = names.pop();
    sponsorTextList = `${names.join(', ')}, and ${lastName}`;
  }

  return sponsorTextList;
}

const CourseMainContent = () => {
  const config = getConfig();
  const { data: courseMetadata } = useCourseMetadata();
  const intl = useIntl();
  return (
    <>
      <MediaQuery minWidth={breakpoints.large.minWidth}>
        {matches => !matches && (
          <div className="mb-5">
            <CourseSidebar />
          </div>
        )}
      </MediaQuery>
      {courseMetadata.fullDescription && (
        <PreviewExpand
          className="mb-5"
          cta={{
            labelToExpand: intl.formatMessage({
              id: 'enterprise.course.about.course.sidebar.about.expand',
              defaultMessage: 'More about this course',
              description: 'Label for the expand button to show more about the course.',
            }),
            labelToMinimize: intl.formatMessage({
              id: 'enterprise.course.about.course.sidebar.about.collapse',
              defaultMessage: 'Collapse about this course',
              description: 'Label for the collapse button to hide more about the course.',
            }),
            id: 'about-this-course',
          }}
          heading={(
            <h3>
              {intl.formatMessage({
                id: 'enterprise.course.about.course.sidebar.about.heading',
                defaultMessage: 'About this course',
                description: 'Heading for the section that describes the course.',
              })}
            </h3>
          )}
        >
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: courseMetadata.fullDescription }} />
        </PreviewExpand>
      )}
      {courseMetadata.sponsors?.length > 0 && (
        <div className="mb-5">
          <h3>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.sponsored.by"
              defaultMessage="Sponsored by"
              description="Heading for the section that lists the sponsors of the course."
            />
          </h3>
          <div className="row no-gutters mt-3">
            {courseMetadata.sponsors.map((sponsor) => (
              <div className="col-lg-6 mb-3" key={sponsor.name}>
                <div className="mb-2">
                  <a
                    href={`${config.MARKETING_SITE_BASE_URL}/${sponsor.marketingUrl}`}
                    aria-hidden="true"
                    tabIndex="-1"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src={sponsor.logoImageUrl} alt={`${sponsor.name} logo`} />
                  </a>
                </div>
                <Hyperlink
                  destination={`${config.MARKETING_SITE_BASE_URL}/${sponsor.marketingUrl}`}
                  target="_blank"
                >
                  {sponsor.name}
                </Hyperlink>
              </div>
            ))}
          </div>
          <p>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.sponsored.by.description"
              defaultMessage="The production of this course would not have been possible without the generous contributions of {sponsersList}."
              description="Description for the section that lists the contributions sponsors of the course."
              values={{
                sponsersList: formatSponsorTextList(courseMetadata.sponsors),
              }}
            />
          </p>
        </div>
      )}
      {courseMetadata.outcome && (
        <PreviewExpand
          className="mb-5"
          cta={{
            labelToExpand: intl.formatMessage({
              id: 'enterprise.course.about.course.sidebar.outcome.expand',
              defaultMessage: "Expand what you'll learn",
              description: 'Label for the expand button to show what you will learn in the course.',
            }),
            labelToMinimize: intl.formatMessage({
              id: 'enterprise.course.about.course.sidebar.outcome.collapse',
              defaultMessage: "Collapse what you'll learn",
              description: 'Label for the collapse button to hide what you will learn in the course.',
            }),
            id: 'what-youll-learn',
          }}
          heading={(
            <h3>
              {intl.formatMessage({
                id: 'enterprise.course.about.course.sidebar.outcome.heading',
                defaultMessage: "What you'll learn",
                description: 'Heading for the section that lists what you will learn in the course.',
              })}
            </h3>
          )}
        >
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: courseMetadata.outcome }} />
        </PreviewExpand>
      )}
      {courseMetadata.syllabusRaw && (
        <PreviewExpand
          className="mb-5"
          cta={{
            labelToExpand: intl.formatMessage({
              id: 'enterprise.course.about.course.sidebar.syllabus.expand',
              defaultMessage: 'Expand syllabus',
              description: 'Label for the expand button to show the syllabus of the course.',
            }),
            labelToMinimize: intl.formatMessage({
              id: 'enterprise.course.about.course.sidebar.syllabus.collapse',
              defaultMessage: 'Collapse syllabus',
              description: 'Label for the collapse button to hide the syllabus of the course.',
            }),
            id: 'course-syllabus',
          }}
          heading={(
            <h3>
              {
                intl.formatMessage({
                  id: 'enterprise.course.about.course.sidebar.syllabus.heading',
                  defaultMessage: 'Syllabus',
                  description: 'Heading for the section that lists the syllabus of the course.',
                })
              }
            </h3>
          )}
        >
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: courseMetadata.syllabusRaw }} />
        </PreviewExpand>
      )}
      <CreatedBy />
      {courseMetadata.activeCourseRun.type?.includes('verified') && (
        <VerifiedCertPitch />
      )}
      {courseMetadata.learnerTestimonials && (
        <div className="mb-5">
          <h3>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.learner.testimonials"
              defaultMessage="Learner testimonials"
              description="Heading for the section that lists learner testimonials."
            />
          </h3>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: courseMetadata.learnerTestimonials }} />
        </div>
      )}
      {courseMetadata.faq && (
        <div className="mb-5">
          <h3>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.frequently.asked.questions"
              defaultMessage="Frequently asked questions"
              description="Heading for the section that lists frequently asked questions."
            />
          </h3>
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: courseMetadata.faq }} />
        </div>
      )}
      {courseMetadata.additionalInformation && (
        <div className="mb-5">
          {/* eslint-disable-next-line react/no-danger */}
          <div dangerouslySetInnerHTML={{ __html: courseMetadata.additionalInformation }} />
        </div>
      )}
      {courseMetadata.activeCourseRun.hasOfacRestrictions && (
        <div className="mb-5">
          <h3>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.who.can.take.this.course"
              defaultMessage="Who can take this course?"
              description="Heading for the section that lists who can take this course."
            />
          </h3>
          <p>
            <FormattedMessage
              id="enterprise.course.about.course.sidebar.who.can.take.this.course.description"
              defaultMessage="Unfortunately, learners from one or more of the following countries or regions will not
              be able to register for this course: Iran, Cuba and the Crimea region of Ukraine.
              While edX has sought licenses from the U.S. Office of Foreign Assets Control (OFAC) to
              offer our courses to learners in these countries and regions, the licenses we have
              received are not broad enough to allow us to offer this course in all locations. EdX
              truly regrets that U.S. sanctions prevent us from offering all of our courses to
              everyone, no matter where they live."
              description="Description for the section that lists who can take this course. OFAC is the brnad name"
            />
          </p>
        </div>
      )}
    </>
  );
};

export default CourseMainContent;
