import * as Yup from "yup";

/**
 * Same rule as the backend (Validation.js): at least 8 characters, using only letters, digits and
 * @$!%*?&, with at least one uppercase, one lowercase, one digit and one of @$!%*?&.
 */
export const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const PASSWORD_HINT =
  "At least 8 characters with an uppercase letter, a lowercase letter, a number and one of @$!%*?&";

export const strongPasswordSchema = Yup.string()
  .matches(STRONG_PASSWORD, PASSWORD_HINT)
  .required("Enter your Password");

export const emailSchema = Yup.string().trim().email("Enter a valid email address").required("Enter your Email");
