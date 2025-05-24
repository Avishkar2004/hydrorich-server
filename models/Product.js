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
}

export default Product;
