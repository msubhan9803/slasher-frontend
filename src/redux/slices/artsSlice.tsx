import { createSlice } from '@reduxjs/toolkit';

export const artsSlice = createSlice({
  name: 'arts',
  initialState: {
    arts: [],
  },
  reducers: {
    setArtsInitialData: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.arts = action.payload;
    },
  },
});

export const {
  setArtsInitialData,
} = artsSlice.actions;

export default artsSlice.reducer;
