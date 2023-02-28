import { createSlice } from '@reduxjs/toolkit';

export const remoteConstantsSlice = createSlice({
  name: 'remoteConstants',
  initialState: {
    loaded: false,
    placeholderUrlNoImageAvailable: '',
  },
  reducers: {
    setRemoteConstantsData: (state, action) => ({
      ...state,
      loaded: true,
      placeholderUrlNoImageAvailable: action.payload.placeholderUrlNoImageAvailable,
    }),
  },
});

export const {
  setRemoteConstantsData,
} = remoteConstantsSlice.actions;

export default remoteConstantsSlice.reducer;
