import * as orderModel from "../models/orderModel.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderData = {
      totalAmount: req.body.totalAmount,
      paymentMethod: req.body.paymentMethod,
      shippingAddress: req.body.shippingAddress,
      items: req.body.items,
    };
    const { orderId, orderNumber } = await orderModel.createOrder(
      userId,
      orderData
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: {
        orderId,
        orderNumber,
      },
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
};

export const getOrder = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await orderModel.getOrderById(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    // Check if the order belongs to the user
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this order",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({
      success: false,
      message: "Error getting order",
      error: error.message,
    });
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await orderModel.getUserOrders(userId);
    res.json({
      success: true,
      data: orders,
    });
  } catch (error) {
    console.error("Error getting user orders:", error);
    res.status(500).json({
      success: false,
      message: "Error getting user orders",
      error: error.message,
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const order = await orderModel.getOrderById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    // Check if the order belongs to the user
    if (order.user_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this order",
      });
    }
    await orderModel.updateOrderStatus(orderId, status);

    res.json({
      success: false,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating order status",
      error: error.message,
    });
  }
};
