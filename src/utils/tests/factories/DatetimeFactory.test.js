import { createManyMocks } from './utils';
import { DatetimeFactory } from './DatetimeFactory';

describe('DatetimeFactory', () => {
  test('Increment', () => {
    const factory = new DatetimeFactory('2022-01-01 00:00', {
      increment: { day: 1 },
      format: 'YYYY-MM-DD HH:mm',
    });

    const results = createManyMocks(3, factory);

    expect(results).toEqual([
      '2022-01-01 00:00',
      '2022-01-02 00:00',
      '2022-01-03 00:00',
    ]);
  });

  test('Decrement', () => {
    const factory = new DatetimeFactory('2022-01-03 00:00', {
      decrement: { day: 1 },
      format: 'YYYY-MM-DD HH:mm',
    });

    const results = createManyMocks(3, factory);

    expect(results).toEqual([
      '2022-01-03 00:00',
      '2022-01-02 00:00',
      '2022-01-01 00:00',
    ]);
  });

  test('Clone is independent', () => {
    const factory = new DatetimeFactory('2022-01-01 00:00', {
      increment: { day: 1 },
      format: 'YYYY-MM-DD HH:mm',
    });
    const clone = factory.clone();

    const results = createManyMocks(3, factory);
    const cloneResults = createManyMocks(3, clone);

    expect(results).toEqual([
      '2022-01-01 00:00',
      '2022-01-02 00:00',
      '2022-01-03 00:00',
    ]);
    expect(results).toEqual(cloneResults);
  });
});
