import { createSlice } from '@reduxjs/toolkit';

export const scrollPositionSlice = createSlice({
  name: 'scrollPosition',
  initialState: {
    pathname: '',
    position: 0,
    data: [],
    positionElementId: '',
    sortValue: '',
    searchValue: '',
    keyValue: '',
  },
  reducers: {
    setScrollPosition: (state, action) => ({
      ...state,
      pathname: action.payload.pathname,
      position: action.payload.position,
      data: action.payload.data,
      positionElementId: action.payload.positionElementId,
      sortValue: action.payload.sortValue ? action.payload.sortValue : '',
      searchValue: action.payload.searchValue ? action.payload.searchValue : '',
      keyValue: action.payload.keyValue ? action.payload.keyValue : '',
    }),
  },
});

export const { setScrollPosition } = scrollPositionSlice.actions;

export default scrollPositionSlice.reducer;
