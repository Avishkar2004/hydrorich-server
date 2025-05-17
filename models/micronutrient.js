import { db } from "../config/db.js";

export const Micronutrient = async (req, res) => {
  const query = `
    SELECT 
    p.id AS product_id,
    p.name AS product_name,
    p.description,
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
    SELECT ph.image_url
    FROM product_photos ph
    WHERE ph.product_id = p.id
    ORDER BY ph.id ASC
    LIMIT 1
    ) AS image_url
     FROM products p
     LEFT JOIN product_variants pv ON p.id  = pv.product_id
     LEFT JOIN dosages d ON pv.id = d.variant_id
     WHERE LOWER(p.category) = 'micronutrient'
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
          in_stock: row.in_stock,
          variants: [],
          images: row.image_url ? [row.image_url] : [],
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

      if (
        row.image_url &&
        !productsMap[row.product_id].images.includes(row.image_url)
      ) {
        productsMap[row.product_id].images.push(row.image_url);
      }
    });

    const structuredData = Object.values(productsMap);
    res.json({ products: structuredData });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
