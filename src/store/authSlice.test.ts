import { describe, expect, it } from "vitest";
import authReducer, { type AuthState, authActions } from "./authSlice";

describe("authSlice reducer", () => {
  const mockAuthState: AuthState = {
    user: {
      id: "mock-user-123",
      name: "Михаил",
      email: "michael@example.com",
      registeredAt: 1779676800000,
    },
    accessToken: "mock-access-token",
    isAuthenticated: true,
    isInitialLoading: false,
    error: null,
    updateProfileLoading: false,
    profileError: null,
    profileSuccess: false,
    changePasswordLoading: false,
    passwordError: null,
    passwordSuccess: false,
  };

  it("should return the initial state", () => {
    expect(authReducer(undefined, { type: "" })).toEqual({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isInitialLoading: true,
      error: null,
      updateProfileLoading: false,
      profileError: null,
      profileSuccess: false,
      changePasswordLoading: false,
      passwordError: null,
      passwordSuccess: false,
    });
  });

  it("should handle setUser", () => {
    const newUser = {
      id: "user-456",
      name: "Иван",
      email: "ivan@example.com",
      registeredAt: 1779676800000,
    };
    const nextState = authReducer(mockAuthState, authActions.setUser(newUser));
    expect(nextState.user).toEqual(newUser);
    expect(nextState.isAuthenticated).toBe(true);

    const logoutState = authReducer(nextState, authActions.setUser(null));
    expect(logoutState.user).toBeNull();
    expect(logoutState.isAuthenticated).toBe(false);
  });

  it("should handle logout", () => {
    const nextState = authReducer(mockAuthState, authActions.logout());
    expect(nextState.user).toBeNull();
    expect(nextState.accessToken).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
  });

  it("should handle resetProfileStatus and resetPasswordStatus", () => {
    const errorState: AuthState = {
      ...mockAuthState,
      updateProfileLoading: true,
      profileError: "Email already taken",
      profileSuccess: false,
      changePasswordLoading: true,
      passwordError: "Too short",
      passwordSuccess: false,
    };

    const nextState1 = authReducer(
      errorState,
      authActions.resetProfileStatus()
    );
    expect(nextState1.updateProfileLoading).toBe(false);
    expect(nextState1.profileError).toBeNull();
    expect(nextState1.profileSuccess).toBe(false);

    const nextState2 = authReducer(
      errorState,
      authActions.resetPasswordStatus()
    );
    expect(nextState2.changePasswordLoading).toBe(false);
    expect(nextState2.passwordError).toBeNull();
    expect(nextState2.passwordSuccess).toBe(false);
  });
});
