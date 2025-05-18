import { db } from "../config/db.js";
import { v4 as uuidv4 } from "uuid";

export const createOrder = async (userId, orderData) => {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    // Generate unique order number

    const orderNumber = `ORD-${uuidv4().slice(0, 8).toUpperCase()}`;

    // Create order

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, order_number, total_amount, payment_method, shipping_address) VALUES(?,?,?,?,?)`,
      [
        userId,
        orderNumber,
        orderData.totalAmount,
        orderData.paymentMethod,
        JSON.stringify(orderData.shippingAddress),
      ]
    );

    const orderId = orderResult.insertId;

    // Create order items
    for (const item of orderData.items) {
      await connection.query(
        `INSERT INTO order_items (
                    order_id,
                    product_id,
                    variant_id,
                    quantity,
                    price_per_unit,
                    total_price
                ) VALUES (?, ?, ?, ?, ?, ?)
            `,
        [
          orderId,
          item.product_id,
          item.variant_id,
          item.quantity,
          item.price,
          item.price * item.quantity,
        ]
      );
    }
    // Commit transaction
    await connection.commit();
    return { orderId, orderNumber };
  } catch (error) {
    await connection.rollback();

    throw error;
  } finally {
    connection.release();
  }
};

export const getOrderById = async (orderId) => {
  try {
    const [order] = await db.query(
      `
            SELECT o.*,
            JSON_ARRAYAGG(
                JSON_OBJECT(
                "id", oi.id,
                "product_id", oi.product_id,
                "variant_id", oi.variant_id,
                "quantity", oi.quantity,
                "price_per_unit", oi.price_per_unit,
                "total_price", oi.total_price
                )
            ) AS items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             WHERE o.id = ?
             GROUP BY o.id,

            `,
      [orderId]
    );
    if (order.length === 0) {
      return null;
    }

    // Parse the items JSON string
    order[0].item = JSON.parse(order[0].items);
    order[0].shipping_address = JSON.parse(order[0].shipping_address);
    return order[0];
  } catch (error) {
    console.error("Error getting order:", error);
    throw error;
  }
};

export const getUserOrders = async (userId) => {
  try {
    const [orders] = await db.query(
      `
            SELECT 
              o.*,
              COALESCE(
                JSON_ARRAYAGG(
                  IFNULL(
                    JSON_OBJECT(
                      "id", oi.id,
                      "product_id", oi.product_id,
                      "variant_id", oi.variant_id,
                      "quantity", oi.quantity,
                      "price_per_unit", oi.price_per_unit,
                      "total_price", oi.total_price
                    ),
                    NULL
                  )
                ),
                JSON_ARRAY()
              ) AS items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = ?
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `,
      [userId]
    );

    return orders.map((order) => {
      try {
        // Handle the items array
        let items = [];
        if (order.items && order.items !== '[null]' && order.items !== '[]') {
          items = JSON.parse(order.items).filter(item => item !== null);
        }

        // Handle the shipping address
        let shipping_address = {};
        if (order.shipping_address) {
          shipping_address = JSON.parse(order.shipping_address);
        }

        return {
          ...order,
          items,
          shipping_address
        };
      } catch (parseError) {
        console.error('Error parsing order data:', parseError);
        return {
          ...order,
          items: [],
          shipping_address: {}
        };
      }
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const [result] = await db.query(
      "UPDATE orders SET status = ? WHERE id = ?",
      [status, orderId]
    );
    return result;
  } catch (error) {
    console.error("Error updating order status:", error);
    throw error;
  }
};

export const updatePaymentStatus = async (orderId, status) => {
  try {
    const [result] = await db.query(
      "UPDATE orders SET payment_status = ? WHERE id = ?",
      [status, orderId]
    );
    return result;
  } catch (error) {
    console.error("Error updating payment status:", error);
    throw error;
  }
};
