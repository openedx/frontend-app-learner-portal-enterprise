import queries from './queryKeyFactory';
import { queryCanRequest } from './queries';

jest.mock('./queryKeyFactory');

const mockQueries = queries as jest.Mocked<typeof queries>;

describe('queries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('queryCanRequest', () => {
    it('should return the correct query structure for canRequest', () => {
      const mockCanRequest = jest.fn().mockReturnValue('canRequestQuery');
      const mockCourse = jest.fn(() => ({
        _ctx: {
          canRequest: mockCanRequest,
        },
      }));
      const mockEnterpriseCustomer = jest.fn(() => ({
        _ctx: {
          course: mockCourse,
        },
      }));

      mockQueries.enterprise = {
        enterpriseCustomer: mockEnterpriseCustomer,
      } as any;

      const enterpriseUuid = 'test-enterprise-uuid';
      const courseKey = 'test-course-key';

      const result = queryCanRequest(enterpriseUuid, courseKey);

      expect(mockEnterpriseCustomer).toHaveBeenCalledWith(enterpriseUuid);
      expect(mockCourse).toHaveBeenCalledWith(courseKey);
      expect(mockCanRequest).toHaveBeenCalled();
      expect(result).toBe('canRequestQuery');
    });
  });
});
