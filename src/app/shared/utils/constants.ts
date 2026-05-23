export const validationMessages: Record<string, Record<string, string>> = {
  name: {
    required: 'Name is required.',
    invalidName: 'Must contain only alphabets.',
  },
  email: {
    required: 'Email is required.',
    invalidEmail: 'Invalid email format.',
  },
  password: {
    required: 'Password is required.',
    invalidPassword:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  },
};

export const constants = {
  storageKey: 'dataMall',
  toastDuration: 5000,
  loginSuccess: 'Login successful',
  successMessage: 'Success',
  error: 'Error',
  unauthorizedAccess: 'Unauthorized route access, please login',
  accessDenied: 'Access denied',
  themeKey: 'preferred-theme',
};
