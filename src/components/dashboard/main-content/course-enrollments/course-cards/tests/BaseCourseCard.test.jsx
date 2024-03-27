import React from 'react';
import { AppContext } from '@edx/frontend-platform/react';
import { renderWithRouter } from '@edx/frontend-enterprise-utils';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import { QueryClientProvider } from '@tanstack/react-query';

import dayjs from '../../../../../../utils/dayjs';
import BaseCourseCard from '../BaseCourseCard';
import { ToastsContext } from '../../../../../Toasts';
import { useEnterpriseCustomer } from '../../../../../app/data';

import { queryClient } from '../../../../../../utils/tests';
import { authenticatedUserFactory, enterpriseCustomerFactory } from '../../../../../app/data/services/data/__factories__';

jest.mock('@edx/frontend-enterprise-utils', () => ({
  ...jest.requireActual('@edx/frontend-enterprise-utils'),
  sendEnterpriseTrackEvent: jest.fn(),
}));

jest.mock('../../../../../app/data', () => ({
  ...jest.requireActual('../../../../../app/data'),
  useEnterpriseCustomer: jest.fn(),
}));

const mockEnterpriseCustomer = enterpriseCustomerFactory();
const mockAuthenticatedUser = authenticatedUserFactory();

describe('<BaseCourseCard />', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useEnterpriseCustomer.mockReturnValue({ data: mockEnterpriseCustomer });
  });

  describe('email settings modal', () => {
    beforeEach(async () => {
      renderWithRouter((
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <BaseCourseCard
            type="completed"
            title="edX Demonstration Course"
            linkToCourse="https://edx.org"
            courseRunId="my+course+key"
            mode="verified"
            hasEmailsEnabled
          />
        </AppContext.Provider>
      ));
      // open email settings modal
      userEvent.click(screen.getByLabelText('course settings for edX Demonstration Course'));
      await waitFor(() => {
        expect(screen.getByRole('menuitem')).toBeInTheDocument();
      });
      userEvent.click(screen.getByRole('menuitem'));
      await waitFor(() => {
        expect(screen.getByRole('dialog').parentElement.getAttribute('class')).toContain('show');
      });
    });

    it('test modal close/cancel', async () => {
      userEvent.click(screen.getByTestId('modal-footer-btn'));
      await waitFor(() => {
        expect(screen.getByRole('dialog').parentElement.getAttribute('class')).not.toContain('show');
      });
    });
  });

  describe('unenroll modal', () => {
    const mockAddToast = jest.fn();

    beforeEach(async () => {
      jest.clearAllMocks();
      renderWithRouter((
        <QueryClientProvider client={queryClient()}>
          <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
            <ToastsContext.Provider value={{ addToast: mockAddToast }}>
              <BaseCourseCard
                type="in_progress"
                title="edX Demonstration Course"
                linkToCourse="https://edx.org"
                courseRunId="my+course+key"
                mode="verified"
                canUnenroll
              />
            </ToastsContext.Provider>
          </AppContext.Provider>
        </QueryClientProvider>
      ));
      // open unenroll modal
      userEvent.click(screen.getByLabelText('course settings for edX Demonstration Course'));
      await waitFor(() => {
        expect(screen.getByRole('menuitem')).toBeInTheDocument();
      });
      userEvent.click(screen.getByRole('menuitem'));
      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });
      expect(screen.getByText('Unenroll from course?')).toBeInTheDocument();
    });

    it('test modal close/cancel', async () => {
      userEvent.click(screen.getByRole('button', { name: 'Keep learning' }));
      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });
    });
  });

  it('should render Skeleton if isLoading = true', () => {
    renderWithRouter(
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <BaseCourseCard
          type="completed"
          title="edX Demonstration Course"
          linkToCourse="https://edx.org"
          courseRunId="my+course+key"
          mode="verified"
          hasEmailsEnabled
          isLoading
        />
      </AppContext.Provider>,
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('renders with different startDate values', () => {
    const today = dayjs().toISOString();
    const yesterday = dayjs().subtract(1, 'day').toISOString();
    const tomorrow = dayjs().add(1, 'day').toISOString();

    [today, yesterday, tomorrow].forEach(startDate => {
      const formattedStartDate = dayjs(startDate).format('MMMM Do, YYYY');
      const isCourseStarted = dayjs(startDate) <= dayjs();

      renderWithRouter(
        <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
          <BaseCourseCard
            type="in_progress"
            title="edX Demonstration Course"
            linkToCourse="https://edx.org"
            courseRunId="my+course+key"
            hasEmailsEnabled
            courseType="executive-education-2u"
            productSource="2u"
            mode="executive-education"
            startDate={startDate}
            orgName="some_name"
            pacing="self"
          />
        </AppContext.Provider>,
      );
      if (!isCourseStarted) {
        expect(screen.getByText(`Starts ${formattedStartDate}`)).toBeInTheDocument();
      } else {
        expect(screen.queryByText(`Starts ${formattedStartDate}`)).not.toBeInTheDocument();
      }
    });
  });

  it('renders endDate based on the course state', () => {
    const startDate = dayjs().subtract(7, 'days').toISOString();
    const endDate = dayjs().add(7, 'days').toISOString();
    const formattedEndDate = dayjs(endDate).format('MMMM Do, YYYY');
    const type = 'in_progress';

    renderWithRouter(
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <BaseCourseCard
          type={type}
          title="edX Demonstration Course"
          linkToCourse="https://edx.org"
          courseRunId="my+course+key"
          hasEmailsEnabled
          startDate={startDate}
          endDate={endDate}
          mode="executive-education"
          orgName="some_name"
          pacing="self"
        />
      </AppContext.Provider>,
    );

    const shouldRenderEndDate = dayjs(startDate) <= dayjs() && type !== 'completed';
    if (shouldRenderEndDate) {
      expect(screen.getByText(`Ends ${formattedEndDate}`)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(`Ends ${formattedEndDate}`)).not.toBeInTheDocument();
    }
  });

  it('renders Enroll By Date if the user is not enrolled', () => {
    const enrollBy = dayjs().add(14, 'days').toISOString();
    const formattedEnrollByDate = dayjs(enrollBy).format('MMMM Do, YYYY');
    const courseRunStatus = 'assigned';

    renderWithRouter(
      <AppContext.Provider value={{ authenticatedUser: mockAuthenticatedUser }}>
        <BaseCourseCard
          type="assigned"
          courseRunStatus={courseRunStatus}
          title="edX Demonstration Course"
          linkToCourse="https://edx.org"
          courseRunId="my+course+key"
          mode="verified"
          hasEmailsEnabled
          enrollBy={enrollBy}
        />
      </AppContext.Provider>,
    );

    const isAssigned = courseRunStatus === 'assigned';
    if (isAssigned) {
      expect(screen.getByText(`Enroll by ${formattedEnrollByDate}`)).toBeInTheDocument();
    } else {
      expect(screen.queryByText(`Enroll by ${formattedEnrollByDate}`)).not.toBeInTheDocument();
    }
  });
});
