const db = require('../config/database');

class Product {
    // Get all products
    static async getAll() {
        try {
            const [rows] = await db.query('SELECT * FROM products ORDER BY id DESC');
            return rows;
        } catch (error) {
            console.error('Error in getAll:', error);
            throw error;
        }
    }

    // Get product by ID
    static async getById(id) {
        try {
            const [rows] = await db.query('SELECT * FROM products WHERE id = ?', [id]);
            return rows[0];
        } catch (error) {
            console.error('Error in getById:', error);
            throw error;
        }
    }

    // Get sales history for product
    static async getSalesHistory(productId, days = 30) {
        try {
            const [rows] = await db.query(
                `SELECT 
                    sale_date, 
                    SUM(quantity) as daily_sales 
                FROM sales_transactions 
                WHERE product_id = ? 
                    AND sale_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
                GROUP BY sale_date 
                ORDER BY sale_date ASC`,
                [productId, days]
            );
            return rows;
        } catch (error) {
            console.error('Error in getSalesHistory:', error);
            throw error;
        }
    }

    // Create purchase order
    static async createPurchaseOrder(orderData) {
        try {
            const { product_id, quantity, order_number } = orderData;
            const [result] = await db.query(
                `INSERT INTO purchase_orders 
                (product_id, quantity, order_number, order_date, status) 
                VALUES (?, ?, ?, CURDATE(), 'pending')`,
                [product_id, quantity, order_number]
            );
            return result;
        } catch (error) {
            console.error('Error in createPurchaseOrder:', error);
            throw error;
        }
    }
}

module.exports = Product;