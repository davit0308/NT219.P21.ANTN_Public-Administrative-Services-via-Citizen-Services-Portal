import { createSlice } from '@reduxjs/toolkit';

const authReducer = createSlice({
    name: 'auth',
    initialState: {
        login: {
            currentUser: null,
            error: false,
            fetching: false,
        },

        register: {
            success: false,
            error: false,
            fetching: false
        },

        logout: {
            success: false,
            error: false,
            fetching: false
        }
    },

    reducers: {
        loginRequest: (state) => {
            state.login.fetching = true;
        },
        loginSuccess: (state, action) => {
            state.login.currentUser = action.payload;
            state.login.fetching = false;
            state.login.error = false;
        },
        loginFailure: (state) => {
            state.login.fetching = false;
            state.login.error = true;
        },

        registerRequest: (state) => {
            state.register.fetching = true;
        },
        registerSuccess: (state) => {
            state.register.fetching = false;
            state.register.error = false;
            state.register.success = true;
        },
        registerFailure: (state) => {
            state.register.fetching = false;
            state.register.error = true;
        },

        logoutRequest: (state) => {
            // if (!state.logout) state.logout = { success: false, error: false, fetching: false }; 
            state.logout.fetching = true;
        },
        logoutSuccess: (state) => {
            state.login.currentUser = null;
            state.logout.fetching = false;
            state.logout.error = false;
            state.logout.success = true;
        },
        logoutFailure: (state) => {
            state.logout.fetching = false;
            state.logout.error = true;
        }
    }
});

export const { loginRequest, loginSuccess, loginFailure } = authReducer.actions;

export const { registerRequest, registerSuccess, registerFailure } = authReducer.actions;

export const { logoutRequest, logoutSuccess, logoutFailure } = authReducer.actions;

export default authReducer.reducer;