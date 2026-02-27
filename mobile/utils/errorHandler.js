import { ApiError } from "../services/api.service";


/**
 * Centralized Error Handler
 * Transforms errors into user-friendly messages
 */

/**
 * Handle and transform errors
 * @param {Error} error - Original error
 * @param {string} defaultMessage - Default error message
 * @returns {Error} Transformed error with user-friendly message
 */
export const handleError = (error, defaultMessage = "An error occurred") => {
  // API errors
  if (error instanceof ApiError) {
    // Network errors
    if (error.isNetworkError()) {
      return new Error("Network error. Please check your connection.");
    }

    // Client errors (4xx)
    if (error.isClientError()) {
      return new Error(error.message || "Invalid request");
    }

    // Server errors (5xx)
    if (error.isServerError()) {
      return new Error("Server error. Please try again later.");
    }

    return new Error(error.message || defaultMessage);
  }

  // Validation errors
  if (error.message && error.message.includes("required")) {
    return error;
  }

  // Generic errors
  return new Error(error.message || defaultMessage);
};

/**
 * Get user-friendly error message
 * @param {Error} error - Error object
 * @returns {string} User-friendly message
 */
export const getErrorMessage = (error) => {
  if (error instanceof ApiError) {
    if (error.isNetworkError()) {
      return "Unable to connect to server. Please check your internet connection.";
    }
    if (error.statusCode === 404) {
      return "Resource not found.";
    }
    if (error.statusCode === 401 || error.statusCode === 403) {
      return "Unauthorized access. Please sign in again.";
    }
    if (error.statusCode === 429) {
      return "Too many requests. Please try again later.";
    }
    if (error.isServerError()) {
      return "Server error. Please try again later.";
    }
  }

  return error.message || "An unexpected error occurred";
};

/**
 * Log error for debugging
 * @param {Error} error - Error object
 * @param {string} context - Error context
 */
export const logError = (error, context = "") => {
  if (__DEV__) {
    console.error(`[Error ${context ? `- ${context}` : ""}]:`, error);
    
    if (error instanceof ApiError) {
      console.error("Status Code:", error.statusCode);
      console.error("Error Data:", error.data);
    }
  }
};

/**
 * Show error alert
 * @param {Error} error - Error object
 * @param {string} title - Alert title
 * @param {Function} Alert - React Native Alert
 */
export const showErrorAlert = (error, title = "Error", Alert) => {
  const message = getErrorMessage(error);
  Alert.alert(title, message);
};
