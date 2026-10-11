import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    userData: {},
    isPro: false,
};

export const auth = createSlice({
    name: "auth",
    initialState,
    reducers: {
        addUserData: (state, action) => {
            state.userData = action.payload;
            // Hydrate entitlement from login/signup payload (server-derived).
            state.isPro = Boolean(action.payload?.user?.isPro);
        },
        removeUserData: (state) => {
            state.userData = {};
            state.isPro = false;
        },
        setIsPro: (state, action) => {
            state.isPro = Boolean(action.payload);
        },
    },
});

export const { addUserData, removeUserData, setIsPro } = auth.actions;
export default auth.reducer;
