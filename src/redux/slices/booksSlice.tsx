import { createSlice } from '@reduxjs/toolkit';

export const booksSlice = createSlice({
  name: 'books',
  initialState: {
    books: [],
  },
  reducers: {
    setBooksInitialData: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.books = action.payload;
    },
  },
});

export const {
  setBooksInitialData,
} = booksSlice.actions;

export default booksSlice.reducer;
