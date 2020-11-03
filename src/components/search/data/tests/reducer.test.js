import * as actions from '../actions';
import { valueArrayReducer, refinementsReducer } from '../reducer';
import { QUERY_PARAM_FOR_FEATURE_FLAGS, QUERY_PARAM_FOR_SEARCH_QUERY, QUERY_PARAM_FOR_PAGE } from '../constants';

describe('valueArrayReducer', () => {
  it('deletes the item if it is the only item in the array', () => {
    const initialState = ['foo'];
    expect(valueArrayReducer(initialState, actions.removeArrayValue('subjects', 'foo'))).toEqual([]);
  });
  it('deletes only the item from the array', () => {
    const initialState = ['foo', 'bar'];
    expect(valueArrayReducer(initialState, actions.removeArrayValue('sujects', 'foo'))).toEqual(['bar']);
  });
  it('adds the item to the array if it is not present - undefined initially', () => {
    const initialState = undefined;
    expect(valueArrayReducer(initialState, actions.setArrayValue('subjects', 'foo'))).toEqual(['foo']);
  });
  it('adds the item to an existing array', () => {
    const initialState = ['bar'];
    expect(valueArrayReducer(initialState, actions.setArrayValue('subjects', 'foo'))).toEqual(['bar', 'foo']);
  });
});

describe('refinementsReducer', () => {
  it('sets keys', () => {
    const initialState = { page: 4 };
    expect(refinementsReducer(initialState, actions.setKeyAction('foo', 'bar'))).toEqual({ foo: 'bar' });
  });
  it('deletes keys', () => {
    const initialState = { foo: 'bar', bears: 'rCool', page: 2 };
    expect(refinementsReducer(initialState, actions.deleteKeyAction('foo'))).toEqual({ bears: 'rCool' });
  });
  it('sets multiple keys', () => {
    const initialState = { foo: 'bar', page: 2 };
    const itemsToAdd = { baz: 'bop', bears: 'rCool' };
    expect(refinementsReducer(
      initialState,
      actions.setMultipleKeysAction({ baz: 'bop', bears: 'rCool', page: 2 }),
    )).toEqual({ ...initialState, ...itemsToAdd });
  });
  it('sets an array value - key does not exist', () => {
    const initialState = { page: 2 };
    expect(refinementsReducer(initialState, actions.setArrayValue('foo', 'bar'))).toEqual({ foo: ['bar'] });
  });
  it('sets an array value - key exists', () => {
    const initialState = { foo: ['baz'], page: 2 };
    expect(refinementsReducer(initialState, actions.setArrayValue('foo', 'bar'))).toEqual({ foo: ['baz', 'bar'] });
  });
  it('does not error when removing a key that does not exist', () => {
    const initialState = { bears: 'Rus', page: 2 };
    expect(refinementsReducer(initialState, actions.removeArrayValue('foo', 'bar'))).toEqual(initialState);
  });
  it('removes an existing array value', () => {
    const initialState = { foo: ['baz', 'bar'], page: 2 };
    expect(refinementsReducer(initialState, actions.removeArrayValue('foo', 'bar'))).toEqual({ foo: ['baz'] });
  });
  [
    { initialState: { subjects: ['Kittens'], [QUERY_PARAM_FOR_PAGE]: 3 }, expectedResult: {} },
    { initialState: { foo: 'bar', [QUERY_PARAM_FOR_FEATURE_FLAGS]: 'featureName' }, expectedResult: { [QUERY_PARAM_FOR_FEATURE_FLAGS]: 'featureName' } },
    { initialState: { [QUERY_PARAM_FOR_SEARCH_QUERY]: 'foo' }, expectedResult: { [QUERY_PARAM_FOR_SEARCH_QUERY]: 'foo' } },
  ].forEach(({ initialState, expectedResult }, index) => {
    it(`clears all filters ${index}`, () => {
      expect(refinementsReducer(initialState, actions.clearFiltersAction())).toEqual(expectedResult);
    });
  });
});
