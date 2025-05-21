import { db } from "../config/db.js";

export const getDashboardStats = async () => {
  try {
    // Get total users
    const [userCount] = await db.query("SELECT COUNT(*) as count FROM users");
    
    // Get total orders
    const [orderCount] = await db.query("SELECT COUNT(*) as count FROM orders");
    
    // Get total products
    const [productCount] = await db.query("SELECT COUNT(*) as count FROM products");
    
    // Get recent orders with user details
    const [recentOrders] = await db.query(`
      SELECT 
        o.id,
        o.order_number,
        o.total_amount,
        o.status,
        o.payment_status,
        o.created_at,
        u.name as user_name,
        u.email as user_email
      FROM orders o
      JOIN users u ON o.user_id = u.id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    // Get total revenue
    const [revenue] = await db.query(`
      SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
      FROM orders 
      WHERE payment_status = 'completed'
    `);

    return {
      totalUsers: userCount[0].count,
      totalOrders: orderCount[0].count,
      totalProducts: productCount[0].count,
      totalRevenue: revenue[0].total_revenue,
      recentOrders: recentOrders.map(order => ({
        ...order,
        created_at: new Date(order.created_at).toISOString()
      }))
    };
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    throw error;
  }
}; 