import renderer from 'react-test-renderer';
import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { ToastsContext } from '../../Toasts';
import Course from '../Course';
import { UserSubsidyContext } from '../../enterprise-user-subsidy';

const ORG_SLUG = 'aperture';
const COURSE_KEY = 'think-portal';

const APP_CONTEXT = {
  enterpriseConfig: {
    name: 'Aperture Laboratories',
    slug: 'aperture',
  },
  config: {
    MARKETING_SITE_BASE_URL: 'http://example.com',
  },
};

const ACTIVE_COURSE_RUN_UUID = 'active_course_run_uuid';

jest.mock('../data/hooks', () => ({
  useAllCourseData: jest.fn(() => {
    const courseData = {
      userEnrollments: [],
      userEntitlements: [],
      userSubsidyApplicableToCourse: {
        discountType: 'absolute',
        discountValue: 100,
        expirationDate: '2022-06-01',
        startDate: '2019-06-01',
        subsidyId: 'subsidy_id',
      },
      catalog: {
        catalogList: [],
      },
      courseDetails: {
        title: 'Thinking with portals',
        advertisedCourseRunUuid: ACTIVE_COURSE_RUN_UUID,
        courseRuns: [
          {
            isEnrollable: true,
            key: 'test-course-run-key',
            pacingType: 'self_paced',
            start: '2020-09-09T04:00:00Z',
            availability: 'Current',
            uuid: ACTIVE_COURSE_RUN_UUID,
          },
          { uuid: 'course_run_uuid_1', isEnrollable: true },
          { uuid: 'non_enrollable_run_uuid_1', isEnrollable: false },
          {
            uuid: 'archived_run_uuid_1',
            availability: 'Archived',
            isEnrollable: true,
          },
        ],
        fullDescription: '<p>Description</p>',
        prerequisitesRaw: '<p>Prerequisite</p>>',
        sponsors: [
          {
            name: 'Shower Curtains',
            marketingUrl: 'sponsor-url',
          },
        ],
        programs: [],
        skills: [],
      },
    };

    const fetchError = null;

    return [courseData, fetchError];
  }),

  useExtractAndRemoveSearchParamsFromURL: jest.fn(() => ({})),
  useCoursePartners: jest.fn(() => {
    const partners = [];
    const label = '';
    return [partners, label];
  }),

  useCourseSubjects: jest.fn(() => ({
    subjects: [],
    primarySubject: null,
  })),

  useCourseRunWeeksToComplete: jest.fn(() => {
    const weeksToComplete = 7;
    const label = 'weeks';

    return [weeksToComplete, label];
  }),

  useCourseTranscriptLanguages: jest.fn(() => {
    const languages = [];
    const label = undefined;

    return [languages, label];
  }),

  useCoursePacingType: jest.fn(() => {
    const pacingType = 'self_paced';
    const pacintTypeContent = 'Self-paced on your time';

    return [pacingType, pacintTypeContent];
  }),

  useCoursePriceForUserSubsidy: jest.fn(() => {
    const coursePrice = {
      list: 200,
      discounted: 150,
    };
    const currency = 'USD';

    return [coursePrice, currency];
  }),

  useCourseEnrollmentUrl: jest.fn(() => (
    'http://example.com'
  )),

  useTrackSearchConversionClickHandler: jest.fn(() => jest.fn()),
}));

const TOAST_CONTEXT = {
  addToast: jest.fn(),
};

const SUBSIDY_CONTEXT = {
  subscriptionLicense: {
    uuid: 'subscription_uuid',
  },
  offers: {
    offers: [],
    offersCount: 0,
  },
};

describe('Course', () => {
  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should render the expected HTML', async () => {
    const url = `/${ORG_SLUG}/course/${COURSE_KEY}?course_run_key=run-key`;
    let tree;

    await renderer.act(async () => {
      tree = await renderer.create(
        <AppContext.Provider value={APP_CONTEXT}>
          <ToastsContext.Provider value={TOAST_CONTEXT}>
            <UserSubsidyContext.Provider value={SUBSIDY_CONTEXT}>
              <MemoryRouter
                initialIndex={0}
                initialEntries={[url]}
              >
                <div>
                  <Route path="/:enterpriseSlug/course/:courseKey">
                    <Course />
                  </Route>
                </div>
              </MemoryRouter>
            </UserSubsidyContext.Provider>
          </ToastsContext.Provider>
        </AppContext.Provider>,
      );
    });

    expect(tree.toJSON()).toMatchSnapshot();
  });
});
