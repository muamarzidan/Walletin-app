import { useCallback, useState } from "react";
import { Alert } from "react-native";

import transactionRepository from "../repositories/transaction.repository";
import { logError, showErrorAlert } from "../utils/errorHandler";


/**
 * Custom Hook for Transaction Management
 * Provides state and methods for transaction operations
 * 
 * @param {string} userId - User identifier
 * @returns {Object} Transaction state and methods
 */
export const useTransactions = (userId) => {
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch transactions from repository
   */
  const fetchTransactions = useCallback(async (forceRefresh = false) => {
    try {
      const data = await transactionRepository.getTransactions(userId, forceRefresh);
      setTransactions(data);
      setError(null);
    } catch (err) {
      logError(err, "fetchTransactions");
      setError(err);
      console.error("Error fetching transactions:", err);
    }
  }, [userId]);

  /**
   * Fetch summary from repository
   */
  const fetchSummary = useCallback(async (forceRefresh = false) => {
    try {
      const data = await transactionRepository.getSummary(userId, forceRefresh);
      setSummary(data);
      setError(null);
    } catch (err) {
      logError(err, "fetchSummary");
      setError(err);
      console.error("Error fetching summary:", err);
    }
  }, [userId]);

  /**
   * Load all data (transactions + summary)
   */
  const loadData = useCallback(async (forceRefresh = false) => {
    if (!userId) return;

    setIsLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchTransactions(forceRefresh),
        fetchSummary(forceRefresh)
      ]);
    } catch (err) {
      logError(err, "loadData");
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchTransactions, fetchSummary, userId]);

  /**
   * Create a new transaction
   * @param {Object} transactionData - Transaction data
   * @returns {Promise<boolean>} Success status
   */
  const createTransaction = async (transactionData) => {
    try {
      await transactionRepository.createTransaction(transactionData);
      
      // Reload data after creation
      await loadData(true);
      
      return true;
    } catch (err) {
      logError(err, "createTransaction");
      showErrorAlert(err, "Create Failed", Alert);
      return false;
    }
  };

  /**
   * Update an existing transaction
   * @param {number} id - Transaction ID
   * @param {Object} transactionData - Updated data
   * @returns {Promise<boolean>} Success status
   */
  const updateTransaction = async (id, transactionData) => {
    try {
      await transactionRepository.updateTransaction(id, transactionData);
      
      // Reload data after update
      await loadData(true);
      
      return true;
    } catch (err) {
      logError(err, "updateTransaction");
      showErrorAlert(err, "Update Failed", Alert);
      return false;
    }
  };

  /**
   * Delete a transaction
   * @param {number} id - Transaction ID
   * @returns {Promise<boolean>} Success status
   */
  const deleteTransaction = async (id) => {
    try {
      await transactionRepository.deleteTransaction(id);
      
      // Reload data after deletion
      await loadData(true);
      
      Alert.alert("Success", "Transaction deleted successfully");
      return true;
    } catch (err) {
      logError(err, "deleteTransaction");
      showErrorAlert(err, "Delete Failed", Alert);
      return false;
    }
  };

  /**
   * Filter transactions by criteria
   * @param {Object} filters - Filter criteria
   * @returns {Array} Filtered transactions
   */
  const filterTransactions = (filters) => {
    return transactionRepository.filterTransactions(transactions, filters);
  };

  /**
   * Get transaction statistics
   * @returns {Object} Statistics
   */
  const getStatistics = () => {
    return transactionRepository.calculateStatistics(transactions);
  };

  /**
   * Refresh data (clear cache and reload)
   */
  const refreshData = async () => {
    transactionRepository.clearCache();
    await loadData(true);
  };

  return {
    // State
    transactions,
    summary,
    isLoading,
    error,
    
    // Methods
    loadData,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    filterTransactions,
    getStatistics,
    refreshData,
  };
};
