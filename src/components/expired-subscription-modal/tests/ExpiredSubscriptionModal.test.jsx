import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';
import ExpiredSubscriptionModal from '../index';
import { useSubscriptions } from '../../app/data';
import { renderWithRouter } from '../../../utils/tests';

jest.mock('../../app/data', () => ({
  ...jest.requireActual('../../app/data'),
  useSubscriptions: jest.fn(),
}));

describe('<ExpiredSubscriptionModal />', () => {
  beforeEach(() => {
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          hasCustomLicenseExpirationMessagingV2: false,
          modalHeaderTextV2: null,
          buttonLabelInModalV2: null,
          expiredSubscriptionModalMessagingV2: null,
          urlForButtonInModalV2: null,
        },
        subscriptionLicense: {
          uuid: '123',
        },
        subscriptionPlan: {
          isCurrent: true,
        },
      },
    });
  });

  test('does not renderwithrouter if `hasCustomLicenseExpirationMessagingV2` is false', () => {
    const { container } = renderWithRouter(<ExpiredSubscriptionModal />);
    expect(container).toBeEmptyDOMElement();
  });

  test('does not renderwithrouter if learner has a current license', () => {
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          hasCustomLicenseExpirationMessagingV2: true,
          modalHeaderTextV2: 'Expired Subscription',
          buttonLabelInModalV2: 'Continue Learning',
          expiredSubscriptionModalMessagingV2: '<p>Your subscription has expired.</p>',
          urlForButtonInModalV2: '/renew',
        },
        subscriptionLicense: {
          uuid: '123',
        },
        subscriptionPlan: {
          isCurrent: true,
        },
      },
    });

    const { container } = renderWithRouter(<ExpiredSubscriptionModal />);
    expect(container).toBeEmptyDOMElement();
  });

  test('does not renderwithrouter if learner does not have a license', () => {
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          hasCustomLicenseExpirationMessagingV2: true,
          modalHeaderTextV2: 'Expired Subscription',
          buttonLabelInModalV2: 'Continue Learning',
          expiredSubscriptionModalMessagingV2: '<p>Your subscription has expired.</p>',
          urlForButtonInModalV2: '/renew',
        },
        subscriptionLicense: null,
        subscriptionPlan: null,
      },
    });

    const { container } = renderWithRouter(<ExpiredSubscriptionModal />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renderwithrouters modal with messaging when `hasCustomLicenseExpirationMessagingV2` is true and license is expired', () => {
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          hasCustomLicenseExpirationMessagingV2: true,
          modalHeaderTextV2: 'Expired Subscription',
          buttonLabelInModalV2: 'Continue Learning',
          expiredSubscriptionModalMessagingV2: '<p>Your subscription has expired.</p>',
          urlForButtonInModalV2: '/renew',
        },
        subscriptionLicense: {
          uuid: '123',
        },
        subscriptionPlan: {
          isCurrent: false,
        },
      },
    });

    renderWithRouter(<ExpiredSubscriptionModal />);

    expect(screen.getByText('Expired Subscription')).toBeInTheDocument();
    expect(screen.getByText('Continue Learning')).toBeInTheDocument();
  });

  test('does not renderwithrouter modal if no customer agreement data is present', () => {
    useSubscriptions.mockReturnValue({ data: { customerAgreement: null } });
    const { container } = renderWithRouter(<ExpiredSubscriptionModal />);
    expect(container).toBeEmptyDOMElement();
  });

  test('Close button (cross) should not be available, making the modal truly blocking', () => {
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          hasCustomLicenseExpirationMessagingV2: true,
          modalHeaderTextV2: 'Expired Subscription',
          buttonLabelInModalV2: 'Continue Learning',
          expiredSubscriptionModalMessagingV2: '<p>Your subscription has expired.</p>',
          urlForButtonInModalV2: '/renew',
        },
        subscriptionLicense: {
          uuid: '123',
        },
        subscriptionPlan: {
          isCurrent: false,
        },
      },
    });

    renderWithRouter(<ExpiredSubscriptionModal />);
    expect(screen.queryByLabelText(/close/i)).not.toBeInTheDocument();
  });
  test('clicks on Continue Learning button', () => {
    // Mock useSubscriptions
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          hasCustomLicenseExpirationMessagingV2: true,
          modalHeaderTextV2: 'Expired Subscription',
          buttonLabelInModalV2: 'Continue Learning',
          expiredSubscriptionModalMessagingV2: '<p>Your subscription has expired.</p>',
          urlForButtonInModalV2: 'https://example.com',
        },
        subscriptionLicense: {
          uuid: '123',
        },
        subscriptionPlan: {
          isCurrent: false,
        },
      },
    });

    // Render the component
    renderWithRouter(<ExpiredSubscriptionModal />);

    // Find the Continue Learning button
    const continueButton = screen.getByText('Continue Learning');

    // Simulate a click on the button
    userEvent.click(continueButton);

    // Check that the button was rendered and clicked
    expect(continueButton).toBeInTheDocument();
  });
});
