import { db } from "../config/db.js";

export const getAllProducts = async (req, res) => {
  const query = `
    SELECT 
      p.id AS product_id,
      p.name AS product_name,
      p.description,
      p.category,
      p.in_stock,
      pv.id AS variant_id,
      pv.variant_name,
      pv.unit,
      pv.quantity,
      pv.price,
      pv.discount_percent,
      pv.is_available,
      d.dosage_per_unit,
      d.usage_instructions,
      (
        SELECT GROUP_CONCAT(ph.image_url)
        FROM product_photos ph
        WHERE ph.product_id = p.id
      ) AS image_urls
    FROM products p
    LEFT JOIN product_variants pv ON p.id = pv.product_id
    LEFT JOIN dosages d ON pv.id = d.variant_id
    ORDER BY p.category, p.name
  `;

  try {
    const [rows] = await db.query(query);

    // Structure the response: Group variants and images under each product

    const productsMap = {};

    rows.forEach((row) => {
      if (!productsMap[row.product_id]) {
        productsMap[row.product_id] = {
          id: row.product_id,
          name: row.product_name,
          description: row.description,
          category: row.category,
          in_stock: row.in_stock,
          variants: [],
          images: row.image_urls ? row.image_urls.split(",") : [],
        };
      }

      if (row.variant_id) {
        productsMap[row.product_id].variants.push({
          id: row.variant_id,
          name: row.variant_name,
          unit: row.unit,
          quantity: row.quantity,
          price: row.price,
          discount_percent: row.discount_percent,
          is_available: row.is_available,
          dosage_per_unit: row.dosage_per_unit,
          usage_instructions: row.usage_instructions,
        });
      }
    });
    const structuredData = Object.values(productsMap);
    res.json({
      success: true,
      count: structuredData.length,
      products: structuredData,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
