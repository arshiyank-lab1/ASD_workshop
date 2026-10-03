const db = require('../database/database');

class ProductService {
  async getAllProducts() {
    return await db.getAllProducts();
  }

  async getProductById(id) {
    return await db.getProductById(id);
  }

  async createProduct(data) {
    return await db.createProduct(data);
  }

  async updateProduct(id, data) {
    return await db.updateProduct(id, data);
  }

  async deleteProduct(id) {
    return await db.deleteProduct(id);
  }
}

module.exports = new ProductService();