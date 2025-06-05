export const validateContactInput = ({ name, email, subject, message }) => {
  const errors = {};

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.name = "Name is required";
  } else if (name.trim().length < 2) {
    errors.name = "Name must be at least 2 characters long";
  }

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.email = "Email is required";
  } else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
    errors.email = "Please enter a valid email address";
  }

  // Subject validation
  if (!subject || subject.trim().length === 0) {
    errors.subject = "Subject is required";
  } else if (subject.trim().length < 3) {
    errors.subject = "Subject must be at least 3 characters long";
  }

  // Message validation
  if (!message || message.trim().length === 0) {
    errors.message = "Message is required";
  } else if (message.trim().length < 10) {
    errors.message = "Message must be at least 10 characters long";
  } else if (message.trim().length > 1000) {
    errors.message = "Message must not exceed 1000 characters";
  }

  return errors;
};

