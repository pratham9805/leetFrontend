import { createSlice } from "@reduxjs/toolkit";

const problemSlice = createSlice({
  name: "problem",
  initialState: {
    problems: [],
    loading: false
  },
  reducers: {

    setProblems: (state, action) => {
      state.problems = action.payload;
    },

    addProblem: (state, action) => {
      state.problems.push(action.payload);
    },

    deleteProblem: (state, action) => {
      state.problems = state.problems.filter(
        (p) => p._id !== action.payload
      );
    },

    updateProblem: (state, action) => {
      const index = state.problems.findIndex(
        (p) => p._id === action.payload._id
      );

      if (index !== -1) {
        state.problems[index] = action.payload;
      }
    }

  }
});

export const { setProblems, addProblem, deleteProblem, updateProblem } = problemSlice.actions;
export default problemSlice.reducer;