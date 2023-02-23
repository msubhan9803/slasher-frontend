import { createSlice } from '@reduxjs/toolkit';

export const scrollPositionSlice = createSlice({
  name: 'scrollPosition',
  initialState: {
    pathname: '',
    position: 0,
    data: [],
    positionElementId: '',
    sortValue: '',
  },
  reducers: {
    setScrollPosition: (state, action) => ({
      ...state,
      pathname: action.payload.pathname,
      position: action.payload.position,
      data: action.payload.data,
      positionElementId: action.payload.positionElementId,
      sortValue: action.payload.sortValue ? action.payload.sortValue : '',
    }),
  },
});

export const { setScrollPosition } = scrollPositionSlice.actions;

export default scrollPositionSlice.reducer;
