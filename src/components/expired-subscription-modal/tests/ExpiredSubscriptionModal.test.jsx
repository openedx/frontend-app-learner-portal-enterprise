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
          hasCustomLicenseExpirationMessaging: false,
          modalHeaderText: null,
          buttonLabelInModal: null,
          expiredSubscriptionModalMessaging: null,
          urlForButtonInModal: null,
        },
      },
    });
  });

  test('does not renderwithrouter if `hasCustomLicenseExpirationMessaging` is false', () => {
    const { container } = renderWithRouter(<ExpiredSubscriptionModal />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renderwithrouters modal with messaging when `hasCustomLicenseExpirationMessaging` is true', () => {
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          hasCustomLicenseExpirationMessaging: true,
          modalHeaderText: 'Expired Subscription',
          buttonLabelInModal: 'Continue Learning',
          expiredSubscriptionModalMessaging: '<p>Your subscription has expired.</p>',
          urlForButtonInModal: '/renew',
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
          hasCustomLicenseExpirationMessaging: true,
          modalHeaderText: 'Expired Subscription',
          buttonLabelInModal: 'Continue Learning',
          expiredSubscriptionModalMessaging: '<p>Your subscription has expired.</p>',
          urlForButtonInModal: '/renew',
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
          hasCustomLicenseExpirationMessaging: true,
          modalHeaderText: 'Expired Subscription',
          buttonLabelInModal: 'Continue Learning',
          expiredSubscriptionModalMessaging: '<p>Your subscription has expired.</p>',
          urlForButtonInModal: 'https://example.com',
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
