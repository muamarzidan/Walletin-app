import apiService from "./api.service";


/**
 * Transaction API Service
 * Handles all transaction-related API calls
 */
class TransactionApiService {
  /**
   * Get all transactions for a user
   * @param {string} userId - User identifier
   * @returns {Promise<Array>} List of transactions
   */
  async getTransactionsByUserId(userId) {
    return await apiService.get(`/transactions/${userId}`);
  }

  /**
   * Get financial summary for a user
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Summary with balance, income, expenses
   */
  async getSummary(userId) {
    return await apiService.get(`/transactions/summary/${userId}`);
  }

  /**
   * Create a new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(transactionData) {
    return await apiService.post("/transactions", transactionData);
  }

  /**
   * Update an existing transaction
   * @param {number} id - Transaction ID
   * @param {Object} transactionData - Updated data
   * @returns {Promise<Object>} Updated transaction
   */
  async updateTransaction(id, transactionData) {
    return await apiService.put(`/transactions/${id}`, transactionData);
  }

  /**
   * Delete a transaction
   * @param {number} id - Transaction ID
   * @returns {Promise<Object>} Success response
   */
  async deleteTransaction(id) {
    return await apiService.delete(`/transactions/${id}`);
  }

  /**
   * Get a single transaction by ID
   * @param {number} id - Transaction ID
   * @returns {Promise<Object>} Transaction object
   */
  async getTransactionById(id) {
    return await apiService.get(`/transactions/${id}`);
  }
}

export default new TransactionApiService();
