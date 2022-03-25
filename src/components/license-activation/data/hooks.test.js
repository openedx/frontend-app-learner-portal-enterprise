import { renderHook } from '@testing-library/react-hooks';
import * as enterpriseUtils from '@edx/frontend-enterprise-utils';
import * as logging from '@edx/frontend-platform/logging';
import { useLicenseActivation } from './hooks';
import * as service from './service';

jest.mock('./service', () => ({
  activateLicense: jest.fn().mockResolvedValue({}),
}));
jest.mock('@edx/frontend-enterprise-utils');
jest.mock('@edx/frontend-platform/logging');

describe('useLicenseActivation', () => {
  const basicProps = { enterpriseUUID: 'enterprise-uuid', activationKey: 'activation-key', autoActivated: true };

  it('should activate license and send enterprise track event', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useLicenseActivation(basicProps));
    expect(service.activateLicense).toHaveBeenCalledWith(basicProps.activationKey);

    await waitForNextUpdate();
    expect(result.current).toEqual([true, false]);
    expect(enterpriseUtils.sendEnterpriseTrackEvent).toHaveBeenCalledWith(
      basicProps.enterpriseUUID,
      'edx.ui.enterprise.license-activation.license-activated',
      {
        autoActivated: basicProps.autoActivated,
      },
    );
  });

  it('handle errors', async () => {
    const error = new Error('uh oh');
    service.activateLicense.mockRejectedValue(error);
    const { result, waitForNextUpdate } = renderHook(() => useLicenseActivation(basicProps));
    expect(service.activateLicense).toHaveBeenCalledWith(basicProps.activationKey);

    await waitForNextUpdate();
    expect(result.current).toEqual([false, true]);
    expect(logging.logError).toHaveBeenCalledWith(error);
  });
});
