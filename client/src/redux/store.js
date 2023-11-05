import { configureStore } from "@reduxjs/toolkit";
import loadersReducer from "./loadersSlice";
import usersReducer from "./usersSlice";

export default configureStore({
    reducer : {
        loaders: loadersReducer,
        users: usersReducer,
    }
});