import { constructFilter } from './helpers';

describe('constructFilter', () => {
  it('should ignore null rating', () => {
    const filter = constructFilter({
      ratingFilter: null,
      userFilter: null,
      searchFilter: '',
    });
    expect(filter).toBeUndefined();
  });

  it('should include rating filter for value 5', () => {
    const filter = constructFilter({
      ratingFilter: 5,
      userFilter: null,
      searchFilter: '',
    });
    expect(filter).toEqual({
      and: [{ rating: { equalTo: 5 } }],
    });
  });

  it('should include rating filter for value 0', () => {
    const filter = constructFilter({
      ratingFilter: 0,
      userFilter: null,
      searchFilter: '',
    });
    expect(filter).toEqual({
      and: [{ rating: { equalTo: 0 } }],
    });
  });

  it('should include user filter', () => {
    const filter = constructFilter({
      ratingFilter: null,
      userFilter: 'user-123',
      searchFilter: '',
    });
    expect(filter).toEqual({
      and: [{ userReviewerId: { equalTo: 'user-123' } }],
    });
  });

  it('should include search filter', () => {
    const filter = constructFilter({
      ratingFilter: null,
      userFilter: null,
      searchFilter: 'great',
    });
    expect(filter).toEqual({
      and: [
        {
          or: [
            { title: { includesInsensitive: 'great' } },
            { body: { includesInsensitive: 'great' } },
          ],
        },
      ],
    });
  });

  it('should combine all filters', () => {
    const filter = constructFilter({
      ratingFilter: 3,
      userFilter: 'user-123',
      searchFilter: 'bad',
    });
    expect(filter).toEqual({
      and: [
        { rating: { equalTo: 3 } },
        { userReviewerId: { equalTo: 'user-123' } },
        {
          or: [
            { title: { includesInsensitive: 'bad' } },
            { body: { includesInsensitive: 'bad' } },
          ],
        },
      ],
    });
  });
});
