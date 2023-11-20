import { transformRedeemablePoliciesData } from './utils';

describe('transformRedeemablePoliciesData', () => {
  test('transforms policies data by attaching subsidy expiration date to assignments', () => {
    const mockPolicies = [
      {
        subsidy_expiration_date: '2024-03-15T18:48:26Z',
        learner_content_assignments: [
          { assignmentId: 1 },
          { assignmentId: 2 },
        ],
      },
      {
        subsidy_expiration_date: '2023-12-31T23:59:59Z',
        learner_content_assignments: [
          { assignmentId: 3 },
        ],
      },
    ];

    const expectedTransformedData = [
      {
        subsidy_expiration_date: '2024-03-15T18:48:26Z',
        learner_content_assignments: [
          { assignmentId: 1, subsidy_expiration_date: '2024-03-15T18:48:26Z' },
          { assignmentId: 2, subsidy_expiration_date: '2024-03-15T18:48:26Z' },
        ],
      },
      {
        subsidy_expiration_date: '2023-12-31T23:59:59Z',
        learner_content_assignments: [
          { assignmentId: 3, subsidy_expiration_date: '2023-12-31T23:59:59Z' },
        ],
      },
    ];

    const transformedData = transformRedeemablePoliciesData(mockPolicies);
    expect(transformedData).toEqual(expectedTransformedData);
  });
});
