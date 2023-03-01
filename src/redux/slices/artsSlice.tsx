import { PayloadAction, createSlice } from '@reduxjs/toolkit';

const initialState = {
  arts: [],
  lastRetrievalTime: null as null | string,
};

export const artsSlice = createSlice({
  name: 'arts',
  initialState,
  reducers: {
    setArtsState: (state, action: PayloadAction<typeof initialState>) => ({
      ...state,
      arts: action.payload.arts,
      lastRetrievalTime: action.payload.lastRetrievalTime,
    }),
  },
});

export const {
  setArtsState,
} = artsSlice.actions;

export default artsSlice.reducer;
