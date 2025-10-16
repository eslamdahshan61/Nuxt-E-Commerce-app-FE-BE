/**
 * Utility functions for handling API validation errors
 */

export interface ValidationError {
  field: string;
  message: string;
}

export interface FieldErrors {
  [key: string]: string;
}

/**
 * Parse validation errors from API response
 * @param error - The error object from API
 * @returns Object containing field-specific errors and general error message
 */
export function parseValidationErrors(error: any): {
  fieldErrors: FieldErrors;
  generalError: string | null;
} {
  const fieldErrors: FieldErrors = {};
  let generalError: string | null = null;

  if (!error) {
    return { fieldErrors, generalError };
  }

   
  if (error.response?.data && Array.isArray(error.response.data)) {
    error.response.data.forEach((validationError: ValidationError) => {
      if (validationError.field) {
        fieldErrors[validationError.field] = validationError.message;
      }
    });
  }
 
  else if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
    error.response.data.errors.forEach((validationError: ValidationError) => {
      if (validationError.field) {
        fieldErrors[validationError.field] = validationError.message;
      }
    });
  }
   
  else if (error.response?.data?.statusMessage) {
    generalError = error.response.data.statusMessage;
  }
 
  else if (error.response?.data?.message) {
    generalError = error.response.data.message;
  }
   
  else if (error.message) {
    generalError = error.message;
  }
  else {
    generalError = 'An unexpected error occurred';
  }

  return { fieldErrors, generalError };
}

/**
 * Format validation errors into a single string
 * @param fieldErrors - Object containing field-specific errors
 * @returns Formatted error string
 */
export function formatFieldErrors(fieldErrors: FieldErrors): string {
  const errors = Object.values(fieldErrors);
  if (errors.length === 0) return '';
  if (errors.length === 1) return errors[0];
  return errors.join(', ');
}

/**
 * Check if error is a validation error (400 Bad Request)
 * @param error - The error object from API
 * @returns True if it's a validation error
 */
export function isValidationError(error: any): boolean {
  return error?.response?.status === 400 || error?.response?.statusCode === 400;
}

/**
 * Get a user-friendly error message from API error
 * @param error - The error object from API
 * @param defaultMessage - Default message if no error found
 * @returns User-friendly error message
 */
export function getErrorMessage(error: any, defaultMessage: string = 'An error occurred'): string {
  const { fieldErrors, generalError } = parseValidationErrors(error);
  
  if (Object.keys(fieldErrors).length > 0) {
    return formatFieldErrors(fieldErrors);
  }
  
  return generalError || defaultMessage;
}
