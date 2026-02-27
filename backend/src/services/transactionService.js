import transactionRepository from "../repositories/transactionRepository.js";
import { AppError } from "../utils/errors.js";


/**
 * Transaction Service - Business Logic Layer
 * Handles business rules and validation
 */
class TransactionService {
  /**
   * Get all transactions for a user
   * @param {string} userId - User identifier
   * @returns {Promise<Array>} List of transactions
   */
  async getUserTransactions(userId) {
    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    return await transactionRepository.findByUserId(userId);
  }

  /**
   * Create a new transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(data) {
    const { user_id, title, amount, category } = data;

    if (!user_id || !title || !category || amount === undefined) {
      throw new AppError("All fields are required", 400);
    }

    if (typeof amount !== "number" && isNaN(parseFloat(amount))) {
      throw new AppError("Amount must be a valid number", 400);
    }

    if (!title.trim()) {
      throw new AppError("Title cannot be empty", 400);
    }

    const transactionData = {
      userId: user_id,
      title: title.trim(),
      amount: parseFloat(amount),
      category: category.trim(),
    };

    return await transactionRepository.create(transactionData);
  }

  /**
   * Update an existing transaction
   * @param {number} id - Transaction ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object>} Updated transaction
   */
  async updateTransaction(id, data) {
    const { title, amount, category } = data;

    if (!id || isNaN(parseInt(id))) {
      throw new AppError("Invalid transaction ID", 400);
    }

    if (!title || !category || amount === undefined) {
      throw new AppError("All fields are required", 400);
    }

    if (typeof amount !== "number" && isNaN(parseFloat(amount))) {
      throw new AppError("Amount must be a valid number", 400);
    }

    const transactionExists = await transactionRepository.findById(parseInt(id));
    if (!transactionExists) {
      throw new AppError("Transaction not found", 404);
    }

    const updateTrannsactionData = {
      title: title.trim(),
      amount: parseFloat(amount),
      category: category.trim(),
    };

    const updated = await transactionRepository.update(parseInt(id), updateTrannsactionData);
    
    if (!updated) {
      throw new AppError("Failed to update transaction", 500);
    }

    return updated;
  }

  /**
   * Delete a transaction
   * @param {number} id - Transaction ID
   * @returns {Promise<Object>} Success message
   */
  async deleteTransaction(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new AppError("Invalid transaction ID", 400);
    }

    const transactionExists = await transactionRepository.findById(parseInt(id));
    if (!transactionExists) {
      throw new AppError("Transaction not found", 404);
    }

    const deletedTransaction = await transactionRepository.delete(parseInt(id));
    if (!deletedTransaction) {
      throw new AppError("Failed to delete transaction", 500);
    }

    return { message: "Transaction deleted successfully" };
  }

  /**
   * Get financial summary for a user
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Financial summary
   */
  async getUserSummary(userId) {
    if (!userId) {
      throw new AppError("User ID is required", 400);
    }

    return await transactionRepository.getSummaryByUserId(userId);
  }

  /**
   * Get a single transaction by ID
   * @param {number} id - Transaction ID
   * @returns {Promise<Object>} Transaction object
   */
  async getTransactionById(id) {
    if (!id || isNaN(parseInt(id))) {
      throw new AppError("Invalid transaction ID", 400);
    }

    const transactionData = await transactionRepository.findById(parseInt(id));
    if (!transactionData) {
      throw new AppError("Transaction not found", 404);
    }

    return transactionData;
  }
}

export default new TransactionService();
