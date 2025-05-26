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
                "total_price", oi.total_price,
                "product_name", p.name,
                "image_url", (SELECT image_url FROM product_photos WHERE product_id = p.id LIMIT 1)
                )
            ) AS items
             FROM orders o
             LEFT JOIN order_items oi ON o.id = oi.order_id
             LEFT JOIN products p ON oi.product_id = p.id
             WHERE o.id = ?
             GROUP BY o.id, o.user_id, o.order_number, o.total_amount, o.payment_method, 
                      o.shipping_address, o.status, o.payment_status, o.created_at, o.updated_at
            `,
      [orderId]
    );
    if (order.length === 0) {
      return null;
    }

    // Parse items only if it's a string

    let items = [];
    if (typeof order[0].items === "string") {
      try {
        const parsedItems = JSON.parse(order[0].items);
        items = Array.isArray(parsedItems) ? parsedItems : [];
      } catch (Parseerror) {
        console.error("Error parsing items:", Parseerror);
        items = [];
      }
    } else if (Array.isArray(order[0].items)) {
      items = order[0].items;
    }

    // Parse shipping_address only if it's a string
    let shipping_address = {};
    if (typeof order[0].shipping_address === "string") {
      try {
        shipping_address = JSON.parse(order[0].shipping_address);
      } catch (Parseerror) {
        console.error("Error parsing shipping address:", Parseerror);
        shipping_address = {};
      }
    } else if (typeof order[0].shipping_address === "object") {
      shipping_address = order[0].shipping_address;
    }
    return {
      ...order[0],
      items,
      shipping_address,
    };
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
                JSON_ARRAYAGG(
                  JSON_OBJECT(
                    'id', oi.id,
                    'product_id', oi.product_id,
                    'variant_id', oi.variant_id,
                    'quantity', oi.quantity,
                    'price_per_unit', oi.price_per_unit,
                    'total_price', oi.total_price,
                    'product_name', p.name,
                    'image_url', (SELECT image_url FROM product_photos WHERE product_id = p.id LIMIT 1)
                  )
                ) AS items
              FROM orders o
              LEFT JOIN order_items oi ON o.id = oi.order_id
              LEFT JOIN products p ON oi.product_id = p.id
              WHERE o.user_id = ?
              GROUP BY o.id
              ORDER BY o.created_at DESC
          `,
      [userId]
    );

    return orders.map((order) => {
      try {
        // Parse items only if it's a string
        let items = [];
        if (typeof order.items === "string") {
          try {
            const parsedItems = JSON.parse(order.items);
            items = Array.isArray(parsedItems) ? parsedItems : [];
          } catch (parseError) {
            console.error("Error parsing items:", parseError);
            items = [];
          }
        } else if (Array.isArray(order.items)) {
          items = order.items;
        }

        // Parse shipping_address only if it's a string
        let shipping_address = {};
        if (typeof order.shipping_address === "string") {
          shipping_address = JSON.parse(order.shipping_address);
        } else if (typeof order.shipping_address === "object") {
          shipping_address = order.shipping_address;
        }

        return {
          ...order,
          items,
          shipping_address,
        };
      } catch (parseError) {
        console.error("Error parsing order data:", parseError);
        return {
          ...order,
          items: [],
          shipping_address: {},
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
