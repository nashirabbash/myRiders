export type AuthTemplateProps = {
  screen?: "login" | "register" | "forgot-password";
  registerStep?:
    | "name"
    | "email"
    | "username"
    | "password"
    | "confirm-password";
  errors?: Record<string, string>;
};
