
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
      const product = await productService.getProductById(req.params.id);
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
      const newProduct = await productService.createProduct(req.body);
      clearCache();
      res.status(201).json(newProduct);
    } catch (err) {
      res.status(500).json({ error: 'Failed to create product' });
    }
  }
  async updateProduct(req, res) {
    try {
      const updatedProduct = await productService.updateProduct(req.params.id, req.body);
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
      const success = await productService.deleteProduct(req.params.id);
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