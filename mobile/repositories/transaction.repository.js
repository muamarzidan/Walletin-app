import transactionApiService from "../services/transaction.service";
import { handleError } from "../utils/errorHandler";

/**
 * Transaction Repository
 * Business logic layer for transaction management
 * Handles data transformation, caching, and business rules
 */
class TransactionRepository {
  constructor() {
    this.cache = {
      transactions: null,
      summary: null,
      lastFetch: null,
    };
    this.CACHE_DURATION = 5 * 60 * 1000;
  }

  /**
   * Check if cache is still valid
   */
  isCacheValid() {
    if (!this.cache.lastFetch) return false;
    return Date.now() - this.cache.lastFetch < this.CACHE_DURATION;
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache = {
      transactions: null,
      summary: null,
      lastFetch: null,
    };
  }

  /**
   * Get all transactions for a user
   * @param {string} userId - User identifier
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Array>} List of transactions
   */
  async getTransactions(userId, forceRefresh = false) {
    try {
      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && this.isCacheValid() && this.cache.transactions) {
        return this.cache.transactions;
      }

      const transactions = await transactionApiService.getTransactionsByUserId(userId);
      const transformedTransactions = this.transformTransactions(transactions);
      
      // Update cache
      this.cache.transactions = transformedTransactions;
      this.cache.lastFetch = Date.now();

      return transformedTransactions;
    } catch (error) {
      throw handleError(error, "Failed to fetch transactions");
    }
  }

  /**
   * Get financial summary for a user
   * @param {string} userId - User identifier
   * @param {boolean} forceRefresh - Force refresh from API
   * @returns {Promise<Object>} Summary with balance, income, expenses
   */
  async getSummary(userId, forceRefresh = false) {
    try {
      // Return cached data if valid and not forcing refresh
      if (!forceRefresh && this.isCacheValid() && this.cache.summary) {
        return this.cache.summary;
      }

      const summary = await transactionApiService.getSummary(userId);
      
      const transformedSummary = {
        balance: parseFloat(summary.balance) || 0,
        income: parseFloat(summary.income) || 0,
        expenses: parseFloat(summary.expenses) || 0,
      };

      // Update cache
      this.cache.summary = transformedSummary;

      return transformedSummary;
    } catch (error) {
      throw handleError(error, "Failed to fetch summary");
    }
  }

  /**
   * Create a new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async createTransaction(transactionData) {
    try {
      this.validateTransactionData(transactionData);

      const created = await transactionApiService.createTransaction(transactionData);

      // Clear cache to force refresh
      this.clearCache();

      return created;
    } catch (error) {
      throw handleError(error, "Failed to create transaction");
    }
  }

  /**
   * Update an existing transaction
   * @param {number} id - Transaction ID
   * @param {Object} transactionData - Updated data
   * @returns {Promise<Object>} Updated transaction
   */
  async updateTransaction(id, transactionData) {
    try {
      this.validateTransactionData(transactionData, false);

      const updated = await transactionApiService.updateTransaction(id, transactionData);

      // Clear cache to force refresh
      this.clearCache();

      return updated;
    } catch (error) {
      throw handleError(error, "Failed to update transaction");
    }
  }

  /**
   * Delete a transaction
   * @param {number} id - Transaction ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTransaction(id) {
    try {
      await transactionApiService.deleteTransaction(id);

      // Clear cache to force refresh
      this.clearCache();

      return true;
    } catch (error) {
      throw handleError(error, "Failed to delete transaction");
    }
  }

  /**
   * Filter transactions by criteria
   * @param {Array} transactions - List of transactions
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered transactions
   */
  filterTransactions(transactions, filters = {}) {
    let filtered = [...transactions];

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter((t) =>
        t.title.toLowerCase().includes(query)
      );
    }

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((t) => {
        const amount = parseFloat(t.amount);
        if (filters.type === "income") return amount > 0;
        if (filters.type === "expense") return amount < 0;
        return true;
      });
    }

    if (filters.category && filters.category !== "all") {
      filtered = filtered.filter((t) => t.category === filters.category);
    }

    return filtered;
  }

  /**
   * Transform transactions data
   * @param {Array} transactions - Raw transactions
   * @returns {Array} Transformed transactions
   */
  transformTransactions(transactions) {
    return transactions.map((transaction) => ({
      ...transaction,
      amount: parseFloat(transaction.amount),
      id: parseInt(transaction.id),
    }));
  }

  /**
   * Validate transaction data
   * @param {Object} data - Transaction data
   * @param {boolean} requireUserId - Whether user_id is required
   * @throws {Error} Validation error
   */
  validateTransactionData(data, requireUserId = true) {
    if (requireUserId && !data.user_id) {
      throw new Error("User ID is required");
    }
    if (!data.title || !data.title.trim()) {
      throw new Error("Title is required");
    }
    if (data.amount === undefined || data.amount === null) {
      throw new Error("Amount is required");
    }

    const amount = parseFloat(data.amount);
    if (isNaN(amount)) {
      throw new Error("Amount must be a valid number");
    }

    if (!data.category || !data.category.trim()) {
      throw new Error("Category is required");
    }
  }

  /**
   * Calculate statistics from transactions
   * @param {Array} transactions - List of transactions
   * @returns {Object} Statistics
   */
  calculateStatistics(transactions) {
    const stats = {
      totalTransactions: transactions.length,
      totalIncome: 0,
      totalExpenses: 0,
      balance: 0,
      avgTransaction: 0,
      largestIncome: 0,
      largestExpense: 0,
    };

    transactions.forEach((transaction) => {
      const amount = parseFloat(transaction.amount);
      
      if (amount > 0) {
        stats.totalIncome += amount;
        stats.largestIncome = Math.max(stats.largestIncome, amount);
      } else {
        stats.totalExpenses += Math.abs(amount);
        stats.largestExpense = Math.max(stats.largestExpense, Math.abs(amount));
      }
    });

    stats.balance = stats.totalIncome - stats.totalExpenses;
    stats.avgTransaction = transactions.length > 0
      ? (stats.totalIncome + stats.totalExpenses) / transactions.length
      : 0;

    return stats;
  }
}

export default new TransactionRepository();
