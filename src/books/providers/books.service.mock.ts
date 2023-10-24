/* eslint-disable max-lines */
/* eslint-disable max-len */
// NOTE: We mimic only two books's data for convenience

export const mockBooksSearchQueryFromOpenLibrary = {
  numFound: 28278,
  start: 0,
  numFoundExact: true,
  docs: [
    {
      key: '/works/OL2700647W',
      cover_edition_key: 'OL11824223M',
      author_name: [
        'Algernon Blackwood',
      ],
    },
    {
      key: '/works/OL8470691W',
      cover_edition_key: 'OL9467573M',
      author_name: [
        'Guy Newell Boothby',
      ],
    },
  ],
  num_found: 28278,
  q: 'subject:horror',
  offset: null,
};

export const keyData1 = {
  first_publish_date: 'June 1993',
  key: '/works/OL2700647W',
  title: 'The Empty House and Other Ghost Stories',
  authors: [
    {
      author: {
        key: '/authors/OL394726A',
      },
      type: {
        key: '/type/author_role',
      },
    },
  ],
  type: {
    key: '/type/work',
  },
  covers: [
    2808629,
    9010167,
    10532502,
    11076757,
    11543016,
  ],
  description: 'Collection of short fiction horror stories by the weird fiction writer Algernon Blackwood (1869-1951).',
  subjects: [
    'Fiction, horror',
    'Horror tales',
    'Short stories',
    'English literature',
  ],
  lc_classifications: [
    'PR6003 L3 E6 1969',
  ],
  latest_revision: 14,
  revision: 14,
  created: {
    type: '/type/datetime',
    value: '2009-12-10T00:15:33.983161',
  },
  last_modified: {
    type: '/type/datetime',
    value: '2022-12-05T21:14:28.924388',
  },
};
export const keyEditionData1 = {
  publishers: [
    '1st World Library - Literary Society',
  ],
  weight: '14.2 ounces',
  covers: [
    2808629,
  ],
  physical_format: 'Hardcover',
  last_modified: {
    type: '/type/datetime',
    value: '2011-04-27T14:35:26.809112',
  },
  latest_revision: 4,
  key: '/books/OL11824223M',
  authors: [
    {
      key: '/authors/OL394726A',
    },
  ],
  subjects: [
    'Collections & anthologies of various literary forms',
    'General',
    'Literary Collections / General',
    'Literary Collections',
    'Literature - Classics / Criticism',
    'Literature: Classics',
  ],
  languages: [
    {
      key: '/languages/eng',
    },
  ],
  title: 'The Empty House And Other Ghost Stories',
  number_of_pages: 212,
  created: {
    type: '/type/datetime',
    value: '2008-04-30T20:50:18.033121',
  },
  isbn_13: [
    '9781421838212',
  ],
  isbn_10: [
    '1421838214',
  ],
  publish_date: 'April 15, 2007',
  oclc_numbers: [
    '156806644',
  ],
  works: [
    {
      key: '/works/OL2700647W',
    },
  ],
  type: {
    key: '/type/edition',
  },
  physical_dimensions: '8.5 x 5.5 x 0.6 inches',
  revision: 4,
};

export const keyData2 = {
  title: "Dr. Nikola's Experiment",
  covers: [
    1979464,
    9182322,
  ],
  key: '/works/OL8470691W',
  authors: [
    {
      type: {
        key: '/type/author_role',
      },
      author: {
        key: '/authors/OL107877A',
      },
    },
  ],
  type: {
    key: '/type/work',
  },
  subjects: [
    'Fiction, fantasy, general',
    'Fiction, horror',
  ],
  first_publish_date: '1981',
  latest_revision: 5,
  revision: 5,
  created: {
    type: '/type/datetime',
    value: '2009-12-10T22:50:12.244480',
  },
  last_modified: {
    type: '/type/datetime',
    value: '2023-09-30T14:43:14.370481',
  },
};
export const keyEditionData2 = {
  publishers: [
    'Borgo Press',
  ],
  weight: '10.1 ounces',
  covers: [
    1979464,
  ],
  physical_format: 'Paperback',
  key: '/books/OL9467573M',
  authors: [
    {
      key: '/authors/OL107877A',
    },
  ],
  subjects: [
    'General & Literary Fiction',
    'Fiction',
    'Fiction - General',
    'General',
    'Fiction / General',
  ],
  isbn_13: [
    '9781592248384',
  ],
  languages: [
    {
      key: '/languages/eng',
    },
  ],
  title: "Dr. Nikola's Experiment",
  number_of_pages: 188,
  first_sentence: {
    type: '/type/text',
    value: 'IT is sad enough at any time for a man to be compelled to confess himself a failure, but I think it will be admitted that it is doubly so at that period of his career when he is still young enough to have some flickering sparks of ambition left, while he is old enough to be able to appreciate at their proper value the overwhelming odds against which he has been battling so long and unsuccessfully.',
  },
  isbn_10: [
    '1592248381',
  ],
  publish_date: 'November 1, 2002',
  works: [
    {
      key: '/works/OL8470691W',
    },
  ],
  type: {
    key: '/type/edition',
  },
  physical_dimensions: '8.7 x 5.9 x 0.4 inches',
  source_records: [
    'bwb:9781592248384',
  ],
  latest_revision: 5,
  revision: 5,
  created: {
    type: '/type/datetime',
    value: '2008-04-30T09:38:13.731961',
  },
  last_modified: {
    type: '/type/datetime',
    value: '2022-08-17T01:57:24.009819',
  },
};

export const mockBooksSearchQueryFromOpenLibraryNoDocs = {
  numFound: 28278,
  start: 0,
  numFoundExact: true,
  docs: [],
  num_found: 28278,
  q: 'subject:horror',
  offset: null,
};
