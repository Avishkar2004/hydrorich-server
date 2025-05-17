import { db } from "../config/db.js"; // your MySQL connection file

export const getPgrById = async (req, res) => {
  const productId = req.params.id;

  try {
    // 1. Get product info
    const [productRows] = await db.query(
      "SELECT id, name, description, category, in_stock FROM products WHERE id = ?",
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productRows[0];

    // 2. Get variants
    const [variantRows] = await db.query(
      `SELECT 
        id, variant_name AS name, unit, quantity, price, discount_percent, is_available 
       FROM product_variants 
       WHERE product_id = ?`,
      [productId]
    );

    // 3. Get dosage info (optional)
    const variantIds = variantRows.map((v) => v.id);
    let dosageMap = {};

    if (variantIds.length > 0) {
      const [dosageRows] = await db.query(
        `SELECT variant_id, dosage_per_unit, usage_instructions 
         FROM dosages 
         WHERE variant_id IN (?)`,
        [variantIds]
      );

      dosageMap = dosageRows.reduce((acc, row) => {
        acc[row.variant_id] = {
          dosage_per_unit: row.dosage_per_unit,
          usage_instructions: row.usage_instructions,
        };
        return acc;
      }, {});
    }

    // Attach dosage to each variant
    const variants = variantRows.map((variant) => ({
      ...variant,
      dosage: dosageMap[variant.id] || null,
    }));

    // 4. Get product images
    const [imageRows] = await db.query(
      `SELECT image_url FROM product_photos WHERE product_id = ?`,
      [productId]
    );

    const images = imageRows.map((img) => img.image_url);

    // 5. Send combined result
    return res.status(200).json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        in_stock: product.in_stock,
        variants,
        images,
      },
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrganicById = async (req, res) => {
  const productId = req.params.id;

  try {
    // 1. Get product info
    const [productRows] = await db.query(
      "SELECT id, name, description, category, in_stock FROM products WHERE id = ?",
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productRows[0];

    // 2. Get variants
    const [variantRows] = await db.query(
      `SELECT 
        id, variant_name AS name, unit, quantity, price, discount_percent, is_available 
       FROM product_variants 
       WHERE product_id = ?`,
      [productId]
    );

    // 3. Get dosage info (optional)
    const variantIds = variantRows.map((v) => v.id);
    let dosageMap = {};

    if (variantIds.length > 0) {
      const [dosageRows] = await db.query(
        `SELECT variant_id, dosage_per_unit, usage_instructions 
         FROM dosages 
         WHERE variant_id IN (?)`,
        [variantIds]
      );

      dosageMap = dosageRows.reduce((acc, row) => {
        acc[row.variant_id] = {
          dosage_per_unit: row.dosage_per_unit,
          usage_instructions: row.usage_instructions,
        };
        return acc;
      }, {});
    }

    // Attach dosage to each variant
    const variants = variantRows.map((variant) => ({
      ...variant,
      dosage: dosageMap[variant.id] || null,
    }));

    // 4. Get product images
    const [imageRows] = await db.query(
      `SELECT image_url FROM product_photos WHERE product_id = ?`,
      [productId]
    );

    const images = imageRows.map((img) => img.image_url);

    // 5. Send combined result
    return res.status(200).json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        in_stock: product.in_stock,
        variants,
        images,
      },
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getMicronutrientById = async (req, res) => {
  const productId = req.params.id;

  try {
    // 1. Get product info
    const [productRows] = await db.query(
      "SELECT id, name, description, category, in_stock FROM products WHERE id = ?",
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productRows[0];

    // 2. Get variants
    const [variantRows] = await db.query(
      `SELECT 
        id, variant_name AS name, unit, quantity, price, discount_percent, is_available 
       FROM product_variants 
       WHERE product_id = ?`,
      [productId]
    );

    // 3. Get dosage info (optional)
    const variantIds = variantRows.map((v) => v.id);
    let dosageMap = {};

    if (variantIds.length > 0) {
      const [dosageRows] = await db.query(
        `SELECT variant_id, dosage_per_unit, usage_instructions 
         FROM dosages 
         WHERE variant_id IN (?)`,
        [variantIds]
      );

      dosageMap = dosageRows.reduce((acc, row) => {
        acc[row.variant_id] = {
          dosage_per_unit: row.dosage_per_unit,
          usage_instructions: row.usage_instructions,
        };
        return acc;
      }, {});
    }

    // Attach dosage to each variant
    const variants = variantRows.map((variant) => ({
      ...variant,
      dosage: dosageMap[variant.id] || null,
    }));

    // 4. Get product images
    const [imageRows] = await db.query(
      `SELECT image_url FROM product_photos WHERE product_id = ?`,
      [productId]
    );

    const images = imageRows.map((img) => img.image_url);

    // 5. Send combined result
    return res.status(200).json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        in_stock: product.in_stock,
        variants,
        images,
      },
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getInsecticideById = async (req, res) => {
  const productId = req.params.id;

  try {
    // 1. Get product info
    const [productRows] = await db.query(
      "SELECT id, name, description, category, in_stock FROM products WHERE id = ?",
      [productId]
    );

    if (productRows.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    const product = productRows[0];

    // 2. Get variants
    const [variantRows] = await db.query(
      `SELECT 
        id, variant_name AS name, unit, quantity, price, discount_percent, is_available 
       FROM product_variants 
       WHERE product_id = ?`,
      [productId]
    );

    // 3. Get dosage info (optional)
    const variantIds = variantRows.map((v) => v.id);
    let dosageMap = {};

    if (variantIds.length > 0) {
      const [dosageRows] = await db.query(
        `SELECT variant_id, dosage_per_unit, usage_instructions 
         FROM dosages 
         WHERE variant_id IN (?)`,
        [variantIds]
      );

      dosageMap = dosageRows.reduce((acc, row) => {
        acc[row.variant_id] = {
          dosage_per_unit: row.dosage_per_unit,
          usage_instructions: row.usage_instructions,
        };
        return acc;
      }, {});
    }

    // Attach dosage to each variant
    const variants = variantRows.map((variant) => ({
      ...variant,
      dosage: dosageMap[variant.id] || null,
    }));

    // 4. Get product images
    const [imageRows] = await db.query(
      `SELECT image_url FROM product_photos WHERE product_id = ?`,
      [productId]
    );

    const images = imageRows.map((img) => img.image_url);

    // 5. Send combined result
    return res.status(200).json({
      product: {
        id: product.id,
        name: product.name,
        description: product.description,
        category: product.category,
        in_stock: product.in_stock,
        variants,
        images,
      },
    });
  } catch (err) {
    console.error("Error fetching product:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
