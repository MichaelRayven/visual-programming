import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "@/store";

export const selectAuthState = (state: RootState) => state.auth;

export const selectUser = createSelector(
  [selectAuthState],
  (auth) => auth.user
);

export const selectProfileState = createSelector([selectAuthState], (auth) => ({
  updateProfileLoading: auth.updateProfileLoading,
  profileError: auth.profileError,
  profileSuccess: auth.profileSuccess,
}));

export const selectPasswordState = createSelector(
  [selectAuthState],
  (auth) => ({
    changePasswordLoading: auth.changePasswordLoading,
    passwordError: auth.passwordError,
    passwordSuccess: auth.passwordSuccess,
  })
);
