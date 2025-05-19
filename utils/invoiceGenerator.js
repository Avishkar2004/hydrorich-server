import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoice = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document
      const doc = new PDFDocument({ size: "A4", margin: 50 });

      // Create invoice directory if it doesn't exist
      const invoiceDir = path.join(__dirname, "../invoices");
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir);
      }

      // Create file path
      const fileName = `invoice_${order.order_number}.pdf`;
      const filePath = path.join(invoiceDir, fileName);

      // Pipe PDF to file
      const stream = fs.createWriteStream(filePath);
      doc.pipe(stream);

      // Add company logo (if you have one)
      // doc.image('path/to/logo.png', 50, 45, { width: 50 });

      // Add company info

      doc.fontSize(20).text("Hydrorich", 50, 50);
      doc
        .fontSize(10)
        .text("123 Agriculture Street", 50, 80)
        .text("Farm City, FC 12345", 50, 95)
        .text("Phone: (123) 456-7890", 50, 110)
        .text("Email: support@hydrorich.com", 50, 125);

      // Add invoice details
      doc.fontSize(16).text("INVOICE", 50, 180);
      doc
        .fontSize(10)
        .text(`Invoice Number: ${order.order_number}`, 50, 200)
        .text(
          `Date: ${new Date(order.created_at).toLocaleDateString()}`,
          50,
          215
        )
        .text(
          `Due Date: ${new Date(order.created_at).toLocaleDateString()}`,
          50,
          230
        );

      // Add customer info
      doc.fontSize(12).text("Bill To:", 50, 280);
      doc
        .fontSize(10)
        .text(user.name, 50, 300)
        .text(user.email, 50, 315)
        .text(JSON.parse(order.shipping_address).address, 50, 330)
        .text(JSON.parse(order.shipping_address).city, 50, 345)
        .text(JSON.parse(order.shipping_address).state, 50, 360)
        .text(JSON.parse(order.shipping_address).pincode, 50, 375);

      // Add items table header
      doc
        .fontSize(10)
        .text("Item", 50, 420)
        .text("Quantity", 250, 420)
        .text("Price", 350, 420)
        .text("Total", 450, 420);

      // Add items
      let y = 440;
      order.items.forEach((item) => {
        doc
          .text(item.product_name, 50, y)
          .text(item.quantity.toString(), 250, y)
          .text(`₹${item.price_per_unit.toFixed(2)}`, 350, y)
          .text(`₹${item.total_price.toFixed(2)}`, 450, y);
        y += 20;
      });

      // Add total
      doc
        .fontSize(12)
        .text(`Total Amount: ₹${order.total_amount.toFixed(2)}`, 350, y + 20)
        .text(`Payment Method: ${order.payment_method}`, 350, y + 40)
        .text(`Payment Status: ${order.payment_status}`, 350, y + 60);

      // Add footer
      doc
        .fontSize(10)
        .text("Thank you for your business!", 50, 700)
        .text("For any queries, please contact our support team.", 50, 715);

      // Finally PDF
      doc.end();

      stream.end();

      stream.on("finish", () => {
        resolve(filePath);
      });
      stream.on("error", (error) => {
        reject(error);
      });
    } catch (error) {}
  });
};
