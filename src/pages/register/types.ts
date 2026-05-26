export type RegisterState = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

export type RegisterErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  form?: string;
};
