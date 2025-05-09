export function validateUserInput({ name, email, password }) {
  const errors = {};

  if (!/^[A-Za-z ]{3,}$/.test(name)) {
    errors.name = "Name must be at least 3 characters and only letters.";
  }
  if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    errors.email = "Enter a valid email address.";
  }
  if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/.test(password)) {
    errors.password =
      "Password must be at least 8 characters and include letters and numbers.";
  }

  return errors;
}
