import { screen } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
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
          expiredSubscriptionModalMessaging: null,
          urlForExpiredModal: null,
          hyperLinkTextForExpiredModal: null,
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
          expiredSubscriptionModalMessaging: 'Your subscription has expired.',
          urlForExpiredModal: '/renew',
          hyperLinkTextForExpiredModal: 'Click here to renew',
        },
      },
    });

    renderWithRouter(<ExpiredSubscriptionModal />);

    expect(screen.getByText('Your subscription has expired.')).toBeInTheDocument();
    expect(screen.getByText('Click here to renew')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Click here to renew' })).toHaveAttribute('href', '/renew');
  });

  test('does not renderwithrouter modal if no customer agreement data is present', () => {
    useSubscriptions.mockReturnValue({ data: { customerAgreement: null } });
    const { container } = renderWithRouter(<ExpiredSubscriptionModal />);
    expect(container).toBeEmptyDOMElement();
  });

  test('renderwithrouters close button in modal', () => {
    useSubscriptions.mockReturnValue({
      data: {
        customerAgreement: {
          hasCustomLicenseExpirationMessaging: true,
          expiredSubscriptionModalMessaging: 'Subscription expired',
          urlForExpiredModal: '/renew',
          hyperLinkTextForExpiredModal: 'Renew',
        },
      },
    });

    renderWithRouter(<ExpiredSubscriptionModal />);
    expect(screen.getByRole('button', { name: /close/i })).toBeInTheDocument();
  });
});
