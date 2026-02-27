/**
 * Send success response
 * @param {Object} res - Express response object
 * @param {Object} data - Response data
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Optional message
 */
export const sendSuccess = (res, data, statusCode = 200, message = null) => {
  const response = {
    status: "success",
    ...(message && { message }),
    data,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send error response
 * @param {Object} res - Express response object
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 */
export const sendError = (res, message, statusCode = 500) => {
  const response = {
    status: "error",
    message,
  };

  return res.status(statusCode).json(response);
};

/**
 * Send created response (201)
 * @param {Object} res - Express response object
 * @param {Object} data - Created resource data
 * @param {string} message - Optional message
 */
export const sendCreated = (res, data, message = "Resource created successfully") => {
  return sendSuccess(res, data, 201, message);
};

/**
 * Send no content response (204)
 * @param {Object} res - Express response object
 */
export const sendNoContent = (res) => {
  return res.status(204).send();
};
