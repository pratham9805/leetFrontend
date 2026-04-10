import { createSlice } from "@reduxjs/toolkit";

const problemSlice = createSlice({
  name: "problem",
  initialState: {
    problems: [],
    loading: false,
    solvedProblems: [],
    isSolvedProblemsFetched: false
  },
  reducers: {

    setProblems: (state, action) => {
      state.problems = action.payload;
    },

    setSolvedProblems: (state, action) => {
      state.solvedProblems = action.payload;
      state.isSolvedProblemsFetched = true;
    },

    clearSolvedProblems: (state) => {
      state.solvedProblems = [];
      state.isSolvedProblemsFetched = false;
    },

    addSolvedProblem: (state, action) => {
      // Ensure we don't add duplicates
      const exists = state.solvedProblems.find(p => p._id === action.payload._id);
      if (!exists) {
        state.solvedProblems.push(action.payload);
      }
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

export const { setProblems, setSolvedProblems, clearSolvedProblems, addSolvedProblem, addProblem, deleteProblem, updateProblem } = problemSlice.actions;
export default problemSlice.reducer;