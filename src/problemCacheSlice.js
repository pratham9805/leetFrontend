import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cache: {} // Mapping of problemId to problem data
};

export const problemCacheSlice = createSlice({
  name: 'problemCache',
  initialState,
  reducers: {
    setProblemCache: (state, action) => {
      const { id, data } = action.payload;
      state.cache[id] = data;
    }
  }
});

export const { setProblemCache } = problemCacheSlice.actions;

export const selectProblemFromCache = (state, id) => state.problemCache.cache[id];

export default problemCacheSlice.reducer;
