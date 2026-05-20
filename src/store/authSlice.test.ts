import { describe, expect, it } from "vitest";
import authReducer, { type AuthState, authActions } from "./authSlice";

describe("authSlice reducer", () => {
  const initialState: AuthState = {
    user: {
      id: "mock-user-123",
      name: "Михаил",
      email: "michael@example.com",
    },
    isAuthenticated: true,
  };

  it("should return the initial state", () => {
    expect(authReducer(undefined, { type: "" })).toEqual(initialState);
  });

  it("should handle setUser", () => {
    const newUser = {
      id: "user-456",
      name: "Иван",
      email: "ivan@example.com",
    };
    const nextState = authReducer(initialState, authActions.setUser(newUser));
    expect(nextState.user).toEqual(newUser);
    expect(nextState.isAuthenticated).toBe(true);

    const logoutState = authReducer(nextState, authActions.setUser(null));
    expect(logoutState.user).toBeNull();
    expect(logoutState.isAuthenticated).toBe(false);
  });

  it("should handle logout", () => {
    const nextState = authReducer(initialState, authActions.logout());
    expect(nextState.user).toBeNull();
    expect(nextState.isAuthenticated).toBe(false);
  });
});
