import transactionService from "../services/transactionService.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { sendSuccess, sendCreated } from "../utils/response.js";

/**
 * Transaction Controller - Thin layer that handles HTTP requests/responses
 * Delegates business logic to service layer
 */

/**
 * Get all transactions for a user
 * @route GET /api/transactions/:userId
 */
export const getTransactionsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const transactions = await transactionService.getUserTransactions(userId);
  sendSuccess(res, transactions);
});

/**
 * Create a new transaction
 * @route POST /api/transactions
 */
export const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.body);
  sendCreated(res, transaction, "Transaction created successfully");
});

/**
 * Update an existing transaction
 * @route PUT /api/transactions/:id
 */
export const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const transaction = await transactionService.updateTransaction(id, req.body);
  sendSuccess(res, transaction, 200, "Transaction updated successfully");
});

/**
 * Delete a transaction
 * @route DELETE /api/transactions/:id
 */
export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await transactionService.deleteTransaction(id);
  sendSuccess(res, result);
});

/**
 * Get financial summary for a user
 * @route GET /api/transactions/summary/:userId
 */
export const getSummaryByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const summary = await transactionService.getUserSummary(userId);
  sendSuccess(res, summary);
});
