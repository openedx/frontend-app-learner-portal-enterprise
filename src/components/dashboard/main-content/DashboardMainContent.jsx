import React, { useContext, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import {
  Button, breakpoints, MediaQuery,
} from '@edx/paragon';

import { CourseEnrollments } from './course-enrollments';
import DashboardPopularCourses from './DashboardPopularCourses';

import SupportInformation from '../sidebar/SupportInformation';
import SubsidiesSummary from '../sidebar/SubsidiesSummary';
import { isExperimentVariant } from '../../../utils/optimizely';

import ProgramListingCard from '../../program-progress/ProgramListingCard';
import CourseRecommendationCard from '../../course/CourseRecommendationCard';

const DashboardMainContent = () => {
  const {
    enterpriseConfig: {
      name,
      slug,
      disableSearch,
    },
    authenticatedUser,
  } = useContext(AppContext);

  const userFirstName = useMemo(() => authenticatedUser?.name.split(' ').shift(), [authenticatedUser?.name]);

  const course = {
    key: "the-course-key",
    title: "My awesome course",
    owners: [
      {
        name: "Faber College",
        logoImageUrl: "https://www.edx.org/images/logos/edx-logo-elm.svg",
      },
    ],
    cardImageUrl: {
      src: "https://prod-discovery.edx-cdn.org/media/course/image/f1e7155d-81ea-4446-96a8-a0562da1934e-bc574122de79.small.jpg",
    },
  };

  const program = {
    uuid: "428c51ae-242d-4af9-80b9-c21a8777267b",
    title: "My test program",
    type: "fun!",
    progress: {
      inProgress: 2,
      completed: 1,
      notStarted: 10,
    },
    bannerImage: {
      large: {url: "https://www.edx.org/images/logos/edx-logo-elm.svg", height: 0, width: 0},
      medium: {url: "https://www.edx.org/images/logos/edx-logo-elm.svg", height: 0, width: 0},
      small: {url: "https://www.edx.org/images/logos/edx-logo-elm.svg", height: 0, width: 0},
      xSmall: {url: "https://www.edx.org/images/logos/edx-logo-elm.svg", height: 0, width: 0},
    },
    authoringOrganizations: [{
      key: "edX",
      name: "edX",
      logoImageUrl: "https://www.edx.org/images/logos/edx-logo-elm.svg",
    }],
  };

  return (
    <>
      <CourseRecommendationCard course={course} isPartnerRecommendation={true}/>
      {/* <ProgramListingCard program={program}/> */}
      {/* <h2 className="h1 mb-4"> */}
      {/*   {userFirstName ? `Welcome, ${userFirstName}!` : 'Welcome!'} */}
      {/* </h2> */}
      {/* <MediaQuery maxWidth={breakpoints.medium.maxWidth}> */}
      {/*   {matches => (matches ? ( */}
      {/*     <SubsidiesSummary /> */}
      {/*   ) : null)} */}
      {/* </MediaQuery> */}
      {/* <CourseEnrollments> */}
      {/*   {/\* The children below will only be rendered if there are no course enrollments. *\/} */}
      {/*   {disableSearch ? ( */}
      {/*     <p> */}
      {/*       You are not enrolled in any courses sponsored by {name}. */}
      {/*       Reach out to your administrator for instructions on how to start learning learning with edX! */}
      {/*     </p> */}
      {/*   ) : ( */}
      {/*     <> */}
      {/*       <p> */}
      {/*         Getting started with edX is easy. Simply find a course from your */}
      {/*         catalog, request enrollment, and get started on your learning journey. */}
      {/*       </p> */}
      {/*       <Button */}
      {/*         as={Link} */}
      {/*         to={`/${slug}/search`} */}
      {/*         className="btn-brand-primary d-block d-md-inline-block" */}
      {/*       > */}
      {/*         Find a course */}
      {/*       </Button> */}
      {/*     </> */}
      {/*   )} */}
      {/* </CourseEnrollments> */}

      {/* {isExperimentVariant(process.env.EXPERIMENT_1_ID, process.env.EXPERIMENT_1_VARIANT_1) && ( */}
      {/*   <DashboardPopularCourses /> */}
      {/* )} */}

      {/* <MediaQuery maxWidth={breakpoints.medium.maxWidth}> */}
      {/*   {matches => (matches ? <SupportInformation className="mt-5" /> : null)} */}
      {/* </MediaQuery> */}
    </>
  );
};

export default DashboardMainContent;
