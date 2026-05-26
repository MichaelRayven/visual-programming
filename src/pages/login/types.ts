export type LoginState = {
  email: string;
  password: string;
};

export type LoginErrors = {
  email?: string;
  password?: string;
  form?: string;
};
