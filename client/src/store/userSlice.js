import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../helpers/axiosInstance";

const initialState = {
  allUsers: [],
  userById: {},
  loading: false,
};

export const getAllUsers = createAsyncThunk(
  "/users",
  async ({ pageNo, searchValue }, { rejectWithValue }) => {
    try {
      const url = searchValue
        ? `/users?search=${searchValue}`
        : `/users?page=${pageNo}&limit=10`;
      let response = await axiosInstance.get(url);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

export const getUserById = createAsyncThunk(
  "users/getUserById",
  async (userId, { rejectWithValue }) => {
    try {
      let response = await axiosInstance.get(`/users/${userId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data);
    }
  }
);

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // all user
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.allUsers = action.payload;
        state.loading = false;
      })
      .addCase(getAllUsers.rejected, (state) => {
        state.allUsers = [];
        state.loading = false;
      })

      // get user by id
      .addCase(getUserById.pending, (state) => {
        state.loading = true;
      })
      .addCase(getUserById.fulfilled, (state, action) => {
        state.userById = action.payload;
        state.loading = false;
      })
      .addCase(getUserById.rejected, (state) => {
        state.userById = {};
        state.loading = false;
      });
  },
});

export default userSlice.reducer;
