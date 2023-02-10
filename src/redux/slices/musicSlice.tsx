import { createSlice } from '@reduxjs/toolkit';

export const musicSlice = createSlice({
  name: 'music',
  initialState: {
    music: [],
  },
  reducers: {
    setMusicInitialData: (state, action) => {
      // eslint-disable-next-line no-param-reassign
      state.music = action.payload;
    },
  },
});

export const {
  setMusicInitialData,
} = musicSlice.actions;

export default musicSlice.reducer;
