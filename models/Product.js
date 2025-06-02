import { db } from "../config/db.js";

class Product {
  static async create(productData) {
    const { name, description, category, in_stock, variants, photos } =
      productData;

    try {
      // Start transaction
      const connection = await db.getConnection();
      await connection.beginTransaction();

      try {
        // Insert product
        const [productResult] = await connection.query(
          `INSERT INTO products (name, description, category, in_stock) 
                     VALUES (?, ?, ?, ?)`,
          [name, description, category, in_stock]
        );
        const productId = productResult.insertId;

        // Insert variants
        for (const variant of variants) {
          const {
            variant_name,
            unit,
            quantity,
            price,
            discount_percent,
            is_available,
            dosages,
          } = variant;

          const [variantResult] = await connection.query(
            `INSERT INTO product_variants 
                         (product_id, variant_name, unit, quantity, price, discount_percent, is_available) 
                         VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              productId,
              variant_name,
              unit,
              quantity,
              price,
              discount_percent,
              is_available,
            ]
          );
          const variantId = variantResult.insertId;

          // Insert dosages
          for (const dosage of dosages) {
            await connection.query(
              `INSERT INTO dosages 
                             (variant_id, dosage_per_unit, usage_instructions) 
                             VALUES (?, ?, ?)`,
              [variantId, dosage.dosage_per_unit, dosage.usage_instructions]
            );
          }
        }

        // Insert photos
        for (const photo of photos) {
          await connection.query(
            `INSERT INTO product_photos (product_id, image_url) VALUES (?, ?)`,
            [productId, photo]
          );
        }

        await connection.commit();
        return { success: true, productId };
      } catch (error) {
        await connection.rollback();
        throw error;
      } finally {
        connection.release();
      }
    } catch (error) {
      throw new Error(`Error creating product: ${error.message}`);
    }
  }

  static async getById(productId) {
    try {
      const [product] = await db.query(`SELECT * FROM products WHERE id = ?`, [
        productId,
      ]);

      if (!product.length) {
        return null;
      }

      const [variants] = await db.query(
        `SELECT * FROM product_variants WHERE product_id = ?`,
        [productId]
      );

      for (const variant of variants) {
        const [dosages] = await db.query(
          `SELECT * FROM dosages WHERE variant_id = ?`,
          [variant.id]
        );
        variant.dosages = dosages;
      }

      const [photos] = await db.query(
        `SELECT * FROM product_photos WHERE product_id = ?`,
        [productId]
      );

      return {
        ...product[0],
        variants,
        photos,
      };
    } catch (error) {
      throw new Error(`Error fetching product: ${error.message}`);
    }
  }

  static async search(query) {
    try {
      const searchQuery = `%${query}%`;

      // Search in products table
      const [products] = await db.query(
        `SELECT p.*, 
                GROUP_CONCAT(DISTINCT pp.image_url) as images,
                MIN(pv.price) as min_price,
                MAX(pv.price) as max_price
         FROM products p
         LEFT JOIN product_photos pp ON p.id = pp.product_id
         LEFT JOIN product_variants pv ON p.id = pv.product_id
         WHERE p.name LIKE ? 
         OR p.description LIKE ? 
         OR p.category LIKE ?
         GROUP BY p.id
         LIMIT 10`,
        [searchQuery, searchQuery, searchQuery]
      );

      // Format the results
      return products.map((product) => ({
        _id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        images: product.images ? product.images.split(",") : [],
        price: product.min_price,
        priceRange:
          product.min_price !== product.max_price
            ? { min: product.min_price, max: product.max_price }
            : null,
      }));
    } catch (error) {
      throw new Error(`Error searching products: ${error.message}`);
    }
  }
}

export default Product;
