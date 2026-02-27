import { sql } from "../config/db.js";


/**
 * Transaction Repository - Data Access Layer
 * Handles all database operations for transactions
 */
class TransactionRepository {
  /**
   * Find all transactions by user ID
   * @param {string} userId - User identifier
   * @returns {Promise<Array>} List of transactions
   */
  async findByUserId(userId) {
    return await sql`
      SELECT * FROM transactions 
      WHERE user_id = ${userId} 
      ORDER BY created_at DESC
    `;
  }

  /**
   * Find a single transaction by ID
   * @param {number} id - Transaction ID
   * @returns {Promise<Object|null>} Transaction object or null
   */
  async findById(id) {
    const result = await sql`
      SELECT * FROM transactions 
      WHERE id = ${id}
      LIMIT 1
    `;
    return result[0] || null;
  }

  /**
   * Create a new transaction
   * @param {Object} data - Transaction data
   * @returns {Promise<Object>} Created transaction
   */
  async create(data) {
    const { userId, title, amount, category } = data;
    
    const result = await sql`
      INSERT INTO transactions (user_id, title, amount, category)
      VALUES (${userId}, ${title}, ${amount}, ${category})
      RETURNING *
    `;
    
    return result[0];
  }

  /**
   * Update an existing transaction
   * @param {number} id - Transaction ID
   * @param {Object} data - Updated data
   * @returns {Promise<Object|null>} Updated transaction or null
   */
  async update(id, data) {
    const { title, amount, category } = data;
    
    const result = await sql`
      UPDATE transactions 
      SET title = ${title}, 
          amount = ${amount}, 
          category = ${category}
      WHERE id = ${id}
      RETURNING *
    `;
    
    return result[0] || null;
  }

  /**
   * Delete a transaction
   * @param {number} id - Transaction ID
   * @returns {Promise<Object|null>} Deleted transaction or null
   */
  async delete(id) {
    const result = await sql`
      DELETE FROM transactions 
      WHERE id = ${id} 
      RETURNING *
    `;
    
    return result[0] || null;
  }

  /**
   * Calculate financial summary for a user
   * @param {string} userId - User identifier
   * @returns {Promise<Object>} Summary with balance, income, expenses
   */
  async getSummaryByUserId(userId) {
    const [balanceResult, incomeResult, expensesResult] = await Promise.all([
      sql`
        SELECT COALESCE(SUM(amount), 0) as balance 
        FROM transactions 
        WHERE user_id = ${userId}
      `,
      sql`
        SELECT COALESCE(SUM(amount), 0) as income 
        FROM transactions
        WHERE user_id = ${userId} AND amount > 0
      `,
      sql`
        SELECT COALESCE(SUM(amount), 0) as expenses 
        FROM transactions
        WHERE user_id = ${userId} AND amount < 0
      `
    ]);

    return {
      balance: balanceResult[0].balance,
      income: incomeResult[0].income,
      expenses: expensesResult[0].expenses,
    };
  }

  /**
   * Check if a transaction belongs to a user
   * @param {number} id - Transaction ID
   * @param {string} userId - User identifier
   * @returns {Promise<boolean>} True if transaction belongs to user
   */
  async belongsToUser(id, userId) {
    const result = await sql`
      SELECT COUNT(*) as count 
      FROM transactions 
      WHERE id = ${id} AND user_id = ${userId}
    `;
    
    return parseInt(result[0].count) > 0;
  }
}

export default new TransactionRepository();
