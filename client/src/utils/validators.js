/**
 * Client-Side Validation Utilities for Kshamata
 */

export function validateLoginForm(formData) {
  const errors = {};
  const email = (formData.email || '').trim();
  const password = formData.password || '';

  if (!email) {
    errors.email = 'Email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address (e.g. official@gov.in).';
  }

  if (!password) {
    errors.password = 'Password is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateRegisterForm(formData) {
  const errors = {};
  const name = (formData.name || '').trim();
  const email = (formData.email || '').trim();
  const password = formData.password || '';
  const confirmPassword = formData.confirmPassword || '';

  if (!name) {
    errors.name = 'Official full name is required.';
  } else if (name.length < 2) {
    errors.name = 'Name must be at least 2 characters.';
  }

  if (!email) {
    errors.email = 'Work email address is required.';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Please enter a valid email address (e.g. official@gov.in).';
  }

  if (!password) {
    errors.password = 'Password is required.';
  } else if (password.length < 8) {
    errors.password = 'Password must be at least 8 characters.';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Please confirm your password.';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
