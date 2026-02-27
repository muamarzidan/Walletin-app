import { API_URL } from "../constants/api";


/**
 * HTTP Client - Base API Service
 * Handles all HTTP requests with standardized error handling
 */
class ApiService {
  constructor(baseURL) {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
    };
  }

  /**
   * Generic request handler
   * @param {string} endpoint - API endpoint
   * @param {Object} options - Fetch options
   * @returns {Promise<Object>} Response data
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      // Handle non-2xx responses
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || errorData.error || `HTTP Error: ${response.status}`;
        
        throw new ApiError(errorMessage, response.status, errorData);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return null;
      }

      // Parse JSON response
      const data = await response.json();
      
      // Handle new response format (with status/data wrapper)
      if (data.status === "success" && data.data !== undefined) {
        return data.data;
      }
      
      // Handle old format (direct data)
      return data;
    } catch (error) {
      // Network errors or JSON parse errors
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError(
        error.message || "Network request failed",
        0,
        { originalError: error }
      );
    }
  }

  async get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "GET",
    });
  }

  async post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  async patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
}

/**
 * Custom API Error Class
 */
export class ApiError extends Error {
  constructor(message, statusCode = 0, data = {}) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.data = data;
    this.isApiError = true;
  }

  /**
   * Check if error is a network error
   */
  isNetworkError() {
    return this.statusCode === 0;
  }

  /**
   * Check if error is a client error (4xx)
   */
  isClientError() {
    return this.statusCode >= 400 && this.statusCode < 500;
  }

  /**
   * Check if error is a server error (5xx)
   */
  isServerError() {
    return this.statusCode >= 500;
  }
}

// Create singleton instance
const apiService = new ApiService(API_URL);

export default apiService;
