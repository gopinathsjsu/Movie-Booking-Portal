import { createSlice } from "@reduxjs/toolkit";

const usersSlice = createSlice({
  name: "users",
  initialState: {
    user: null,
  },
  reducers: {
    SetUser: (state, action) => {
      state.user = action.payload;
    },
  },
});

export const { SetUser } = usersSlice.actions;

export const updateUserData = (userData) => {
  return {
    type: "UPDATE_USER_DATA",
    payload: userData,
  };
};

export default usersSlice.reducer;
