import { PayloadAction, createSlice } from '@reduxjs/toolkit';
import { DateTime } from 'luxon';
import { Book } from '../../routes/books/components/BookProps';

const initialState = {
  books: [] as Book[],
  lastRetrievalTime: null as null | string,
};

export const booksSlice = createSlice({
  name: 'books',
  initialState,
  reducers: {
    setBooks: (state, action: PayloadAction<typeof initialState['books']>) => ({
      ...state,
      books: action.payload,
      lastRetrievalTime: DateTime.now().toISO(),
    }),
  },
});

export const {
  setBooks,
} = booksSlice.actions;

export default booksSlice.reducer;
