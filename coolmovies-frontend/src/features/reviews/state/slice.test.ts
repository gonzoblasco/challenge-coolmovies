import reducer, { actions, ReviewsState } from './slice';


describe('reviews slice', () => {
  const initialState: ReviewsState = {
    filterPanelOpen: false,
  };

  it('should return the initial state', () => {
    expect(reducer(undefined, { type: 'unknown' })).toEqual(initialState);
  });

  describe('toggleFilterPanel', () => {
    it('should toggle filterPanelOpen', () => {
      const actual = reducer(initialState, actions.toggleFilterPanel());
      expect(actual.filterPanelOpen).toBe(true);
      
      const actual2 = reducer(actual, actions.toggleFilterPanel());
      expect(actual2.filterPanelOpen).toBe(false);
    });
  });
});

