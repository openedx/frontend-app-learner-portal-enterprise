import * as actions from '../actions';
import { valueArrayReducer, refinementsReducer } from '../reducer';
import { QUERY_PARAM_FOR_FEATURE_FLAGS, QUERY_PARAM_FOR_SEARCH_QUERY, QUERY_PARAM_FOR_PAGE } from '../constants';

describe('valueArrayReducer', () => {
  it('removes the item if it is the only item in the refinements array', () => {
    const initialState = ['foo'];
    expect(valueArrayReducer(initialState, actions.removeFromRefinementArray('subjects', 'foo'))).toEqual([]);
  });
  it('deletes only the item in question from the refinements array', () => {
    const initialState = ['foo', 'bar'];
    expect(valueArrayReducer(initialState, actions.removeFromRefinementArray('sujects', 'foo'))).toEqual(['bar']);
  });
  it('adds the item to the refinements array if it is not present - undefined initially', () => {
    const initialState = undefined;
    expect(valueArrayReducer(initialState, actions.addToRefinementArray('subjects', 'foo'))).toEqual(['foo']);
  });
  it('adds the item to an existing refinements array', () => {
    const initialState = ['bar'];
    expect(valueArrayReducer(initialState, actions.addToRefinementArray('subjects', 'foo'))).toEqual(['bar', 'foo']);
  });
});

describe('refinementsReducer', () => {
  it('sets refinements', () => {
    const initialState = { page: 4 };
    expect(refinementsReducer(initialState, actions.setRefinementAction('foo', 'bar'))).toEqual({ foo: 'bar' });
  });
  it('deletes refinements', () => {
    const initialState = { foo: 'bar', bears: 'rCool', page: 2 };
    expect(refinementsReducer(initialState, actions.deleteRefinementAction('foo'))).toEqual({ bears: 'rCool' });
  });
  it('sets multiple refinements, removing refinements that are not in the ignore list', () => {
    const initialState = { foo: 'bar', page: 2, q: 'bar' };
    const itemsToAdd = { baz: 'bop', bears: 'rCool' };
    expect(refinementsReducer(
      initialState,
      actions.setMultipleRefinementsAction({ baz: 'bop', bears: 'rCool', page: 2 }),
    )).toEqual({ page: 2, q: 'bar', ...itemsToAdd });
  });
  it('sets a refinement array value - refinement does not exist', () => {
    const initialState = { page: 2 };
    expect(refinementsReducer(initialState, actions.addToRefinementArray('foo', 'bar'))).toEqual({ foo: ['bar'] });
  });
  it('sets a refinement array value - refinement exists', () => {
    const initialState = { foo: ['baz'], page: 2 };
    expect(refinementsReducer(initialState, actions.addToRefinementArray('foo', 'bar'))).toEqual({ foo: ['baz', 'bar'] });
  });
  it('does not error when removing a refinement that does not exist', () => {
    const initialState = { bears: 'Rus', page: 2 };
    expect(refinementsReducer(initialState, actions.removeFromRefinementArray('foo', 'bar'))).toEqual(initialState);
  });
  it('removes an existing refinement array value', () => {
    const initialState = { foo: ['baz', 'bar'], page: 2 };
    expect(refinementsReducer(initialState, actions.removeFromRefinementArray('foo', 'bar'))).toEqual({ foo: ['baz'] });
  });
  [
    { initialState: { subjects: ['Kittens'], [QUERY_PARAM_FOR_PAGE]: 3 }, expectedResult: {} },
    { initialState: { foo: 'bar', [QUERY_PARAM_FOR_FEATURE_FLAGS]: 'featureName' }, expectedResult: { [QUERY_PARAM_FOR_FEATURE_FLAGS]: 'featureName' } },
    { initialState: { [QUERY_PARAM_FOR_SEARCH_QUERY]: 'foo' }, expectedResult: { [QUERY_PARAM_FOR_SEARCH_QUERY]: 'foo' } },
  ].forEach(({ initialState, expectedResult }, index) => {
    it(`clears all refinements ${index}`, () => {
      expect(refinementsReducer(initialState, actions.clearRefinementsAction())).toEqual(expectedResult);
    });
  });
});
