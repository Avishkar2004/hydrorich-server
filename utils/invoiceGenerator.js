import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoice = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      // Create PDF document with compression
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
        compress: true,
        bufferPages: true,
      });

      // Create invoice directory if it doesn't exist
      const invoiceDir = path.join(__dirname, "../invoices");
      if (!fs.existsSync(invoiceDir)) {
        fs.mkdirSync(invoiceDir, { recursive: true });
      }

      // Create file path with timestamp to avoid conflicts
      const timestamp = new Date().getTime();
      const fileName = `invoice_${order.order_number}_${timestamp}.pdf`;
      const filePath = path.join(invoiceDir, fileName);

      // Create write stream with error handling
      const stream = fs.createWriteStream(filePath);

      // Handle stream errors
      stream.on("error", (error) => {
        console.error("Error writing invoice file:", error);
        reject(error);
      });

      // Pipe PDF to file
      doc.pipe(stream);

      // Add company info
      doc.fontSize(20).text("Hydrorich", 50, 50);
      doc
        .fontSize(10)
        .text("Pune, Maharashtra, India", 50, 80)
        .text("Phone: +91 9322810348", 50, 95)
        .text("Email: avishkarkakde2004@gmail.com", 50, 125);

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
      doc.fontSize(10).text(user.name, 50, 300).text(user.email, 50, 315);

      // Parse shipping address safely
      let shippingAddress;
      try {
        shippingAddress =
          typeof order.shipping_address === "string"
            ? JSON.parse(order.shipping_address)
            : order.shipping_address;
      } catch (e) {
        shippingAddress = {};
      }

      doc
        .text(shippingAddress.address || "", 50, 330)
        .text(shippingAddress.city || "", 50, 345)
        .text(shippingAddress.state || "", 50, 360)
        .text(shippingAddress.pincode || "", 50, 375);

      // Add items table header
      doc
        .fontSize(10)
        .text("Item", 50, 420)
        .text("Quantity", 250, 420)
        .text("Price", 350, 420)
        .text("Total", 450, 420);

      // Add items
      let y = 440;
      if (Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item && item.product_name) {
            const price = parseFloat(item.price_per_unit) || 0;
            const total = parseFloat(item.total_price) || 0;
            doc
              .text(item.product_name, 50, y)
              .text(item.quantity?.toString() || "0", 250, y)
              .text(`₹${price.toFixed(2)}`, 350, y)
              .text(`₹${total.toFixed(2)}`, 450, y);
            y += 20;
          }
        });
      }

      // Add total with safe number conversion
      const totalAmount = parseFloat(order.total_amount) || 0;
      doc
        .fontSize(12)
        .text(`Total Amount: ₹${totalAmount.toFixed(2)}`, 350, y + 20)
        .text(`Payment Method: ${order.payment_method || "N/A"}`, 350, y + 40)
        .text(`Payment Status: ${order.payment_status || "N/A"}`, 350, y + 60);

      // Add footer
      doc
        .fontSize(10)
        .text("Thank you for your business!", 50, 700)
        .text("For any queries, please contact our support team.", 50, 715);

      // Finalize PDF
      doc.end();

      // Handle stream finish
      stream.on("finish", () => {
        resolve(filePath);
      });
    } catch (error) {
      console.error("Error generating invoice:", error);
      reject(error);
    }
  });
};
