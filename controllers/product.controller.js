const productService = require('../services/product.service');
const { clearCache } = require('../middleware/cache.middleware');

class ProductController {
  async getAllProducts(req, res) {
    try {
      const products = await productService.getAllProducts();
      res.json(products);
    } catch (err) {
      res.status(500).json({ error: 'Failed to read database file' });
    }
  }

  async getProductById(req, res) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID: must be a number' });
      }
      const product = await productService.getProductById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (err) {
      res.status(500).json({ error: 'Failed to read database file' });
    }
  }

  async createProduct(req, res) {
    try {
      const { name, price } = req.body || {};
      if (!name || typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Field "name" is required and must be a non-empty string' });
      }
      const numericPrice = Number(price);
      if (price === undefined || isNaN(numericPrice) || numericPrice <= 0) {
        return res.status(400).json({ error: 'Field "price" is required and must be a positive number' });
      }

      const newProduct = await productService.createProduct({
        name: name.trim(),
        price: numericPrice,
      });
      clearCache();
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  }

  async updateProduct(req, res) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID: must be a number' });
      }

      const { name, price } = req.body || {};
      const updates = {};

      if (name !== undefined) {
        if (typeof name !== 'string' || name.trim() === '') {
          return res.status(400).json({ error: 'Field "name" must be a non-empty string' });
        }
        updates.name = name.trim();
      }

      if (price !== undefined) {
        const numericPrice = Number(price);
        if (isNaN(numericPrice) || numericPrice <= 0) {
          return res.status(400).json({ error: 'Field "price" must be a positive number' });
        }
        updates.price = numericPrice;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: 'At least one field ("name" or "price") is required to update' });
      }

      const updatedProduct = await productService.updateProduct(id, updates);
      if (!updatedProduct) {
        return res.status(404).json({ error: 'Product not found' });
      }
      clearCache();
      res.json(updatedProduct);
    } catch (err) {
      res.status(500).json({ error: 'Failed to update product' });
    }
  }

  async deleteProduct(req, res) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID: must be a number' });
      }

      const success = await productService.deleteProduct(id);
      if (!success) {
        return res.status(404).json({ error: 'Product not found' });
      }
      clearCache();
      res.status(204).send();
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }
}

module.exports = new ProductController();