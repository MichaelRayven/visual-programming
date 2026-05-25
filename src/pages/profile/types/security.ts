export type SecurityState = {
  password: string;
  confirmPassword: string;
};

export type SecurityErrors = {
  password?: string;
  confirmPassword?: string;
};
